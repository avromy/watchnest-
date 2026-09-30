import { describe, it, expect } from "vitest";
import {
  digest,
  opaque,
  hashPin,
  verifyPin,
  sameOrigin,
  credibleProgress,
  childVideoView,
  metadataFresh,
} from "./product-security";
describe("child security primitives", () => {
  it("salts each passcode and verifies constant-time fixed length digests", () => {
    const first = hashPin("123456");
    expect(first).not.toBe(hashPin("123456"));
    expect(verifyPin("123456", first)).toBe(true);
    expect(verifyPin("654321", first)).toBe(false);
    expect(verifyPin("123456", "garbage")).toBe(false);
  });
  it("creates high entropy sessions and stores irreversible digests", () => {
    const a = opaque();
    expect(a).toHaveLength(43);
    expect(a).not.toEqual(opaque());
    expect(digest(a)).not.toContain(a);
    expect(digest(a)).toHaveLength(64);
  });
  it("rejects CSRF with missing or cross-site origins", () => {
    expect(
      sameOrigin(
        new Request("https://watchnest.test/api", {
          headers: { origin: "https://evil.test" },
        }),
      ),
    ).toBe(false);
    expect(sameOrigin(new Request("https://watchnest.test/api"))).toBe(false);
    expect(
      sameOrigin(
        new Request("https://watchnest.test/api", {
          headers: { origin: "https://watchnest.test" },
        }),
      ),
    ).toBe(true);
  });
  it("clamps analytics to elapsed time and bounds playback progress", () => {
    expect(credibleProgress(200, 100, 60, 5)).toEqual({
      current: 100,
      watched: 5,
    });
    expect(credibleProgress(-10, 100, -5, 1)).toEqual({
      current: 0,
      watched: 0,
    });
  });
});

describe("child metadata and tracking projection", () => {
  it("omits all historical progress when made-for-kids is true or unknown", () => {
    const base = {
      id: "video",
      metadata_last_checked_at: new Date().toISOString(),
      progress: {
        id: "row",
        profile_id: "sibling",
        current_time_seconds: 12,
        duration_seconds: 30,
        completed_at: null,
        updated_at: "today",
      },
    };
    for (const made_for_kids of [true, null, undefined])
      expect(childVideoView({ ...base, made_for_kids })).not.toHaveProperty(
        "progress",
      );
  });
  it("returns only progress presentation fields for tracking eligible content", () => {
    const view = childVideoView({
      metadata_last_checked_at: new Date().toISOString(),
      made_for_kids: false,
      progress: {
        id: "secret",
        profile_id: "sibling",
        video_id: "video",
        current_time_seconds: 12,
        duration_seconds: 30,
        completed_at: null,
        updated_at: "today",
      },
    });
    expect(view.progress).toEqual({
      current_time_seconds: 12,
      duration_seconds: 30,
      completed_at: null,
      updated_at: "today",
    });
    expect(JSON.stringify(view)).not.toContain("sibling");
  });
  it("does not serve cached title or image past 30 days and treats missing checks as stale", () => {
    const view = childVideoView({
      title: "Expired metadata",
      thumbnail_url: "https://expired.test/image",
      metadata_last_checked_at: new Date(
        Date.now() - 31 * 86400000,
      ).toISOString(),
      made_for_kids: false,
      progress: { current_time_seconds: 12 },
    });
    expect(view.title).not.toBe("Expired metadata");
    expect(view.thumbnail_url).toBe("");
    expect(view).not.toHaveProperty("progress");
    expect(metadataFresh({})).toBe(false);
  });
});
