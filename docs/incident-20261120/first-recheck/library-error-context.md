# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: request-preview.spec.ts >> Library collection and removal failures surface without losing selection
- Location: e2e/request-preview.spec.ts:103:5

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.selectOption: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByLabel('Add to Collection', { exact: true })

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
    - navigation "Library sections" [ref=e39]:
      - link "Videos" [ref=e40] [cursor=pointer]:
        - /url: /parent/library
      - link "Collections" [ref=e41] [cursor=pointer]:
        - /url: /parent/collections
      - link "Add videos" [ref=e42] [cursor=pointer]:
        - /url: /parent/add-video
    - main [ref=e43]:
      - generic [ref=e44]:
        - generic [ref=e45]:
          - paragraph [ref=e46]: Your approved library
          - heading "Family library" [level=1] [ref=e47]
          - paragraph [ref=e48]: Search and organize the videos you’ve approved.
        - link "Add videos" [ref=e49] [cursor=pointer]:
          - /url: /parent/add-video
      - generic [ref=e50]:
        - generic [ref=e51]:
          - generic [ref=e52]:
            - text: Search approved videos
            - searchbox "Search approved videos" [ref=e53]
          - generic [ref=e54]:
            - text: Child library
            - combobox "Child library" [ref=e55]:
              - option "All children" [selected]
              - option "Miri"
              - option "Ari"
              - option "Benny"
              - option "Eli"
        - generic [ref=e56]:
          - heading "1 selected · Choose who can watch" [level=3] [ref=e57]
          - group "Who can watch?" [ref=e58]:
            - button "Select all children" [ref=e60] [cursor=pointer]
            - generic [ref=e61] [cursor=pointer]:
              - checkbox "Miri" [ref=e62]
              - generic [ref=e63]: Miri
            - generic [ref=e64] [cursor=pointer]:
              - checkbox "Ari" [ref=e65]
              - generic [ref=e66]: Ari
            - generic [ref=e67] [cursor=pointer]:
              - checkbox "Benny" [ref=e68]
              - generic [ref=e69]: Benny
            - generic [ref=e70] [cursor=pointer]:
              - checkbox "Eli" [ref=e71]
              - generic [ref=e72]: Eli
          - paragraph [ref=e73]: Only the children selected here will retain access. Selecting none removes all child access.
          - generic [ref=e74]:
            - text: Add to Collection
            - combobox "Add to Collection" [ref=e75]:
              - option "Choose a Collection" [selected]
              - option "Little Makers"
          - button "Add selected to Collection" [disabled] [ref=e76]
          - button "Save" [ref=e77] [cursor=pointer]
          - button "Remove selected" [ref=e78] [cursor=pointer]
          - button "Cancel selection" [ref=e79] [cursor=pointer]
      - generic [ref=e80]:
        - article [ref=e81]:
          - generic [ref=e82]:
            - generic [ref=e83]: Video thumbnail unavailable
            - generic [ref=e84]: 3 min
          - generic [ref=e85]:
            - generic [ref=e86]:
              - checkbox "Build a paper rocket" [checked] [active] [ref=e87]
              - strong [ref=e88]: Build a paper rocket
            - paragraph [ref=e89]: Little Makers
            - paragraph [ref=e90]: Ari
            - generic [ref=e91]:
              - button "Preview" [ref=e92] [cursor=pointer]
              - button "Manage" [ref=e93] [cursor=pointer]
              - button "Remove" [ref=e94] [cursor=pointer]
        - article [ref=e95]:
          - generic [ref=e96]:
            - generic [ref=e97]: Video thumbnail unavailable
            - generic [ref=e98]: 4 min
          - generic [ref=e99]:
            - generic [ref=e100]:
              - checkbox "A gentle piano lesson" [ref=e101]
              - strong [ref=e102]: A gentle piano lesson
            - paragraph [ref=e103]: Music Room
            - paragraph [ref=e104]: Ari
            - generic [ref=e105]:
              - button "Preview" [ref=e106] [cursor=pointer]
              - button "Manage" [ref=e107] [cursor=pointer]
              - button "Remove" [ref=e108] [cursor=pointer]
        - article [ref=e109]:
          - generic [ref=e110]:
            - generic [ref=e111]: Video thumbnail unavailable
            - generic [ref=e112]: 5 min
          - generic [ref=e113]:
            - generic [ref=e114]:
              - checkbox "Draw a friendly fox" [ref=e115]
              - strong [ref=e116]: Draw a friendly fox
            - paragraph [ref=e117]: Little Makers
            - paragraph [ref=e118]: Ari
            - generic [ref=e119]:
              - button "Preview" [ref=e120] [cursor=pointer]
              - button "Manage" [ref=e121] [cursor=pointer]
              - button "Remove" [ref=e122] [cursor=pointer]
  - alert [ref=e123]
```

# Test source

```ts
  10  |   }, info) => {
  11  |     await page.setViewportSize(viewport);
  12  |     const changes = await fixture(page, "parent");
  13  |     const errors: string[] = [];
  14  |     page.on("pageerror", (error) => errors.push(error.message));
  15  |     await page.route("**/api/parent/dashboard", (route) =>
  16  |       route.fulfill({
  17  |         json: {
  18  |           ...dashboard,
  19  |           requests: [
  20  |             {
  21  |               ...dashboard.requests[0],
  22  |               kind: "video",
  23  |               youtube_video_id: "newvideo123",
  24  |               video_title: "Requested craft video",
  25  |               profile_id: profiles[1].id,
  26  |             },
  27  |           ],
  28  |         },
  29  |       }),
  30  |     );
  31  |     await page.route("https://www.youtube-nocookie.com/**", (route) =>
  32  |       route.fulfill({
  33  |         contentType: "text/html",
  34  |         body: "<p>Synthetic Parent preview; no provider playback claim.</p>",
  35  |       }),
  36  |     );
  37  |     await page.goto("/parent/inbox");
  38  |     const preview = page.getByText("Preview", { exact: true });
  39  |     await expect(page.locator('iframe')).toHaveCount(0);
  40  |     await preview.click();
  41  |     await expect(page.getByRole('dialog', {name:'Requested craft video'})).toBeVisible();
  42  |     await page.screenshot({
  43  |       path: info.outputPath("request-preview.png"),
  44  |       fullPage: true,
  45  |     });
  46  |     const frame = page.locator("iframe");
  47  |     await expect(frame).toBeVisible();
  48  |     const box = await frame.boundingBox();
  49  |     expect(box!.width).toBeGreaterThan(250);
  50  |     expect(box!.height).toBeGreaterThan(140);
  51  |     await page.getByRole('button', {name:'Close preview'}).click();
  52  |     await expect(frame).toHaveCount(0);
  53  |     await expect(preview).toBeFocused();
  54  |     await preview.press('Enter');
  55  |     await expect(frame).toBeVisible();
  56  |     await page.getByRole('button', {name:'Close preview'}).press('Escape');
  57  |     await expect(frame).toHaveCount(0);
  58  |     expect(changes).toEqual([]);
  59  |     expect(errors).toEqual([]);
  60  |   });
  61  | }
  62  | 
  63  | test('request preview slow frame has retry and never mutates approval', async ({page}) => {
  64  |   const changes = await fixture(page, 'parent');
  65  |   await page.route('**/api/parent/dashboard', route => route.fulfill({json:{...dashboard,requests:[{
  66  |     ...dashboard.requests[0],youtube_video_id:'newvideo123',video_title:'A requested video',kind:'video',
  67  |   }]}}));
  68  |   let release!: () => void;
  69  |   const held = new Promise<void>(resolve => {release = resolve;});
  70  |   await page.route('https://www.youtube-nocookie.com/**', async route => {await held; await route.fulfill({body:'Fixture'});});
  71  |   await page.clock.install();
  72  |   await page.goto('/parent/inbox');
  73  |   await page.getByRole('button',{name:'Preview',exact:true}).click();
  74  |   await page.clock.fastForward(13000);
  75  |   await expect(page.getByText(/preview is taking longer/)).toBeVisible();
  76  |   await page.getByRole('button',{name:'Retry preview'}).click();
  77  |   await expect(page.getByText('Loading the preview…')).toBeVisible();
  78  |   await page.getByRole('button',{name:'Close preview'}).click();
  79  |   release();
  80  |   await expect(page.locator('iframe')).toHaveCount(0);
  81  |   expect(changes).toEqual([]);
  82  | });
  83  | 
  84  | test('Inbox collection creation failures are visible and retry retains input', async ({page}) => {
  85  |   await fixture(page,'parent');
  86  |   const errors:string[]=[];
  87  |   page.on('pageerror',e=>errors.push(e.message));
  88  |   await page.route('**/api/parent/dashboard',route=>route.fulfill({json:{...dashboard,requests:[{
  89  |     ...dashboard.requests[0],youtube_video_id:'newvideo123',video_title:'A requested video',kind:'video',
  90  |   }]}}));
  91  |   await page.route('**/api/parent/collections',route=>route.fulfill({status:503,json:{error:'Collection service unavailable. Try again.'}}));
  92  |   await page.goto('/parent/inbox');
  93  |   await page.getByRole('button',{name:'Approve',exact:true}).click();
  94  |   await page.getByLabel('Collection (optional)').selectOption('__new');
  95  |   await page.getByPlaceholder('Collection name').fill('Crafts');
  96  |   await page.getByRole('button',{name:'Create',exact:true}).click();
  97  |   await expect(page.getByText('Collection service unavailable. Try again.')).toBeVisible();
  98  |   await expect(page.getByPlaceholder('Collection name')).toHaveValue('Crafts');
  99  |   await expect(page.getByRole('button',{name:'Create',exact:true})).toBeEnabled();
  100 |   expect(errors).toEqual([]);
  101 | });
  102 | 
  103 | test('Library collection and removal failures surface without losing selection',async({page})=>{
  104 |   await fixture(page,'parent');
  105 |   const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  106 |   await page.route('**/api/parent/collections',route=>route.fulfill({status:503,json:{error:'Collection update unavailable'}}));
  107 |   await page.route('**/api/parent/videos',route=>route.fulfill({status:401,json:{error:'Sign in again to manage videos'}}));
  108 |   await page.goto('/parent/library');
  109 |   await page.getByRole('checkbox',{name:dashboard.videos[0].title,exact:true}).check();
> 110 |   await page.getByLabel('Add to Collection', {exact:true}).selectOption(dashboard.collections[0].id);
      |                                                            ^ Error: locator.selectOption: Test timeout of 30000ms exceeded.
  111 |   await page.getByRole('button',{name:'Add selected to Collection',exact:true}).click();
  112 |   await expect(page.getByText('Collection update unavailable')).toBeVisible();
  113 |   await expect(page.getByRole('checkbox',{name:dashboard.videos[0].title,exact:true})).toBeChecked();
  114 |   page.on('dialog',dialog=>dialog.accept());
  115 |   await page.getByRole('button',{name:'Remove selected',exact:true}).click();
  116 |   await expect(page.getByText('Sign in again to manage videos')).toBeVisible();
  117 |   await expect(page.getByRole('checkbox',{name:dashboard.videos[0].title,exact:true})).toBeChecked();
  118 |   expect(errors).toEqual([]);
  119 | });
  120 | 
```