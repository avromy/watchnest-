# Parent access inspection and recovery implementation receipt

Date: 2026-11-23. Implementer: `/root/cold_release_98f` (this incident task is implementation, not a cold independent certification). Authority: root assigned bounded Parent recovery work after current incident authority recovery. No actual household sign-in, device mutation, real family data writes, production publishing, migrations, PIN resets, or rate-limit clearing occurred in this lane.

Implemented:

- Family profile cards now include a discoverable “Access on this device” section, “Check access”, and explicit “Open [child]’s library as Parent”. Inline errors cover both status failure and denied recovery. Busy controls prevent overlapping recovery/check clicks. Explanatory text says time controls and schedules continue to apply.
- `GET /api/parent/profile-access?profileId=…` runs behind the existing verified Parent gate, validates owned/non-archived profile and non-revoked/unexpired device token for the same family. Inspection does not renew devices or run metadata cleanup. The existing general Parent action rate budget remains enforced.
- Status reads only the selected device/profile child-PIN hash key when that profile's PIN is enabled, plus the separate selected device admission key. Obsolete PIN buckets are not read or presented as waits for PIN-off profiles. Response omits all keys, hashes, attempts and tokens; it reports server time and actual stored window expiry separately for PIN and device-entry limits. No invented countdown is supplied; the UI labels this as a checked-at snapshot and offers refresh.
- Explicit Parent recovery uses the existing atomic Parent-authorized view-as-child admission. No PIN/rate counters or timer state is reset. An `audit_events` row named `parent_profile_recovery_requested` is inserted before admission; audit failure prevents admission. This records a requested action and does not misrepresent a denied admission as a successful recovery.

Validation completed in this lane:

- `vitest run src/lib/server/profile-access-route.test.ts src/lib/server/profile-handoff-route.test.ts`: **40/40 passed** (7 new recovery/inspection tests plus 33 admission tests).
- TypeScript `tsc --noEmit`: passed.
- Scoped ESLint for ParentApp, helper, new route test and browser spec: passed with no warnings.
- New `e2e/profile-access.spec.ts` covers mobile PIN-off status versus device wait, readable error feedback, recovery payload, and retry availability after denial. Root owns the shared app build and execution of browser checks; results must be attached by root before claiming browser acceptance.
- One existing concept3 experience-mode browser locator was updated from “View as Ari” to the new explicit Parent action label.

Focused test boundaries include unauthorized/foreign profile/foreign device inspection and recovery, historical PIN-off buckets ignored, no secret disclosure, real separate expiries plus expiration, no inspection data writes, audited Parent bypass without profile/limit mutation, and audit failure before admission.

Source identity at focused-test completion (Git blob IDs, not a published candidate):

| File | Blob |
|---|---|
| `src/components/parent/ParentApp.tsx` | `b20e00b85dd6061e72d2fe94ff25c6c87495c8d3` |
| `src/lib/server/product.ts` | `3fd080425b0973f2ce0c9c77be0df1c2bc9af2eb` |
| `src/lib/profile-access-status.ts` | `493247fd299abf61b08d2f18a0f687f37a517dfb` |
| `src/lib/server/profile-access-route.test.ts` | `0116a07ff30d4951ddb159f73263ec7061e3662b` |
| `e2e/profile-access.spec.ts` | `9649aa550afc9fb45302b3360fff70ca7fc93db5` |

Limitations: no deployed authentication, database, iPad/device, or whole-release claim. The inspection checks the documented child-PIN and device-admission windows; it does not claim every unrelated network/Parent action throttle is clear. A historical exact household lockout cannot be inferred from synthetic tests. Recovery uses existing admission behavior; playback/access enforcement continues in the child session layer. Root must bind integrated build/browser/security evidence to the final exact candidate.
