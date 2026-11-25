import {chromium} from '../../node_modules/playwright-core/index.mjs';
import {browserRuntime} from '../../scripts/browser-runtime.mjs';
import fs from 'node:fs';
import ts from 'typescript';
import readline from 'node:readline';
const fixtureSource=fs.readFileSync('e2e/fixtures.ts','utf8');
fs.writeFileSync('docs/stranger-interactive-20261117/fixture.mjs',ts.transpileModule(fixtureSource,{compilerOptions:{module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText);
const {fixture}=await import('./fixture.mjs');
const browser=await chromium.launch({executablePath:await browserRuntime(),args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-zygote']});
let context=await browser.newContext({viewport:{width:1365,height:900},baseURL:'http://127.0.0.1:3017'});
let page=await context.newPage();
let mutations=await fixture(page,'child');
let count=0;
async function state(label){await page.screenshot({path:`docs/stranger-interactive-20261117/${String(++count).padStart(2,'0')}-${label}.png`,fullPage:true});return {url:page.url(),text:await page.locator('body').innerText(),buttons:await page.getByRole('button').allTextContents(),inputs:await page.locator('input').evaluateAll(xs=>xs.map(x=>({type:x.type,placeholder:x.placeholder})))}}
const rl=readline.createInterface({input:process.stdin});
console.log('READY');
for await(const line of rl){try{fs.appendFileSync('docs/stranger-interactive-20261117/actions.jsonl',JSON.stringify({time:new Date().toISOString(),code:line})+'\n');const result=await eval(`(async()=>{${line}})()`);console.log(JSON.stringify(result));}catch(e){console.log(JSON.stringify({error:e.message}));}}
