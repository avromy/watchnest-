# Independent dependency and affected-source review

**SCOPED SOURCE/DEPENDENCY PASS — immutable candidate `30681533551d916c08161f29bbb9ba821f6c92f9`.** Current exact file hashes are in the JSON receipt; original timer findings/reacceptance remain in the existing security record and were not edited during publication.

The manifest changes only the pinned dev Vite8.3.1→8.3.8. Independently inspected45 package lock entries plus root metadata; changed download origins are registry.npmjs.org, with no new scripts. Only existing production package version change is nanoid3.3.19→3.3.20, explicitly acknowledged as a runtime patch. Direct Next/React/Supabase/PGlite/Chromium pins remain unchanged. Other updates affect development/tooling paths, including follow-redirects, TSeslint, CSS parsing and Vite/rolldown. No material new source/dependency defect was confirmed in this bounded review.

Independent targeted execution on the repaired installed engine passed **147/147**, exit0 (119SQL,21guard,7snapshots). Independent full `npm audit --json` returned **0 vulnerabilities**, exit0. Logs/hashes are recorded alongside this receipt. This is a current known-advisory result, not a claim that every possible vulnerability is absent. Root owns clean-ci/full343/build/browser80/pixel evidence.

All eight prior protected server/SQL/player/child hashes remain identical; Parent editor changes since866 reorder descriptions/presets/custom submit only and retain command dispatch, integer bounds and server auth. App source/e2e/SQL trees remain the aa2 baseline.

Primary verification: the follow-redirects project advisory lists1.16.0–1.16.1 affected and1.16.2 patched; installed1.16.3 is above this patch baseline. See https://github.com/follow-redirects/follow-redirects/security/advisories/GHSA-mrwp-f3q8-3g9p . The official Vite8.3.8 release was also read: https://github.com/vitejs/vite/releases/tag/v8.3.8 . An initial advisory request used the wrong project URL and failed; the correct primary advisory was subsequently opened and verified. No claim of WatchNest exploitability is inferred solely from audit severity.

No reviewer source/package edits, hosted DDL, credential access, family mutation or deployment occurred. Hosted qualification, actual concurrent PostgreSQL and physical-iPad/fullscreen behavior remain bounded as previously documented; this report does not authorize release or substitute for those gates.


## Final immutable binding

All eight recorded source/package hashes independently match `git show 30681533551d916c08161f29bbb9ba821f6c92f9:<path>`. Whole tree: `2feab20cfa6b6398bed612f8c48629a3a7e61385`. App src `1eed93961f1ce9b53d5bf3ec8c77f6909a2e0392`, e2e `8966026e9384a3f7136a8041cc88a8d08bd52712`, and supabase `2a36c8a7c89bb4413086bfa19686ea90695af54b` remain unchanged fromaa2. The fresh independent147-targeted-test and full audit0 receipts cover this candidate. Root full pipeline results remain separate and are not claimed here.
