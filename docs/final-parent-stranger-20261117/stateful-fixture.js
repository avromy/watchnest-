global.synthetic=JSON.parse(JSON.stringify(baseFixture.dashboard));
global.sessionRows=baseFixture.profiles.map(profile=>({...profile,access:{enabled:false,allowed:true,state:'unlimited',remainingSeconds:null,pausedSeconds:null,revision:0,expiresAt:null},devices:[]}));
await page.route('**/api/parent/**',async route=>{
const u=new URL(route.request().url()),p=u.pathname,m=route.request().method(),b=route.request().postDataJSON();let result;
if(p==='/api/parent/dashboard')result=synthetic;
else if(p==='/api/parent/session-status')result={serverNow:new Date().toISOString(),profiles:sessionRows};
else if(p==='/api/parent/session-timer') {const row=sessionRows.find(x=>x.id===b.profile_id);row.access.revision++;if(b.action==='start'){Object.assign(row.access,{enabled:true,allowed:true,state:'active',remainingSeconds:b.duration_minutes*60,expiresAt:new Date(Date.now()+b.duration_minutes*60000).toISOString()});}else if(b.action==='extend'){row.access.remainingSeconds+=(b.duration_minutes||5)*60;row.access.expiresAt=new Date(Date.now()+row.access.remainingSeconds*1000).toISOString();}else if(b.action==='end'){Object.assign(row.access,{enabled:true,allowed:false,state:'ended',remainingSeconds:0,expiresAt:new Date().toISOString()});}result={ok:true};}
else if(p==='/api/parent/requests'&&m!=='GET'){synthetic.requests=synthetic.requests.filter(x=>x.id!==b.id);synthetic.workflow.openRequests=synthetic.requests.length;result={ok:true};}
else if(p==='/api/parent/videos'&&m==='PATCH'){const v=synthetic.videos.find(x=>x.id===b.video_id);if(v)Object.assign(v,{profile_ids:b.profile_ids,tags:b.tags});result={ok:true};}
else if(p==='/api/parent/collections'&&m!=='GET'){const c=synthetic.collections.find(x=>x.id===b.id);if(c)Object.assign(c,b);result={ok:true};}
else return route.fallback();
if(m!=='GET')mutations.push({path:p,body:b,fixture:'stateful'});
return route.fulfill({status:200,contentType:'application/json',body:JSON.stringify(result)});
});
