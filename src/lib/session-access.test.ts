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
});
