import { test, expect } from "@playwright/test";
import { dashboard, fixture } from "./fixtures";

const pid = dashboard.profiles[0].id;
// Synthetic snapshots still represent a real next New York 7AM boundary.
// This fixture is presentation data, never production timer authority.
function nextDailyReset() {
  const now = Date.now();
  const hour = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    hourCycle: "h23",
  });
  const boundary = new Date(now);
  boundary.setUTCMinutes(0, 0, 0);
  for (let i = 0; i < 27; i++) {
    if (boundary.getTime() > now && hour.format(boundary) === "07")
      return boundary.toISOString();
    boundary.setUTCHours(boundary.getUTCHours() + 1);
  }
  throw new Error("Daily fixture must have a next 7AM boundary");
}
test("custom one-minute grant, validation and explicit daily mode", async ({
  page,
}) => {
  const changes = await fixture(page, "parent");
  await page.goto("/parent/controls");
  const card = page.locator("section.panel").filter({
    has: page.getByRole("heading", {
      name: dashboard.profiles[0].display_name,
      exact: true,
    }),
  });
  await card.locator("summary").click();
  await card.getByLabel("Custom minutes").fill("1");
  const inputBounds = await card.getByLabel("Custom minutes").boundingBox();
  const saveBounds = await card
    .getByRole("button", { name: "Give 1 minute", exact: true })
    .boundingBox();
  expect(inputBounds).not.toBeNull();
  expect(saveBounds).not.toBeNull();
  expect(
    saveBounds!.y - inputBounds!.y - inputBounds!.height,
  ).toBeLessThanOrEqual(160);
  await card
    .getByRole("button", { name: "Give 1 minute", exact: true })
    .click();
  await expect
    .poll(() =>
      changes.some(
        (c) =>
          c.path === "/api/parent/session-timer" &&
          c.body.profile_id === pid &&
          c.body.action === "start" &&
          c.body.duration_minutes === 1,
      ),
    )
    .toBe(true);
  await card.getByLabel("Custom minutes").fill("0");
  await expect(
    card.getByRole("button", { name: "Give … minutes", exact: true }),
  ).toBeDisabled();
  await expect(card.getByRole("alert")).toContainText("1 to 240");
  await card.getByLabel("Custom minutes").fill("1.5");
  await expect(
    card.getByRole("button", { name: "Give 1.5 minutes", exact: true }),
  ).toBeDisabled();
  await card.getByRole("button", { name: "5 min", exact: true }).click();
  await expect(card.getByLabel("Custom minutes")).toHaveValue("5");
  await expect(
    card.getByRole("button", { name: "5 min", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await card.getByLabel("Time mode").selectOption("daily");
  await card
    .getByRole("button", { name: "Save 5 min daily allowance", exact: true })
    .click();
  await expect
    .poll(() =>
      changes.some(
        (c) =>
          c.path === "/api/parent/session-timer" &&
          c.body.action === "daily" &&
          c.body.duration_minutes === 5,
      ),
    )
    .toBe(true);
  await expect(card).toContainText("Unused time doesn’t carry over");
});

test("each Parent countdown pairs its deadline with its own server snapshot", async ({
  page,
}) => {
  await fixture(page, "parent");
  await page.route("**/api/parent/session-status", async (route) => {
    const outer = Date.now();
    await route.fulfill({
      json: {
        serverNow: new Date(outer).toISOString(),
        profiles: dashboard.profiles.map((profile, index) => {
          const own = outer + index * 5000;
          return {
            ...profile,
            devices: [],
            access: {
              enabled: true,
              allowed: true,
              state: "active",
              mode: "once",
              revision: 1,
              serverNow: new Date(own).toISOString(),
              expiresAt: new Date(own + 300000).toISOString(),
              remainingSeconds: 300,
              pausedSeconds: null,
            },
          };
        }),
      },
    });
  });
  await page.goto("/parent/controls");
  for (const profile of dashboard.profiles) {
    const card = page.locator("section.panel").filter({
      has: page.getByRole("heading", {
        name: profile.display_name,
        exact: true,
      }),
    });
    await expect(card.getByText("5 min left", { exact: true })).toBeVisible();
    await expect(card.getByText("6 min left", { exact: true })).toHaveCount(0);
  }
});

for (const viewport of [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 1000 },
]) {
  test(`daily timer real pixels ${viewport.width}x${viewport.height}`, async ({
    page,
  }, info) => {
    await page.setViewportSize(viewport);
    const changes = await fixture(page, "parent");
    let state = "ready";
    await page.route("**/api/parent/session-status", async (route) => {
      const snapshotNow = Date.now();
      await route.fulfill({
        json: {
          serverNow: new Date(snapshotNow).toISOString(),
          profiles: dashboard.profiles.map((p, index) => ({
            ...p,
            access: {
              enabled: true,
              allowed: state === "ready" || state === "active",
              state,
              mode: "daily",
              dailyAllowanceMinutes: 5,
              dailyStarted: state === "active" || state === "expired",
              parentBlocked: state === "blocked",
              limitDisabled: false,
              resetAt: nextDailyReset(),
              timezone: "America/New_York",
              expiresAt:
                state === "active"
                  ? new Date(snapshotNow + 300_000).toISOString()
                  : null,
              remainingSeconds: state === "expired" ? 0 : 300,
              pausedSeconds: state === "paused" ? 300 : null,
              revision: index + 1,
            },
            devices: [],
          })),
        },
      });
    });
    await page.goto("/parent/controls");
    const card = page.locator("section.panel").filter({
      has: page.getByRole("heading", {
        name: dashboard.profiles[0].display_name,
        exact: true,
      }),
    });
    await card.locator("summary").click();
    await card.getByLabel("Time mode").selectOption("daily");
    await card.getByLabel("Custom minutes").fill("5");
    await card.locator("summary").click();
    for (const value of ["ready", "active", "paused", "blocked", "expired"]) {
      state = value;
      const text =
        value === "ready"
          ? "available today"
          : value === "active"
            ? "min left"
            : value === "paused"
              ? "Paused"
              : value === "blocked"
                ? "Stopped by Parent"
                : "Time’s up";
      await expect(card).toContainText(text, { timeout: 7000 });
      await page.evaluate(() =>
        window.scrollTo({ top: 0, behavior: "instant" }),
      );
      await page.mouse.move(0, 0);
      await expect(page.locator("body")).not.toHaveJSProperty("scrollWidth", 0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth + 1,
        ),
      ).toBe(true);
      await page.screenshot({ path: info.outputPath(`${value}-top.png`) });
      await card.screenshot({ path: info.outputPath(`${value}-card.png`) });
      const immediate = card.getByRole("button", {
        name: value === "blocked" ? "Allow access" : "End now",
        exact: true,
      });
      const immediateBounds = await immediate.boundingBox();
      expect(immediateBounds).not.toBeNull();
      expect(immediateBounds!.y).toBeGreaterThanOrEqual(0);
      expect(immediateBounds!.y + immediateBounds!.height).toBeLessThanOrEqual(
        viewport.height,
      );
      expect(immediateBounds!.height).toBeGreaterThanOrEqual(44);
      await expect(card.getByLabel("Custom minutes")).toHaveValue("5");
      if (value === "expired") {
        await card
          .getByRole("button", { name: "Add 5 minutes today", exact: true })
          .click();
        await expect
          .poll(() =>
            changes.some(
              (change) =>
                change.path === "/api/parent/session-timer" &&
                change.body.profile_id === pid &&
                change.body.action === "extend" &&
                change.body.duration_minutes === 5,
            ),
          )
          .toBe(true);
        await expect(card.getByLabel("Time mode")).toHaveValue("daily");
      }
    }
    await card.locator("summary").click();
    await expect(card.getByLabel("Custom minutes")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
    ).toBe(true);
    await page.mouse.move(0, 0);
    await card.screenshot({ path: info.outputPath("editor-card.png") });
  });
}

test("daily library denies exhausted access, renews only from a server response, and retains Parent block", async ({
  page,
}, info) => {
  await fixture(page, "child");
  let state = "expired";
  const access = () => ({
    enabled: true,
    allowed: state === "active",
    state,
    mode: "daily",
    dailyAllowanceMinutes: 1,
    resetAt: nextDailyReset(),
    timezone: "America/New_York",
    parentBlocked: state === "blocked",
    revision: state === "expired" ? 1 : state === "active" ? 2 : 3,
    expiresAt:
      state === "active" ? new Date(Date.now() + 60_000).toISOString() : null,
    remainingSeconds: state === "active" ? 60 : 0,
    pausedSeconds: null,
    serverNow: new Date().toISOString(),
  });
  // Keep actual library fixture data while adding the server-authoritative timer snapshot.
  await page.route("**/api/child/library", async (route) => {
    const { videos, collections, profiles } = await import("./fixtures");
    await route.fulfill({
      json: {
        profile: profiles[1],
        videos,
        collections,
        session_access: access(),
      },
    });
  });
  await page.route("**/api/child/session-access", (route) =>
    route.fulfill({ json: { session_access: access() } }),
  );
  await page.goto("/watch/home");
  await expect(
    page.getByRole("heading", { name: "Time’s up for now", exact: true }),
  ).toBeVisible();
  expect(await page.locator("iframe").count()).toBe(0);
  await page.screenshot({
    path: info.outputPath("daily-exhausted.png"),
    fullPage: true,
  });
  state = "active";
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(
    page.getByRole("heading", { name: "Your library", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("status")).toContainText("1 min left");
  expect(await page.locator("iframe").count()).toBe(0);
  await page.screenshot({
    path: info.outputPath("daily-renewed.png"),
    fullPage: true,
  });
  state = "blocked";
  await page.evaluate(() => window.dispatchEvent(new Event("focus")));
  await expect(
    page.getByRole("heading", { name: "Time’s up for now", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByText("Parent will let you know when it’s time to watch again.", {
      exact: true,
    }),
  ).toBeVisible();
  await page.screenshot({
    path: info.outputPath("daily-parent-blocked.png"),
    fullPage: true,
  });
});
