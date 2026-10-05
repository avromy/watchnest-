import { test, expect } from "@playwright/test";
import { fixture } from "./fixtures";
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
  await expect(page.getByRole("heading", { name: "Safe Playback" })).toBeVisible();
  await page.screenshot({
    path: "docs/evidence/parent-settings-tablet-synthetic.png",
    fullPage: true,
  });
  await page.goto("/parent/add-video");
  await expect(page.getByRole("heading", { name: "Find videos" })).toBeVisible();
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
