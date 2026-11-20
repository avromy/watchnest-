// Review-only synthetic presentation state. Does not exercise handlers or database.
import {dashboard} from '../../../../e2e/fixtures.ts';
export async function installStateful(page){
 const changes=[]; let state='ready',mode='daily',minutes=5,revision=1;
 const reset=()=>{const date=new Date();date.setUTCDate(date.getUTCDate()+1); date.setUTCHours(12,0,0,0);return date.toISOString()};
 await page.route('**/api/parent/session-status',async route=>{const now=Date.now(); await route.fulfill({json:{serverNow:new Date(now).toISOString(),profiles:dashboard.profiles.map(p=>({...p,devices:[],access:{enabled:true,allowed:['ready','active'].includes(state),state,mode,dailyAllowanceMinutes:minutes,dailyStarted:['active','expired'].includes(state),parentBlocked:state==='blocked',limitDisabled:false,resetAt:reset(),timezone:'America/New_York',expiresAt:state==='active'?new Date(now+minutes*60000).toISOString():null,remainingSeconds:state==='expired'?0:minutes*60,pausedSeconds:state==='paused'?minutes*60:null,revision,serverNow:new Date(now).toISOString()}}))}})});
 await page.route('**/api/parent/session-timer',async route=>{const body=route.request().postDataJSON();changes.push(body); minutes=body.duration_minutes||minutes; if(body.action==='daily'){mode='daily';state='ready'} else if(body.action==='start'){mode='once';state='active'} else if(body.action==='pause')state='paused';else if(body.action==='resume')state='active';else if(body.action==='end')state='blocked';else if(body.action==='allow')state='ready';else if(body.action==='extend')state='active';revision++;await route.fulfill({json:{ok:true}})});
 return {changes,setState(s){state=s;revision++}};
}
