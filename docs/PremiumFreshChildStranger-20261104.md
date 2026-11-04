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
