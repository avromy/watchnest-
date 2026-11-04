import { test, expect, type Page } from '@playwright/test';
import { dashboard, fixture, profiles } from './fixtures';

test.use({ screenshot: 'only-on-failure' });

// Independently selected tasks frozen in PremiumFreshParentStranger-20261104.md.
// All transport/data/player content is synthetic; this is browser UI evidence only.
const candidate = { ...dashboard.videos[0], id: '10000000-0000-4000-8000-000000000099', youtube_video_id: 'newvideo123', title: 'Lego train adventure', profile_ids: [] as string[] };
async function setup(page: Page) {
  const changes = await fixture(page, 'parent');
  await page.setViewportSize({width:390,height:844});
  await page.route('https://www.youtube-nocookie.com/**', route => route.fulfill({status:200,contentType:'text/html',body:'<p>Synthetic player frame — no playback claim</p>'}));
  await page.route('**/api/parent/videos/search?**', route => route.fulfill({json:{videos:[candidate],errors:[]}}));
  await page.route('**/api/parent/dashboard', route => {
    const approved=changes.find(c=>c.path==='/api/parent/videos');
    const resolved=changes.some(c=>c.path.includes('/requests'));
    return route.fulfill({json:{...dashboard, videos:approved?[...dashboard.videos,{...candidate,profile_ids:approved.body.profile_ids??[]}]:dashboard.videos,requests:resolved?[]:dashboard.requests}});
  });
  await page.route('**/api/parent/videos/lookup', route => route.fulfill({json:{videos:[candidate],errors:[]}}));
  return changes;
}
async function previewWithoutApproval(page: Page, changes: {path:string;body:any}[], screenshot: string) {
  const before = changes.filter(c=>c.path==='/api/parent/videos').length;
  await page.getByRole('button',{name:'Preview',exact:true}).first().click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog').getByRole('heading',{name:candidate.title})).toBeVisible();
  await page.screenshot({path:screenshot,fullPage:true});
  await page.getByRole('button',{name:'Close preview',exact:true}).click();
  expect(changes.filter(c=>c.path==='/api/parent/videos').length).toBe(before);
}

test('fresh busy Parent follows a child topic request to preview and approval',async({page},info)=>{
  const changes = await setup(page);
  await page.goto('/parent/dashboard');
  await page.getByRole('link',{name:/Requests/}).click();
  await expect(page.getByRole('heading',{name:'Lego trains',exact:true})).toBeVisible();
  await page.getByRole('link',{name:'Find a video',exact:true}).click();
  await expect(page.getByRole('searchbox',{name:'Search',exact:true})).toHaveValue('Lego trains');
  await page.getByRole('button',{name:'Search',exact:true}).click();
  await expect(page.getByRole('heading',{name:candidate.title,exact:true})).toBeVisible();
  await previewWithoutApproval(page,changes,info.outputPath('busy-parent-preview.png'));
  await page.getByRole('checkbox',{name:'Ari',exact:true}).check();
  await page.screenshot({path:info.outputPath('busy-parent-ready-to-approve.png'),fullPage:true});
  await page.getByRole('button',{name:/Approve 1 selected videos/}).click();
  await expect.poll(()=>changes.filter(c=>c.path==='/api/parent/videos').length).toBe(1);
  console.log('FRESH_PARENT_APPROVAL',JSON.stringify(changes));
  await page.screenshot({path:info.outputPath('busy-parent-after-approval.png'),fullPage:true});
  await page.getByRole('link',{name:/Requests/}).click();
  await page.screenshot({path:info.outputPath('busy-parent-request-outcome.png'),fullPage:true});
  // Frozen expectation: resolving a topic through approval should visibly resolve its request.
  await expect(page.getByRole('heading',{name:'Lego trains',exact:true})).toHaveCount(0);
});

test('fresh low-confidence Parent corrects a pasted link then previews and assigns one child',async({page},info)=>{
  const changes = await setup(page);
  await page.goto('/parent/dashboard');
  await page.getByRole('link',{name:'Add videos',exact:true}).first().click();
  await page.getByRole('button',{name:'Paste video links',exact:true}).click();
  const links=page.getByLabel('Paste one YouTube video link per line');
  await links.fill('https://example.com/not-a-video');
  await page.getByRole('button',{name:'Load videos',exact:true}).click();
  await expect(page.getByText(/valid YouTube|YouTube video link|couldn.t find|No valid/i).last()).toBeVisible();
  await expect(links).toHaveValue('https://example.com/not-a-video');
  await page.screenshot({path:info.outputPath('new-parent-invalid-link.png'),fullPage:true});
  await links.fill('https://youtu.be/newvideo123');
  await expect(page.getByRole('heading',{name:candidate.title,exact:true})).toBeVisible();
  await previewWithoutApproval(page,changes,info.outputPath('new-parent-preview.png'));
  await page.getByRole('checkbox',{name:'Miri',exact:true}).check();
  for(const name of ['Ari','Benny','Eli']) await page.getByRole('checkbox',{name,exact:true}).uncheck();
  await page.screenshot({path:info.outputPath('new-parent-one-child.png'),fullPage:true});
  await page.getByRole('button',{name:/Approve 1 selected videos/}).click();
  await expect.poll(()=>changes.filter(c=>c.path==='/api/parent/videos').length).toBe(1);
  const approval=changes.find(c=>c.path==='/api/parent/videos')!;
  console.log('FRESH_PARENT_APPROVAL',JSON.stringify(approval));
  expect(JSON.stringify(approval.body)).toContain(profiles[0].id);
  expect(JSON.stringify(approval.body)).not.toContain(profiles[1].id);
  await page.screenshot({path:info.outputPath('new-parent-confirmation.png'),fullPage:true});
  await page.getByRole('link',{name:'Videos',exact:true}).click();
  await expect(page.getByText(candidate.title,{exact:true})).toBeVisible();
  await page.screenshot({path:info.outputPath('new-parent-library-outcome.png'),fullPage:true});
});

test('fresh Parent signs in with password visibility reassurance',async({page},info)=>{
  await setup(page);
  let signedIn=false;
  await page.route('**/api/session',route=>route.fulfill({json:signedIn ? {role:'parent',configured:true,parent:{email:'synthetic@example.test',parent_pin_set:true}} : {role:null,configured:true}}));
  await page.route('**/api/auth/parent',route=>{signedIn=true;return route.fulfill({json:{ok:true}})});
  await page.goto('/login');
  await page.getByLabel('Email',{exact:true}).fill('synthetic@example.test');
  const password=page.getByLabel('Password',{exact:true});
  await password.fill('synthetic-not-real');
  await page.getByRole('button',{name:'Show password',exact:true}).click();
  await expect(password).toHaveAttribute('type','text');
  await page.getByRole('button',{name:'Hide password',exact:true}).click();
  await expect(password).toHaveAttribute('type','password');
  await page.getByRole('button',{name:'Sign in',exact:true}).click();
  await expect(page).toHaveURL(/\/parent\/dashboard$/);
  await expect(page.getByRole('heading',{name:'Their favorites. Your family library.'})).toBeVisible();
  await page.screenshot({path:info.outputPath('signed-in-dashboard.png'),fullPage:true});
});
