const YOUTUBE_VIDEO_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

const YOUTUBE_HOSTS = new Set([
  "youtube.com",
  "www.youtube.com",
  "m.youtube.com",
]);

function isValidVideoId(videoId: string | null): videoId is string {
  return videoId !== null && YOUTUBE_VIDEO_ID_PATTERN.test(videoId);
}

function getSinglePathSegmentAfterPrefix(
  pathname: string,
  prefix: string,
): string | null {
  if (!pathname.startsWith(prefix)) {
    return null;
  }

  const remainingPath = pathname.slice(prefix.length);
  const segments = remainingPath.split("/").filter(Boolean);

  return segments.length === 1 ? segments[0] : null;
}

export function extractYouTubeVideoId(input: string): string | null {
  let url: URL;

  try {
    url = new URL(input);
  } catch {
    return null;
  }

  if (url.protocol !== "https:" && url.protocol !== "http:") {
    return null;
  }

  const hostname = url.hostname.toLowerCase();

  if (hostname === "youtu.be") {
    const videoId = getSinglePathSegmentAfterPrefix(url.pathname, "/");
    return isValidVideoId(videoId) ? videoId : null;
  }

  if (!YOUTUBE_HOSTS.has(hostname)) {
    return null;
  }

  if (url.pathname === "/watch") {
    const videoId = url.searchParams.get("v");
    return isValidVideoId(videoId) ? videoId : null;
  }

  const embedVideoId = getSinglePathSegmentAfterPrefix(url.pathname, "/embed/");
  if (isValidVideoId(embedVideoId)) {
    return embedVideoId;
  }

  const shortsVideoId = getSinglePathSegmentAfterPrefix(
    url.pathname,
    "/shorts/",
  );
  if (isValidVideoId(shortsVideoId)) {
    return shortsVideoId;
  }

  return null;
}

/**
 * Extracts supported YouTube video URLs from pasted/share-sheet text.
 * Mobile share sheets frequently include a title before the URL, so callers
 * must not require the whole clipboard payload to be a bare URL.
 */
export function extractYouTubeVideoUrls(input: string): string[] {
  const candidates = input
    .split(/[\s,]+/)
    .map((value) => value.trim().replace(/^[<({\[]+|[>)}\].,;!?]+$/g, ""))
    .filter(Boolean);
  const seen = new Set<string>();
  const urls: string[] = [];
  for (const candidate of candidates) {
    const videoId = extractYouTubeVideoId(candidate);
    if (!videoId || seen.has(videoId)) continue;
    seen.add(videoId);
    urls.push(candidate);
  }
  return urls;
}
