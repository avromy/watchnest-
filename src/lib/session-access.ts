export type SessionAccessProfile = {
  session_duration_minutes?: number | null;
  session_expires_at?: string | null;
  session_paused_seconds?: number | null;
  session_state_revision?: number | null;
  session_mode?: "once" | "daily";
  daily_allowance_minutes?: number | null;
  daily_reset_at?: string | null;
  daily_started?: boolean;
  daily_period_timezone?: string | null;
  session_parent_blocked?: boolean;
  session_limit_disabled?: boolean;
};

export type SessionAccess = {
  enabled: boolean;
  allowed: boolean;
  expiresAt: string | null;
  remainingSeconds: number | null;
  pausedSeconds: number | null;
  revision: number;
  mode?: "once" | "daily";
  dailyAllowanceMinutes?: number | null;
  resetAt?: string | null;
  timezone?: string | null;
  parentBlocked?: boolean;
  dailyStarted?: boolean;
  limitDisabled?: boolean;
  state: "unlimited" | "active" | "paused" | "expired" | "ready" | "blocked";
};

/**
 * A prospective wall-clock access deadline. This never consumes or derives
 * YouTube watch-time or engagement telemetry.
 */
export function sessionAccess(
  profile: SessionAccessProfile,
  now = Date.now(),
): SessionAccess {
  const daily = profile.session_mode === "daily";
  const blocked = profile.session_parent_blocked === true;
  const enabled =
    blocked || daily || Number.isInteger(profile.session_duration_minutes);
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
  const state = blocked
    ? "blocked"
    : !enabled
      ? "unlimited"
      : pausedSeconds !== null
        ? "paused"
        : daily && profile.daily_started === false
          ? "ready"
          : remainingSeconds !== null && remainingSeconds > 0
            ? "active"
            : "expired";
  return {
    enabled,
    allowed: state === "unlimited" || state === "active" || state === "ready",
    expiresAt,
    remainingSeconds:
      state === "ready"
        ? (profile.daily_allowance_minutes || 0) * 60
        : remainingSeconds,
    pausedSeconds,
    revision: Math.max(0, Number(profile.session_state_revision || 0)),
    state,
    ...(profile.session_mode !== undefined
      ? {
          mode: profile.session_mode,
          dailyAllowanceMinutes: profile.daily_allowance_minutes ?? null,
          resetAt: profile.daily_reset_at ?? null,
          timezone: profile.daily_period_timezone ?? null,
          parentBlocked: blocked,
          dailyStarted: profile.daily_started,
          limitDisabled: profile.session_limit_disabled === true,
        }
      : {}),
  };
}
