import { describe, expect, it } from "vitest";
import { isWithinAccessWindow, minuteInTimezone } from "./access-window";

describe("policy-safe access windows", () => {
  it("uses the household timezone instead of server time", () => {
    const now = new Date("2026-10-02T00:30:00Z");
    expect(minuteInTimezone("America/Toronto", now)).toBe(20 * 60 + 30);
    expect(minuteInTimezone("America/Los_Angeles", now)).toBe(17 * 60 + 30);
  });

  it("allows a daytime window and denies its exact closing boundary", () => {
    const profile = {
      available_from_minute: 16 * 60,
      available_until_minute: 20 * 60,
    };
    expect(
      isWithinAccessWindow(
        profile,
        "America/Toronto",
        new Date("2026-10-01T23:59:00Z"),
      ),
    ).toBe(true);
    expect(
      isWithinAccessWindow(
        profile,
        "America/Toronto",
        new Date("2026-10-02T00:00:00Z"),
      ),
    ).toBe(false);
  });

  it("supports an overnight window without tracking viewing duration", () => {
    const profile = {
      available_from_minute: 20 * 60,
      available_until_minute: 7 * 60,
    };
    expect(
      isWithinAccessWindow(
        profile,
        "America/Toronto",
        new Date("2026-10-02T03:00:00Z"),
      ),
    ).toBe(true);
    expect(
      isWithinAccessWindow(
        profile,
        "America/Toronto",
        new Date("2026-10-02T16:00:00Z"),
      ),
    ).toBe(false);
  });
});
