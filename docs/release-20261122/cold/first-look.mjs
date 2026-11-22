import {chromium} from '@playwright/test';
import {browserRuntime} from '../../../scripts/browser-runtime.mjs';
const b=await chromium.launch({headless:true,executablePath:await browserRuntime(),args:['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-zygote']});
const p=await b.newPage({viewport:{width:390,height:844}});
await p.goto('http://127.0.0.1:3007');await p.screenshot({path:'docs/release-20261122/cold/01-cold-landing-mobile.png',fullPage:true});console.log(await p.locator('body').innerText());await b.close();
