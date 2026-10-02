"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  api,
  Profile,
  Video,
  serializeBookmark,
  waitForBookmarks,
} from "./model";
import YouTubeEmbed from "../YouTubeEmbed";
import { classifyYouTubePlayerError } from "@/lib/youtube-player";
type Player = {
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  playVideo: () => void;
  pauseVideo: () => void;
  destroy: () => void;
};
type PlayerEvent = { target: Player; data: number };
type YouTube = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId: string;
      host: string;
      playerVars: Record<string, string | number>;
      events: {
        onReady: (event: { target: Player }) => void;
        onStateChange: (event: PlayerEvent) => void;
        onError: (event: { data: number }) => void;
        onAutoplayBlocked: () => void;
      };
    },
  ) => Player;
};
declare global {
  interface Window {
    YT?: YouTube;
    onYouTubeIframeAPIReady?: () => void;
  }
}
let apiPromise: Promise<YouTube> | undefined;
function loadPlayer(): Promise<YouTube> {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (!apiPromise)
    apiPromise = new Promise((resolve, reject) => {
      const previous = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        previous?.();
        if (window.YT) resolve(window.YT);
      };
      let script = document.querySelector<HTMLScriptElement>(
        "script[data-watchnest-youtube]",
      );
      if (!script) {
        script = document.createElement("script");
        script.src = "https://www.youtube.com/iframe_api";
        script.dataset.watchnestYoutube = "true";
        script.onerror = () => {
          apiPromise = undefined;
          script?.remove();
          reject(new Error("youtube-api-script-error"));
        };
        document.head.appendChild(script);
      }
      setTimeout(() => {
        if (!window.YT?.Player) {
          apiPromise = undefined;
          script?.remove();
          reject(new Error("youtube-api-timeout"));
        }
      }, 15000);
    });
  return apiPromise;
}
type Playback = { profile: Profile; video: Video; next: Video | null };
export default function ChildPlayer({ videoId }: { videoId: string }) {
  const [data, setData] = useState<Playback | null>(null);
  const [error, setError] = useState("");
  const [blocked, setBlocked] = useState(false);
  const [ended, setEnded] = useState(false);
  const [ready, setReady] = useState(false);
  const [staticFallback, setStaticFallback] = useState(false);
  const [playerNotice, setPlayerNotice] = useState("");
  const [replay, setReplay] = useState(0);
  const [helpSent, setHelpSent] = useState(false);
  const [helpBusy, setHelpBusy] = useState(false);
  const [helpError, setHelpError] = useState("");
  async function askForHelp() {
    if (!data || helpSent || helpBusy) return;
    setHelpBusy(true);
    setHelpError("");
    try {
      await api("/api/child/requests", {
        kind: "video",
        message: `Playback problem: ${data.video.title}`.slice(0, 200),
      });
      setHelpSent(true);
    } catch (err) {
      setHelpError((err as Error).message);
    } finally {
      setHelpBusy(false);
    }
  }
  const mount = useRef<HTMLDivElement>(null);
  const player = useRef<Player | null>(null);
  const active = useRef(true);
  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError("");
    setEnded(false);
    setReady(false);
    setBlocked(false);
    setStaticFallback(false);
    setPlayerNotice("");
    setHelpSent(false);
    setHelpError("");
    waitForBookmarks()
      .then(() =>
        api<Playback>(
          `/api/child/player?videoId=${encodeURIComponent(videoId)}`,
        ),
      )
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((e) => {
        if (!cancelled) setError(e.message);
      });
    return () => {
      cancelled = true;
    };
  }, [videoId, replay]);
  useEffect(() => {
    if (
      !data ||
      data.video.made_for_kids !== false ||
      staticFallback ||
      !mount.current
    )
      return;
    let disposed = false;
    let completed = false;
    active.current = true;
    const historyAllowed = data.video.made_for_kids === false;
    function save() {
      const p = player.current;
      if (!p || !historyAllowed) return;
      const current = p.getCurrentTime();
      const rawEnded = completed;
      // Capture before destroying the iframe; serialize to prevent a delayed
      // position response/write from resurrecting an ended bookmark.
      void serializeBookmark(async () => {
        try {
          await api(
            "/api/child/progress",
            {
              videoId,
              currentTimeSeconds:
                Number.isFinite(current) && current >= 0 ? current : 0,
              watchedSeconds: 0,
              completed: rawEnded,
            },
            { keepalive: true },
          );
        } catch (e) {
          if (!disposed) {
            player.current?.pauseVideo();
            active.current = false;
            setError((e as Error).message);
          }
        }
      });
    }
    const host = document.createElement("div");
    mount.current.replaceChildren(host);
    loadPlayer()
      .then((YT) => {
        if (disposed) return;
        player.current = new YT.Player(host, {
          videoId: data.video.youtube_video_id,
          host: "https://www.youtube-nocookie.com",
          playerVars: {
            controls: 1,
            playsinline: 1,
            rel: 0,
            origin: window.location.origin,
            start:
              historyAllowed && !data.video.progress?.completed_at
                ? Math.floor(data.video.progress?.current_time_seconds || 0)
                : 0,
          },
          events: {
            onReady: () => {
              if (!disposed) setReady(true);
            },
            onStateChange: (e) => {
              if (disposed) return;
              if (e.data === 1) {
                setBlocked(false);
                setEnded(false);
              }
              if (e.data === 2) void save();
              if (e.data === 0) {
                completed = true;
                setEnded(true);
                void save();
                active.current = false;
                e.target.destroy();
                player.current = null;
              }
            },
            onError: (event) => {
              if (!disposed) {
                const failure = classifyYouTubePlayerError(event.data);
                console.warn("[watchnest-player] YouTube playback failed", {
                  kind: failure.kind,
                  code: failure.code,
                  videoId: data.video.id,
                });
                setError(failure.childMessage);
                active.current = false;
              }
            },
            onAutoplayBlocked: () => {
              if (!disposed) setBlocked(true);
            },
          },
        });
      })
      .catch((e) => {
        if (!disposed) {
          console.warn(
            "[watchnest-player] IFrame API unavailable; using direct embed",
            {
              reason: e instanceof Error ? e.message : "unknown",
              videoId: data.video.id,
            },
          );
          setStaticFallback(true);
          setPlayerNotice(
            "The YouTube player is shown below. Press Play to begin; resume is temporarily unavailable.",
          );
        }
      });
    const bookmark = historyAllowed
      ? setInterval(() => void save(), 15000)
      : undefined;
    function visibility() {
      if (document.hidden) {
        player.current?.pauseVideo();
        void save();
      }
    }
    function pagehide() {
      void save();
    }
    document.addEventListener("visibilitychange", visibility);
    window.addEventListener("pagehide", pagehide);
    return () => {
      void save();
      disposed = true;
      active.current = false;
      clearInterval(bookmark);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", pagehide);
      player.current?.destroy();
      player.current = null;
    };
  }, [data, videoId, staticFallback]);
  useEffect(() => {
    if (!data) return;
    let disposed = false;
    const check = setInterval(() => {
      api<Playback>(
        `/api/child/player?videoId=${encodeURIComponent(videoId)}`,
      ).catch((e) => {
        if (!disposed) {
          active.current = false;
          player.current?.pauseVideo();
          player.current?.destroy();
          player.current = null;
          setError((e as Error).message);
        }
      });
    }, 20000);
    return () => {
      disposed = true;
      clearInterval(check);
    };
  }, [data, videoId]);
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="shell"
      style={{ maxWidth: 1180 }}
    >
      <header className="topbar">
        <Link className="brand" href="/watch/home">
          WatchNest
        </Link>
        <Link className="button button-secondary" href="/watch/home">
          ← Back to Library
        </Link>
      </header>
      {error ? (
        <section className="panel" style={{ marginTop: 32 }}>
          <p className="eyebrow">Let’s pick something else</p>
          <h1>
            {error.includes("not available for this profile right now")
              ? "WatchNest is closed right now"
              : "This video is unavailable"}
          </h1>
          <p role="alert" className="error">
            {error}
          </p>
          <Link className="button" href="/watch/home">
            Back to my videos
          </Link>
          {data && (
            <div style={{ marginTop: 16 }}>
              {helpSent ? (
                <p role="status">
                  Your parent can see your request for help in their Inbox.
                </p>
              ) : (
                <button
                  className="button button-secondary"
                  onClick={askForHelp}
                  disabled={helpBusy}
                >
                  {helpBusy ? "Sending…" : "Ask Parent for help"}
                </button>
              )}
              {helpError && (
                <p role="alert" className="error" style={{ marginTop: 12 }}>
                  {helpError}
                </p>
              )}
            </div>
          )}
        </section>
      ) : !data ? (
        <p role="status" className="panel">
          Opening your video…
        </p>
      ) : (
        <>
          <div className="page-heading">
            <p className="eyebrow">
              From {data.profile.display_name}’s library
            </p>
            <h1 style={{ fontSize: "clamp(24px,4vw,36px)" }}>
              {data.video.title}
            </h1>
            <p className="muted">{data.video.channel_title}</p>
          </div>
          {ended ? (
            <section className="panel" aria-live="polite">
              <p className="eyebrow">All finished</p>
              <h2>{data.video.title} has ended</h2>
              <p className="muted">
                Pick another video from your library, or enjoy this one again.
              </p>
              <button
                className="button button-secondary"
                onClick={() => setReplay((value) => value + 1)}
              >
                Watch again
              </button>
            </section>
          ) : data.video.made_for_kids !== false || staticFallback ? (
            <YouTubeEmbed
              className="watchnest-player"
              videoId={data.video.youtube_video_id}
              title={data.video.title}
              startSeconds={
                data.video.made_for_kids === false &&
                !data.video.progress?.completed_at
                  ? data.video.progress?.current_time_seconds || 0
                  : 0
              }
              onLoad={() => setReady(true)}
            />
          ) : (
            <div
              ref={mount}
              className="watchnest-player"
              style={{
                aspectRatio: "16/9",
                background: "#15251F",
                borderRadius: 16,
                overflow: "hidden",
              }}
            />
          )}
          <style>{`.watchnest-player{width:100%;aspect-ratio:16/9;background:#15251F;border:0;border-radius:16px;overflow:hidden;display:block}.watchnest-player iframe{width:100%;height:100%;display:block;border:0}`}</style>
          {!ended && !ready && (
            <p role="status" className="muted">
              Loading the video player…
            </p>
          )}
          {!ended && blocked && (
            <div className="notice">
              <p>Tap to start your video.</p>
              <button
                className="button"
                onClick={() => player.current?.playVideo()}
              >
                Play video
              </button>
            </div>
          )}
          {playerNotice && <p className="notice">{playerNotice}</p>}
          {data.video.made_for_kids !== false && (
            <p className="muted" style={{ fontSize: 13 }}>
              Resume is off for this video.
            </p>
          )}
          <section className="panel" style={{ marginTop: 24 }}>
            {data.next ? (
              <>
                <p className="eyebrow">
                  {ended ? "Ready for another?" : "Next in your library"}
                </p>
                <h2>{data.next.title}</h2>
                <p className="muted">{data.next.channel_title}</p>
                <Link
                  className="button"
                  href={`/watch/player/${encodeURIComponent(data.next.id)}`}
                >
                  Watch next →
                </Link>
              </>
            ) : (
              <>
                <h2>Want to pick something else?</h2>
                <Link className="button button-secondary" href="/watch/home">
                  Explore my videos
                </Link>
              </>
            )}
          </section>
          <p className="muted" style={{ fontSize: 13, marginTop: 24 }}>
            YouTube supplies this player and may show its own links or related
            videos. Stay in WatchNest to choose from your library.{" "}
            <Link href="/privacy">Privacy & player details</Link>
          </p>
        </>
      )}
    </main>
  );
}
