# WatchNest product research and platform constraints

Research date: 2026-09-30. This is build decision support, not live-player or device certification.

## Research method and coverage

The requested Firecrawl skill was read and used. Four independent Firecrawl search requests returned HTTP 402 (connected account low credits). Research continued through available web search and official-page retrieval without purchasing credits. Product coverage: YouTube Kids, Netflix profiles/playback preferences, Plex Home/collections, PBS KIDS Video, Khan Academy Kids, Qustodio, and a current channel-approval competitor. Review coverage is a small qualitative sample, not a statistical review audit. Technical claims below rely on Google/YouTube primary documentation. Failed or partial page retrievals are identified.

## Why this family would keep using WatchNest

The differentiated job is an individually approved library that remains findable as it grows, with actual sibling isolation and a parent workflow that takes minutes rather than constant maintenance. Approval by itself is already offered elsewhere. The product should feel like the children's own calm media shelf, not a reduced discovery feed.

### Evidence and implication

| Product / evidence | What it establishes | WatchNest decision |
| --- | --- | --- |
| YouTube Kids official profile and controls docs [1–3] | Approved-only accepts videos, channels, collections; child search is unavailable. Its approved-only home has one approved category. | Individual approval plus local Search My Videos and parent-created Shows/Collections are central value. |
| App Store YouTube Kids review sample [4] | December 2024 reviewer specifically requests search within approved content because scrolling is burdensome. Other sampled complaints include slow loading and difficulty finding parent subscriptions. These are anecdotes, not prevalence estimates. | Keep visible loading/retry states; provide searchable parent management and searchable child libraries. |
| YouTube Families community search excerpts [5–6] | Reports describe approved shelves not showing all approved content. Full threads were not retrievable, so these remain unverified reports. | Never silently truncate the approved library; test hundreds of entries and explicit pagination/load-more. |
| Plex Home and managed-user docs [7–8] | Household profiles and fast switching are useful. Plex explicitly calls its PIN a convenience, not true security. | Borrow the household mental model but implement real server authorization for every child request. |
| Plex collections docs [9–10] | Collections and owner-published shelves organize personal media. | Use WatchNest-owned collection membership; membership never grants approval implicitly. |
| Netflix parental-control/playback docs [11–13] | Per-profile restrictions, profile locks, viewing history, and autoplay preferences are established patterns. | Separate parent authentication; explicit child identity; calm static cards; user-controlled Next Up. |
| PBS KIDS Video official product page [14] | Show-based, preschool-oriented curated video experience. | Simple mode uses large show artwork and fewer routes while standard mode expands approved-library navigation. |
| Khan Academy Kids profile/parent controls [15–16] | Parent-owned account, multiple child avatars, and a protected adult area support shared-device use. | Children do not need email addresses; constrained avatar choices and one clear parent entry. A gesture or math gate alone is insufficient for protected parent data. |
| Qustodio official YouTube monitoring [17] | Device monitoring and app time controls address a wider device-level job; full YouTube access is allowed by default. | WatchNest controls its own navigation/library and should not claim device-wide restrictions or replace OS parental controls. |
| YouApprove App Store developer description [18] | Approved channels, child profiles, and familiar tablet navigation already exist commercially. Claims were not independently tested. | Do not claim category novelty. Individual-video boundaries, findability, parent maintenance, and real sibling isolation define this implementation. |

## Autonomous portfolio decision

These are product-team choices inferred from evidence and the locked Founder instruction, not recommendations to ask the Founder to rank.

| Classification | Include / preserve | Reason |
| --- | --- | --- |
| CORE NOW | Parent auth, household, four exact child identities, optional individual child credential, server-enforced assignments, real metadata and approval, assigned-only local search, playback authorization, safe failure states, Simple/Standard experience. | Establishes the core family job and confidentiality boundary. |
| CORE NOW | Shows/Collections, Recently Added, All Videos, empty-search Ask Parent, one Parent Inbox, clear unavailable states. | A large library must remain findable and maintainable. |
| CORE NOW, policy constrained | Continue Watching, progress, watch analytics for eligible videos only; explicit exclusions and honest coverage. | Founder requested these; platform tracking constraints below take precedence over unsupported claims. |
| HIGH-VALUE NOW | Paste multiple URLs, per-video preview, multi-child assignment, duplicate detection, parent bulk reassignment/removal, View as Child, title/creator/collection matching. | Reduces recurring parent labor without changing approval unit. |
| HIGH-VALUE NOW | Availability/metadata checks on approval and maintenance; concise attention queue; parent reset of child credentials and explicit sign-out. | Handles the realistic upkeep and shared-device lifecycle. |
| LATER | Advanced tagging UI, scheduling/session budgets, richer parent organization, voice request input, native apps, TV/casting support. | Preserve intent; do not delay reliable tablet/private-family use. |
| REJECT | Automatic channel/future-upload approval; unrestricted child YouTube results; endless feeds; engagement badges; hidden player controls; video downloads/proxy playback; inferred education/behavior scores. | Weakens locked approval, increases complexity, or conflicts with platform constraints. |

## Official YouTube constraints and implementation consequences

### Player surfaces: documentation verified, runtime unobserved

The current player parameters documentation [19] says `rel=0` restricts related videos to the same channel; it does **not** disable them. `modestbranding` is deprecated and ineffective. `playsinline=1` requests inline iOS playback. Player minimum is 200×200; documentation recommends 480×270 for a 16:9 player with controls. No documented parameter found that guarantees removal of pause recommendations, branding links, player menus, end-screen links, external app navigation, or all native PiP controls.

Required Minimum Functionality [20] forbids overlays or visual elements over any portion of a player and changes not explicitly documented. Embedded playback must identify the client through HTTP Referer or an equivalent documented mechanism. The iframe API [21] reports error 153 when identification is absent. Use the real application origin, retain a permitted referrer policy, and test production. Do not deploy no-referrer globally expecting embeds to work. The same reference provides errors 100 for removed/private content, 101/150 for embed restrictions, and `onAutoplayBlocked` for rejected scripted playback.

Build consequence: visible official player, no click-catching masks, no concealment of logo/links/ads, no background player. Next Up is a WatchNest list of newly authorized assigned videos, not a YouTube recommendation source. Keep Back to Library outside the iframe. An app-owned finished state can replace a destroyed player after a documented end event; it must not overlay required controls or be represented as eliminating all transient YouTube end surfaces. Test this behavior before accepting it.

### Privacy, MFK, metadata, and child-directed notice

Developer Policies [22] require per-embed Made For Kids checks, disabled tracking for MFK players, privacy/terms disclosures, child-directed notification, no personalized ads, no YouTube write actions by child-directed clients, metadata refresh/deletion within 30 days, and no interference with links, ads, or branding. The policy does not document a parent-consent or local-progress exception to its MFK tracking instruction. Additional derived-metric allowances require explicit audited permission; do not assume WatchNest has it.

The dedicated MFK guide [23], updated 2026-09-14, says to request `id,status` through `videos.list` and inspect `status.madeForKids`. It repeats the tracking/data-collection obligation. **Interpretation for this build:** unknown/stale status fails closed for telemetry; MFK suppresses per-child playback analytics and stored resume progress. This is conservative engineering judgment, not a published ruling specifically naming resume bookmarks. General child-directed section does not literally prohibit every first-party family metric. Any future exception requires explicit authoritative clarification, not assumption.

Keep assignment, parent organization, requests, and essential security records separate from playback telemetry. Do not invent watched/completed/never-watched conclusions for excluded videos. Dashboard should say that coverage excludes MFK/unknown videos. Analytics based on own app activity must be clearly labeled WatchNest estimates, not YouTube Analytics. Do not derive creator quality/suitability scores or global YouTube metrics. Collect only the minimum data necessary for this private-family purpose; make family data deletion and parent access understandable.

Privacy-enhanced `youtube-nocookie.com` embeds [24] prevent embedded views from personalizing subsequent YouTube browsing and use non-personalized ads if served. They do not replace child-directed designation or promise no network/device data. Default playback begins on child action; privacy acceptance and player-data disclosure belong in parent onboarding. Do not promise ad-free playback.

Child-directed website designation [25–26] requires adding/verifying the production site in Search Console, then following the official Tag For Child Directed Treatment action. Whole domains/subdomains/directories can be tagged; effects can take time. This Google account action must be completed or explicitly recorded as pending before claiming policy-ready family rollout. No documented iframe parameter was found as a substitute. Direct tagging-page retrieval failed, so this research did not complete or verify the action.

### Parent ingestion and quota

Use `search.list` with `type=video`, `safeSearch=strict`, and embeddable filtering [27]. Strict search is a preliminary filter, not an approval decision or child-safety certification. Current official page states **100 search calls/day and 1 unit in the Search Queries quota bucket**; verify actual project quotas rather than reusing the old 100-unit assumption. Server rate limits, small pages, caching, duplicate detection, and URL paste reduce search consumption. Use nextPageToken rather than estimated total-results pagination.

Use `videos.list` [28] to resolve URL IDs in batches and retrieve actual metadata/status. The video resource docs [29] warn that `status.embeddable=true` is insufficient to guarantee playback: platform restrictions or third-party claims may still block it. Parent preview and player error handling remain necessary. Metadata expiry must block presenting stale YouTube data if refresh cannot succeed; retained WatchNest assignments may remain as unavailable records without stale API fields. Never scrape YouTube for metadata when quota fails.

## Parent insight design and integrity decisions

Dashboard hierarchy: today/recent watch estimates by child (eligible tracked videos), recent eligible viewing, requests needing action, and unavailable content. Secondary detail: most watched within WatchNest, collection totals, and activity trend for a short recent period. Library maintenance can always show assigned count and unavailable count, because those are inventory/health facts, not inferred watch history.

Own measurement design: count wall-clock deltas only while the visible authorized player reports PLAYING; do not count buffering/pauses or seek jumps as watched time. Bound intervals, debounce checkpoints, validate child/video/session server-side, and prevent duplicate retry credits. Completion should use a real end event; a resumed position alone is not proof of full viewing. Revoke assignment before the next authorization/progress request succeeds. Client events are estimates, not tamper-proof evidence of attention. Do not label simultaneous sessions as exact child screen time; either avoid overlaps or disclose deduplication.

If MFK/unknown policy gating means a requested metric cannot be truthful, show exclusion rather than zeros suggesting no viewing. Security logging must avoid credentials and unnecessary child content/activity details. Use fixed retention for event detail and provide parent delete/reset controls; do not accumulate indefinite child surveillance.

## Tablet and shared-device acceptance plan

All entries below are **NOT YET OBSERVED** in actual iPad Safari. Chromium responsive testing proves layout in that browser only. Record device, iPadOS/Safari version, orientation, account state, video IDs/MFK status, timestamp, exact action, and fresh screen evidence for each run.

1. Parent sign-in and approval on desktop/tablet. Keyboard never covers important actions; errors remain actionable. Child cannot reuse leftover parent session after entering child mode.
2. Child login for each exact profile; wrong passcode, change profile, Back, reload, expired session, direct sibling video route/API ID, and cross-family IDs. Parent Mode requires protected reauthentication.
3. Portrait/landscape library at zero, one, and hundreds of assigned entries. Search matches assigned title/creator/collection only; no-result Ask Parent retains request context. Large artwork/targets in Simple mode; Standard mode remains readable without tiny horizontal shelves.
4. Tap play, pause, seek, captions, fullscreen, rotate, native PiP if offered, return from fullscreen/PiP, Safari chrome changes, app background/foreground. Label external links/menus/recommendations actually visible and reachable; do not infer containment from layout alone.
5. Let video end; inspect transient YouTube end screen and WatchNest replacement behavior; tap Next Up; test autoplay denial and clear manual Play fallback. Return to library without confusing reloads.
6. Approved eligible video resume/checkpoint with network interruption; verify parent estimates. MFK and unknown status produce no stored playback tracking. Never count an unapproved player-recommended video as an authorized app event.
7. Parent revokes video while child is watching; observe time until child controlled playback stops at authorization recheck, handling of retries/fullscreen, and stale library state.
8. Invalid ID, private/deleted, embedding disabled, regional/age restriction, offline, API quota/DB outage. Remain inside a clear app error and approved-library return flow; never use unrestricted YouTube as fallback.

No real-device PASS or observed containment is asserted by this document. Real iPad action is a Founder-supplied certification step already accepted in preflight.

## Sources

1. https://support.google.com/youtubekids/answer/7554914?hl=en
2. https://support.google.com/youtubekids/answer/6172308?co=GENIE.Platform%3DAndroid&hl=en
3. https://support.google.com/youtubekids/answer/6130561?hl=en
4. https://apps.apple.com/za/app/youtube-kids/id936971630?platform=ipad&see-all=reviews (sampled review dates 2022–2025)
5. https://support.google.com/youtubekids/thread/417617615/approved-for-you-section-only-shows-6-channels-max?hl=en (search excerpt only)
6. https://support.google.com/youtubekids/thread/202272435/approved-content-only-only-20-videos-showing-up?hl=en (search excerpt only)
7. https://support.plex.tv/articles/203815766-what-is-plex-home/
8. https://support.plex.tv/articles/203948776-managed-users/
9. https://support.plex.tv/articles/201273953-collections/ (search excerpt; direct retrieval failed)
10. https://support.plex.tv/articles/publishing-collections/
11. https://help.netflix.com/en/node/264
12. https://help.netflix.com/en/node/2102
13. https://help.netflix.com/en/node/121518
14. https://pbskids.org/apps/pbs-kids-video
15. https://khankids.zendesk.com/hc/en-us/articles/360006537272-How-do-I-set-up-an-account
16. https://khankids.zendesk.com/hc/en-us/articles/360047566151-How-do-I-access-parental-controls
17. https://help.qustodio.com/hc/en-us/articles/360005219438-What-is-YouTube-Monitoring-and-what-does-it-do
18. https://apps.apple.com/ca/app/youapprove-youtube-channels/id6748365901?platform=vision (developer marketing, not independent acceptance)
19. https://developers.google.com/youtube/player_parameters
20. https://developers.google.com/youtube/terms/required-minimum-functionality
21. https://developers.google.com/youtube/iframe_api_reference
22. https://developers.google.com/youtube/terms/developer-policies
23. https://developers.google.com/youtube/v3/guides/made_for_kids_status
24. https://support.google.com/youtube/answer/171780?hl=en
25. https://support.google.com/policies/answer/9664901
26. https://support.google.com/webmasters/answer/3221080?hl=en
27. https://developers.google.com/youtube/v3/docs/search/list
28. https://developers.google.com/youtube/v3/docs/videos/list
29. https://developers.google.com/youtube/v3/docs/videos
