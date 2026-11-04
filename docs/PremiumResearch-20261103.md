# WatchNest premium product research

Research workstream started 2026-11-03; bounded user-frustration supplement completed 2026-11-04. This is project-specific product intelligence, not independent acceptance of the final implementation. No competitor accounts, authenticated sessions, paid services, or physical devices were used. Official documentation and published first-hand reports were read; competitors were not interactively tested.

## Direction and transfer rules

**The family's own screening room:** warm ivory canvas, evergreen navigation and primary actions, restrained amber, generous typography, personal profile tiles, and real approved-video artwork. Streaming sophistication should make the family's library easier to recognize and browse. It should not introduce autoplay promotion, attention-maximizing ranking, unrelated catalog content, or opaque personalization.

Transfer methods and interaction principles, not another product's brand, layout, exact measurements, assets, or platform-specific remote-control behavior. WatchNest's individual-video authorization, mandatory Safe Playback, sibling separation, protected Parent Mode, timer acknowledgements, and existing player lifecycle remain authoritative.

## Official interface evidence

| Source | Observed documented pattern | WatchNest application |
|---|---|---|
| [Netflix new TV experience guide](https://www.netflix.com/tudum/articles/netflix-new-homepage-layout-user-guide), published May 19, 2025; read Nov 4, 2026 | Top navigation and a personal My Netflix hub bring saved titles and relevant context together. This describes a TV rollout, not every device's current interface. | Keep a small set of visible destinations and meaningful personal library shelves. Do not import engagement ranking or viewing telemetry. |
| [Netflix My List help](https://help.netflix.com/en/node/10523), read Nov 4, 2026 | Mobile/tablet saved-list entry, explicit add/remove, and list filtering/sorting support intentional retrieval. Help distinguishes TV menus on top or left. | Separate Favorite from primary Play; provide an actual browsable library with search, filters and deterministic Newest/A–Z sorting. |
| [Apple TV navigation on iPhone/iPad](https://support.apple.com/en-mide/guide/tvapp/atvb5e608b5e/web), search result checked Nov 4, 2026 | iPad documentation names Search, Home, Library and service/category destinations. Direct page retrieval was rate-limited; only the navigation claim is used. | Keep Home and Library distinct; make search visible within the family's actual library. Do not reproduce Apple's commerce/service destinations. |
| [YouTube Kids parent information](https://support.google.com/youtubekids/answer/6130561?hl=en), read Nov 4, 2026 | Separate child profiles; approved-only disables child search and limits recommendations to approved content. | Show identity clearly. Distinguish approved-library search from Discover/Ask Parent; requests must never look playable before authorization. WatchNest can make approved items searchable without widening the playback boundary. |

## Bounded first-hand frustration evidence

These are anecdotal reports from self-selected users, not representative surveys, verified competitor defects, or prevalence estimates. Reports were retrieved during the Nov 4, 2026 research supplement. Device and version differences matter. The subset is intentionally small and selected to test the already chosen WatchNest direction, not generate a new scope backlog.

| Published report and date | What users actually reported | Transferable principle and mapping to implemented direction |
|---|---|---|
| [Netflix new-layout discussion](https://www.reddit.com/r/netflix/comments/1qgmuur/netflix_new_layout_sucks/), Jan 18, 2026 (date returned by search; opened thread displays relative age) | The author found navigation harder. Commenters described fewer, larger visible titles and difficulty reaching categories while browsing. Other commenters explained the remote Back shortcut. | Discoverability matters even when a shortcut exists. WatchNest uses labelled persistent destinations and ordinary multi-card browsing rather than a screen-filling promotional feed. Validate that sticky navigation remains reachable and does not obscure cards at touch sizes. This is a review criterion, not a claim of current browser PASS. |
| [Apple TV library report](https://www.reddit.com/r/iTunesMovieDeals/comments/1q99fji/the_tv_library_on_ios26_is_truly_terrible/), Jan 10, 2026 (date returned by search; thread opened) | An iPhone owner reported inconsistent poster framing and an item appearing first despite A–Z order. Comments asked for filters and sorting. | Consistent artwork treatment and predictable retrieval contribute to trust. WatchNest's shared video cards, Newest/A–Z choices and distinct Library destination align. Responsive artwork consistency and actual sort behavior remain functional/visual QA responsibilities. The source does not establish an iPad defect. |
| [YouTube Kids approved-content parent report](https://www.reddit.com/r/Parenting/comments/1py2io1/youtube_kids_approved_content_only_help/), retrieved Nov 4, 2026; page displays approximately ten months ago, exact publication date not verified | A parent using a living-room TV could not find a desired approved yoga channel among the presented recommendations and wanted search limited to approved items. One reply described creating separate profiles by topic as a workaround. | An approved library must remain retrievable as it grows. WatchNest keeps local approved-library search and Collections separate from identity; no topic-profile workaround is needed. Discover remains a request workflow, not a substitute for approved retrieval. |

The Netflix report also contains autoplay frustration, but no player change follows from it: preserving WatchNest's existing player and explicit activation is a constraint. No cross-device resume or new behavioral telemetry is authorized by this research.

## Decisions applied to the existing implementation

Source receipts reviewed: `PremiumChildImplementation-20261103.md` and `PremiumParentImplementation-20261103.md`.

- Child navigation: Home, Library, Discover/Ask Parent; recognizable identity and profile switch. Home shelves reflect actual assigned content. Library offers clear search, Favorites, Collections, Newest/A–Z and useful empty states.
- Cards: artwork is the primary play target; Favorite remains separate; Hide moves to a secondary disclosure with undo/restore. Request cards communicate Requested/Added states without a false Play affordance.
- Parent navigation: Overview, Library, Requests, Family, with persistent Add videos. Existing routes remain under the simpler shell. Related child/session controls are grouped without fabricating live status on Overview.
- Intake: Search YouTube and Paste video links are explicit modes. Channels/playlists remain available; selected count and assignment/approval area make the next action concrete.
- Collections/profile administration: progressively disclose sharing and photo editing so primary editing/protection actions remain findable. Keep child-specific choices isolated.
- Remote timer: End now must remain prominent, but sent/confirmed/offline states must remain truthful. This research provides no evidence that sending a command means a device has stopped.
- Visual system: warm ivory/evergreen/amber, consistent icons and typography, shared controls, calm empty/error/Time's Up states. Minimum touch targets and focus/contrast/reduced-motion behavior belong to exact-candidate QA.

## Qualification boundary

This research supports product decisions, not acceptance evidence. It does not certify deployed-browser behavior, physical-iPad playback, containment, native fullscreen, remote stopping, accessibility compliance, Human-Eye quality, Stranger Test, or final production readiness. Bind those results to the frozen release candidate and preserve the outstanding physical-device gates. No new code scope was introduced by the supplement.
