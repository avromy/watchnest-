/** Server-only time-rule comparison; never consumes a device-provided clock. */
export const DAILY_TIMEZONE_UNAVAILABLE =
  "Daily Allowance cannot renew safely in this time zone yet. Use Give Time for now.";

type DailyPeriod = {
  periodStart: unknown;
  resetAt: unknown;
  serverNow: unknown;
  timezone: unknown;
};

function localParts(at: number, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(at);
  const part = (name: string) =>
    Number(parts.find((p) => p.type === name)?.value);
  return {
    date: Date.UTC(part("year"), part("month") - 1, part("day")),
    hour: part("hour"),
    minute: part("minute"),
    second: part("second"),
  };
}

/**
 * The stored PostgreSQL period must agree with this trusted server's Intl rules:
 * consecutive local dates, both exactly7AM, enclosing the database/server instant.
 * A stale database tzdata result must never become a different daily allowance.
 */
export function dailyPeriodMatchesServerRules(period: DailyPeriod): boolean {
  if (
    typeof period.periodStart !== "string" ||
    typeof period.resetAt !== "string" ||
    typeof period.serverNow !== "string" ||
    typeof period.timezone !== "string"
  )
    return false;
  const start = Date.parse(period.periodStart);
  const end = Date.parse(period.resetAt);
  const now = Date.parse(period.serverNow);
  if (!Number.isFinite(start) || !Number.isFinite(end) || !Number.isFinite(now))
    return false;
  if (!(start <= now && now < end) || start % 1000 !== 0 || end % 1000 !== 0)
    return false;
  try {
    const before = localParts(start, period.timezone);
    const after = localParts(end, period.timezone);
    return (
      [before, after].every(
        (p) => p.hour === 7 && p.minute === 0 && p.second === 0,
      ) && after.date - before.date === 86400000
    );
  } catch {
    return false;
  }
}
