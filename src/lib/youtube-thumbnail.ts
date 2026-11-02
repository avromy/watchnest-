export function normalizeYouTubeThumbnailUrl(value: string | null | undefined) {
  if (!value) return null;
  try {
    const url = new URL(value);
    if (url.protocol === "https:" && url.hostname === "i.ytimg.com") {
      url.hostname = "img.youtube.com";
      return url.toString();
    }
  } catch {
    return null;
  }
  return value;
}
