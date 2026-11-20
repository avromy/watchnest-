import {spawn} from 'node:child_process';
const server=spawn('npm',['run','start','--','--hostname','127.0.0.1','--port','3006'],{stdio:['ignore','pipe','pipe']});
await new Promise((resolve,reject)=>{server.stdout.on('data',x=>{if(x.toString().includes('Ready'))resolve()});server.on('error',reject)});
import { chromium } from 'playwright';
import { browserRuntime } from '../../../../scripts/browser-runtime.mjs';
import { installReview } from '../audit-support.mjs';
import fs from 'node:fs';
import readline from 'node:readline';
const out='docs/evidence/profile-handoff/stranger';
const browser=await chromium.launch({executablePath:await browserRuntime(),headless:true,args:['--no-sandbox']});
const context=await browser.newContext({viewport:{width:1024,height:768},deviceScaleFactor:1});
const page=await context.newPage();
await installReview(page,'child');
await page.goto('http://127.0.0.1:3006/watch');
let n=0;const journal=[];
async function snap(label){await page.screenshot({path:`${out}/${String(++n).padStart(2,'0')}-${label}.png`,fullPage:true});console.log('URL',page.url());console.log(await page.locator('body').innerText());}
await snap('child-entry');
const rl=readline.createInterface({input:process.stdin});
for await (const line of rl){try{const result=await eval(line);if(result!==undefined)console.log(result);}catch(e){console.log('ERR',e.message)}}
await browser.close();
server.kill();
