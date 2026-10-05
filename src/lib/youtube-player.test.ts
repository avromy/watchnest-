import { describe, expect, it } from "vitest";
import {
  classifyYouTubePlayerError,
  youtubeEmbedUrl,
  youtubePlayerVars,
} from "./youtube-player";

describe("YouTube player helpers", () => {
  it.each([
    [2, "invalid-video"],
    [5, "player-service"],
    [100, "video-unavailable"],
    [101, "embedding-disabled"],
    [150, "embedding-disabled"],
    [153, "client-identity"],
    [999, "unknown"],
  ])("classifies player error %i", (code, kind) => {
    expect(classifyYouTubePlayerError(code)).toMatchObject({ code, kind });
  });

  it("builds a privacy-enhanced embed with explicit client identity", () => {
    const url = new URL(
      youtubeEmbedUrl("JZW3fNvqGIA", "https://watchnest.example", {
        enableJsApi: true,
        startSeconds: 12.9,
      }),
    );
    expect(url.origin).toBe("https://www.youtube-nocookie.com");
    expect(url.pathname).toBe("/embed/JZW3fNvqGIA");
    expect(url.searchParams.get("origin")).toBe("https://watchnest.example");
    expect(url.searchParams.get("enablejsapi")).toBe("1");
    expect(url.searchParams.get("start")).toBe("12");
    expect(url.searchParams.get("controls")).toBe("1");
    expect(url.searchParams.get("iv_load_policy")).toBe("3");
    expect(url.searchParams.get("playsinline")).toBe("1");
    expect(url.searchParams.get("rel")).toBe("0");
    expect(url.searchParams.get("fs")).toBeNull();
    expect(url.searchParams.get("disablekb")).toBeNull();
    expect(url.searchParams.get("modestbranding")).toBeNull();
    expect(url.searchParams.get("showinfo")).toBeNull();
  });

  it("uses the same supported minimal chrome settings for the IFrame API", () => {
    expect(
      youtubePlayerVars("https://watchnest.example", { startSeconds: 8.8 }),
    ).toEqual({
      controls: "1",
      iv_load_policy: "3",
      playsinline: "1",
      rel: "0",
      origin: "https://watchnest.example",
      start: "8",
    });
  });
});
