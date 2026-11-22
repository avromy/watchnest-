import { test, expect } from "@playwright/test";
import { dashboard, fixture } from "./fixtures";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

async function captureModeState(
  page: import("@playwright/test").Page,
  card: import("@playwright/test").Locator,
  state: string,
) {
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1180 });
    await card.scrollIntoViewIfNeeded();
    const path = test.info().outputPath(`experience-${state}-${width}.png`);
    await page.screenshot({ path, fullPage: true, animations: "disabled" });
    const records = await card.locator("h2,p,label,select,button,svg").evaluateAll((elements) =>
      elements.map((element) => {
        const box = element.getBoundingClientRect();
        return { tag: element.tagName, text: element.textContent, x: box.x + window.scrollX, y: box.y + window.scrollY, width: box.width, height: box.height, disabled: element.hasAttribute("disabled") };
      }),
    );
    await test.info().attach(`experience-${state}-${width}`, { path, contentType: "image/png" });
    const sha = (value: Buffer) => createHash("sha256").update(value).digest("hex");
    await test.info().attach(`experience-${state}-${width}-geometry`, { body: JSON.stringify({
      state, viewport: page.viewportSize(), coordinateSystem: "document pixels; full-page screenshot", records,
      buildId: readFileSync(".next/BUILD_ID", "utf8").trim(),
      parentSourceSha256: sha(readFileSync("src/components/parent/ParentApp.tsx")),
      imageSha256: sha(readFileSync(path)),
      scope: "synthetic browser, not hosted/device or independent visual acceptance",
    }, null, 2), contentType: "application/json" });
  }
}

// Browser-only stateful contract fixture; never writes family data or proves DB persistence.
async function prepare(page: import("@playwright/test").Page) {
  await fixture(page, "parent");
  const family = structuredClone(dashboard);
  const writes: Record<string, unknown>[] = [];
  let rejectSave = false;
  await page.route("**/api/parent/dashboard", (route) => route.fulfill({ json: family }));
  await page.route("**/api/parent/profiles", async (route) => {
    const body = route.request().postDataJSON();
    writes.push(body);
    if (rejectSave) return route.fulfill({ status: 503, json: { error: "Synthetic profile save unavailable" } });
    const profile = family.profiles.find((item) => item.id === body.id);
    if (profile) Object.assign(profile, body);
    await route.fulfill({ json: { ok: true } });
  });
  await page.route("**/api/child/library", (route) => route.fulfill({ json: {
    profile: family.profiles[1], videos: family.videos, collections: family.collections,
  } }));
  await page.goto("/parent/children");
  const card = page.locator("section.panel").filter({ has: page.getByRole("heading", { name: "Ari", exact: true }) });
  return { family, writes, card, rejectNextSaves: () => { rejectSave = true; }, allowSaves: () => { rejectSave = false; } };
}

test("existing Standard profiles remain Standard until explicitly saved", async ({ page }) => {
  const { writes, card } = await prepare(page);
  const selectors = page.getByRole("combobox", { name: "Library experience", exact: true });
  await expect(selectors).toHaveCount(4);
  for (const selector of await selectors.all()) await expect(selector).toHaveValue("standard");
  expect(writes).toEqual([]);
  await captureModeState(page, card, "default-standard");
});

test("Parent can save Simple, reload its persisted fixture value, and open the existing Simple library", async ({ page }) => {
  const { card, writes, family } = await prepare(page);
  await card.getByRole("combobox", { name: "Library experience", exact: true }).selectOption("simple");
  expect(writes).toEqual([]);
  await card.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(card.getByText("Changes saved.", { exact: true })).toBeVisible();
  expect(writes).toHaveLength(1);
  expect(writes[0]).toMatchObject({ id: family.profiles[1].id, experience_mode: "simple", pin_enabled: true, avatar_key: "fox" });
  expect(family.profiles[0].experience_mode).toBe("standard");
  await captureModeState(page, card, "saved-simple");
  await page.reload();
  await expect(card.getByRole("combobox", { name: "Library experience", exact: true })).toHaveValue("simple");
  await card.getByRole("button", { name: "View as Ari", exact: true }).click();
  await expect(page).toHaveURL(/\/watch\/home$/);
  await expect(page.locator('[data-experience-mode="simple"]')).toBeVisible();
  await expect(page.locator(".library-more summary")).toHaveText("More");
  await expect(page.getByRole("button", { name: "Hidden", exact: true })).toHaveCount(0);
  await page.locator(".library-more summary").click();
  await expect(page.getByRole("button", { name: "Hidden", exact: true })).toBeVisible();
});

test("failed experience save preserves the draft for retry without changing stored fixture mode", async ({ page }) => {
  const { card, family, rejectNextSaves, allowSaves } = await prepare(page);
  rejectNextSaves();
  await card.getByRole("combobox", { name: "Library experience", exact: true }).selectOption("simple");
  await card.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Synthetic profile save unavailable" })).toBeVisible();
  await expect(card.getByRole("combobox", { name: "Library experience", exact: true })).toHaveValue("simple");
  await expect(card.getByRole("button", { name: "Save changes", exact: true })).toBeEnabled();
  expect(family.profiles[1].experience_mode).toBe("standard");
  await captureModeState(page, card, "save-error");
  allowSaves();
  await card.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(card.getByText("Changes saved.", { exact: true })).toBeVisible();
  expect(family.profiles[1].experience_mode).toBe("simple");
});
