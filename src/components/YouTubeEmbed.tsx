"use client";

import { useEffect, useState } from "react";
import { youtubeEmbedUrl } from "@/lib/youtube-player";

export default function YouTubeEmbed({
  videoId,
  title,
  className,
  startSeconds = 0,
  autoplay = false,
  safePlayback = false,
  onLoad,
}: {
  videoId: string;
  title: string;
  className?: string;
  startSeconds?: number;
  autoplay?: boolean;
  safePlayback?: boolean;
  onLoad?: () => void;
}) {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);

  if (!origin)
    return (
      <div
        className={className}
        role="status"
        aria-label="Loading video player"
      >
        Loading video player…
      </div>
    );

  return (
    <iframe
      className={className}
      src={youtubeEmbedUrl(videoId, origin, { autoplay, startSeconds })}
      title={title}
      allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      allowFullScreen
      loading="eager"
      referrerPolicy="strict-origin-when-cross-origin"
      sandbox={
        safePlayback
          ? "allow-scripts allow-same-origin allow-presentation"
          : undefined
      }
      onLoad={onLoad}
    />
  );
}
