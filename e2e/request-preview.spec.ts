import { test, expect } from "@playwright/test";
import { dashboard, fixture, profiles } from "./fixtures";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";

test.use({hasTouch:true});

for (const viewport of [
  { width: 390, height: 844 },
  { width: 820, height: 1180 },
]) {
  test(`requested video Preview opens on ${viewport.width}px without approval`, async ({
    page,
  }, info) => {
    await page.setViewportSize(viewport);
    const changes = await fixture(page, "parent");
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/api/parent/dashboard", (route) =>
      route.fulfill({
        json: {
          ...dashboard,
          requests: [
            {
              ...dashboard.requests[0],
              kind: "video",
              youtube_video_id: "newvideo123",
              video_title: "Requested craft video",
              profile_id: profiles[1].id,
            },
          ],
        },
      }),
    );
    await page.route("https://www.youtube-nocookie.com/**", (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<p>Synthetic Parent preview; no provider playback claim.</p>",
      }),
    );
    await page.goto("/parent/inbox");
    const preview = page.getByText("Preview", { exact: true });
    await expect(page.locator("iframe")).toHaveCount(0);
    await preview.tap();
    await expect(
      page.getByRole("dialog", { name: "Requested craft video" }),
    ).toBeVisible();
    const screenshot = await page.screenshot({
      path: info.outputPath("request-preview.png"),
    });
    const geometry = await page.evaluate(() => {
      const rect = (element: Element) => {
        const r = element.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      };
      const dialog = document.querySelector('[role="dialog"]')!;
      return {
        viewport: { width: innerWidth, height: innerHeight },
        dialog: rect(dialog),
        panel: rect(dialog.querySelector("section")!),
        assets: Array.from(dialog.querySelectorAll("h2,button,iframe,p")).map(
          (element) => ({
            tag: element.tagName,
            text:
              element.tagName === "IFRAME"
                ? "synthetic video frame"
                : element.textContent,
            rect: rect(element),
          }),
        ),
        overflow: {
          document: document.documentElement.scrollWidth,
          body: document.body.scrollWidth,
        },
      };
    });
    writeFileSync(
      info.outputPath("request-preview-manifest.json"),
      JSON.stringify(
        {
          evidence:
            "SYNTHETIC BROWSER / VIEWPORT SCREENSHOT; no hosted/provider/device claim",
          source: execFileSync("git", ["rev-parse", "HEAD", "HEAD:src"], {
            encoding: "utf8",
          })
            .trim()
            .split("\n"),
          buildId: readFileSync(".next/BUILD_ID", "utf8").trim(),
          componentSha256: createHash("sha256")
            .update(readFileSync("src/components/parent/RequestPreview.tsx"))
            .digest("hex"),
          cssSha256: createHash("sha256")
            .update(readFileSync("src/components/parent/Parent.module.css"))
            .digest("hex"),
          screenshotSha256: createHash("sha256")
            .update(screenshot)
            .digest("hex"),
          geometry,
        },
        null,
        2,
      ),
    );
    const frame = page.locator("iframe");
    await expect(frame).toBeVisible();
    const box = await frame.boundingBox();
    expect(box!.width).toBeGreaterThan(250);
    expect(box!.height).toBeGreaterThan(140);
    await page.getByRole("button", { name: "Close preview" }).click();
    await expect(frame).toHaveCount(0);
    await expect(preview).toBeFocused();
    await preview.press("Enter");
    await expect(frame).toBeVisible();
    await page.getByRole("button", { name: "Close preview" }).press("Escape");
    await expect(frame).toHaveCount(0);
    expect(changes).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test("request preview slow frame has retry and never mutates approval", async ({
  page,
}) => {
  const changes = await fixture(page, "parent");
  await page.route("**/api/parent/dashboard", (route) =>
    route.fulfill({
      json: {
        ...dashboard,
        requests: [
          {
            ...dashboard.requests[0],
            youtube_video_id: "newvideo123",
            video_title: "A requested video",
            kind: "video",
          },
        ],
      },
    }),
  );
  let release!: () => void;
  const held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("https://www.youtube-nocookie.com/**", async (route) => {
    await held;
    await route.fulfill({ body: "Fixture" });
  });
  await page.clock.install();
  await page.goto("/parent/inbox");
  await page.getByRole("button", { name: "Preview", exact: true }).click();
  await page.clock.fastForward(13000);
  await expect(page.getByText(/preview is taking longer/)).toBeVisible();
  await page.getByRole("button", { name: "Retry preview" }).click();
  await expect(page.getByText("Loading the preview…")).toBeVisible();
  await page.getByRole("button", { name: "Close preview" }).click();
  release();
  await expect(page.locator("iframe")).toHaveCount(0);
  expect(changes).toEqual([]);
});

test("Inbox collection creation failures are visible and retry retains input", async ({
  page,
}) => {
  await fixture(page, "parent");
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/api/parent/dashboard", (route) =>
    route.fulfill({
      json: {
        ...dashboard,
        requests: [
          {
            ...dashboard.requests[0],
            youtube_video_id: "newvideo123",
            video_title: "A requested video",
            kind: "video",
          },
        ],
      },
    }),
  );
  await page.route("**/api/parent/collections", (route) =>
    route.fulfill({
      status: 503,
      json: { error: "Collection service unavailable. Try again." },
    }),
  );
  await page.goto("/parent/inbox");
  await page.getByRole("button", { name: "Approve", exact: true }).click();
  await page.getByLabel("Collection (optional)").selectOption("__new");
  await page.getByPlaceholder("Collection name").fill("Crafts");
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await expect(
    page.getByText("Collection service unavailable. Try again."),
  ).toBeVisible();
  await expect(page.getByPlaceholder("Collection name")).toHaveValue("Crafts");
  await expect(
    page.getByRole("button", { name: "Create", exact: true }),
  ).toBeEnabled();
  expect(errors).toEqual([]);
});

test("Library collection and removal failures surface without losing selection", async ({
  page,
}) => {
  await fixture(page, "parent");
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.route("**/api/parent/collections", (route) =>
    route.fulfill({
      status: 503,
      json: { error: "Collection update unavailable" },
    }),
  );
  await page.route("**/api/parent/videos", (route) =>
    route.fulfill({
      status: 401,
      json: { error: "Sign in again to manage videos" },
    }),
  );
  await page.goto("/parent/library");
  await page
    .getByRole("checkbox", { name: dashboard.videos[0].title, exact: true })
    .check();
  await page
    .getByRole("combobox", { name: "Add to Collection", exact: true })
    .selectOption(dashboard.collections[0].id);
  await page
    .getByRole("button", { name: "Add selected to Collection", exact: true })
    .click();
  await expect(page.getByText("Collection update unavailable")).toBeVisible();
  await expect(
    page.getByRole("checkbox", {
      name: dashboard.videos[0].title,
      exact: true,
    }),
  ).toBeChecked();
  page.on("dialog", (dialog) => dialog.accept());
  await page
    .getByRole("button", { name: "Remove selected", exact: true })
    .click();
  await expect(page.getByText("Sign in again to manage videos")).toBeVisible();
  await expect(
    page.getByRole("checkbox", {
      name: dashboard.videos[0].title,
      exact: true,
    }),
  ).toBeChecked();
  expect(errors).toEqual([]);
});

test("confirmed Inbox collection stays visibly selected after a failed refresh", async ({
  page,
}) => {
  await fixture(page, "parent");
  let created = false;
  const collection = {
    id: "20000000-0000-4000-8000-000000000099",
    title: "New crafts",
    video_ids: [],
  };
  await page.route("**/api/parent/dashboard", (route) =>
    route.fulfill(
      created
        ? { status: 503, json: { error: "Refresh unavailable" } }
        : {
            json: {
              ...dashboard,
              requests: [
                {
                  ...dashboard.requests[0],
                  youtube_video_id: "newvideo123",
                  kind: "video",
                },
              ],
            },
          },
    ),
  );
  await page.route("**/api/parent/collections", (route) => {
    created = true;
    return route.fulfill({ json: { collection } });
  });
  let approval: any;
  await page.route("**/api/parent/requests", (route) => {
    approval = route.request().postDataJSON();
    return route.fulfill({ json: { ok: true } });
  });
  await page.goto("/parent/inbox");
  await page.getByRole("button", { name: "Approve", exact: true }).click();
  const select = page.getByLabel("Collection (optional)");
  await select.selectOption("__new");
  await page.getByPlaceholder("Collection name").fill("New crafts");
  await page.getByRole("button", { name: "Create", exact: true }).click();
  await expect(page.getByText(/Collection created and selected/)).toBeVisible();
  await expect(select).toHaveValue(collection.id);
  await expect(select.locator("option:checked")).toHaveText(collection.title);
  await page
    .getByRole("button", { name: "Approve video", exact: true })
    .click();
  await expect.poll(() => approval?.collection_id).toBe(collection.id);
});
