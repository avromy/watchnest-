import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
let db: PGlite;
const parent = "20000000-0000-4000-8000-000000000001";
const profile = "20000000-0000-4000-8000-000000000002";
const videos = [3, 4, 5, 6, 7].map(
  (n) => `20000000-0000-4000-8000-${String(n).padStart(12, "0")}`,
);
const vector = `array[${videos.map((id) => `'${id}'`).join(",")}]::uuid[]`;
beforeAll(async () => {
  db = new PGlite();
  await db.exec(
    "create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key);",
  );
  for (const migration of [
    "202607060001_initial_schema.sql",
    "20260930192030_secure_family_product.sql",
    "20260930235307_progress_metadata_freshness.sql",
    "20260930235928_metadata_retention_maintenance.sql",
  ]) {
    await db.exec(
      readFileSync(`supabase/migrations/${migration}`, "utf8")
        .replace("create extension if not exists pgcrypto;", "")
        .replace(
          "encode(gen_random_bytes(12),'hex')",
          "replace(gen_random_uuid()::text,'-','')",
        ),
    );
  }
  await db.exec(
    `insert into parents(id,email) values('${parent}','maintenance@example.invalid'); insert into profiles(id,parent_id,display_name) values('${profile}','${parent}','Synthetic');`,
  );
  // Keep exact 29-day boundary and maintenance in one transaction (stable now()).
  await db.exec("begin");
  const ages = [
    "now()-interval '29 days'",
    "null",
    "now()+interval '1 hour'",
    "now()-interval '1 hour'",
    "now()-interval '28 days'",
  ];
  for (let n = 0; n < videos.length; n++)
    await db.exec(
      `insert into videos(id,youtube_video_id,title,channel_id,channel_title,thumbnail_url,duration_seconds,made_for_kids,availability_status,embeddable_status,metadata_last_checked_at) values('${videos[n]}','video00000${n}','API title','channel','API channel','https://i.ytimg.com/synthetic',100,false,'available','embeddable',${ages[n]});`,
    );
  await db.exec(
    `select wn_approve_videos('${parent}',${vector},array['${profile}']::uuid[],array['parent-owned-tag'],null); insert into collections(parent_id,title,video_ids) values('${parent}','Parent-owned collection',${vector}); insert into child_requests(parent_id,profile_id,kind,message) values('${parent}','${profile}','topic','Parent-owned request'); insert into youtube_search_cache(cache_key,normalized_query,raw_query,result_json,expires_at) values('expired','old','old','{"api":"expired"}',now()-interval '1 hour'),('fresh','new','new','{"api":"fresh"}',now()+interval '1 hour'); insert into login_limits(key,window_started) values('old',now()-interval '3 days'),('fresh',now()); insert into child_sessions(profile_id,token_hash,expires_at,revoked_at) values('${profile}','expired-old',now()-interval '2 days',null),('${profile}','revoked-old',now()+interval '1 day',now()-interval '2 days'),('${profile}','expired-recent',now()-interval '12 hours',null),('${profile}','revoked-recent',now()+interval '1 day',now()-interval '12 hours'),('${profile}','fresh',now()+interval '1 day',null); set role service_role; select wn_metadata_maintenance(); reset role; commit;`,
  );
}, 20000);
afterAll(async () => {
  await db.close();
});
describe("independent retention maintenance: all four migrations, actual PostgreSQL", () => {
  it("purges exact-29-day, null and future API payloads without deleting video IDs", async () => {
    const rows = (await db.query<any>("select * from videos order by id")).rows;
    expect(rows.map((r) => r.id)).toEqual(videos);
    expect(rows.map((r) => r.youtube_video_id)).toEqual(
      videos.map((_, n) => `video00000${n}`),
    );
    for (const row of rows.slice(0, 3))
      expect(row).toMatchObject({
        title: "Video needs refresh",
        channel_id: null,
        channel_title: null,
        thumbnail_url: null,
        duration_seconds: null,
        made_for_kids: null,
        availability_status: "needs_review",
        embeddable_status: "unknown",
        metadata_last_checked_at: null,
      });
  });
  it("preserves API payloads newer than 29 days including 28-day metadata", async () => {
    for (const row of (
      await db.query<any>("select * from videos order by id")
    ).rows.slice(3)) {
      expect(row).toMatchObject({
        title: "API title",
        channel_id: "channel",
        channel_title: "API channel",
        thumbnail_url: "https://i.ytimg.com/synthetic",
        duration_seconds: 100,
        made_for_kids: false,
        availability_status: "available",
        embeddable_status: "embeddable",
      });
      expect(row.metadata_last_checked_at).not.toBeNull();
    }
    expect(
      (
        await db.query<any>(
          "select cache_key,result_json from youtube_search_cache",
        )
      ).rows,
    ).toEqual([{ cache_key: "fresh", result_json: { api: "fresh" } }]);
  });
  it("preserves approval IDs, tags, collections, assignments and requests", async () => {
    const approvals = (
      await db.query<any>(
        "select video_id,tags from family_videos order by video_id",
      )
    ).rows;
    expect(approvals).toEqual(
      videos.map((video_id) => ({ video_id, tags: ["parent-owned-tag"] })),
    );
    expect(
      (await db.query<any>("select video_ids,title from collections")).rows,
    ).toEqual([{ video_ids: videos, title: "Parent-owned collection" }]);
    const assignments = (
      await db.query<any>(
        "select video_id,profile_id,parent_id,removed_at from profile_video_assignments order by video_id",
      )
    ).rows;
    expect(assignments).toEqual(
      videos.map((video_id) => ({
        video_id,
        profile_id: profile,
        parent_id: parent,
        removed_at: null,
      })),
    );
    expect(
      (await db.query<any>("select message,status from child_requests")).rows,
    ).toEqual([{ message: "Parent-owned request", status: "pending" }]);
  });
  it("cleans only eligible expired cache/session/rate-limit rows", async () => {
    expect(
      (
        await db.query<{ key: string }>(
          "select key from login_limits order by key",
        )
      ).rows,
    ).toEqual([{ key: "fresh" }]);
    expect(
      (
        await db.query<{ token_hash: string }>(
          "select token_hash from child_sessions order by token_hash",
        )
      ).rows,
    ).toEqual([
      { token_hash: "expired-recent" },
      { token_hash: "fresh" },
      { token_hash: "revoked-recent" },
    ]);
  });
  for (const role of ["anon", "authenticated"]) {
    it(`${role} cannot invoke the sixth privileged RPC`, async () => {
      await db.exec(`set role ${role}`);
      try {
        await expect(
          db.query("select wn_metadata_maintenance() "),
        ).rejects.toThrow("permission denied");
      } finally {
        await db.exec("reset role");
      }
    });
  }
  it("repeated service-role maintenance is idempotent for approval records", async () => {
    await db.exec(
      "set role service_role; select wn_metadata_maintenance(); reset role;",
    );
    expect(
      (
        await db.query<any>(
          "select video_id,tags from family_videos order by video_id",
        )
      ).rows,
    ).toEqual(
      videos.map((video_id) => ({ video_id, tags: ["parent-owned-tag"] })),
    );
    expect(
      (await db.query<any>("select video_ids from collections")).rows[0]
        .video_ids,
    ).toEqual(videos);
  });
});
