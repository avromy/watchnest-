# Completion run implementation contract — 2026-09-30

This is a continuation from fdb0de994e81b81e92b596332d3fcfc68eb53334. Founder locks: Miri, Ari, Benny, Eli. Parent email Avromy@gmail.com. Infrastructure: avromy's Org / Avromy Vercel confirmed; no new costs approved. Google Cloud unavailable; no YouTube key confirmed.

## API contract
All endpoints JSON, mutations same-origin only; API response `{error: string}` on failure. No production mock fallback. Parent auth Supabase Auth with secure httpOnly cookies; child independent opaque hashed DB sessions and scrypt passcode hashes. All privileged actions enforce authenticated parent ownership and all child actions derive profile identity from server session. Family = parent household for initial beta; children cannot use parent token or choose session identity. Child profile IDs never authorize access by themselves.

Shared types in `src/types/product.ts` (backend owns file):
Profile: id, display_name, avatar_key, color_key, experience_mode ('simple'|'standard'), pin_enabled.
LibraryVideo: id, youtube_video_id, title, channel_title, thumbnail_url, duration_seconds, tags (string[]), added_at?, progress? {current_time_seconds, duration_seconds, completed_at, updated_at}, collections? {id,title}[].
Collection: id,title,description?,video_ids:string[].
Request: id,profile_id,display_name?,kind ('video'|'show'|'creator'|'topic'),message,status ('pending'|'resolved'|'dismissed'),created_at.

GET /api/session -> {role:'parent'|'child'|null,profile?:Profile,parent?:{email:string},configured:boolean}
POST /api/auth/parent {email,password,action:'login'|'signup'|'reset'} -> {ok,message?}; parent setup creates locked profiles; signup only FOUNDER_EMAIL (defaults Avromy@gmail.com); no arbitrary open signup.
POST /api/auth/logout {} clears both sessions.
GET /api/auth/children?family=publicHouseholdCode -> {profiles:Profile[]} (no library); parent obtains code through dashboard.
POST /api/auth/child {family,profileId,passcode} -> {profile:Profile}; a PIN-off profile opens directly from the private family link, while a PIN-on profile requires its 6–12 digit PIN. The issued opaque session is bound to that exact profile. Existing child sessions never authorize a different profile, and every child library/player operation derives identity and assignments server-side.
GET /api/parent/dashboard -> {profiles, videos:LibraryVideo[],collections:Collection[],requests:Request[], familyCode:string, analytics:{todaySeconds:number,weekSeconds:number,byChild:{profile_id,display_name,todaySeconds,weekSeconds,recent:LibraryVideo[]}[],popular:{title,seconds}[],daily:{date,seconds}[],neverWatched:number},attention:{id,title,detail}[]}
GET/POST/PATCH /api/parent/profiles; POST {display_name,experience_mode,avatar_key,color_key}; PATCH {id,...,passcode?,pin_enabled?}. Profile creation preserves four locked names.
POST /api/parent/videos/lookup {urls:string[]} -> {videos:LibraryVideo[],errors:{url,error}[]}
GET /api/parent/videos/search?q= -> {videos:LibraryVideo[]}
POST /api/parent/videos {youtube_video_ids:string[],profile_ids:string[],collection_id?:string,tags?:string[]} -> {ok}
PATCH /api/parent/videos {video_id,profile_ids:string[],tags?:string[]} -> {ok}; exact replacement of assignments for own family.
DELETE /api/parent/videos {video_id} -> {ok}; revoke own family's assignments only.
GET/POST/PATCH /api/parent/collections -> {collections} or {ok,collection?}; POST {title,description?,video_ids:string[]}; PATCH {id,title?,description?,video_ids?}; all IDs scoped to household approvals.
PATCH /api/parent/requests {id,status:'resolved'|'dismissed'} -> {ok}
POST /api/parent/videos/check -> {ok,checked:number} metadata availability refresh only own approved videos.
GET /api/child/library -> {profile:Profile,videos:LibraryVideo[],collections:Collection[]}
POST /api/child/requests {kind,message} -> {ok}; no YouTube results.
GET /api/child/player?videoId= -> {profile,video:LibraryVideo,next:LibraryVideo|null}; assignment required, own identity derived.
POST /api/child/progress {videoId,currentTimeSeconds,durationSeconds,watchedSeconds,completed:boolean} -> {ok}; server validates/clamps time, increments credible viewing events; no client arbitrary profile IDs, revoked assignment denied.

## Routes / file ownership
Backend: src/app/api/**, src/lib/server/product*, src/types/product.ts, supabase/migrations/**. No package edits without root coordination.
Parent UI: src/app/parent/**, src/components/parent/**; uses contract APIs.
Child UI: src/app/watch/**, src/components/child/**; uses contract APIs. Login root /watch?family=code, player /watch/player/[videoId], home /watch/home. Remove or redirect legacy profile-ID pages without leaking their data. Own child credential login UI under /watch.
Root: dependencies/config, shared design CSS/layout, root login/landing, research, CI, cross-cutting security/QA, infrastructure.

## Visual system
Warm ivory #F8F7F2 background, forest #193F35 primary, ink #19332C text, muted #5D6C64, mint #E0EEE5, yellow #F4CD6E, coral #D87358. Clean sans system font, 24px rounded cards, 48px+ controls, calm typography, restrained accents. Parent nav: Overview, Library, Add videos, Collections, Children, Inbox. Child nav: Home, My Videos, Shows, Ask Parent (simple mode fewer primary choices). No infinite feeds. Brand WatchNest, nest/leaf mark can be simple SVG. Components CSS classes root provides in globals.css: shell, topbar, brand, nav, page-heading, eyebrow, panel, button, button-secondary, button-quiet, field, form-row, grid, grid-2, grid-3, video-grid, video-card, badge, muted, notice, error, empty, avatar, stats, stat, section-heading, progress-track. Agents may add scoped styles in owned components if necessary.
