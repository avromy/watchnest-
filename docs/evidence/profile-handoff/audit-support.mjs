// Synthetic review support only. No hosted account, provider video or secrets.
import { fixture, profiles, videos, collections } from '../../../e2e/fixtures.ts';
export async function installReview(page, role='child') {
  await fixture(page, role);
  let current = profiles[2];
  const journal = [];
  await page.route('**/api/**', async (r) => {
    const path = new URL(r.request().url()).pathname;
    const method = r.request().method();
    const b = r.request().postDataJSON();
    journal.push({path,method});
    if(path==='/api/auth/device')return r.fulfill({json:{profiles,parent_pin_set:true,active_profile_id:current.id}});
    if(path==='/api/auth/child'){
      const target=profiles.find(p=>p.id===b.profileId);
      if(!target)return r.fulfill({status:401,json:{error:'Profile unavailable.'}});
      if(target.id!==current.id && b.parentPin!=='2468')return r.fulfill({status:401,json:{error:'That Parent PIN is not correct.'}});
      if(target.id===current.id && target.pin_enabled && b.passcode!=='1937')return r.fulfill({status:401,json:{error:'Incorrect passcode.'}});
      current=target;return r.fulfill({json:{profile:current}});
    }
    if(path==='/api/child/library')return r.fulfill({json:{profile:current,videos,collections}});
    return r.fallback();
  });
  return journal;
}
