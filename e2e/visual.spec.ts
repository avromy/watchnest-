import { test, expect } from "@playwright/test";
import { fixture, profiles, videos } from "./fixtures";
import { mkdir } from "node:fs/promises";
test("synthetic visual evidence: parent and child surfaces", async ({
  page,
}) => {
  await mkdir("docs/evidence", { recursive: true });
  await fixture(page, "parent");
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/parent/dashboard");
  await expect(
    page.getByRole("heading", { name: "Family overview" }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/evidence/parent-overview-synthetic.png",
    fullPage: true,
  });
  await page.goto("/parent/children");
  await expect(
    page.getByRole("heading", { name: "Miri", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/evidence/parent-children-synthetic.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1024, height: 900 });
  await page.goto("/parent/settings");
  await expect(
    page.getByRole("heading", { name: "1. Safe Playback" }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/evidence/parent-settings-tablet-synthetic.png",
    fullPage: true,
  });
  await page.goto("/parent/add-video");
  await expect(
    page.getByRole("heading", { name: "Find videos" }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/evidence/parent-add-videos-tablet-synthetic.png",
    fullPage: true,
  });
  await page.unroute("**/api/**");
  await fixture(page, "child");
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/watch/home");
  await expect(page.getByText("Hi, Ari", { exact: true })).toBeVisible();
  await page.screenshot({
    path: "docs/evidence/child-tablet-synthetic.png",
    fullPage: true,
  });
  const playerVideo = { ...videos[1], made_for_kids: true };
  await page.route("**/api/child/player?**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        profile: profiles[1],
        video: playerVideo,
        next: videos[2],
        safe_playback_enabled: true,
      }),
    }),
  );
  await page.route("https://www.youtube-nocookie.com/**", (route) =>
    route.fulfill({
      status: 200,
      contentType: "text/html",
      body: "<!doctype html><style>html,body{margin:0;height:100%;background:#101a17;color:white;font:16px system-ui;display:grid;place-items:center}button{font:inherit;border:0;border-radius:999px;padding:14px 22px}</style><button aria-label='Play video'>&#9654; Play</button>",
    }),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`/watch/player/${playerVideo.id}`);
  await expect(
    page.locator(`iframe[title="${playerVideo.title}"]`),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/evidence/child-player-mobile-synthetic.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.screenshot({
    path: "docs/evidence/child-player-tablet-synthetic.png",
    fullPage: true,
  });
  await page.unroute("**/api/**");
  await fixture(page, "parent");
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.goto("/watch");
  await expect(
    page.getByRole("heading", { name: "Who’s watching?" }),
  ).toBeVisible();
  await page.screenshot({
    path: "docs/evidence/profile-picker-tablet-synthetic.png",
    fullPage: true,
  });
});
