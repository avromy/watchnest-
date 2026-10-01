import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const parent = "10000000-0000-4000-8000-000000000001";
const profile = "10000000-0000-4000-8000-000000000002";
const video = "10000000-0000-4000-8000-000000000003";
const session = "10000000-0000-4000-8000-000000000004";
let db: PGlite;
beforeAll(async () => {
  db = new PGlite();
  await db.exec(
    "create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key);",
  );
  await db.exec(
    readFileSync(
      "supabase/migrations/202607060001_initial_schema.sql",
      "utf8",
    ).replace("create extension if not exists pgcrypto;", ""),
  );
  await db.exec(
    readFileSync(
      "supabase/migrations/20260930192030_secure_family_product.sql",
      "utf8",
    ).replace(
      "encode(gen_random_bytes(12),'hex')",
      "replace(gen_random_uuid()::text,'-','')",
    ),
  );
  await db.exec(
    readFileSync(
      "supabase/migrations/20260930235307_progress_metadata_freshness.sql",
      "utf8",
    ),
  );
  for (const migration of [
    "20260930235928_metadata_retention_maintenance.sql",
    "20261001030558_hosted_security_indexes.sql",
  ]) {
    await db.exec(readFileSync(`supabase/migrations/${migration}`, "utf8"));
  }
  await db.exec(
    readFileSync(
      "supabase/migrations/20261001053047_raw_resume_only.sql",
      "utf8",
    ),
  );
  await db.exec(
    `insert into parents(id,email) values('${parent}','security@example.invalid'); insert into profiles(id,parent_id,display_name) values('${profile}','${parent}','Synthetic'); insert into videos(id,youtube_video_id,title,duration_seconds,availability_status,embeddable_status,made_for_kids,metadata_last_checked_at) values('${video}','abcdefghijk','Synthetic',100,'available','embeddable',false,now()); insert into child_sessions(id,profile_id,token_hash,created_at,expires_at) values('${session}','${profile}','synthetic',now()-interval '2 minutes',now()+interval '1 hour'); select wn_approve_videos('${parent}',array['${video}']::uuid[],array['${profile}']::uuid[],'{}',null);`,
  );
}, 20000);
afterAll(async () => {
  await db.close();
});
const record = () =>
  db.exec(`select wn_record_progress('${session}','${video}',90,0,false)`);
async function reset() {
  await db.exec(
    `reset role; delete from watch_progress; delete from viewing_events; update profiles set archived_at=null; update child_sessions set revoked_at=null,expires_at=now()+interval '1 hour',last_progress_at=null,created_at=now()-interval '2 minutes'; update videos set made_for_kids=false,metadata_last_checked_at=now(),availability_status='available',embeddable_status='embeddable';`,
  );
}
async function count(table: string) {
  return (
    await db.query<{ n: number }>(`select count(*)::integer n from ${table}`)
  ).rows[0].n;
}
describe("independent security resume: actual PostgreSQL boundaries", () => {
  for (const role of ["anon", "authenticated"]) {
    it(`${role} cannot read or mutate any product table or invoke any privileged RPC`, async () => {
      const tables = [
        "parents",
        "profiles",
        "videos",
        "profile_video_assignments",
        "watch_progress",
        "youtube_search_cache",
        "youtube_search_logs",
        "audit_events",
        "family_videos",
        "child_sessions",
        "collections",
        "child_requests",
        "viewing_events",
        "login_limits",
      ];
      const calls = [
        "wn_rate_limit('independent',1,1)",
        `wn_approve_videos('${parent}','{}','{}','{}',null)`,
        `wn_assign_video('${parent}','${video}','{}',null)`,
        `wn_remove_video('${parent}','${video}')`,
        `wn_record_progress('${session}','${video}',90,0,false)`,
      ];
      try {
        await db.exec(`set role ${role}`);
        for (const table of tables) {
          await expect(db.query(`select * from ${table}`)).rejects.toThrow(
            "permission denied",
          );
          await expect(db.exec(`delete from ${table}`)).rejects.toThrow(
            "permission denied",
          );
        }
        for (const call of calls)
          await expect(db.query(`select ${call}`)).rejects.toThrow(
            "permission denied",
          );
      } finally {
        await db.exec("reset role");
      }
    });
  }
  for (const audience of ["true", "null"]) {
    it(`MFK ${audience} creates neither progress nor viewing event`, async () => {
      await reset();
      await db.exec(`update videos set made_for_kids=${audience}`);
      await record();
      expect(await count("watch_progress")).toBe(0);
      expect(await count("viewing_events")).toBe(0);
    });
  }
  for (const invalidation of ["revoked", "expired", "archived"]) {
    it(`${invalidation} child cannot record`, async () => {
      await reset();
      if (invalidation === "archived")
        await db.exec("update profiles set archived_at=now()");
      else
        await db.exec(
          `update child_sessions set ${invalidation === "revoked" ? "revoked_at=now()" : "expires_at=now()-interval '1 second'"}`,
        );
      await expect(record()).rejects.toThrow(
        invalidation === "archived" ? "Profile unavailable" : "Session expired",
      );
      expect(await count("watch_progress")).toBe(0);
      expect(await count("viewing_events")).toBe(0);
    });
  }
  for (const checked of [
    "now()-interval '2 days'",
    "null",
    "now()+interval '2 days'",
  ]) {
    it(`DB freshness guard rejects ${checked} even for service-only RPC`, async () => {
      await reset();
      await db.exec(
        `update videos set metadata_last_checked_at=${checked}; set role service_role;`,
      );
      try {
        await record();
      } finally {
        await db.exec("reset role");
      }
      expect(await count("watch_progress")).toBe(0);
      expect(await count("viewing_events")).toBe(0);
    });
  }
  it("rejects the exact one-day boundary within a single transaction", async () => {
    await reset();
    await db.exec(
      `begin; update videos set metadata_last_checked_at=now()-interval '1 day'; select wn_record_progress('${session}','${video}',90,0,false); commit;`,
    );
    expect(await count("watch_progress")).toBe(0);
    expect(await count("viewing_events")).toBe(0);
  });
  it("fresh explicit non-MFK progress still works under service role", async () => {
    await reset();
    await db.exec("set role service_role");
    try {
      await record();
    } finally {
      await db.exec("reset role");
    }
    expect(await count("watch_progress")).toBe(1);
    expect(await count("viewing_events")).toBe(0);
  });
  it("a stale write cannot overwrite saved progress or add an event", async () => {
    await reset();
    await record();
    await db.exec(
      "update videos set metadata_last_checked_at=now()-interval '2 days'",
    );
    await db.exec(
      `select wn_record_progress('${session}','${video}',5,0,false)`,
    );
    expect(
      (
        await db.query<{ current_time_seconds: number }>(
          "select current_time_seconds from watch_progress",
        )
      ).rows[0].current_time_seconds,
    ).toBe(90);
    expect(await count("viewing_events")).toBe(0);
  });
  it("rejects positive or null watched seconds before any bookmark/event write", async () => {
    await reset();
    for (const watched of ["1", "null"])
      await expect(
        db.exec(
          `select wn_record_progress('${session}','${video}',90,${watched},false)`,
        ),
      ).rejects.toThrow("Viewing metrics disabled");
    expect(await count("watch_progress")).toBe(0);
    expect(await count("viewing_events")).toBe(0);
  });
  it("raw position remains exact, seek-to-end does not mark completion; raw ENDED clears resume", async () => {
    await reset();
    await record();
    await db.exec(
      `select wn_record_progress('${session}','${video}',100,0,false)`,
    );
    expect(
      (
        await db.query<any>(
          "select current_time_seconds,duration_seconds,completed_at,raw_resume from watch_progress",
        )
      ).rows,
    ).toEqual([
      {
        current_time_seconds: 100,
        duration_seconds: null,
        completed_at: null,
        raw_resume: true,
      },
    ]);
    await db.exec(
      `select wn_record_progress('${session}','${video}',0,0,true)`,
    );
    expect(await count("watch_progress")).toBe(0);
    expect(await count("viewing_events")).toBe(0);
  });
  it("maintenance purges only expired raw bookmarks while retaining historical records", async () => {
    await reset();
    await record();
    await db.exec(
      "begin; update watch_progress set updated_at=now()-interval '29 days'; select wn_metadata_maintenance(); commit;",
    );
    expect(await count("watch_progress")).toBe(0);
    await record();
    await db.exec(
      "update watch_progress set raw_resume=false,updated_at=now()-interval '40 days'; select wn_metadata_maintenance();",
    );
    expect(await count("watch_progress")).toBe(1);
  });
  it("installed RPC definition locks classification before eligibility and bookmark writes (structural evidence only)", async () => {
    const result = await db.query<{ definition: string }>(
      "select pg_get_functiondef('public.wn_record_progress(uuid,uuid,integer,integer,boolean)'::regprocedure) as definition",
    );
    const definition = result.rows[0].definition;
    const lock = definition.indexOf(
      "select * into v from videos where id=p_video for share",
    );
    expect(lock).toBeGreaterThan(-1);
    expect(lock).toBeLessThan(definition.indexOf("if v.made_for_kids"));
    expect(lock).toBeLessThan(definition.indexOf("insert into watch_progress"));
    // PGlite is one backend; this verifies the installed definition, not a
    // competing-session blocking guarantee. Hosted PostgreSQL review is separate.
  });
});
