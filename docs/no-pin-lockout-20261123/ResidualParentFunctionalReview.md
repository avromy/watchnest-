# Independent bounded functional source/coverage review

2026-11-23. Candidate commit `81c56380a7d78c61485c4f8628a1f5a20c3a19b6`, supplied source tree `f130618fa5ce7183cd7978a9476dfb4719e4ca4f`; supplied isolated stage `dpl_Hhrt3UMETpP6qJMhumTnHUt6w7LH`, https://watchnest-g5a882nq0-avromy.vercel.app. This report certifies only source reasoning and coverage inspection, not deployment provenance or hosted acceptance.

## Verdict

**PASS — bounded source invariant and regression coverage review, with a small coverage hole.** The new condition prevents `auth/child` from treating a residual verified Parent session as sibling-admission authority when the family has a Parent PIN. Explicit `parentPin` verification remains necessary on that route. This change is plausibly corrective for the reported physical failure but does not establish its historical cause or establish a physical-device repair.

No authenticated hosted, new-host login, cookie, credential or physical-device interaction was performed. No source edits, data mutations, external writes or duplicate tests were performed. Root-supplied 422 unit/DB PASS and running browser suite are reported evidence, not independently rerun results. The earlier physical FAIL on old candidate remains valid for that old candidate; this source review cannot replace the required exact-new-candidate physical rerun.

## Candidate binding and method

The shared working directory HEAD is older (`36e8b68…`) and dirty, so HEAD alone is not candidate proof. Inspected `git show 81c5638` diff, then verified five reviewed file bytes using `git hash-object` against exact candidate tree blobs:

| Reviewed file | Exact candidate blob, matches working bytes |
|---|---|
| src/lib/server/product.ts | c98496685208f9e8faf577b323b56774cf361a93 |
| src/lib/server/profile-handoff-route.test.ts | 33755d7a21c39688d8649b8f00b8ac58542fe3c8 |
| src/lib/server/profile-handoff-database.test.ts | ed251e2e3c17b3682aedd370c6707097744996af |
| supabase/migrations/20261119034107_device_profile_handoff.sql | b32ed71ef19657700008690f21dcb4a9dae6e892 |
| src/components/child/ChildLogin.tsx | 47b7e502c7ccdc5f1693d22caf56e40780c1dafb |

Read actual route/parent/device/child/limit code, handoff SQL, route and database tests, and relevant client handoff payload construction. This is independent review after implementation, not a cold visual journey; no visual acceptance repeated because this commit changes no rendered component bytes.

## Invariants assessed

| Invariant | Source reasoning and coverage | Scoped result |
|---|---|---|
| Configured Parent PIN forbids cookie fallback on sibling change | New `!household.parent_pin_hash` guard excludes `parent()` fallback. No explicit PIN leaves parentAuthorized false; differing active profile receives 403 before admission RPC. Three cookie cases test wn_parent, wn_refresh and wn_parent_mode, then valid explicit PIN success. | PASS source + regression design |
| Own PIN-off return stays credential-free | Same active profile does not enter fallback; child PIN limiter only runs when pin_enabled true. Tests cover seven returns, exhausted historical PIN bucket, and later genuine child PIN attempt. Client sends no handoff PIN for same-profile entry. | PASS source + coverage |
| Parent-stopped profile stays stopped after return | Admission SQL changes sessions/device binding, not profile time/parent-stop fields. Database test verifies stop/timer unchanged; route test permits identity admission but session-access remains blocked and player returns403. | PASS source + complementary coverage |
| Actual PIN guesses still throttle | Explicit parentPin invokes shared parent-mode five-attempt budget before verification. Child PIN budget is device/profile scoped and only used for actual PIN-enabled entry. Tests cover cross-route Parent exhaustion, five child guesses/window recovery and separate120/min admission bound. | PASS source + coverage |
| Explicit Parent management remains available | parent/view-as-child is behind parent() route authorization, owned-profile and device-family checks, then calls atomic admission with verified Parent authority. No PIN/timer/rate reset. Existing regression asserts intended management route still admits. | PASS source + bounded test |
| No Parent PIN configured preserves verified enrollment | Only no-Parent-PIN sibling path may invoke parent(); returned parent ID must match linked device family. Added positive test covers matching signed-in Parent. | PASS source; negative branch coverage needs improvement |
| Family and stale snapshots fail closed | Query scopes profile to household, SQL checks live device/family/profile and expected Parent/child PIN snapshots, and old device sessions revoke atomically. Existing route/DB cases cover foreign profile, stale/null snapshots, insert rollback and held child identity mismatch. | PASS source + coverage |

## Holes and limitations

1. **Nonblocking coverage defect:** existing “rejects verified Parent authority from another household” case retains configured `parentHash`. With the new guard it now returns403 before `parent()` is called, so the title overstates exercised behavior. Set `state.parentHash = ''` in that negative case to reach the no-Parent-PIN fallback. Add a no-Parent-PIN/no-Parent-authority negative case if no equivalent exists elsewhere. Source still explicitly compares `verified.id === linked.parent_id`; no bypass found.
2. The route mocks record cookie writes rather than applying them to subsequent requests. Seven-entry cases test handler selection/throttle budgets, not actual browser cookie lifecycle. Database tests complement binding/session transitions; browser suite and physical rerun remain necessary for stale tabs, concurrent histories and real playback.
3. Three residual-cookie cases cover cookies individually. Configured-PIN code is independent of cookie combinations, so combined-cookie behavior follows from source, but is not a separately executed integration case here.
4. Rate-limit implementation is mocked in route tests. They prove route budgets/keys/branching; they do not alone establish production rate-store or deployed DB state.
5. The handoff SQL test uses PGlite and explicitly disclaims real multi-connection stress. No production schema/retirement-state query was performed in this review.
6. A source-only fix cannot prove the earlier physical incident used this exact residual-cookie path. Keep the original incident described as observed behavior with cause uncertain.

## Acceptance boundary and next evidence

No source-based blocker found for staging this exact guard. Keep canonical promotion and physical/hosted acceptance governed by root's current release authority. The meaningful remaining test is the exact staged candidate on the affected iPad/session history: own no-PIN return, Parent-stopped return still denied, attempted sibling admission requiring explicit Parent PIN, then valid target-specific handoff and old identity invalidation. Do not call this report authenticated hosted/device PASS.

No Founder decision or new service is needed for the small coverage improvement. Root remains the implementation owner, so this internal review introduces no separate-chat handoff prompt. No Notion save occurred.
