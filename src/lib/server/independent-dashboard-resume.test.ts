import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  audience: false as boolean | null,
  checked: "fresh",
  availability: "available",
  embedding: "embeddable",
  approved: true,
  queries: [] as { table: string; method: string; args: any[] }[],
}));
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({ cookies: async () => ({ get: (name: string) => name === "wn_parent" ? { value: "synthetic" } : undefined, set: vi.fn() }) }));
vi.mock("@supabase/supabase-js", () => ({ createClient: () => ({
  auth: { getUser: async () => ({ data: { user: { id: "verified-owner", email: "Avromy@gmail.com", email_confirmed_at: "2026-09-30" } }, error: null }) },
  rpc: async () => ({ data: true, error: null }),
  from: (table: string) => {
    const now = Date.now();
    const data = table === "parents" ? { id: "verified-family", email: "Avromy@gmail.com" }
      : table === "profiles" ? [{ id: "verified-child", display_name: "Synthetic" }]
      : table === "family_videos" ? state.approved ? [{ video_id: "approved", tags: [], videos: { id: "approved", title: "Synthetic", made_for_kids: state.audience, metadata_last_checked_at: state.checked === "null" ? null : new Date(now + (state.checked === "stale" ? -2 : state.checked === "future" ? 2 : 0) * 86400000).toISOString(), availability_status: state.availability, embeddable_status: state.embedding } }] : []
      : table === "profile_video_assignments" ? [{ video_id: "approved", profile_id: "verified-child" }]
      : table === "viewing_events" ? [{ video_id: "approved", profile_id: "verified-child", watched_seconds: 30, created_at: new Date(now).toISOString() }]
      : table === "child_requests" ? [{ profile_id: "verified-child", status: "pending" }]
      : [];
    const chain: any = { then: (resolve: any) => Promise.resolve({ data, error: null }).then(resolve) };
    for (const method of ["select", "eq", "is", "gt", "in", "single", "maybeSingle", "update", "delete", "lt", "gte", "order"]) chain[method] = (...args: any[]) => { state.queries.push({ table, method, args }); return chain; };
    return chain;
  },
}) }));
import { handle } from "./product";
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://synthetic.supabase.co"); vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "synthetic"); vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "synthetic");
  state.audience = false; state.checked = "fresh"; state.availability = "available"; state.embedding = "embeddable"; state.approved = true; state.queries = [];
});
afterEach(() => vi.unstubAllEnvs());
async function dashboard() {
  const response = await handle(new Request("https://watchnest.test/api/parent/dashboard?parentId=attacker-household"), ["parent", "dashboard"]);
  expect(response.status).toBe(200);
  return response.json();
}
describe("independent dashboard suppression/ownership (mocked DB, actual handler)", () => {
  for (const invalid of ["mfk", "unknown-audience", "null-metadata", "stale", "future", "unavailable", "not-embeddable", "unknown-embedding", "unapproved"]) {
    it(`suppresses all historical analytics for ${invalid}`, async () => {
      if (invalid === "mfk") state.audience = true;
      if (invalid === "unknown-audience") state.audience = null;
      if (invalid === "null-metadata") state.checked = "null";
      if (invalid === "stale" || invalid === "future") state.checked = invalid;
      if (invalid === "unavailable") state.availability = "unavailable";
      if (invalid === "not-embeddable") state.embedding = "not_embeddable";
      if (invalid === "unknown-embedding") state.embedding = "unknown";
      if (invalid === "unapproved") state.approved = false;
      const result = await dashboard();
      expect(result.analytics).toMatchObject({ todaySeconds: 0, weekSeconds: 0, neverWatched: 0, popular: [] });
      expect(result.analytics.byChild[0]).toMatchObject({ todaySeconds: 0, weekSeconds: 0, recent: [] });
      expect(result.analytics.daily.every((day: any) => day.seconds === 0)).toBe(true);
      expect(result.workflow.openRequests).toBe(1);
      expect(result.workflow.approvedVideos).toBe(invalid === "unapproved" ? 0 : 1);
    });
  }
  it("derives all dashboard household queries from verified ownership, not URL claims", async () => {
    const result = await dashboard();
    expect(result.analytics.weekSeconds).toBe(30);
    expect(state.queries).toContainEqual({ table: "parents", method: "eq", args: ["auth_user_id", "verified-owner"] });
    for (const table of ["profiles", "family_videos", "profile_video_assignments", "viewing_events", "child_requests", "collections"]) expect(state.queries).toContainEqual({ table, method: "eq", args: ["parent_id", "verified-family"] });
    expect(state.queries).toContainEqual({ table: "watch_progress", method: "in", args: ["profile_id", ["verified-child"]] });
    expect(JSON.stringify(state.queries)).not.toContain("attacker-household");
    expect(result.workflow).toMatchObject({ approvedVideos: 1, assignedVideos: 1, openRequests: 1 });
  });
});
