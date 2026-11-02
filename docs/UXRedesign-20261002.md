# Final closeout — exact production evidence

## Candidate

- Application commit: `dfa009cdebb181173108f8a6ab636ff2ab0d4771`
- Deployment: `dpl_J8apogrsymnFPYvPTvtT8kVrPv5Q`
- URL: https://watchnest-rho.vercel.app
- CI run 74: PASS
- Human-Eye / Stranger / security: PASS / PASS / PASS
- Founder playback: picture and sound played.

## Delivered recurring experience

- Shared-device launch resolves to the profile picker while the household session is valid.
- Kids: choose profile → optional PIN → Home / Library / Ask Parent.
- Parent Mode: separately protected; jobs organized as Dashboard, Children, Add Videos, Library, Collections, Inbox, Controls, Settings.
- Photos/avatars, four-digit child PINs, View as Child, Parent video preview, approved-only Favorites, Recently Added, non-MFK Continue Watching, channel/playlist discovery, multi-URL intake, duplicate intelligence, bulk collection work, access windows, and PWA launch support are live.
- Individual-video approval remains the authorization boundary; sibling assignment checks remain server-enforced.

## Opportunity classification

- **CORE NOW:** profile picker, protected Parent Mode, simplified Kids/Parent IA, Collections taxonomy, photos/avatars, four-digit PIN lifecycle, View as Child, duplicate/broken-content states, search, shared-device persistence.
- **HIGH-VALUE NOW:** approved-only Favorites, Recently Added, multi-URL intake, channel/playlist discovery, bulk collection assignment, schedule windows, PWA presentation.
- **LATER:** richer collection ordering and additional low-risk constrained personalization after observed family use.
- **REJECT:** open recommendations, auto-approving channels/playlists, social/gamified features, general parental-control expansion, and prohibited MFK telemetry reconstruction.

## Time-control limitation

Wall-clock access windows are enforceable without player telemetry. WatchNest intentionally does not claim exact daily watch-minute or per-Collection minute enforcement for Made-for-Kids or unknown-classification content because doing so would require reconstructing duration telemetry that this release prohibits.

# WatchNest recurring-family UX redesign — 2026-10-02

## Product decision

WatchNest is now two deliberately separate experiences on one secure backend:

- **WatchNest Kids:** open → choose profile → optional four-digit PIN → approved content.
- **WatchNest Parent:** intentionally enter protected Parent Mode → find, approve, organize, control and maintain.

The visual direction is **Warm Family Library + Premium Streaming Sophistication**: warm parchment, deep forest, restrained coral/yellow accents, large artwork, a governed rounded-stroke icon family, strong hierarchy and tablet-scale targets. It borrows interaction intelligence—not brand assets or visual identity—from current family streaming products.

## Research translated into decisions

- YouTube Kids' approved-content model and parent-gated settings support recognition-first profile selection and parent protection.
- Netflix's profile picker/profile locks support persistent household-device entry and profile-scoped locks.
- PBS KIDS reinforces artwork-led, direct content selection for younger audiences.
- Official YouTube Data API discovery supports video, channel and playlist search. Channel/playlist selection remains discovery only; every playable item still requires individual WatchNest approval.
- Official YouTube Made-for-Kids requirements prohibit using player data to build retained engagement tracking for restricted content. WatchNest therefore enforces access schedules from wall-clock authorization checks and does not pretend exact daily/collection watch-minute quotas are available.
- Current Supabase guidance supports a private bucket plus short-lived signed URLs. Child photos are server-uploaded, limited to JPG/PNG/WebP and 2 MB, never made public, and remain Parent-controlled.

## Information architecture

Kids navigation is **Home / Library / Ask Parent**. Shows and My Videos were removed as competing top-level concepts. Collections are the sole parent-controlled grouping concept. Home contains Continue Watching only where policy permits, Favorites, Collections and Recently Added. Library contains approved-only search, Favorites and Collections. There is no external recommendation surface.

Parent navigation is **Dashboard / Children / Add Videos / Library / Collections / Inbox / Controls / Settings**. Assignment and profile-identity implementation language no longer appears in routine navigation. Parent Library retains an obvious individual Preview; Children adds true **View as [child]** for the whole child experience.

## Opportunity classification

| Decision | Classification | Release treatment |
|---|---|---|
| Shared-device profile picker, persistent household session, protected Parent Mode | CORE NOW | Implemented |
| One adaptive child experience; remove Simple/Standard setting | CORE NOW | Implemented; compatibility column retained but normalized |
| Collections as the single grouping concept | CORE NOW | Implemented |
| Four-digit optional child PIN, set/change/reset/disable, server enforcement | CORE NOW | Implemented |
| Private Parent photo upload + curated avatar fallback | CORE NOW | Implemented |
| Home / Library / Ask Parent, Recently Added, approved-only search | CORE NOW | Implemented |
| View as Child and individual Parent Preview | CORE NOW | Implemented |
| Child Favorites restricted to assigned approved videos | HIGH-VALUE NOW | Implemented |
| Channel/playlist discovery with individual video approval | HIGH-VALUE NOW | Implemented |
| Multi-URL intake, duplicate state and collection-to-many-child assignment | HIGH-VALUE NOW | Implemented |
| Schedule windows | HIGH-VALUE NOW | Implemented as wall-clock authorization, including active-player rechecks |
| PWA standalone launch/profile-picker start | HIGH-VALUE NOW | Implemented with existing icon set |
| Automatic broken-content maintenance | HIGH-VALUE NOW | Existing bounded metadata maintenance plus Parent recheck/Inbox health preserved |
| Exact overall and Collection daily watch-minute budgets | LATER | Deferred: cannot be honestly enforced across Made-for-Kids content without prohibited/unsafe player telemetry or an unvalidated non-retained foreground-time architecture |
| Typo-tolerant search, full bulk archive/move, preferred Collection ordering | LATER | Useful at larger library scale; not worth destabilizing this release |
| Voice requests and child-selectable themes | LATER | Added complexity/privacy surface does not yet beat typed request + avatar value |
| Social, recommendations, gamification, generalized analytics | REJECT | Outside WatchNest's core jobs and safety model |

## Migration and rollback

Hosted migration `20261002035922_household_device_ux` is additive. It adds device/Parent Mode sessions, Favorites, private photo metadata/storage and schedule fields. Hosted readback after migration preserved one Parent, four profiles, 35 videos, five assignments and one Collection. It created no device, Parent Mode or Favorite records on its own. The previous production deployment remains the application rollback target; new additive tables/columns may remain inert under that version. Removing the schema is not required for application rollback and would be destructive.

## Continuous-learning correction

Root defect: technical qualification and spec-aware review verified routes, security and copy in isolation but did not perform a cold recurring-use pass that counted every mandatory step or challenged internal nouns. Working screens were mistaken for an obvious product.

Project correction: the new E2E suite begins at the shared-device recurring entry and fails if marketing, family-code selection, intermediate child landings or unprotected Parent entry return.

Reusable app-review proposal: before reading implementation taxonomy, a cold reviewer must execute the two most frequent recurring jobs, count required decisions/taps, and flag every noun that describes the architecture rather than the user's job. This belongs in app/Product UX acceptance, not as a universal visual-brand rule.

## Acceptance state

Local typecheck, lint, 170 tests, production build and 11 browser tests pass. Hosted schema verification passes. Deployment, exact-candidate production traversal, current Human-Eye, independent Stranger/security rereview and durable Notion/GitHub closeout remain required before Founder Ready.
