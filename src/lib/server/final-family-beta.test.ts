import { PGlite } from "@electric-sql/pglite";
import { readFileSync } from "node:fs";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

let database: PGlite;

describe("final family beta boundaries", () => {
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
      readFileSync(
        "supabase/migrations/20260930192030_secure_family_product.sql",
        "utf8",
      ).replace(
        "encode(gen_random_bytes(12),'hex')",
        "replace(gen_random_uuid()::text,'-','')",
      ),
    );
    await database.exec(
      readFileSync(
        "supabase/migrations/20261005000000_final_family_beta.sql",
        "utf8",
      ),
    );
  }, 20_000);

  afterAll(async () => database.close());

  it("defaults every household to Safe Playback", async () => {
    await database.exec(
      "insert into parents(id,email) values('10000000-0000-4000-8000-000000000001','family@example.invalid');",
    );
    const result = await database.query<{ safe_playback_enabled: boolean }>(
      "select safe_playback_enabled from parents limit 1",
    );
    expect(result.rows[0].safe_playback_enabled).toBe(true);
  });

  for (const role of ["anon", "authenticated"]) {
    it(`keeps hidden-video state private from ${role}`, async () => {
      try {
        await database.exec(`set role ${role}`);
        await expect(
          database.query("select * from profile_hidden_videos"),
        ).rejects.toThrow("permission denied");
      } finally {
        await database.exec("reset role");
      }
    });
  }

  it("applies containment before direct embeds load", () => {
    const embed = readFileSync("src/components/YouTubeEmbed.tsx", "utf8");
    const player = readFileSync("src/components/child/ChildPlayer.tsx", "utf8");
    expect(embed).toContain(
      '"allow-scripts allow-same-origin allow-presentation"',
    );
    expect(embed).not.toContain("allow-popups");
    expect(embed).not.toContain("allow-top-navigation");
    expect(player).toContain('host.setAttribute("sandbox", SAFE_PLAYER_SANDBOX)');
  });
});
