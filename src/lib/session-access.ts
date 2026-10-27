export type SessionAccessProfile = {
  session_duration_minutes?: number | null;
  session_expires_at?: string | null;
  session_paused_seconds?: number | null;
  session_state_revision?: number | null;
};

export type SessionAccess = {
  enabled: boolean;
  allowed: boolean;
  expiresAt: string | null;
  remainingSeconds: number | null;
  pausedSeconds: number | null;
  revision: number;
  state: "unlimited" | "active" | "paused" | "expired";
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
  const pausedSeconds = Number.isInteger(profile.session_paused_seconds)
    ? Math.max(0, Number(profile.session_paused_seconds))
    : null;
  const state = !enabled
    ? "unlimited"
    : pausedSeconds !== null
      ? "paused"
      : remainingSeconds !== null && remainingSeconds > 0
        ? "active"
        : "expired";
  return {
    enabled,
    allowed: state === "unlimited" || state === "active",
    expiresAt,
    remainingSeconds,
    pausedSeconds,
    revision: Math.max(0, Number(profile.session_state_revision || 0)),
    state,
  };
}

