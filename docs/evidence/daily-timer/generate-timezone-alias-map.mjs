import {PGlite} from '@electric-sql/pglite';
import fs from 'node:fs';
const db=new PGlite();
const result=await db.query(`select distinct zone from(select name zone from pg_timezone_names union select abbrev zone from pg_timezone_abbrevs) q order by zone`);
// Documented legacy SHORT_IDS candidate names, not their Java canonical values:
// https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/time/ZoneId.html#SHORT_IDS
// Every mapping below is independently measured from this actual Node/ICU.
const common=['ACT','AET','AGT','ART','AST','BET','BST','CAT','CNT','CST','CTT','EAT','ECT','IET','IST','JST','MIT','NET','NST','PLT','PNT','PRT','PST','SST','VST'];
const candidates=[...new Set([...result.rows.map(r=>r.zone),...common])].sort();
const map=new Map();const rejected=[];
for(const input of candidates){if(input.includes('/'))continue;try{
 const canonical=new Intl.DateTimeFormat('en-US',{timeZone:input}).resolvedOptions().timeZone;
 const key=input.toUpperCase();if(map.has(key)&&map.get(key).canonical!==canonical)throw Error('case ambiguity');
 map.set(key,{input:key,canonical});
}catch(e){if(e.message==='case ambiguity')throw e;rejected.push(input);}}
const report={node:process.version,icu:process.versions.icu,tz:process.versions.tz,
 postgres:(await db.query('select version()')).rows[0].version,
 pgCandidateCount:result.rows.length,commonCandidateSource:'Oracle Java25 ZoneId.SHORT_IDS names; canonical values measured using Node Intl, not copied from Java',
 candidateCount:candidates.length,acceptedNoSlash:[...map.values()].sort((a,b)=>a.input.localeCompare(b.input)),rejectedNoSlash:rejected};
fs.writeFileSync(process.argv[2] || 'timezone-alias-map.generated.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({accepted:report.acceptedNoSlash.length,pgCandidates:report.pgCandidateCount,totalCandidates:report.candidateCount}));await db.close();
