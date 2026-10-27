/** One visual grammar for the household's existing profile identity choices.
 * Names remain visible beside these decorative shapes; identity is never color-only.
 */
export default function ProfileIdentity({
  identity,
}: {
  identity?: string | null;
}) {
  const shape =
    identity === "bird" ? (
      <>
        <path d="M4 15c3-6 7-8 12-6 2 1 3 3 3 6-4 4-10 5-15 0Z" />
        <path d="M8 11c2-4 5-5 8-5M18 11l3-1-2 3" />
        <circle cx="16" cy="11" r=".7" fill="currentColor" />
      </>
    ) : identity === "fox" ? (
      <>
        <path d="m5 6 4 2h6l4-2-1 9-6 5-6-5Z" />
        <path d="m5 6 1-3 3 5m10-2-1-3-3 5M9 14h.01M15 14h.01m-5 3h4" />
      </>
    ) : identity === "bear" ? (
      <>
        <circle cx="12" cy="13" r="7" />
        <circle cx="6" cy="6" r="3" />
        <circle cx="18" cy="6" r="3" />
        <circle cx="9.5" cy="12" r=".7" fill="currentColor" />
        <circle cx="14.5" cy="12" r=".7" fill="currentColor" />
        <path d="M10 16c1.3 1 2.7 1 4 0" />
      </>
    ) : identity === "cat" ? (
      <>
        <path d="m5 9 1-6 4 3h4l4-3 1 6v7c-2 4-12 4-14 0Z" />
        <path d="M9 12h.01M15 12h.01m-5 4c1.3 1 2.7 1 4 0M7 15 3 14m4 3-4 1m14-3 4-1m-4 3 4 1" />
      </>
    ) : identity === "rocket" ? (
      <>
        <path d="M14 4c3-2 5-2 6-2 0 4-1 9-6 12l-4-4c1-2 2-4 4-6Z" />
        <circle cx="16" cy="7" r="2" />
        <path d="m10 10-4 1-3 3 6 1 1 6 3-3 1-4M7 17l-3 3" />
      </>
    ) : identity === "sun" ? (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
      </>
    ) : identity === "star" ? (
      <path d="m12 2 3 6.2 6.8 1-4.9 4.8 1.2 6.8L12 17.6l-6.1 3.2L7.1 14 2.2 9.2l6.8-1Z" />
    ) : identity === "moon" ? (
      <path d="M20.6 14.4A9 9 0 0 1 9.6 3.4a9 9 0 1 0 11 11Z" />
    ) : (
      <>
        <path d="M20 3C9 3 4 7 4 13a7 7 0 0 0 7 7c6 0 9-6 9-17Z" />
        <path d="m4 20 11-11m-6 6v-4m0 4h4" />
      </>
    );
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="60%"
      height="60%"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: "block", color: "var(--forest, #193f35)" }}
    >
      {shape}
    </svg>
  );
}
