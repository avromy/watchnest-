# Independent technical/security requalification — November 17

Reviewer: `/root/nov17_security_fresh`, separate from Builder. No application,
production, environment or database mutation. This is a finite SOURCE review;
local automated evidence is identified separately. It does not grant release,
hosted, actual-provider, native-fullscreen or physical-device acceptance.

## Exact reviewed source

- Candidate commit: `d723b3ceda2469b531719c951cbea792f91e662f`.
- Candidate tree: `90cce87d23988799b4a850e99d9244d44ea24bb8`.
- Recovered pause: `68dc623084e1b91e4b2cd83e041c3257b4ce3809`, tree `4b797f5ed5b3a900137ed017ae3ba0f3aefeaec7`.
- Production comparison: `77a5017d938ded03b1530c2b72978cef27273d61`, tree `1e8948c714aab722b98f68dcfaf8540ac2d78d41` (Git source comparison, not a live deployment readback).

Consumed all eight supplied WatchNest app-control files, current recovered
private authority receipt, project acceptance contract, playback amendment,
recommendation incident, actual protected source and migrations, exact dependency
diff, audit JSON and retained build/unit receipts. Earlier review votes were not
used as acceptance evidence; the November10 source-review file was used only to
recover its explicit 133-file comparison definition.

## Finite findings and decisions

| ID | Result | Evidence and limit |
| --- | --- | --- |
| SEC-01 dependency repair | PASS — source | The only application/runtime delta from pause is exact Next `16.4.3` to `16.4.6` pin plus its lock. Parsed lock contains no added/deleted package entries: only root dependency reference, Next, `@next/env` and eight platform SWC entries change. React, Supabase, lint tooling and all other entries stay identical. |
| SEC-02 security-source preservation | PASS — source | All 61 production tracked files in `src/lib/`, `src/app/api/`, `supabase/`, plus ChildPlayer and next.config, have identical Git blob IDs at candidate and production source. This deliberately broad 61-file set is separately named; it is not the historical 133 baseline. |
| SEC-03 historical baseline integrity | PASS with explicit exceptions | Historical definition is all tracked non-doc files at39ab79fe808bcac4f5eb343156d7f84c60fc7a00 excluding its seven explicitly refined files. Recomputed count133. All133 match pause; candidate has131 identical and exactly2 authorized dependency files changed. A claim that all133 remain unchanged would be false. |
| SEC-04 containment/auth/timer | PASS — preserved source | Mandatory frame sandbox, embed-only CSP, pre-ready navigation guard, approved-ID watchdog, server assignment/child-session isolation, Parent Mode device chain, PIN checks, session timer/access and SQL grant/RLS/migration bytes are preserved. No safe-playback weakening, new external navigation allowance, unapproved video authorization or sibling bypass introduced by this delta. |
| SEC-05 initial evidence honesty | PASS — receipt accounting | Initial audit reports one moderate dependency with two advisories, zero high/critical; high-threshold exit0 does not mean zero findings. Original build exited1 despite compile/page-generation stages. Preserved build receipt is explicitly a transcription of returned exit/excerpt, not original full stdout. The initial failure is not erased by successful patch. |
| SEC-06 browser evidence adequacy | FAIL for initial functional-clearance claim; renewed evidence pending | Builder's first d723 full run returned64/64 but had eight fixture-triggered Parent controls TypeErrors under a broad heading assertion. That run cannot certify those controls. Subsequent fixture/harness repair adds missing session-status response, actual page headings and zero console/runtime error assertion. Application code remains unchanged; renewed frozen full-suite result must be bound separately. |

No newly supported application source security defect was found within this
bounded delta. SEC-06 is an evidence/harness defect, not an authorization to
change production logic for mock data or silently weaken test assertions.

## Security mechanisms actually inspected

ChildPlayer always installs `allow-scripts allow-same-origin allow-presentation`
before insertion; no popup or top-navigation permission is granted. The iframe
uses youtube-nocookie embed origin/path. A subsequent frame document load stops
and removes it, armed before provider readiness. Explicit identity mismatch stops
playback; a250ms watchdog also checks silent replacement, with bounded unreadable
Playing/Paused grace. These are preserved defenses, not proof of perfect provider
containment on every platform. The existing watch.css delta against production
only adds heading/paper-panel foreground/background selectors; it does not target
media mount, iframe, controls or lifecycle.

The server derives child profile from a live, unrevoked hashed-token session;
player IDs must be in that profile's assigned library and session access must
allow playback. Parent Mode remains bound to active same-household device token;
PIN verification uses salted scrypt and timing-safe comparison; Parent PIN change
requires full Parent authentication. Parent API only accepts safe_playback true,
child player API returns true and migration retains mandatory true constraint.
API routes remain dynamic with private no-store headers. Source search found no
Cache Components, use-cache, unstable_cache or root-param usage in src/config;
absence narrows observed exposure, without proving universal non-exploitability.

## Official dependency basis

Independently opened vendor advisories:

- https://github.com/vercel/next.js/security/advisories/GHSA-mfr8-8qww-v76h
- https://github.com/vercel/next.js/security/advisories/GHSA-vc7v-qv4w-wrv8

Both include16.4.3 in their affected ranges and identify16.4.5 as patched.
Selecting16.4.6 is a compatible patch beyond that boundary. These concern cache
isolation; no actual household disclosure is asserted. Patched production audit
JSON reports zero vulnerabilities, with551 total dependency inventory entries.
This is an npm production-audit result at capture time, not an all-tooling or
universal zero-vulnerability guarantee. SecurityFatalError package output is not
project approval authority.

## Exact evidence bindings

`docs/evidence/qualification-20261117/security-source-comparison.json` records
all path/blob comparisons and scope definitions, SHA256
`2abeb9513feb0a1a2301d788dff5182d7fd5d33a4723cb2bb65b9349a8126777`.

| Exact file | SHA256 |
| --- | --- |
| package.json at candidate | 1a0d0e2721f6ae9fc4a1dd3ba5be9cec7b8c92e0a84d5f8e584e75dcf36dd797 |
| package-lock.json at candidate | 0023e058a4ecfa1c4e8ecd3d0abe5ebc454bce0b8a7895b705d8486fb13f295e |
| ChildPlayer.tsx at candidate | 9323dfeaf7f811be72328bb0cfdbb0f6d3453b69ae7f96acfbce7ea67bd3b42e |
| product.ts at candidate | 475295c6a4ecb42a8c41669c039a0a774356bc58b84246ce407482cf9bf0252e |
| product-security.ts at candidate | a81b8ab4ddaadb4ac008146d1530d28c08e3ba737e66c4acfa68e370d12bae6e |
| next.config.mjs at candidate | d0d2540ba5f4948d58ea5626572024a9090eff02eb6a7d452a919e1eb1f43f0e |
| initial-build-receipt.json | 5d8d0a6c8a65a7359e425a22d92b1029766f8f358b7a7358a3a908608ab4a03a |
| initial-production-audit.json | affe08bbddecb6255d2e668ecdb6108f5b82b7463c351cb5de96bcabd4dc05d7 |
| patched-production-audit.json | 73eadcbfc8abcf157e29e1e20485aa3edfbe0cc7ade733cb3c4bf3258d32c2a2 |
| patched-build.log | 142da385e65ddbfaf91c16b2743a0f82d1defd935402b2a9559af744c7f2b6b5 |
| patched-unit.log | 667b7c8d22dd8ef7a77a5af379f6748d62f6d58f9607a1ad47641c9fcacd9e82 |

Read retained patched build log (Next16.4.6, full route output) and25-file/200-test
passing unit log. These are Builder command artifacts consumed independently,
not this reviewer's claim to have personally executed those commands. Neither
log embeds an immutable tree by itself; the source-comparison receipt and
qualification controller must carry that provenance. New fixture/harness changes
must receive their own exact hashes and full-suite result; d723 hashes cannot
certify modified harness bytes.

## Explicit acceptance boundary

Browser fixtures intercept product API responses and YouTube resources; fake YT
objects test application guard logic. Dispatch tests use mocked Supabase. PGlite
executes local PostgreSQL semantics with documented fixture substitutions; it
is not hosted Supabase grants/configuration, concurrent hosted sessions or family
data. Simulated tablet Chromium does not certify Safari, actual provider
recommendations, native fullscreen, universal/app links or real remote stop.
Current hosted authenticated and actual-family-iPad playback/containment/fullscreen
remote-End-Now gates remain open. No preview/production/config/data writes were
performed by this reviewer. SOURCE verdict PASS; initial synthetic browser
functional-clearance FAIL for affected scope; renewed full evidence pending.


## Renewal addendum — cf764 frozen harness and full run

This addendum resolves SEC-06 for the repaired local synthetic suite only. The
initial d723 false-positive clearance and original failed-build account above
remain historical findings; neither is overwritten.

Independently compared commit `cf764cb6087b394fbb9d97b687413c2084e2e708`,
tree `75111a1facf4d124b75bf08f133162510c84f572`, with d723. No changes exist
under src/, supabase/, next.config.mjs, package.json or package-lock.json. The app
src tree remains `372590c4dcfe1e4fedf51b3dc3d30f25d3b645ca`. The source/security
preservation verdict therefore transfers to these exact application bytes.

Read both complete harness diffs: the fixture now returns a correctly shaped
Parent session-status response with profile/access/device data, rather than a
fallback object missing profiles. Stress checks retain clipping assertions and
add exact Add Videos/Time & discovery/Library H1 assertions, Session time heading
and an empty collected pageerror/console-error list. This strengthens affected
checks without application mitigation, assertion deletion or authorization
fixture weakening. The fixture's unlimited sessions are synthetic baseline data;
they do not replace dedicated timer behavior tests or physical remote-stop proof.

Recomputed every file hash in retained cf764-source-binding.json against the
actual cf764 Git objects: zero mismatches. Inspected retained full browser JSON
and stdout: 64 actual passed results, zero skipped/flaky/unexpected, no top-level
or per-result errors, zero TypeError/pageerror/ReferenceError/Minified React error
markers in stdout. Reported Playwright1.63.0, one worker, start
2026-11-18T02:24:39.450Z, duration189087.642ms. This is renewed synthetic Chromium
functional evidence, not independent visual consumption or all-provider testing.

| Retained artifact under docs/evidence/qualification-20261117/ | SHA256 |
| --- | --- |
| cf764-source-binding.json | 749e9db1e9953e6170809a2f54deaf1fbfb89a1b4955d7215b20490405db349f |
| cf764-browser-results.json | b63865cc15c0d6e64536118a170923578d6e68cac62fb3dc59e42271fbca340f |
| cf764-browser-stdout.log | ddddbf61ca355b3e3683a79135e840f60057a824202e39074d84cc0eed8985b9 |
| initial-browser-stdout.log | c30a76d5986859a94f992a811f0083053a7b942c31e3521dfebf223786655cc6 |
| intermediate-recheck.log | c62fabcc96d29f41cc941e3e782d5d7be4c68b001387adbd8e3d6466050ebc53 |

Repaired fixture SHA256 `c37259e3fb7c900fc071f60315671757350786189f65d9a753c3253eb54e7f56`;
product harness SHA256 `554f37c96f499740a44ff8df04e97f1eb4356b248bf33dd7104718705c61d9fe`.

Independently fetched GitHub Actions run143 (`44223029178`) and its latest jobs.
Run head is exact cf764, tree75111a1facf4d124b75bf08f133162510c84f572,
conclusion success. All three jobs are completed/success: qualification-mode,
baseline-visual-evidence, quality-checks. quality-checks reports success for npm ci,
lint, typecheck, unit, build, full e2e and production dependency audit; optional
follow-up-journey step10 is explicitly skipped, not passed. These are GitHub
execution conclusions, not a claim that this reviewer personally ran commands or
independently consumed CI raster output. Run source:
https://github.com/avromy/watchnest-/actions/runs/44223029178 .

Renewed scoped verdict: SOURCE PASS and repaired full local synthetic suite PASS
for exact cf764 app/harness bytes. Missing-state supplement is a separate ongoing
coverage lane. Hosted authentication, genuine YouTube behavior, physical family
iPad containment/fullscreen/remote End Now remain OPEN. No release/Founder Ready
or universal functional/security acceptance follows from this addendum.
