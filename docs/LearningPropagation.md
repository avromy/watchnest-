# UX redesign learning propagation — 2026-10-02

## Calibration event

The product passed technical qualification while recurring family paths still exposed architecture, overlapping taxonomy, and avoidable decision steps. The earlier review system over-weighted route correctness and component presence; it under-weighted a cold user's first recurring path and the question “why must the user see or do this?”

## Reusable rules

1. **Recurring-path cold test:** Review the already-onboarded default path separately from onboarding. Every screen, noun, and action must justify itself through security, comprehension, or a core job.
2. **One concept, one name:** Add a release gate for overlapping user concepts and implementation nouns across navigation, headings, empty states, and errors.
3. **Trusted capability binding:** A short-lived elevated capability derived from a longer-lived household credential must remain server-bound to that credential and be revoked server-side on lock/logout.
4. **Tablet wrap quality:** “No horizontal overflow” is insufficient. Deterministic checks must also reject orphan navigation rows and unintended label wraps at target widths.
5. **Text integrity:** Provider text must be normalized at ingestion and every response projection, including nullish legacy records; screenshots must be checked for replacement glyphs.
6. **Evidence separation:** A managed proxy's inability to render third-party image pixels is an evidence limitation, not automatic product failure; application containers, source reachability, and real-device observation must be reported separately.

## Narrow propagation

These rules belong in universal Product/App review calibration, not in WatchNest-specific business logic. WatchNest regression coverage now exercises the concrete tablet-nav, child-copy, title-integrity, session-binding, sibling-isolation, and MFK boundaries.

# Learning propagation — resumed run

## PROCESS proposal — qualify recurring use before architecture-aware review

Problem: WatchNest passed route, policy, security and limited visual checks while ordinary users still encountered family codes, marketing copy, implementation taxonomy and avoidable intermediate decisions. Reviewers followed the product's existing structure instead of challenging why each recurring step existed. Correction: separate Kids and Parent experiences, make the authenticated household-device home the profile picker, remove Simple/Standard and Shows/My Videos duplication, and test the shortest recurring paths explicitly. Prevention: before consuming implementation taxonomy, a cold app reviewer performs the two most frequent recurring jobs, counts required decisions/taps, and flags architecture nouns or slogans on authenticated surfaces. Proposed for the Product/App review system; not promoted to unrelated brand-production systems without calibration.

## PROJECT — access schedules use authorization time, not viewing telemetry

Made-for-Kids restrictions make exact watch-duration budgets unsafe to promise when they depend on player telemetry. WatchNest implements wall-clock schedule windows as authorization checks at profile entry and on every child API request; the active player revalidates every 20 seconds, including restricted content, without recording watch duration. Exact daily/Collection minute quotas remain deferred rather than being reconstructed from prohibited or misleading signals.

## PROJECT — child photos are private identity, not public media

Parent-uploaded child photos are authoritative only after explicit upload. Storage is private, service-only, MIME/size bounded and served through ten-minute signed URLs; avatars/initials remain the no-photo path. No public bucket/policy or client-side storage credential is introduced.

## PROJECT — provider metadata is not regional playback proof

Problem: YouTube Data API availability/embeddable metadata and an iframe load were promoted too close to playback acceptance, while the selected PBS KIDS upload still produced a native country-restriction failure. Correction: Parent Preview now requires an actual Play check and explicitly warns that load is not proof; production qualification rejects the affected individual video, soft-removes assignments, and retests a fresh individually approved item. Prevention: acceptance must distinguish metadata eligibility, iframe initialization, provider Play controls, sustained audiovisual playback and device-specific behavior. This defect class can affect every approved provider video, so availability review belongs per individual item rather than per channel.

## PROCESS — environment explanations do not close a Founder-reproduced defect

Problem: cloud Error 153 was treated as an automation limitation even though primary playback unnecessarily depended on the same optional SDK bootstrap. Correction: after the Founder reproduced failure on a real device, playback acceptance was revoked, the architecture was decoupled, and cold reviewers were rerun. Prevention: a tool-specific explanation may bound that tool's evidence but cannot certify the product; exact-candidate real outcome evidence remains controlling.

## PROJECT — production data must be reread before sibling claims

Problem: durable notes said the test item was Miri-only, but live readback found active assignments for all four profiles. Correction: the rejected item was soft-removed for every profile and the replacement was created as a single Miri assignment; live Ari empty/direct-route denial and Miri presence were rechecked. Prevention: bind authorization claims to current hosted rows and separate cookie jars immediately before release, never to an earlier narrative alone.

## PROJECT — status changes invalidate historical playback reporting

Problem: write/player guards suppressed Made-for-Kids/unknown activity, but Parent Dashboard still summed old rows after a status change. Correction: filter every history-derived surface using current approved ownership, explicit non-MFK status, fresh past metadata and playable eligibility. No own UI timer/click/request substitutes are used for restricted playback. Prevention: actual-handler regression coverage for totals, trends, child/recent/popular/never-watched and removed approvals. Independent dashboard tests challenge parent-scoped queries. This policy-specific rule belongs in WatchNest authority, not unrelated brands/apps.

## PROJECT — final integrity boundary repeats freshness gate

Problem: privileged progress SQL relied on the caller's freshness guard. Correction: transactional shared video lock and nonnull/past/less-than-one-day eligibility before storing any event. Prevention: actual PostgreSQL stale/null/future/exact-age boundary tests, plus anonymous/authenticated function denial. Migrations are append-only and separately reversible before release.

## DOMAIN proposal — security exit does not share anonymous admission budget

Problem: an invalid public family lookup consumed the global authentication throttle, preventing logout and leaving browser cookies intact. Correction: local-cookie clearing in finally, remote failure reported accurately, logout excluded from admission throttles; deployment-qualified per-network budget plus existing per-account/profile limits. Evidence: independent actual-handler regression; Vercel header semantics are source documentation, not deployed proof. Broader promotion awaits another platform calibration; do not trust arbitrary proxy headers elsewhere.

## PROCESS — connected capability is operation-specific and time-sensitive

Previously some setup tools were unavailable. Current evidence: Supabase list_projects/list_organizations and Vercel list_teams/list_projects succeed, while Supabase get_cost and Vercel deploy_to_vercel remain unavailable. Prevention: qualify the exact next operation, not the whole provider from one success/failure; recover safe configured connector access first, then already-authorized browser fallback. Existing unrelated projects are not spare WatchNest infrastructure.

## ROUTING — current final visual protocol is not its historical parent title

Registry/current protocol identifies Human-Eye V2.0 production-certified, even though an ancestor page title still says V1.1. V2.1 is testing. Prevention: current status/version/chronology governs; no historical parent title or similarly named cached package substitutes for current mandatory instructions. Current exact visual source completion and evidence receipts remain open, not silently waived.

## PROJECT — provider defaults are part of authentication acceptance

Actual hosted Supabase free settings prevent custom recovery templates without SMTP/Pro. The application expected a token_hash link while the default provider emits session tokens in the fragment. Preserve confirmation and verified Founder authorization; support the default provider through server verification instead of lowering security or buying infrastructure. Source tests alone do not prove email delivery or deployed recovery. Inspect actual plan/settings before claiming an integration complete.

## PROCESS proposal — save error messages can conflict with persisted state

Vercel production-branch save reported no deployments for the branch, but subsequent deployment validation and native deployment source showed the exact branch was persisted. Reconcile contradictory evidence with an authoritative operation readback; do not repeat writes or infer success/failure solely from a toast. Bounded to this observation; no general permission to ignore warnings.

## PROJECT — session setters do not necessarily verify refresh credentials

Independent review of source60673a reproduced installed auth-js2.101.1 setSession accepting a garbage refresh token with an unexpired valid access token. A second getUser rechecks the access token and cannot establish refresh correspondence. Use a real server refresh grant, remotely verify returned access and compare identity against independently verified original Founder before cookies. Mocked session restoration tests concealed the SDK behavior; coverage must exercise the actual exchange boundary. No non-Founder bypass was demonstrated. This is a specific integration lesson, not a claim of live provider certification.

## Propagation and scope

These findings are filed in repository evidence and current WatchNest Notion authority. DOMAIN/PROCESS candidates are recorded as reusable proposals, not uncalibrated global mandates. No 5T colors, geometry, artwork, copy or layout authority was imported. No paid service or unrelated infrastructure mutation was made. No deployed/real-device/YouTube legal certification is inferred from tests.
