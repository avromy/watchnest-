import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const v = "10000000-0000-4000-8000-000000000003";
const state = vi.hoisted(() => ({
  cookieRole: "child",
  audience: false as boolean | null,
  freshness: "fresh",
  assigned: true,
  session: true,
  rpc: [] as { name: string; args: any }[],
  authEmail: "Avromy@gmail.com",
  confirmed: true,
  globalLimitAllowed: true,
  cookieWrites: [] as string[],
  remoteRevocationError: false,
}));
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === `wn_${state.cookieRole}`
        ? { value: "synthetic-token" }
        : undefined,
    set: (name: string) => state.cookieWrites.push(name),
  }),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: "verified-owner",
            email: state.authEmail,
            email_confirmed_at: state.confirmed ? "2026-09-30" : null,
          },
        },
        error: null,
      }),
      admin: {
        signOut: async () => ({
          data: null,
          error: state.remoteRevocationError
            ? { message: "synthetic outage" }
            : null,
        }),
      },
    },
    rpc: async (name: string, args: any) => {
      state.rpc.push({ name, args });
      return {
        data:
          name === "wn_rate_limit" && args.p_limit === 150
            ? state.globalLimitAllowed
            : true,
        error: null,
      };
    },
    from: (table: string) => {
      const now = Date.now();
      const checked =
        state.freshness === "null"
          ? null
          : new Date(
              now +
                (state.freshness === "stale"
                  ? -2
                  : state.freshness === "future"
                    ? 2
                    : 0) *
                  86400000,
            ).toISOString();
      const data =
        table === "parents"
          ? { id: "verified-family", email: state.authEmail }
          : table === "child_sessions"
            ? state.session
              ? {
                  id: "verified-session",
                  profile_id: "verified-child",
                  created_at: new Date(now - 30000).toISOString(),
                }
              : null
            : table === "profiles"
              ? { id: "verified-child", parent_id: "verified-family" }
              : table === "family_videos"
                ? [
                    {
                      video_id: v,
                      tags: [],
                      videos: {
                        id: v,
                        youtube_video_id: "abcdefghijk",
                        title: "Synthetic",
                        made_for_kids: state.audience,
                        metadata_last_checked_at: checked,
                        duration_seconds: 100,
                        availability_status: "available",
                        embeddable_status: "embeddable",
                      },
                    },
                  ]
                : table === "profile_video_assignments"
                  ? state.assigned
                    ? [{ video_id: v }]
                    : []
                  : [];
      const chain: any = {
        then: (resolve: any) =>
          Promise.resolve({
            data,
            error:
              table === "child_sessions" && state.remoteRevocationError
                ? { message: "synthetic outage" }
                : null,
          }).then(resolve),
      };
      for (const method of [
        "select",
        "eq",
        "is",
        "gt",
        "in",
        "single",
        "maybeSingle",
        "update",
        "delete",
        "lt",
      ])
        chain[method] = () => chain;
      return chain;
    },
  }),
}));
import { handle } from "./product";
const body = {
  videoId: v,
  currentTimeSeconds: 90,
  durationSeconds: 100,
  watchedSeconds: 0,
  completed: false,
  profileId: "attacker-selected-sibling",
  parentId: "attacker-selected-household",
  sessionId: "attacker-selected-session",
};
const request = (
  headers: Record<string, string> = { origin: "https://watchnest.test" },
) =>
  new Request("https://watchnest.test/api/child/progress", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://synthetic.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "synthetic");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "synthetic");
  vi.stubEnv("VERCEL", "");
  state.cookieRole = "child";
  state.audience = false;
  state.freshness = "fresh";
  state.assigned = true;
  state.session = true;
  state.rpc = [];
  state.authEmail = "Avromy@gmail.com";
  state.confirmed = true;
  state.globalLimitAllowed = true;
  state.cookieWrites = [];
  state.remoteRevocationError = false;
});
afterEach(() => vi.unstubAllEnvs());
describe("independent route security resume (mocked DB/Auth, actual handle)", () => {
  for (const headers of [
    {},
    { origin: "https://evil.test" },
    { origin: "https://watchnest.test", "sec-fetch-site": "cross-site" },
  ] as Record<string, string>[]) {
    it(`rejects CSRF headers ${JSON.stringify(headers)} before privileged RPC`, async () => {
      const result = await handle(request(headers), ["child", "progress"]);
      expect(result.status).toBe(403);
      expect(state.rpc).toEqual([]);
    });
  }
  it("derives progress ownership exclusively from cookie session despite spoofed body fields", async () => {
    const result = await handle(request(), ["child", "progress"]);
    expect(result.status).toBe(200);
    const call = state.rpc.find((x) => x.name === "wn_record_progress")!;
    expect(call.args.p_session).toBe("verified-session");
    expect(JSON.stringify(call)).not.toContain("attacker-selected");
    expect(call.args.p_watched).toBe(0);
    expect(result.headers.get("cache-control")).toBe("no-store");
  });
  it("rejects positive derived watch time at the actual handler without RPC", async () => {
    const req = new Request("https://watchnest.test/api/child/progress", {
      method: "POST",
      headers: { origin: "https://watchnest.test" },
      body: JSON.stringify({ ...body, watchedSeconds: 1 }),
    });
    expect((await handle(req, ["child", "progress"])).status).toBe(400);
    expect(state.rpc.some((x) => x.name === "wn_record_progress")).toBe(false);
  });
  for (const audience of [true, null]) {
    it(`MFK ${audience} returns trackingDisabled without a progress RPC`, async () => {
      state.audience = audience;
      const result = await handle(request(), ["child", "progress"]);
      expect(await result.json()).toEqual({ ok: true, trackingDisabled: true });
      expect(state.rpc.some((x) => x.name === "wn_record_progress")).toBe(
        false,
      );
    });
  }
  for (const freshness of ["stale", "null", "future"]) {
    it(`${freshness} metadata cannot record via route`, async () => {
      state.freshness = freshness;
      const result = await handle(request(), ["child", "progress"]);
      expect(await result.json()).toEqual({ ok: true, trackingDisabled: true });
      expect(state.rpc.some((x) => x.name === "wn_record_progress")).toBe(
        false,
      );
    });
  }
  it("unassigned video cannot record", async () => {
    state.assigned = false;
    expect((await handle(request(), ["child", "progress"])).status).toBe(403);
    expect(state.rpc.some((x) => x.name === "wn_record_progress")).toBe(false);
  });
  it("revoked or expired session query result cannot record", async () => {
    state.session = false;
    expect((await handle(request(), ["child", "progress"])).status).toBe(401);
    expect(state.rpc).toEqual([]);
  });
  it("child cookie cannot authorize parent routes", async () => {
    expect(
      (
        await handle(
          new Request("https://watchnest.test/api/parent/profiles"),
          ["parent", "profiles"],
        )
      ).status,
    ).toBe(401);
  });
  for (const reason of ["wrong-email", "unconfirmed"]) {
    it(`parent authorization denies ${reason}`, async () => {
      state.cookieRole = "parent";
      if (reason === "wrong-email")
        state.authEmail = "attacker@example.invalid";
      else state.confirmed = false;
      expect(
        (
          await handle(
            new Request("https://watchnest.test/api/parent/profiles"),
            ["parent", "profiles"],
          )
        ).status,
      ).toBe(403);
    });
  }
  it("anonymous invalid family lookup no longer consumes a global authentication budget", async () => {
    state.cookieRole = "none";
    const result = await handle(
      new Request("https://watchnest.test/api/auth/children?family=x"),
      ["auth", "children"],
    );
    expect(result.status).toBe(400);
    expect(state.rpc).toEqual([]);
  });
  it("logout bypasses all anonymous rate budgets and clears all session cookies", async () => {
    state.globalLimitAllowed = false;
    const result = await handle(
      new Request("https://watchnest.test/api/auth/logout", {
        method: "POST",
        headers: { origin: "https://watchnest.test" },
        body: "{}",
      }),
      ["auth", "logout"],
    );
    expect(result.status).toBe(200);
    expect(state.cookieWrites).toEqual(["wn_child", "wn_parent", "wn_refresh"]);
    expect(state.rpc).toEqual([]);
  });
  for (const role of ["child", "parent"]) {
    it(`${role} remote sign-out failure reports 503 but clears all browser cookies`, async () => {
      state.cookieRole = role;
      state.remoteRevocationError = true;
      const result = await handle(
        new Request("https://watchnest.test/api/auth/logout", {
          method: "POST",
          headers: { origin: "https://watchnest.test" },
          body: "{}",
        }),
        ["auth", "logout"],
      );
      expect(result.status).toBe(503);
      expect(state.cookieWrites).toEqual([
        "wn_child",
        "wn_parent",
        "wn_refresh",
      ]);
    });
  }
  it("missing server config cannot prevent local cookie clearing", async () => {
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "");
    const result = await handle(
      new Request("https://watchnest.test/api/auth/logout", {
        method: "POST",
        headers: { origin: "https://watchnest.test" },
        body: "{}",
      }),
      ["auth", "logout"],
    );
    expect(result.status).toBe(503);
    expect(state.cookieWrites).toEqual(["wn_child", "wn_parent", "wn_refresh"]);
  });
  it("cross-origin logout remains rejected and cannot clear cookies", async () => {
    const result = await handle(
      new Request("https://watchnest.test/api/auth/logout", {
        method: "POST",
        headers: { origin: "https://evil.test" },
        body: "{}",
      }),
      ["auth", "logout"],
    );
    expect(result.status).toBe(403);
    expect(state.cookieWrites).toEqual([]);
  });
  it("Vercel network budgets are partitioned; ordinary forwarded headers cannot choose a bucket", async () => {
    vi.stubEnv("VERCEL", "1");
    for (const network of ["192.0.2.1", "192.0.2.2"]) {
      const result = await handle(
        new Request("https://watchnest.test/api/auth/children?family=x", {
          headers: {
            "x-vercel-forwarded-for": network,
            "x-forwarded-for": "forged",
            "x-real-ip": "forged",
          },
        }),
        ["auth", "children"],
      );
      expect(result.status).toBe(400);
    }
    expect(state.rpc).toHaveLength(2);
    expect(state.rpc[0].args).toMatchObject({ p_limit: 150, p_seconds: 60 });
    expect(state.rpc[0].args.p_key).not.toBe(state.rpc[1].args.p_key);
    expect(JSON.stringify(state.rpc)).not.toContain("192.0.2");
    state.globalLimitAllowed = false;
    const result = await handle(
      new Request("https://watchnest.test/api/auth/children?family=x", {
        headers: { "x-vercel-forwarded-for": "192.0.2.1" },
      }),
      ["auth", "children"],
    );
    expect(result.status).toBe(429);
    const logout = await handle(
      new Request("https://watchnest.test/api/auth/logout", {
        method: "POST",
        headers: {
          origin: "https://watchnest.test",
          "x-vercel-forwarded-for": "192.0.2.1",
        },
        body: "{}",
      }),
      ["auth", "logout"],
    );
    expect(logout.status).toBe(200);
  });
  it("non-Vercel ignores spoofed platform and forwarded network headers", async () => {
    const result = await handle(
      new Request("https://watchnest.test/api/auth/children?family=x", {
        headers: {
          "x-vercel-forwarded-for": "192.0.2.1",
          "x-forwarded-for": "forged",
          "x-real-ip": "forged",
        },
      }),
      ["auth", "children"],
    );
    expect(result.status).toBe(400);
    expect(state.rpc).toEqual([]);
  });
});
