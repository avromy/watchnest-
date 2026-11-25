import { test, expect } from "@playwright/test";
import { fixture } from "./fixtures";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

for (const failure of ["network", "http"] as const) {
  test(`logout ${failure} failure is visible and retryable without an unhandled error`, async ({ page }) => {
    await fixture(page, "parent");
    let failed = true;
    await page.route("**/api/auth/logout", async (route) => {
      if (!failed) return route.fallback();
      if (failure === "network") return route.abort("failed");
      return route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Synthetic sign-out unavailable" }) });
    });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("/parent/settings");
    const signOut = page.getByRole("button", { name: "Sign out of this device", exact: true });
    await signOut.click();
    await page.waitForTimeout(100);
    await test.info().attach("client-errors", { body: JSON.stringify(errors), contentType: "application/json" });
    expect(errors).toEqual([]);
    await expect(page.getByRole("alert").filter({ hasText: /could not sign out|synthetic sign-out unavailable/i })).toBeVisible();
    await expect(signOut).toBeEnabled();
    expect(errors).toEqual([]);
    expect(new URL(page.url()).pathname).toBe("/parent/settings");
    failed = false;
    await signOut.click();
    await expect(page).toHaveURL(/\/login$/);
  });
}

test("logout holds a single pending request and recovers after completion", async ({ page }) => {
  await fixture(page, "parent");
  let calls = 0;
  let release!: () => void;
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/api/auth/logout", async (route) => {
    calls++;
    await held;
    await route.fallback();
  });
  await page.goto("/parent/settings");
  const signOut = page.getByRole("button", { name: "Sign out of this device", exact: true });
  await signOut.click();
  try {
    await expect(page.getByRole("button", { name: "Signing out…", exact: true })).toBeDisabled();
    expect(calls).toBe(1);
  } finally { release(); }
  await expect(page).toHaveURL(/\/login$/);
});

test("logout times out a hung request with honest feedback and permits retry", async ({ page }) => {
  const captureGeometry = async (imagePath: string) => {
    const panel = page.getByRole("heading", { name: "Device access", exact: true }).locator("..");
    const geometry = await panel.evaluate((element) => {
      const rect = (node: Element) => {
        const box = node.getBoundingClientRect();
        return { x: box.x, y: box.y, width: box.width, height: box.height };
      };
      return {
        viewport: { width: window.innerWidth, height: window.innerHeight },
        scroll: { x: window.scrollX, y: window.scrollY },
        panel: rect(element),
        assets: Array.from(element.querySelectorAll("h2,p,button,svg")).map((node) => ({
          tag: node.tagName,
          text: node.textContent,
          role: node.getAttribute("role"),
          disabled: node instanceof HTMLButtonElement ? node.disabled : null,
          rect: rect(node),
          scrollWidth: node.scrollWidth,
          clientWidth: node.clientWidth,
          overflowX: getComputedStyle(node).overflowX,
          overflowY: getComputedStyle(node).overflowY,
        })),
        overflow: { document: document.documentElement.scrollWidth, body: document.body.scrollWidth },
      };
    });
    const reference = JSON.parse(readFileSync("docs/integrity-20261120/source-hashes.json", "utf8"));
    const sha256 = Object.fromEntries(
      ["src/lib/server/product.ts", "src/components/parent/ParentApp.tsx"].map((path) => [
        path,
        createHash("sha256").update(readFileSync(path)).digest("hex"),
      ]),
    );
    const referenceSourceHashesMatch = Object.entries(sha256).every(
      ([path, hash]) => reference.sha256[path] === hash,
    );
    const record = {
      evidence: "NEUTRAL SYNTHETIC BROWSER GEOMETRY; no keyboard/AT/physical-touch/provider claim",
      source: {
        applicationCommitReference: reference.applicationCommit,
        referenceSourceHashesMatch,
        buildId: readFileSync(".next/BUILD_ID", "utf8").trim(),
        sha256,
      },
      screenshotSha256: createHash("sha256").update(readFileSync(imagePath)).digest("hex"),
      geometry,
    };
    const path = imagePath.replace(/\.png$/, ".geometry.json");
    writeFileSync(path, JSON.stringify(record, null, 2));
    await test.info().attach("neutral-geometry", { path, contentType: "application/json" });
  };
  await fixture(page, "parent");
  let calls = 0;
  let release!: () => void;
  const held = new Promise<void>((resolve) => { release = resolve; });
  await page.route("**/api/auth/logout", async (route) => {
    calls++;
    if (calls === 1) await held;
    await route.fallback().catch(() => {});
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/parent/settings");
  const signOut = page.getByRole("button", { name: "Sign out of this device", exact: true });
  await expect(signOut).toBeVisible();
  await page.clock.install();
  await signOut.click();
  try {
    await expect(page.getByRole("button", { name: "Signing out…", exact: true })).toBeDisabled();
    await expect.poll(() => calls).toBe(1);
    for (const width of [390, 820]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1180 });
      await page.getByRole("heading", { name: "Device access", exact: true }).scrollIntoViewIfNeeded();
      const path = test.info().outputPath(`logout-pending-${width}.png`);
      await page.screenshot({ path });
      await captureGeometry(path);
      await test.info().attach(`logout-pending-${width}`, { path, contentType: "image/png" });
    }
    await page.clock.fastForward(15001);
    const alert = page.getByRole("alert").filter({ hasText: "Could not sign out." });
    await expect(alert).toHaveText("Could not sign out. This browser may still be signed in. Please try again.");
    await expect(signOut).toBeEnabled();
    expect(new URL(page.url()).pathname).toBe("/parent/settings");
    expect(errors).toEqual([]);
    for (const width of [390, 820]) {
      await page.setViewportSize({ width, height: width === 390 ? 844 : 1180 });
      await alert.scrollIntoViewIfNeeded();
      const path = test.info().outputPath(`logout-timeout-${width}.png`);
      await page.screenshot({ path });
      await captureGeometry(path);
      await test.info().attach(`logout-timeout-${width}`, { path, contentType: "image/png" });
    }
    await signOut.click();
    await expect(page).toHaveURL(/\/login$/);
    expect(calls).toBe(2);
    expect(errors).toEqual([]);
  } finally { release(); }
});
