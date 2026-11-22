# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: concept3-experience-mode.spec.ts >> existing Standard profiles remain Standard until explicitly saved
- Location: e2e/concept3-experience-mode.spec.ts:27:5

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByLabel('Library experience', { exact: true })
Expected: 4
Received: 0
Timeout:  5000ms

Call log:
  - Expect "toHaveCount" getByLabel('Library experience', { exact: true }) with timeout 5000ms
  - waiting for getByLabel('Library experience', { exact: true })
    14 × locator resolved to 0 elements
       - unexpected value "0"

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e3]:
    - banner [ref=e4]:
      - link "WatchNest Parent" [ref=e5] [cursor=pointer]:
        - /url: /parent/dashboard
        - text: WatchNest
        - generic [ref=e6]: Parent
      - generic [ref=e7]:
        - link "Add videos" [ref=e8] [cursor=pointer]:
          - /url: /parent/add-video
        - button "Switch profile" [ref=e12] [cursor=pointer]
    - navigation "Parent navigation" [ref=e16]:
      - link "Overview" [ref=e17] [cursor=pointer]:
        - /url: /parent/dashboard
      - link "Library" [ref=e21] [cursor=pointer]:
        - /url: /parent/library
      - link "Requests 1" [ref=e25] [cursor=pointer]:
        - /url: /parent/inbox
        - text: Requests
        - generic [ref=e29]: "1"
      - link "Time" [ref=e30] [cursor=pointer]:
        - /url: /parent/controls
      - link "Family" [ref=e34] [cursor=pointer]:
        - /url: /parent/children
    - navigation "Family sections" [ref=e39]:
      - link "Profiles" [ref=e40] [cursor=pointer]:
        - /url: /parent/children
      - link "Settings" [ref=e41] [cursor=pointer]:
        - /url: /parent/settings
    - main [ref=e42]:
      - generic [ref=e44]:
        - paragraph [ref=e45]: Family
        - heading "Child profiles" [level=1] [ref=e46]
        - paragraph [ref=e47]: Choose a photo or avatar, manage PINs, and check each child’s experience.
      - generic [ref=e48]:
        - generic [ref=e49]:
          - generic [ref=e50]:
            - generic "Miri profile photo" [ref=e51]
            - generic [ref=e56]:
              - heading "Miri" [level=2] [ref=e57]
              - paragraph [ref=e58]: 4-digit PIN on
          - generic [ref=e59]:
            - group [ref=e60]:
              - generic "+ Photo or avatar" [ref=e61] [cursor=pointer]
            - generic [ref=e62]:
              - checkbox "Require a PIN Ask for a 4-digit PIN before opening Miri’s library." [checked] [ref=e63]
              - generic [ref=e64]:
                - strong [ref=e65]: Require a PIN
                - generic [ref=e66]: Ask for a 4-digit PIN before opening Miri’s library.
            - generic [ref=e67]:
              - generic [ref=e68]:
                - text: New PIN (optional)
                - textbox "New PIN (optional)" [ref=e69]:
                  - /placeholder: 4 digits
              - generic [ref=e70]:
                - text: Confirm PIN
                - textbox "Confirm PIN" [ref=e71]:
                  - /placeholder: Enter it again
            - button "Save changes" [ref=e72] [cursor=pointer]
          - button "View as Miri" [ref=e73] [cursor=pointer]
        - generic [ref=e74]:
          - generic [ref=e75]:
            - generic "Ari profile photo" [ref=e76]
            - generic [ref=e80]:
              - heading "Ari" [level=2] [ref=e81]
              - paragraph [ref=e82]: 4-digit PIN on
          - generic [ref=e83]:
            - group [ref=e84]:
              - generic "+ Photo or avatar" [ref=e85] [cursor=pointer]
            - generic [ref=e86]:
              - checkbox "Require a PIN Ask for a 4-digit PIN before opening Ari’s library." [checked] [ref=e87]
              - generic [ref=e88]:
                - strong [ref=e89]: Require a PIN
                - generic [ref=e90]: Ask for a 4-digit PIN before opening Ari’s library.
            - generic [ref=e91]:
              - generic [ref=e92]:
                - text: New PIN (optional)
                - textbox "New PIN (optional)" [ref=e93]:
                  - /placeholder: 4 digits
              - generic [ref=e94]:
                - text: Confirm PIN
                - textbox "Confirm PIN" [ref=e95]:
                  - /placeholder: Enter it again
            - button "Save changes" [ref=e96] [cursor=pointer]
          - button "View as Ari" [ref=e97] [cursor=pointer]
        - generic [ref=e98]:
          - generic [ref=e99]:
            - generic "Benny profile photo" [ref=e100]
            - generic [ref=e108]:
              - heading "Benny" [level=2] [ref=e109]
              - paragraph [ref=e110]: Opens without a PIN
          - generic [ref=e111]:
            - group [ref=e112]:
              - generic "+ Photo or avatar" [ref=e113] [cursor=pointer]
            - generic [ref=e114]:
              - checkbox "Require a PIN Ask for a 4-digit PIN before opening Benny’s library." [ref=e115]
              - generic [ref=e116]:
                - strong [ref=e117]: Require a PIN
                - generic [ref=e118]: Ask for a 4-digit PIN before opening Benny’s library.
            - button "Save changes" [ref=e119] [cursor=pointer]
          - button "View as Benny" [ref=e120] [cursor=pointer]
        - generic [ref=e121]:
          - generic [ref=e122]:
            - generic "Eli profile photo" [ref=e123]
            - generic [ref=e128]:
              - heading "Eli" [level=2] [ref=e129]
              - paragraph [ref=e130]: Opens without a PIN
          - generic [ref=e131]:
            - group [ref=e132]:
              - generic "+ Photo or avatar" [ref=e133] [cursor=pointer]
            - generic [ref=e134]:
              - checkbox "Require a PIN Ask for a 4-digit PIN before opening Eli’s library." [ref=e135]
              - generic [ref=e136]:
                - strong [ref=e137]: Require a PIN
                - generic [ref=e138]: Ask for a 4-digit PIN before opening Eli’s library.
            - button "Save changes" [ref=e139] [cursor=pointer]
          - button "View as Eli" [ref=e140] [cursor=pointer]
  - alert [ref=e141]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { dashboard, fixture } from "./fixtures";
  3  | 
  4  | // Browser-only stateful contract fixture; never writes family data or proves DB persistence.
  5  | async function prepare(page: import("@playwright/test").Page) {
  6  |   await fixture(page, "parent");
  7  |   const family = structuredClone(dashboard);
  8  |   const writes: Record<string, unknown>[] = [];
  9  |   let rejectSave = false;
  10 |   await page.route("**/api/parent/dashboard", (route) => route.fulfill({ json: family }));
  11 |   await page.route("**/api/parent/profiles", async (route) => {
  12 |     const body = route.request().postDataJSON();
  13 |     writes.push(body);
  14 |     if (rejectSave) return route.fulfill({ status: 503, json: { error: "Synthetic profile save unavailable" } });
  15 |     const profile = family.profiles.find((item) => item.id === body.id);
  16 |     if (profile) Object.assign(profile, body);
  17 |     await route.fulfill({ json: { ok: true } });
  18 |   });
  19 |   await page.route("**/api/child/library", (route) => route.fulfill({ json: {
  20 |     profile: family.profiles[1], videos: family.videos, collections: family.collections,
  21 |   } }));
  22 |   await page.goto("/parent/children");
  23 |   const card = page.locator("section.panel").filter({ has: page.getByRole("heading", { name: "Ari", exact: true }) });
  24 |   return { family, writes, card, rejectNextSaves: () => { rejectSave = true; }, allowSaves: () => { rejectSave = false; } };
  25 | }
  26 | 
  27 | test("existing Standard profiles remain Standard until explicitly saved", async ({ page }) => {
  28 |   const { writes } = await prepare(page);
  29 |   const selectors = page.getByLabel("Library experience", { exact: true });
> 30 |   await expect(selectors).toHaveCount(4);
     |                           ^ Error: expect(locator).toHaveCount(expected) failed
  31 |   for (const selector of await selectors.all()) await expect(selector).toHaveValue("standard");
  32 |   expect(writes).toEqual([]);
  33 | });
  34 | 
  35 | test("Parent can save Simple, reload its persisted fixture value, and open the existing Simple library", async ({ page }) => {
  36 |   const { card, writes, family } = await prepare(page);
  37 |   await card.getByLabel("Library experience", { exact: true }).selectOption("simple");
  38 |   expect(writes).toEqual([]);
  39 |   await card.getByRole("button", { name: "Save changes", exact: true }).click();
  40 |   await expect(card.getByText("Changes saved.", { exact: true })).toBeVisible();
  41 |   expect(writes).toHaveLength(1);
  42 |   expect(writes[0]).toMatchObject({ id: family.profiles[1].id, experience_mode: "simple", pin_enabled: true, avatar_key: "fox" });
  43 |   expect(family.profiles[0].experience_mode).toBe("standard");
  44 |   await page.reload();
  45 |   await expect(card.getByLabel("Library experience", { exact: true })).toHaveValue("simple");
  46 |   await card.getByRole("button", { name: "View as Ari", exact: true }).click();
  47 |   await expect(page).toHaveURL(/\/watch\/home$/);
  48 |   await expect(page.locator('[data-experience-mode="simple"]')).toBeVisible();
  49 |   await expect(page.locator(".library-more summary")).toHaveText("More");
  50 |   await expect(page.getByRole("button", { name: "Hidden", exact: true })).toHaveCount(0);
  51 |   await page.locator(".library-more summary").click();
  52 |   await expect(page.getByRole("button", { name: "Hidden", exact: true })).toBeVisible();
  53 | });
  54 | 
  55 | test("failed experience save preserves the draft for retry without changing stored fixture mode", async ({ page }) => {
  56 |   const { card, family, rejectNextSaves, allowSaves } = await prepare(page);
  57 |   rejectNextSaves();
  58 |   await card.getByLabel("Library experience", { exact: true }).selectOption("simple");
  59 |   await card.getByRole("button", { name: "Save changes", exact: true }).click();
  60 |   await expect(page.getByRole("alert").filter({ hasText: "Synthetic profile save unavailable" })).toBeVisible();
  61 |   await expect(card.getByLabel("Library experience", { exact: true })).toHaveValue("simple");
  62 |   await expect(card.getByRole("button", { name: "Save changes", exact: true })).toBeEnabled();
  63 |   expect(family.profiles[1].experience_mode).toBe("standard");
  64 |   allowSaves();
  65 |   await card.getByRole("button", { name: "Save changes", exact: true }).click();
  66 |   await expect(card.getByText("Changes saved.", { exact: true })).toBeVisible();
  67 |   expect(family.profiles[1].experience_mode).toBe("simple");
  68 | });
  69 | 
```