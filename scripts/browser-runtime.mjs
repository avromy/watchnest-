import {createReadStream,createWriteStream,existsSync,statSync,mkdirSync,chmodSync,writeFileSync} from 'node:fs';
import {createBrotliDecompress} from 'node:zlib';
import {pipeline} from 'node:stream/promises';
import {tmpdir} from 'node:os';
import {join,dirname,resolve} from 'node:path';
import {createRequire} from 'node:module';
import tar from 'tar-fs';
const require=createRequire(import.meta.url);
export async function browserRuntime(){const root=join(tmpdir(),'watchnest-chromium');mkdirSync(root,{recursive:true});const bin=resolve(dirname(require.resolve('@sparticuz/chromium')),'../../bin');const executablePath=join(root,'chromium');if(!existsSync(executablePath)||statSync(executablePath).size<1000000)await pipeline(createReadStream(join(bin,'chromium.br')),createBrotliDecompress(),createWriteStream(executablePath,{mode:0o700}));chmodSync(executablePath,0o700);for(const name of ['fonts','swiftshader']){const target=name==='fonts'?join(root,'fonts'):root;await pipeline(createReadStream(join(bin,`${name}.tar.br`)),createBrotliDecompress(),tar.extract(target,{chown:false}));}writeFileSync(join(root,'fonts','fonts.conf'),`<?xml version="1.0"?><!DOCTYPE fontconfig SYSTEM "fonts.dtd"><fontconfig><dir>${join(root,'fonts','fonts')}</dir><dir>/usr/share/fonts</dir><cachedir>${join(root,'font-cache')}</cachedir></fontconfig>`);process.env.FONTCONFIG_PATH=join(root,'fonts');process.env.LD_LIBRARY_PATH=root+(process.env.LD_LIBRARY_PATH?':'+process.env.LD_LIBRARY_PATH:'');return executablePath;}
