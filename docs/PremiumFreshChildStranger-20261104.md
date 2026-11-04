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
