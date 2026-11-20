import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  cookies: {} as Record<string, string>,
  cookieWrites: [] as { name: string; value: string }[],
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
      return {
        data:
          name === "wn_admit_device_child_session"
            ? state.admitResult
            : name === "wn_rate_limit"
              ? state.rateAllowed
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
        let data: any = [];
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
            table === "parent_mode_sessions" && updating && state.revokeError
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
        "insert",
        "upsert",
      ])
        chain[method] = () => chain;
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
import { hashPin } from "./product-security";
const parentHash = hashPin("8452");
const childHash = hashPin("1937");
const current = "20000000-0000-4000-8000-000000000001";
const sibling = "20000000-0000-4000-8000-000000000002";
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
  state.parentStopped = false;
});
afterEach(() => vi.unstubAllEnvs());
describe("actual route profile handoff enforcement (synthetic Auth/DB)", () => {
  it("keeps routine same-profile PIN-off admission available without Parent authority", async () => {
    const result = await post("auth/child", { profileId: current });
    expect(result.status).toBe(200);
    expect(admissions()[0].args).toMatchObject({
      p_device: "30000000-0000-4000-8000-000000000001",
      p_parent_authorized: false,
      p_bypass_child_pin: false,
      p_profile: current,
    });
    expect(JSON.stringify(await result.json())).not.toContain("pin_hash");
  });
  it("keeps a Parent-stopped profile denied after routine same-profile re-entry", async () => {
    state.parentStopped = true;
    expect((await post("auth/child", { profileId: current })).status).toBe(200);
    const access = await get("child/session-access");
    expect(access.status).toBe(200);
    expect((await access.json()).session_access).toMatchObject({
      allowed: false,
      state: "blocked",
      parentBlocked: true,
    });
    expect(
      (await get("child/player?videoId=50000000-0000-4000-8000-000000000001"))
        .status,
    ).toBe(403);
    expect((await post("auth/child", { profileId: sibling })).status).toBe(403);
  });
  it("denies a sibling change after child cookie removal instead of trusting a selected profile ID", async () => {
    delete state.cookies.wn_child;
    expect((await post("auth/child", { profileId: sibling })).status).toBe(403);
    expect(admissions()).toEqual([]);
  });
  it("retains same-profile binding through profile exit and blocks sibling admission", async () => {
    expect((await post("auth/profile-exit")).status).toBe(200);
    expect(
      state.updates.filter((u) => u.table === "household_devices"),
    ).toEqual([]);
    expect((await post("auth/child", { profileId: sibling })).status).toBe(403);
    expect(admissions()).toEqual([]);
  });
  it("requires a Parent for an unbound or ambiguous device", async () => {
    state.bound = null;
    expect((await post("auth/child", { profileId: current })).status).toBe(403);
    expect(admissions()).toEqual([]);
  });
  it("does not accept child credentials or attacker-supplied authorization flags as Parent permission", async () => {
    expect(
      (
        await post("auth/child", {
          profileId: sibling,
          passcode: "1937",
          p_parent_authorized: true,
          parentAuthorized: true,
          p_bypass_child_pin: true,
        })
      ).status,
    ).toBe(403);
    expect(admissions()).toEqual([]);
  });
  it("does not accept a private family link without a valid enrolled device", async () => {
    delete state.cookies.wn_device;
    expect(
      (
        await post("auth/child", {
          profileId: sibling,
          family: "family-code-long-enough",
          parentPin: "8452",
        })
      ).status,
    ).toBe(401);
    expect(admissions()).toEqual([]);
  });
  it("does not admit a profile from another household even with this device's valid Parent PIN", async () => {
    state.profileParent = "10000000-0000-4000-8000-000000000002";
    expect(
      (await post("auth/child", { profileId: sibling, parentPin: "8452" }))
        .status,
    ).toBe(401);
    expect(admissions()).toEqual([]);
  });
  it("fails closed when the server authentication attempt budget is exhausted", async () => {
    state.rateAllowed = false;
    expect(
      (await post("auth/child", { profileId: sibling, parentPin: "8452" }))
        .status,
    ).toBe(429);
    expect(admissions()).toEqual([]);
  });
  it("rejects a foreign family link on an enrolled device", async () => {
    expect(
      (
        await post("auth/child", {
          profileId: current,
          family: "other-family-code-long-enough",
        })
      ).status,
    ).toBe(403);
    expect(admissions()).toEqual([]);
  });
  it("rejects an incorrect Parent PIN before admission and shares the Parent-mode guess budget", async () => {
    expect(
      (await post("auth/child", { profileId: sibling, parentPin: "0000" }))
        .status,
    ).toBe(401);
    expect(admissions()).toEqual([]);
    const handoffPinBucket = state.calls
      .filter((c) => c.name === "wn_rate_limit")
      .at(-1)!.args;
    state.calls = [];
    expect((await post("auth/parent-mode", { pin: "0000" })).status).toBe(401);
    expect(state.calls.find((c) => c.name === "wn_rate_limit")!.args).toEqual(
      handoffPinBucket,
    );
  });
  it("admits the selected sibling using a valid target-specific Parent PIN without opening Parent Mode", async () => {
    state.childPinEnabled = true;
    expect(
      (await post("auth/child", { profileId: sibling, parentPin: "8452" }))
        .status,
    ).toBe(200);
    expect(admissions()[0].args).toMatchObject({
      p_profile: sibling,
      p_parent_authorized: true,
      p_expected_parent_pin_hash: parentHash,
      p_bypass_child_pin: true,
      p_expected_pin_enabled: true,
      p_expected_pin_hash: childHash,
    });
    expect(state.updates.some((u) => u.table === "parent_mode_sessions")).toBe(
      false,
    );
    expect(
      state.cookieWrites.some((c) => c.name === "wn_parent_mode" && c.value),
    ).toBe(false);
  });
  it("preserves optional child PIN protection for routine same-profile admission", async () => {
    state.childPinEnabled = true;
    expect((await post("auth/child", { profileId: current })).status).toBe(401);
    expect(admissions()).toEqual([]);
    expect(
      (await post("auth/child", { profileId: current, passcode: "1937" }))
        .status,
    ).toBe(200);
    expect(admissions()[0].args.p_parent_authorized).toBe(false);
  });
  it("authorizes a change with an existing verified Parent session only for that household", async () => {
    state.cookies.wn_parent = "synthetic-parent";
    expect((await post("auth/child", { profileId: sibling })).status).toBe(200);
    expect(admissions()[0].args.p_parent_authorized).toBe(true);
  });
  it("rejects verified Parent authority from another household", async () => {
    state.cookies.wn_parent = "synthetic-parent";
    state.authParent = "10000000-0000-4000-8000-000000000002";
    expect((await post("auth/child", { profileId: sibling })).status).toBe(403);
    expect(admissions()).toEqual([]);
  });
  it("does not issue a child cookie if atomic admission rejects a stale snapshot", async () => {
    state.admitResult = null;
    expect(
      (await post("auth/child", { profileId: sibling, parentPin: "8452" }))
        .status,
    ).toBe(409);
    expect(
      state.cookieWrites.some((c) => c.name === "wn_child" && c.value),
    ).toBe(false);
  });
  it("fails closed before issuing a child cookie if outstanding Parent Mode revocation fails", async () => {
    state.cookies.wn_parent_mode = "synthetic-mode";
    state.revokeError = true;
    expect(
      (await post("auth/child", { profileId: sibling, parentPin: "8452" }))
        .status,
    ).toBe(503);
    expect(
      state.cookieWrites.some((c) => c.name === "wn_child" && c.value),
    ).toBe(false);
  });
  it.each([
    "missing-device-cookie",
    "missing-device-row",
    "different-device",
    "different-profile",
    "different-family",
    "unbound-device",
    "missing-session",
  ])("denies held child credentials after %s", async (scenario) => {
    if (scenario === "missing-device-cookie") delete state.cookies.wn_device;
    if (scenario === "missing-device-row") state.devicePresent = false;
    if (scenario === "different-device")
      state.sessionDevice = "30000000-0000-4000-8000-000000000002";
    if (scenario === "different-profile") state.bound = sibling;
    if (scenario === "different-family")
      state.deviceParent = "10000000-0000-4000-8000-000000000002";
    if (scenario === "unbound-device") state.bound = null;
    if (scenario === "missing-session") state.sessionPresent = false;
    expect((await get("child/session-access")).status).toBe(401);
    expect(
      state.calls.some((c) => c.name === "wn_resolve_profile_session"),
    ).toBe(false);
  });
  it("checks the same live identity on the player acknowledgment endpoint", async () => {
    state.bound = sibling;
    expect(
      (
        await post("child/session-access", {
          revision: 0,
          playback_active: true,
        })
      ).status,
    ).toBe(401);
    expect(state.calls.some((c) => c.name === "wn_ack_profile_session")).toBe(
      false,
    );
  });
  it("routes an intentionally authenticated Parent view-as-child through atomic admission", async () => {
    state.cookies.wn_parent = "synthetic-parent";
    expect(
      (await post("parent/view-as-child", { profile_id: sibling })).status,
    ).toBe(200);
    expect(admissions()[0].args).toMatchObject({
      p_profile: sibling,
      p_parent_authorized: true,
      p_bypass_child_pin: true,
    });
    expect(state.updates.some((u) => u.table === "child_sessions")).toBe(false);
  });
});
