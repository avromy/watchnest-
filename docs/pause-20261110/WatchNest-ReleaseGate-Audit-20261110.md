# WatchNest resumed release-gate audit — November 10, 2026

Read-only audit. No source, database, family records, secrets, environment targets,
aliases or deployment settings changed. Root remains the sole release owner.

## Authority actually applied

- Current WatchNest CTO Handoff fetched; last changed November4. It preserves
  premium app c670d55a9bf22aa493f685fa62f79fda89151247 and durable evidence
  39ab79fe808bcac4f5eb343156d7f84c60fc7a00; real-device gates are explicitly open.
- Supabase current cloud skill0.1.2 read; security checklist applied to read-only
  aggregate/constraint/migration checks. Current changelog opened: November4 CLIv3
  local-default/hosted-confirmation change does not affect these MCP SELECT calls;
  no CLI/schema implementation performed.
- Current Vercel deployments-cicd cloud skill read; intended project/environment
  binding, no preview promotion, stage/test/promote workflow and secret handling
  applied. Current official CLI and secret-variable docs opened.

## Live database truth

Project ysukwpeowpcixdzkexky:

- Migration20261027134442 mandatory_safe_playback exists; no newer migration listed.
- PostgreSQL constraint parents_safe_playback_required is
  CHECK ((safe_playback_enabled = true)).
- Aggregate only:1household,1true,0unsafe rows. No family-identifying data retrieved.
- This establishes mandatory database state, not player/provider/device acceptance.

## Live configuration truth

Existing Vercel project prj_tQi2cBAosldposlx61FcwnwDJ8OG and team
team_dTgQEg6sITPfNF8attwZNXcH:

- Root verified canonical production77a5017d938ded03b1530c2b72978cef27273d61 /
  dpl_GiRnmGhHRYnnq16jHEUGyxtjRNac, production target READY.
- This audit fetched canonical /api/session:200, role:null, configured:true;
  CSP frame-src remains https://www.youtube-nocookie.com/embed/ and object-src none.
- Frozen c670 preview watchnest-gm7uimcrp-avromy.vercel.app /api/session:200,
  role:null, configured:false. Trusted Vercel fetch may create/reuse its short-lived
  inspection share link; no link/token printed or stored in this receipt.
- All five existing environment keys remain production-only: YOUTUBE_API_KEY,
  NEXT_PUBLIC_APP_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SUPABASE_URL. Names/targets/type metadata only inspected; no values read.
- No existing custom environment is configured. No new environment/service created.

## Real-device evidence reconciliation

Narrow verified Founder Gmail search:
`(watchnest OR "picture and sound") after:2026/11/04 -from:notifications@github.com -from:notifications@vercel.com`
returned only the existing action-needed email1a1a54142ebc6c4c, sent to the Founder.
No reply or new physical PASS was found. Search absence is not universal proof of
no test elsewhere; no new result was supplied in the current user message or the
latest project checkpoint. No duplicate message sent.

Open gates remain:
1. Actual approved iPad picture/sound.
2. Related/More Videos containment ordinary/native fullscreen.
3. Parent phone End now stops native-fullscreen picture/sound and prevents resume.
4. Authenticated hosted candidate workflows; unconfigured preview cannot satisfy.

## Narrow supported hosted-QA route

Official Vercel current CLI documentation supports:
`vercel deploy --prod --skip-domain` -> inspect/test the immutable production-target
artifact -> `vercel promote <deployment>` only after release gates pass.
This reuses existing production configuration without copying privileged secrets
to all preview branches and avoids assigning production aliases during staging.
Do not run it against stale/unreviewed code; freeze reviewed candidate first.

Current capability limitation verified in this workspace:
- Vercel CLI absent; VERCEL_TOKEN absent; standard CLI auth files absent.
- Current connector create_deployment schema exposes target but no skip-domain /
  skipAutoAssign field. Setting target:production alone risks promotion and is not
  a supported substitute for staging. No production deployment attempted.
- A short-lived protected-deployment share URL solves Vercel protection only; it
  cannot add missing backend configuration or supply WatchNest authentication.

Root can continue separable UI/research/independent qualification now. For hosted
qualification, use an authorized authenticated CLI/provider staging path if one
becomes available; otherwise preserve this specific access limitation and request
secure provider authentication only when genuinely necessary. Never ask for keys
in chat/email, expand global preview secrets, invent unsupported API parameters,
add paid infrastructure, or promote the unconfigured preview.

## Primary references read

- https://vercel.com/docs/cli/deploy (Skip Domain section)
- https://vercel.com/docs/environment-variables/sensitive-environment-variables
- https://supabase.com/changelog.md
- https://app.notion.com/p/3bb584c4f747817f8e97f5d83fb03abe

This receipt does not grant a release or certify physical playback. Root should
publish it alongside its final authoritative recovery checkpoint as appropriate.
