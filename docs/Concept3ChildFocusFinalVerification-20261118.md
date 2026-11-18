# Concept3 final child collection focus verification — 2026-11-18

**PASS — D2 repaired on `a8c0dbe4cb0faf5137d89afab043928ec76404e3`.** This is the independent actual-browser recheck of the explicit collection focus callback repair. Previous original/cold and intermediate D2 FAIL receipts remain preserved; this file supersedes only the affected focus result. Combined with prior age-aware/content-reach/request-wording repair evidence, no reported child usability defect remains open in this bounded synthetic lane. No release/hosted/physical-device certification is implied.

Exact candidate tree `0f7223c144a033bf4893cf047a0319a380c0c0bc`; src tree `963c61b38c8a70cd1193f156d79d34d20cc5a969`. Before-run verified SHA/tree/src; after-run app/config/fixture diff empty SHA256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`. Source confirms collection button `onFocus` calls `scrollIntoView({block:'nearest',inline:'nearest',behavior:'instant'})`; the verdict below derives from actual runtime interaction/pixels, not source alone.

New existing optimized `.next` served by same-process explicitly bound Next16.4.6 at localhost3040; no rebuild. Build ID `TdvHwOQD0J2foWIaa2IOY`; BUILD_ID SHA256 `a998ff07e70bfbb139209102860d0310db56bcbc12be2fdd6ee4d2cfa2a1ecdc`. Fresh browser process, separate clean context for each viewport. Original fixture SHA256 `c37259e3fb7c900fc071f60315671757350786189f65d9a753c3253eb54e7f56`; transpiled fixture SHA256 `c83998e2882d0355bd1f8b438d69ca238efde39daffd13757d034a6a7dd7c438`; harness-only library override supplies20 synthetic collection ids/titles over the fixture's legitimate approved video ids. Driver and exact screenshots hashes in external evidence manifest.

Independent reviewer `/root/concept3_cold_child`, not Builder. No source/shared-test/shared-fixture edits, commit, deployment, real family mutation, source build, or new agents. Original cold-first-impression claim retained in original report; this repair verification is intentionally informed/affected-area work.

## Actual keyboard journal

Each fresh context tested phone390×844, phone360×800, iPad-shaped portrait768×1024, landscape1024×768:
1. Open actual picker→Ari→synthetic4digit PIN→20collection approved library.
2. Establish focus on Collection01, then **19 actual Tab presses**, inspecting every intermediate focused card's full bounds. Capture Collection20.
3. **10 actual Shift+Tab presses**, inspecting every intermediate card. Capture Collection10.
4. **10 actual Tab presses**, inspecting every intermediate card. Capture Collection20 again (forward re-entry).
5. **19 actual Shift+Tab presses**, inspecting every intermediate card. Capture Collection01 (reverse return).
6. Enter retrieves Collection01; All videos recovers shelf; focus first→19Tab→Enter retrieves Collection20. Both exact target headings verified all four viewports.

**232/232 intermediate full-card bounds PASS** (58 key transitions×4 contexts), not only direct `.focus()` on last item. First/last Enter navigation **8/8 PASS**. Endpoint captures settled300ms; instant focus callback made geometry correct immediately after every actual key transition. No manual shelf scrolling or synthetic event dispatch used to obtain these passes.

|Viewport|Actual focus endpoint|Whole card x range|Shelf x range|Containment|
|---|---|---|---|---|
|phone390|last|119.00..369.00|18.00..372.00|PASS|
|phone390|middle-reverse|70.00..320.00|18.00..372.00|PASS|
|phone390|last-forward|119.00..369.00|18.00..372.00|PASS|
|phone390|first-reverse|21.00..271.00|18.00..372.00|PASS|
|phone360|last|89.00..339.00|18.00..342.00|PASS|
|phone360|middle-reverse|55.00..305.00|18.00..342.00|PASS|
|phone360|last-forward|89.00..339.00|18.00..342.00|PASS|
|phone360|first-reverse|21.00..271.00|18.00..342.00|PASS|
|ipadportrait|last|454.72..734.72|30.72..737.28|PASS|
|ipadportrait|middle-reverse|46.72..326.72|30.72..737.28|PASS|
|ipadportrait|last-forward|454.72..734.72|30.72..737.28|PASS|
|ipadportrait|first-reverse|33.72..313.72|30.72..737.28|PASS|
|ipadlandscape|last|699.95..979.95|40.95..983.05|PASS|
|ipadlandscape|middle-reverse|371.95..651.95|40.95..983.05|PASS|
|ipadlandscape|last-forward|699.95..979.95|40.95..983.05|PASS|
|ipadlandscape|first-reverse|43.95..323.95|40.95..983.05|PASS|

## Actual visible-pixel receipt

Raw evidence outside test-results/repo: `/workspace/scratch/b4fb31747e8d/concept3-child-focus-final/`. All16 requested PNGs were **opened with image viewer and actually consumed**, one for each viewport×last/middle-reverse/last-forward/first-reverse. Each shows the complete focused collection title and all four edges of the coral outline inside the visible shelf. Adjacent inactive collection slivers are intentional horizontal-shelf affordances, not focused content clipping. Phone360/390 last items now display the complete “Collection20” label rather than a narrow clipped fragment. Portrait middle reverse displays complete icon/title/card/outline. Landscape and first-item views remain clear.

Exact names: `{phone390,phone360,ipadportrait,ipadlandscape}-{last,middle-reverse,last-forward,first-reverse}.png`; `keyboard-evidence.json` includes all232 transitions and16 endpoints plus Enter results. Initial automatic picker capture is setup only and is not part of the16focus acceptance units. Source/driver/fixture/capture hashes are recorded in `evidence-manifest.json`.

**D2 disposition CLOSED / PASS.** Preserve original FAILs as regression history: partial `toBeInViewport` or native keyboard focus does not establish whole-card/title/outline visibility in a horizontally clipped shelf. This final evidence verifies complete bounds at every actual Tab/Shift+Tab transition and pixels at meaningful endpoints. No new defect found in the narrow repair area.

Scope remains headless Chromium with synthetic routes. Real authenticated sibling isolation, hosted persistence, approved YouTube picture/sound, physical iPad Safari/native fullscreen containment and End-now picture/sound stopping remain separate gates, unchanged by this receipt.
