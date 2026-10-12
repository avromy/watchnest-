import { describe, expect, it } from "vitest";
import { normalizeYouTubeThumbnailUrl } from "./youtube-thumbnail";

describe("normalizeYouTubeThumbnailUrl", () => {
  it("uses YouTube's equivalent image host for API thumbnail URLs", () => {
    expect(
      normalizeYouTubeThumbnailUrl(
        "https://i.ytimg.com/vi/JZW3fNvqGIA/hqdefault.jpg",
      ),
    ).toBe("https://img.youtube.com/vi/JZW3fNvqGIA/hqdefault.jpg");
  });

  it("preserves other valid URLs and rejects malformed values", () => {
    expect(
      normalizeYouTubeThumbnailUrl("https://example.test/thumbnail.jpg"),
    ).toBe("https://example.test/thumbnail.jpg");
    expect(normalizeYouTubeThumbnailUrl("not a url")).toBeNull();
    expect(normalizeYouTubeThumbnailUrl(null)).toBeNull();
  });
});
