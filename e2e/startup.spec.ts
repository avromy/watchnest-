import { test, expect, type Page } from "@playwright/test";
import { dashboard, fixture } from "./fixtures";

const apiStub = `class Player {
  constructor(frame, options) {
    window.__constructs = (window.__constructs || 0) + 1;
    if (!frame.isConnected) throw new Error('detached-player');
    this.frame = frame; this.events = options.events;
    if (window.__replaceFrame) { this.frame = frame.cloneNode(); frame.replaceWith(this.frame); }
    window.__startupPlayer = this;
    if (!window.__neverReady) setTimeout(() => this.events.onReady({target:this}), window.__readyDelay || 0);
  }
  getIframe() { return this.frame; }
  getVideoUrl() { return 'https://www.youtube.com/watch?v=' + this.frame.src.split('/embed/')[1].split('?')[0]; }
  getVideoData() { return {}; }
  getPlayerState() { return -1; }
  getCurrentTime() { return 0; }
  setVolume() { if(window.__throwOnReady) throw new Error('readiness-exception'); } pauseVideo() {} playVideo() {}
  destroy() { this.frame.remove(); }
}
window.YT = { Player }; window.onYouTubeIframeAPIReady?.();`;
async function prepare(page: Page) {
  await fixture(page, "child");
  await page.route("https://www.youtube-nocookie.com/**", route => route.fulfill({
    status: 200, contentType: "text/html", body: "<!doctype html><p>Provider fixture</p>",
  }));
}

test("synthetic startup: API attaches before delayed iframe document load", async ({ page }) => {
  await prepare(page);
  // A delayed image keeps iframe load pending; API readiness must not wait for it.
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route("https://www.youtube-nocookie.com/**", async route => {
    if (route.request().url().includes("slow-image")) {
      await held;
      await route.fulfill({status: 204});
    } else await route.fulfill({status: 200, contentType:"text/html", body:'<img src="/slow-image">'});
  });
  await page.route("https://www.youtube.com/iframe_api", route => route.fulfill({contentType:"application/javascript",body:apiStub}));
  await page.goto(`/watch/player/${dashboard.videos[0].id}`);
  try {
    await expect.poll(() => page.evaluate(() => (window as any).__constructs || 0)).toBe(1);
    await expect(page.getByText("Loading the video player…")).toHaveCount(0);
    await expect(page.locator("iframe")).toHaveCount(1);
  } finally { release(); }
});

test("synthetic startup: late API cannot reconstruct a containment-stopped player", async ({ page }) => {
  await prepare(page);
  let release!: () => void;
  const held = new Promise<void>(resolve => { release = resolve; });
  await page.route("https://www.youtube.com/iframe_api", async route => {
    await held;
    await route.fulfill({contentType:"application/javascript",body:apiStub});
  });
  await page.goto(`/watch/player/${dashboard.videos[0].id}`);
  await expect(page.frameLocator("iframe").getByText("Provider fixture")).toBeVisible();
  await page.locator("iframe").evaluate(frame => frame.dispatchEvent(new Event("load")));
  await expect(page.getByText("Only videos your parent added can play here.")).toBeVisible();
  release();
  await expect.poll(() => page.evaluate(() => Boolean((window as any).YT?.Player))).toBe(true);
  expect(await page.evaluate(() => (window as any).__constructs || 0)).toBe(0);
  await expect(page.getByText("Only videos your parent added can play here.")).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
});

test("synthetic startup: late onReady and state events cannot reverse containment", async ({ page }) => {
  await prepare(page);
  await page.addInitScript(() => { (window as any).__neverReady = true; });
  await page.route("https://www.youtube.com/iframe_api", route => route.fulfill({contentType:"application/javascript",body:apiStub}));
  await page.goto(`/watch/player/${dashboard.videos[0].id}`);
  await expect.poll(() => page.evaluate(() => Boolean((window as any).__startupPlayer))).toBe(true);
  await expect(page.frameLocator("iframe").getByText("Provider fixture")).toBeVisible();
  await page.locator("iframe").evaluate(frame => frame.dispatchEvent(new Event("load")));
  await expect(page.getByText("Only videos your parent added can play here.")).toBeVisible();
  await page.evaluate(() => {
    const p = (window as any).__startupPlayer;
    p.events.onReady({target:p}); p.events.onStateChange({target:p,data:1});
    p.events.onError({data:153});
  });
  await expect(page.getByText("Only videos your parent added can play here.")).toBeVisible();
  await expect(page.locator("iframe")).toHaveCount(0);
});

test("synthetic startup: missing provider readiness times out and removes frame", async ({ page }) => {
  await prepare(page);
  await page.addInitScript(() => { (window as any).__neverReady = true; });
  await page.route("https://www.youtube.com/iframe_api", route => route.fulfill({contentType:"application/javascript",body:apiStub}));
  await page.goto(`/watch/player/${dashboard.videos[0].id}`);
  await expect.poll(() => page.evaluate(() => Boolean((window as any).__startupPlayer))).toBe(true);
  // Exercise the actual browser timer. A virtual clock also controls the
  // cross-origin fixture and cannot qualify this real-time startup deadline.
  await expect(page.getByText("The video player could not start safely. Please try again.")).toBeVisible({ timeout: 25000 });
  await expect(page.locator("iframe")).toHaveCount(0);
});

for (const mode of ["__replaceFrame", "__throwOnReady"]) {
  test(`synthetic startup: ${mode} fails closed without unmonitored frame`, async ({ page }) => {
    await prepare(page);
    await page.addInitScript(mode => { (window as any)[mode] = true; }, mode);
    await page.route("https://www.youtube.com/iframe_api", route => route.fulfill({contentType:"application/javascript",body:apiStub}));
    await page.goto(`/watch/player/${dashboard.videos[0].id}`);
    await expect(page.getByText("The video player could not start safely. Please try again.")).toBeVisible();
    await expect(page.locator("iframe")).toHaveCount(0);
  });
}

test("synthetic startup: provider error before ready is terminal", async ({ page }) => {
  await prepare(page);
  await page.addInitScript(() => { (window as any).__neverReady = true; });
  await page.route("https://www.youtube.com/iframe_api", route => route.fulfill({contentType:"application/javascript",body:apiStub}));
  await page.goto(`/watch/player/${dashboard.videos[0].id}`);
  await expect.poll(() => page.evaluate(() => Boolean((window as any).__startupPlayer))).toBe(true);
  await page.evaluate(() => (window as any).__startupPlayer.events.onError({data:153}));
  await expect(page.getByText("The video player could not verify WatchNest. Ask Parent for help.")).toBeVisible();
  await page.evaluate(() => {
    const p = (window as any).__startupPlayer;
    p.events.onReady({target:p});
  });
  await expect(page.locator("iframe")).toHaveCount(0);
});
