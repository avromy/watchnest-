# Product-focused UI refinement — November 10, 2026

Baseline: existing isolated premium branch at39ab79fe808bcac4f5eb343156d7f84c60fc7a00,
application c670. This is a bounded continuation, not a new design authority or
production release. The new Founder directive explicitly forbids authenticated
sales-page slogans and requires a task-led experience. Prior source-bound visual
receipts are historical for the affected screenshots until renewed.

## Changed behavior and rationale

- Parent Overview: replaces the370px-minimum acquisition hero and rotated
  decorative artwork with a compact Family overview heading. Existing library
  counts, request queue and child management now appear immediately; persistent
  Add videos remains the primary acquisition action, eliminating duplicateCTA.
- Parent Add/Collections/Profiles/session labels use clear product terms instead
  of taglines. Pending request count is explicit. No API route or payload change.
- Child Home/Discover and time-status eyebrows are functional labels. Picker
  retains direct approved-content entry and optional PINs without extra steps.
- Empty picker no longer claims an unavailable create-profile interface; it
  truthfully offers refresh or existing Parent Mode family settings. This is
  only the empty-state branch; authentication and profile-entry logic unchanged.
- Home remains actual approved content: resume/featured approved video, shelves,
  Favorites and Collections. Library remains the distinct searchable/filterable
  complete catalog. Neither is an intermediate welcome/onboarding screen.

## Protected scope and evidence

No player lifecycle, iframe/CSP, server/session/auth/PIN/RLS, timer backend, schema,
family data, assignments or environments changed. Source diff is four UI files.
Three existing e2e exact heading expectations changed to match visible labels;
all task outcomes and security assertions remain.

Local npmci completed. TypeScript, ESLint and200/200 existing tests PASS. Final
production build after all code edits PASS. Full browser suite is executing;
actual browser and independent review verdicts must be recorded separately.
No physical/provider/hosted-persistence acceptance inferred. No prod promotion.

## Current source freeze SHA256

- src/components/parent/ParentApp.tsx: `2099cfb8b1d8e90fc1dc6a5414824ef70587397e65229e44bb0ee72eb249990f`
- src/components/parent/Parent.module.css: `ac3498f94d89dd4a8c21894a224138dea9ac13bd118071a11f8cd5a3e8f0f900`
- src/components/child/ChildLibrary.tsx: `b13712d1254f17253206b333eb81d84b8f48f3a768f4c25d9f565228a6012686`
- src/components/child/ChildLogin.tsx: `703ef88b693d5e9189a15c2d410670ccd4e0c539786327f53f4d134f20ada855`

## Invocation and invalidation

Current App Dev routing/project locks, PremiumDesignAuthority and complete
PremiumReviewContract consumed and applied to this bounded component/copy task.
Shared tokens/type/44px controls preserved; obsolete hero CSS removed, no new
brand or icon system introduced. Current canonical capability resolution and
three-direction independent selection are managed in the root authority lane,
not falsely claimed complete by this implementation receipt.

Affected evidence: Parent Overview at all widths, Parent Add/Collections/Profiles/
Inbox labels, child Home/Discover/time-state labels and profile picker normal/
empty states. Re-render and independently inspect these; preserve prior failed
records and source equivalence only where actually proven.

## User pause checkpoint

No further work authorized until resume. Final two actual-review findings were
repaired: picker footer now says Approved videos for your family; per-child
1 request grammar corrected. The prior local full browser batch was first
interrupted gracefully and retained privately, so compiled/source identities were
not mixed. It observed14 passing tests (six journeys plus eight visual families),
one390 core capture failure at scroll-predicate polling, then exit130 before
64 completion. The trace shows a page.evaluate call still pending when the5s
predicate deadline elapsed; an incorrect actual scroll value was not observed.
Do not classify this as a proven app failure or waive the capture requirement.

A fresh final production build including TypeScript completed PASS after both
last fixes, before the pause cancellation attempt reached the already-finished
process. No targeted browser rerun/clean CI was launched for the final fixes.
Earlier lint/200unit results predate the final two template-string adjustments.
Independent source review refreshed PASS; visual/UX reviews remain PARTIAL,
not PASS, and require actual final-source rechecks.

Final pause SHA256 src/components/parent/ParentApp.tsx: `d5b375f5d58c31c8060982ec3bbd4f134c69107fc55e332f17c0f203eb11fbae`

Final pause SHA256 src/components/parent/Parent.module.css: `ac3498f94d89dd4a8c21894a224138dea9ac13bd118071a11f8cd5a3e8f0f900`

Final pause SHA256 src/components/child/ChildLibrary.tsx: `b13712d1254f17253206b333eb81d84b8f48f3a768f4c25d9f565228a6012686`

Final pause SHA256 src/components/child/ChildLogin.tsx: `710aa9c478d04de254192251dae75308f3bcbfb2dc50ae8a2100c5704ba0f3ce`
