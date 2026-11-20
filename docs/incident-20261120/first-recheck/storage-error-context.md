# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: startup.spec.ts >> synthetic startup: denied preference storage cannot crash approved playback
- Location: e2e/startup.spec.ts:33:5

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Play video', exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('button', { name: 'Play video', exact: true }) with timeout 5000ms
  - waiting for getByRole('button', { name: 'Play video', exact: true })

```

```yaml
- link "Skip to content":
  - /url: "#main-content"
- main:
  - link "WatchNest":
    - /url: /watch/home
  - link "← Back to Library":
    - /url: /watch/home
  - paragraph: From Ari’s library
  - heading "Build a paper rocket" [level=1]
  - paragraph: Little Makers
  - iframe
  - text: Volume
  - slider "Volume": "60"
  - status: Safe Playback is always on in Child Mode.
- alert
```

# Test source

```ts
  1   | import { test, expect, type Page } from "@playwright/test";
  2   | import { dashboard, fixture } from "./fixtures";
  3   | 
  4   | const apiStub = `class Player {
  5   |   constructor(frame, options) {
  6   |     window.__constructs = (window.__constructs || 0) + 1;
  7   |     if (!frame.isConnected) throw new Error('detached-player');
  8   |     this.frame = frame; this.events = options.events;
  9   |     if (window.__replaceFrame) { this.frame = frame.cloneNode(); frame.replaceWith(this.frame); }
  10  |     window.__startupPlayer = this;
  11  |     if (!window.__neverReady) setTimeout(() => this.events.onReady({target:this}), window.__readyDelay || 0);
  12  |   }
  13  |   getIframe() { return this.frame; }
  14  |   getVideoUrl() { return 'https://www.youtube.com/watch?v=' + this.frame.src.split('/embed/')[1].split('?')[0]; }
  15  |   getVideoData() { return {}; }
  16  |   getPlayerState() { return -1; }
  17  |   getCurrentTime() { return 0; }
  18  |   setVolume() { if(window.__throwOnReady) throw new Error('readiness-exception'); } pauseVideo() {} playVideo() {}
  19  |   destroy() { this.frame.remove(); }
  20  | }
  21  | window.YT = { Player }; window.onYouTubeIframeAPIReady?.();`;
  22  | async function prepare(page: Page) {
  23  |   await fixture(page, "child");
  24  |   await page.route("https://www.youtube-nocookie.com/**", (route) =>
  25  |     route.fulfill({
  26  |       status: 200,
  27  |       contentType: "text/html",
  28  |       body: "<!doctype html><p>Provider fixture</p>",
  29  |     }),
  30  |   );
  31  | }
  32  | 
  33  | test("synthetic startup: denied preference storage cannot crash approved playback", async ({
  34  |   page,
  35  | }) => {
  36  |   await prepare(page);
  37  |   const errors: string[] = [];
  38  |   page.on("pageerror", (error) => errors.push(error.message));
  39  |   await page.addInitScript(() => {
  40  |     Object.defineProperty(window, "localStorage", {
  41  |       get() {
  42  |         throw new DOMException("Preference storage denied", "SecurityError");
  43  |       },
  44  |     });
  45  |   });
  46  |   await page.route("https://www.youtube.com/iframe_api", (route) =>
  47  |     route.fulfill({ contentType: "application/javascript", body: apiStub }),
  48  |   );
  49  |   await page.goto(`/watch/player/${dashboard.videos[0].id}`);
  50  |   await expect(
  51  |     page.getByRole("button", { name: "Play video", exact: true }),
> 52  |   ).toBeVisible();
      |     ^ Error: expect(locator).toBeVisible() failed
  53  |   await expect(
  54  |     page.getByText(
  55  |       "WatchNest couldn’t load this page. Your library stays protected.",
  56  |     ),
  57  |   ).toHaveCount(0);
  58  |   expect(errors).toEqual([]);
  59  | });
  60  | 
  61  | for (const preference of [null, '0', '75', 'invalid', '']) {
  62  |   test(`synthetic startup: volume preference ${JSON.stringify(preference)} preserves intentional sound`, async ({page}) => {
  63  |     await prepare(page);
  64  |     await page.addInitScript(preference => {
  65  |       if(preference === null) localStorage.removeItem('watchnest-player-volume');
  66  |       else localStorage.setItem('watchnest-player-volume',preference);
  67  |     },preference);
  68  |     await page.route("https://www.youtube.com/iframe_api", route => route.fulfill({contentType:"application/javascript",body:apiStub}));
  69  |     await page.goto(`/watch/player/${dashboard.videos[0].id}`);
  70  |     const slider=page.getByRole('slider',{name:'Volume'});
  71  |     await expect(slider).toHaveValue(preference === '0' ? '0' : preference === '75' ? '75' : '60');
  72  |     const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  73  |     await page.evaluate(()=>{Storage.prototype.setItem=()=>{throw new DOMException('Quota full','QuotaExceededError');};});
  74  |     await slider.focus();await slider.press('ArrowRight');
  75  |     await expect(slider).toHaveValue(preference === '0' ? '1' : preference === '75' ? '76' : '61');
  76  |     expect(errors).toEqual([]);
  77  |   });
  78  | }
  79  | 
  80  | test("synthetic startup: API attaches before delayed iframe document load", async ({
  81  |   page,
  82  | }) => {
  83  |   await prepare(page);
  84  |   // A delayed image keeps iframe load pending; API readiness must not wait for it.
  85  |   let release!: () => void;
  86  |   const held = new Promise<void>((resolve) => {
  87  |     release = resolve;
  88  |   });
  89  |   await page.route("https://www.youtube-nocookie.com/**", async (route) => {
  90  |     if (route.request().url().includes("slow-image")) {
  91  |       await held;
  92  |       await route.fulfill({ status: 204 });
  93  |     } else
  94  |       await route.fulfill({
  95  |         status: 200,
  96  |         contentType: "text/html",
  97  |         body: '<img src="/slow-image">',
  98  |       });
  99  |   });
  100 |   await page.route("https://www.youtube.com/iframe_api", (route) =>
  101 |     route.fulfill({ contentType: "application/javascript", body: apiStub }),
  102 |   );
  103 |   await page.goto(`/watch/player/${dashboard.videos[0].id}`);
  104 |   try {
  105 |     await expect
  106 |       .poll(() => page.evaluate(() => (window as any).__constructs || 0))
  107 |       .toBe(1);
  108 |     await expect(page.getByText("Loading the video player…")).toHaveCount(0);
  109 |     await expect(page.locator("iframe")).toHaveCount(1);
  110 |   } finally {
  111 |     release();
  112 |   }
  113 | });
  114 | 
  115 | test("synthetic startup: late API cannot reconstruct a containment-stopped player", async ({
  116 |   page,
  117 | }) => {
  118 |   await prepare(page);
  119 |   let release!: () => void;
  120 |   const held = new Promise<void>((resolve) => {
  121 |     release = resolve;
  122 |   });
  123 |   await page.route("https://www.youtube.com/iframe_api", async (route) => {
  124 |     await held;
  125 |     await route.fulfill({
  126 |       contentType: "application/javascript",
  127 |       body: apiStub,
  128 |     });
  129 |   });
  130 |   await page.goto(`/watch/player/${dashboard.videos[0].id}`);
  131 |   await expect(
  132 |     page.frameLocator("iframe").getByText("Provider fixture"),
  133 |   ).toBeVisible();
  134 |   await page
  135 |     .locator("iframe")
  136 |     .evaluate((frame) => frame.dispatchEvent(new Event("load")));
  137 |   await expect(
  138 |     page.getByText("Only videos your parent added can play here."),
  139 |   ).toBeVisible();
  140 |   release();
  141 |   await expect
  142 |     .poll(() => page.evaluate(() => Boolean((window as any).YT?.Player)))
  143 |     .toBe(true);
  144 |   expect(await page.evaluate(() => (window as any).__constructs || 0)).toBe(0);
  145 |   await expect(
  146 |     page.getByText("Only videos your parent added can play here."),
  147 |   ).toBeVisible();
  148 |   await expect(page.locator("iframe")).toHaveCount(0);
  149 | });
  150 | 
  151 | test("synthetic startup: late onReady and state events cannot reverse containment", async ({
  152 |   page,
```