import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

const parent = "10000000-0000-4000-8000-000000000001";
const foreignParent = "10000000-0000-4000-8000-000000000002";
const child = "20000000-0000-4000-8000-000000000001";
const sibling = "20000000-0000-4000-8000-000000000002";
const foreign = "20000000-0000-4000-8000-000000000003";
const device = "30000000-0000-4000-8000-000000000001";
const otherDevice = "30000000-0000-4000-8000-000000000002";
const foreignDevice = "30000000-0000-4000-8000-000000000003";
let db: PGlite;
let token = 0;
const migration = () => readFileSync("supabase/migrations/20261119034107_device_profile_handoff.sql", "utf8");
const retirement = () => readFileSync("docs/operations/profile-handoff/20261119035652_retire_legacy_child_admission.sql", "utf8");

async function admit(options: {
  profile?: string; device?: string; parent?: string; authorized?: boolean;
  parentHash?: string | null; pinEnabled?: boolean; pinHash?: string | null;
  bypass?: boolean; expires?: string;
} = {}) {
  const r = await db.query<{ value: string | null }>(
    "select wn_admit_device_child_session($1::uuid,$2::uuid,$3::uuid,$4::boolean,$5::text,$6::text,$7::timestamptz,$8::boolean,$9::text,$10::boolean) value",
    [options.device ?? device, options.parent ?? parent, options.profile ?? child,
      options.pinEnabled ?? false, options.pinHash ?? null, `test-token-${++token}`,
      options.expires ?? new Date(Date.now() + 3_600_000).toISOString(),
      options.authorized ?? false, options.parentHash === undefined ? "parent-hash" : options.parentHash,
      options.bypass ?? false],
  );
  return r.rows[0].value;
}

describe("device-bound Parent-authorized profile admission: real PostgreSQL semantics", () => {
  beforeAll(async () => {
    db = new PGlite();
    await db.exec(`
      create role anon; create role authenticated; create role service_role bypassrls;
      create table parents(id uuid primary key,parent_pin_hash text,timezone text not null default 'America/New_York');
      create table profiles(id uuid primary key,parent_id uuid not null references parents(id),
        pin_enabled boolean not null default false,pin_hash text,archived_at timestamptz,
        session_duration_minutes smallint,session_expires_at timestamptz,unique(id,parent_id));
      create table household_devices(id uuid primary key,parent_id uuid not null references parents(id),
        expires_at timestamptz not null,revoked_at timestamptz);
      create table child_sessions(id uuid primary key default gen_random_uuid(),profile_id uuid not null references profiles(id),
        token_hash text not null unique,created_at timestamptz not null default now(),expires_at timestamptz not null,revoked_at timestamptz);
      insert into parents(id,parent_pin_hash) values('${parent}','parent-hash'),('${foreignParent}','foreign-hash');
      insert into profiles(id,parent_id) values('${child}','${parent}'),('${sibling}','${parent}'),('${foreign}','${foreignParent}');
      insert into household_devices(id,parent_id,expires_at) values('${device}','${parent}',now()+interval '1 day'),('${otherDevice}','${parent}',now()+interval '1 day'),('${foreignDevice}','${foreignParent}',now()+interval '1 day');
    `);
    await db.exec(readFileSync("supabase/migrations/20261026151813_remote_parent_session_control.sql", "utf8"));
    await db.exec(readFileSync("supabase/migrations/20261118173600_daily_session_allowance.sql", "utf8"));
    await db.exec(readFileSync("supabase/migrations/20261002020000_atomic_child_admission.sql", "utf8"));
    // One unambiguous existing identity; another device has conflicting legacy sessions.
    await db.exec(`insert into child_sessions(profile_id,device_id,token_hash,expires_at) values
      ('${child}','${device}','backfill-one',now()+interval '1 hour'),
      ('${child}','${otherDevice}','backfill-ambiguous-a',now()+interval '1 hour'),
      ('${sibling}','${otherDevice}','backfill-ambiguous-b',now()+interval '1 hour');`);
    await db.exec(migration());
  }, 20_000);
  afterAll(async () => db.close());

  it("backfills only a single unambiguous live identity; ambiguous/new devices require Parent", async () => {
    expect((await db.query<{ id: string; active_profile_id: string | null }>("select id,active_profile_id from household_devices order by id")).rows).toEqual([
      {id:device,active_profile_id:child},{id:otherDevice,active_profile_id:null},{id:foreignDevice,active_profile_id:null},
    ]);
  });

  it("phase 1 keeps legacy RPC/direct admission compatible until the separate post-promotion cutover", async () => {
    const old=(await db.query<{value:string|null}>("select wn_admit_child_session($1::uuid,false,null,'legacy-phase-one',now()+interval '1 hour') value",[child])).rows[0].value;
    expect(old).toBeTruthy();
    await db.exec(`insert into child_sessions(profile_id,device_id,token_hash,expires_at) values('${sibling}','${otherDevice}','legacy-direct-phase-one',now()+interval '1 hour')`);
    expect((await db.query<{admission_version:number}>("select admission_version from child_sessions where token_hash like 'legacy-%'")).rows.map(r=>r.admission_version)).toEqual([1,1]);
    expect((await db.query<{exists:boolean}>("select exists(select 1 from pg_trigger where tgname='child_sessions_require_device_handoff_admission') exists")).rows[0].exists).toBe(false);
  });

  describe("admission transitions", () => {
    beforeEach(async () => {
      await db.exec(`delete from child_sessions;
        update parents set parent_pin_hash='parent-hash' where id='${parent}';
        update profiles set archived_at=null,pin_enabled=false,pin_hash=null;
        update household_devices set active_profile_id=null,revoked_at=null,expires_at=now()+interval '1 day';
        update household_devices set active_profile_id='${child}' where id='${device}';
        update household_devices set active_profile_id='${sibling}' where id='${otherDevice}';
        update profiles set session_duration_minutes=1,session_expires_at=now()-interval '1 minute',session_parent_blocked=true where id='${child}';
      `);
    });

    it("rejects a stopped child's sibling switch even after child-cookie removal", async () => {
      expect(await admit({profile:sibling})).toBeNull();
      expect((await db.query<{active_profile_id:string}>(`select active_profile_id from household_devices where id='${device}'`)).rows[0].active_profile_id).toBe(child);
    });
    it("requires Parent for an unbound device rather than treating a missing identity as permission", async () => {
      await db.exec(`update household_devices set active_profile_id=null where id='${device}'`);
      expect(await admit()).toBeNull();
      expect(await admit({authorized:true})).toBeTruthy();
    });
    it("permits same-profile reentry without Parent but does not clear End-now or timer", async () => {
      expect(await admit()).toBeTruthy();
      const r = (await db.query<{session_parent_blocked:boolean;session_expires_at:string;session_duration_minutes:number}>(`select session_parent_blocked,session_expires_at,session_duration_minutes from profiles where id='${child}'`)).rows[0];
      expect(r.session_parent_blocked).toBe(true);
      expect(r.session_duration_minutes).toBe(1);
      expect(Date.parse(r.session_expires_at)).toBeLessThan(Date.now());
    });
    it("Parent handoff moves only this device, revokes old tokens and leaves sibling timer/other device intact", async () => {
      const old = await admit();
      const other = await admit({device:otherDevice,profile:sibling});
      const before = (await db.query(`select * from profiles where id='${sibling}'`)).rows[0];
      const current = await admit({profile:sibling,authorized:true});
      expect(current).toBeTruthy();
      const sessions=(await db.query<{id:string;revoked_at:string|null}>("select id,revoked_at from child_sessions")).rows;
      expect(sessions.find(s=>s.id===old)?.revoked_at).toBeTruthy();
      expect(sessions.find(s=>s.id===other)?.revoked_at).toBeNull();
      expect(sessions.find(s=>s.id===current)?.revoked_at).toBeNull();
      expect((await db.query(`select * from profiles where id='${sibling}'`)).rows[0]).toEqual(before);
      expect(await admit()).toBeNull(); // old-tab retry of prior identity
    });
    it("repeat same-target admissions serialize to one live token without starting or extending budgets", async () => {
      const results = await Promise.all([admit(),admit(),admit()]);
      expect(results.every(Boolean)).toBe(true);
      expect((await db.query<{n:number}>(`select count(*)::int n from child_sessions where device_id='${device}' and revoked_at is null`)).rows[0].n).toBe(1);
      // PGlite serializes requests; this is idempotent end-state evidence, not real multi-connection stress.
    });
    it("an insert failure rolls back token revocation and profile binding together", async () => {
      const original=await admit();
      const tokenHash=(await db.query<{token_hash:string}>("select token_hash from child_sessions where id=$1",[original])).rows[0].token_hash;
      await expect(db.query(
        "select wn_admit_device_child_session($1::uuid,$2::uuid,$3::uuid,false,null,$4::text,now()+interval '1 hour',true,'parent-hash',false)",
        [device,parent,sibling,tokenHash],
      )).rejects.toThrow();
      expect((await db.query<{active_profile_id:string}>("select active_profile_id from household_devices where id=$1",[device])).rows[0].active_profile_id).toBe(child);
      expect((await db.query<{revoked_at:string|null}>("select revoked_at from child_sessions where id=$1",[original])).rows[0].revoked_at).toBeNull();
    });
    it("a changed Parent PIN invalidates the previously verified Parent snapshot", async () => {
      await db.exec(`update parents set parent_pin_hash='new-parent-hash' where id='${parent}'`);
      expect(await admit({profile:sibling,authorized:true})).toBeNull();
      expect(await admit({profile:sibling,authorized:true,parentHash:"new-parent-hash"})).toBeTruthy();
    });
    it("compares a null Parent PIN snapshot too; no null-as-wildcard authorization", async () => {
      expect(await admit({profile:sibling,authorized:true,parentHash:null})).toBeNull();
      await db.exec(`update parents set parent_pin_hash=null where id='${parent}'`);
      expect(await admit({profile:sibling,authorized:true,parentHash:null})).toBeTruthy();
    });
    it("rejects stale child PIN security snapshots even with Parent handoff", async () => {
      await db.exec(`update profiles set pin_enabled=true,pin_hash='child-hash' where id='${sibling}'`);
      expect(await admit({profile:sibling,authorized:true})).toBeNull();
      expect(await admit({profile:sibling,authorized:true,pinEnabled:true,pinHash:"old"})).toBeNull();
      expect(await admit({profile:sibling,authorized:true,pinEnabled:true,pinHash:"child-hash",bypass:true})).toBeTruthy();
    });
    it("does not accept a child-PIN bypass flag without verified Parent authority", async () => {
      expect(await admit({bypass:true})).toBeNull();
    });
    it("SQL NULL authority is not Parent permission and does not set an admission marker", async () => {
      const marker=(await db.query<{value:string|null}>("select current_setting('watchnest.device_handoff_admission',true) value")).rows[0].value;
      expect((await db.query<{value:string|null}>("select wn_admit_device_child_session($1::uuid,$2::uuid,$3::uuid,false,null,'null-parent',now()+interval '1 hour',null,null,null) value",[device,parent,sibling])).rows[0].value).toBeNull();
      expect((await db.query<{value:string|null}>("select current_setting('watchnest.device_handoff_admission',true) value")).rows[0].value).toBe(marker);
    });
    it("new admission labels only its token v2 and restores a previous transaction-local marker", async () => {
      await db.exec("begin; select set_config('watchnest.device_handoff_admission','prior-value',true)");
      try {
        const admitted=await admit();
        expect((await db.query<{admission_version:number}>("select admission_version from child_sessions where id=$1",[admitted])).rows[0].admission_version).toBe(2);
        expect((await db.query<{value:string}>("select current_setting('watchnest.device_handoff_admission',true) value")).rows[0].value).toBe("prior-value");
      } finally { await db.exec("rollback"); }
      expect((await db.query<{value:string|null}>("select current_setting('watchnest.device_handoff_admission',true) value")).rows[0].value).not.toBe("2");
    });
    it.each(["archived","revoked","expired","expired-session"])("rejects %s admission", async kind => {
      if(kind==="archived") await db.exec(`update profiles set archived_at=now() where id='${child}'`);
      if(kind==="revoked") await db.exec(`update household_devices set revoked_at=now() where id='${device}'`);
      if(kind==="expired") await db.exec(`update household_devices set expires_at=now()-interval '1 second' where id='${device}'`);
      expect(await admit({expires:kind==="expired-session"?"2020-01-01T00:00:00Z":undefined})).toBeNull();
    });
    it("rejects foreign-profile and foreign-device requests even with a Parent flag", async () => {
      expect(await admit({profile:foreign,authorized:true})).toBeNull();
      expect(await admit({device:foreignDevice,authorized:true})).toBeNull();
      expect(await admit({parent:foreignParent,authorized:true})).toBeNull();
    });
    it("composite FK prevents a service writer binding a device to another family's profile", async () => {
      await expect(db.exec(`update household_devices set active_profile_id='${foreign}' where id='${device}'`)).rejects.toThrow();
    });
    it("keeps RPC invoker security and denies anon/authenticated execution", async () => {
      const sig="wn_admit_device_child_session(uuid,uuid,uuid,boolean,text,text,timestamp with time zone,boolean,text,boolean)";
      expect((await db.query<{anon:boolean;authenticated:boolean;service:boolean;definer:boolean}>(`select has_function_privilege('anon','${sig}','execute') anon,has_function_privilege('authenticated','${sig}','execute') authenticated,has_function_privilege('service_role','${sig}','execute') service,prosecdef definer from pg_proc where oid='${sig}'::regprocedure`)).rows[0]).toEqual({anon:false,authenticated:false,service:true,definer:false});
    });
  });

  describe("separate phase 2 retires legacy-origin admission without reopening sibling identity", () => {
    beforeEach(async () => {
      await db.exec(`drop trigger if exists child_sessions_require_device_handoff_admission on child_sessions;
        delete from child_sessions;
        update parents set parent_pin_hash='parent-hash' where id='${parent}';
        update profiles set archived_at=null,pin_enabled=false,pin_hash=null;
        update household_devices set active_profile_id=null,revoked_at=null,expires_at=now()+interval '1 day';
        update household_devices set active_profile_id='${child}' where id='${device}';
        insert into child_sessions(profile_id,device_id,token_hash,expires_at) values('${sibling}','${otherDevice}','legacy-retired',now()+interval '1 hour');`);
      await admit();
      await db.exec(retirement());
    });

    it("revokes every v1 token while preserving live v2 and every profile budget", async () => {
      const rows=(await db.query<{admission_version:number;revoked_at:string|null}>("select admission_version,revoked_at from child_sessions order by admission_version")).rows;
      expect(rows).toHaveLength(2);
      expect(rows[0].admission_version).toBe(1);
      expect(rows[0].revoked_at).toBeTruthy();
      expect(rows[1]).toMatchObject({admission_version:2,revoked_at:null});
      const before=(await db.query("select id,session_duration_minutes,session_expires_at,session_parent_blocked,daily_allowance_minutes from profiles order by id")).rows;
      await db.exec(retirement()); // repeat is fail-closed/idempotent; no new v1 was admitted
      expect((await db.query("select id,session_duration_minutes,session_expires_at,session_parent_blocked,daily_allowance_minutes from profiles order by id")).rows).toEqual(before);
    });
    it("rejects the actual old admission RPC and old Parent direct-insert pattern", async () => {
      await expect(db.query("select wn_admit_child_session($1::uuid,false,null,'old-origin-rpc',now()+interval '1 hour')",[sibling])).rejects.toThrow("can no longer start child sessions");
      await expect(db.query("insert into child_sessions(profile_id,device_id,token_hash,expires_at) values($1,$2,'old-parent-direct',now()+interval '1 hour')",[sibling,otherDevice])).rejects.toThrow("can no longer start child sessions");
    });
    it("rejects a caller-supplied v2 version outside the guarded RPC", async () => {
      await expect(db.query("insert into child_sessions(profile_id,device_id,token_hash,expires_at,admission_version) values($1,$2,'spoof-v2',now()+interval '1 hour',2)",[sibling,otherDevice])).rejects.toThrow("can no longer start child sessions");
      await db.exec("begin; select set_config('watchnest.device_handoff_admission','2',true)");
      try {
        await expect(db.query("insert into child_sessions(profile_id,device_id,token_hash,expires_at) values($1,$2,'still-v1',now()+interval '1 hour')",[sibling,otherDevice])).rejects.toThrow("can no longer start child sessions");
      } finally { await db.exec("rollback"); }
    });
    it("the new RPC still admits a Parent-authorized sibling after retirement", async () => {
      const admitted=await admit({profile:sibling,authorized:true,bypass:true});
      expect(admitted).toBeTruthy();
      expect((await db.query<{admission_version:number;revoked_at:string|null}>("select admission_version,revoked_at from child_sessions where id=$1",[admitted])).rows[0]).toMatchObject({admission_version:2,revoked_at:null});
      expect(await admit()).toBeNull();
      expect((await db.query<{value:string|null}>("select current_setting('watchnest.device_handoff_admission',true) value")).rows[0].value).not.toBe("2");
    });
    it("a failed new insert restores marker/binding/session state through statement rollback", async () => {
      const original=(await db.query<{id:string;token_hash:string}>("select id,token_hash from child_sessions where admission_version=2 and revoked_at is null")).rows[0];
      await expect(db.query("select wn_admit_device_child_session($1::uuid,$2::uuid,$3::uuid,false,null,$4::text,now()+interval '1 hour',true,'parent-hash',true)",[device,parent,sibling,original.token_hash])).rejects.toThrow();
      expect((await db.query<{value:string|null}>("select current_setting('watchnest.device_handoff_admission',true) value")).rows[0].value).not.toBe("2");
      expect((await db.query<{active_profile_id:string}>("select active_profile_id from household_devices where id=$1",[device])).rows[0].active_profile_id).toBe(child);
      expect((await db.query<{revoked_at:string|null}>("select revoked_at from child_sessions where id=$1",[original.id])).rows[0].revoked_at).toBeNull();
    });
    it("retirement trigger function remains invoker/service-only and table lock precedes barrier/revocation", async () => {
      const def=(await db.query<{definer:boolean;anon:boolean;authenticated:boolean;service:boolean}>("select prosecdef definer,has_function_privilege('anon',oid,'execute') anon,has_function_privilege('authenticated',oid,'execute') authenticated,has_function_privilege('service_role',oid,'execute') service from pg_proc where oid='wn_require_device_handoff_admission()'::regprocedure")).rows[0];
      expect(def).toEqual({definer:false,anon:false,authenticated:false,service:true});
      const source=retirement();
      expect(source.indexOf("lock table public.child_sessions")).toBeLessThan(source.indexOf("create or replace function"));
      expect(source.indexOf("create trigger child_sessions_require_device_handoff_admission")).toBeLessThan(source.indexOf("update public.child_sessions set revoked_at"));
      // Actual multi-connection pre-lock/queued-insert overlap is not represented
      // by this single-connection PGlite source/order check.
    });
  });
});
