import "server-only";
import { isWithinAccessWindow } from "@/lib/access-window";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { normalizeYouTubeThumbnailUrl } from "@/lib/youtube-thumbnail";
import {
  digest,
  opaque,
  hashPin,
  verifyPin,
  sameOrigin,
  metadataFresh,
  childVideoView,
  cleanProviderText,
} from "./product-security";
import { extractYouTubeVideoId } from "../youtube";
const id = z.string().uuid();
const ids = z.array(id).max(200);
const text = z.string().trim().min(1).max(200);
const youtubeId = z.string().regex(/^[A-Za-z0-9_-]{11}$/);
const founder = () =>
  (process.env.FOUNDER_EMAIL || "Avromy@gmail.com").toLowerCase();
const selectProfile =
  "id,display_name,avatar_key,color_key,experience_mode,pin_enabled,photo_path,available_from_minute,available_until_minute";
export function configured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
export function db() {
  if (!configured()) throw new Failure("WatchNest setup is not complete.", 503);
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
class Failure extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
function check(result: any) {
  if (result.error)
    throw new Failure(
      "Unable to save or load your family data. Please retry.",
      503,
    );
  return result.data;
}
export async function cookie(name: string, value: string, maxAge: number) {
  (await cookies()).set(name, value, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge,
  });
}
async function parentFromModeSession() {
  const jar = await cookies();
  const token = jar.get("wn_parent_mode")?.value;
  const deviceToken = jar.get("wn_device")?.value;
  if (!token || !deviceToken) return null;
  const client = db();
  const session = check(
    await client
      .from("parent_mode_sessions")
      .select("parent_id,device_id")
      .eq("token_hash", digest(token))
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle(),
  );
  if (!session) return null;
  const linked = check(
    await client
      .from("household_devices")
      .select("id")
      .eq("id", session.device_id)
      .eq("parent_id", session.parent_id)
      .eq("token_hash", digest(deviceToken))
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle(),
  );
  if (!linked) return null;
  return check(
    await client
      .from("parents")
      .select("*")
      .eq("id", session.parent_id)
      .single(),
  );
}

export async function parent(allowMode = true) {
  const token =
    (await cookies()).get("wn_parent")?.value ||
    (await cookies()).get("wn_refresh")?.value;
  if (!token) {
    if (allowMode) {
      const modeParent = await parentFromModeSession();
      if (modeParent) return modeParent;
    }
    throw new Failure("Parent sign-in required.", 401);
  }
  const client = db();
  let { data, error } = await client.auth.getUser(token);
  if (error) {
    const refresh = (await cookies()).get("wn_refresh")?.value;
    if (refresh) {
      const fresh = await client.auth.refreshSession({
        refresh_token: refresh,
      });
      if (fresh.data.session) {
        await cookie(
          "wn_parent",
          fresh.data.session.access_token,
          fresh.data.session.expires_in,
        );
        await cookie("wn_refresh", fresh.data.session.refresh_token, 2592000);
        const verified = await client.auth.getUser(
          fresh.data.session.access_token,
        );
        data = verified.data;
        error = verified.error;
      }
    }
  }
  if (error || !data.user?.email)
    throw new Failure("Please sign in again.", 401);
  requireConfirmedFounder(data.user);
  const row = check(
    await client
      .from("parents")
      .select("*")
      .eq("auth_user_id", data.user.id)
      .single(),
  );
  return row;
}

async function issueDevice(parentId: string) {
  const client = db();
  const current = (await cookies()).get("wn_device")?.value;
  if (current) {
    const row = check(
      await client
        .from("household_devices")
        .select("id,parent_id")
        .eq("token_hash", digest(current))
        .eq("parent_id", parentId)
        .is("revoked_at", null)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle(),
    );
    if (row) {
      check(
        await client
          .from("household_devices")
          .update({ last_used_at: new Date().toISOString() })
          .eq("id", row.id),
      );
      return row;
    }
  }
  const token = opaque();
  const row = check(
    await client
      .from("household_devices")
      .insert({
        parent_id: parentId,
        token_hash: digest(token),
        expires_at: new Date(Date.now() + 180 * 86400000).toISOString(),
      })
      .select("id,parent_id")
      .single(),
  );
  await cookie("wn_device", token, 180 * 86400);
  return row;
}

async function device() {
  const token = (await cookies()).get("wn_device")?.value;
  if (!token) throw new Failure("Sign in to connect this family device.", 401);
  const row = check(
    await db()
      .from("household_devices")
      .select("id,parent_id")
      .eq("token_hash", digest(token))
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle(),
  );
  if (!row)
    throw new Failure(
      "This family device session expired. Sign in again.",
      401,
    );
  return row;
}

async function profileViews(rows: any[]) {
  const client = db();
  return Promise.all(
    rows.map(async (profile) => {
      if (!profile.photo_path) return { ...profile, photo_url: null };
      const signed = await client.storage
        .from("watchnest-profile-photos")
        .createSignedUrl(profile.photo_path, 600);
      return { ...profile, photo_url: signed.data?.signedUrl || null };
    }),
  );
}

async function child() {
  const token = (await cookies()).get("wn_child")?.value;
  if (!token) throw new Failure("Child sign-in required.", 401);
  const client = db();
  const session = check(
    await client
      .from("child_sessions")
      .select("*")
      .eq("token_hash", digest(token))
      .is("revoked_at", null)
      .gt("expires_at", new Date().toISOString())
      .maybeSingle(),
  );
  if (!session) throw new Failure("Please sign in again.", 401);
  const profile = check(
    await client
      .from("profiles")
      .select(selectProfile + ",parent_id")
      .eq("id", session.profile_id)
      .is("archived_at", null)
      .maybeSingle(),
  );
  if (!profile) throw new Failure("Profile unavailable.", 401);
  const household = check(
    await client
      .from("parents")
      .select("timezone")
      .eq("id", profile.parent_id)
      .single(),
  );
  if (!isWithinAccessWindow(profile, household.timezone || "America/New_York"))
    throw new Failure(
      "WatchNest is not available for this profile right now.",
      403,
    );
  return { profile, session };
}
async function metadataMaintenance(client: ReturnType<typeof db>) {
  // Request-driven cleanup is complemented by a release-time daily scheduler.
  // Purge all non-authorized YouTube metadata after 30 days, preserving our approval IDs.
  check(
    await client
      .from("videos")
      .update({
        title: "Video needs refresh",
        channel_id: null,
        channel_title: null,
        thumbnail_url: null,
        duration_seconds: null,
        made_for_kids: null,
        availability_status: "needs_review",
        embeddable_status: "unknown",
        metadata_last_checked_at: null,
      })
      .lt(
        "metadata_last_checked_at",
        new Date(Date.now() - 30 * 86400000).toISOString(),
      ),
  );
  check(
    await client
      .from("youtube_search_cache")
      .delete()
      .lt("expires_at", new Date().toISOString()),
  );
}
async function limit(key: string, max: number, seconds = 900) {
  const allowed = check(
    await db().rpc("wn_rate_limit", {
      p_key: digest(key),
      p_limit: max,
      p_seconds: seconds,
    }),
  );
  if (!allowed)
    throw new Failure(
      "Too many attempts. Please wait before trying again.",
      429,
    );
}
async function ownedProfiles(parentId: string, profileIds: string[]) {
  if (!profileIds.length) return;
  const rows = check(
    await db()
      .from("profiles")
      .select("id")
      .eq("parent_id", parentId)
      .is("archived_at", null)
      .in("id", profileIds),
  );
  if (rows.length !== new Set(profileIds).size)
    throw new Failure("Invalid child assignment.", 403);
}
async function approved(parentId: string, videoIds: string[]) {
  if (!videoIds.length) return;
  const rows = check(
    await db()
      .from("family_videos")
      .select("video_id")
      .eq("parent_id", parentId)
      .in("video_id", videoIds),
  );
  if (rows.length !== new Set(videoIds).size)
    throw new Failure("Video is not approved for this household.", 403);
}
async function videos(parentId: string, profileId?: string) {
  const client = db();
  const rows = check(
    await client
      .from("family_videos")
      .select("video_id,tags,created_at,videos(*)")
      .eq("parent_id", parentId),
  );
  let allowed: Set<string> | undefined;
  let progress: any[] = [];
  let favorites = new Set<string>();
  if (profileId) {
    allowed = new Set(
      check(
        await client
          .from("profile_video_assignments")
          .select("video_id")
          .eq("profile_id", profileId)
          .eq("parent_id", parentId)
          .is("removed_at", null),
      ).map((v: any) => v.video_id),
    );
    progress = check(
      await client
        .from("watch_progress")
        .select("*")
        .eq("profile_id", profileId)
        .eq("raw_resume", true)
        .gt("updated_at", new Date(Date.now() - 29 * 86400000).toISOString()),
    );
    favorites = new Set(
      check(
        await client
          .from("profile_favorites")
          .select("video_id")
          .eq("profile_id", profileId),
      ).map((v: any) => v.video_id),
    );
  }
  const collections = check(
    await client.from("collections").select("*").eq("parent_id", parentId),
  );
  return rows
    .filter((r: any) => r.videos && (!allowed || allowed.has(r.video_id)))
    .map((r: any) => ({
      ...r.videos,
      title: cleanProviderText(r.videos.title),
      tags: r.tags,
      added_at: r.created_at,
      progress:
        r.videos.made_for_kids === false
          ? progress.find((p) => p.video_id === r.video_id)
          : undefined,
      collections: collections
        .filter((c: any) => c.video_ids.includes(r.video_id))
        .map((c: any) => ({ id: c.id, title: c.title })),
      favorite: favorites.has(r.video_id),
    }));
}
async function youtube(endpoint: string, params: Record<string, string>) {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key)
    throw new Failure(
      "YouTube connection needs to be configured by Parent.",
      503,
    );
  const url = new URL(`https://www.googleapis.com/youtube/v3/${endpoint}`);
  Object.entries({ ...params, key }).forEach(([k, v]) =>
    url.searchParams.set(k, v),
  );
  try {
    const response = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!response.ok)
      throw new Failure(
        "YouTube is temporarily unavailable or its quota is exhausted.",
        503,
      );
    return await response.json();
  } catch (e) {
    if (e instanceof Failure) throw e;
    throw new Failure("Could not reach YouTube. Please retry.", 503);
  }
}
function duration(value: string) {
  const m = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/.exec(value);
  return m ? +(m[1] || 0) * 3600 + (+m[2] || 0) * 60 + (+m[3] || 0) : 0;
}
async function metadata(videoIds: string[], force = false) {
  if (!videoIds.length) return [];
  const client = db();
  const cached = check(
    await client.from("videos").select("*").in("youtube_video_id", videoIds),
  );
  const missing = videoIds.filter(
    (v) =>
      force ||
      !cached.some((r: any) => r.youtube_video_id === v && metadataFresh(r)),
  );
  if (missing.length) {
    const result = await youtube("videos", {
      part: "snippet,contentDetails,status",
      id: missing.join(","),
      maxResults: "50",
    });
    for (const v of missing) {
      const item = result.items?.find((i: any) => i.id === v);
      const row: any = item
        ? {
            youtube_video_id: v,
            title: cleanProviderText(item.snippet.title),
            channel_id: item.snippet.channelId,
            channel_title: item.snippet.channelTitle,
            thumbnail_url: normalizeYouTubeThumbnailUrl(
              item.snippet.thumbnails.high?.url ||
                item.snippet.thumbnails.default?.url,
            ),
            duration_seconds: duration(item.contentDetails.duration),
            made_for_kids:
              item.status.madeForKids === true
                ? true
                : item.status.madeForKids === false
                  ? false
                  : null,
            availability_status:
              item.status.privacyStatus === "private"
                ? "unavailable"
                : "available",
            embeddable_status: item.status.embeddable
              ? "embeddable"
              : "not_embeddable",
            metadata_last_checked_at: new Date().toISOString(),
          }
        : {
            youtube_video_id: v,
            title: "Unavailable video",
            channel_id: null,
            channel_title: null,
            thumbnail_url: null,
            duration_seconds: null,
            made_for_kids: null,
            availability_status: "unavailable",
            embeddable_status: "unknown",
            metadata_last_checked_at: new Date().toISOString(),
          };
      check(
        await client
          .from("videos")
          .upsert(row, { onConflict: "youtube_video_id" }),
      );
    }
  }
  return check(
    await client.from("videos").select("*").in("youtube_video_id", videoIds),
  ).map((r: any) => ({
    ...r,
    title: cleanProviderText(r.title),
    tags: [],
  }));
}
function requireConfirmedFounder(user: any) {
  if (!user?.email_confirmed_at || user.email?.toLowerCase() !== founder())
    throw new Failure("Confirm your parent email before using WatchNest.", 403);
}
async function initialize(user: any) {
  requireConfirmedFounder(user);
  const client = db();
  let household = check(
    await client
      .from("parents")
      .select("*")
      .eq("auth_user_id", user.id)
      .maybeSingle(),
  );
  if (!household) {
    if (user.email?.toLowerCase() !== founder())
      throw new Failure("Private family beta access only.", 403);
    const legacy = check(
      await client
        .from("parents")
        .select("*")
        .eq("email", user.email.toLowerCase())
        .maybeSingle(),
    );
    if (legacy?.auth_user_id && legacy.auth_user_id !== user.id)
      throw new Failure(
        "This household is already linked to another account.",
        403,
      );
    if (legacy) {
      household = check(
        await client
          .from("parents")
          .update({ auth_user_id: user.id })
          .eq("id", legacy.id)
          .is("auth_user_id", null)
          .select("*")
          .maybeSingle(),
      );
      if (!household)
        throw new Failure(
          "Account linkage changed. Please sign in again.",
          409,
        );
    } else
      household = check(
        await client
          .from("parents")
          .insert({
            email: user.email.toLowerCase(),
            auth_user_id: user.id,
            family_code: opaque().slice(0, 16),
          })
          .select("*")
          .single(),
      );
  }
  if (user.email?.toLowerCase() === founder()) {
    const existing = check(
      await client
        .from("profiles")
        .select("display_name")
        .eq("parent_id", household.id),
    );
    for (const name of ["Miri", "Ari", "Benny", "Eli"])
      if (!existing.some((p: any) => p.display_name === name))
        check(
          await client.from("profiles").insert({
            parent_id: household.id,
            display_name: name,
            experience_mode: "standard",
            color_key: "mint",
            avatar_key: "leaf",
          }),
        );
  }
  return household;
}
export async function handle(request: globalThis.Request, path: string[]) {
  try {
    const route = path.join("/"),
      method = request.method,
      client = configured() ? db() : null;
    if (method !== "GET" && !sameOrigin(request))
      throw new Failure("Please submit this action from WatchNest.", 403);
    let body: any = {};
    if (method !== "GET") {
      if (Number(request.headers.get("content-length") || 0) > 32000)
        throw new Failure("Request too large.", 413);
      const raw = await request.text();
      if (Buffer.byteLength(raw) > 32000)
        throw new Failure("Request too large.", 413);
      body = await Promise.resolve()
        .then(() => JSON.parse(raw))
        .catch(() => {
          throw new Failure("Invalid JSON.");
        });
    }
    if (route === "session" && method === "GET") {
      if (!configured()) return reply({ role: null, configured: false });
      try {
        const p = await parent();
        await issueDevice(p.id);
        return reply({
          role: "parent",
          parent: {
            email: p.email,
            parent_pin_set: Boolean(p.parent_pin_hash),
          },
          configured: true,
        });
      } catch {}
      try {
        const c = await child();
        return reply({ role: "child", profile: c.profile, configured: true });
      } catch {}
      return reply({ role: null, configured: true });
    }
    // Session exit must never depend on an anonymous caller's rate budget.
    // Always clear this browser's cookies, even when remote revocation fails.
    if (route === "auth/logout" && method === "POST") {
      try {
        if (!client)
          throw new Failure("Server sign-out could not be confirmed.", 503);
        const jar = await cookies();
        const token = jar.get("wn_child")?.value;
        if (token)
          check(
            await client
              .from("child_sessions")
              .update({ revoked_at: new Date().toISOString() })
              .eq("token_hash", digest(token)),
          );
        const modeToken = jar.get("wn_parent_mode")?.value;
        if (modeToken)
          check(
            await client
              .from("parent_mode_sessions")
              .update({ revoked_at: new Date().toISOString() })
              .eq("token_hash", digest(modeToken)),
          );
        const deviceToken = jar.get("wn_device")?.value;
        if (deviceToken)
          check(
            await client
              .from("household_devices")
              .update({ revoked_at: new Date().toISOString() })
              .eq("token_hash", digest(deviceToken)),
          );
        const parentToken = jar.get("wn_parent")?.value;
        if (parentToken)
          check(await client.auth.admin.signOut(parentToken, "local"));
        return reply({ ok: true });
      } finally {
        await cookie("wn_child", "", 0);
        await cookie("wn_parent", "", 0);
        await cookie("wn_refresh", "", 0);
        await cookie("wn_parent_mode", "", 0);
        await cookie("wn_device", "", 0);
      }
    }
    if (!client) throw new Failure("WatchNest setup is not complete.", 503);
    // Trust only the deployment platform's overwritten network header, and only
    // inside Vercel. Other hosts retain account/profile limits and need their own
    // verified edge protection; arbitrary forwarded headers are not trusted.
    const network =
      process.env.VERCEL === "1"
        ? request.headers.get("x-vercel-forwarded-for")
        : null;
    if (route.startsWith("auth/") && network)
      await limit(
        "auth-network:" +
          digest(process.env.SUPABASE_SERVICE_ROLE_KEY + ":" + network),
        150,
        60,
      );
    if (route === "auth/callback" && method === "POST") {
      const b = z
        .union([
          z
            .object({
              token_hash: z.string().min(20).max(200),
              type: z.enum(["recovery", "signup", "email"]),
            })
            .strict(),
          z
            .object({
              access_token: z.string().min(20).max(8192),
              refresh_token: z.string().min(20).max(1024),
              type: z.literal("recovery"),
            })
            .strict(),
        ])
        .parse(body);
      await limit(
        "callback:" + digest("token_hash" in b ? b.token_hash : b.access_token),
        5,
      );
      let result;
      if ("token_hash" in b) {
        result = await client.auth.verifyOtp(b);
      } else {
        // Default Supabase email links return an implicit session in the URL
        // fragment. The browser's tokens and type are not authentication proof.
        const verified = await client.auth.getUser(b.access_token);
        if (verified.error || !verified.data.user)
          throw new Failure("Recovery link expired.", 401);
        requireConfirmedFounder(verified.data.user);
        const auth = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { auth: { persistSession: false, autoRefreshToken: false } },
        );
        // setSession accepts an unexpired access token without validating the
        // accompanying refresh token. Refresh explicitly to verify and rotate it.
        result = await auth.auth.refreshSession({
          refresh_token: b.refresh_token,
        });
        if (result.error || !result.data.session)
          throw new Failure("Recovery link expired.", 401);
        const restored = await client.auth.getUser(
          result.data.session.access_token,
        );
        if (
          restored.error ||
          !restored.data.user ||
          restored.data.user.id !== verified.data.user.id
        )
          throw new Failure("Recovery session invalid.", 401);
        requireConfirmedFounder(restored.data.user);
        result.data.user = restored.data.user;
      }
      if (result.error || !result.data.session || !result.data.user)
        throw new Failure("Recovery link expired.", 401);
      requireConfirmedFounder(result.data.user);
      const callbackHousehold = await initialize(result.data.user);
      await cookie(
        "wn_parent",
        result.data.session.access_token,
        result.data.session.expires_in,
      );
      await cookie("wn_refresh", result.data.session.refresh_token, 2592000);
      await cookie("wn_child", "", 0);
      await issueDevice(callbackHousehold.id);
      return reply({ ok: true });
    }
    if (route === "auth/parent" && method === "POST") {
      const b = z
        .object({
          email: z.string().email(),
          password: z.string().max(200).optional(),
          action: z.enum(["login", "signup", "reset", "update-password"]),
        })
        .parse(body);
      await limit("parent:" + b.email.toLowerCase(), 10);
      if (b.email.toLowerCase() !== founder())
        throw new Failure("Private family beta access only.", 403);
      if (b.action === "update-password") {
        if (!b.password || b.password.length < 12)
          throw new Failure("Use at least 12 characters.");
        const access = (await cookies()).get("wn_parent")?.value;
        if (!access)
          throw new Failure("Open the recovery email link first.", 401);
        const auth = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          { auth: { persistSession: false, autoRefreshToken: false } },
        );
        const verified = await client.auth.getUser(access);
        if (
          verified.error ||
          !verified.data.user?.email_confirmed_at ||
          verified.data.user?.email?.toLowerCase() !== founder()
        )
          throw new Failure("Recovery session invalid.", 401);
        check(
          await auth.auth.setSession({
            access_token: access,
            refresh_token: (await cookies()).get("wn_refresh")?.value || "",
          }),
        );
        check(await auth.auth.updateUser({ password: b.password }));
        return reply({ ok: true });
      }
      if (b.action === "reset") {
        check(
          await client.auth.resetPasswordForEmail(b.email, {
            redirectTo: new URL("/login/reset", request.url).href,
          }),
        );
        return reply({
          ok: true,
          message: "Check your email for account recovery.",
        });
      }
      if (!b.password || b.password.length < 12)
        throw new Failure("Use a password with at least 12 characters.");
      const result =
        b.action === "signup"
          ? await client.auth.signUp({ email: b.email, password: b.password })
          : await client.auth.signInWithPassword({
              email: b.email,
              password: b.password,
            });
      if (result.error)
        throw new Failure(
          "Unable to sign in. Check your credentials or email confirmation.",
          401,
        );
      if (result.data.session && result.data.user) {
        const verified = await client.auth.getUser(
          result.data.session.access_token,
        );
        if (verified.error || !verified.data.user)
          throw new Failure("Account verification failed.", 401);
        requireConfirmedFounder(verified.data.user);
        const household = await initialize(verified.data.user);
        await issueDevice(household.id);
      }
      if (result.data.session) {
        await cookie(
          "wn_parent",
          result.data.session.access_token,
          result.data.session.expires_in,
        );
        await cookie("wn_refresh", result.data.session.refresh_token, 2592000);
        await cookie("wn_child", "", 0);
      }
      return reply(
        result.data.session
          ? { ok: true }
          : { ok: true, message: "Confirm your email, then sign in." },
      );
    }
    if (route === "auth/device" && method === "GET") {
      let linked;
      try {
        linked = await device();
      } catch {
        const p = await parent(false);
        linked = await issueDevice(p.id);
      }
      const household = check(
        await client
          .from("parents")
          .select("parent_pin_hash")
          .eq("id", linked.parent_id)
          .single(),
      );
      const profiles = check(
        await client
          .from("profiles")
          .select(selectProfile)
          .eq("parent_id", linked.parent_id)
          .is("archived_at", null)
          .order("created_at"),
      );
      return reply({
        profiles: await profileViews(profiles),
        parent_pin_set: Boolean(household.parent_pin_hash),
      });
    }
    if (route === "auth/parent-lock" && method === "POST") {
      const linked = await device();
      const modeToken = (await cookies()).get("wn_parent_mode")?.value;
      if (modeToken)
        check(
          await client
            .from("parent_mode_sessions")
            .update({ revoked_at: new Date().toISOString() })
            .eq("token_hash", digest(modeToken))
            .eq("device_id", linked.id),
        );
      await cookie("wn_child", "", 0);
      await cookie("wn_parent", "", 0);
      await cookie("wn_refresh", "", 0);
      await cookie("wn_parent_mode", "", 0);
      return reply({ ok: true });
    }
    if (route === "auth/profile-exit" && method === "POST") {
      const jar = await cookies();
      const token = jar.get("wn_child")?.value;
      if (token)
        check(
          await client
            .from("child_sessions")
            .update({ revoked_at: new Date().toISOString() })
            .eq("token_hash", digest(token)),
        );
      await cookie("wn_child", "", 0);
      return reply({ ok: true });
    }
    if (route === "auth/parent-mode" && method === "POST") {
      const linked = await device();
      const b = z.object({ pin: z.string().regex(/^\d{4}$/) }).parse(body);
      await limit("parent-mode:" + linked.id, 5);
      const household = check(
        await client
          .from("parents")
          .select("id,parent_pin_hash")
          .eq("id", linked.parent_id)
          .single(),
      );
      if (
        !household.parent_pin_hash ||
        !verifyPin(b.pin, household.parent_pin_hash)
      )
        throw new Failure("That Parent PIN is not correct.", 401);
      const token = opaque();
      check(
        await client.from("parent_mode_sessions").insert({
          parent_id: household.id,
          device_id: linked.id,
          token_hash: digest(token),
          expires_at: new Date(Date.now() + 30 * 60000).toISOString(),
        }),
      );
      await cookie("wn_parent_mode", token, 30 * 60);
      await cookie("wn_child", "", 0);
      return reply({ ok: true });
    }
    if (route === "auth/children" && method === "GET") {
      const code = z
        .string()
        .min(12)
        .max(64)
        .parse(new URL(request.url).searchParams.get("family"));
      const household = check(
        await client
          .from("parents")
          .select("id")
          .eq("family_code", code)
          .maybeSingle(),
      );
      if (!household) throw new Failure("Family link unavailable.", 404);
      return reply({
        profiles: await profileViews(
          check(
            await client
              .from("profiles")
              .select(selectProfile)
              .eq("parent_id", household.id)
              .is("archived_at", null),
          ),
        ),
      });
    }
    if (route === "auth/child" && method === "POST") {
      const b = z
        .object({
          family: z.string().min(12).max(64).optional(),
          profileId: id,
          passcode: z.string().max(100).optional(),
        })
        .parse(body);
      const linked = b.family ? null : await device();
      await limit("child:" + (b.family || linked!.id) + ":" + b.profileId, 5);
      const household = b.family
        ? check(
            await client
              .from("parents")
              .select("id")
              .eq("family_code", b.family)
              .maybeSingle(),
          )
        : { id: linked!.parent_id };
      const p =
        household &&
        check(
          await client
            .from("profiles")
            .select("*")
            .eq("parent_id", household.id)
            .eq("id", b.profileId)
            .is("archived_at", null)
            .maybeSingle(),
        );
      if (!p) throw new Failure("Unable to sign in.", 401);
      const parentSettings = check(
        await client
          .from("parents")
          .select("timezone")
          .eq("id", household.id)
          .single(),
      );
      if (
        !isWithinAccessWindow(p, parentSettings.timezone || "America/New_York")
      )
        throw new Failure(
          "WatchNest is not available for this profile right now.",
          403,
        );
      if (p.pin_enabled) {
        if (!b.passcode || !verifyPin(b.passcode, p.pin_hash || ""))
          throw new Failure("Incorrect passcode.", 401);
      }
      const token = opaque();
      const admitted = check(
        await client.rpc("wn_admit_child_session", {
          p_profile: p.id,
          p_expected_pin_enabled: p.pin_enabled,
          p_expected_pin_hash: p.pin_enabled ? p.pin_hash : null,
          p_token_hash: digest(token),
          p_expires: new Date(Date.now() + 86400000).toISOString(),
        }),
      );
      if (!admitted)
        throw new Failure("Profile settings changed. Please try again.", 409);
      await cookie("wn_child", token, 86400);
      await cookie("wn_parent", "", 0);
      await cookie("wn_refresh", "", 0);
      await cookie("wn_parent_mode", "", 0);
      delete p.pin_hash;
      const [view] = await profileViews([p]);
      return reply({ profile: view });
    }
    if (route.startsWith("parent/")) {
      const p = await parent();
      await limit("parent-actions:" + p.id, 300, 60);
      await metadataMaintenance(client);
      return await parentRoute(route, method, body, p, request);
    }
    if (route.startsWith("child/")) {
      const c = await child();
      await limit("child-actions:" + c.profile.id, 120, 60);
      await metadataMaintenance(client);
      return await childRoute(route, method, body, c, request);
    }
    throw new Failure("Not found.", 404);
  } catch (e) {
    if (e instanceof z.ZodError)
      return reply({ error: "Please check the information you entered." }, 400);
    return reply(
      {
        error:
          e instanceof Failure
            ? e.message
            : "Unable to complete this action. Please retry.",
      },
      e instanceof Failure ? e.status : 500,
    );
  }
}
function reply(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}
async function parentRoute(
  route: string,
  method: string,
  body: any,
  p: any,
  request: globalThis.Request,
) {
  const client = db();
  if (route === "parent/view-as-child" && method === "POST") {
    const profileId = id.parse(body.profile_id);
    await ownedProfiles(p.id, [profileId]);
    const token = opaque();
    check(
      await client.from("child_sessions").insert({
        profile_id: profileId,
        token_hash: digest(token),
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      }),
    );
    await cookie("wn_child", token, 86400);
    await cookie("wn_parent", "", 0);
    await cookie("wn_refresh", "", 0);
    await cookie("wn_parent_mode", "", 0);
    return reply({ ok: true });
  }
  if (route === "parent/profiles") {
    if (method === "GET")
      return reply({
        profiles: check(
          await client
            .from("profiles")
            .select(selectProfile)
            .eq("parent_id", p.id)
            .is("archived_at", null),
        ),
      });
    const fields = z
      .object({
        display_name: text.optional(),
        experience_mode: z.enum(["simple", "standard"]).optional(),
        avatar_key: z
          .enum([
            "leaf",
            "star",
            "sun",
            "moon",
            "bird",
            "fox",
            "bear",
            "cat",
            "rocket",
          ])
          .optional(),
        color_key: z
          .enum([
            "mint",
            "yellow",
            "coral",
            "blue",
            "purple",
            "green",
            "orange",
            "pink",
            "teal",
          ])
          .optional(),
        passcode: z
          .string()
          .regex(/^\d{4}$/)
          .optional(),
        pin_enabled: z.boolean().optional(),
        available_from_minute: z
          .number()
          .int()
          .min(0)
          .max(1439)
          .nullable()
          .optional(),
        available_until_minute: z
          .number()
          .int()
          .min(0)
          .max(1439)
          .nullable()
          .optional(),
      })
      .parse(body);
    const values: any = { ...fields };
    delete values.passcode;
    if (fields.passcode) {
      values.pin_hash = hashPin(fields.passcode);
      if (fields.pin_enabled === undefined) values.pin_enabled = true;
    }
    if (method === "POST") {
      if (!fields.display_name) throw new Failure("Child name required.");
      if (fields.pin_enabled === true && !fields.passcode)
        throw new Failure("Set a passcode first.");
      check(
        await client.from("profiles").insert({ ...values, parent_id: p.id }),
      );
    } else if (method === "PATCH") {
      const profileId = id.parse(body.id);
      await ownedProfiles(p.id, [profileId]);
      if (fields.display_name) {
        const old = check(
          await client
            .from("profiles")
            .select("display_name")
            .eq("id", profileId)
            .eq("parent_id", p.id)
            .single(),
        );
        if (
          ["Miri", "Ari", "Benny", "Eli"].includes(old.display_name) &&
          fields.display_name !== old.display_name
        )
          throw new Failure("The four family profile names are fixed.");
      }
      if (fields.passcode !== undefined || fields.pin_enabled !== undefined) {
        const old = check(
          await client
            .from("profiles")
            .select("pin_enabled,pin_hash")
            .eq("id", profileId)
            .eq("parent_id", p.id)
            .single(),
        );
        const pinEnabled =
          fields.pin_enabled ?? (fields.passcode ? true : old.pin_enabled);
        if (pinEnabled && !fields.passcode && !old.pin_hash)
          throw new Failure("Set a passcode first.");
        const updated = check(
          await client.rpc("wn_update_profile_security", {
            p_parent: p.id,
            p_profile: profileId,
            p_pin_enabled: pinEnabled,
            p_pin_hash: fields.passcode ? hashPin(fields.passcode) : null,
            p_replace_hash: fields.passcode !== undefined,
          }),
        );
        if (!updated) throw new Failure("Child profile unavailable.", 404);
      }
      delete values.pin_enabled;
      delete values.pin_hash;
      if (Object.keys(values).length)
        check(
          await client
            .from("profiles")
            .update(values)
            .eq("id", profileId)
            .eq("parent_id", p.id),
        );
    } else throw new Failure("Method not allowed.", 405);
    return reply({ ok: true });
  }
  if (route === "parent/settings") {
    if (method === "GET")
      return reply({
        parent_pin_set: Boolean(p.parent_pin_hash),
        timezone: p.timezone || "America/New_York",
      });
    if (method === "PATCH") {
      const b = z
        .object({
          parent_pin: z
            .string()
            .regex(/^\d{4}$/)
            .optional(),
          timezone: z.string().min(1).max(80).optional(),
        })
        .parse(body);
      if (b.parent_pin) {
        try {
          const signedInParent = await parent(false);
          if (signedInParent.id !== p.id)
            throw new Failure("Parent sign-in required.", 401);
        } catch {
          throw new Failure(
            "Sign in with email and password to change the Parent PIN.",
            401,
          );
        }
        const updated = check(
          await client.rpc("wn_set_parent_pin", {
            p_parent: p.id,
            p_pin_hash: hashPin(b.parent_pin),
          }),
        );
        if (!updated) throw new Failure("Parent settings unavailable.", 404);
      }
      if (b.timezone) {
        try {
          new Intl.DateTimeFormat("en", { timeZone: b.timezone }).format();
        } catch {
          throw new Failure("Choose a valid time zone.");
        }
        check(
          await client
            .from("parents")
            .update({ timezone: b.timezone })
            .eq("id", p.id),
        );
      }
      return reply({ ok: true });
    }
  }
  if (route === "parent/videos/lookup" && method === "POST") {
    const b = z
      .object({ urls: z.array(z.string().max(2000)).min(1).max(20) })
      .parse(body);
    await limit("ytlookup:" + p.id, 100, 3600);
    const result: any[] = [];
    const errors: any[] = [];
    for (const url of b.urls) {
      const videoId = extractYouTubeVideoId(url);
      if (!videoId) {
        errors.push({ url, error: "Enter a valid YouTube video URL." });
        continue;
      }
      try {
        const [video] = await metadata([videoId]);
        if (
          video.availability_status !== "available" ||
          video.embeddable_status !== "embeddable"
        )
          throw new Failure("This video is unavailable or cannot be embedded.");
        result.push(video);
      } catch (e) {
        errors.push({
          url,
          error: e instanceof Error ? e.message : "Unable to load video.",
        });
      }
    }
    return reply({ videos: result, errors });
  }
  if (route === "parent/videos/search" && method === "GET") {
    const params = new URL(request.url).searchParams;
    const kind = z
      .enum(["video", "channel", "playlist"])
      .parse(params.get("type") || "video");
    const sourceId = z
      .string()
      .trim()
      .min(1)
      .max(200)
      .optional()
      .parse(params.get("source") || undefined);
    const query = sourceId
      ? (params.get("q") || "").slice(0, 200)
      : text.parse(params.get("q"));
    const cacheKey = digest(
      `${kind}:${sourceId || "search"}:${query.toLowerCase()}`,
    );
    const cached = check(
      await client
        .from("youtube_search_cache")
        .select("result_json")
        .eq("cache_key", cacheKey)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle(),
    );
    if (cached)
      return reply(
        kind === "video" || sourceId
          ? { videos: cached.result_json }
          : { items: cached.result_json },
      );
    await limit("ytsearch:" + p.id, 30, 86400);
    if (!sourceId && kind !== "video") {
      const result = await youtube("search", {
        part: "snippet",
        q: query,
        type: kind,
        safeSearch: "strict",
        maxResults: "12",
      });
      const items = result.items.map((item: any) => ({
        id: kind === "channel" ? item.id.channelId : item.id.playlistId,
        type: kind,
        title: item.snippet.title,
        description: item.snippet.description || "",
        thumbnail_url:
          item.snippet.thumbnails?.medium?.url ||
          item.snippet.thumbnails?.default?.url ||
          "",
        channel_title: item.snippet.channelTitle || "",
      }));
      check(
        await client.from("youtube_search_cache").upsert(
          {
            cache_key: cacheKey,
            normalized_query: `${kind}:${query.toLowerCase()}`,
            raw_query: query,
            result_json: items,
            expires_at: new Date(Date.now() + 3600000).toISOString(),
          },
          { onConflict: "cache_key" },
        ),
      );
      return reply({ items });
    }
    let videoIds: string[];
    if (sourceId && kind === "playlist") {
      const result = await youtube("playlistItems", {
        part: "snippet",
        playlistId: sourceId,
        maxResults: "25",
      });
      videoIds = result.items
        .map((item: any) => item.snippet?.resourceId?.videoId)
        .filter(Boolean);
    } else {
      const result = await youtube("search", {
        part: "snippet",
        ...(query ? { q: query } : {}),
        type: "video",
        ...(sourceId && kind === "channel"
          ? { channelId: sourceId, order: "date" }
          : {}),
        videoEmbeddable: "true",
        videoSyndicated: "true",
        safeSearch: "strict",
        maxResults: sourceId ? "25" : "12",
      });
      videoIds = result.items.map((i: any) => i.id.videoId);
    }
    const found = await metadata(videoIds);
    const usable = found.filter(
      (v: any) =>
        v.availability_status === "available" &&
        v.embeddable_status === "embeddable",
    );
    check(
      await client.from("youtube_search_cache").upsert(
        {
          cache_key: cacheKey,
          normalized_query: query.toLowerCase(),
          raw_query: query,
          result_json: usable,
          expires_at: new Date(Date.now() + 3600000).toISOString(),
        },
        { onConflict: "cache_key" },
      ),
    );
    return reply({ videos: usable });
  }
  if (route === "parent/videos/check" && method === "POST") {
    await limit("ytcheck:" + p.id, 4, 3600);
    const own = await videos(p.id);
    for (let i = 0; i < own.length; i += 50)
      await metadata(
        own.slice(i, i + 50).map((v: any) => v.youtube_video_id),
        true,
      );
    return reply({ ok: true, checked: own.length });
  }
  if (route === "parent/videos") {
    if (method === "POST") {
      const b = z
        .object({
          youtube_video_ids: z.array(youtubeId).min(1).max(20),
          profile_ids: ids,
          collection_id: id.optional(),
          tags: z.array(text).max(20).optional(),
        })
        .parse(body);
      await ownedProfiles(p.id, b.profile_ids);
      const found = await metadata(b.youtube_video_ids);
      if (
        found.some(
          (v: any) =>
            v.availability_status !== "available" ||
            v.embeddable_status !== "embeddable",
        )
      )
        throw new Failure("One or more videos cannot be played.");
      check(
        await client.rpc("wn_approve_videos", {
          p_parent: p.id,
          p_videos: found.map((v: any) => v.id),
          p_profiles: b.profile_ids,
          p_tags: b.tags || [],
          p_collection: b.collection_id || null,
        }),
      );
      return reply({ ok: true });
    }
    if (method === "PATCH") {
      const b = z
        .object({
          video_id: id,
          profile_ids: ids,
          tags: z.array(text).max(20).optional(),
        })
        .parse(body);
      await approved(p.id, [b.video_id]);
      await ownedProfiles(p.id, b.profile_ids);
      check(
        await client.rpc("wn_assign_video", {
          p_parent: p.id,
          p_video: b.video_id,
          p_profiles: b.profile_ids,
          p_tags: b.tags || null,
        }),
      );
      return reply({ ok: true });
    }
    if (method === "DELETE") {
      const videoId = id.parse(body.video_id);
      await approved(p.id, [videoId]);
      check(
        await client.rpc("wn_remove_video", {
          p_parent: p.id,
          p_video: videoId,
        }),
      );
      return reply({ ok: true });
    }
  }
  if (route === "parent/collections/assign" && method === "POST") {
    const b = z.object({ collection_id: id, profile_ids: ids }).parse(body);
    await ownedProfiles(p.id, b.profile_ids);
    const collection = check(
      await client
        .from("collections")
        .select("video_ids")
        .eq("id", b.collection_id)
        .eq("parent_id", p.id)
        .maybeSingle(),
    );
    if (!collection) throw new Failure("Collection unavailable.", 404);
    await approved(p.id, collection.video_ids);
    for (const videoId of collection.video_ids) {
      check(
        await client.rpc("wn_assign_video", {
          p_parent: p.id,
          p_video: videoId,
          p_profiles: b.profile_ids,
          p_tags: null,
        }),
      );
    }
    return reply({ ok: true });
  }
  if (route === "parent/collections") {
    if (method === "GET")
      return reply({
        collections: check(
          await client.from("collections").select("*").eq("parent_id", p.id),
        ),
      });
    const fields = z
      .object({
        title: text.optional(),
        description: z.string().max(500).optional(),
        video_ids: ids.optional(),
      })
      .parse(body);
    await approved(p.id, fields.video_ids || []);
    if (method === "POST") {
      if (!fields.title) throw new Failure("Collection title required.");
      const collection = check(
        await client
          .from("collections")
          .insert({
            ...fields,
            video_ids: fields.video_ids || [],
            parent_id: p.id,
          })
          .select("*")
          .single(),
      );
      return reply({ ok: true, collection });
    }
    if (method === "PATCH") {
      const collection = check(
        await client
          .from("collections")
          .update(fields)
          .eq("id", id.parse(body.id))
          .eq("parent_id", p.id)
          .select("*")
          .maybeSingle(),
      );
      if (!collection) throw new Failure("Collection unavailable.", 404);
      return reply({ ok: true, collection });
    }
  }
  if (route === "parent/requests" && method === "PATCH") {
    const b = z
      .object({ id, status: z.enum(["resolved", "dismissed"]) })
      .parse(body);
    check(
      await client
        .from("child_requests")
        .update({ status: b.status })
        .eq("id", b.id)
        .eq("parent_id", p.id),
    );
    return reply({ ok: true });
  }
  if (route === "parent/dashboard" && method === "GET") {
    const profilesRaw = check(
      await client
        .from("profiles")
        .select(selectProfile)
        .eq("parent_id", p.id)
        .is("archived_at", null),
    );
    const profiles = await profileViews(profilesRaw);
    const own = await videos(p.id);
    const assignments = check(
      await client
        .from("profile_video_assignments")
        .select("video_id,profile_id")
        .eq("parent_id", p.id)
        .is("removed_at", null),
    );
    const requests = check(
      await client
        .from("child_requests")
        .select("*")
        .eq("parent_id", p.id)
        .order("created_at", { ascending: false }),
    );
    return reply({
      profiles,
      videos: own.map((v: any) => ({
        ...childVideoView(v),
        profile_ids: assignments
          .filter((a: any) => a.video_id === v.id)
          .map((a: any) => a.profile_id),
      })),
      collections: check(
        await client.from("collections").select("*").eq("parent_id", p.id),
      ),
      requests: requests.map((r: any) => ({
        ...r,
        display_name: profiles.find((x: any) => x.id === r.profile_id)
          ?.display_name,
      })),
      familyCode: p.family_code,
      // These are WatchNest's own approval/assignment/request records, not
      // YouTube popularity, viewing or engagement metrics.
      workflow: {
        approvedVideos: own.length,
        activeChildren: profiles.length,
        assignedVideos: new Set(assignments.map((a: any) => a.video_id)).size,
        unassignedVideos: own.filter(
          (v: any) => !assignments.some((a: any) => a.video_id === v.id),
        ).length,
        openRequests: requests.filter((r: any) => r.status === "pending")
          .length,
        byChild: profiles.map((profile: any) => ({
          profile_id: profile.id,
          assignedVideos: assignments.filter(
            (a: any) => a.profile_id === profile.id,
          ).length,
          openRequests: requests.filter(
            (r: any) => r.profile_id === profile.id && r.status === "pending",
          ).length,
        })),
        source:
          "WatchNest approval, assignment and request activity. Not YouTube watch or engagement metrics.",
      },
      // Compatibility shape is disabled. Never query or report historical
      // player-derived metrics, including explicit non-MFK videos.
      analytics: {
        enabled: false,
        source:
          "YouTube-derived viewing metrics are not collected or reported.",
        todaySeconds: 0,
        weekSeconds: 0,
        byChild: [],
        popular: [],
        daily: [],
        neverWatched: 0,
      },
      attention: own
        .filter(
          (v: any) =>
            !metadataFresh(v, 30) ||
            v.availability_status !== "available" ||
            v.embeddable_status !== "embeddable",
        )
        .map((v: any) => ({
          id: v.id,
          title: v.title,
          detail:
            "Unavailable, stale metadata, or embedding disabled. Check availability or replace this video.",
        })),
    });
  }
  throw new Failure("Method not allowed.", 405);
}
async function childRoute(
  route: string,
  method: string,
  body: any,
  c: any,
  request: globalThis.Request,
) {
  const client = db(),
    profile = c.profile;
  const own = await videos(profile.parent_id, profile.id);
  if (route === "child/library" && method === "GET") {
    const collections = check(
      await client
        .from("collections")
        .select("*")
        .eq("parent_id", profile.parent_id),
    )
      .map((v: any) => ({
        ...v,
        video_ids: v.video_ids.filter((vId: string) =>
          own.some((v: any) => v.id === vId),
        ),
      }))
      .filter((v: any) => v.video_ids.length);
    const [profileView] = await profileViews([profile]);
    return reply({
      profile: profileView,
      videos: own.map(childVideoView),
      collections,
    });
  }
  if (route === "child/requests" && method === "POST") {
    const b = z
      .object({
        kind: z.enum(["video", "show", "creator", "topic"]),
        message: text,
      })
      .parse(body);
    await limit("requests:" + profile.id, 10, 86400);
    check(
      await client
        .from("child_requests")
        .insert({ ...b, parent_id: profile.parent_id, profile_id: profile.id }),
    );
    return reply({ ok: true });
  }
  if (route === "child/favorites" && method === "POST") {
    const b = z.object({ videoId: id, favorite: z.boolean() }).parse(body);
    if (!own.some((video: any) => video.id === b.videoId))
      throw new Failure("This video is not in your library.", 403);
    if (b.favorite) {
      check(
        await client
          .from("profile_favorites")
          .upsert(
            { profile_id: profile.id, video_id: b.videoId },
            { onConflict: "profile_id,video_id" },
          ),
      );
    } else {
      check(
        await client
          .from("profile_favorites")
          .delete()
          .eq("profile_id", profile.id)
          .eq("video_id", b.videoId),
      );
    }
    return reply({ ok: true });
  }
  if (route === "child/player" && method === "GET") {
    const videoId = id.parse(new URL(request.url).searchParams.get("videoId"));
    let video = own.find((v: any) => v.id === videoId);
    if (!video) throw new Failure("This video is not in your library.", 403);
    if (!metadataFresh(video)) {
      const [fresh] = await metadata([video.youtube_video_id], true);
      video = { ...video, ...fresh };
    }
    if (
      video.availability_status !== "available" ||
      video.embeddable_status !== "embeddable"
    )
      throw new Failure("This video is unavailable. Ask Parent for help.", 409);
    const next = own.find(
      (v: any) =>
        v.id !== videoId &&
        v.availability_status === "available" &&
        v.embeddable_status === "embeddable" &&
        metadataFresh(v, 30) &&
        !v.progress?.completed_at,
    );
    const [profileView] = await profileViews([profile]);
    return reply({
      profile: profileView,
      video: childVideoView(video),
      next: next ? childVideoView(next) : null,
    });
  }
  if (route === "child/progress" && method === "POST") {
    const b = z
      .object({
        videoId: id,
        currentTimeSeconds: z.number().finite().min(0).max(86400),
        durationSeconds: z.number().finite().min(0).max(86400).optional(),
        watchedSeconds: z.literal(0).optional().default(0),
        completed: z.boolean(),
      })
      .parse(body);
    const video = own.find((v: any) => v.id === b.videoId);
    if (!video) throw new Failure("This video is no longer assigned.", 403);
    if (
      video.availability_status !== "available" ||
      video.embeddable_status !== "embeddable"
    )
      throw new Failure("This video is unavailable.", 409);
    if (!metadataFresh(video) || video.made_for_kids !== false)
      return reply({ ok: true, trackingDisabled: true });
    // Store a raw player position only, for the child's functional resume.
    // Ended is the player's raw state, not calculated completion or watch time.
    check(
      await client.rpc("wn_record_progress", {
        p_session: c.session.id,
        p_video: b.videoId,
        p_current: Math.floor(b.currentTimeSeconds),
        p_watched: 0,
        p_completed: b.completed,
      }),
    );
    return reply({ ok: true });
  }
  throw new Failure("Method not allowed.", 405);
}
