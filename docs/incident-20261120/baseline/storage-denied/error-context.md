# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: startup.spec.ts >> synthetic startup: denied preference storage cannot crash approved playback
- Location: e2e/startup.spec.ts:29:5

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
- alert
- main:
  - heading "Let’s try that again." [level=1]
  - paragraph: WatchNest couldn’t load this page. Your library stays protected.
  - button "Try again"
  - link "Go home":
    - /url: /
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
  24  |   await page.route("https://www.youtube-nocookie.com/**", route => route.fulfill({
  25  |     status: 200, contentType: "text/html", body: "<!doctype html><p>Provider fixture</p>",
  26  |   }));
  27  | }
  28  | 
  29  | test("synthetic startup: denied preference storage cannot crash approved playback", async ({ page }) => {
  30  |   await prepare(page);
  31  |   const errors: string[] = [];
  32  |   page.on('pageerror', error => errors.push(error.message));
  33  |   await page.addInitScript(() => {
  34  |     Object.defineProperty(window, 'localStorage', { get() {
  35  |       throw new DOMException('Preference storage denied', 'SecurityError');
  36  |     }});
  37  |   });
  38  |   await page.route("https://www.youtube.com/iframe_api", route => route.fulfill({contentType:"application/javascript",body:apiStub}));
  39  |   await page.goto(`/watch/player/${dashboard.videos[0].id}`);
> 40  |   await expect(page.getByRole('button', { name: 'Play video', exact: true })).toBeVisible();
      |                                                                               ^ Error: expect(locator).toBeVisible() failed
  41  |   await expect(page.getByText('WatchNest couldn’t load this page. Your library stays protected.')).toHaveCount(0);
  42  |   expect(errors).toEqual([]);
  43  | });
  44  | 
  45  | test("synthetic startup: API attaches before delayed iframe document load", async ({ page }) => {
  46  |   await prepare(page);
  47  |   // A delayed image keeps iframe load pending; API readiness must not wait for it.
  48  |   let release!: () => void;
  49  |   const held = new Promise<void>(resolve => { release = resolve; });
  50  |   await page.route("https://www.youtube-nocookie.com/**", async route => {
  51  |     if (route.request().url().includes("slow-image")) {
  52  |       await held;
  53  |       await route.fulfill({status: 204});
  54  |     } else await route.fulfill({status: 200, contentType:"text/html", body:'<img src="/slow-image">'});
  55  |   });
  56  |   await page.route("https://www.youtube.com/iframe_api", route => route.fulfill({contentType:"application/javascript",body:apiStub}));
  57  |   await page.goto(`/watch/player/${dashboard.videos[0].id}`);
  58  |   try {
  59  |     await expect.poll(() => page.evaluate(() => (window as any).__constructs || 0)).toBe(1);
  60  |     await expect(page.getByText("Loading the video player…")).toHaveCount(0);
  61  |     await expect(page.locator("iframe")).toHaveCount(1);
  62  |   } finally { release(); }
  63  | });
  64  | 
  65  | test("synthetic startup: late API cannot reconstruct a containment-stopped player", async ({ page }) => {
  66  |   await prepare(page);
  67  |   let release!: () => void;
  68  |   const held = new Promise<void>(resolve => { release = resolve; });
  69  |   await page.route("https://www.youtube.com/iframe_api", async route => {
  70  |     await held;
  71  |     await route.fulfill({contentType:"application/javascript",body:apiStub});
  72  |   });
  73  |   await page.goto(`/watch/player/${dashboard.videos[0].id}`);
  74  |   await expect(page.frameLocator("iframe").getByText("Provider fixture")).toBeVisible();
  75  |   await page.locator("iframe").evaluate(frame => frame.dispatchEvent(new Event("load")));
  76  |   await expect(page.getByText("Only videos your parent added can play here.")).toBeVisible();
  77  |   release();
  78  |   await expect.poll(() => page.evaluate(() => Boolean((window as any).YT?.Player))).toBe(true);
  79  |   expect(await page.evaluate(() => (window as any).__constructs || 0)).toBe(0);
  80  |   await expect(page.getByText("Only videos your parent added can play here.")).toBeVisible();
  81  |   await expect(page.locator("iframe")).toHaveCount(0);
  82  | });
  83  | 
  84  | test("synthetic startup: late onReady and state events cannot reverse containment", async ({ page }) => {
  85  |   await prepare(page);
  86  |   await page.addInitScript(() => { (window as any).__neverReady = true; });
  87  |   await page.route("https://www.youtube.com/iframe_api", route => route.fulfill({contentType:"application/javascript",body:apiStub}));
  88  |   await page.goto(`/watch/player/${dashboard.videos[0].id}`);
  89  |   await expect.poll(() => page.evaluate(() => Boolean((window as any).__startupPlayer))).toBe(true);
  90  |   await expect(page.frameLocator("iframe").getByText("Provider fixture")).toBeVisible();
  91  |   await page.locator("iframe").evaluate(frame => frame.dispatchEvent(new Event("load")));
  92  |   await expect(page.getByText("Only videos your parent added can play here.")).toBeVisible();
  93  |   await page.evaluate(() => {
  94  |     const p = (window as any).__startupPlayer;
  95  |     p.events.onReady({target:p}); p.events.onStateChange({target:p,data:1});
  96  |     p.events.onError({data:153});
  97  |   });
  98  |   await expect(page.getByText("Only videos your parent added can play here.")).toBeVisible();
  99  |   await expect(page.locator("iframe")).toHaveCount(0);
  100 | });
  101 | 
  102 | test("synthetic startup: missing provider readiness times out and removes frame", async ({ page }) => {
  103 |   await prepare(page);
  104 |   await page.addInitScript(() => { (window as any).__neverReady = true; });
  105 |   await page.route("https://www.youtube.com/iframe_api", route => route.fulfill({contentType:"application/javascript",body:apiStub}));
  106 |   await page.goto(`/watch/player/${dashboard.videos[0].id}`);
  107 |   await expect.poll(() => page.evaluate(() => Boolean((window as any).__startupPlayer))).toBe(true);
  108 |   // Exercise the actual browser timer. A virtual clock also controls the
  109 |   // cross-origin fixture and cannot qualify this real-time startup deadline.
  110 |   await expect(page.getByText("The video player could not start safely. Please try again.")).toBeVisible({ timeout: 25000 });
  111 |   await expect(page.locator("iframe")).toHaveCount(0);
  112 | });
  113 | 
  114 | for (const mode of ["__replaceFrame", "__throwOnReady"]) {
  115 |   test(`synthetic startup: ${mode} fails closed without unmonitored frame`, async ({ page }) => {
  116 |     await prepare(page);
  117 |     await page.addInitScript(mode => { (window as any)[mode] = true; }, mode);
  118 |     await page.route("https://www.youtube.com/iframe_api", route => route.fulfill({contentType:"application/javascript",body:apiStub}));
  119 |     await page.goto(`/watch/player/${dashboard.videos[0].id}`);
  120 |     await expect(page.getByText("The video player could not start safely. Please try again.")).toBeVisible();
  121 |     await expect(page.locator("iframe")).toHaveCount(0);
  122 |   });
  123 | }
  124 | 
  125 | test("synthetic startup: provider error before ready is terminal", async ({ page }) => {
  126 |   await prepare(page);
  127 |   await page.addInitScript(() => { (window as any).__neverReady = true; });
  128 |   await page.route("https://www.youtube.com/iframe_api", route => route.fulfill({contentType:"application/javascript",body:apiStub}));
  129 |   await page.goto(`/watch/player/${dashboard.videos[0].id}`);
  130 |   await expect.poll(() => page.evaluate(() => Boolean((window as any).__startupPlayer))).toBe(true);
  131 |   await page.evaluate(() => (window as any).__startupPlayer.events.onError({data:153}));
  132 |   await expect(page.getByText("The video player could not verify WatchNest. Ask Parent for help.")).toBeVisible();
  133 |   await page.evaluate(() => {
  134 |     const p = (window as any).__startupPlayer;
  135 |     p.events.onReady({target:p});
  136 |   });
  137 |   await expect(page.locator("iframe")).toHaveCount(0);
  138 | });
  139 | 
```