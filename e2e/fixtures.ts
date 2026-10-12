import type { Page } from "@playwright/test";
export const profiles = ["Miri", "Ari", "Benny", "Eli"].map(
  (display_name, i) => ({
    id: `00000000-0000-4000-8000-00000000000${i + 1}`,
    display_name,
    avatar_key: ["bird", "fox", "bear", "rocket"][i],
    color_key: ["mint", "yellow", "blue", "coral"][i],
    experience_mode: "standard",
    pin_enabled: i < 2,
    photo_url: null,
    available_from_minute: null,
    available_until_minute: null,
  }),
);
export const videos = [
  ["Build a paper rocket", "Little Makers", "crafts"],
  ["A gentle piano lesson", "Music Room", "music"],
  ["Draw a friendly fox", "Little Makers", "drawing"],
].map(([title, channel_title, tag], i) => ({
  id: `10000000-0000-4000-8000-00000000000${i + 1}`,
  youtube_video_id: ["abcdefghijk", "lmnopqrstuv", "zyxwvutsrqp"][i],
  title,
  channel_title,
  thumbnail_url: "",
  duration_seconds: 180 + i * 60,
  tags: [tag],
  made_for_kids: i === 0 ? false : true,
  profile_ids: [profiles[1].id],
  added_at: new Date().toISOString(),
  progress:
    i === 0
      ? {
          current_time_seconds: 40,
          duration_seconds: 180,
          completed_at: null,
          updated_at: new Date().toISOString(),
        }
      : undefined,
}));
export const collections = [
  {
    id: "20000000-0000-4000-8000-000000000001",
    title: "Little Makers",
    description: "Make and discover",
    video_ids: [videos[0].id, videos[2].id],
  },
];
export const dashboard = {
  profiles,
  videos,
  collections,
  requests: [
    {
      id: "30000000-0000-4000-8000-000000000001",
      profile_id: profiles[1].id,
      display_name: "Ari",
      kind: "topic",
      message: "Lego trains",
      status: "pending",
      created_at: new Date().toISOString(),
    },
  ],
  familyCode: "synthetic-household-code",
  workflow: {
    approvedVideos: 3,
    activeChildren: 4,
    assignedVideos: 3,
    unassignedVideos: 0,
    openRequests: 1,
    byChild: profiles.map((p) => ({
      profile_id: p.id,
      assignedVideos: p.display_name === "Ari" ? 3 : 0,
      openRequests: p.display_name === "Ari" ? 1 : 0,
    })),
    source:
      "WatchNest approval, assignment and request activity. Not YouTube watch or engagement metrics.",
  },
  analytics: {
    todaySeconds: 240,
    weekSeconds: 1200,
    byChild: profiles.map((p) => ({
      profile_id: p.id,
      display_name: p.display_name,
      todaySeconds: p.display_name === "Ari" ? 240 : 0,
      weekSeconds: p.display_name === "Ari" ? 1200 : 0,
      recent: p.display_name === "Ari" ? [videos[0]] : [],
    })),
    popular: [{ title: videos[0].title, seconds: 1200 }],
    daily: Array.from({ length: 7 }, (_, i) => ({
      date: `2026-09-${24 + i}`,
      seconds: i * 60,
    })),
    neverWatched: 2,
  },
  attention: [],
};
/** Browser-only synthetic API fixture. This tests rendered UI, never production persistence/auth. */
export async function fixture(
  page: Page,
  role: "parent" | "child",
  mode = "standard",
) {
  const mutations: { path: string; body: any }[] = [];
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    const path = url.pathname;
    const method = route.request().method();
    const body = route.request().postDataJSON();
    if (method !== "GET") mutations.push({ path, body });
    let response: any = { ok: true };
    if (path === "/api/session")
      response = {
        role,
        configured: true,
        profile: { ...profiles[1], experience_mode: mode },
        parent: { email: "synthetic@example.test", parent_pin_set: true },
      };
    else if (path === "/api/auth/device")
      response = { profiles, parent_pin_set: true };
    else if (path === "/api/parent/dashboard") response = dashboard;
    else if (path === "/api/auth/children") response = { profiles };
    else if (path === "/api/auth/child") response = { profile: profiles[1] };
    else if (path === "/api/child/library")
      response = {
        profile: { ...profiles[1], experience_mode: mode },
        videos,
        collections,
      };
    else if (path === "/api/child/player")
      response = {
        profile: profiles[1],
        video: videos[0],
        next: videos[1],
        safe_playback_enabled: true,
      };
    else if (path === "/api/parent/settings")
      response = {
        parent_pin_set: true,
        timezone: "America/New_York",
        safe_playback_enabled: true,
      };
    else if (
      path === "/api/parent/videos/search" ||
      path === "/api/parent/videos/lookup"
    )
      response = { videos, errors: [] };
    else if (path === "/api/parent/collections")
      response = { collections, ok: true };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify(response),
    });
  });
  return mutations;
}
