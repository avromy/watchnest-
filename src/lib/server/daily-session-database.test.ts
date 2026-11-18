import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const PARENT = "10000000-0000-4000-8000-000000000001";
const CHILD = "20000000-0000-4000-8000-000000000001";
const SIBLING = "20000000-0000-4000-8000-000000000002";
const OTHER = "10000000-0000-4000-8000-000000000002";
const MIGRATION = "supabase/migrations/20261118173600_daily_session_allowance.sql";
let db: PGlite;

type Timer = {
  server_now: string;
  revision: number;
  duration_minutes: number | null;
  expires_at: string | null;
  paused_seconds: number | null;
  mode: "once" | "daily";
  daily_allowance_minutes: number | null;
  daily_started: boolean;
  parent_blocked: boolean;
  period_start: string | null;
  reset_at: string | null;
  ready: boolean;
  timezone: string | null;
  profile_state: Record<string, unknown>;
};
const ms = (s: string | null) => Date.parse(s || "");
async function clock(at: string) {
  await db.exec(`create or replace function public.wn_session_clock() returns timestamptz
    language sql volatile security invoker set search_path=public
    as $$ select '${at}'::timestamptz $$`);
}
async function control(action: string, minutes: number | null = null, profile = CHILD, parent = PARENT) {
  const q = await db.query<{ value: Timer }>(
    "select wn_control_profile_session_v2($1::uuid,$2::uuid,$3::text,$4::integer) value",
    [parent, profile, action, minutes],
  );
  return q.rows[0].value;
}
async function resolve(activate = false, profile = CHILD, parent = PARENT) {
  const q = await db.query<{ value: Timer }>(
    "select wn_resolve_profile_session($1::uuid,$2::uuid,$3::boolean) value",
    [parent, profile, activate],
  );
  return q.rows[0].value;
}
async function reset(at = "2026-11-18T15:00:00Z") {
  await db.exec("update parents set timezone='America/New_York'");
  await clock(at);
  await control("start", 1);
  await control("disable");
}

describe("daily wall-clock allowance database authority", () => {
  beforeAll(async () => {
    db = new PGlite();
    await db.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      create table parents(id uuid primary key,timezone text not null default 'America/New_York');
      create table profiles(id uuid primary key,parent_id uuid references parents(id),archived_at timestamptz,
        session_duration_minutes smallint check(session_duration_minutes between 1 and 240),session_expires_at timestamptz);
      create table household_devices(id uuid primary key);
      create table child_sessions(id uuid primary key,profile_id uuid,revoked_at timestamptz,expires_at timestamptz);
      insert into parents(id) values('${PARENT}'),('${OTHER}');
      insert into profiles(id,parent_id) values('${CHILD}','${PARENT}'),('${SIBLING}','${PARENT}');
    `);
    await db.exec(readFileSync("supabase/migrations/20261026151813_remote_parent_session_control.sql", "utf8"));
    await db.exec(readFileSync(MIGRATION, "utf8"));
    await db.exec("grant usage on schema public to anon,authenticated,service_role; grant select,update on profiles to service_role; grant select on parents to service_role;");
  }, 20_000);
  afterAll(async () => db.close());

  it("adapts the existing v1 control safely and does not opt old households into daily mode", async () => {
    expect((await db.query<{ def: string }>("select pg_get_functiondef('wn_control_profile_session(uuid,uuid,text,integer)'::regprocedure) def")).rows[0].def).toContain("wn_control_profile_session_v2");
    const t = await resolve();
    expect(t).toMatchObject({mode: "once",duration_minutes:null,daily_allowance_minutes:null,parent_blocked:false});
  });

  it.each([1,5,10,20,30,45,60,240])("accepts a %i-minute one-off grant", async minutes => {
    await reset();
    const t = await control("start",minutes);
    expect(ms(t.expires_at)).toBe(Date.parse("2026-11-18T15:00:00Z")+minutes*60_000);
    expect(t).toMatchObject({mode:"once",duration_minutes:minutes,parent_blocked:false});
  });

  it.each([0,-1,241])("rejects invalid duration %i atomically", async minutes => {
    await reset();
    const before=await resolve();
    await expect(control("daily",minutes)).rejects.toThrow("Invalid duration");
    expect(await resolve()).toEqual(before);
  });

  it("rejects null and invalid action, wrong-family profile and archived profile", async () => {
    await reset();
    await expect(control("daily",null)).rejects.toThrow("Invalid duration");
    await expect(control("unknown",1)).rejects.toThrow("Invalid session action");
    await expect(resolve(true,CHILD,OTHER)).rejects.toThrow("Profile unavailable");
    await expect(control("start",1,CHILD,OTHER)).rejects.toThrow("Profile unavailable");
    await db.exec(`update profiles set archived_at=now() where id='${SIBLING}'`);
    await expect(resolve(true,SIBLING)).rejects.toThrow("Profile unavailable");
    await db.exec(`update profiles set archived_at=null where id='${SIBLING}'`);
  });

  it("configures a pending daily window without starting on Parent read; first Child use starts once", async () => {
    await reset();
    const configured=await control("daily",5);
    expect(configured).toMatchObject({mode:"daily",ready:true,daily_started:false,expires_at:null});
    await clock("2026-11-18T16:00:00Z");
    const parent=await resolve(false);
    expect(parent.expires_at).toBeNull();
    const child=await resolve(true);
    expect(ms(child.expires_at)).toBe(Date.parse("2026-11-18T16:05:00Z"));
    await clock("2026-11-18T16:01:00Z");
    const next=await resolve(true);
    expect(next.expires_at).toBe(child.expires_at);
    expect(next.revision).toBe(child.revision);
  });

  it("exhausts before reset and renews at exactly local7AM without an open app or Parent clearing", async () => {
    await reset("2026-11-18T11:50:00Z");
    await control("daily",1);await resolve(true);
    await clock("2026-11-18T11:59:59Z");
    const expired=await resolve(true);
    expect(ms(expired.expires_at)).toBeLessThan(Date.parse("2026-11-18T11:59:59Z"));
    expect(expired.daily_started).toBe(true);
    await clock("2026-11-18T12:00:00Z");
    const renewed=await resolve(false);
    expect(renewed).toMatchObject({ready:true,daily_started:false,expires_at:null,parent_blocked:false});
    expect(ms(renewed.period_start)).toBe(Date.parse("2026-11-18T12:00:00Z"));
    expect(ms(renewed.reset_at)).toBe(Date.parse("2026-11-19T12:00:00Z"));
    const activated=await resolve(true);
    expect(ms(activated.expires_at)).toBe(Date.parse("2026-11-18T12:01:00Z"));
  });

  it("does not carry unused minutes across a daily boundary and caps a window at that boundary", async () => {
    await reset("2026-11-18T11:59:30Z");await control("daily",60);
    expect(ms((await resolve(true)).expires_at)).toBe(Date.parse("2026-11-18T12:00:00Z"));
    await clock("2026-11-18T12:01:00Z");
    expect(ms((await resolve(true)).expires_at)).toBe(Date.parse("2026-11-18T13:01:00Z"));
  });

  it("never renews a one-off grant, including after multiple offline days", async () => {
    await reset();const granted=await control("start",1);
    await clock("2026-11-23T15:00:00Z");
    const later=await resolve(true);
    expect(later).toMatchObject({mode:"once",daily_allowance_minutes:null,reset_at:null});
    expect(later.expires_at).toBe(granted.expires_at);expect(later.revision).toBe(granted.revision);
  });

  it("keeps End now locked through renewal/configuration/extension until explicit Parent Resume", async () => {
    await reset();await control("daily",5);await resolve(true);await control("end");
    expect((await resolve(true)).parent_blocked).toBe(true);
    await control("daily",10);
    expect((await resolve(true)).parent_blocked).toBe(true);
    await clock("2026-11-19T12:00:00Z");
    const renewed=await resolve(true);
    expect(renewed).toMatchObject({parent_blocked:true,daily_started:false});
    expect(ms(renewed.expires_at)).toBeLessThanOrEqual(Date.parse("2026-11-19T12:00:00Z"));
    await control("extend",1);
    expect((await resolve(true)).parent_blocked).toBe(true);
    const allowed=await control("resume");
    expect(allowed.parent_blocked).toBe(false);expect(allowed.expires_at).toBeTruthy();
  });

  it("preserves Pause across reset, refresh and repeated Pause; explicit Resume uses only the fresh day budget", async () => {
    await reset();await control("daily",5);await resolve(true);
    await clock("2026-11-18T15:01:00Z");const paused=await control("pause");
    expect(paused.paused_seconds).toBe(240);
    await clock("2026-11-18T15:02:00Z");expect((await control("pause")).paused_seconds).toBe(240);
    await clock("2026-11-19T12:01:00Z");
    expect(await resolve(true)).toMatchObject({paused_seconds:300,daily_started:false,expires_at:null});
    const resumed=await control("resume");
    expect(ms(resumed.expires_at)).toBe(Date.parse("2026-11-19T12:06:00Z"));
  });

  it("removes recurrence without lifting an ongoing Parent lock, and explicit Allow access is required", async () => {
    await reset();await control("daily",5);await control("end");
    const disabled=await control("disable");
    expect(disabled).toMatchObject({mode:"once",duration_minutes:null,daily_allowance_minutes:null,parent_blocked:true});
    await clock("2026-11-20T15:00:00Z");expect((await resolve(true)).parent_blocked).toBe(true);
    expect(await control("resume")).toMatchObject({parent_blocked:false,duration_minutes:null,mode:"once"});
  });

  it("switches modes deliberately; Give Time does not keep daily recurrence", async () => {
    await reset();await control("daily",60);await control("end");
    const once=await control("start",1);
    expect(once).toMatchObject({mode:"once",daily_allowance_minutes:null,parent_blocked:false});
  });

  it("serializes simultaneous device requests without allocating two windows or extending on reconnect", async () => {
    await reset();await control("daily",5);
    const results=await Promise.all([resolve(true),resolve(true),resolve(true)]);
    expect(new Set(results.map(x=>x.expires_at)).size).toBe(1);
    expect(new Set(results.map(x=>x.revision)).size).toBe(1);
    await clock("2026-11-18T15:02:00Z");expect((await resolve(true)).expires_at).toBe(results[0].expires_at);
    // PGlite executes these calls serially; this proves idempotence, not a
    // genuine two-connection PostgreSQL lock stress test. SQL owns FOR UPDATE.
  });

  it.each([
    ["2026-03-07T12:00:00Z","2026-03-08T11:00:00Z",23],
    ["2026-10-31T11:00:00Z","2026-11-01T12:00:00Z",25],
  ])("computes DST-local7AM period %s → %s", async (at,resetAt,hours) => {
    const q=await db.query<{period_start:Date;reset_at:Date}>("select * from wn_daily_session_period($1::timestamptz,'America/New_York')",[at]);
    expect(q.rows[0].reset_at.toISOString()).toBe(new Date(resetAt).toISOString());
    expect((q.rows[0].reset_at.getTime()-q.rows[0].period_start.getTime())/3600000).toBe(hours);
  });

  it("uses the existing configured family timezone, retaining an active stored boundary until rollover", async () => {
    await reset();await db.exec(`update parents set timezone='Asia/Jerusalem' where id='${PARENT}'`);
    const t=await control("daily",5);
    expect(t.timezone).toBe("Asia/Jerusalem");
    expect(ms(t.reset_at)).toBe(Date.parse("2026-11-19T05:00:00Z"));
    await db.exec(`update parents set timezone='America/Los_Angeles' where id='${PARENT}'`);
    expect((await resolve()).reset_at).toBe(t.reset_at);
    await clock("2026-11-19T05:01:00Z");
    expect((await resolve()).timezone).toBe("America/Los_Angeles");
  });

  it("does not alter a sibling's deadline or period", async () => {
    await reset();await control("start",20,SIBLING);const sibling=await resolve(false,SIBLING);
    await control("daily",5);await clock("2026-11-20T15:00:00Z");await resolve(true);
    expect((await resolve(false,SIBLING)).profile_state).toEqual(sibling.profile_state);
  });

  it.each(["anon","authenticated"])("denies direct new RPC and clock access to %s", async role => {
    for (const sql of [
      `select wn_resolve_profile_session('${PARENT}','${CHILD}',true)`,
      `select wn_control_profile_session_v2('${PARENT}','${CHILD}','start',1)`,
      "select wn_session_clock()",
      "select * from wn_daily_session_period(now(),'America/New_York')",
    ]) {
      await db.exec(`set role ${role}`);
      await expect(db.query(sql)).rejects.toThrow("permission denied");
      await db.exec("reset role");
    }
  });
  it("keeps legacy v1 End now and Disable denied across daily renewal", async () => {
    await reset();await control("daily",5);await resolve(true);
    await db.query("select wn_control_profile_session($1::uuid,$2::uuid,'end',null)",[PARENT,CHILD]);
    await clock("2026-11-19T12:01:00Z");await resolve(true);
    const physical=await db.query<{enabled:boolean;denied:boolean}>("select session_duration_minutes is not null enabled,coalesce(session_expires_at<=wn_session_clock(),true) denied from profiles where id=$1::uuid",[CHILD]);
    expect(physical.rows[0]).toEqual({enabled:true,denied:true});
    await db.query("select wn_control_profile_session($1::uuid,$2::uuid,'disable',null)",[PARENT,CHILD]);
    const disabled=await resolve(true);expect(disabled).toMatchObject({duration_minutes:null,parent_blocked:true,limit_disabled:true});
    expect((await db.query<{legacy_denied:boolean}>("select session_duration_minutes is not null and session_expires_at<=wn_session_clock() legacy_denied from profiles where id=$1::uuid",[CHILD])).rows[0].legacy_denied).toBe(true);
    expect(await control("resume")).toMatchObject({duration_minutes:null,parent_blocked:false,limit_disabled:false});
  });

  it("uses safe adapters for the older start/end RPCs and denies End now from unlimited", async () => {
    await reset();
    await db.query("select wn_end_profile_session($1::uuid,$2::uuid,false)",[PARENT,CHILD]);
    expect(await resolve(true)).toMatchObject({parent_blocked:true,limit_disabled:true,duration_minutes:null});
    expect((await db.query<{denied:boolean}>("select session_duration_minutes=1 and session_expires_at<=wn_session_clock() denied from profiles where id=$1::uuid",[CHILD])).rows[0].denied).toBe(true);
    await db.query("select wn_start_profile_session($1::uuid,$2::uuid,1)",[PARENT,CHILD]);
    expect(await resolve()).toMatchObject({parent_blocked:false,limit_disabled:false,duration_minutes:1,mode:"once"});
  });

  it("does not replenish an exhausted day on identical configuration retries or change a repeated End lock", async () => {
    await reset();await control("daily",1);const started=await resolve(true);
    await clock("2026-11-18T15:02:00Z");
    const same=await control("daily",1);expect(same.expires_at).toBe(started.expires_at);expect(same.revision).toBe(started.revision);
    const ended=await control("end");await clock("2026-11-18T15:03:00Z");
    const repeated=await control("end");expect(repeated.profile_state).toEqual(ended.profile_state);
  });

  it("enables a bounded one-time grant on Extend from an off limit without lifting an End lock", async () => {
    await reset();await control("end");await control("disable");
    const extended=await control("extend",1);
    expect(extended).toMatchObject({parent_blocked:true,limit_disabled:false,duration_minutes:1,paused_seconds:60});
    const resumed=await control("resume");expect(resumed.parent_blocked).toBe(false);
    expect(ms(resumed.expires_at)).toBe(Date.parse("2026-11-18T15:01:00Z"));
  });

  it("uses server absolute time regardless of connection-local timezone or a missing client-time parameter", async () => {
    await reset();await db.exec("set timezone='Pacific/Auckland'");
    const daily=await control("daily",1);expect(ms(daily.reset_at)).toBe(Date.parse("2026-11-19T12:00:00Z"));
    expect(ms((await resolve(true)).expires_at)).toBe(Date.parse("2026-11-18T15:01:00Z"));
    await db.exec("set timezone='UTC'");
    const q=await db.query<{n:number}>("select pronargs n from pg_proc where proname='wn_resolve_profile_session'");
    expect(q.rows).toEqual([{n:3}]);
  });

  it("preserves an activated allowance through a database dump/restart and cannot allocate it again", async () => {
    await reset();await control("daily",5);const original=await resolve(true);
    const dump=await db.dumpDataDir();await db.close();db=new PGlite({loadDataDir:dump});
    await clock("2026-11-18T15:02:00Z");const reconnected=await resolve(true);
    expect(reconnected.profile_state).toEqual(original.profile_state);
    await clock("2026-11-19T12:00:00Z");const nextDay=await resolve(false);
    expect(nextDay).toMatchObject({ready:true,daily_started:false,expires_at:null});
  },20_000);

  it.each([
    ["+03:00","2026-11-19T04:00:00Z"],
    ["+0300","2026-11-19T04:00:00Z"],
    ["+03","2026-11-19T04:00:00Z"],
    ["-03:30","2026-11-19T10:30:00Z"],
    ["-0330","2026-11-19T10:30:00Z"],
    ["-03","2026-11-19T10:00:00Z"],
    ["+00","2026-11-19T07:00:00Z"],
    ["-00:30","2026-11-19T07:30:00Z"],
    ["Etc/GMT+3","2026-11-19T10:00:00Z"],
  ])("renews at ISO-offset/IANA local7AM for %s without reversing the sign", async (zone,expected) => {
    await reset("2026-11-18T12:00:00Z");
    await db.query("update parents set timezone=$1 where id=$2::uuid",[zone,PARENT]);
    const configured=await control("daily",1);
    expect(configured.timezone).toBe(zone);
    expect(ms(configured.reset_at)).toBe(Date.parse(expected));
    await resolve(true);
    await clock(new Date(Date.parse(expected)-1).toISOString());
    expect((await resolve()).daily_started).toBe(true);
    await clock(expected);
    const renewed=await resolve();
    expect(renewed).toMatchObject({daily_started:false,ready:true,expires_at:null});
    expect(ms(renewed.period_start)).toBe(Date.parse(expected));
    expect(ms(renewed.reset_at)).toBe(Date.parse(expected)+86400000);
  });

  // Measured finite alias pool: actual pg_timezone_names/pg_timezone_abbrevs +
  // documented Java SHORT_IDS names; values are Node24.22.1 ICU78.3 Intl output.
  const intlAliasCases = [
  [
    "ACT",
    "Australia/Darwin"
  ],
  [
    "AET",
    "Australia/Sydney"
  ],
  [
    "AGT",
    "America/Buenos_Aires"
  ],
  [
    "ART",
    "Africa/Cairo"
  ],
  [
    "AST",
    "America/Anchorage"
  ],
  [
    "BET",
    "America/Sao_Paulo"
  ],
  [
    "BST",
    "Asia/Dhaka"
  ],
  [
    "CAT",
    "Africa/Maputo"
  ],
  [
    "CET",
    "Europe/Brussels"
  ],
  [
    "CNT",
    "America/St_Johns"
  ],
  [
    "CST",
    "America/Chicago"
  ],
  [
    "CST6CDT",
    "CST6CDT"
  ],
  [
    "CTT",
    "Asia/Shanghai"
  ],
  [
    "CUBA",
    "America/Havana"
  ],
  [
    "EAT",
    "Africa/Nairobi"
  ],
  [
    "ECT",
    "Europe/Paris"
  ],
  [
    "EET",
    "Europe/Athens"
  ],
  [
    "EGYPT",
    "Africa/Cairo"
  ],
  [
    "EIRE",
    "Europe/Dublin"
  ],
  [
    "EST",
    "America/Panama"
  ],
  [
    "EST5EDT",
    "EST5EDT"
  ],
  [
    "GB",
    "Europe/London"
  ],
  [
    "GB-EIRE",
    "Europe/London"
  ],
  [
    "GMT",
    "UTC"
  ],
  [
    "GMT-0",
    "UTC"
  ],
  [
    "GMT+0",
    "UTC"
  ],
  [
    "GMT0",
    "UTC"
  ],
  [
    "GREENWICH",
    "UTC"
  ],
  [
    "HONGKONG",
    "Asia/Hong_Kong"
  ],
  [
    "HST",
    "Pacific/Honolulu"
  ],
  [
    "ICELAND",
    "Atlantic/Reykjavik"
  ],
  [
    "IET",
    "America/Indianapolis"
  ],
  [
    "IRAN",
    "Asia/Tehran"
  ],
  [
    "ISRAEL",
    "Asia/Jerusalem"
  ],
  [
    "IST",
    "Asia/Calcutta"
  ],
  [
    "JAMAICA",
    "America/Jamaica"
  ],
  [
    "JAPAN",
    "Asia/Tokyo"
  ],
  [
    "JST",
    "Asia/Tokyo"
  ],
  [
    "KWAJALEIN",
    "Pacific/Kwajalein"
  ],
  [
    "LIBYA",
    "Africa/Tripoli"
  ],
  [
    "MET",
    "Europe/Brussels"
  ],
  [
    "MIT",
    "Pacific/Apia"
  ],
  [
    "MST",
    "America/Phoenix"
  ],
  [
    "MST7MDT",
    "MST7MDT"
  ],
  [
    "NAVAJO",
    "America/Denver"
  ],
  [
    "NET",
    "Asia/Yerevan"
  ],
  [
    "NST",
    "Pacific/Auckland"
  ],
  [
    "NZ",
    "Pacific/Auckland"
  ],
  [
    "NZ-CHAT",
    "Pacific/Chatham"
  ],
  [
    "PLT",
    "Asia/Karachi"
  ],
  [
    "PNT",
    "America/Phoenix"
  ],
  [
    "POLAND",
    "Europe/Warsaw"
  ],
  [
    "PORTUGAL",
    "Europe/Lisbon"
  ],
  [
    "PRC",
    "Asia/Shanghai"
  ],
  [
    "PRT",
    "America/Puerto_Rico"
  ],
  [
    "PST",
    "America/Los_Angeles"
  ],
  [
    "PST8PDT",
    "PST8PDT"
  ],
  [
    "ROC",
    "Asia/Taipei"
  ],
  [
    "ROK",
    "Asia/Seoul"
  ],
  [
    "SINGAPORE",
    "Asia/Singapore"
  ],
  [
    "SST",
    "Pacific/Guadalcanal"
  ],
  [
    "TURKEY",
    "Europe/Istanbul"
  ],
  [
    "UCT",
    "UTC"
  ],
  [
    "UNIVERSAL",
    "UTC"
  ],
  [
    "UTC",
    "UTC"
  ],
  [
    "VST",
    "Asia/Saigon"
  ],
  [
    "W-SU",
    "Europe/Moscow"
  ],
  [
    "WET",
    "Europe/Lisbon"
  ],
  [
    "ZULU",
    "UTC"
  ]
] as const;
  it.each(intlAliasCases)("aligns legacy alias %s with Intl %s in summer and winter", async (alias,canonical) => {
    // ICU releases may choose equivalent canonical spellings; assert the
    // actual local7AM instant below rather than pinning that spelling.
    expect(new Intl.DateTimeFormat("en-US",{timeZone:alias}).resolvedOptions().timeZone).toBeTruthy();
    for (const at of ["2026-01-15T12:00:00Z","2026-07-15T12:00:00Z"]) {
      const named=(await db.query<{period_start:Date;reset_at:Date}>("select * from wn_daily_session_period($1::timestamptz,$2)",[at,alias])).rows[0];
      const resolved=(await db.query<{period_start:Date;reset_at:Date}>("select * from wn_daily_session_period($1::timestamptz,$2)",[at,canonical])).rows[0];
      expect(named).toEqual(resolved);
      expect(named.period_start.getTime()).toBeLessThanOrEqual(Date.parse(at));
      expect(named.reset_at.getTime()).toBeGreaterThan(Date.parse(at));
      const parts=new Intl.DateTimeFormat("en-US",{timeZone:alias,hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"}).formatToParts(named.reset_at);
      expect(parts.find(p=>p.type==="hour")?.value).toBe("07");
      expect(parts.find(p=>p.type==="minute")?.value).toBe("00");
      expect(parts.find(p=>p.type==="second")?.value).toBe("00");
    }
  });

  it.each([
    ["CST","2026-01-15T12:00:00Z","2026-01-15T13:00:00Z"],
    ["CST","2026-07-15T12:00:00Z","2026-07-16T12:00:00Z"],
    ["PST","2026-01-15T12:00:00Z","2026-01-15T15:00:00Z"],
    ["PST","2026-07-15T12:00:00Z","2026-07-15T14:00:00Z"],
    ["EST","2026-07-15T12:00:00Z","2026-07-16T12:00:00Z"],
    ["MST","2026-07-15T12:00:00Z","2026-07-15T14:00:00Z"],
  ])("freezes the exact7AM instant for %s at %s", async (zone,at,expected) => {
    const row=(await db.query<{reset_at:Date}>("select * from wn_daily_session_period($1::timestamptz,$2)",[at,zone])).rows[0];
    expect(row.reset_at.toISOString()).toBe(new Date(expected).toISOString());
  });

  it("linearizes each Parent transition at one post-lock server instant across7AM", async () => {
    await reset("2026-11-18T11:59:58Z");await control("daily",5);await resolve(true);
    await db.exec(`
      create table test_session_clock_reads(calls integer not null);
      insert into test_session_clock_reads values(0);
      create or replace function public.wn_session_clock() returns timestamptz
      language plpgsql volatile security invoker set search_path=public as $$
      declare n integer;
      begin
        update test_session_clock_reads set calls=calls+1 returning calls into n;
        return case when n=1 then '2026-11-18T11:59:59Z'::timestamptz
                    else '2026-11-18T12:00:01Z'::timestamptz end;
      end $$;
    `);
    const extended=await control("extend",1);
    expect((await db.query<{calls:number}>("select calls from test_session_clock_reads")).rows[0].calls).toBe(1);
    expect(ms(extended.server_now)).toBe(Date.parse("2026-11-18T11:59:59Z"));
    expect(ms(extended.expires_at)).toBe(Date.parse("2026-11-18T12:00:00Z"));
    const nextPeriod=await resolve(false);
    expect((await db.query<{calls:number}>("select calls from test_session_clock_reads")).rows[0].calls).toBe(2);
    expect(ms(nextPeriod.server_now)).toBe(Date.parse("2026-11-18T12:00:01Z"));
    expect(ms(nextPeriod.period_start)).toBe(Date.parse("2026-11-18T12:00:00Z"));
    expect(nextPeriod).toMatchObject({daily_started:false,ready:true,expires_at:null});
  });

});
