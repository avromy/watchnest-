# Independent repair review — 2026-11-20

Scope: SOURCE + AUTOMATED UNIT/REGRESSION review, separate reviewer context from Builder. This is not hosted authenticated, provider playback, physical device, visual, or product-ready acceptance. The full controller test cycle was pending at review time.

## Exact candidate

Baseline HEAD: `23b1c5a80954334bf5ebbe50da16f2f6cdf6552e`.

Working candidate source tree: `03b8886feede8177c5e484032beaa3d5efefbb65` (constructed from baseline plus actual working `src` using an isolated temporary Git index; real index untouched).

| File | Reviewed Git blob |
|---|---|
| src/components/parent/RequestPreview.tsx | 343374c1046b8cf1beb7a294d895455893ba154b |
| src/components/parent/ParentApp.tsx | 03e650d3466eb8660eeb8447d65f63a76e3546ea |
| src/components/child/ChildPlayer.tsx | 6e20b844086264cfa5394c26f850ccba671192de |
| src/lib/server/product.ts | 00cd2aa5a1d5765a1c9071a22bf14169118fec74 |
| src/lib/server/product-security.ts | 13f35fc1d259628be7e6341c9c9ef9616ac6e3b4 |

Material mutation after these hashes invalidates affected conclusions. This reviewer changed only reports, not application implementation.

## Finding requiring follow-up

**P2 — successful collection creation followed by failed dashboard refresh misrepresents the collection that approval will use.** In `ParentApp.tsx:2294-2300`, the confirmed created ID is stored in `collection`, then `reload()` may fail. The select's options still come only from stale `data.collections` (`2259-2263`), without that new ID. A controlled select whose value has no matching option displays the first option (No collection), while the submit handler still sends the confirmed new ID. The error is caught, but the visible selection and actual approval differ. Preserve a local confirmed option/title until server reconciliation or prevent approval until refresh succeeds. Add the missing regression: POST succeeds, subsequent dashboard GET fails, then inspect selection and any approval payload. The present browser test covers POST failure only. No hosted family mutation is needed to reproduce this with local authorized fixtures.

## Repairs independently assessed

- **Storage crash and muted default: source PASS.** `ChildPlayer.tsx:152-165` wraps optional storage property/read access and rejects null/blank before number conversion. Default remains 60; explicit zero is honored; invalid/out-of-range values do not replace the default. Slider SDK writes and optional persistence are separately caught (`826-844`). ENDED teardown now catches provider destroy failure. None changes child authorization, containment, session timer, or metadata policy.
- **Requested Preview: source PASS with platform limitations.** New `RequestPreview.tsx` contains no API mutation, approval, or child navigation. Frame exists only inside `open &&` and only for an eleven-character allowed ID. It reuses the encoded nocookie embed builder and existing responsive player/modal rules. Close unmounts the frame and restores focus/scroll; Escape and Tab boundary handling apply when key events reach the parent document. Cross-origin iframe key events cannot be assumed to bubble, so Escape from inside YouTube itself remains a browser/provider limitation; visible Close remains available. Twelve-second pending feedback and a keyed remount provide retry. An iframe load event is correctly described conditionally and is not called playback success. No sandbox relaxation or child safety bypass was added.
- **Parent bulk errors: source PASS for rejection handling.** Add-to-collection now uses shared `act`, which catches both mutation and reload failure and retains selected IDs until success. Bulk removal catches each action via `act` and stops on first failure. This remains a sequence of independent deletions, so partial success is possible and earlier successful changes are refreshed. It does not claim transactional all-or-nothing behavior. No permissions were widened.
- **Inbox creation errors: source PARTIAL.** Per-component pending ref prevents double submission; try/catch/finally retains user input on POST failure, surfaces errors, and releases pending state. POST-success/refresh-failure has the remaining P2 above.
- **Server security preserved: source PASS for unchanged scope.** The diff changes no server route, SQL, cookie, origin, rate-limit, or authorization code. Parent authorization precedes route dispatch; child device/active-profile binding remains; requested approval still validates family ownership, fresh embeddable metadata, and atomic requesting-child/collection checks. Preview adds no secret, request token exposure, telemetry, or new service.

## Executed checks

`git diff --check`: PASS.

Targeted Vitest run: **6 files / 89 tests passed**, exit 0, duration 2.18 seconds:

- src/lib/server/product-security.test.ts
- src/lib/server/product-dispatch.test.ts
- src/lib/server/independent-security-resume.test.ts
- src/lib/server/independent-route-resume.test.ts
- src/lib/youtube-player.test.ts
- src/components/child/model.test.ts

Reviewed new browser regressions in `e2e/request-preview.spec.ts` and `e2e/startup.spec.ts`; this reviewer did not run browser/build checks concurrently with the controller. Their fixture results cannot establish hosted, physical-device, or real YouTube playback acceptance.

## Scoped result

No new P0/P1 security bypass found in this bounded diff. Source repairs address the identified optional-storage exception and unhandled Parent action paths. **One P2 failure-recovery defect remains.** Final acceptance is qualified pending repair/review of that path and the controller's candidate-bound complete verification. Reported live/stage P0 causation still requires actual hosted evidence; source plausibility alone is insufficient.


## Independent addendum — P2 repair review

Reviewed the actual incremental creation-recovery change after the initial review. New working source tree: `c829791bd3b81809627e96a04e26b47c8f8eeb5e`. New ParentApp blob: `e7b1a0e254bcfe1ad17d265c9118d249b6593aec`. RequestPreview and ChildPlayer remain the exact reviewed blobs above. Regression source blob `e2e/request-preview.spec.ts`: `85cb1a1ff9f7394c8f4095f58bf810227d65e9b2`.

**P2 source finding: RESOLVED.** A successful creation now retains the confirmed Collection object locally and renders its ID/title as an option while the dashboard lacks it. Once refreshed data contains the ID, the fallback option disappears without a duplicate. Selection and approval payload remain aligned even after refresh failure. The error copy distinguishes a confirmed creation from a failed POST. This does not change server authorization or grant an assignment without explicit approval.

The new regression independently targets POST success followed by dashboard 503, checks both select value and visible selected title, then checks the actual explicit approval collection_id. Its fixture scope is appropriate. This reviewer inspected that test but did not execute browser/build while the controller's shared run was active. `git diff --check` passed on the revised tree. No further source defect identified in this bounded delta.

**Revised scoped result: source/security review PASS for this repair candidate.** The original P2 qualification is superseded only for the hashes in this addendum. Prior targeted 89-test results apply to unchanged code covered by those tests; no claim is made that those tests execute the revised UI branch. Controller candidate-bound browser/build/full-test completion, actual hosted investigation, provider playback, and physical-device acceptance remain separate and open.


## Frozen candidate binding — formatting equivalence

Verified commit `146a672f5b0744a13869dc29983e5942a0d7a233` resolves to source tree `464c41e300e38b9c34cb4f6603f4f2019e4141c4`, which also matches current HEAD source tree at inspection. ParentApp blob is `f06e99191d1c6d1780ceacc7a89ec1c2d1cff70c`. Comparing this source tree to the reviewed P2 repair tree `c829791bd3b81809627e96a04e26b47c8f8eeb5e` changes only ParentApp formatting: multiline state initialization, arrow-function parentheses/line wrapping, JSX option wrapping, and ternary indentation.

Independently compared the emitted JavaScript semantic ASTs after TypeScript transpilation (React automatic JSX transform, ES2022, comments removed), retaining node kinds, identifier/string/number values, child ordering, and operators while ignoring source positions and redundant parentheses. The ASTs are identical, SHA256 `e55c1a9315204dda7c3daf89417aa715e1e3258e197c6f48babd414c8b656b06` for both. Raw emitted JavaScript text differed only in presentation; it was not treated as byte-identical. `git diff --check` passed.

The bounded source/security PASS and resolved P2 finding now apply to frozen source tree `464c41e300e38b9c34cb4f6603f4f2019e4141c4` / commit `146a672f5b0744a13869dc29983e5942a0d7a233`. No unchanged tests were rerun, and no shared browser/build operation was started. Earlier findings and evidence remain preserved above. Hosted/device/product-ready acceptance is still outside this review.
