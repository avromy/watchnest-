import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  cookies: {} as Record<string, string>,
  cookieWrites: [] as { name: string; value: string }[],
  inserts: [] as { table: string; values: any }[],
  reads: [] as { table: string; filters: any }[],
  windows: {} as Record<string, { window_started: string; attempts: number }>,
  auditError: false,
  calls: [] as { name: string; args: any }[],
  updates: [] as { table: string; values: any }[],
  bound: "20000000-0000-4000-8000-000000000001" as string | null,
  devicePresent: true,
  deviceParent: "10000000-0000-4000-8000-000000000001",
  sessionDevice: "30000000-0000-4000-8000-000000000001" as string | null,
  sessionProfile: "20000000-0000-4000-8000-000000000001",
  sessionPresent: true,
  parentHash: "",
  childHash: "",
  childPinEnabled: false,
  profileParent: "10000000-0000-4000-8000-000000000001",
  authParent: "10000000-0000-4000-8000-000000000001",
  parentModeValid: true,
  revokeError: false,
  admitResult: "40000000-0000-4000-8000-000000000001" as string | null,
  rateAllowed: true,
  rateBuckets: {} as Record<string, { attempts: number; started: number }>,
  rateNow: Date.now(),
  availableFrom: null as number | null,
  availableUntil: null as number | null,
  parentStopped: false,
}));
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      state.cookies[name] ? { value: state.cookies[name] } : undefined,
    set: (name: string, value: string) =>
      state.cookieWrites.push({ name, value }),
  }),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: "auth-owner",
            email: "Avromy@gmail.com",
            email_confirmed_at: "2026-09-30",
          },
        },
        error: null,
      }),
    },
    rpc: async (name: string, args: any) => {
      state.calls.push({ name, args });
      if (name === "wn_rate_limit") {
        const previous = state.rateBuckets[args.p_key];
        const expired =
          !previous || previous.started < state.rateNow - args.p_seconds * 1000;
        const bucket = expired
          ? { attempts: 1, started: state.rateNow }
          : { ...previous, attempts: previous.attempts + 1 };
        state.rateBuckets[args.p_key] = bucket;
        return {
          data: state.rateAllowed && bucket.attempts <= args.p_limit,
          error: null,
        };
      }
      return {
        data:
          name === "wn_admit_device_child_session"
            ? state.admitResult
            : name === "wn_resolve_profile_session"
              ? {
                  profile_state: {
                    session_parent_blocked: state.parentStopped,
                    session_mode: "once",
                  },
                  server_now: new Date().toISOString(),
                }
              : true,
        error: null,
      };
    },
    from: (table: string) => {
      const filters: Record<string, any> = {};
      let single = false;
      let updating = false;
      const result = () => {
        state.reads.push({ table, filters: { ...filters } });
        let data: any = [];
        if (table === "login_limits") data = state.windows[filters.key] || null;
        if (table === "parents")
          data = {
            id: filters.auth_user_id
              ? state.authParent
              : "10000000-0000-4000-8000-000000000001",
            email: "Avromy@gmail.com",
            family_code: "family-code-long-enough",
            parent_pin_hash: state.parentHash,
            timezone: "America/New_York",
          };
        if (table === "household_devices")
          data = state.devicePresent
            ? {
                id: "30000000-0000-4000-8000-000000000001",
                parent_id: state.deviceParent,
                active_profile_id: state.bound,
                expires_at: new Date(Date.now() + 86400000).toISOString(),
              }
            : null;
        if (table === "profiles") {
          const p = {
            id: filters.id || state.sessionProfile,
            parent_id: state.profileParent,
            display_name: "Synthetic",
            pin_enabled: state.childPinEnabled,
            pin_hash: state.childHash,
            archived_at: null,
            available_from_minute: state.availableFrom,
            available_until_minute: state.availableUntil,
          };
          data =
            filters.parent_id && filters.parent_id !== p.parent_id
              ? single
                ? null
                : []
              : single
                ? p
                : [p];
        }
        if (table === "child_sessions")
          data = state.sessionPresent
            ? {
                id: "40000000-0000-4000-8000-000000000001",
                profile_id: state.sessionProfile,
                device_id: state.sessionDevice,
              }
            : null;
        if (table === "parent_mode_sessions")
          data = state.parentModeValid
            ? {
                parent_id: "10000000-0000-4000-8000-000000000001",
                device_id: "30000000-0000-4000-8000-000000000001",
              }
            : null;
        return {
          data,
          error:
            table === "audit_events" && state.auditError
              ? { code: "SYNTHETIC_AUDIT_FAILED" }
              : table === "parent_mode_sessions" &&
                  updating &&
                  state.revokeError
                ? { code: "SYNTHETIC_REVOKE_FAILED" }
                : null,
        };
      };
      const chain: any = {
        then: (resolve: any) => Promise.resolve(result()).then(resolve),
      };
      for (const method of [
        "select",
        "is",
        "gt",
        "lt",
        "order",
        "delete",
        "upsert",
      ])
        chain[method] = () => chain;
      chain.insert = (values: any) => {
        state.inserts.push({ table, values });
        return chain;
      };
      chain.eq = (key: string, value: any) => {
        filters[key] = value;
        return chain;
      };
      chain.in = (key: string, values: any[]) => {
        if (key === "id") filters.id = values[0];
        return chain;
      };
      chain.single = chain.maybeSingle = () => {
        single = true;
        return chain;
      };
      chain.update = (values: any) => {
        updating = true;
        state.updates.push({ table, values });
        return chain;
      };
      return chain;
    },
  }),
}));
import { handle } from "./product";
import { digest, hashPin } from "./product-security";
const parentHash = hashPin("8452");
const childHash = hashPin("1937");
const current = "20000000-0000-4000-8000-000000000001";
function post(path: string, body: unknown = {}) {
  return handle(
    new Request(`https://watchnest.test/api/${path}`, {
      method: "POST",
      headers: { origin: "https://watchnest.test" },
      body: JSON.stringify(body),
    }),
    path.split("/"),
  );
}
function get(path: string) {
  return handle(
    new Request(`https://watchnest.test/api/${path}`),
    path.split("?")[0].split("/"),
  );
}
const admissions = () =>
  state.calls.filter((c) => c.name === "wn_admit_device_child_session");
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://synthetic.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "synthetic");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "synthetic");
  vi.stubEnv("VERCEL", "");
  state.cookies = {
    wn_device: "synthetic-device",
    wn_child: "synthetic-child",
  };
  state.cookieWrites = [];
  state.calls = [];
  state.inserts = [];
  state.reads = [];
  state.windows = {};
  state.auditError = false;
  state.updates = [];
  state.bound = current;
  state.devicePresent = true;
  state.deviceParent = "10000000-0000-4000-8000-000000000001";
  state.sessionDevice = "30000000-0000-4000-8000-000000000001";
  state.sessionProfile = current;
  state.sessionPresent = true;
  state.parentHash = parentHash;
  state.childHash = childHash;
  state.childPinEnabled = false;
  state.profileParent = state.deviceParent;
  state.authParent = state.deviceParent;
  state.parentModeValid = true;
  state.revokeError = false;
  state.admitResult = "40000000-0000-4000-8000-000000000001";
  state.rateAllowed = true;
  state.rateBuckets = {};
  state.rateNow = Date.now();
  state.availableFrom = null;
  state.availableUntil = null;
  state.parentStopped = false;
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.useRealTimers();
});
describe("Parent access inspection and recovery boundaries", () => {
  const deviceId = "30000000-0000-4000-8000-000000000001";
  const pinKey = () => digest("child:" + deviceId + ":" + current);
  const entryKey = () => digest("child-entry:" + deviceId);
  const access = () => get("parent/profile-access?profileId=" + current);
  const parentSignIn = () => {
    state.cookies.wn_parent = "synthetic-parent";
  };
  it("rejects a child/device-only caller before reading limit windows", async () => {
    expect((await access()).status).toBe(401);
    expect(state.reads.filter((r) => r.table === "login_limits")).toEqual([]);
  });
  it("rejects a foreign-family profile and a foreign-family device", async () => {
    parentSignIn();
    state.profileParent = "foreign-family";
    expect((await access()).status).toBe(403);
    state.profileParent = state.authParent;
    state.deviceParent = "foreign-family";
    expect((await access()).status).toBe(403);
    expect(state.reads.filter((r) => r.table === "login_limits")).toEqual([]);
  });
  it("rejects unauthorized or foreign-family recovery before admission and audit", async () => {
    expect(
      (
        await post("parent/view-as-child", {
          profile_id: current,
          recovery: true,
        })
      ).status,
    ).toBe(401);
    parentSignIn();
    state.profileParent = "foreign-family";
    expect(
      (
        await post("parent/view-as-child", {
          profile_id: current,
          recovery: true,
        })
      ).status,
    ).toBe(403);
    state.profileParent = state.authParent;
    state.deviceParent = "foreign-family";
    expect(
      (
        await post("parent/view-as-child", {
          profile_id: current,
          recovery: true,
        })
      ).status,
    ).toBe(403);
    expect(admissions()).toEqual([]);
    expect(state.inserts.filter((i) => i.table === "audit_events")).toEqual([]);
  });
  it("ignores an obsolete child PIN bucket when PIN is off", async () => {
    parentSignIn();
    state.windows[pinKey()] = {
      window_started: new Date().toISOString(),
      attempts: 99,
    };
    const response = await access();
    const body = await response.json();
    expect(response.status).toBe(200);
    expect(body.pin).toEqual({
      required: false,
      limited: false,
      windowExpiresAt: null,
    });
    expect(
      state.reads
        .filter((r) => r.table === "login_limits")
        .map((r) => r.filters.key),
    ).toEqual([entryKey()]);
    expect(JSON.stringify(body)).not.toMatch(/attempts|key|hash/);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(state.updates).toEqual([]);
    expect(state.inserts).toEqual([]);
  });
  it("reports actual separate PIN/device expiries and server time", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-23T12:00:00Z"));
    parentSignIn();
    state.childPinEnabled = true;
    state.windows[pinKey()] = {
      window_started: "2026-11-23T11:55:00Z",
      attempts: 5,
    };
    state.windows[entryKey()] = {
      window_started: "2026-11-23T11:59:40Z",
      attempts: 120,
    };
    const body = await (await access()).json();
    expect(body).toEqual({
      serverNow: "2026-11-23T12:00:00.000Z",
      pin: {
        required: true,
        limited: true,
        windowExpiresAt: "2026-11-23T12:10:00.000Z",
      },
      admission: { limited: true, windowExpiresAt: "2026-11-23T12:00:40.000Z" },
    });
    vi.advanceTimersByTime(16 * 60 * 1000);
    const expired = await (await access()).json();
    expect(expired.pin.limited).toBe(false);
    expect(expired.admission.limited).toBe(false);
  });
  it("audits explicit verified Parent recovery and preserves timer/limit state", async () => {
    parentSignIn();
    state.childPinEnabled = true;
    state.parentStopped = true;
    const before = JSON.stringify(state.windows);
    const response = await post("parent/view-as-child", {
      profile_id: current,
      recovery: true,
    });
    expect(response.status).toBe(200);
    expect(state.inserts).toContainEqual({
      table: "audit_events",
      values: expect.objectContaining({
        parent_id: state.authParent,
        actor_type: "parent",
        entity_id: current,
        action: "parent_profile_recovery_requested",
      }),
    });
    expect(admissions()[0].args).toMatchObject({
      p_parent_authorized: true,
      p_bypass_child_pin: true,
    });
    expect(
      state.updates.filter(
        (u) => u.table === "profiles" || u.table === "login_limits",
      ),
    ).toEqual([]);
    expect(state.parentStopped).toBe(true);
    expect(JSON.stringify(state.windows)).toBe(before);
  });
  it("does not admit when recovery audit fails", async () => {
    parentSignIn();
    state.auditError = true;
    expect(
      (
        await post("parent/view-as-child", {
          profile_id: current,
          recovery: true,
        })
      ).status,
    ).toBe(503);
    expect(admissions()).toEqual([]);
  });
});

describe("independent Parent recovery authorization and time-policy regression", () => {
  const recovery = () =>
    post("parent/view-as-child", { profile_id: current, recovery: true });
  it("rejects a device/child-only recovery caller without audit or admission", async () => {
    expect((await recovery()).status).toBe(401);
    expect(admissions()).toEqual([]);
    expect(state.inserts.filter((row) => row.table === "audit_events")).toEqual(
      [],
    );
    expect(
      state.updates.filter((row) =>
        ["profiles", "login_limits"].includes(row.table),
      ),
    ).toEqual([]);
  });
  it.each(["profile", "device"])(
    "rejects recovery through a foreign-family %s before audit or admission",
    async (boundary) => {
      state.cookies.wn_parent = "synthetic-parent";
      if (boundary === "profile") state.profileParent = "foreign-family";
      else state.deviceParent = "foreign-family";
      expect((await recovery()).status).toBe(403);
      expect(admissions()).toEqual([]);
      expect(
        state.inserts.filter((row) => row.table === "audit_events"),
      ).toEqual([]);
    },
  );
  it("keeps Parent-stopped playback denied after explicit Parent recovery", async () => {
    state.cookies.wn_parent = "synthetic-parent";
    state.parentStopped = true;
    expect((await recovery()).status).toBe(200);
    const access = await get("child/session-access");
    expect((await access.json()).session_access).toMatchObject({
      allowed: false,
      state: "blocked",
      parentBlocked: true,
    });
    const playback = await get(
      "child/player?videoId=50000000-0000-4000-8000-000000000001",
    );
    expect(playback.status).toBe(403);
    expect((await playback.json()).error).toContain("Time’s up");
  });
  it("keeps actual household clock window denied after explicit Parent recovery", async () => {
    vi.useFakeTimers();
    // Noon New York is outside the configured 00:00–00:01 household window.
    vi.setSystemTime(new Date("2026-11-23T17:00:00Z"));
    state.cookies.wn_parent = "synthetic-parent";
    state.availableFrom = 0;
    state.availableUntil = 1;
    expect((await recovery()).status).toBe(200);
    const access = await get("child/session-access");
    expect(access.status).toBe(403);
    expect((await access.json()).error).toContain(
      "not available for this profile right now",
    );
    const playback = await get(
      "child/player?videoId=50000000-0000-4000-8000-000000000001",
    );
    expect(playback.status).toBe(403);
    expect((await playback.json()).error).toContain(
      "not available for this profile right now",
    );
    expect(
      state.updates.filter((row) =>
        ["profiles", "login_limits"].includes(row.table),
      ),
    ).toEqual([]);
  });
});
