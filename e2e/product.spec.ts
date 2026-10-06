import { test, expect } from "@playwright/test";
import { dashboard, fixture } from "./fixtures";
test.afterEach(async ({ page }, info) => {
  if (info.status !== info.expectedStatus) {
    await page
      .screenshot({ path: info.outputPath("failure.png"), fullPage: true })
      .catch(() => {});
    console.log(
      await page
        .evaluate(() => ({
          viewport: [innerWidth, innerHeight],
          bodyRect: document.body.getBoundingClientRect().toJSON(),
          heading: [...document.querySelectorAll("h1")].map((e) => ({
            text: e.textContent,
            style: getComputedStyle(e).display,
            rect: e.getBoundingClientRect().toJSON(),
          })),
          bodyStyle: getComputedStyle(document.body).display,
        }))
        .catch(() => ({ closed: true })),
    );
  }
});

test("real HTTP: absent infrastructure fails closed; no sample family or iframe", async ({
  page,
  request,
}) => {
  const session = await request.get("/api/session");
  expect(await session.json()).toEqual({ role: null, configured: false });
  const denied = await request.get(
    "/api/child/player?videoId=10000000-0000-4000-8000-000000000001",
  );
  expect(denied.status()).toBe(503);
  const cross = await request.post("/api/parent/videos", {
    headers: { Origin: "https://evil.test" },
    data: {},
  });
  expect(cross.status()).toBe(403);
  await page.goto("/watch/player/10000000-0000-4000-8000-000000000001");
  await expect(
    page.getByRole("heading", { name: "This video is unavailable" }),
  ).toBeVisible();
  expect(await page.locator("iframe").count()).toBe(0);
});
test("real HTTP: public entry, protected parent redirect, and unknown page", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Sign in" })).toBeVisible();
  await page.goto("/parent/dashboard");
  await expect(page).toHaveURL(/\/login$/);
  await page.goto("/this-page-does-not-exist");
  await expect(
    page.getByRole("heading", { name: "This page isn’t here." }),
  ).toBeVisible();
});
test("synthetic UI: parent navigation covers management, inbox, and independent access", async ({
  page,
}) => {
  await fixture(page, "parent");
  await page.goto("/parent/dashboard");
  await expect(
    page.getByRole("heading", { name: "Family overview" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Library and requests" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Ari library status" }),
  ).toContainText("3 approved videos");
  await expect(
    page.getByRole("region", { name: "Miri library status" }),
  ).toContainText("0 approved videos");
  await expect(
    page.getByText("Shared with children", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/assignments/i)).toHaveCount(0);
  await page.getByRole("link", { name: "Children", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Miri", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Eli", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Inbox/ }).click();
  await expect(
    page.getByRole("heading", { name: "Lego trains" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Find a video" }).click();
  await expect(page.getByRole("searchbox", { name: "Search" })).toHaveValue(
    "Lego trains",
  );
});
test("synthetic UI: child searches local library and asks parent on no match", async ({
  page,
}) => {
  const changes = await fixture(page, "child");
  await page.goto("/watch/home");
  await expect(page.getByText("Hi, Ari", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Library", exact: true }).click();
  const search = page.getByPlaceholder("Search your library");
  await search.fill("no matching dinosaur");
  await expect(
    page.getByRole("heading", { name: "Nothing found" }),
  ).toBeVisible();
  await page.getByRole("button", { name: /Ask Parent for/ }).click();
  await expect(
    page.getByRole("heading", { name: "Ask Parent", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Send request" }).click();
  await expect(
    page.getByRole("heading", { name: "Sent to Parent" }),
  ).toBeVisible();
  expect(
    changes.some(
      (c) =>
        c.path === "/api/child/requests" && c.body.message.includes("dinosaur"),
    ),
  ).toBe(true);
});

test("synthetic UI: a video-card tap requests immersive playback before navigation", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(Element.prototype, "requestFullscreen", {
      configurable: true,
      value: () => {
        window.sessionStorage.setItem("immersive-requested", "yes");
        return Promise.reject(new Error("synthetic fullscreen denial"));
      },
    });
  });
  await fixture(page, "child");
  await page.route("https://www.youtube.com/iframe_api", (route) =>
    route.abort(),
  );
  await page.route("https://www.youtube-nocookie.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "" }),
  );
  await page.goto("/watch/home");
  await page
    .getByRole("link", { name: "Play Build a paper rocket" })
    .first()
    .click();
  await expect(page).toHaveURL(/\/watch\/player\//);
  expect(
    await page.evaluate(() =>
      window.sessionStorage.getItem("immersive-requested"),
    ),
  ).toBe("yes");
});

test("synthetic UI: shared device opens the profile picker and Parent Mode stays protected", async ({
  page,
}) => {
  const changes = await fixture(page, "parent");
  await page.goto("/watch");
  await expect(
    page.getByRole("heading", { name: "Who’s watching?" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: /Miri/ })).toBeVisible();
  await page.getByRole("button", { name: "Parent Mode" }).click();
  await expect(
    page.getByRole("heading", { name: "Parent Mode" }),
  ).toBeVisible();
  await page.getByLabel("4-digit PIN").fill("1234");
  await expect
    .poll(() =>
      changes.some((change) => change.path === "/api/auth/parent-mode"),
    )
    .toBe(true);
});
test("synthetic UI: mobile and tablet pages fit viewport", async ({ page }) => {
  await fixture(page, "parent");
  for (const width of [
    360, 390, 412, 520, 640, 768, 900, 1024, 1180, 1280, 1440,
  ]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of [
      "/parent/children",
      "/parent/library",
      "/parent/add-video",
      "/parent/settings",
    ]) {
      await page.goto(path);
      await expect(page.locator("main h1")).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      expect(overflow).toBe(false);
    }
  }
  await page.unroute("**/api/**");
  await fixture(page, "child");
  for (const width of [360, 390, 768, 1024, 1180]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/watch", "/watch/home"]) {
      await page.goto(path);
      await expect(page.locator("main h1")).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      expect(overflow).toBe(false);
    }
  }
  await page.unroute("**/api/**");
  await fixture(page, "parent");
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/parent/children");
  const dashboardBox = await page
    .getByRole("link", { name: "Dashboard", exact: true })
    .boundingBox();
  const settingsBox = await page
    .getByRole("link", { name: "Settings", exact: true })
    .boundingBox();
  expect(dashboardBox).not.toBeNull();
  expect(settingsBox).not.toBeNull();
  expect(Math.abs(settingsBox!.y - dashboardBox!.y)).toBeLessThan(3);

  await page.goto("/parent/settings");
  await expect(
    page.getByRole("heading", { name: "1. Safe Playback" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "2. Enhanced YouTube protection" }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "3. Dedicated WatchNest device" }),
  ).toBeVisible();
  await expect(page.getByText("Limited on iPad")).toBeVisible();
  const settingsLink = page.getByRole("link", {
    name: "Settings",
    exact: true,
  });
  const settingsBoxAfterScroll = await settingsLink.boundingBox();
  expect(settingsBoxAfterScroll).not.toBeNull();
  expect(settingsBoxAfterScroll!.x).toBeGreaterThanOrEqual(0);
  expect(
    settingsBoxAfterScroll!.x + settingsBoxAfterScroll!.width,
  ).toBeLessThanOrEqual(1024);
});

test("synthetic UI: Safe Playback reports beside its own control", async ({
  page,
}) => {
  await fixture(page, "parent");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/parent/settings");
  const toggle = page.getByRole("checkbox");
  await toggle.uncheck();
  const status = page.getByText("Safe Playback is off.", { exact: true });
  await expect(status).toBeVisible();
  const toggleBox = await toggle.boundingBox();
  const statusBox = await status.boundingBox();
  expect(toggleBox).not.toBeNull();
  expect(statusBox).not.toBeNull();
  expect(statusBox!.y - toggleBox!.y).toBeLessThan(260);
  const activeSettings = page.getByRole("link", {
    name: "Settings",
    exact: true,
  });
  const activeBox = await activeSettings.boundingBox();
  expect(activeBox).not.toBeNull();
  expect(activeBox!.x).toBeGreaterThanOrEqual(0);
  expect(activeBox!.x + activeBox!.width).toBeLessThanOrEqual(390);
});

test("synthetic UI: Made-for-Kids playback uses a direct identified embed", async ({
  page,
  context,
}) => {
  await fixture(page, "child");
  const madeForKids = { ...dashboard.videos[1], made_for_kids: true };
  await page.route("**/api/child/player?**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        profile: dashboard.profiles[1],
        video: madeForKids,
        next: null,
        safe_playback_enabled: true,
      }),
    }),
  );
  await page.route("https://www.youtube-nocookie.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: `<!doctype html>
        <a id="title" href="https://www.youtube.com/watch?v=escape" target="_top">Title</a>
        <a id="logo" href="https://www.youtube.com/" target="_blank">YouTube</a>
        <a id="deep" href="youtube://watch?v=escape" target="_top">App</a>
        <button id="popup" onclick="window.open('https://www.youtube.com/watch?v=escape')">Watch on YouTube</button>`,
    }),
  );
  await page.goto(`/watch/player/${madeForKids.id}`);
  const iframe = page.locator('iframe[title="A gentle piano lesson"]');
  await expect(iframe).toBeVisible();
  const src = new URL((await iframe.getAttribute("src"))!);
  expect(src.origin).toBe("https://www.youtube-nocookie.com");
  expect(src.pathname).toBe(`/embed/${madeForKids.youtube_video_id}`);
  expect(src.searchParams.get("origin")).toBe("http://127.0.0.1:3001");
  expect(src.searchParams.get("enablejsapi")).toBeNull();
  expect(src.searchParams.get("autoplay")).toBeNull();
  expect(src.searchParams.get("controls")).toBe("1");
  expect(src.searchParams.get("iv_load_policy")).toBe("3");
  expect(src.searchParams.get("playsinline")).toBe("1");
  expect(src.searchParams.get("rel")).toBe("0");
  expect(src.searchParams.get("fs")).toBeNull();
  expect(src.searchParams.get("disablekb")).toBeNull();
  expect(src.searchParams.get("modestbranding")).toBeNull();
  expect(src.searchParams.get("showinfo")).toBeNull();
  expect(await iframe.getAttribute("sandbox")).toBe(
    "allow-scripts allow-same-origin allow-presentation",
  );
  const provider = page.frameLocator('iframe[title="A gentle piano lesson"]');
  for (const selector of ["#title", "#logo", "#deep", "#popup"]) {
    await provider.locator(selector).click();
    await page.waitForTimeout(100);
    expect(page.url()).toContain("/watch/player/");
    expect(context.pages()).toHaveLength(1);
  }
  await expect(page.getByText(/Safe Playback is on/i)).toBeVisible();
  await expect(page.getByText(/resume is off/i)).toHaveCount(0);
});

test("synthetic UI: Safe Playback off preserves authorization but removes containment", async ({
  page,
}) => {
  await fixture(page, "child");
  const madeForKids = { ...dashboard.videos[1], made_for_kids: true };
  await page.route("**/api/child/player?**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        profile: dashboard.profiles[1],
        video: madeForKids,
        next: null,
        safe_playback_enabled: false,
      }),
    }),
  );
  await page.route("https://www.youtube-nocookie.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "" }),
  );
  await page.goto(`/watch/player/${madeForKids.id}`);
  const iframe = page.locator('iframe[title="A gentle piano lesson"]');
  await expect(iframe).toBeVisible();
  expect(await iframe.getAttribute("sandbox")).toBeNull();
  await expect(page.getByText(/Safe Playback is on/i)).toHaveCount(0);
});

test("synthetic UI: optional resume bootstrap failure falls back to playback", async ({
  page,
}) => {
  await fixture(page, "child");
  await page.route("https://www.youtube.com/iframe_api", (route) =>
    route.abort(),
  );
  await page.route("https://www.youtube-nocookie.com/**", (route) =>
    route.abort(),
  );
  const video = dashboard.videos[0];
  await page.goto(`/watch/player/${video.id}`);
  await expect(
    page.getByText("Press Play to begin.", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/YouTube player|resume is/i)).toHaveCount(0);
  await expect(page.locator(`iframe[title="${video.title}"]`)).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "This video is unavailable" }),
  ).toHaveCount(0);
});

test("synthetic UI: Parent Library offers an obvious playback preview", async ({
  page,
}) => {
  await fixture(page, "parent");
  await page.route("https://www.youtube-nocookie.com/**", (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "" }),
  );
  await page.goto("/parent/library");
  const previewButton = page.getByRole("button", { name: "Preview" }).first();
  await previewButton.click();
  const dialog = page.getByRole("dialog");
  await expect(
    dialog.getByRole("heading", { name: "Build a paper rocket" }),
  ).toBeVisible();
  await expect(
    dialog.locator('iframe[title="Build a paper rocket"]'),
  ).toBeVisible();
  await expect(
    dialog.getByText(/Child access still follows.*Who can watch/),
  ).toBeVisible();
  await expect(
    dialog.getByText(/Press Play and confirm the approved video still starts/),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "Close preview" }).click();
  await expect(previewButton).toBeFocused();
});

test("synthetic UI: dashboard reports workflow and suppresses supplied viewing analytics", async ({
  page,
}) => {
  await fixture(page, "parent");
  // Fixture contains fake eligible watch time, recent videos and popularity data.
  // None may become a parent-facing YouTube engagement report.
  await page.goto("/parent/dashboard");
  await expect(
    page.getByRole("region", { name: "Ari library status" }),
  ).toContainText("3 approved videos");
  await expect(
    page.getByText("Shared with children", { exact: true }),
  ).toBeVisible();
  await expect(page.getByText(/assignments/i)).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Eligible viewing insights" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("heading", {
      name: /Most watched|Recent.*viewing|viewing this week/i,
    }),
  ).toHaveCount(0);
  await expect(page.getByRole("meter")).toHaveCount(0);
  await expect(
    page.getByText(/^(Eligible watch time|Watched today|Last 7 days)/),
  ).toHaveCount(0);
  await expect(
    page.getByText(dashboard.analytics.popular[0].title, { exact: true }),
  ).toHaveCount(0);
});
