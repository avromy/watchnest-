import { test, expect } from "@playwright/test";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { fixture, profiles } from "./fixtures";

test("synthetic Parent access: PIN-off status is distinct from device wait", async ({
  page,
}) => {
  await fixture(page, "parent");
  await page.route("**/api/parent/profile-access?*", (r) =>
    r.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        serverNow: "2026-11-23T12:00:00Z",
        pin: { required: false, limited: false, windowExpiresAt: null },
        admission: { limited: true, windowExpiresAt: "2026-11-23T12:00:40Z" },
      }),
    }),
  );
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/parent/children");
  const access = page.getByRole("region", {
    name: "Benny access on this device",
  });
  await access
    .getByRole("button", { name: "Check access", exact: true })
    .click();
  await expect(
    access.getByText("Child PIN is off. No child PIN wait applies."),
  ).toBeVisible();
  await expect(access.getByText(/Device entry is limited until/)).toBeVisible();
  await expect(access.getByText(/Checked at/)).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  for (const width of [390, 820]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 1180 });
    await access.scrollIntoViewIfNeeded();
    const path = test.info().outputPath(`parent-access-${width}.png`);
    await page.screenshot({ path, fullPage: true });
    const geometry = await access.evaluate((node) => {
      const rect = (el: Element) => { const r=el.getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height}; };
      return {region:rect(node),viewport:{width:innerWidth,height:innerHeight},scroll:{x:scrollX,y:scrollY},assets:Array.from(node.querySelectorAll("h3,p,button")).map(el=>({text:el.textContent,role:el.getAttribute("role"),rect:rect(el)}))};
    });
    const sha=(p:string)=>createHash("sha256").update(readFileSync(p)).digest("hex");
    writeFileSync(path.replace(".png",".json"),JSON.stringify({scope:"synthetic Parent access only",geometry,buildId:readFileSync(".next/BUILD_ID","utf8").trim(),parentSourceSha256:sha("src/components/parent/ParentApp.tsx"),imageSha256:sha(path)},null,2));
  }
});

test("synthetic Parent access: failed checks and denied recovery remain visible", async ({
  page,
}) => {
  await fixture(page, "parent");
  await page.route("**/api/parent/profile-access?*", (r) =>
    r.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ error: "Access check is unavailable. Retry." }),
    }),
  );
  let submitted: unknown;
  await page.route("**/api/parent/view-as-child", (r) => {
    submitted = r.request().postDataJSON();
    return r.fulfill({
      status: 409,
      contentType: "application/json",
      body: JSON.stringify({
        error: "Profile settings changed. Please try again.",
      }),
    });
  });
  await page.goto("/parent/children");
  const access = page.getByRole("region", {
    name: "Miri access on this device",
  });
  await access
    .getByRole("button", { name: "Check access", exact: true })
    .click();
  await expect(access.getByRole("alert")).toHaveText(
    "Access check is unavailable. Retry.",
  );
  await access
    .getByRole("button", { name: "Open Miri’s library as Parent", exact: true })
    .click();
  await expect(access.getByRole("alert")).toHaveText(
    "Profile settings changed. Please try again.",
  );
  expect(submitted).toEqual({ profile_id: profiles[0].id, recovery: true });
  await expect(
    access.getByRole("button", {
      name: "Open Miri’s library as Parent",
      exact: true,
    }),
  ).toBeEnabled();
});
