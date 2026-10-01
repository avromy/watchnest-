/** One visual grammar for the household's existing profile identity choices.
 * Names remain visible beside these decorative shapes; identity is never color-only.
 */
export default function ProfileIdentity({ identity }: { identity?: string | null }) {
  const shape = identity === "sun" ? (
    <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></>
  ) : identity === "star" ? (
    <path d="m12 2 3 6.2 6.8 1-4.9 4.8 1.2 6.8L12 17.6l-6.1 3.2L7.1 14 2.2 9.2l6.8-1Z" />
  ) : identity === "moon" ? (
    <path d="M20.6 14.4A9 9 0 0 1 9.6 3.4a9 9 0 1 0 11 11Z" />
  ) : (
    <><path d="M20 3C9 3 4 7 4 13a7 7 0 0 0 7 7c6 0 9-6 9-17Z" /><path d="m4 20 11-11m-6 6v-4m0 4h4" /></>
  );
  return <svg aria-hidden="true" focusable="false" width="60%" height="60%" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ display: "block", color: "var(--forest, #193f35)" }}>{shape}</svg>;
}
