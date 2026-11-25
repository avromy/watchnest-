# Concept3 collection keyboard focus recheck — 2026-11-18

**FAIL D2 persists on `0f31835b4ed252f9773d6dd5e76234eb4c73810b`.** Original D2 FAIL and the earlier Simple/content-reach repair PASS remain unchanged. This narrow independent recheck does not re-certify unaffected paths or release readiness.

Candidate tree `49728a172cc2010f6d2475ad3d298c36300b1a08`; src tree `4ab01ad5842cf3aa327ff4a03e123cfd5e74b78f`. Verified before run. Existing optimized `.next` build ID `2pb1ddiypaRNveQXzis8R`, BUILD_ID SHA256 `0afd1c3e80b98571c38386d760fc5482d2f00cc8cead107082576a6c19d0cd38`. Same-process explicit Next16.4.6 localhost3038; fresh Chromium context for each viewport. No rebuild, app/shared test edits, commits or deployments. App/config/fixture diff after run empty SHA256 `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`.

Reviewer `/root/concept3_cold_child`, separate from Builder. Synthetic fixtures only: unchanged original fixture (`c37259e3fb7c900fc071f60315671757350786189f65d9a753c3253eb54e7f56`) plus harness route returning20 copies of legitimate collection/video ids with synthetic ids/titles. No real family, hosted, Safari/device, sibling auth, YouTube playback claim.

## Actual journal and pixels

For each phone390×844, phone360×800, tablet768×1024 portrait and1024×768 landscape:
1. Fresh context→picker→Ari→synthetic PIN1234→library with20 collections.
2. Focus Collection01, press actual keyboard Tab19 times, inspect focused Collection20.
3. Shift+Tab10 times, inspect Collection10.
4. Shift+Tab9 times, inspect Collection01.
5. Enter retrieves Collection01. All videos→first→Tab19→Enter retrieves Collection20. Both target headings verified all four viewports.

Initial capture at150/200ms could plausibly be scrolling animation, so **repeated the entire four-context sequence with1200ms settling at each final focus**. Geometry and actual pixels remained clipped. Thus no transient-only failure is asserted.

|Viewport|Focus|Card x range|Shelf x range|Whole card visible|
|---|---|---|---|---|
|phone390|last|332.00..582.00|18.00..372.00|FAIL|
|phone390|middle|-192.00..58.00|18.00..372.00|FAIL|
|phone390|first|21.00..271.00|18.00..372.00|PASS|
|phone360|last|317.00..567.00|18.00..342.00|FAIL|
|phone360|middle|-207.00..43.00|18.00..342.00|FAIL|
|phone360|first|21.00..271.00|18.00..342.00|PASS|
|ipadportrait|last|454.72..734.72|30.72..737.28|PASS|
|ipadportrait|middle|-54.28..225.72|30.72..737.28|FAIL|
|ipadportrait|first|33.72..313.72|30.72..737.28|PASS|
|ipadlandscape|last|699.95..979.95|40.95..983.05|PASS|
|ipadlandscape|middle|371.95..651.95|40.95..983.05|PASS|
|ipadlandscape|first|43.95..323.95|40.95..983.05|PASS|

Phone last item shows only a narrow left fragment/focus ring; title entirely outside shelf. Reverse phone middle shows only a narrow right fragment; title outside shelf. Tablet portrait reverse middle clips left artwork and focus border (title remains visible). Landscape last/middle/first and all first items are fully visible. Outline is3px coral with-4px offset: internal outline is clear on fully visible items but gets clipped with the card in failure cases. Enter retrieval works; action not missing, focused identity visibility is defective. Document width remains viewport width all cases; no body horizontal overflow.

PNG raw screenshots outside repo: `/workspace/scratch/b4fb31747e8d/concept3-child-focus/`. `phone390`, `phone360`, `ipadportrait`, `ipadlandscape` × `last`, `middle`, `first`, both initial `.png` and repeated `-settled.png`. All24 actual screenshots were opened through `view_image`; no PNG-possession-only pass. `keyboard-evidence.json` and `keyboard-settled.json` retain exact geometry/journal. Initial generated `01-phone-first.png` is setup picker only, not used for this gate. SHA256 manifest binds captures and driver/fixture. Original source and review docs remain untouched.

Disposition: D2 remains OPEN P2; final child signoff HOLD. CSS snap removal/scroll margin alone has not guaranteed full focus visibility in this tested Chromium. Builder should ensure focused collection is explicitly scrolled fully into view, then independently recheck first/middle/last in both keyboard directions. No Founder action required. No repair performed by this reviewer.
