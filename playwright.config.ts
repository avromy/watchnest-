import {defineConfig} from '@playwright/test';
const port=process.env.WATCHNEST_TEST_PORT||'3001';
const baseURL=`http://127.0.0.1:${port}`;
export default defineConfig({testDir:'./e2e',fullyParallel:false,workers:1,timeout:30000,use:{baseURL,headless:true,launchOptions:{executablePath:process.env.WATCHNEST_CHROMIUM,args:process.env.WATCHNEST_CHROMIUM?['--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-zygote']:[]},trace:'retain-on-failure'},webServer:{command:`npm run start -- --hostname 127.0.0.1 --port ${port}`,url:baseURL,reuseExistingServer:!process.env.CI},reporter:[['list'],['json',{outputFile:'test-results/browser-results.json'}]]});
