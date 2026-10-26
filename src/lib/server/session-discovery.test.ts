import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  createDiscoveryCandidateToken,
  discoveryBoundaryAllowed,
  readDiscoveryCandidateToken,
} from "../discovery-security";

let database: PGlite;

describe("session timer and discovery database boundaries", () => {
  beforeAll(async () => {
    database = new PGlite();
    await database.exec(
      "create role anon; create role authenticated; create role service_role bypassrls; create schema auth; create table auth.users(id uuid primary key);",
    );
    await database.exec(
      readFileSync("supabase/migrations/202607060001_initial_schema.sql", "utf8").replace(
        "create extension if not exists pgcrypto;",
        "",
      ),
    );
    await database.exec(
      readFileSync("supabase/migrations/20260930192030_secure_family_product.sql", "utf8").replace(
        "encode(gen_random_bytes(12),'hex')",
        "replace(gen_random_uuid()::text,'-','')",
      ),
    );
    await database.exec(
      readFileSync("supabase/migrations/20261026000100_session_timer_discovery.sql", "utf8"),
    );
  }, 20_000);

  afterAll(async () => database.close());

  it("preserves existing households with timer and Discover off", async () => {
    await database.exec(`
      insert into parents(id,email) values('10000000-0000-4000-8000-000000000001','family@example.invalid');
      insert into profiles(id,parent_id,display_name)
      values('20000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','Miri');
    `);
    const result = await database.query<{
      session_duration_minutes: number | null;
      discover_enabled: boolean;
    }>("select session_duration_minutes,discover_enabled from profiles limit 1");
    expect(result.rows[0]).toEqual({
      session_duration_minutes: null,
      discover_enabled: false,
    });
  });

  it("deduplicates a pending video request per child", async () => {
    const insert = `insert into child_requests(parent_id,profile_id,kind,message,youtube_video_id)
      values('10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','video','Drawing','M7lc1UVf-VE')`;
    await database.exec(insert);
    await expect(database.exec(insert)).rejects.toThrow();
  });

  it("atomically approves and assigns a structured request", async () => {
    await database.exec(`
      insert into videos(id,youtube_video_id,title,availability_status,embeddable_status)
      values('30000000-0000-4000-8000-000000000001','abcdefghijk','Drawing','available','embeddable');
      insert into child_requests(id,parent_id,profile_id,kind,message,youtube_video_id)
      values('40000000-0000-4000-8000-000000000001','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','video','Drawing','abcdefghijk');
      select wn_approve_child_request(
        '10000000-0000-4000-8000-000000000001',
        '40000000-0000-4000-8000-000000000001',
        '30000000-0000-4000-8000-000000000001',
        array['20000000-0000-4000-8000-000000000001']::uuid[],
        null
      );
    `);
    const result = await database.query<{ status: string }>(
      "select status from child_requests where id='40000000-0000-4000-8000-000000000001'",
    );
    expect(result.rows[0].status).toBe("resolved");
    expect(
      (await database.query("select 1 from family_videos")).rows,
    ).toHaveLength(1);
    expect(
      (await database.query("select 1 from profile_video_assignments where removed_at is null")).rows,
    ).toHaveLength(1);
  });

  it("rejects a mismatched approval atomically", async () => {
    await database.exec(`
      insert into videos(id,youtube_video_id,title,availability_status,embeddable_status)
      values('30000000-0000-4000-8000-000000000002','zyxwvutsrqp','Other','available','embeddable');
      insert into child_requests(id,parent_id,profile_id,kind,message,youtube_video_id)
      values('40000000-0000-4000-8000-000000000002','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001','video','Requested','lkjihgfedcb');
    `);
    await expect(
      database.exec(`select wn_approve_child_request(
        '10000000-0000-4000-8000-000000000001',
        '40000000-0000-4000-8000-000000000002',
        '30000000-0000-4000-8000-000000000002',
        array['20000000-0000-4000-8000-000000000001']::uuid[], null
      )`),
    ).rejects.toThrow();
    const request = await database.query<{ status: string }>(
      "select status from child_requests where id='40000000-0000-4000-8000-000000000002'",
    );
    expect(request.rows[0].status).toBe("pending");
    expect(
      (
        await database.query(
          "select 1 from profile_video_assignments where video_id='30000000-0000-4000-8000-000000000002'",
        )
      ).rows,
    ).toHaveLength(0);
  });
});

describe("signed discovery candidates", () => {
  const previousSecret = process.env.SUPABASE_SERVICE_ROLE_KEY;
  beforeAll(() => {
    process.env.SUPABASE_SERVICE_ROLE_KEY = "test-only-discovery-secret";
  });
  afterAll(() => {
    if (previousSecret === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = previousSecret;
  });

  it("binds a candidate to the child profile and rejects tampering", () => {
    const token = createDiscoveryCandidateToken(
      "test-only-discovery-secret",
      "20000000-0000-4000-8000-000000000001",
      "M7lc1UVf-VE",
      "topic",
      "Drawing",
    );
    expect(
      readDiscoveryCandidateToken(
        "test-only-discovery-secret",
        token,
        "20000000-0000-4000-8000-000000000001",
      ),
    ).toMatchObject({ videoId: "M7lc1UVf-VE", boundary: "Drawing" });
    expect(
      readDiscoveryCandidateToken(
        "test-only-discovery-secret",
        token,
        "20000000-0000-4000-8000-000000000099",
      ),
    ).toBeNull();
    expect(
      readDiscoveryCandidateToken(
        "test-only-discovery-secret",
        `${token.slice(0, -1)}x`,
        "20000000-0000-4000-8000-000000000001",
      ),
    ).toBeNull();
  });

  it("rejects candidates whose Parent boundary was disabled or removed", () => {
    const candidate = { boundaryKind: "topic" as const, boundary: "Drawing" };
    expect(
      discoveryBoundaryAllowed(
        { discover_enabled: true, discovery_topics: ["Drawing"] },
        candidate,
      ),
    ).toBe(true);
    expect(
      discoveryBoundaryAllowed(
        { discover_enabled: false, discovery_topics: ["Drawing"] },
        candidate,
      ),
    ).toBe(false);
    expect(
      discoveryBoundaryAllowed(
        { discover_enabled: true, discovery_topics: ["Science"] },
        candidate,
      ),
    ).toBe(false);
  });
});
