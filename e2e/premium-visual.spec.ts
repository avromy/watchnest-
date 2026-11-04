import { test, expect, type Page, type TestInfo } from "@playwright/test";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { relative } from "node:path";
import { dashboard, fixture, profiles, videos } from "./fixtures";

/** All API data and artwork are synthetic. This suite never contacts a signed-in
 * household or records a real YouTube video. Its evidence is layout evidence,
 * not a physical iPad, playback, security, or complete WCAG acceptance claim. */
const viewports = [
  { name: "parent-phone", width: 390, height: 844 },
  { name: "ipad-portrait", width: 768, height: 1024 },
  { name: "ipad-landscape", width: 1024, height: 768 },
  { name: "parent-desktop", width: 1440, height: 1000 },
];
const label = (process.env.WATCHNEST_EVIDENCE_LABEL || "candidate").replace(/[^a-zA-Z0-9_-]/g, "-");
const hash = (data: string | Buffer) => createHash("sha256").update(data).digest("hex");
const git = (...args: string[]) => execFileSync("git", args, { encoding: "utf8" }).trim();
const syntheticVideos = Array.from({ length: 12 }, (_, index) => {
  const i = index % videos.length;
  const video = videos[i];
  return {
  ...video,
  id: `10000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
  title: index < 3 ? video.title : `${video.title}: a little more to explore ${index - 2}`,
  favorite: i === 1,
  thumbnail_url: `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 360"><rect width="640" height="360" fill="${["#cbdcc4", "#e2cda6", "#d1dce6"][i]}"/><circle cx="490" cy="80" r="95" fill="#ffffff" opacity=".3"/><path d="M0 300 Q140 190 290 285 T640 250 V360 H0Z" fill="#284f42" opacity=".2"/><g fill="#284f42">${["<path d='M250 240 310 90 385 240 315 205Z'/><path d='M312 209V280' stroke='#284f42' stroke-width='8'/>", "<rect x='180' y='120' width='280' height='135' rx='12'/><path d='M210 140V240M250 140V240M290 140V240M330 140V240M370 140V240M410 140V240' stroke='#f9f3e9' stroke-width='24'/>", "<path d='M230 240 210 110 290 155 370 110 390 240 310 290Z'/><circle cx='270' cy='210' r='9' fill='#fff'/><circle cx='350' cy='210' r='9' fill='#fff'/>" ][i]}</g></svg>`)}`,
};
});
const syntheticArtwork = syntheticVideos.map(video => decodeURIComponent(video.thumbnail_url.slice("data:image/svg+xml,".length)));
syntheticVideos.forEach(video => { video.thumbnail_url = `https://i.ytimg.com/vi/${video.youtube_video_id}/hqdefault.jpg`; });
const discoverCandidate = { ...syntheticVideos[2], youtube_video_id: "newvideo123", title: "Draw a fox in three steps" };
const discoveryProfile = {
  ...profiles[1], discover_enabled: true, discovery_topics: ["Drawing"], discovery_channels: [],
};

async function synthetic(page: Page, role: "parent" | "child") {
  await page.unroute("**/api/**");
  await fixture(page, role);
  await page.route(/https:\/\/(?:i\.ytimg\.com|img\.youtube\.com)\//, route => {
    const index = videos.findIndex(video => route.request().url().includes(video.youtube_video_id));
    return route.fulfill({ status: 200, contentType: "image/svg+xml", body: syntheticArtwork[Math.max(0, index)] });
  });
  const fulfill = (value: unknown) => ({ status: 200, contentType: "application/json", body: JSON.stringify(value) });
  await page.route("**/api/parent/dashboard", route => route.fulfill(fulfill({ ...dashboard, videos: syntheticVideos })));
  await page.route("**/api/child/library", route => route.fulfill(fulfill({ profile: discoveryProfile, videos: syntheticVideos, collections: dashboard.collections })));
  await page.route("**/api/child/discover?**", route => route.fulfill(fulfill({ results: [{ ...discoverCandidate, request_token: "synthetic-request-token-not-a-real-credential" }] })));
  await page.route("**/api/child/requests", route => route.fulfill(fulfill(route.request().method() === "GET" ? { requests: [{ id: "synthetic-request", kind: "topic", message: "Drawing a fox", status: "pending", created_at: "2026-09-30T10:00:00Z" }] } : { ok: true })));
  await page.route("**/api/parent/session-status", route => route.fulfill(fulfill({ serverNow: new Date().toISOString(), profiles: profiles.map(profile => ({ ...profile, access: { enabled: false, allowed: true, state: "unlimited", remainingSeconds: null, pausedSeconds: null, revision: 0, expiresAt: null }, devices: [] })) })));
  await page.route("https://www.youtube-nocookie.com/**", route => route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><html lang='en'><title>Synthetic preview</title><body style='margin:0;background:#132e25;color:white;display:grid;place-items:center;height:100vh;font:24px system-ui'>Synthetic approved-video preview</body></html>" }));
}

for (const viewport of viewports) {
  const families = ["core", "player-states", ...(viewport.width === 390 || viewport.width === 1440 ? ["parent-details"] : []), ...(viewport.width === 768 || viewport.width === 1024 ? ["child-details", "child-entry"] : [])];
  for (const family of families) {
  test(`premium evidence: ${family} ${viewport.name} ${viewport.width}x${viewport.height}`, async ({ page }, info: TestInfo) => {
    test.setTimeout(180_000);
    await page.setViewportSize(viewport);
    const directory = `test-results/visual-evidence/${label}/${viewport.width}x${viewport.height}${family === "core" ? "" : `/${family}`}`;
    await mkdir(directory, { recursive: true });
    const captures: unknown[] = [];
    const manifest = {
      schema: 1, kind: "synthetic-rendered-browser-evidence", label, family,
      sourceCommit: git("rev-parse", "HEAD"),
      requestedSourceCommit: process.env.WATCHNEST_EVIDENCE_COMMIT || null,
      ciEventCommit: process.env.GITHUB_SHA || null,
      pullRequestHeadCommit: process.env.WATCHNEST_PR_HEAD_SHA || null,
      productionBaseline: "77a5017d938ded03b1530c2b72978cef27273d61",
      sourceWorktreeStatus: git("status", "--porcelain", "--", "src", "public"),
      harnessSha256: hash(await readFile("e2e/premium-visual.spec.ts")),
      fixtureSourceSha256: hash(await readFile("e2e/fixtures.ts")),
      runtimeBaseUrl: info.project.use.baseURL,
      previewUrl: process.env.WATCHNEST_REVIEW_PREVIEW_URL || null,
      previewDeployment: process.env.WATCHNEST_REVIEW_PREVIEW_DEPLOYMENT || null,
      sourceTree: git("rev-parse", "HEAD^{tree}"),
      workingDiffSha256: hash(git("diff", "HEAD", "--", "src", "public", "e2e", "playwright.config.ts")),
      viewport, browser: "Chromium", physicalDevice: false,
      limitations: ["Synthetic API responses and SVG artwork", "Not real iPad Safari/PWA", "No genuine YouTube playback", "DOM accessibility inventory is not a complete accessibility audit", "Independent visual review required"],
      captureInterventions: ["Root-document smooth scrolling is disabled only in the synthetic browser capture; every tile records and verifies its actual scroll position."],
      baselineInterventions: [] as string[],
      captures,
    };
    const saveManifest = async () => {
      await writeFile(`${directory}/manifest.json`, JSON.stringify(manifest, null, 2));
    };
    const capture = async (state: string) => {
      await expect(page.locator("main")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(async () => {
        document.documentElement.style.scrollBehavior = "auto";
        await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
      });
      const scrollTo = async (top: number) => {
        const expected = await page.evaluate(async target => {
          const limit = Math.max(0, document.documentElement.scrollHeight - innerHeight);
          window.scrollTo({ top: target, left: 0, behavior: "instant" });
          await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
          return Math.min(target, limit);
        }, top);
        await expect.poll(async () => page.evaluate(async target => {
          // Cancel a component's queued scrollIntoView animation as well as CSS smooth scroll.
          window.scrollTo({ top: target, left: 0, behavior: "instant" });
          await new Promise<void>(resolve => requestAnimationFrame(() => resolve()));
          return window.scrollY;
        }, expected)).toBe(expected);
      };
      await scrollTo(0);
      const inventory = await page.evaluate(() => {
        const visible = (element: Element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return rect.width > 0 && rect.height > 0 && style.visibility !== "hidden" && style.display !== "none";
        };
        const name = (element: Element) => {
          const labelledby = element.getAttribute("aria-labelledby");
          return element.getAttribute("aria-label") || (labelledby ? labelledby.split(/\s+/).map(id => document.getElementById(id)?.textContent || "").join(" ") : "") || (element instanceof HTMLInputElement || element instanceof HTMLSelectElement || element instanceof HTMLTextAreaElement ? Array.from(element.labels || []).map(label => label.textContent).join(" ") : "") || element.textContent?.trim() || element.getAttribute("title") || element.getAttribute("alt") || "";
        };
        const controls = Array.from(document.querySelectorAll("button,a[href],input:not([type=hidden]),select,textarea,summary,[role=button]")).filter(visible).map(element => {
          const rect = element.getBoundingClientRect();
          return { tag: element.tagName, name: name(element).replace(/\s+/g, " ").trim(), width: Math.round(rect.width), height: Math.round(rect.height), disabled: element.hasAttribute("disabled"), tabIndex: (element as HTMLElement).tabIndex };
        });
        return {
          language: document.documentElement.lang,
          documentWidth: document.documentElement.scrollWidth,
          viewportWidth: innerWidth,
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 1,
          documentHeight: document.documentElement.scrollHeight,
          headings: Array.from(document.querySelectorAll("h1,h2,h3")).filter(visible).map(element => ({ level: element.tagName, text: element.textContent?.trim() })),
          controls,
          unnamedControls: controls.filter(control => !control.name),
          smallTouchTargets: controls.filter(control => control.width < 44 || control.height < 44),
          imagesMissingAlt: Array.from(document.querySelectorAll("img:not([alt])")).filter(visible).length,
          alerts: Array.from(document.querySelectorAll('[role="alert"]')).filter(visible).map(element => element.textContent?.trim()).filter(Boolean),
          dialogs: Array.from(document.querySelectorAll('[role="dialog"]')).filter(visible).map(element => ({ name: name(element), ariaModal: element.getAttribute("aria-modal") })),
          activeElement: document.activeElement?.tagName,
          boundedAssets: Array.from(document.querySelectorAll("img,svg,iframe,.brand")).filter(visible).map((element, index) => {
            const rect = element.getBoundingClientRect();
            const ancestors = [];
            for (let parent = element.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
              const style = getComputedStyle(parent);
              if ([style.overflowX, style.overflowY].some(value => ["hidden", "clip", "auto", "scroll"].includes(value))) {
                const bounds = parent.getBoundingClientRect();
                ancestors.push({ tag: parent.tagName, className: parent.className, bounds: { x: bounds.x, y: bounds.y, width: bounds.width, height: bounds.height }, overflowX: style.overflowX, overflowY: style.overflowY });
              }
            }
            const style = getComputedStyle(element);
            return { id: `A${String(index + 1).padStart(3, "0")}`, objectFit: style.objectFit, objectPosition: style.objectPosition, clipPath: style.clipPath, borderRadius: style.borderRadius, kind: element.tagName, name: name(element), source: element.getAttribute("src"), bounds: { x: rect.x, y: rect.y, width: rect.width, height: rect.height }, clipAncestors: ancestors, edgeReview: "LEFT RIGHT TOP BOTTOM: pixel review pending" };
          }),
        };
      });
      const files: { path: string; sha256: string; region: string; scroll: { x: number; y: number } }[] = [];
      const screenshot = async (suffix: string, fullPage: boolean, region: string) => {
        const path = `${directory}/${state}-${suffix}.png`;
        await page.screenshot({ path, fullPage, animations: "disabled", scale: "css" });
        files.push({ path, sha256: hash(await readFile(path)), region, scroll: await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY })) });
      };
      await screenshot("full", true, "Complete document: LEFT RIGHT TOP BOTTOM");
      if (inventory.documentHeight > viewport.height + 1) {
        await screenshot("top", false, "Readable viewport: LEFT RIGHT TOP");
        for (let y = viewport.height - 80, tile = 1; y < inventory.documentHeight - viewport.height; y += viewport.height - 80, tile += 1) {
          await scrollTo(y);
          await screenshot(`middle-${tile}`, false, `Readable viewport: LEFT RIGHT, document y=${y}`);
        }
        await scrollTo(inventory.documentHeight);
        await screenshot("bottom", false, "Readable viewport: LEFT RIGHT BOTTOM");
      }
      await writeFile(`${directory}/${state}-accessibility.yml`, await page.locator("body").ariaSnapshot());
      captures.push({
        state, route: new URL(page.url()).pathname, viewport, files, inventory,
        assetEvidence: inventory.boundedAssets.map(asset => ({
          identity: `${state}/${viewport.width}x${viewport.height}/${asset.id}`,
          fullPage: files[0].path, bounds: asset.bounds,
          readableViews: files.map(file => file.path),
          edges: { LEFT: { source: files[0].path, x: asset.bounds.x }, RIGHT: { source: files[0].path, x: asset.bounds.x + asset.bounds.width }, TOP: { source: files[0].path, y: asset.bounds.y }, BOTTOM: { source: files[0].path, y: asset.bounds.y + asset.bounds.height } },
          verdict: "PENDING independent pixel inspection; geometry does not establish CLEAN",
        })),
      });
      await saveManifest();
      // Keep assertions after evidence collection so defects remain reviewable.
      expect.soft(inventory.horizontalOverflow, `${state}: horizontal overflow`).toBe(false);
      expect.soft(inventory.imagesMissingAlt, `${state}: images require alt attributes`).toBe(0);
      expect.soft(inventory.unnamedControls, `${state}: interactive controls require names`).toEqual([]);
      expect.soft(inventory.language, `${state}: document language`).toBe("en");
    };
    const finish = async () => {
      await info.attach(`visual-manifest-${family}-${viewport.width}x${viewport.height}`, { path: `${directory}/manifest.json`, contentType: "application/json" });
      console.log(`VISUAL_EVIDENCE ${relative(process.cwd(), directory)}/manifest.json`);
    };
    const json = (value: unknown, status = 200) => ({ status, contentType: "application/json", body: JSON.stringify(value) });
    if (family === "player-states") {
      await synthetic(page, "child");
      let releasePlayer!: () => void;
      const playerGate = new Promise<void>(resolve => { releasePlayer = resolve; });
      await page.route("**/api/child/player?**", async route => { await playerGate; await route.fulfill(json({ error: "The video player could not start safely. Please try again." }, 503)); });
      await page.goto(`/watch/player/${videos[1].id}`, { waitUntil: "domcontentloaded" });
      await expect(page.getByText("Opening your video…", { exact: true })).toBeVisible();
      await capture("player-opening");
      releasePlayer();
      await expect(page.getByRole("heading", { name: "The video player didn’t start", exact: true })).toBeVisible();
      await capture("player-startup-error");
      await page.route("**/api/child/player?**", route => route.fulfill(json({ profile: profiles[1], video: { ...videos[1], made_for_kids: true }, next: videos[2], safe_playback_enabled: true })));
      await page.route("https://www.youtube.com/iframe_api", route => route.abort());
      await page.goto(`/watch/player/${videos[1].id}`);
      await expect(page.getByRole("heading", { name: "The video player didn’t start", exact: true })).toBeVisible();
      await capture("player-monitored-startup-error");
      for (const failure of [
        { name: "authorization", heading: "That video isn’t in your library", status: 403, error: "That video is not in your library." },
        { name: "paused", heading: "Parent paused WatchNest", status: 200, error: "Parent paused WatchNest. Ask Parent to resume." },
        { name: "expired", heading: "Time’s up for now", status: 403, error: "Time’s up for now. Ask Parent for more time." },
      ]) {
        await page.route("**/api/child/player?**", route => route.fulfill(json(failure.name === "paused" ? { profile: profiles[1], video: videos[1], next: null, safe_playback_enabled: true, session_access: { enabled: true, allowed: false, serverNow: new Date().toISOString(), expiresAt: null, remainingSeconds: 0, pausedSeconds: 600, revision: 2, state: "paused" } } : { error: failure.error }, failure.status)));
        await page.goto(`/watch/player/${videos[1].id}`);
        await expect(page.getByRole("heading", { name: failure.heading, exact: true })).toBeVisible();
        await capture(`player-${failure.name}`);
      }
      await page.addInitScript(() => {
        class SyntheticPlayer {
          frame: HTMLIFrameElement;
          events: any;
          state = -1;
          constructor(frame: HTMLIFrameElement, options: any) {
            this.frame = frame; this.events = options.events;
            (window as any).__visualSyntheticPlayer = this;
            window.setTimeout(() => this.events.onReady({ target: this }), 0);
          }
          getIframe() { return this.frame; }
          getVideoData() { return { video_id: this.frame.src.split("/embed/")[1]?.split("?")[0] }; }
          getVideoUrl() { return `https://www.youtube.com/watch?v=${this.getVideoData().video_id}`; }
          playVideo() { this.state = 1; this.events.onStateChange({ target: this, data: 1 }); }
          pauseVideo() { this.state = 2; }
          setVolume() {}
          getCurrentTime() { return this.state === 0 ? 240 : 0; }
          getDuration() { return 240; }
          getPlayerState() { return this.state; }
          finish() { this.state = 0; this.events.onStateChange({ target: this, data: 0 }); }
          destroy() { this.frame.remove(); }
        }
        (window as any).YT = { Player: SyntheticPlayer };
      });
      await page.route("**/api/child/player?**", route => route.fulfill(json({ profile: profiles[1], video: { ...videos[1], made_for_kids: true }, next: videos[2], safe_playback_enabled: true })));
      await page.goto(`/watch/player/${videos[1].id}`);
      await expect(page.locator("iframe")).toBeVisible();
      await page.waitForFunction(() => !!(window as any).__visualSyntheticPlayer);
      await page.evaluate(() => (window as any).__visualSyntheticPlayer.playVideo());
      await capture("player-synthetic-ready-next");
      await page.evaluate(() => (window as any).__visualSyntheticPlayer.finish());
      await expect(page.getByRole("heading", { name: `${videos[1].title} has ended`, exact: true })).toBeVisible();
      await capture("player-synthetic-ended-next");
      await finish();
      return;
    }
    if (family === "parent-details") {
      await synthetic(page, "parent");
      await page.route("**/api/parent/videos/search**", route => {
        const url = new URL(route.request().url());
        const type = url.searchParams.get("type");
        return route.fulfill(json(url.searchParams.has("source") || type === "video" ? { videos: [discoverCandidate], nextPageToken: null } : { items: [{ id: `synthetic-${type}`, type, title: type === "channel" ? "Little Makers Studio" : "Weekend projects", description: "A synthetic family-friendly source", thumbnail_url: syntheticVideos[0].thumbnail_url, channel_title: "Little Makers Studio" }], nextPageToken: null }));
      });
      await page.route("**/api/parent/videos/lookup", route => route.fulfill(json({ videos: [discoverCandidate], errors: [] })));
      await page.goto("/parent/add-video");
      if (!label.startsWith("before-")) await page.getByRole("button", { name: "Paste video links", exact: true }).click();
      await capture("parent-url-intake");
      await page.getByLabel("Paste one YouTube video link per line").fill("https://youtu.be/newvideo123");
      if (label.startsWith("before-")) await page.getByRole("button", { name: "Load videos", exact: true }).click();
      await expect(page.getByRole("heading", { name: discoverCandidate.title, exact: true })).toBeVisible();
      await capture("parent-url-resolved");
      await page.getByRole("checkbox", { name: "Select this video", exact: true }).check();
      await page.getByRole("checkbox", { name: "Ari", exact: true }).check();
      await capture("parent-approval-assignment");
      await page.getByRole("button", { name: /Approve 1 selected videos/ }).click();
      await expect(page.getByText("1 individually selected video approved.", { exact: true })).toBeVisible();
      await capture("parent-approval-success");
      await page.goto("/parent/add-video");
      await page.getByRole("searchbox", { name: "Search", exact: true }).fill("drawing");
      await page.getByRole("button", { name: "Search", exact: true }).click();
      await expect(page.getByRole("heading", { name: discoverCandidate.title, exact: true })).toBeVisible();
      await capture("parent-youtube-search-results");
      await page.getByRole("button", { name: "Preview", exact: true }).first().click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await capture("parent-add-preview-dialog");
      await page.getByRole("button", { name: "Close preview", exact: true }).click();
      for (const type of ["Channels", "Playlists"]) {
        await page.goto("/parent/add-video");
        await page.getByRole("button", { name: type, exact: true }).click();
        await page.getByRole("searchbox", { name: "Search", exact: true }).fill("makers");
        await page.getByRole("button", { name: "Search", exact: true }).click();
        await expect(page.getByRole("button", { name: "Browse videos", exact: true })).toBeVisible();
        await capture(`parent-${type.toLowerCase()}-results`);
        await page.getByRole("button", { name: "Browse videos", exact: true }).click();
        await expect(page.getByRole("heading", { name: discoverCandidate.title, exact: true })).toBeVisible();
        await capture(`parent-${type.toLowerCase()}-videos`);
      }
      await page.goto("/parent/add-video");
      await page.route("**/api/parent/videos/search**", route => route.fulfill(json({ videos: [], nextPageToken: null })));
      await page.getByRole("searchbox", { name: "Search", exact: true }).fill("no matching title");
      await page.getByRole("button", { name: "Search", exact: true }).click();
      await expect(page.getByRole("heading", { name: "No matching videos", exact: true })).toBeVisible();
      await capture("parent-search-empty");
      await page.route("**/api/parent/videos/search**", route => route.fulfill(json({ error: "Video search is taking a moment. Please try again." }, 503)));
      await page.getByRole("button", { name: "Search", exact: true }).click();
      await expect(page.getByText("Video search is taking a moment. Please try again.", { exact: true })).toBeVisible();
      await capture("parent-search-error");
      let releaseSearch!: () => void;
      const searchGate = new Promise<void>(resolve => { releaseSearch = resolve; });
      await page.route("**/api/parent/videos/search**", async route => { await searchGate; await route.fulfill(json({ videos: [] })); });
      await page.getByRole("button", { name: "Search", exact: true }).click();
      await expect(page.getByText("Finding real video details…", { exact: true })).toBeVisible();
      await capture("parent-search-loading");
      releaseSearch();
      await page.goto("/parent/collections");
      await page.getByRole("button", { name: "Edit collection", exact: true }).first().click();
      await expect(page.getByRole("heading", { name: "Edit collection", exact: true })).toBeVisible();
      await capture("parent-collection-edit");
      if (!label.startsWith("before-")) await page.getByText("Share with children", { exact: true }).first().click();
      const share = page.locator("details").filter({ hasText: "Share with children" }).first();
      if (!label.startsWith("before-")) {
        await share.getByRole("checkbox", { name: "Ari", exact: true }).check();
      } else {
        await page.getByRole("checkbox", { name: "Ari", exact: true }).first().check();
      }
      await capture("parent-collection-share");
      await page.getByRole("button", { name: "Share collection", exact: true }).first().click();
      await expect(page.getByText("Collection saved.", { exact: true })).toBeVisible();
      await capture("parent-collection-share-success");
      await page.goto("/parent/children");
      if (!label.startsWith("before-")) await page.getByText("Photo or avatar", { exact: true }).first().click();
      await capture("parent-profile-photo-avatar-settings");
      await page.route("**/api/parent/dashboard", route => route.fulfill(json({ ...dashboard, videos: syntheticVideos, profiles: profiles.map(profile => profile.id === profiles[1].id ? discoveryProfile : profile) })));
      await page.goto("/parent/controls");
      await capture("parent-discovery-permissions-enabled");
      for (const state of ["active", "paused", "expired"]) {
        await page.route("**/api/parent/session-status", route => route.fulfill(json({ serverNow: new Date().toISOString(), profiles: profiles.map((profile, index) => ({ ...profile, session_duration_minutes: index === 0 ? 15 : null, session_expires_at: state === "active" && index === 0 ? new Date(Date.now() + 900000).toISOString() : null, session_paused_seconds: state === "paused" && index === 0 ? 600 : null, session_state_revision: 2, access: { enabled: index === 0, allowed: index !== 0 || state === "active", state: index === 0 ? state : "unlimited", expiresAt: state === "active" && index === 0 ? new Date(Date.now() + 900000).toISOString() : null, remainingSeconds: index === 0 ? state === "active" ? 900 : 0 : null, pausedSeconds: state === "paused" && index === 0 ? 600 : null, revision: 2 }, devices: [] })) })));
        await page.reload();
        await expect(page.getByRole("heading", { name: "Miri", exact: true })).toBeVisible();
        await capture(`parent-remote-timer-${state}`);
      }
      await page.goto("/login");
      await page.route("**/api/auth/parent", route => route.fulfill(json({ error: "We couldn’t sign you in. Check your email and password." }, 403)));
      await page.getByLabel("Email", { exact: true }).fill("synthetic@example.test");
      await page.getByLabel("Password", { exact: true }).fill("synthetic-not-a-real-password");
      await page.getByRole("button", { name: "Sign in", exact: true }).click();
      await expect(page.getByText("We couldn’t sign you in. Check your email and password.", { exact: true })).toBeVisible();
      await capture("parent-sign-in-error");
      const empty = { ...dashboard, videos: [], profiles: [], collections: [], requests: [], attention: [], workflow: { ...dashboard.workflow, approvedVideos: 0, activeChildren: 0, assignedVideos: 0, openRequests: 0, byChild: [] } };
      await page.route("**/api/parent/dashboard", route => route.fulfill(json(empty)));
      for (const route of ["library", "collections", "inbox", "children"]) {
        await page.goto(`/parent/${route}`);
        await expect(page.locator("main h1")).toBeVisible();
        await capture(`parent-${route}-empty`);
      }
      await page.route("**/api/parent/dashboard", route => route.fulfill(json({ error: "Your family space is taking a moment. Please try again." }, 503)));
      await page.goto("/parent/dashboard");
      await expect(page.getByRole("alert")).toContainText("Your family space is taking a moment. Please try again.");
      await capture("parent-dashboard-error");
      await finish();
      return;
    }
    if (family === "child-entry") {
      await synthetic(page, "parent");
      await page.goto("/watch");
      await page.getByRole("button", { name: /Miri/ }).click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await capture("child-pin-dialog");
      await page.route("**/api/auth/child*", route => route.fulfill(json({ error: "That PIN didn’t match. Please try again." }, 403)));
      await page.getByLabel("4-digit PIN", { exact: true }).fill("1234");
      await expect(page.getByRole("dialog").getByRole("alert")).toHaveText("That PIN didn’t match. Please try again.");
      if (!label.startsWith("before-")) await expect(page.getByRole("alert").filter({ hasText: "That PIN didn’t match. Please try again." })).toHaveCount(1);
      await capture("child-pin-error");
      await page.getByRole("button", { name: "Cancel", exact: true }).click();
      await page.getByRole("button", { name: "Parent Mode", exact: true }).click();
      await page.route("**/api/auth/parent-mode*", route => route.fulfill(json({ error: "That Parent PIN didn’t match. Please try again." }, 403)));
      await page.getByLabel("4-digit PIN", { exact: true }).fill("1234");
      await expect(page.getByRole("dialog").getByRole("alert")).toHaveText("That Parent PIN didn’t match. Please try again.");
      if (!label.startsWith("before-")) await expect(page.getByRole("alert").filter({ hasText: "That Parent PIN didn’t match. Please try again." })).toHaveCount(1);
      await capture("parent-pin-error");
      await finish();
      return;
    }
    if (family === "child-details") {
      await synthetic(page, "child");
      let releaseLibrary!: () => void;
      const libraryGate = new Promise<void>(resolve => { releaseLibrary = resolve; });
      await page.route("**/api/child/library", async route => { await libraryGate; await route.fulfill(json({ profile: { ...discoveryProfile, experience_mode: "simple" }, videos: syntheticVideos, collections: dashboard.collections })); });
      await page.goto("/watch/home", { waitUntil: "domcontentloaded" });
      await expect(page.getByText("Opening your library…", { exact: true })).toBeVisible();
      await capture("child-library-loading");
      releaseLibrary();
      await expect(page.getByText(/^Hi, Ari\.?$/, { exact: true })).toBeVisible();
      await capture("child-simple-home");
      await page.getByRole("button", { name: "Library", exact: true }).click();
      await capture("child-simple-library");
      await page.getByPlaceholder("Search your library").fill("piano");
      await expect(page.getByRole("link", { name: /^Play A gentle piano lesson/ }).first()).toBeVisible();
      await capture("child-search-results");
      await page.getByPlaceholder("Search your library").fill("");
      await page.getByRole("button", { name: "Hidden", exact: true }).click();
      await capture("child-hidden-empty");
      await page.route("**/api/child/library", route => route.fulfill(json({ profile: { ...profiles[1], discover_enabled: false, experience_mode: "standard" }, videos: syntheticVideos, collections: dashboard.collections })));
      await page.goto("/watch/home");
      await page.getByRole("button", { name: /^(Discover|Ask Parent)$/ }).click();
      await expect(page.getByLabel("Tell Parent", { exact: true })).toBeVisible();
      await capture("child-discover-disabled-request");
      await page.getByLabel("Tell Parent", { exact: true }).fill("A long new idea about building a treehouse with paper, glue, and recycled boxes");
      await page.getByRole("button", { name: "Send request", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Sent to Parent", exact: true })).toBeVisible();
      await capture("child-discover-disabled-success");
      for (const state of ["expired", "paused"]) {
        await page.route("**/api/child/library", route => route.fulfill(json({ profile: discoveryProfile, videos: syntheticVideos, collections: dashboard.collections, session_access: { enabled: true, allowed: false, serverNow: new Date().toISOString(), expiresAt: null, remainingSeconds: 0, pausedSeconds: state === "paused" ? 600 : null, revision: 2, state } })));
        await page.goto("/watch/home");
        await expect(page.getByRole("button", { name: "Choose profile", exact: true })).toBeVisible();
        await capture(`child-library-timer-${state}`);
      }
      await page.getByRole("button", { name: "Choose profile", exact: true }).click();
      await expect(page.getByRole("heading", { name: "Who’s watching?", exact: true })).toBeVisible();
      await capture("child-profile-switch-return");
      await finish();
      return;
    }
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Sign in", exact: true })).toBeVisible();
    await capture("parent-sign-in");
    await page.getByRole("button", { name: "Forgot password?", exact: true }).click();
    await expect(page.getByRole("heading", { name: "Reset your password", exact: true })).toBeVisible();
    await capture("parent-password-recovery");
    await synthetic(page, "parent");
    for (const section of ["dashboard", "library", "add-video", "collections", "inbox", "children", "controls", "settings"]) {
      await page.goto(`/parent/${section}`);
      await expect(page.locator("main h1")).toBeVisible();
      await capture(`parent-${section}`);
      if (section === "library") {
        await page.getByRole("button", { name: "Preview", exact: true }).first().click();
        await expect(page.getByRole("dialog")).toBeVisible();
        await capture("parent-preview-dialog");
        await page.getByRole("button", { name: "Close preview" }).click();
      }
    }
    await page.goto("/watch");
    await expect(page.getByRole("heading", { name: "Who’s watching?" })).toBeVisible();
    await capture("family-profile-picker");
    await page.getByRole("button", { name: "Parent Mode" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await capture("parent-pin-dialog");

    await synthetic(page, "child");
    await page.goto("/watch/home");
    await expect(page.getByText(/^Hi, Ari\.?$/, { exact: true })).toBeVisible();
    await capture("child-home");
    await page.getByRole("button", { name: "Library", exact: true }).click();
    await capture("child-library");
    await page.getByRole("button", { name: "Favorites", exact: true }).click();
    await capture("child-favorites");
    await page.getByRole("button", { name: "Library", exact: true }).click();
    await page.getByRole("button", { name: /Little Makers/ }).first().click();
    await capture("child-collection");
    await page.getByRole("button", { name: "Library", exact: true }).click();
    await page.getByPlaceholder("Search your library").fill("no matching dinosaur");
    await expect(page.getByRole("heading", { name: "Nothing found" })).toBeVisible();
    await capture("child-search-empty");
    await page.getByRole("button", { name: /Ask Parent for/ }).click();
    await capture("child-request-form");
    await page.getByRole("button", { name: "Send request" }).click();
    if (label.startsWith("before-")) {
      await expect(page.getByRole("heading", { name: "Sent to Parent", includeHidden: true })).toBeAttached();
      if (!(await page.getByRole("heading", { name: "Sent to Parent" }).isVisible())) {
        await page.getByText("Ask Parent another way", { exact: true }).click();
        manifest.baselineInterventions.push("Reopened historical request-success disclosure after successful submission because it had closed. This does not certify baseline usability.");
      }
    }
    await expect(page.getByRole("heading", { name: "Sent to Parent" })).toBeVisible();
    await capture("child-request-sent-pending");
    await page.getByRole("button", { name: "Discover", exact: true }).click();
    await page.getByLabel("What do you want to find?").fill("fox");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page.getByRole("heading", { name: discoverCandidate.title })).toBeVisible();
    await capture("child-discover-results");
    await page.route("**/api/child/library", route => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ profile: discoveryProfile, videos: [], collections: [] }) }));
    await page.goto("/watch/home");
    await expect(page.getByText(/^Hi, Ari\.?$/, { exact: true })).toBeVisible();
    await capture("child-empty-library");
    await page.route("**/api/child/library", route => route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Your library is taking a moment. Please try again." }) }));
    await page.reload();
    await expect(page.getByText("Your library is taking a moment. Please try again.")).toBeVisible();
    await capture("child-library-error");
    await page.route("**/api/child/player?**", route => route.fulfill({ status: 403, contentType: "application/json", body: JSON.stringify({ error: "Time’s up for now. Ask Parent for more time." }) }));
    await page.goto(`/watch/player/${videos[0].id}`);
    await expect(page.getByRole("heading", { name: "Time’s up for now" })).toBeVisible();
    await capture("child-times-up");
    await info.attach(`visual-manifest-${viewport.width}x${viewport.height}`, { path: `${directory}/manifest.json`, contentType: "application/json" });
    // Avoid accidental relative-path ambiguity when logs are opened elsewhere.
    console.log(`VISUAL_EVIDENCE ${relative(process.cwd(), directory)}/manifest.json`);
  });
}
}
