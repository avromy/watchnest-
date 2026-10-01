import { afterEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  role: "parent",
  tables: [] as string[],
  signup: false,
  video: false,
  stale: false,
  unconfirmed: false,
  updates: [] as any[],
  email: "Avromy@gmail.com",
  authInvalid: false,
  refreshInvalid: false,
  refreshedOtherUser: false,
  getUserCalls: 0,
  verifiedTokens: [] as string[],
  refreshCalls: [] as any[],
  cookieWrites: [] as any[],
  childAuthPin: null as null | boolean,
}));
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === `wn_${state.role}` ? { value: "token" } : undefined,
    set: (...args: any[]) => state.cookieWrites.push(args),
  }),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      verifyOtp: async () => ({
        data: {
          user: {
            id: "owner",
            email: "Avromy@gmail.com",
            email_confirmed_at: state.unconfirmed ? null : "2026-09-30",
          },
          session: {
            access_token: "test",
            refresh_token: "test",
            expires_in: 3600,
          },
        },
        error: null,
      }),
      getUser: async (token: string) => {
        state.verifiedTokens.push(token);
        state.getUserCalls++;
        return {
          data: {
            user: state.authInvalid
              ? null
              : {
                  id:
                    state.refreshedOtherUser && state.getUserCalls > 1
                      ? "other-owner"
                      : "owner",
                  email: state.email,
                  email_confirmed_at: state.unconfirmed ? null : "2026-09-30",
                },
          },
          error: state.authInvalid ? { message: "invalid" } : null,
        };
      },
      refreshSession: async (tokens: any) => {
        state.refreshCalls.push(tokens);
        return {
          data: {
            user: { id: "owner", email: state.email },
            session: state.refreshInvalid
              ? null
              : {
                  access_token: "refreshed-token",
                  refresh_token: "rotated-refresh",
                  expires_in: 3600,
                },
          },
          error: state.refreshInvalid ? { message: "invalid" } : null,
        };
      },
      signInWithPassword: async () => ({
        data: {
          user: { id: "owner", email: "Avromy@gmail.com" },
          session: {
            access_token: "test",
            refresh_token: "test",
            expires_in: 3600,
          },
        },
        error: null,
      }),
      signUp: async () => ({
        data: {
          user: { id: "unverified", email: "Avromy@gmail.com" },
          session: null,
        },
        error: null,
      }),
    },
    rpc: async () => ({ data: true, error: null }),
    from: (table: string) => {
      state.tables.push(table);
      const result = {
        data:
          table === "parents"
            ? { id: "family", email: "Avromy@gmail.com" }
            : table === "child_sessions"
              ? { id: "session", profile_id: "child" }
            : table === "profiles"
                ? state.childAuthPin !== null
                  ? {
                      id: "22222222-2222-4222-8222-222222222222",
                      parent_id: "family",
                      display_name: "Miri",
                      pin_enabled: state.childAuthPin,
                      pin_hash: null,
                    }
                  : state.role === "child"
                    ? { id: "child", parent_id: "family" }
                  : []
                : state.video && table === "family_videos"
                  ? [
                      {
                        video_id: "11111111-1111-4111-8111-111111111111",
                        tags: [],
                        videos: {
                          id: "11111111-1111-4111-8111-111111111111",
                          youtube_video_id: "abcdefghijk",
                          title: "Video",
                          made_for_kids: true,
                          availability_status: "available",
                          embeddable_status: "embeddable",
                          metadata_last_checked_at: new Date(
                            Date.now() - (state.stale ? 2 * 86400000 : 0),
                          ).toISOString(),
                        },
                      },
                    ]
                  : state.video && table === "profile_video_assignments"
                    ? [{ video_id: "11111111-1111-4111-8111-111111111111" }]
                    : state.video && table === "watch_progress"
                      ? [
                          {
                            video_id: "11111111-1111-4111-8111-111111111111",
                            profile_id: "child",
                            current_time_seconds: 40,
                            duration_seconds: 100,
                          },
                        ]
                      : [],
        error: null,
      };
      const chain: any = {
        then: (resolve: any) => Promise.resolve(result).then(resolve),
      };
      for (const method of [
        "select",
        "eq",
        "is",
        "gt",
        "in",
        "single",
        "maybeSingle",
        "insert",
        "upsert",
        "update",
        "delete",
        "lt",
      ])
        chain[method] = () => chain;
      chain.update = (values: any) => {
        state.updates.push({ table, values });
        return chain;
      };
      return chain;
    },
  }),
}));
import { handle } from "./product";
function configured() {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "key");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "key");
}
afterEach(() => {
  vi.unstubAllEnvs();
  state.tables = [];
  state.role = "parent";
  state.video = false;
  state.stale = false;
  state.unconfirmed = false;
  state.updates = [];
  state.email = "Avromy@gmail.com";
  state.authInvalid = false;
  state.refreshInvalid = false;
  state.refreshedOtherUser = false;
  state.getUserCalls = 0;
  state.verifiedTokens = [];
  state.refreshCalls = [];
  state.cookieWrites = [];
  state.childAuthPin = null;
});
describe("authenticated route dispatch regression", () => {
  it("opens a PIN-off profile from its family link without parent authentication", async () => {
    configured();
    state.role = "none";
    state.childAuthPin = false;
    const response = await handle(
      new Request("https://test.local/api/auth/child", {
        method: "POST",
        headers: { origin: "https://test.local" },
        body: JSON.stringify({
          family: "family-code-long-enough",
          profileId: "22222222-2222-4222-8222-222222222222",
        }),
      }),
      ["auth", "child"],
    );
    expect(response.status).toBe(200);
    expect(state.getUserCalls).toBe(0);
    expect(state.cookieWrites.map(([name]) => name)).toEqual([
      "wn_child",
      "wn_parent",
      "wn_refresh",
    ]);
    expect(JSON.stringify(await response.json())).not.toContain("pin_hash");
  });
  it("keeps a PIN-on profile closed when the child credential is absent", async () => {
    configured();
    state.role = "none";
    state.childAuthPin = true;
    const response = await handle(
      new Request("https://test.local/api/auth/child", {
        method: "POST",
        headers: { origin: "https://test.local" },
        body: JSON.stringify({
          family: "family-code-long-enough",
          profileId: "22222222-2222-4222-8222-222222222222",
        }),
      }),
      ["auth", "child"],
    );
    expect(response.status).toBe(401);
    expect(state.cookieWrites).toEqual([]);
    expect(state.tables).not.toContain("child_sessions");
  });
  it("returns JSON 403 for unapproved parent deletion instead of uncaught async failure", async () => {
    configured();
    const response = await handle(
      new Request("https://test.local/api/parent/videos", {
        method: "DELETE",
        headers: { origin: "https://test.local" },
        body: JSON.stringify({
          video_id: "11111111-1111-4111-8111-111111111111",
        }),
      }),
      ["parent", "videos"],
    );
    expect(response.status).toBe(403);
    expect(await response.json()).toHaveProperty("error");
  });
  it("returns JSON 403 for sibling/unapproved video player IDs", async () => {
    configured();
    state.role = "child";
    const response = await handle(
      new Request(
        "https://test.local/api/child/player?videoId=11111111-1111-4111-8111-111111111111",
      ),
      ["child", "player"],
    );
    expect(response.status).toBe(403);
  });
  it("unconfirmed signup cannot create profiles or overwrite auth ownership", async () => {
    configured();
    const response = await handle(
      new Request("https://test.local/api/auth/parent", {
        method: "POST",
        headers: { origin: "https://test.local" },
        body: JSON.stringify({
          action: "signup",
          email: "Avromy@gmail.com",
          password: "long-enough-password",
        }),
      }),
      ["auth", "parent"],
    );
    expect(response.status).toBe(200);
    expect(await response.json()).toHaveProperty("message");
    expect(state.tables).toEqual([]);
  });
});

describe("child playback metadata gates", () => {
  it("fails closed when stale metadata cannot be refreshed before embed", async () => {
    configured();
    vi.stubEnv("YOUTUBE_API_KEY", "");
    state.role = "child";
    state.video = true;
    state.stale = true;
    const response = await handle(
      new Request(
        "https://test.local/api/child/player?videoId=11111111-1111-4111-8111-111111111111",
      ),
      ["child", "player"],
    );
    expect(response.status).toBe(503);
    expect(await response.json()).not.toHaveProperty("video");
  });
  it("child library suppresses persisted progress after a made-for-kids change", async () => {
    configured();
    state.role = "child";
    state.video = true;
    const response = await handle(
      new Request("https://test.local/api/child/library"),
      ["child", "library"],
    );
    expect(response.status).toBe(200);
    const result = await response.json();
    expect(result.videos[0]).not.toHaveProperty("progress");
    expect(JSON.stringify(result.videos)).not.toContain("profile_id");
  });
});

describe("verified parent ownership and cache retention", () => {
  it("cannot initialize or bind an unconfirmed parent even if auth issues a session", async () => {
    configured();
    state.unconfirmed = true;
    const response = await handle(
      new Request("https://test.local/api/auth/parent", {
        method: "POST",
        headers: { origin: "https://test.local" },
        body: JSON.stringify({
          action: "login",
          email: "Avromy@gmail.com",
          password: "long-enough-password",
        }),
      }),
      ["auth", "parent"],
    );
    expect(response.status).toBe(403);
    expect(state.tables).toEqual([]);
  });
  it("clears stale stored API metadata and expired search cache before library reads", async () => {
    configured();
    state.role = "child";
    const response = await handle(
      new Request("https://test.local/api/child/library"),
      ["child", "library"],
    );
    expect(response.status).toBe(200);
    expect(state.updates).toContainEqual({
      table: "videos",
      values: {
        title: "Video needs refresh",
        channel_id: null,
        channel_title: null,
        thumbnail_url: null,
        duration_seconds: null,
        made_for_kids: null,
        availability_status: "needs_review",
        embeddable_status: "unknown",
        metadata_last_checked_at: null,
      },
    });
    expect(state.tables).toContain("youtube_search_cache");
  });
});

it("recovery callback cannot bind an unconfirmed Founder email", async () => {
  configured();
  state.unconfirmed = true;
  const response = await handle(
    new Request("https://test.local/api/auth/callback", {
      method: "POST",
      headers: { origin: "https://test.local" },
      body: JSON.stringify({ type: "recovery", token_hash: "x".repeat(30) }),
    }),
    ["auth", "callback"],
  );
  expect(response.status).toBe(403);
  expect(state.tables).toEqual([]);
});

describe("default Supabase recovery session callback", () => {
  function callback(overrides = {}) {
    return handle(
      new Request("https://test.local/api/auth/callback", {
        method: "POST",
        headers: { origin: "https://test.local" },
        body: JSON.stringify({
          type: "recovery",
          access_token: "a".repeat(40),
          refresh_token: "r".repeat(40),
          ...overrides,
        }),
      }),
      ["auth", "callback"],
    );
  }
  it("verifies the Founder access token and refreshes credentials before issuing private cookies", async () => {
    configured();
    const response = await callback();
    expect(response.status).toBe(200);
    expect(state.getUserCalls).toBe(2);
    expect(state.verifiedTokens).toEqual(["a".repeat(40), "refreshed-token"]);
    expect(state.refreshCalls).toEqual([
      { refresh_token: "r".repeat(40) },
    ]);
    expect(state.cookieWrites).toContainEqual([
      "wn_parent",
      "refreshed-token",
      expect.objectContaining({ httpOnly: true, sameSite: "strict" }),
    ]);
    expect(state.cookieWrites).toContainEqual([
      "wn_refresh",
      "rotated-refresh",
      expect.objectContaining({ httpOnly: true }),
    ]);
    expect(JSON.stringify(await response.json())).not.toContain("refreshed");
  });
  it("rejects invalid access tokens before refreshing credentials or writing cookies", async () => {
    configured();
    state.authInvalid = true;
    expect((await callback()).status).toBe(401);
    expect(state.refreshCalls).toEqual([]);
    expect(state.cookieWrites).toEqual([]);
    expect(state.tables).toEqual([]);
  });
  it.each(["other@example.com", "Avromy+other@gmail.com"])(
    "rejects a confirmed non-Founder account %s",
    async (email) => {
      configured();
      state.email = email;
      expect((await callback()).status).toBe(403);
      expect(state.refreshCalls).toEqual([]);
      expect(state.cookieWrites).toEqual([]);
      expect(state.tables).toEqual([]);
    },
  );
  it("rejects an unconfirmed Founder without granting cookies", async () => {
    configured();
    state.unconfirmed = true;
    expect((await callback()).status).toBe(403);
    expect(state.cookieWrites).toEqual([]);
    expect(state.refreshCalls).toEqual([]);
  });
  it("rejects an invalid refresh token without granting cookies", async () => {
    configured();
    state.refreshInvalid = true;
    expect((await callback()).status).toBe(401);
    expect(state.cookieWrites).toEqual([]);
    expect(state.tables).toEqual([]);
  });
  it("rejects refreshed credentials for a different identity", async () => {
    configured();
    state.refreshedOtherUser = true;
    expect((await callback()).status).toBe(401);
    expect(state.cookieWrites).toEqual([]);
    expect(state.tables).toEqual([]);
  });
  it("does not accept arbitrary callback types on implicit sessions", async () => {
    configured();
    expect((await callback({ type: "signup" })).status).toBe(400);
    expect(state.getUserCalls).toBe(0);
    expect(state.cookieWrites).toEqual([]);
  });
  it("retains token-hash recovery support for configured templates", async () => {
    configured();
    const response = await handle(
      new Request("https://test.local/api/auth/callback", {
        method: "POST",
        headers: { origin: "https://test.local" },
        body: JSON.stringify({ type: "recovery", token_hash: "x".repeat(30) }),
      }),
      ["auth", "callback"],
    );
    expect(response.status).toBe(200);
    expect(state.cookieWrites).toContainEqual([
      "wn_parent",
      "test",
      expect.objectContaining({ httpOnly: true }),
    ]);
  });
});
