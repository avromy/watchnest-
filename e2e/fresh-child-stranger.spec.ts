import { test, expect, type Page, type TestInfo } from '@playwright/test';
import { fixture, profiles, videos, collections } from './fixtures';

test.use({ screenshot: 'only-on-failure' });

// Independently selected journeys, synthetic access/data only. No provider playback claim.
async function evidence(page: Page, info: TestInfo, name: string) {
  await page.screenshot({ path: info.outputPath(`${name}.png`), fullPage: true });
  await info.attach(name, { body: await page.locator('body').ariaSnapshot(), contentType: 'text/plain' });
}
async function family(page: Page, mode = 'standard') {
  await fixture(page, 'child', mode);
  let current = { ...profiles[1], experience_mode: mode, discover_enabled: true, discovery_topics: ['Drawing'], discovery_channels: [] };
  let favorite = false;
  let requested = false;
  const mutations: { path: string; body: any }[] = [];
  await page.route('**/api/**', async route => {
    const path = new URL(route.request().url()).pathname;
    const method = route.request().method();
    const body = route.request().postDataJSON();
    const fulfill = (data: any, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
    if (method !== 'GET') mutations.push({ path, body });
    if (path === '/api/auth/child') {
      const selected = profiles.find(p => p.id === body.profile_id) || profiles[1];
      if (selected.pin_enabled && body.pin !== '1234') return fulfill({ error: 'That PIN didn’t match. Try again.' }, 401);
      current = { ...selected, experience_mode: mode, discover_enabled: true, discovery_topics: ['Drawing'], discovery_channels: [] };
      return fulfill({ profile: current });
    }
    if (path === '/api/session') return fulfill({ role: 'child', configured: true, profile: current, parent: { parent_pin_set: true } });
    if (path === '/api/child/library') return fulfill({ profile: current, videos: videos.map(v => ({ ...v, favorite: v.id === videos[2].id && favorite })), collections });
    if (/favorite/.test(path)) { favorite = !favorite; return fulfill({ ok: true }); }
    if (path === '/api/child/discover') return fulfill({ results: [{ youtube_video_id: 'newvideo123', title: 'Draw a fox', channel_title: 'Little Makers', thumbnail_url: '', duration_seconds: 600, request_token: 'signed-candidate-token-that-is-long-enough' }] });
    if (path === '/api/child/requests') {
      if (method === 'POST') { requested = true; return fulfill({ ok: true }); }
      return fulfill({ requests: requested ? [{ id: 'request-1', kind: 'video', message: 'Draw a fox', video_title: 'Draw a fox', youtube_video_id: 'newvideo123', status: 'pending', created_at: new Date().toISOString() }] : [] });
    }
    return route.fallback();
  });
  return mutations;
}
test.use({ viewport: { width: 768, height: 1024 } });
test.afterEach(async ({ page }, info) => { if (info.status !== info.expectedStatus) await evidence(page, info, 'failure').catch(() => {}); });

test('fresh younger child chooses a picture and returns to own library', async ({ page }, info) => {
  await family(page, 'simple');
  await page.route('https://www.youtube.com/iframe_api', r => r.abort());
  await page.route('https://www.youtube-nocookie.com/**', r => r.fulfill({ contentType: 'text/html', body: '' }));
  await page.goto('/watch');
  await page.getByRole('button', { name: /Benny.*Open my library/ }).click();
  await expect(page.getByText('Hi, Benny.', { exact: true })).toBeVisible();
  await evidence(page, info, 'younger-home');
  await page.getByRole('button', { name: 'Library', exact: true }).click();
  await page.getByRole('link', { name: 'Play Build a paper rocket', exact: true }).click();
  await expect(page).toHaveURL(/\/watch\/player\//);
  await evidence(page, info, 'younger-player');
  const back = page.getByRole('link', { name: /Back|Library|Home/ }).first();
  await expect(back).toBeVisible();
  await back.click();
  await expect(page).toHaveURL(/\/watch/);
  await expect(page.getByRole('button', { name: /Benny/ })).toBeVisible();
  await evidence(page, info, 'younger-return');
});

test('fresh older child retrieves saves and requests', async ({ page }, info) => {
  const mutations = await family(page);
  await page.goto('/watch');
  await page.getByRole('button', { name: /Ari.*Open my library/ }).click();
  await page.getByLabel('4-digit PIN').fill('1234');
  await expect(page.getByText('Hi, Ari.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Library', exact: true }).click();
  await page.getByPlaceholder('Search your library').fill('friendly fox');
  await expect(page.getByRole('link', { name: /^Play / })).toHaveCount(1);
  await page.getByRole('button', { name: 'Add Draw a friendly fox to Favorites', exact: true }).click();
  await page.getByPlaceholder('Search your library').fill('');
  await page.getByRole('button', { name: 'Home', exact: true }).click();
  await page.getByRole('button', { name: /Favorites/ }).click();
  await expect(page.getByRole('link', { name: 'Play Draw a friendly fox', exact: true })).toBeVisible();
  await evidence(page, info, 'older-favorite-retrieved');
  await page.getByRole('button', { name: 'Discover', exact: true }).click();
  await page.getByLabel('What do you want to find?').fill('fox');
  await page.getByRole('button', { name: 'Search', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Draw a fox', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Ask Parent', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Waiting for Parent', exact: true })).toBeVisible();
  expect(mutations.some(m => m.path === '/api/child/requests')).toBe(true);
  await expect(page.locator('.discover-results iframe, .discover-results a')).toHaveCount(0);
  await evidence(page, info, 'older-request-pending');
});

test('fresh shared family switch PIN recovery and parent boundary', async ({ page }, info) => {
  await family(page);
  await page.goto('/watch');
  await page.getByRole('button', { name: /Eli.*Open my library/ }).click();
  await expect(page.getByText('Hi, Eli.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Eli/ }).click();
  await expect(page.getByRole('heading', { name: 'Who’s watching?' })).toBeVisible();
  await page.getByRole('button', { name: /Ari.*Open my library/ }).click();
  await page.getByLabel('4-digit PIN').fill('0000');
  await expect(page.getByText('That PIN didn’t match. Try again.', { exact: true })).toBeVisible();
  await evidence(page, info, 'shared-wrong-pin');
  await page.getByLabel('4-digit PIN').fill('1234');
  await expect(page.getByText('Hi, Ari.', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: /Ari/ }).click();
  await page.getByRole('button', { name: 'Parent Mode', exact: true }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByLabel('4-digit PIN')).toBeVisible();
  await expect(page).not.toHaveURL(/\/parent\//);
  await evidence(page, info, 'shared-parent-boundary');
});
