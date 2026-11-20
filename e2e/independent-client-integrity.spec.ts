import { test, expect } from "@playwright/test";
import { fixture } from "./fixtures";

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
      await test.info().attach(`logout-timeout-${width}`, { path, contentType: "image/png" });
    }
    await signOut.click();
    await expect(page).toHaveURL(/\/login$/);
    expect(calls).toBe(2);
    expect(errors).toEqual([]);
  } finally { release(); }
});
