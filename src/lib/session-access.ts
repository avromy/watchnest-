export type SessionAccessProfile = {
  session_duration_minutes?: number | null;
  session_expires_at?: string | null;
};

export type SessionAccess = {
  enabled: boolean;
  allowed: boolean;
  expiresAt: string | null;
  remainingSeconds: number | null;
};

/**
 * A prospective wall-clock access deadline. This never consumes or derives
 * YouTube watch-time or engagement telemetry.
 */
export function sessionAccess(
  profile: SessionAccessProfile,
  now = Date.now(),
): SessionAccess {
  const enabled = Number.isInteger(profile.session_duration_minutes);
  const parsed = Date.parse(profile.session_expires_at || "");
  const expiresAt = Number.isFinite(parsed)
    ? new Date(parsed).toISOString()
    : null;
  const remainingSeconds = expiresAt
    ? Math.max(0, Math.ceil((parsed - now) / 1000))
    : null;
  return {
    enabled,
    allowed: !enabled || (remainingSeconds !== null && remainingSeconds > 0),
    expiresAt,
    remainingSeconds,
  };
}

