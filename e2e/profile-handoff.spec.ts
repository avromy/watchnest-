import { test, expect } from "@playwright/test";
import { fixture, profiles, videos } from "./fixtures";
async function inspect(page: import("@playwright/test").Page) {
  return page.evaluate(() => ({
    viewport: { width: innerWidth, height: innerHeight },
    document: {
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
    },
    assets: [...document.querySelectorAll("main img, main svg")].map((e, i) => {
      const r = e.getBoundingClientRect();
      const p = e.parentElement!.getBoundingClientRect();
      return {
        id: `A${String(i + 1).padStart(2, "0")}`,
        tag: e.tagName,
        label:
          e.getAttribute("alt") ||
          e.getAttribute("aria-label") ||
          e.parentElement?.getAttribute("aria-label") ||
          "decorative icon",
        rect: { x: r.x, y: r.y, width: r.width, height: r.height },
        container: { x: p.x, y: p.y, width: p.width, height: p.height },
        containedEdges: {
          left: r.left >= p.left - 0.5,
          right: r.right <= p.right + 0.5,
          top: r.top >= p.top - 0.5,
          bottom: r.bottom <= p.bottom + 0.5,
        },
      };
    }),
    controls: [...document.querySelectorAll("main button, main input")].map(
      (e) => {
        const r = e.getBoundingClientRect();
        return {
          label: e.textContent?.trim() || e.getAttribute("aria-label") || e.id,
          width: r.width,
          height: r.height,
        };
      },
    ),
  }));
}

// Rendered interface regression with explicit synthetic server state. The actual
// dispatch and SQL boundary are tested separately; this is not physical evidence.
for (const viewport of [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
]) {
  test(`profile handoff: Parent approval and same-profile return ${viewport.width}`, async ({
    page,
  }, info) => {
    await page.setViewportSize(viewport);
    await fixture(page, "child");
    let active = profiles[2]; // Same-profile PIN-off entry remains child-friendly.
    const entries: any[] = [];
    await page.route("**/api/auth/device", (r) =>
      r.fulfill({
        json: { profiles, parent_pin_set: true, active_profile_id: active.id },
      }),
    );
    await page.route("**/api/auth/child", async (r) => {
      const b = r.request().postDataJSON();
      entries.push(b);
      const target = profiles.find((p) => p.id === b.profileId)!;
      if (target.id !== active.id && b.parentPin !== "2468")
        return r.fulfill({
          status: 401,
          json: { error: "That Parent PIN is not correct." },
        });
      active = target;
      await r.fulfill({ json: { profile: target } });
    });
    await page.route("**/api/child/library", (r) =>
      r.fulfill({ json: { profile: active, videos, collections: [] } }),
    );
    await page.goto("/watch");
    await expect(
      page.getByRole("button", { name: /Benny.*Open my library/ }),
    ).toContainText("Benny");
    await page.screenshot({
      path: info.outputPath("picker.png"),
      fullPage: true,
    });
    await info.attach("picker-structure", {
      body: JSON.stringify(await inspect(page)),
      contentType: "application/json",
    });
    await page.getByRole("button", { name: /Benny.*Open my library/ }).click();
    await expect(page.getByText("Benny", { exact: true })).toBeVisible();
    expect(entries[0].parentPin).toBeUndefined();
    await page.goto("/watch");
    await page.getByRole("button", { name: /Eli.*Open my library/ }).click();
    await expect(
      page.getByRole("heading", { name: "Open Eli’s library" }),
    ).toBeVisible();
    await expect(page.getByRole("dialog")).toContainText(
      "doesn’t change anyone’s time limit",
    );
    await page.screenshot({
      path: info.outputPath("handoff.png"),
      fullPage: true,
    });
    await info.attach("handoff-structure", {
      body: JSON.stringify(await inspect(page)),
      contentType: "application/json",
    });
    await page.getByLabel("4-digit PIN", { exact: true }).fill("0000");
    await expect(page.getByRole("dialog").getByRole("alert")).toHaveText(
      "That Parent PIN is not correct.",
    );
    await page.screenshot({
      path: info.outputPath("wrong-pin.png"),
      fullPage: true,
    });
    await info.attach("wrong-pin-structure", {
      body: JSON.stringify(await inspect(page)),
      contentType: "application/json",
    });
    await page.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await page.reload();
    await page.getByRole("button", { name: /Eli.*Open my library/ }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.getByLabel("4-digit PIN", { exact: true }).fill("2468");
    await expect(page.getByText("Eli", { exact: true })).toBeVisible();
    expect(entries.at(-1)).toMatchObject({
      profileId: profiles[3].id,
      parentPin: "2468",
    });
    expect(entries.at(-1).passcode).toBeUndefined();
    await page.goto("/watch");
    await page.getByRole("button", { name: /Eli.*Open my library/ }).click();
    await expect(page.getByText("Eli", { exact: true })).toBeVisible();
    expect(entries.at(-1).parentPin).toBeUndefined();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  });
}
