export function minuteInTimezone(timeZone: string, now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const hour =
    Number(parts.find((part) => part.type === "hour")?.value || 0) % 24;
  const minute = Number(
    parts.find((part) => part.type === "minute")?.value || 0,
  );
  return hour * 60 + minute;
}

export function isWithinAccessWindow(
  profile: {
    available_from_minute?: number | null;
    available_until_minute?: number | null;
  },
  timeZone: string,
  now = new Date(),
) {
  const start = profile.available_from_minute;
  const end = profile.available_until_minute;
  if (start == null || end == null || start === end) return true;
  const current = minuteInTimezone(timeZone, now);
  return start < end
    ? current >= start && current < end
    : current >= start || current < end;
}
