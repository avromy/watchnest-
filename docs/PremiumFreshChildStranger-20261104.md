# Fresh child/shared-device stranger review — 2026-11-04

## Frozen first impressions (before fixture/test/source reading)

Entry evidence: CI135 candidate rendered PNGs, especially `test-results/visual-evidence/candidate/768x1024/family-profile-picker-top.png`, `child-home-top.png`, and `child-details/child-simple-library-top.png`. Also viewed the three older `docs/evidence` picker/simple/tablet images; their copy/art differs, so conclusions favor the candidate-path images. These are synthetic browser renders with synthetic SVG artwork, not observed children or physical iPads.

The family picker reads clearly: choose a name/picture, enter a PIN where indicated; Parent Mode is separate. Large targets look suitable for touch. Ari's header name plus opposing arrows suggests switching profiles, although the arrows alone require interpretation. I expect switching to return to the family picker and require a protected sibling's PIN, rather than carrying access across.

The full child home immediately offers Keep watching and a visible rocket picture. I would tap that for resuming. Library and Favorites provide understandable retrieval routes. Discover sounds broader than the approved library; as an older child I expect to search for something new and ask a parent before it becomes playable. I expect a saved heart to appear under Favorites after switching away and returning.

The simpler library has Home/Library, a search box, All videos/Favorites/Hidden, and recognizable rocket/piano artwork. A younger nonreader may struggle with search/filter text but can choose the pictures. The explicit duration and title help a reading child. Hidden seems a relatively adult housekeeping concept, and showing it to a younger child may add clutter; this is a minor hypothesis pending action.

Visual first-pass concerns: large vertical home hero pushes browsing partly below the fold; repeated decoration may limit content recognition with many videos. This cannot establish usability failure without interaction and realistic provider imagery. No critical blocker established from the entry renders.

## Independently selected tasks

1. Younger child: enter an unprotected profile, browse Library by pictures, open a video, then return to browsing without losing whose library this is.
2. Older child: enter protected Ari, retrieve a specific library video by search, favorite it, return to Favorites to retrieve it; discover/request a new item and recognize the pending state without assuming it is playable.
3. Shared device: use the profile switch, enter an unprotected sibling, then try protected Ari with a wrong PIN and recover with the correct PIN. Verify parent access remains separately gated.

## Interactive evidence and verdict

Pending separately executed fresh test and final-candidate screenshot review. Static-only impressions do not certify interactive acceptance. Candidate requested by parent: `da6edbb4436fc6f455eaef87ace5df61c3e62396`; CI135 is preliminary and final evidence must bind the eventual verdict.

### CI137 failed-attempt receipt

Independently inspected all three raw child `failure.png` renders and browser-results errors under `/workspace/scratch/b4fb31747e8d/watchnest-review/ci137-cold`. Younger/shared tasks stopped at the family picker with an erroneous PIN rejection after selecting unprotected Benny/Eli. The test adapter looked up `body.profile_id`, while the actual app transport uses `body.profileId` (confirmed by execution agent's bounded infrastructure review). Corrected this test-only adapter and removed its silent fallback to Ari. This was a test defect, not evidence of product gating failure.

Older-child failure visibly shows Ari's PIN dialog with an explicit rejection after filling the code. Therefore submission happened; adding an invented submit action is not supported by the pixels. Execution agent confirmed the actual auth transport is `{profileId, passcode}`, whereas my adapter checked `pin`. Corrected the adapter to `passcode`, preserving the fill interaction. Original tasks, assertions, and failed CI137 evidence remain preserved. No application changes. No interactive acceptance verdict yet.

### CI138 attempted journeys and semantic locator correction

Read raw older-child strict-mode failure and viewed actual older-child failure, younger-child return, and shared-parent-boundary PNGs under `/workspace/scratch/b4fb31747e8d/watchnest-review/ci138-supplement-cold`. Younger and shared journeys passed execution. The older child successfully searched, saved the fox, and returned Home: the actual render shows the fox in a Favorites section with a filled heart. The home Favorites tile is clearly distinct from individual card hearts. My substring `/Favorites/` locator incorrectly included five card action names (`Add … to Favorites` / `Remove … from Favorites`), producing automation ambiguity rather than user-facing ambiguity. Corrected only this target to its observed exact accessible name `Favorites Your saved favorites`; kept the task and retrieval/request assertions unchanged. Pending complete rerun; no static pass inferred.

The younger return render visibly retains Benny's header and greeting. Shared-device parent boundary render visibly presents a separate Parent PIN modal. These observations support the recorded interaction results. Their synthetic fixture/artwork cannot validate physical touch behavior, real provider playback, production persistence, or real children.

### CI139 final completed interaction receipt and independent verdict

Candidate binding: PR head `c670d55a9bf22aa493f685fa62f79fda89151247`; CI event/source commit `34946674def9bc1ef7c844c8820bacc45bc857c6`, source tree `536c97e884065ac79338695d47bba7e2fc098c7f`, clean source worktree per `ci139-candidate/test-results/visual-evidence/candidate/768x1024/manifest.json`. This is a post-adapter/locator-correction completion review, not a new first-impression trial. Parent reports child application source unchanged from the original da6 candidate.

Independently read actual `test-results/browser-results.json`: all three fresh-child journeys passed at retry 0. Viewed six actual final PNGs: older favorite retrieved/request pending, younger player/return, shared wrong PIN/parent boundary. Evidence root: `/workspace/scratch/b4fb31747e8d/watchnest-review/ci139-candidate/test-results/`.

| Journey | Observed final outcome | Finding |
| --- | --- | --- |
| Younger child browse/open/return | Benny entered, library video link opened the player route; intentionally blocked provider infrastructure produced a safe failure screen with two explicit Back to Library actions; returning restored Benny's greeting and header. | Navigation and recovery pass. Successful playback and a real nonreader's image recognition were not tested. |
| Older child retrieve/save/request | Search narrowed to the fox; saving survived Home navigation; Favorites displayed one fox with a filled heart. Discover result changed to Waiting for Parent and appeared under My requests; no playable result link/iframe appeared. | Pass for the selected synthetic search/favorite/request loop. Pending state is understandable and distinct from library playback. |
| Shared device | Eli entry and switching completed; wrong Ari PIN produced a named dialog/error, correct PIN recovered; Parent Mode separately required a Parent PIN without entering parent routes. | Pass for rendered switching/error recovery/boundary affordance under synthetic auth responses. No claim of production authorization security. |

**Independent verdict: PASS, limited to these completed synthetic Chromium journeys at 768×1024 on the bound CI139 candidate.** No observed critical/major usability defect in the completed scope. Original minor hypotheses (tall hero/Hidden vocabulary) remain nonblocking, unvalidated concerns, not established defects. The generic placeholder thumbnails in this access fixture do not substantiate younger-child picture recognition or real-catalog visual quality. The forced provider failure substantiates visible recovery only.

No physical iPad, Safari/PWA, deployed hosted environment, genuine YouTube playback, provider imagery, production persistence, or observed human-child usability claim follows from this receipt. Earlier failed attempts remain above and were not rewritten as passes. No application files were changed by this reviewer.
