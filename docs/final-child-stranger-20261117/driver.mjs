import {spawn} from 'node:child_process';
import fs from 'node:fs';
import readline from 'node:readline';
import ts from 'typescript';
import {chromium} from '@playwright/test';
import {browserRuntime} from '../../scripts/browser-runtime.mjs';
const dir='docs/final-child-stranger-20261117';
const src=fs.readFileSync('e2e/fixtures.ts','utf8');
fs.writeFileSync(`${dir}/fixture.mjs`,ts.transpileModule(src,{compilerOptions:{module:ts.ModuleKind.ESNext}}).outputText);
const {fixture,profiles,videos,collections}=await import('./fixture.mjs');
const server=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--port','3031','--hostname','127.0.0.1'],{stdio:['ignore','pipe','pipe']});
server.stdout.on('data',d=>process.stderr.write(d));server.stderr.on('data',d=>process.stderr.write(d));
const browser=await chromium.launch({executablePath:await browserRuntime(),headless:true,args:['--no-sandbox']});
let context,page,mutations;
async function fresh(mode='standard',width=1024,height=768){context=await browser.newContext({viewport:{width,height}});page=await context.newPage();mutations=await fixture(page,'child',mode);await page.goto('http://localhost:3031/watch');}
await fresh();
console.log('READY');
const rl=readline.createInterface({input:process.stdin});
for await(const line of rl){try{const value=await eval(`(async()=>{${line}})()`);console.log(JSON.stringify({result:value}));}catch(e){console.log(JSON.stringify({error:e.message}));}}
await browser.close();server.kill();
