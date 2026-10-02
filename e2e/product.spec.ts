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
  await expect(
    page.getByRole("heading", { name: "Their favorites. Your peace of mind." }),
  ).toBeVisible();
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
    page.getByRole("heading", {
      name: "A little watching. A lot of curiosity.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Your library & requests" }),
  ).toBeVisible();
  await expect(
    page.getByRole("region", { name: "Ari library status" }),
  ).toContainText("3 approved videos");
  await expect(
    page.getByRole("region", { name: "Miri library status" }),
  ).toContainText("0 approved videos");
  await expect(
    page.getByText(
      "WatchNest reports approvals, assignments and requests. It does not report YouTube watch time.",
      { exact: true },
    ),
  ).toBeVisible();
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
  await expect(page.getByLabel("Video, show, creator or topic")).toHaveValue(
    "Lego trains",
  );
});
test("synthetic UI: child searches local library and asks parent on no match", async ({
  page,
}) => {
  const changes = await fixture(page, "child");
  await page.goto("/watch/home");
  await expect(page.getByRole("heading", { name: /Ari/ })).toBeVisible();
  const search = page.getByPlaceholder("Try a video, show, or topic");
  await search.fill("no matching dinosaur");
  await expect(
    page.getByRole("heading", { name: "No videos found yet" }),
  ).toBeVisible();
  await page
    .locator(".empty")
    .getByRole("button", { name: "Ask Parent", exact: true })
    .click();
  await expect(
    page.getByRole("heading", { name: "Ask Parent", exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Send to Parent" }).click();
  await expect(
    page.getByRole("heading", { name: "Your request is on its way!" }),
  ).toBeVisible();
  expect(
    changes.some(
      (c) =>
        c.path === "/api/child/requests" && c.body.message.includes("dinosaur"),
    ),
  ).toBe(true);
});
test("synthetic UI: mobile and tablet pages fit viewport", async ({ page }) => {
  await fixture(page, "parent");
  for (const width of [390, 768, 1024]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/parent/children", "/parent/library"]) {
      await page.goto(path);
      await expect(page.locator("main h1")).toBeVisible();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth + 1,
      );
      expect(overflow).toBe(false);
    }
  }
});

test("synthetic UI: Made-for-Kids playback uses a direct identified embed", async ({
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
      }),
    }),
  );
  await page.route("https://www.youtube-nocookie.com/**", (route) =>
    route.abort(),
  );
  await page.goto(`/watch/player/${madeForKids.id}`);
  const iframe = page.locator('iframe[title="A gentle piano lesson"]');
  await expect(iframe).toBeVisible();
  const src = new URL((await iframe.getAttribute("src"))!);
  expect(src.origin).toBe("https://www.youtube-nocookie.com");
  expect(src.pathname).toBe(`/embed/${madeForKids.youtube_video_id}`);
  expect(src.searchParams.get("origin")).toBe("http://127.0.0.1:3001");
  expect(src.searchParams.get("enablejsapi")).toBeNull();
  await expect(page.getByText("Resume is off for this video.")).toBeVisible();
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
    page.getByText(
      "The YouTube player is shown below. Press Play to begin; resume is temporarily unavailable.",
    ),
  ).toBeVisible();
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
    dialog.getByText(/Child access still follows the assignments/),
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
    page.getByText(
      "WatchNest reports approvals, assignments and requests. It does not report YouTube watch time.",
      { exact: true },
    ),
  ).toBeVisible();
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
