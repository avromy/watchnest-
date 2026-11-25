# Frozen premium candidate — CI136 evidence

Application candidate: `da6edbb4436fc6f455eaef87ace5df61c3e62396`.
API-created complete candidate tree: `bb562b7c878d6e3be904b318a54e8546892fce52`.
Draft PR49 base is production branch `product-completion-20260930`; no merge or production promotion.

[CI136](https://github.com/avromy/watchnest-/actions/runs/41780707635) ran synthetic PR merge `c624704e0ed074356ff0826fd3c539cb48b917e3`. All14 clean candidate manifests report that checkout, requested head da6edbb, complete source tree bb562b7, empty worktree status, and empty diff SHA256 e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855. The independently API-created requested-head tree and actual clean-checkout tree are identical; the merge commit name alone is not the binding.

## Automated results

- Lint, TypeScript, production build: PASS.
- Unit/integration: 25 files,200 tests PASS.
- Browser:50 expected/pass,0 skipped/unexpected/flaky. This includes14 screenshot-family tests plus36 functional/structural flows.
- Production dependency audit:0 vulnerabilities. Installation also reports development-inclusive advisory counts; this receipt does not claim zero across development dependencies.
- Historical production77 baseline:14 expected/pass,0 skipped/unexpected/flaky.

## Exact raster packages

| Package | Artifact | SHA256 ZIP | PNGs | Manifests | Captures | Distinct state names | Bounded assets |
|---|---|---|---:|---:|---:|---:|---:|
| Candidate |13299431499|773a7c8f8db20fec6e7d23bc1f4147e3441b79221605657cc4d680b614bea031|618|14|212|72|2915|
| Before production77 |13298524602|263ea5d1e314976f991bf9c5e65d049e48e7345bc54a74d3cbb248114f269866|594|14|212|72|2747|

Both ZIP byte hashes were verified against GitHub artifact digest before safe extraction. Artifact expiration is2026-11-18; subsequently archived privately with verified byte identity; custody in existing CTO Handoff. Candidate local recovery path: `/workspace/scratch/b4fb31747e8d/watchnest-review/ci136-candidate/artifact.zip`; baseline sibling `ci136-before/artifact.zip`. Local paths are transient recovery convenience, not durable storage.

Anchor viewports390x844,768x1024,1024x768,1440x1000. Core and player-state families cover all4. Dedicated parent details cover phone+desktop; dedicated child entry/details cover portrait+landscape tablets. All captures inventory actual viewport, headings/controls, overflow and accessible names; assets have bounded neutral identities, source hashes and explicit four-edge references. Verified instant scrolling is a documented capture-only intervention. Baseline success disclosure is reopened only to expose historical success DOM; its intervention is recorded.

Candidate harness SHA256 `9adc988a1315e692d8c59102542d42da541b317ca40a304893e8391a3d08a1e2`; fixture SHA256 `1ca783a07ac4d5916fc2f0c6bfedf63c7aa9f8481b31a7a594472442bce06275`. Browser origin is local production build `http://127.0.0.1:3001` inside clean GitHub Ubuntu CI. This is synthetic API/artwork/provider evidence, not hosted-preview acceptance, real YouTube playback, Safari/PWA or physical-iPad confirmation. Independent pixel/UX and cold journey verdicts are separate receipts; these automated results do not self-certify visual quality.

## Follow-up qualification rule

Evidence-only successors may run fresh independent journeys against this unchanged application without re-running the14-family raster corpus. Workflow checks ancestry and exact application/config differences against da6edbb and requires unchanged premium harness, shared fixture and Playwright config. Any material application/config or raster-harness delta selects the full gate and invalidates affected evidence until rerun. Existing lint/type/unit/build/audit gates remain mandatory in either mode.
