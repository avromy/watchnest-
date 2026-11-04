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
  await page.route("**/api/child/discover?**", route => route.fulfill(fulfill({ results: [{ ...syntheticVideos[2], request_token: "synthetic-request-token-not-a-real-credential" }] })));
  await page.route("**/api/child/requests", route => route.fulfill(fulfill(route.request().method() === "GET" ? { requests: [{ id: "synthetic-request", kind: "topic", message: "Drawing a fox", status: "pending", created_at: "2026-09-30T10:00:00Z" }] } : { ok: true })));
  await page.route("**/api/parent/session-status", route => route.fulfill(fulfill({ serverNow: new Date().toISOString(), profiles: profiles.map(profile => ({ ...profile, access: { enabled: false, allowed: true, state: "unlimited", remainingSeconds: null, pausedSeconds: null, revision: 0, expiresAt: null }, devices: [] })) })));
  await page.route("https://www.youtube-nocookie.com/**", route => route.fulfill({ status: 200, contentType: "text/html", body: "<!doctype html><html lang='en'><title>Synthetic preview</title><body style='margin:0;background:#132e25;color:white;display:grid;place-items:center;height:100vh;font:24px system-ui'>Synthetic approved-video preview</body></html>" }));
}

for (const viewport of viewports) {
  test(`premium evidence: ${viewport.name} ${viewport.width}x${viewport.height}`, async ({ page }, info: TestInfo) => {
    test.setTimeout(180_000);
    await page.setViewportSize(viewport);
    const directory = `test-results/visual-evidence/${label}/${viewport.width}x${viewport.height}`;
    await mkdir(directory, { recursive: true });
    const captures: unknown[] = [];
    const manifest = {
      schema: 1, kind: "synthetic-rendered-browser-evidence", label,
      sourceCommit: git("rev-parse", "HEAD"),
      requestedSourceCommit: process.env.WATCHNEST_EVIDENCE_COMMIT || null,
      ciEventCommit: process.env.GITHUB_SHA || null,
      pullRequestHeadCommit: process.env.WATCHNEST_PR_HEAD_SHA || null,
      productionBaseline: "77a5017d938ded03b1530c2b72978cef27273d61",
      sourceWorktreeStatus: git("status", "--porcelain", "--", "src", "public"),
      harnessSha256: hash(await readFile("e2e/premium-visual.spec.ts")),
      sourceTree: git("rev-parse", "HEAD^{tree}"),
      workingDiffSha256: hash(git("diff", "HEAD", "--", "src", "public", "e2e", "playwright.config.ts")),
      viewport, browser: "Chromium", physicalDevice: false,
      limitations: ["Synthetic API responses and SVG artwork", "Not real iPad Safari/PWA", "No genuine YouTube playback", "DOM accessibility inventory is not a complete accessibility audit", "Independent visual review required"],
      captures,
    };
    const saveManifest = async () => {
      await writeFile(`${directory}/manifest.json`, JSON.stringify(manifest, null, 2));
    };
    const capture = async (state: string) => {
      await expect(page.locator("main")).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await page.evaluate(() => window.scrollTo(0, 0));
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
          dialogs: Array.from(document.querySelectorAll('[role="dialog"]')).filter(visible).map(element => ({ name: name(element), ariaModal: element.getAttribute("aria-modal") })),
          activeElement: document.activeElement?.tagName,
        };
      });
      const files: { path: string; sha256: string; region: string }[] = [];
      const screenshot = async (suffix: string, fullPage: boolean, region: string) => {
        const path = `${directory}/${state}-${suffix}.png`;
        await page.screenshot({ path, fullPage, animations: "disabled", scale: "css" });
        files.push({ path, sha256: hash(await readFile(path)), region });
      };
      await screenshot("full", true, "Complete document: LEFT RIGHT TOP BOTTOM");
      if (inventory.documentHeight > viewport.height + 1) {
        await screenshot("top", false, "Readable viewport: LEFT RIGHT TOP");
        for (let y = viewport.height - 80, tile = 1; y < inventory.documentHeight - viewport.height; y += viewport.height - 80, tile += 1) {
          await page.evaluate(scrollY => window.scrollTo(0, scrollY), y);
          await screenshot(`middle-${tile}`, false, `Readable viewport: LEFT RIGHT, document y=${y}`);
        }
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await screenshot("bottom", false, "Readable viewport: LEFT RIGHT BOTTOM");
      }
      await writeFile(`${directory}/${state}-accessibility.yml`, await page.locator("body").ariaSnapshot());
      captures.push({ state, route: new URL(page.url()).pathname, viewport, files, inventory });
      await saveManifest();
      // Keep assertions after evidence collection so defects remain reviewable.
      expect.soft(inventory.horizontalOverflow, `${state}: horizontal overflow`).toBe(false);
      expect.soft(inventory.imagesMissingAlt, `${state}: images require alt attributes`).toBe(0);
      expect.soft(inventory.unnamedControls, `${state}: interactive controls require names`).toEqual([]);
      expect.soft(inventory.language, `${state}: document language`).toBe("en");
    };
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
    await expect(page.getByRole("heading", { name: "Sent to Parent" })).toBeVisible();
    await capture("child-request-sent-pending");
    await page.getByRole("button", { name: "Discover", exact: true }).click();
    await page.getByLabel("What do you want to find?").fill("fox");
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page.getByRole("heading", { name: syntheticVideos[2].title })).toBeVisible();
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
