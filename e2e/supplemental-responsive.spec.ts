import { test, expect, type Page, type TestInfo } from "@playwright/test";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { relative } from "node:path";
import { dashboard, fixture, profiles, videos } from "./fixtures";

/** All API data and artwork are synthetic. This suite never contacts a signed-in
 * household or records a real YouTube video. Its evidence is layout evidence,
 * not a physical iPad, playback, security, or complete WCAG acceptance claim. */
const viewports = [[360,800],[412,915],[520,900],[640,900],[820,1180],[900,900],[1180,820],[1280,800]].map(([width,height]) => ({name:`responsive-${width}`,width,height}));
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
  const family = "supplemental-responsive";
  test(`responsive pixels ${viewport.width}x${viewport.height}`, async ({ page }, info: TestInfo) => {
    test.setTimeout(120_000);
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
      harnessSha256: hash(await readFile("e2e/supplemental-responsive.spec.ts")),
      fixtureSourceSha256: hash(await readFile("e2e/fixtures.ts")),
      runtimeBaseUrl: info.project.use.baseURL,
      previewUrl: process.env.WATCHNEST_REVIEW_PREVIEW_URL || null,
      previewDeployment: process.env.WATCHNEST_REVIEW_PREVIEW_DEPLOYMENT || null,
      sourceTree: git("rev-parse", "HEAD^{tree}"), applicationSourceTree: git("rev-parse", "HEAD:src"), frozenApplicationCommit: "da6edbb4436fc6f455eaef87ace5df61c3e62396",
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
      if (viewport.width === 360 && state === "child-home") {
        // Independent pixel inspection requested an unoccluded shortcut view.
        await scrollTo(500);
        await screenshot("shortcut-readable", false, "Readable shortcut assets above fixed navigation; verified document scroll y=500 or clamped limit");
        await scrollTo(0);
      }
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
    await synthetic(page, "parent");
    for (const section of ["dashboard", "add-video"]) {
      await page.goto(`/parent/${section}`);
      await expect(page.locator("main h1")).toBeVisible();
      await capture(`parent-${section}`);
    }
    await page.goto("/watch");
    await expect(page.getByRole("heading", { name: "Who’s watching?" })).toBeVisible();
    await capture("family-profile-picker");
    await synthetic(page, "child");
    await page.goto("/watch/home");
    await expect(page.getByText("Hi, Ari.", { exact: true })).toBeVisible();
    await capture("child-home");
    await page.getByRole("button", { name: "Library", exact: true }).click();
    await capture("child-library");
    await finish();
  });
}
