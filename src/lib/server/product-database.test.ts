import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { beforeAll, afterAll, describe, it, expect } from "vitest";
let db: PGlite;
const a = "11111111-1111-4111-8111-111111111111",
  b = "22222222-2222-4222-8222-222222222222",
  ari = "33333333-3333-4333-8333-333333333333",
  benny = "44444444-4444-4444-8444-444444444444",
  foreign = "55555555-5555-4555-8555-555555555555",
  video = "66666666-6666-4666-8666-666666666666",
  session = "77777777-7777-4777-8777-777777777777";
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
    `insert into parents(id,email) values('${a}','a@test.local'),('${b}','b@test.local');insert into profiles(id,parent_id,display_name) values('${ari}','${a}','Ari'),('${benny}','${a}','Benny'),('${foreign}','${b}','Other');insert into videos(id,youtube_video_id,title,duration_seconds,embeddable_status,made_for_kids) values('${video}','abcdefghijk','Video',100,'embeddable',false);insert into child_sessions(id,profile_id,token_hash,created_at,expires_at) values('${session}','${ari}','hash',now()-interval '1 minute',now()+interval '1 hour');`,
  );
}, 20000);
afterAll(async () => {
  await db.close();
});
describe("real PostgreSQL household integrity", () => {
  it("service-only distributed rate limit increments atomically", async () => {
    const r = await db.query<{ allowed: boolean }>(
      "select wn_rate_limit('key',2,900) as allowed from generate_series(1,3)",
    );
    expect(r.rows.map((x) => x.allowed)).toEqual([true, true, false]);
  });
  it("prevents cross-family profile approval and direct writes", async () => {
    await expect(
      db.exec(
        `select wn_approve_videos('${a}',array['${video}']::uuid[],array['${foreign}']::uuid[],'{}',null)`,
      ),
    ).rejects.toThrow("Invalid profiles");
    await expect(
      db.exec(
        `insert into profile_video_assignments(parent_id,profile_id,video_id,approved_by_parent_id) values('${a}','${foreign}','${video}','${a}')`,
      ),
    ).rejects.toThrow();
  });
  it("deduplicates approved assignments", async () => {
    for (let n = 0; n < 2; n++)
      await db.exec(
        `select wn_approve_videos('${a}',array['${video}']::uuid[],array['${ari}']::uuid[],'{}',null)`,
      );
    const result = await db.query<{ count: number }>(
      `select count(*)::integer as count from profile_video_assignments where profile_id='${ari}' and removed_at is null`,
    );
    expect(result.rows[0].count).toBe(1);
  });
  it("records bounded progress only for session child and preserves sibling isolation", async () => {
    await db.exec(
      `select wn_record_progress('${session}','${video}',40,60,false)`,
    );
    const progress = await db.query<{
      profile_id: string;
      current_time_seconds: number;
    }>(`select profile_id,current_time_seconds from watch_progress`);
    expect(progress.rows).toEqual([
      { profile_id: ari, current_time_seconds: 40 },
    ]);
    const ev = await db.query<{ watched_seconds: number }>(
      `select watched_seconds from viewing_events`,
    );
    expect(ev.rows[0].watched_seconds).toBeLessThanOrEqual(60);
  });
  it("turns off made-for-kids tracking", async () => {
    await db.exec(
      `update videos set made_for_kids=true where id='${video}';select wn_record_progress('${session}','${video}',80,60,false)`,
    );
    const result = await db.query<{ current_time_seconds: number }>(
      "select current_time_seconds from watch_progress",
    );
    expect(result.rows[0].current_time_seconds).toBe(40);
    await db.exec(`update videos set made_for_kids=false where id='${video}'`);
  });
  it("revocation immediately denies writes even with a valid session", async () => {
    await db.exec(
      `select wn_assign_video('${a}','${video}',array['${benny}']::uuid[],null)`,
    );
    await expect(
      db.exec(`select wn_record_progress('${session}','${video}',50,5,false)`),
    ).rejects.toThrow("Not assigned");
  });
  it("RLS and grants deny authenticated and anon secrets, data and RPC", async () => {
    for (const role of ["anon", "authenticated"]) {
      await db.exec(`set role ${role}`);
      await expect(
        db.query("select token_hash from child_sessions"),
      ).rejects.toThrow("permission denied");
      await expect(db.query("select * from profiles")).rejects.toThrow(
        "permission denied",
      );
      await expect(
        db.query("select wn_rate_limit('stolen',2,900)"),
      ).rejects.toThrow("permission denied");
      await db.exec("reset role");
    }
  });
  it("removing video removes collection references and active assignments", async () => {
    await db.exec(
      `insert into collections(parent_id,title,video_ids) values('${a}','Show',array['${video}']::uuid[]);select wn_remove_video('${a}','${video}')`,
    );
    expect(
      (
        await db.query<{ video_ids: string[] }>(
          "select video_ids from collections",
        )
      ).rows[0].video_ids,
    ).toEqual([]);
    expect(
      (
        await db.query<{ count: number }>(
          "select count(*)::integer as count from profile_video_assignments where removed_at is null",
        )
      ).rows[0].count,
    ).toBe(0);
  });
});
