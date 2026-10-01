import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
const state = vi.hoisted(() => ({
  now: Date.now(),
  audience: false as boolean | null,
  age: 0,
}));
vi.mock("server-only", () => ({}));
vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) =>
      name === "wn_parent" ? { value: "synthetic" } : undefined,
    set: vi.fn(),
  }),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    auth: {
      getUser: async () => ({
        data: {
          user: {
            id: "owner",
            email: "Avromy@gmail.com",
            email_confirmed_at: "2026-09-30",
          },
        },
        error: null,
      }),
    },
    rpc: async () => ({ data: true, error: null }),
    from: (table: string) => {
      const profile = { id: "ari", parent_id: "family", display_name: "Ari" };
      const video = {
        id: "approved",
        title: "Synthetic",
        made_for_kids: state.audience,
        metadata_last_checked_at: new Date(
          state.now - state.age * 86400000,
        ).toISOString(),
        availability_status: "available",
        embeddable_status: "embeddable",
      };
      const data =
        table === "parents"
          ? { id: "family", auth_user_id: "owner", email: "Avromy@gmail.com" }
          : table === "profiles"
            ? [profile]
            : table === "family_videos"
              ? [
                  {
                    video_id: "approved",
                    created_at: new Date(state.now).toISOString(),
                    tags: [],
                    videos: video,
                  },
                ]
              : table === "profile_video_assignments"
                ? [{ video_id: "approved", profile_id: "ari" }]
                : table === "viewing_events"
                  ? [
                      {
                        video_id: "approved",
                        profile_id: "ari",
                        watched_seconds: 90,
                        created_at: new Date(state.now).toISOString(),
                      },
                      {
                        video_id: "removed-or-foreign",
                        profile_id: "ari",
                        watched_seconds: 200,
                        created_at: new Date(state.now).toISOString(),
                      },
                    ]
                  : table === "child_requests"
                    ? [
                        { id: "request", profile_id: "ari", status: "pending" },
                        { id: "closed", profile_id: "ari", status: "resolved" },
                      ]
                    : [];
      const chain: any = {
        then: (resolve: any) =>
          Promise.resolve({ data, error: null }).then(resolve),
      };
      for (const method of [
        "select",
        "eq",
        "is",
        "lt",
        "in",
        "gte",
        "order",
        "maybeSingle",
        "single",
        "update",
        "delete",
      ])
        chain[method] = () => chain;
      return chain;
    },
  }),
}));
import { handle } from "./product";
beforeEach(() => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://synthetic.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "synthetic");
  vi.stubEnv("SUPABASE_SERVICE_ROLE_KEY", "synthetic");
  state.now = Date.now();
  state.audience = false;
  state.age = 0;
});
afterEach(() => vi.unstubAllEnvs());
const dashboard = async () =>
  (
    await handle(new Request("https://watchnest.test/api/parent/dashboard"), [
      "parent",
      "dashboard",
    ])
  ).json();
describe("dashboard policy boundary: actual handler, mocked database", () => {
  for (const audience of [true, null])
    it(`suppresses prior playback metrics for audience=${audience}`, async () => {
      state.audience = audience;
      const result = await dashboard();
      expect(result.analytics).toMatchObject({
        todaySeconds: 0,
        weekSeconds: 0,
        popular: [],
        neverWatched: 0,
      });
      expect(result.analytics.byChild[0]).toMatchObject({
        todaySeconds: 0,
        weekSeconds: 0,
        recent: [],
      });
      expect(
        result.analytics.daily.every((day: any) => day.seconds === 0),
      ).toBe(true);
      expect(result.workflow).toMatchObject({
        approvedVideos: 1,
        assignedVideos: 1,
        unassignedVideos: 0,
        activeChildren: 1,
        openRequests: 1,
      });
      expect(result.workflow.byChild).toEqual([
        { profile_id: "ari", assignedVideos: 1, openRequests: 1 },
      ]);
    });
  for (const age of [2, -2])
    it(`suppresses historical playback with stale/future metadata age=${age}`, async () => {
      state.age = age;
      const result = await dashboard();
      expect(result.analytics.weekSeconds).toBe(0);
      expect(result.analytics.neverWatched).toBe(0);
      expect(result.workflow.openRequests).toBe(1);
    });
  it("excludes removed/foreign video events and keeps eligible scope distinct from own workflow", async () => {
    const result = await dashboard();
    expect(result.analytics.weekSeconds).toBe(90);
    expect(result.analytics.neverWatched).toBe(1);
    expect(result.workflow.source).toContain("Not YouTube watch");
  });
});
