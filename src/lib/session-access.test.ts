import { describe, expect, it } from "vitest";
import { sessionAccess } from "./session-access";

describe("sessionAccess", () => {
  const now = Date.parse("2026-10-26T12:00:00.000Z");

  it("leaves existing profiles unlimited by default", () => {
    expect(sessionAccess({}, now)).toEqual({
      enabled: false,
      allowed: true,
      expiresAt: null,
      remainingSeconds: null,
      pausedSeconds: null,
      revision: 0,
      state: "unlimited",
    });
  });

  it("allows an active wall-clock session", () => {
    expect(
      sessionAccess(
        {
          session_duration_minutes: 20,
          session_expires_at: "2026-10-26T12:19:30.000Z",
        },
        now,
      ),
    ).toMatchObject({ enabled: true, allowed: true, remainingSeconds: 1170 });
  });

  it("fails closed when configured but not started or expired", () => {
    expect(sessionAccess({ session_duration_minutes: 20 }, now).allowed).toBe(
      false,
    );
    expect(
      sessionAccess(
        {
          session_duration_minutes: 20,
          session_expires_at: "2026-10-26T11:59:59.000Z",
        },
        now,
      ).allowed,
    ).toBe(false);
  });

  it("fails closed while paused and preserves the server-owned remainder", () => {
    expect(
      sessionAccess(
        {
          session_duration_minutes: 20,
          session_paused_seconds: 420,
          session_state_revision: 7,
        },
        now,
      ),
    ).toMatchObject({
      enabled: true,
      allowed: false,
      pausedSeconds: 420,
      revision: 7,
      state: "paused",
    });
  });
});

describe("daily access snapshots", () => {
  const now = Date.parse("2026-11-18T15:00:00Z");
  it("offers a pending daily window without fabricating a deadline or autoplay", () => {
    expect(
      sessionAccess(
        {
          session_mode: "daily",
          daily_allowance_minutes: 5,
          daily_started: false,
          session_duration_minutes: 5,
          daily_reset_at: "2026-11-19T12:00:00Z",
        },
        now,
      ),
    ).toMatchObject({
      state: "ready",
      allowed: true,
      remainingSeconds: 300,
      expiresAt: null,
      mode: "daily",
    });
  });
  it("Parent block dominates pending renewal and removed limits", () => {
    expect(
      sessionAccess(
        {
          session_mode: "daily",
          daily_started: false,
          daily_allowance_minutes: 5,
          session_parent_blocked: true,
        },
        now,
      ),
    ).toMatchObject({ state: "blocked", allowed: false });
    expect(
      sessionAccess(
        {
          session_mode: "once",
          session_limit_disabled: true,
          session_parent_blocked: true,
          session_duration_minutes: 1,
          session_expires_at: "2026-11-18T14:00:00Z",
        },
        now,
      ),
    ).toMatchObject({ state: "blocked", allowed: false, limitDisabled: true });
  });
  it("pause dominates a renewed daily allowance", () => {
    expect(
      sessionAccess(
        {
          session_mode: "daily",
          daily_started: false,
          daily_allowance_minutes: 5,
          session_paused_seconds: 300,
        },
        now,
      ),
    ).toMatchObject({ state: "paused", allowed: false });
  });
});
