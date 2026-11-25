import {chromium} from '@playwright/test';
import {browserRuntime} from '../../../../scripts/browser-runtime.mjs';
import {fixture,dashboard} from '../../../../e2e/fixtures.ts';
import readline from 'node:readline';
const out='docs/incident-20261120/cold/parent-child';
const browser=await chromium.launch({executablePath:await browserRuntime(),args:['--no-sandbox','--disable-dev-shm-usage']});
let context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1});let page=await context.newPage();let mutations=await fixture(page,'parent');let errors=[];page.on('pageerror',e=>errors.push(String(e)));let index=0;
async function snap(name){await page.screenshot({path:`${out}/${String(++index).padStart(2,'0')}-${name}.png`,fullPage:true}); console.log('URL',page.url());console.log(await page.locator('body').innerText());console.log('CONTROLS',JSON.stringify(await page.locator('a,button,input,select,textarea').evaluateAll(es=>es.map(e=>({tag:e.tagName,text:e.innerText,placeholder:e.getAttribute('placeholder'),label:e.getAttribute('aria-label'),href:e.getAttribute('href'),type:e.getAttribute('type')})))));}
// Referenced by interactive commands evaluated below.
void dashboard; void mutations; void snap;
console.log('READY');
for await (const line of readline.createInterface({input:process.stdin})){try{console.log(await eval(`(async()=>{${line}})()`));}catch(e){console.log('ERROR',String(e));}}
