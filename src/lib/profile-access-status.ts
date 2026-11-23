/** Public status deliberately omits rate keys and attempt counters. */
export type AccessThrottle = {
  limited: boolean;
  windowExpiresAt: string | null;
};
export type ProfileAccessStatus = {
  serverNow: string;
  pin: AccessThrottle & { required: boolean };
  admission: AccessThrottle;
};

export function throttleStatus(
  row: { window_started: string; attempts: number } | null,
  maximum: number,
  seconds: number,
  now: number,
): AccessThrottle {
  if (!row) return { limited: false, windowExpiresAt: null };
  const expires = Date.parse(row.window_started) + seconds * 1000;
  if (!Number.isFinite(expires)) throw new Error("Invalid throttle window");
  return {
    limited: expires >= now && row.attempts >= maximum,
    windowExpiresAt: new Date(expires).toISOString(),
  };
}
