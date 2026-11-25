import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  DAILY_TIMEZONE_UNAVAILABLE,
  dailyPeriodMatchesServerRules,
} from "./daily-period-validation";

const fixture = vi.hoisted(() => ({
  timezone: "America/New_York",
  storedTimezone: "America/New_York",
  dailyProfiles: true,
  owned: true,
  parentSession: true,
  stalePreflight: false,
  staleSnapshot: false,
  writes: [] as unknown[],
  rpcs: [] as string[],
}));
const PARENT = "10000000-0000-4000-8000-000000000001";
const CHILD = "20000000-0000-4000-8000-000000000001";
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "wn_parent" && fixture.parentSession
        ? { value: "test-parent-token" }
        : undefined,
    set: () => undefined,
  }),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: "owner",
            email: "Avromy@gmail.com",
            email_confirmed_at: "2026-01-01",
          },
        },
        error: null,
      }),
    },
    from: (table: string) => {
      let dailyFilter = false;
      const row = {
        id: CHILD,
        parent_id: PARENT,
        session_mode: "daily",
        session_duration_minutes: 5,
      };
      const result = () => ({
        data:
          table === "parents"
            ? {
                id: PARENT,
                email: "Avromy@gmail.com",
                timezone: fixture.timezone,
              }
            : table === "profiles"
              ? (dailyFilter ? fixture.dailyProfiles : fixture.owned)
                ? [row]
                : []
              : [],
        error: null,
      });
      const builder = {
        select: () => builder,
        eq: (column: string) => {
          if (column === "session_mode") dailyFilter = true;
          return builder;
        },
        is: () => builder,
        in: () => builder,
        gt: () => builder,
        lt: () => builder,
        delete: () => builder,
        order: () => builder,
        limit: () => builder,
        update: (value: unknown) => {
          if (table === "parents") fixture.writes.push({ table, value });
          return builder;
        },
        single: async () => result(),
        maybeSingle: async () => result(),
        then: (resolve: (value: ReturnType<typeof result>) => unknown) =>
          Promise.resolve(result()).then(resolve),
      };
      return builder;
    },
    rpc: async (name: string) => {
      if (name !== "wn_rate_limit") fixture.rpcs.push(name);
      if (name === "wn_daily_session_period")
        return {
          data: [
            {
              period_start: fixture.stalePreflight
                ? "2026-11-18T15:00:00Z"
                : "2026-11-18T12:00:00Z",
              reset_at: fixture.stalePreflight
                ? "2026-11-19T15:00:00Z"
                : "2026-11-19T12:00:00Z",
            },
          ],
          error: null,
        };
      if (name === "wn_resolve_profile_session")
        return {
          data: {
            server_now: "2026-11-18T17:00:00Z",
            timezone: fixture.storedTimezone,
            period_start: fixture.staleSnapshot
              ? "2026-11-18T15:00:00Z"
              : "2026-11-18T12:00:00Z",
            reset_at: fixture.staleSnapshot
              ? "2026-11-19T15:00:00Z"
              : "2026-11-19T12:00:00Z",
            profile_state: {
              session_mode: "daily",
              daily_started: false,
              daily_allowance_minutes: 5,
              session_duration_minutes: 5,
            },
          },
          error: null,
        };
      return { data: { ok: true }, error: null };
    },
  }),
}));
import { handle } from "./product";

describe("server-only daily period time-rule validation", () => {
  it.each([
    [
      "America/New_York",
      "2026-11-18T12:00:00Z",
      "2026-11-19T12:00:00Z",
      "2026-11-18T15:00:00Z",
    ],
    [
      "America/New_York",
      "2026-03-07T12:00:00Z",
      "2026-03-08T11:00:00Z",
      "2026-03-08T10:00:00Z",
    ],
    [
      "America/New_York",
      "2026-10-31T11:00:00Z",
      "2026-11-01T12:00:00Z",
      "2026-11-01T11:00:00Z",
    ],
    [
      "+03:00",
      "2026-11-18T04:00:00Z",
      "2026-11-19T04:00:00Z",
      "2026-11-18T15:00:00Z",
    ],
    [
      "+03",
      "2026-11-18T04:00:00Z",
      "2026-11-19T04:00:00Z",
      "2026-11-18T15:00:00Z",
    ],
    [
      "+0300",
      "2026-11-18T04:00:00Z",
      "2026-11-19T04:00:00Z",
      "2026-11-18T15:00:00Z",
    ],
    [
      "-03:30",
      "2026-11-18T10:30:00Z",
      "2026-11-19T10:30:00Z",
      "2026-11-18T15:00:00Z",
    ],
    [
      "CST",
      "2026-07-15T12:00:00Z",
      "2026-07-16T12:00:00Z",
      "2026-07-15T15:00:00Z",
    ],
  ])(
    "accepts consecutive local7AM period for %s (%s)",
    (timezone, periodStart, resetAt, serverNow) => {
      expect(
        dailyPeriodMatchesServerRules({
          timezone,
          periodStart,
          resetAt,
          serverNow,
        }),
      ).toBe(true);
    },
  );

  it("rejects stale Vancouver database tzdata returning8AM as7AM", () => {
    expect(
      dailyPeriodMatchesServerRules({
        timezone: "America/Vancouver",
        periodStart: "2026-11-18T15:00:00Z",
        resetAt: "2026-11-19T15:00:00Z",
        serverNow: "2026-11-18T17:00:00Z",
      }),
    ).toBe(false);
    expect(
      dailyPeriodMatchesServerRules({
        timezone: "America/Vancouver",
        periodStart: "2026-11-18T14:00:00Z",
        resetAt: "2026-11-19T14:00:00Z",
        serverNow: "2026-11-18T17:00:00Z",
      }),
    ).toBe(true);
  });

  it.each([
    { resetAt: "2026-11-20T12:00:00Z" },
    { serverNow: "2026-11-19T12:00:00Z" },
    { serverNow: "2026-11-18T11:59:59Z" },
    { periodStart: "invalid" },
    { timezone: "invalid/timezone" },
    { resetAt: null },
    { resetAt: "2026-11-19T12:00:00.001Z" },
  ])(
    "fails closed on malformed, nonadjacent or noncurrent periods %j",
    (override) => {
      expect(
        dailyPeriodMatchesServerRules({
          timezone: "America/New_York",
          periodStart: "2026-11-18T12:00:00Z",
          resetAt: "2026-11-19T12:00:00Z",
          serverNow: "2026-11-18T17:00:00Z",
          ...override,
        }),
      ).toBe(false);
    },
  );
});

describe("actual dispatch daily consistency preflight and access guards", () => {
  beforeEach(() => {
    Object.assign(fixture, {
      timezone: "America/New_York",
      storedTimezone: "America/New_York",
      dailyProfiles: true,
      owned: true,
      parentSession: true,
      stalePreflight: false,
      staleSnapshot: false,
      writes: [],
      rpcs: [],
    });
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://test.supabase.invalid");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-key");
    vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "test-secret");
    vi.stubEnv("FOUNDER_EMAIL", "Avromy@gmail.com");
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-18T17:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllEnvs();
  });
  const post = async (action: string) =>
    handle(
      new Request("https://test.local/api/parent/session-timer", {
        method: "POST",
        headers: { origin: "https://test.local" },
        body: JSON.stringify({
          profile_id: CHILD,
          action,
          duration_minutes: 1,
        }),
      }),
      ["parent", "session-timer"],
    );
  const settings = async (timezone: string) =>
    handle(
      new Request("https://test.local/api/parent/settings", {
        method: "PATCH",
        headers: { origin: "https://test.local" },
        body: JSON.stringify({ timezone }),
      }),
      ["parent", "settings"],
    );

  it("blocks inconsistent daily configuration before the control write while preserving Give Time", async () => {
    fixture.timezone = "America/Vancouver";
    fixture.stalePreflight = true;
    const rejected = await post("daily");
    expect(rejected.status).toBe(503);
    expect(await rejected.json()).toHaveProperty(
      "error",
      DAILY_TIMEZONE_UNAVAILABLE,
    );
    expect(fixture.rpcs).toEqual(["wn_daily_session_period"]);
    fixture.rpcs = [];
    expect((await post("start")).status).toBe(200);
    expect(fixture.rpcs).toEqual(["wn_control_profile_session_v2"]);
  });
  it("allows a verified New York daily setting", async () => {
    expect((await post("daily")).status).toBe(200);
    expect(fixture.rpcs).toEqual([
      "wn_daily_session_period",
      "wn_control_profile_session_v2",
    ]);
  });
  it("retains Parent and profile authorization before a timezone preflight", async () => {
    fixture.owned = false;
    expect((await post("daily")).status).toBe(403);
    expect(fixture.rpcs).toEqual([]);
    fixture.parentSession = false;
    expect((await post("daily")).status).toBe(401);
    expect(fixture.rpcs).toEqual([]);
  });
  it("blocks a settings timezone write only when existing daily profiles need unsupported rules", async () => {
    fixture.stalePreflight = true;
    const rejected = await settings("America/Vancouver");
    expect(rejected.status).toBe(503);
    expect(fixture.writes).toEqual([]);
    fixture.dailyProfiles = false;
    fixture.rpcs = [];
    expect((await settings("America/Vancouver")).status).toBe(200);
    expect(fixture.rpcs).toEqual([]);
    expect(fixture.writes).toEqual([
      { table: "parents", value: { timezone: "America/Vancouver" } },
    ]);
  });
  it("validates a stored snapshot timezone rather than a newly edited family timezone", async () => {
    fixture.timezone = "America/Vancouver";
    fixture.storedTimezone = "America/New_York";
    expect(
      (
        await handle(
          new Request("https://test.local/api/parent/session-status"),
          ["parent", "session-status"],
        )
      ).status,
    ).toBe(200);
    fixture.timezone = "America/New_York";
    fixture.storedTimezone = "America/Vancouver";
    fixture.staleSnapshot = true;
    const rejected = await handle(
      new Request("https://test.local/api/parent/session-status"),
      ["parent", "session-status"],
    );
    expect(rejected.status).toBe(503);
    expect(await rejected.json()).toHaveProperty(
      "error",
      DAILY_TIMEZONE_UNAVAILABLE,
    );
  });
});
