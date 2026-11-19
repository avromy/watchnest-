import { chromium, expect } from '@playwright/test';
import { spawn } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { browserRuntime } from '../../../../scripts/browser-runtime.mjs';
import { fixture } from '../../../../e2e/fixtures.ts';
import { installStateful } from '../stranger/stateful-support.mjs';
const out='docs/evidence/profile-handoff/singular-recheck';
const journal=[]; let browser;
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','-p','3007','-H','127.0.0.1'],{stdio:['ignore','pipe','pipe']});
let serverLog='';server.stdout.on('data',d=>serverLog+=d);server.stderr.on('data',d=>serverLog+=d);
try {
for(let i=0;i<100;i++){try{if((await fetch('http://127.0.0.1:3007')).ok)break}catch{} await new Promise(r=>setTimeout(r,100));}
browser=await chromium.launch({executablePath:await browserRuntime(),headless:true,args:['--no-sandbox','--disable-dev-shm-usage','--single-process','--no-zygote']});
const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
await fixture(page,'parent');const adapter=await installStateful(page);
await page.goto('http://127.0.0.1:3007/parent');
await page.getByRole('link',{name:'Time',exact:true}).click();
await expect(page.getByRole('heading',{name:'Time controls',exact:true})).toBeVisible();
await expect(page.getByText('Checking child devices…')).toHaveCount(0);
await page.getByText('Give time or set daily allowance',{exact:true}).first().click();
await page.getByLabel('Custom minutes',{exact:true}).first().fill('1');
journal.push({action:'navigate actual parent Time link; open first child settings; fill Custom minutes',value:1});
await page.getByRole('button',{name:'Give 1 minute',exact:true}).click();
journal.push({action:'click Give 1 minute'});
async function capture(state){
 const add=page.getByRole('button',{name:'Add 1 minute',exact:true}).first();
 await expect(add).toBeVisible();
 await expect(page.getByRole('button',{name:'Add 1 minutes',exact:true})).toHaveCount(0);
 await expect(page.getByLabel('Custom minutes',{exact:true}).first()).toHaveValue('1');
 await add.scrollIntoViewIfNeeded();
 await add.focus();
 await page.keyboard.press('Tab');
 await page.keyboard.press('Shift+Tab');
 const geometry=await add.evaluate(el=>{const r=el.getBoundingClientRect(),c=getComputedStyle(el);return {text:el.textContent,rect:{x:r.x,y:r.y,width:r.width,height:r.height},focused:document.activeElement===el,outlineStyle:c.outlineStyle,outlineWidth:c.outlineWidth,outlineColor:c.outlineColor}});
 const overflow=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth,body:document.body.scrollWidth}));
 const text=await page.locator('body').innerText();
 if(geometry.rect.width<44||geometry.rect.height<44)throw Error('tap target below 44 px');
 if(overflow.document>overflow.viewport)throw Error('horizontal overflow');
 if(!geometry.focused||geometry.outlineStyle==='none')throw Error('focus not visible');
 await page.screenshot({path:`${out}/${state}-390x844.png`});
 journal.push({state,url:page.url(),geometry,overflow,body:text,mutations:[...adapter.changes]});
}
await capture('active');
await page.getByRole('button',{name:'Pause',exact:true}).first().click();
journal.push({action:'click Pause first child'});
await expect(page.getByRole('button',{name:'Resume',exact:true}).first()).toBeVisible();
await capture('paused');
await page.getByRole('button',{name:'End now',exact:true}).first().click();
journal.push({action:'click End now first child'});
await expect(page.getByRole('button',{name:'Resume',exact:true})).toHaveCount(0);
console.log('BLOCKED',await page.locator('body').innerText());
await capture('blocked');
await page.getByRole('button',{name:'Add 1 minute',exact:true}).first().click();
await expect(page.getByRole('button',{name:'Pause',exact:true}).first()).toBeVisible();
journal.push({action:'click blocked Add 1 minute',mutations:[...adapter.changes]});
await writeFile(`${out}/journal.json`,JSON.stringify({source:'decd2681e693de7ef33ea067610117c7467123b4',verdict:'PASS',limits:'Actual compiled Next app with browser-intercepted synthetic API and review-only state adapter; no backend persistence/auth/device/hosted verification.',journal},null,2));
console.log('PASS',JSON.stringify(journal.filter(x=>x.state).map(({state,geometry,overflow})=>({state,geometry,overflow}))));
}finally{if(browser)await browser.close();server.kill('SIGTERM');await writeFile(`${out}/server.log`,serverLog);}
