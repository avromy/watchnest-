export function requestImmersivePlayback() {
  if (typeof document === "undefined" || document.fullscreenElement) return;
  const root = document.documentElement;
  if (!root.requestFullscreen) return;
  // This is intentionally called directly from the child's card tap. Browsers
  // that do not allow fullscreen here reject the request and the player route
  // supplies the immersive in-page fallback.
  void root.requestFullscreen({ navigationUI: "hide" }).catch(() => undefined);
}

export function leaveImmersivePlayback() {
  if (typeof document === "undefined" || !document.fullscreenElement) return;
  void document.exitFullscreen().catch(() => undefined);
}
