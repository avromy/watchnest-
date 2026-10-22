export type YouTubePlayerFailureKind =
  | "invalid-video"
  | "player-service"
  | "video-unavailable"
  | "embedding-disabled"
  | "client-identity"
  | "unknown";

export type YouTubePlayerFailure = {
  kind: YouTubePlayerFailureKind;
  code: number;
  childMessage: string;
  diagnostic: string;
};

export function classifyYouTubePlayerError(code: number): YouTubePlayerFailure {
  if (code === 2)
    return {
      kind: "invalid-video",
      code,
      childMessage:
        "This video link is not valid. Ask Parent to choose it again.",
      diagnostic: "YouTube rejected the video ID or another player parameter.",
    };
  if (code === 5)
    return {
      kind: "player-service",
      code,
      childMessage:
        "YouTube could not play this video right now. Try again later.",
      diagnostic: "YouTube reported an HTML5 player or playback-service error.",
    };
  if (code === 100)
    return {
      kind: "video-unavailable",
      code,
      childMessage:
        "This video was removed or made private. Ask Parent for help.",
      diagnostic: "YouTube reported that the video was removed or is private.",
    };
  if (code === 101 || code === 150)
    return {
      kind: "embedding-disabled",
      code,
      childMessage:
        "This video cannot play inside WatchNest. Ask Parent to choose another one.",
      diagnostic: "The video owner does not allow embedded playback.",
    };
  if (code === 153)
    return {
      kind: "client-identity",
      code,
      childMessage:
        "The video player could not verify WatchNest. Ask Parent for help.",
      diagnostic:
        "YouTube did not receive the required Referer or equivalent client identity.",
    };
  return {
    kind: "unknown",
    code,
    childMessage:
      "YouTube could not play this video right now. Try another video.",
    diagnostic: "YouTube returned an unrecognized player error.",
  };
}

type YouTubePlayerOptions = {
  autoplay?: boolean;
  enableJsApi?: boolean;
  startSeconds?: number;
};

export function youtubePlayerVars(
  origin: string,
  options: YouTubePlayerOptions = {},
) {
  const variables: Record<string, string> = {
    controls: "1",
    iv_load_policy: "3",
    playsinline: "1",
    rel: "0",
  };
  if (options.autoplay) variables.autoplay = "1";
  if (origin) variables.origin = origin;
  if (options.enableJsApi) variables.enablejsapi = "1";
  if (options.startSeconds && options.startSeconds > 0)
    variables.start = String(Math.floor(options.startSeconds));
  return variables;
}

export function youtubeEmbedUrl(
  videoId: string,
  origin: string,
  options: YouTubePlayerOptions = {},
) {
  const url = new URL(
    `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}`,
  );
  Object.entries(youtubePlayerVars(origin, options)).forEach(([key, value]) =>
    url.searchParams.set(key, value),
  );
  return url.toString();
}
