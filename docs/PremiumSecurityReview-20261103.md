# Premium UI independent source security/function review — 2026-11-03

Reviewed 2026-11-04 UTC by independent source reviewer `/root/premium_security` after parent/child implementation freeze. This is a bounded source-delta review, not a new comprehensive security audit or release acceptance.

## Exact candidate identity

Production comparison: `77a5017d938ded03b1530c2b72978cef27273d61`. Local HEAD when reviewed: `1bd5f184c61cc9e43af2a707884e98fd1d7731e9`; candidate was an uncommitted working tree. The file SHA-256 values below, including new files, bind this receipt. Root must match these values to the published candidate before carrying forward the verdict. A changed affected file requires re-review.

| Reviewed presentation/source file | SHA-256 |
| --- | --- |
| `src/app/layout.tsx` | `434f108c81cc28610998938be51c82006cfcccd3c5fe9d730f09c38f212411f0` |
| `src/app/premium-tokens.css` | `dfcb2f3ce5689bf43c5fdfeb3f8bbc8f2ec6b24964eab0c370472e8e2c272651` |
| `src/app/login/page.tsx` | `6f6f5f86c09d8aea07fa1b7f453d21009d77285eb76e21a35246eee6dce05762` |
| `src/app/login/login.module.css` | `ad206d1d6568af40c394d5e56762efc4d5e6cdcffbdd6cca56d7e01c530009d6` |
| `src/components/child/ChildLibrary.tsx` | `0da19287073a02c83fc89ffb899a58ddd72aafbde7afb80c0948a05d92a0eac1` |
| `src/components/child/ChildLogin.tsx` | `49bc452fcfea17b2075246856457fbdc22110f35db6c77d95a5000d737e318ce` |
| `src/components/child/ChildExperience.css` | `d5ab170eb356db3cc6e3eb6681d48a88beedee2a40184c199e5d310effcffd9d` |
| `src/components/parent/ParentApp.tsx` | `7e85ba03f63b3e0f5c19c8d83c53628287ebbbc3b0810b6bc5322065f8a5fdcb` |
| `src/components/parent/Parent.module.css` | `47fdb2e8aa2d4b5c9d50c7039789f390b1e338baa3a5ea9f24a802541aa436c9` |

## Narrow follow-up source qualification

Rechecked the subsequent request-success disclosure repair on 2026-11-04 UTC. The only ChildLibrary change from the previously reviewed SHA-256 `741a46c7402645278a82a87949e74f517b1ac015289c355a5b1ad9d4c0c69425` is `open={!profile.discover_enabled || !!message || sent}` replacing the same expression without `|| sent`. Reconstructing the prior text reproduces that prior hash exactly. Current hash is reflected in the table above. Successful submission sets `sent` before clearing the composer message; including `sent` keeps the success disclosure open. Navigation and Send another reset behavior, API calls, tokens, auth, assignments and timer logic are unchanged. No new source security/function issue identified in this delta. This qualification makes no rendered-visibility or visual PASS claim; corresponding browser evidence must use the updated source.

## Findings and disposition

- **Fixed during review — resolved request wrongly blocked re-request.** Initial transformed Discover code disabled every resolved video request and labeled it added even when the video was absent from the requesting child's library. Parent approval can assign to other profiles, and later unassignment leaves request history resolved. Final `ChildLibrary.tsx` checks current assigned-video membership for Added/disabled state; pending requests remain disabled; resolved/dismissed but absent results offer Ask again. History distinguishes In your library from Reviewed by Parent. Source recheck confirms the repair. This was a functional regression, not an authorization bypass. No browser execution of this scenario is claimed by this receipt.
- No remaining concrete new authorization, approval/assignment, profile admission, bounded-discovery, or remote-timer source regression was identified in the final frozen frontend delta.
- Parent login changes add user-controlled password visibility and presentation; the login/recovery endpoint and request body remain unchanged. Child/Parent PIN admission and device/profile locking endpoints remain unchanged. Dialog Escape/focus handling does not grant admission.
- Parent approval retains individually selected video IDs, explicit profile IDs, and optional collection ID. Search/link mode changes do not alter that payload or server ownership checks. Parent profile settings and timer actions retain their endpoints, validation-dependent disabled states, authoritative clock/revision calculations, and action payloads.
- Child featured play links use assigned library IDs, the existing internal player route, and the existing immersive-click handler. Hidden videos are excluded from featured/continue/recent rows. Sorting operates on a filtered copy. Discover request submission retains signed request tokens; server boundary checks are untouched.
- Synthetic CI evidence upload uses an explicit path allowlist and synthetic fixtures. No environment files, authenticated browser state, or traces are allowlisted. Baseline evidence is separately labeled and cannot certify candidate behavior. Actual CI execution/results are outside this receipt.

## Frozen mechanisms verified against production

Compared all 64 tracked files under `src/lib/`, `src/app/api/`, and `supabase/`, plus ChildPlayer, child/parent model files, Next configuration and package manifests, byte for byte against production. **Zero differences.** Thus player lifecycle/containment, immersive helper, backend/auth/assignment/session/discovery checks, migrations and CSP configuration were not changed to produce this UI. This preserves existing implementations; it does not establish their correctness on actual devices or waive unresolved playback gates.

Protected manifest SHA-256 (UTF-8 lines below, final newline included): `a98432d3661ffad516b464f96b9ee82b5f1aa3e2f8c67acd7fe6dc793ee7981c`.

```text
d0d2540ba5f4948d58ea5626572024a9090eff02eb6a7d452a919e1eb1f43f0e  next.config.mjs
6393d1831c0d318f4a661454dd90650f2817d6c45c7a2caa0d3595530eaf0f46  package-lock.json
635e602cff9d38dc0898c5b5999e7c21e54333134e9d296c26065026b39a52b8  package.json
ed1bb1985638c2b7a2f52ffcae144f094aa9c3c6567266aee6c3ba2f51485121  src/app/api/[...path]/route.ts
158bb290aa0753761fc345295245da28ea823b4fce5ad0c9627f1c35f592bb9b  src/app/api/parent/profile-photo/[profileId]/route.ts
9323dfeaf7f811be72328bb0cfdbb0f6d3453b69ae7f96acfbce7ea67bd3b42e  src/components/child/ChildPlayer.tsx
f769e80b23fee396b85a9d1705d48276d7bfa1e86a439c73dfccf6bba3139816  src/components/child/model.ts
f481d4904ad736bdca7a72bee8c90ad57a230dcc6b2a6b243b79f5427882432f  src/lib/access-window.test.ts
1f83735b33d161fcf9078e57a33116fa530d304811ba445dff0b42c3342fd31e  src/lib/access-window.ts
3884bfc313905255092d24897c214485cd5193bd668c3c4713e12a68894aab47  src/lib/assignments.test.ts
34d73afe0ab864de8bf1e5b14dd9b10af36e323a97d69340db8cf64c92ebea16  src/lib/assignments.ts
0897fcc4791b91ca970601a9e1394fe74f698b75176c3fd12b1c31c505305f3a  src/lib/data.ts
c8ad930998de22ef0c53a1ad21f0df6ecc3c85aa70241aebfd99ea5ae43aef14  src/lib/discovery-security.ts
f829ccc7b06c988ca97ec547fa601592f5c77f5900964e69e0fca99780f36ded  src/lib/immersive-playback.ts
619994d4ccb1f18320e8b16b63c04f35dd7c30a0211a4de73c25eb7ced06a2fd  src/lib/next-up.test.ts
e300365297b47eaa425556dde7283e1767e46fba9d58e8766eaf2eeddf246c68  src/lib/next-up.ts
51387565543840d5d927bd223153c42357b7ef568c71cee8f1ff076d302a795c  src/lib/sample-data.ts
3cdf1191aaf4c90a5889423b6382f776af13ae20e4bc05b533d849910c3865a0  src/lib/server/dashboard-policy.test.ts
afff7ccac837c47c8d704b47eacd8d4119ec1924e4c84fd7cfd990837581d8d5  src/lib/server/final-family-beta.test.ts
9b631c5ba03f6010e7c0c6aaece529eaf375033e19d4b0d98c12eb1913c3a47c  src/lib/server/independent-dashboard-resume.test.ts
1ad01d76eadaabdc69978b782869cee532b04c86686b19651d3ac66008c3ac39  src/lib/server/independent-maintenance-resume.test.ts
be3659b63626197410f017d846bd2d8ade0d405de075900a532c3f852d124e3f  src/lib/server/independent-route-resume.test.ts
4285a97921bc02402613f08631140075a65566f75fdfa780693178f69dc4ac8e  src/lib/server/independent-security-resume.test.ts
cdc288de70ce1f27058ee8c17f15e68f3c31f05d3348d66320292059db0e0c1a  src/lib/server/product-database.test.ts
928e497644333df9dd32260d7b8050133b02c14261d92d0f9d45d60f5c66d052  src/lib/server/product-dispatch.test.ts
5b750211123a5ba45084824c47d35a51cd5c6fe4c555ff2d7b6b1fe6e783f39f  src/lib/server/product-security.test.ts
a81b8ab4ddaadb4ac008146d1530d28c08e3ba737e66c4acfa68e370d12bae6e  src/lib/server/product-security.ts
792a68ac6cec77651a14cfcf278d1576b10765439fec1050cc50ab069f1ccd08  src/lib/server/product.test.ts
475295c6a4ecb42a8c41669c039a0a774356bc58b84246ce407482cf9bf0252e  src/lib/server/product.ts
6b6e6f764998f1910f68f74c20745301351a798d5417f6e8c1fe99e2bf06a32e  src/lib/server/recovery-sdk.test.ts
b1990d614e26e5bf25b97233e9c2ed604078033ee7d84fd119ea44164ed287ad  src/lib/server/session-discovery.test.ts
08009d79a4e5cfc3ca1c716627f6444f191ba30226dd1eaa3dbfe7de86fd5fc5  src/lib/server/watchnest-data.ts
00287f568dd822ce111999f2cb980aadd6caf6981985165c92026d450887b715  src/lib/server/youtube-metadata.test.ts
dc598f83e3390f170eb1b0597864a682f076f06304d7a442ace4d2cea8ebce38  src/lib/server/youtube-metadata.ts
c0a4a6ec5ffa838feb0573735cad1754424e3f7fdf9e80a87adea3067f40accb  src/lib/server/youtube-search-data.test.ts
af06979be869017f1620b636ba45334078d6951a1a138445c6ccd28cbf86437c  src/lib/server/youtube-search-data.ts
ab63dca8dec4ff7a4d38845555ff835ab599d0b117258158592cbb1800b6cc57  src/lib/session-access.test.ts
11dc225b6c9428da59a21c22899c368f09a324076b020316d9e9d449036aeb63  src/lib/session-access.ts
730c25e081c76c0a6e97d4bd914b4a11360359dcf27159dc17f9ca3a69b01a8b  src/lib/supabase/queries.ts
e49e991c335b50c7719bdbb9f5354c292bf823cdfd267a0cb4828c2dce7404c8  src/lib/supabase/server.ts
2b325ada1190b649529c151d88b72160bf1848b59391a25cd2288d1720953118  src/lib/watch-progress.test.ts
3382f77ad9e19cbdc46e188532b46fefceaf2eabc7dab887e1d907f9af554504  src/lib/watch-progress.ts
d2144ffcc26a6a8ebae9b3526822f37b24bdf8bfdd5ba99a530c1febb989ef45  src/lib/youtube-player.test.ts
dcdec741e977f9baf402db930f8732a35b46bae8d7f6821a1b12dfead2cac979  src/lib/youtube-player.ts
bc33e1eddcb87155cb6745ca3324df9015543f28355e38b79a8f32c2a5c9cedf  src/lib/youtube-search.test.ts
8dffe1ee2dfb28f798f6cdf43ffd5301b088853ccce35ce082712e319e454883  src/lib/youtube-search.ts
0b8da19eb806b8e4a503d09af7ddcf130dfd8406825f65038690260ca6fd404f  src/lib/youtube-thumbnail.test.ts
7ec636ae5df63faea99f5b193177525d7d863b7074e29d3b088e70973a6b9d98  src/lib/youtube-thumbnail.ts
9b65b6a619bafe0e01f08fb9bed5e03214af9f5866a87cd7877611fa8467f981  src/lib/youtube.test.ts
cfee8b410eb66419b19352f337b2fc2e82db145a97dff36b63653253c473b912  src/lib/youtube.ts
d49d14c5834c7b461e64cdbae853d2034e16ec06045c117babc166860fdc4eee  supabase/migrations/202607060001_initial_schema.sql
5bd41097f3bf2e6d622d3202129ad07c9dbaf9bea4dcb3c8ff41d88cf9a0ffc4  supabase/migrations/20260930192030_secure_family_product.sql
cfadf6fb7b107b8d7ee11271a0d2db6d589b8885d2e4449f7e6994deda378747  supabase/migrations/20260930235307_progress_metadata_freshness.sql
47487356077d3aa54ba8b81fb57bbe817d5ce85970cf1c1a3c2017b9abadbacc  supabase/migrations/20260930235928_metadata_retention_maintenance.sql
1f5f7ed0aefd6f82938becfc147bb96092658909ffc6c5d84e7fb5b5f7ac4dfd  supabase/migrations/20261001030558_hosted_security_indexes.sql
9431ab1aa040cfd15fafed54d884c67a4d23cde1c5c9d8c9331e23eb7b3a4670  supabase/migrations/20261001053047_raw_resume_only.sql
10b04b53472107463a1b499c01a834612c05dd3c428ec2429aa6a4b2d80b13b4  supabase/migrations/20261002020000_atomic_child_admission.sql
6f81aac81761f6a038391494b1a4b4fef493afd2467d3b565e8ca0457463ff91  supabase/migrations/20261002035922_household_device_ux.sql
779cffd31184b941cf54c64bf05448db7a7144954d398b88113369d019ef9746  supabase/migrations/20261005000000_final_family_beta.sql
a68160dc935deca549435cd19ba8896eb1b46da8a0fd13ab76091762a57d2454  supabase/migrations/20261026000100_session_timer_discovery.sql
fb82de7832125fdab5deecbefdcd2b827267d4dbf4106865226a7493de694a14  supabase/migrations/20261026151813_remote_parent_session_control.sql
4623f42112a2e7d7f8c40711ff5d3cf311a9d4bf3bd0aeaa02cee75d86b9c930  supabase/migrations/20261027134146_mandatory_safe_playback.sql
3eda3a84cfb47ab5b49db9ccf1d00816e9f253853343dde8925b56d90d1e1129  supabase/operations/enable_metadata_cron.sql
d358d6e8a819c408dd616a770f76b2f10d08f7c06f70c58af102c8d679cfdd68  supabase/seed.sql
```

## Verdict and limits

**PASS — bounded final source-delta security/function review**, subject to matching the exact frontend hashes and protected manifest to the published source. No remaining source blocker found within this scope. The repaired request scenario merits real rendered workflow coverage in the candidate QA lane.

This reviewer did not execute build, tests, lint, dependency audit, browser workflows, screenshots, deployed authorization checks, YouTube media, physical iPad Safari/PWA, native fullscreen, or remote-stop playback. Builder-reported checks are not independent evidence here. No visual, accessibility, Stranger, Blind Jury, device, hosted-database or deployment PASS is implied. Mandatory release gates remain controlled by Run State and the review contract.
