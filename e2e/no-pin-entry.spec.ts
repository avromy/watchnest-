import { test, expect, type Page, type Route } from "@playwright/test";
import { fixture, profiles, videos, collections } from "./fixtures";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";

test.use({ viewport: { width: 390, height: 844 } });

// Stateful browser contract only. No real family, auth counters, or DB writes.
async function noPinFamily(page: Page) {
  await fixture(page, "child");
  const state = {
    current: { ...profiles[2] },
    admissionBodies: [] as Record<string, unknown>[],
    parentBodies: [] as Record<string, unknown>[],
    writes: [] as string[],
    offline: false,
    failNext: false,
    blocked: false,
    admissionGate: null as Promise<void> | null,
  };
  await page.route("**/api/**", async (route: Route) => {
    const path = new URL(route.request().url()).pathname;
    const body = route.request().postDataJSON() as Record<string, unknown> | null;
    const send = (data: unknown, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(data) });
    if (route.request().method() !== "GET") state.writes.push(path);
    if (path === "/api/auth/device") return send({ profiles, parent_pin_set: true, active_profile_id: state.current.id });
    if (path === "/api/session") return send({ role: "child", configured: true, profile: state.current, parent: { parent_pin_set: true } });
    if (path === "/api/auth/child") {
      state.admissionBodies.push(body || {});
      if (state.admissionGate) await state.admissionGate;
      if (state.offline || state.failNext) { state.failNext = false; return route.abort("internetdisconnected"); }
      if (state.blocked) return send({ error: "Parent ended this session. Ask Parent when it is time again." }, 403);
      const selected = profiles.find(profile => profile.id === body?.profileId);
      if (!selected) return send({ error: "Unknown synthetic profile" }, 400);
      if (selected.id !== state.current.id && body?.parentPin !== "1234") return send({ error: "Parent PIN required for handoff." }, 403);
      if (selected.id === state.current.id && selected.pin_enabled && body?.passcode !== "1234") return send({ error: "A child PIN is required." }, 403);
      state.current = { ...selected };
      return send({ profile: state.current });
    }
    if (path === "/api/auth/parent-mode") {
      state.parentBodies.push(body || {});
      return body?.pin === "1234" ? send({ ok: true }) : send({ error: "Parent PIN required." }, 403);
    }
    if (path === "/api/child/library") return send({ profile: state.current, videos, collections });
    return route.fallback();
  });
  return state;
}
const own = (page: Page) => page.getByRole("button", { name: /Benny.*Open my library/ });
async function picker(page: Page) {
  await page.goto("/watch");
  await expect(page.getByRole("heading", { name: "Who’s watching?" })).toBeVisible();
  await expect(own(page)).toBeEnabled();
}
function credentialFree(bodies: Record<string, unknown>[]) {
  expect(bodies.length).toBeGreaterThan(0);
  for (const body of bodies) {
    expect(body.profileId).toBe(profiles[2].id);
    expect(body).not.toHaveProperty("passcode");
    expect(body).not.toHaveProperty("parentPin");
  }
}
async function capture(page: Page, label: string) {
  const path = test.info().outputPath(`${label}.png`);
  await page.screenshot({ path });
  const sha = (value: Buffer) => createHash("sha256").update(value).digest("hex");
  await test.info().attach(label, { path, contentType: "image/png" });
  await test.info().attach(`${label}-binding`, { body: JSON.stringify({
    scope: "synthetic browser contract, no hosted/device/auth-counter claim",
    buildId: readFileSync(".next/BUILD_ID", "utf8").trim(),
    childLoginSha256: sha(readFileSync("src/components/child/ChildLogin.tsx")),
    screenshotSha256: sha(readFileSync(path)), viewport: page.viewportSize(),
  }, null, 2), contentType: "application/json" });
}

test("own active no-PIN profile opens without credentials and survives picker/library reload", async ({ page }) => {
  const state = await noPinFamily(page);
  await picker(page);
  await page.reload();
  await expect(own(page)).toBeEnabled();
  await own(page).click();
  await expect(page).toHaveURL(/\/watch\/home$/);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.reload();
  await expect(page.getByText("Benny", { exact: true })).toBeVisible();
  await capture(page, "own-no-pin-home-reloaded");
  credentialFree(state.admissionBodies);
  expect(state.admissionBodies).toHaveLength(1);
  expect(state.parentBodies).toHaveLength(0);
});

test("repeated real pointer taps while no-PIN admission is slow send one request", async ({ page }) => {
  const state = await noPinFamily(page);
  let release!: () => void;
  state.admissionGate = new Promise<void>(resolve => { release = resolve; });
  await picker(page);
  const bounds = await own(page).boundingBox();
  expect(bounds).not.toBeNull();
  await own(page).click();
  try {
    await expect(own(page)).toBeDisabled();
    await expect(page.getByRole("status")).toHaveText("Opening library…");
    await expect(page.getByRole("button", { name: "Parent Mode", exact: true })).toBeDisabled();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    for (let count = 0; count < 8; count++) await page.mouse.click(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
    await expect.poll(() => state.admissionBodies.length).toBe(1);
    await capture(page, "own-no-pin-slow-pending");
  } finally { release(); }
  await expect(page).toHaveURL(/\/watch\/home$/);
  credentialFree(state.admissionBodies);
  expect(state.admissionBodies).toHaveLength(1);
});

test("network failure is visible and no-PIN retry succeeds without a passcode", async ({ page }) => {
  const state = await noPinFamily(page);
  state.failNext = true;
  await picker(page);
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  await own(page).click();
  await expect(page.getByRole("main").getByRole("alert")).toBeVisible();
  await expect(own(page)).toBeEnabled();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).toHaveURL(/\/watch$/);
  await capture(page, "own-no-pin-network-retry");
  await own(page).click();
  await expect(page).toHaveURL(/\/watch\/home$/);
  credentialFree(state.admissionBodies);
  expect(state.admissionBodies).toHaveLength(2);
  expect(errors).toEqual([]);
});

test("offline admission and reconnect retain credential-free own-profile entry", async ({ page, context }) => {
  const state = await noPinFamily(page);
  await picker(page);
  state.offline = true;
  await context.setOffline(true);
  try {
    await own(page).click();
    await expect(page.getByRole("main").getByRole("alert")).toBeVisible();
    await expect(own(page)).toBeEnabled();
    await expect(page.getByRole("dialog")).toHaveCount(0);
  } finally { state.offline = false; await context.setOffline(false); }
  await own(page).click();
  await expect(page).toHaveURL(/\/watch\/home$/);
  credentialFree(state.admissionBodies);
  expect(state.admissionBodies).toHaveLength(2);
});

test("a sibling with PIN off still requires explicit Parent PIN handoff", async ({ page }) => {
  const state = await noPinFamily(page);
  await picker(page);
  await page.getByRole("button", { name: /Eli.*Open my library/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText(/Parent: enter your 4-digit PIN/)).toBeVisible();
  expect(state.admissionBodies).toHaveLength(0);
  await page.getByLabel("4-digit PIN").fill("1234");
  await expect(page).toHaveURL(/\/watch\/home$/);
  expect(state.admissionBodies).toHaveLength(1);
  expect(state.admissionBodies[0]).toMatchObject({ profileId: profiles[3].id, parentPin: "1234" });
  expect(state.admissionBodies[0]).not.toHaveProperty("passcode");
});

test("Parent Mode remains PIN gated from own no-PIN profile picker", async ({ page }) => {
  const state = await noPinFamily(page);
  await picker(page);
  await page.getByRole("button", { name: "Parent Mode", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByLabel("4-digit PIN")).toBeVisible();
  await expect(page).not.toHaveURL(/\/parent\//);
  expect(state.parentBodies).toHaveLength(0);
  expect(state.admissionBodies).toHaveLength(0);
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(own(page)).toBeEnabled();
  expect(state.writes.some(path => /reset|clear|unlock/.test(path))).toBe(false);
});

test("remote End now refusal persists across no-PIN retry and reload", async ({ page }) => {
  const state = await noPinFamily(page);
  state.blocked = true;
  await picker(page);
  for (let attempt = 0; attempt < 2; attempt++) {
    await own(page).click();
    await expect(page.getByRole("main").getByRole("alert")).toHaveText("Parent ended this session. Ask Parent when it is time again.");
    await expect(page).toHaveURL(/\/watch$/);
    await expect(own(page)).toBeEnabled();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    if (attempt === 0) { await page.reload(); await expect(own(page)).toBeEnabled(); }
  }
  await capture(page, "own-no-pin-parent-ended");
  credentialFree(state.admissionBodies);
  expect(state.admissionBodies).toHaveLength(2);
  expect(state.writes.some(path => /reset|clear|unlock|session-start/.test(path))).toBe(false);
});
