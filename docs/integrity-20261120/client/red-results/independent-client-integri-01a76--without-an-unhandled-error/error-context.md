# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: independent-client-integrity.spec.ts >> logout network failure is visible and retryable without an unhandled error
- Location: e2e/independent-client-integrity.spec.ts:5:7

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 3

- Array []
+ Array [
+   "Failed to fetch",
+ ]
```

# Page snapshot

```yaml
- generic [ref=e1]:
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
        - paragraph [ref=e45]: Settings
        - heading "Family settings" [level=1] [ref=e46]
        - paragraph [ref=e47]: Protect Parent Mode and manage this device.
      - generic [ref=e48]:
        - generic [ref=e49]:
          - paragraph [ref=e50]: Protection levels
          - heading "Protection options" [level=2] [ref=e51]
          - paragraph [ref=e52]: Safe Playback protects every Child Mode session. Add an iPad option if it fits your family.
          - generic [ref=e53]:
            - article [ref=e54]:
              - generic [ref=e55]: Required
              - heading "1. Safe Playback" [level=3] [ref=e56]
              - paragraph [ref=e57]: Required in Child Mode. Only Parent-approved videos may play.
              - generic [ref=e59] [cursor=pointer]:
                - strong [ref=e60]: Always on
                - generic [ref=e61]: No special iPad setup needed
            - article [ref=e62]:
              - generic [ref=e63]: Optional
              - heading "2. Enhanced YouTube protection" [level=3] [ref=e64]
              - paragraph [ref=e65]: Keep normal web access while trying to restrict unrestricted YouTube.
              - strong [ref=e66]: Limited on iPad
              - paragraph [ref=e67]: Apple does not currently provide a reliable family setting that blocks only YouTube pages while guaranteeing embedded playback. Do not use Approved Websites Only; it can stop videos from playing.
              - paragraph [ref=e68]: Removing the YouTube app still adds useful protection.
            - article [ref=e69]:
              - generic [ref=e70]: Maximum
              - heading "3. Dedicated WatchNest device" [level=3] [ref=e71]
              - paragraph [ref=e72]: For an iPad used mainly for WatchNest.
              - list [ref=e73]:
                - listitem [ref=e74]: In Safari, add WatchNest to the Home Screen.
                - listitem [ref=e75]: Open the new WatchNest icon and confirm a video plays.
                - listitem [ref=e76]: Remove or restrict the YouTube app.
                - listitem [ref=e77]: Turn Safari off in Screen Time.
                - listitem [ref=e78]: "Optional: use Guided Access for a focused session."
          - paragraph [ref=e79]: Device restrictions are extra protection. Safe Playback remains the WatchNest control.
          - button "Check this browser" [ref=e80] [cursor=pointer]
        - generic [ref=e81]:
          - heading "Parent Mode PIN" [level=2] [ref=e82]
          - paragraph [ref=e83]: Use this 4-digit PIN to enter Parent Mode from the profile picker.
          - generic [ref=e84]:
            - text: New Parent PIN
            - textbox "New Parent PIN" [ref=e85]
          - generic [ref=e86]:
            - text: Confirm PIN
            - textbox "Confirm PIN" [ref=e87]
          - button "Save Parent PIN" [ref=e88] [cursor=pointer]
        - generic [ref=e89]:
          - heading "Device access" [level=2] [ref=e90]
          - paragraph [ref=e91]: Switch profiles keeps this family iPad connected. Sign out removes WatchNest access from this browser.
          - button "Switch profile" [ref=e92] [cursor=pointer]
          - button "Sign out of this device" [active] [ref=e95] [cursor=pointer]
        - generic [ref=e96]:
          - heading "Playback on this device" [level=2] [ref=e97]
          - group [ref=e98]:
            - generic "+ Ads and YouTube Premium" [ref=e99] [cursor=pointer]
          - group [ref=e100]:
            - generic "+ Volume" [ref=e101] [cursor=pointer]
          - group [ref=e102]:
            - generic "+ Offline and travel" [ref=e103] [cursor=pointer]
  - alert [ref=e104]
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { fixture } from "./fixtures";
  3  | 
  4  | for (const failure of ["network", "http"] as const) {
  5  |   test(`logout ${failure} failure is visible and retryable without an unhandled error`, async ({ page }) => {
  6  |     await fixture(page, "parent");
  7  |     let failed = true;
  8  |     await page.route("**/api/auth/logout", async (route) => {
  9  |       if (!failed) return route.fallback();
  10 |       if (failure === "network") return route.abort("failed");
  11 |       return route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Synthetic sign-out unavailable" }) });
  12 |     });
  13 |     const errors: string[] = [];
  14 |     page.on("pageerror", (error) => errors.push(error.message));
  15 |     await page.goto("/parent/settings");
  16 |     const signOut = page.getByRole("button", { name: "Sign out of this device", exact: true });
  17 |     await signOut.click();
  18 |     await page.waitForTimeout(100);
  19 |     await test.info().attach("client-errors", { body: JSON.stringify(errors), contentType: "application/json" });
> 20 |     expect(errors).toEqual([]);
     |                    ^ Error: expect(received).toEqual(expected) // deep equality
  21 |     await expect(page.getByRole("alert").filter({ hasText: /could not sign out|synthetic sign-out unavailable/i })).toBeVisible();
  22 |     await expect(signOut).toBeEnabled();
  23 |     expect(errors).toEqual([]);
  24 |     expect(new URL(page.url()).pathname).toBe("/parent/settings");
  25 |     failed = false;
  26 |     await signOut.click();
  27 |     await expect(page).toHaveURL(/\/login$/);
  28 |   });
  29 | }
  30 | 
  31 | test("logout holds a single pending request and recovers after completion", async ({ page }) => {
  32 |   await fixture(page, "parent");
  33 |   let calls = 0;
  34 |   let release!: () => void;
  35 |   const held = new Promise<void>((resolve) => { release = resolve; });
  36 |   await page.route("**/api/auth/logout", async (route) => {
  37 |     calls++;
  38 |     await held;
  39 |     await route.fallback();
  40 |   });
  41 |   await page.goto("/parent/settings");
  42 |   const signOut = page.getByRole("button", { name: "Sign out of this device", exact: true });
  43 |   await signOut.click();
  44 |   try {
  45 |     await expect(page.getByRole("button", { name: "Signing out…", exact: true })).toBeDisabled();
  46 |     expect(calls).toBe(1);
  47 |   } finally { release(); }
  48 |   await expect(page).toHaveURL(/\/login$/);
  49 | });
  50 | 
```