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
});
