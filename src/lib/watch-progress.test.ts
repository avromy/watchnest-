import { describe, expect, it } from "vitest";
import {
  isContinueWatchingEligible,
  orderContinueWatchingVideos,
} from "./watch-progress";
const now = Date.parse("2026-10-01T00:00:00Z");
const raw = {
  currentTimeSeconds: 590,
  rawResume: true,
  updatedAt: new Date(now).toISOString(),
};
describe("functional raw bookmarks", () => {
  it("retains a raw position near the end without deriving percent watched or completion", () => {
    expect(isContinueWatchingEligible(raw, now)).toBe(true);
  });
  it("rejects zero, legacy, invalid, future and exact 29-day-old bookmarks", () => {
    for (const p of [
      null,
      { ...raw, currentTimeSeconds: 0 },
      { ...raw, currentTimeSeconds: NaN },
      { ...raw, rawResume: false },
      { ...raw, updatedAt: "invalid" },
      { ...raw, updatedAt: new Date(now + 1).toISOString() },
      { ...raw, updatedAt: new Date(now - 29 * 86400000).toISOString() },
    ])
      expect(isContinueWatchingEligible(p, now)).toBe(false);
  });
  it("keeps resume order by raw bookmark update and excludes expired rows", () => {
    expect(
      orderContinueWatchingVideos(
        [
          {
            id: "older",
            progress: { ...raw, updatedAt: new Date(now - 1000).toISOString() },
          },
          { id: "recent", progress: raw },
          {
            id: "expired",
            progress: {
              ...raw,
              updatedAt: new Date(now - 30 * 86400000).toISOString(),
            },
          },
        ],
        now,
      ).map((v) => v.id),
    ).toEqual(["recent", "older"]);
  });
});
