# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: no-pin-entry.spec.ts >> remote End now refusal persists across no-PIN retry and reload
- Location: e2e/no-pin-entry.spec.ts:178:5

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: getByRole('alert')
Expected: "Parent ended this session. Ask Parent when it is time again."
Error: strict mode violation: getByRole('alert') resolved to 2 elements:
    1) <p role="alert" class="error picker-error">Parent ended this session. Ask Parent when it is …</p> aka getByText('Parent ended this session.')
    2) <div role="alert" aria-live="assertive" id="__next-route-announcer__"></div> aka locator('[id="__next-route-announcer__"]')

Call log:
  - Expect "toHaveText" getByRole('alert') with timeout 5000ms
  - waiting for getByRole('alert')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - main [ref=e4]:
    - generic [ref=e5]: WatchNest
    - region [ref=e7]:
      - generic [ref=e8]:
        - heading "Who’s watching?" [level=1] [ref=e9]
        - paragraph [ref=e10]: Choose your library. A parent helps when it’s someone else’s turn.
      - alert [ref=e11]: Parent ended this session. Ask Parent when it is time again.
      - generic [ref=e12]:
        - button "Miri profile photo Miri Open my library Parent handoff" [ref=e13] [cursor=pointer]:
          - generic "Miri profile photo" [ref=e14]
          - strong [ref=e19]: Miri
          - generic [ref=e20]: Open my library
          - generic [ref=e21]: Parent handoff
        - button "Ari profile photo Ari Open my library Parent handoff" [ref=e25] [cursor=pointer]:
          - generic "Ari profile photo" [ref=e26]
          - strong [ref=e30]: Ari
          - generic [ref=e31]: Open my library
          - generic [ref=e32]: Parent handoff
        - button "Benny profile photo Benny Open my library Selected profile" [ref=e36] [cursor=pointer]:
          - generic "Benny profile photo" [ref=e37]
          - strong [ref=e45]: Benny
          - generic [ref=e46]: Open my library
          - generic [ref=e47]: Selected profile
        - button "Eli profile photo Eli Open my library Parent handoff" [ref=e48] [cursor=pointer]:
          - generic "Eli profile photo" [ref=e49]
          - strong [ref=e54]: Eli
          - generic [ref=e55]: Open my library
          - generic [ref=e56]: Parent handoff
      - button "Parent Mode" [ref=e60] [cursor=pointer]
    - generic [ref=e64]: Approved videos for your family
  - alert [ref=e68]
```

# Test source

```ts
  84  |   await page.reload();
  85  |   await expect(page.getByText("Benny", { exact: true })).toBeVisible();
  86  |   await capture(page, "own-no-pin-home-reloaded");
  87  |   credentialFree(state.admissionBodies);
  88  |   expect(state.admissionBodies).toHaveLength(1);
  89  |   expect(state.parentBodies).toHaveLength(0);
  90  | });
  91  | 
  92  | test("repeated real pointer taps while no-PIN admission is slow send one request", async ({ page }) => {
  93  |   const state = await noPinFamily(page);
  94  |   let release!: () => void;
  95  |   state.admissionGate = new Promise<void>(resolve => { release = resolve; });
  96  |   await picker(page);
  97  |   const bounds = await own(page).boundingBox();
  98  |   expect(bounds).not.toBeNull();
  99  |   await own(page).click();
  100 |   try {
  101 |     await expect(own(page)).toBeDisabled();
  102 |     await expect(page.getByRole("status")).toHaveText("Opening library…");
  103 |     await expect(page.getByRole("button", { name: "Parent Mode", exact: true })).toBeDisabled();
  104 |     await expect(page.getByRole("dialog")).toHaveCount(0);
  105 |     for (let count = 0; count < 8; count++) await page.mouse.click(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
  106 |     await expect.poll(() => state.admissionBodies.length).toBe(1);
  107 |     await capture(page, "own-no-pin-slow-pending");
  108 |   } finally { release(); }
  109 |   await expect(page).toHaveURL(/\/watch\/home$/);
  110 |   credentialFree(state.admissionBodies);
  111 |   expect(state.admissionBodies).toHaveLength(1);
  112 | });
  113 | 
  114 | test("network failure is visible and no-PIN retry succeeds without a passcode", async ({ page }) => {
  115 |   const state = await noPinFamily(page);
  116 |   state.failNext = true;
  117 |   await picker(page);
  118 |   const errors: string[] = [];
  119 |   page.on("pageerror", error => errors.push(error.message));
  120 |   await own(page).click();
  121 |   await expect(page.getByRole("alert")).toBeVisible();
  122 |   await expect(own(page)).toBeEnabled();
  123 |   await expect(page.getByRole("dialog")).toHaveCount(0);
  124 |   await expect(page).toHaveURL(/\/watch$/);
  125 |   await capture(page, "own-no-pin-network-retry");
  126 |   await own(page).click();
  127 |   await expect(page).toHaveURL(/\/watch\/home$/);
  128 |   credentialFree(state.admissionBodies);
  129 |   expect(state.admissionBodies).toHaveLength(2);
  130 |   expect(errors).toEqual([]);
  131 | });
  132 | 
  133 | test("offline admission and reconnect retain credential-free own-profile entry", async ({ page, context }) => {
  134 |   const state = await noPinFamily(page);
  135 |   await picker(page);
  136 |   state.offline = true;
  137 |   await context.setOffline(true);
  138 |   try {
  139 |     await own(page).click();
  140 |     await expect(page.getByRole("alert")).toBeVisible();
  141 |     await expect(own(page)).toBeEnabled();
  142 |     await expect(page.getByRole("dialog")).toHaveCount(0);
  143 |   } finally { state.offline = false; await context.setOffline(false); }
  144 |   await own(page).click();
  145 |   await expect(page).toHaveURL(/\/watch\/home$/);
  146 |   credentialFree(state.admissionBodies);
  147 |   expect(state.admissionBodies).toHaveLength(2);
  148 | });
  149 | 
  150 | test("a sibling with PIN off still requires explicit Parent PIN handoff", async ({ page }) => {
  151 |   const state = await noPinFamily(page);
  152 |   await picker(page);
  153 |   await page.getByRole("button", { name: /Eli.*Open my library/ }).click();
  154 |   await expect(page.getByRole("dialog")).toBeVisible();
  155 |   await expect(page.getByText(/Parent: enter your 4-digit PIN/)).toBeVisible();
  156 |   expect(state.admissionBodies).toHaveLength(0);
  157 |   await page.getByLabel("4-digit PIN").fill("1234");
  158 |   await expect(page).toHaveURL(/\/watch\/home$/);
  159 |   expect(state.admissionBodies).toHaveLength(1);
  160 |   expect(state.admissionBodies[0]).toMatchObject({ profileId: profiles[3].id, parentPin: "1234" });
  161 |   expect(state.admissionBodies[0]).not.toHaveProperty("passcode");
  162 | });
  163 | 
  164 | test("Parent Mode remains PIN gated from own no-PIN profile picker", async ({ page }) => {
  165 |   const state = await noPinFamily(page);
  166 |   await picker(page);
  167 |   await page.getByRole("button", { name: "Parent Mode", exact: true }).click();
  168 |   await expect(page.getByRole("dialog")).toBeVisible();
  169 |   await expect(page.getByLabel("4-digit PIN")).toBeVisible();
  170 |   await expect(page).not.toHaveURL(/\/parent\//);
  171 |   expect(state.parentBodies).toHaveLength(0);
  172 |   expect(state.admissionBodies).toHaveLength(0);
  173 |   await page.getByRole("button", { name: "Cancel", exact: true }).click();
  174 |   await expect(own(page)).toBeEnabled();
  175 |   expect(state.writes.some(path => /reset|clear|unlock/.test(path))).toBe(false);
  176 | });
  177 | 
  178 | test("remote End now refusal persists across no-PIN retry and reload", async ({ page }) => {
  179 |   const state = await noPinFamily(page);
  180 |   state.blocked = true;
  181 |   await picker(page);
  182 |   for (let attempt = 0; attempt < 2; attempt++) {
  183 |     await own(page).click();
> 184 |     await expect(page.getByRole("alert")).toHaveText("Parent ended this session. Ask Parent when it is time again.");
      |                                           ^ Error: expect(locator).toHaveText(expected) failed
  185 |     await expect(page).toHaveURL(/\/watch$/);
  186 |     await expect(own(page)).toBeEnabled();
  187 |     await expect(page.getByRole("dialog")).toHaveCount(0);
  188 |     if (attempt === 0) { await page.reload(); await expect(own(page)).toBeEnabled(); }
  189 |   }
  190 |   await capture(page, "own-no-pin-parent-ended");
  191 |   credentialFree(state.admissionBodies);
  192 |   expect(state.admissionBodies).toHaveLength(2);
  193 |   expect(state.writes.some(path => /reset|clear|unlock|session-start/.test(path))).toBe(false);
  194 | });
  195 | 
```