import {browserRuntime} from './browser-runtime.mjs';
import {spawn} from 'node:child_process';
const executablePath=await browserRuntime();
const child=spawn(process.execPath,['node_modules/@playwright/test/cli.js','test',...process.argv.slice(2)],{stdio:'inherit',env:{...process.env,WATCHNEST_CHROMIUM:executablePath}});
child.on('exit',code=>process.exit(code??1));
