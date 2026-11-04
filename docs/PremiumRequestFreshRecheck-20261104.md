# Fresh Parent request workflow recheck — 2026-11-04

**PASS — bounded returning-Parent topic-request browser workflow.** The repaired candidate presents a clear completion action, executes the explicit resolved mutation, and renders the pending topic request removed. This is a fresh postrepair recheck, not a replacement of original frozen first impressions. No app code or production state changed for this review.

## Candidate and method

- Requested PR head: `c670d55a9bf22aa493f685fa62f79fda89151247`.
- Actual CI139 checkout: `34946674def9bc1ef7c844c8820bacc45bc857c6`; clean manifest source tree: `536c97e884065ac79338695d47bba7e2fc098c7f`.
- CI run: `13941783295237`. Raw ZIP SHA-256: `a0230d64404114561df5b02d69b20aef4060442dde878ad3a3ab8d3d94406ef7`.
- I inspected all five raw returning-Parent task PNGs before reading the fresh-parent spec. I did not open prior review verdict documents. A subsequent broad source search incidentally returned a prior security-note excerpt; that excerpt was not used as evidence or to determine this verdict. The verdict rests on the rendered images, executed test record, independently read fixture, and exact-ref GitHub source.
- Local repository HEAD is historical recovery state; it is not represented as a checkout of c670. Exact-ref source was separately fetched from `avromy/watchnest-` at c670 and frozen under `docs/evidence/premium-request-fresh-recheck/`.
- Runtime was CI Chromium at 390×844, `http://127.0.0.1:3001`, with synthetic API responses and synthetic player frame. I inspected the executed run; I did not personally repeat browser actions.

## Executed task journal and rendered findings

The result `fresh busy Parent follows a child topic request to preview and approval` passed with no retry and no recorded errors, starting `2026-11-04T06:07:18.329Z`, duration 1005 ms. The spec and record establish these actual automated actions:

1. Open Parent dashboard; use Requests; locate Ari's `Lego trains` topic request; use **Find a video**. Search is prefilled with `Lego trains`; run Search.
2. Open **Preview** on `Lego train adventure`. `busy-parent-preview.png` visibly names that exact video and says to press Play and confirm the exact video starts before approving. Close preview. Executed assertion verifies preview did not add any `/api/parent/videos` mutation. The black synthetic player rectangle is not evidence of playback.
3. Select **Ari**. `busy-parent-ready-to-approve.png` shows Ari checked and Miri/Benny/Eli unchecked. Video selection is still unchecked and approval disabled: child selection alone does not approve. Check **Select this video**, then explicitly press **Approve 1 selected video**.
4. Recorded stdout is exactly one approval object: `/api/parent/videos`, `youtube_video_ids:["newvideo123"]`, `profile_ids:["00000000-0000-4000-8000-000000000002"]`. Fixture identifies this profile as Ari. `busy-parent-after-approval.png` shows `1 individually selected video approved` and `Already approved Ari` on the exact result. This is individual video approval for the requesting child, not a family-wide grant.
5. Return to **Requests**. `busy-parent-request-outcome.png` still shows the single topic request and explicitly instructs: `After adding a video, return here to mark this request as fulfilled.` **Find a video**, **Mark as fulfilled**, and **Not now** have distinct visible labels. This explains the separate completion step; it does not falsely imply approving a search result automatically resolves a topic.
6. Press **Mark as fulfilled**. The executed assertion waits for a `/api/parent/requests` mutation with `status === "resolved"`, then requires zero `Lego trains` headings. `busy-parent-request-fulfilled.png` shows Requests selected, no pending badge, `You're all caught up`, and the empty Asked-by-the-children state.

The return screenshot catches Library visually selected while the Requests surface has already changed. The independently inspected settled pending and empty inbox core PNGs show Requests correctly selected. Exact source assigns `aria-current` from the active route. This isolated transition capture is not sufficient evidence of a persistent navigation defect; it does not obscure the visible fulfillment action.

## Correct mutation and retained video-request boundary

Exact candidate `ParentApp.tsx` calls the existing shared action with `PATCH /api/parent/requests`, `{id:r.id,status:"resolved"}` only in the branch without `youtube_video_id`. The pending inbox filters `status === "pending"`. The new action grants no video or profile assignment. This independently binds the user action to the correct request ID, although the existing browser assertion itself checks status/path rather than ID.

For video-specific requests the other branch remains explicit **Approve**, optional Preview, child choices defaulting to the requesting child, and **Approve video**. It submits `approve:true`, `status:"resolved"`, the request ID and selected profiles; the submit is disabled if the requesting child is omitted. Exact server source parent-scopes the request, rejects video resolution without `approve`, verifies owned profiles and available/embeddable metadata, and calls `wn_approve_child_request`. Exact migration source locks the pending owned request, checks exact video match and requesting-child inclusion, then inserts approval/assignments and resolves within the one database function. Thus the repair retains the existing atomic approval path by source inspection. This review does not claim an executed real-backend or browser video-specific request test.

## Defects and limits

No blocking defect found in the inspected repaired task. The extra return-and-fulfill step is manual, but its visible explanation and explicit action make the next action clear enough for this bounded task.

The fixture removes all requests after *any* captured path containing `/requests`; it does not emulate request-specific persistence. The test's exact resolved-status assertion plus immutable source distinguish the intended operation, but the empty screenshot alone cannot prove the real endpoint accepted/persisted it, that other pending requests remain, or that a refresh from hosted data works. The approval stdout was logged before fulfillment and must not be described as a post-fulfillment mutation journal. No raw fulfilled-request body was printed. No browser failure/recovery behavior was exercised for fulfillment. These are evidence limits, not passing backend claims.

No certification of production, hosted data, provider metadata, actual YouTube playback, physical devices, Safari/PWA, complete accessibility, or whole-product release readiness is granted. Material changes to this workflow invalidate this bounded acceptance until rerun.

## Frozen evidence

`docs/evidence/premium-request-fresh-recheck/SHA256SUMS` records exact hashes for the five task PNGs, two settled-route comparison PNGs, manifest, browser result and exact-ref source exports. Browser results SHA-256: `d7ffbef24422abc32a9d9ea2e2e06a5cbdad3bb9a45aa044cdfe86ac8cb0835f`. Parent source SHA-256: `ef657b7c3bf8e8b4d7f4a2f9153bb9d728511d5f60b89c8ae7bb1cbfccff2f4c`. Server source SHA-256: `475295c6a4ecb42a8c41669c039a0a774356bc58b84246ce407482cf9bf0252e`. Spec SHA-256: `2011777deadfee431cb15e24d41c058df1eac1ca60c82438fcfb96c67a4ee873`; fixture SHA-256: `1ca783a07ac4d5916fc2f0c6bfedf63c7aa9f8481b31a7a594472442bce06275` (matches CI manifest).
