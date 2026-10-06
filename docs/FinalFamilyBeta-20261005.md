# Final family beta implementation — updated 2026-10-06

## Candidate scope

This run resumes the qualified `product-completion-20260930` implementation at
`7da6d0ba0f9c96b8c195723cc5f9a758aed867ec`. It does not restart the product or
replace the working authentication, individual approval, sibling isolation,
Made-for-Kids suppression, profile-picker, Parent Mode, playback, or PWA spine.

The device-protection/immersive-playback successor is deployed as commit
`c01979cac34bd713b4db0eeb9b7f3f9a1e32e8de`, tree
`9f1ef6a38b95d13738cc8bf814066ed5839f3871`, production deployment
`dpl_96bDGJEnZqSn2tdKR1Sfc7fpAWQ7`.

The project-specific controlling decision is that WatchNest may enforce
Founder-authorized external-navigation containment. The private authorization
evidence is neither requested nor stored. This decision is not generalized to
other YouTube API clients.

## Requirement disposition

| Area                                                                     | State on this candidate                                                                                                                                                       |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Trusted-device profile picker, direct child entry, protected Parent Mode | DONE / preserved                                                                                                                                                              |
| Four-digit child and Parent entry                                        | DONE; fourth digit submits, concise retry, server rate limits remain                                                                                                          |
| Safe Playback                                                            | DONE; default on, Parent-only toggle, sandbox attached before direct/API iframe navigation                                                                                    |
| Device protection levels                                                 | DONE; Safe Playback recommended, Enhanced YouTube protection honestly limited, optional Dedicated WatchNest Device instructions, and browser setup check                      |
| Immediate / immersive playback                                           | DONE where permitted; non-MFK autoplay attempt, MFK-safe one Play action, best-effort true fullscreen from the original tap, and full-viewport fallback                       |
| Photo/avatar                                                             | DONE; private storage, browser-side orientation-aware crop/compression, FaceDetector focus when available, manual x/y crop, 25 MB source allowance                            |
| Home / Library / Ask Parent; Collections; Favorites; Recently Added      | DONE / preserved                                                                                                                                                              |
| Child Hide / Restore / Undo                                              | DONE; profile-specific and never revokes approval or affects siblings                                                                                                         |
| Search                                                                   | DONE; 24-video initial search, official next-page tokens, up to 50 source items, Load More, cache per page                                                                    |
| Channel and playlist browse                                              | DONE / repaired through official endpoints; videos remain individually selected                                                                                               |
| Shorts                                                                   | PARTIAL by platform signal: explicit Shorts URLs rejected; search results are not misclassified from duration alone because the Data API exposes no authoritative Shorts flag |
| URL intake                                                               | DONE; multi-link paste resolves automatically, clears after approval, refocuses for the next batch                                                                            |
| Inline Collection creation                                               | DONE                                                                                                                                                                          |
| Duplicate intelligence / compact approval state                          | DONE / preserved                                                                                                                                                              |
| Bulk Parent work                                                         | DONE for assignment, Collection addition, and removal; individual approval boundary remains                                                                                   |
| View as Child                                                            | DONE / preserved                                                                                                                                                              |
| Broken-video maintenance                                                 | DONE / preserved; metadata refresh and Parent attention surface                                                                                                               |
| Schedule windows                                                         | DONE / preserved                                                                                                                                                              |
| Exact daily/Collection minute budgets                                    | PLATFORM-LIMITED; not implemented for MFK/unknown players because WatchNest does not reconstruct prohibited playback telemetry                                                |
| Controlled child discovery zones                                         | LATER; no unrestricted discovery was introduced                                                                                                                               |
| Add-to-WatchNest shortcut                                                | HIGH-VALUE FLOW DONE: `?url=` intake, Share/Copy Link plus automatic paste queue. A browser extension/native share sheet remains later so it cannot destabilize beta          |
| YouTube Kids migration                                                   | PLATFORM-LIMITED; no official Kids approved-content import API was identified. Assisted multi-link migration is provided without scraping                                     |
| Premium / ads                                                            | PLATFORM-LIMITED; WatchNest has no official entitlement signal or transfer mechanism and does not promise ad-free embeds                                                      |
| Volume                                                                   | DONE where supported: IFrame API sessions start at 60%, browser preference persists, iPad system controls remain authoritative where the embed ignores API volume             |
| Offline / Travel                                                         | PLATFORM-LIMITED; Premium downloads remain in YouTube surfaces. WatchNest does not download, proxy, copy, or cache ordinary YouTube media                                     |

## Safe Playback implementation contract

When `parents.safe_playback_enabled` is true, the child player response carries
that server-owned setting. Both direct and IFrame API playback create the
official YouTube iframe with:

`sandbox="allow-scripts allow-same-origin allow-presentation"`

No popup or top-navigation permission is granted. The iframe keeps scripts,
same-origin access needed by the provider, presentation/fullscreen, native
controls, and the normal rendered player. Children cannot change the setting.
Parent preview is intentionally not contained so a Parent can inspect the
provider result independently.

Acceptance must verify actual playback and attempted logo/title/channel/end
surface navigation on the exact deployment. Static presence of the sandbox is
not promoted to real-device audiovisual evidence.

The 2026-10-06 device amendment adds three Parent-facing choices: Safe Playback
as the recommended baseline, an honestly limited enhanced-YouTube option, and
an optional dedicated WatchNest iPad setup. Fullscreen/immersive presentation is
separate from containment. The child card tap requests true fullscreen where
the browser permits it; the player route is always a full-viewport WatchNest
fallback. Eligible non-MFK videos request audible immediate playback. MFK and
unknown-status videos retain one native Play tap because official autoplay
documentation describes page-load playback-data collection and the MFK guide
requires tracking to be disabled.

## Security and privacy

- `profile_hidden_videos` is RLS-enabled, revoked from `anon` and
  `authenticated`, and service-role-only like the existing child product
  tables.
- Safe Playback is independent of assignment/player authorization. Turning it
  off never expands a child library or changes sibling isolation.
- Child photos are compressed and cropped locally before upload to the existing
  private bucket; only short-lived signed reads remain.
- No password, PIN, Premium account, private authorization evidence, or raw
  device restriction state is logged or added to source.

## Continuous-learning capture

Existential third-party constraints must be escalated before expensive visual
or feature completion. Separately, recurring family use should be evaluated as
an appliance flow: open, recognize a profile, optionally enter a PIN, and use
content. Architecture, setup taxonomy, and rare controls belong behind Parent
Mode and progressive disclosure. Near-zero Parent maintenance and bounded child
autonomy are product acceptance criteria, not polish.
