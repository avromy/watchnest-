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
import {
  classifyYouTubePlayerError,
  youtubeEmbedUrl,
  youtubePlayerVars,
} from "@/lib/youtube-player";
import {
  leaveImmersivePlayback,
  requestImmersivePlayback,
} from "@/lib/immersive-playback";
type Player = {
  getCurrentTime: () => number;
  getDuration: () => number;
  getPlayerState: () => number;
  playVideo: () => void;
  pauseVideo: () => void;
  setVolume: (volume: number) => void;
  getIframe: () => HTMLIFrameElement;
  getVideoData: () => { video_id?: string };
  getVideoUrl: () => string;
  destroy: () => void;
};
type PlayerEvent = { target: Player; data: number };
type YouTube = {
  Player: new (
    element: HTMLElement,
    options: {
      videoId?: string;
      host?: string;
      playerVars?: Record<string, string | number>;
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
type Playback = {
  profile: Profile;
  video: Video;
  next: Video | null;
  safe_playback_enabled: boolean;
  session_access?: {
    enabled: boolean;
    allowed: boolean;
    expiresAt: string | null;
    remainingSeconds: number | null;
    serverNow: string;
  };
};
type PlaybackAccess = NonNullable<Playback["session_access"]>;

const SAFE_PLAYER_SANDBOX =
  "allow-scripts allow-same-origin allow-presentation";

function currentPlayerVideoId(player: Player) {
  const reported = player.getVideoData()?.video_id;
  if (reported) return reported;
  try {
    return new URL(player.getVideoUrl()).searchParams.get("v") || undefined;
  } catch {
    return undefined;
  }
}
export default function ChildPlayer({ videoId }: { videoId: string }) {
  const [data, setData] = useState<Playback | null>(null);
  const [error, setError] = useState("");
  const [errorKind, setErrorKind] = useState<
    | "authorization"
    | "unavailable"
    | "embedding"
    | "initialization"
    | "provider"
    | "network"
    | "unknown"
  >("unknown");
  const [started, setStarted] = useState(false);
  const [timeUp, setTimeUp] = useState(false);
  const [sessionAccessState, setSessionAccessState] =
    useState<PlaybackAccess | null>(null);
  const [ended, setEnded] = useState(false);
  const [ready, setReady] = useState(false);
  const [staticFallback, setStaticFallback] = useState(false);
  const [playerNotice, setPlayerNotice] = useState("");
  const [replay, setReplay] = useState(0);
  const [helpSent, setHelpSent] = useState(false);
  const [helpBusy, setHelpBusy] = useState(false);
  const [helpError, setHelpError] = useState("");
  const [volume, setVolume] = useState(60);
  const volumeRef = useRef(60);
  useEffect(() => () => leaveImmersivePlayback(), []);
  useEffect(() => {
    const saved = Number(
      window.localStorage.getItem("watchnest-player-volume"),
    );
    if (Number.isFinite(saved) && saved >= 0 && saved <= 100) {
      volumeRef.current = saved;
      setVolume(saved);
    }
  }, []);
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
  function stopForTimeUp() {
    active.current = false;
    try {
      player.current?.pauseVideo();
      player.current?.destroy();
    } catch {}
    player.current = null;
    mount.current?.replaceChildren();
    const doc = document as Document & {
      webkitExitFullscreen?: () => void;
    };
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {});
    else doc.webkitExitFullscreen?.();
    setTimeUp(true);
    setError("");
    setReady(false);
  }
  useEffect(() => {
    let cancelled = false;
    setData(null);
    setError("");
    setErrorKind("unknown");
    setEnded(false);
    setReady(false);
    setStarted(false);
    setTimeUp(false);
    setSessionAccessState(null);
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
        if (!cancelled) {
          setData(d);
          setSessionAccessState(d.session_access || null);
          if (d.session_access && !d.session_access.allowed) setTimeUp(true);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          const message = e instanceof Error ? e.message : "";
          if (/time.+up|more time/i.test(message)) {
            setTimeUp(true);
            return;
          }
          setError(message || "WatchNest could not open this video.");
          setErrorKind(
            /not in your library|no longer assigned/i.test(message)
              ? "authorization"
              : /sign in|session/i.test(message)
                ? "authorization"
                : /unavailable|removed|private/i.test(message)
                  ? "unavailable"
                  : /reach|network|connection/i.test(message)
                    ? "network"
                    : "unknown",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [videoId, replay]);
  useEffect(() => {
    const access = sessionAccessState;
    if (!access || !access.enabled || !access.expiresAt) return;
    const serverNow = Date.parse(access.serverNow);
    const expiresAt = Date.parse(access.expiresAt);
    const delay = expiresAt - serverNow;
    if (!Number.isFinite(delay) || delay <= 0) {
      stopForTimeUp();
      return;
    }
    const timer = window.setTimeout(stopForTimeUp, delay);
    return () => window.clearTimeout(timer);
  }, [sessionAccessState]);
  useEffect(() => {
    if (!data || timeUp || staticFallback || !mount.current) return;
    let disposed = false;
    let completed = false;
    let identityTimer: number | undefined;
    active.current = true;
    const approvedVideoId = data.video.youtube_video_id;
    const historyAllowed = data.video.made_for_kids === false;
    function stopUnauthorized(target: Player) {
      window.clearTimeout(identityTimer);
      identityTimer = undefined;
      console.warn("[watchnest-player] blocked unexpected player identity", {
        videoId: data?.video.id,
      });
      target.pauseVideo();
      target.destroy();
      player.current = null;
      active.current = false;
      setErrorKind("authorization");
      setError("WatchNest stopped a video that was not approved.");
    }
    function verifyIdentity(target: Player, enforceUnknown = false) {
      const currentVideoId = currentPlayerVideoId(target);
      if (currentVideoId === approvedVideoId) {
        window.clearTimeout(identityTimer);
        identityTimer = undefined;
        return;
      }
      if (currentVideoId) {
        stopUnauthorized(target);
        return;
      }
      // WebKit can briefly expose no identity while the iframe is buffering.
      // Give that initialization state one bounded grace period; an identity
      // that remains unreadable still fails closed.
      if (enforceUnknown && identityTimer === undefined) {
        identityTimer = window.setTimeout(() => {
          identityTimer = undefined;
          if (!disposed) {
            const settledVideoId = currentPlayerVideoId(target);
            if (settledVideoId !== approvedVideoId) {
              stopUnauthorized(target);
            }
          }
        }, 2500);
      }
    }
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
    const host = data.safe_playback_enabled
      ? document.createElement("iframe")
      : document.createElement("div");
    if (host instanceof HTMLIFrameElement) {
      const startSeconds =
        historyAllowed && !data.video.progress?.completed_at
          ? Math.floor(data.video.progress?.current_time_seconds || 0)
          : 0;
      host.src = youtubeEmbedUrl(
        data.video.youtube_video_id,
        window.location.origin,
        {
          autoplay: false,
          enableJsApi: true,
          startSeconds,
        },
      );
      host.title = data.video.title;
      host.allow =
        "accelerometer; autoplay; encrypted-media; gyroscope; fullscreen";
      host.allowFullscreen = true;
      host.referrerPolicy = "strict-origin-when-cross-origin";
      host.setAttribute("sandbox", SAFE_PLAYER_SANDBOX);
    }
    const iframeReady =
      host instanceof HTMLIFrameElement
        ? new Promise<void>((resolve, reject) => {
            const timer = window.setTimeout(
              () => reject(new Error("youtube-iframe-timeout")),
              15000,
            );
            host.addEventListener(
              "load",
              () => {
                window.clearTimeout(timer);
                resolve();
              },
              { once: true },
            );
          })
        : Promise.resolve();
    mount.current.replaceChildren(host);
    Promise.all([loadPlayer(), iframeReady])
      .then(([YT]) => {
        if (disposed) return;
        player.current = new YT.Player(host, {
          ...(data.safe_playback_enabled
            ? {}
            : {
                videoId: data.video.youtube_video_id,
                host: "https://www.youtube-nocookie.com",
                playerVars: youtubePlayerVars(window.location.origin, {
                  autoplay: false,
                  startSeconds:
                    historyAllowed && !data.video.progress?.completed_at
                      ? data.video.progress?.current_time_seconds || 0
                      : 0,
                }),
              }),
          events: {
            onReady: (event) => {
              if (!disposed) {
                const frame = event.target.getIframe();
                if (
                  new URL(frame.src).hostname !== "www.youtube-nocookie.com"
                ) {
                  event.target.destroy();
                  player.current = null;
                  active.current = false;
                  setErrorKind("authorization");
                  setError("WatchNest stopped a video that was not approved.");
                  return;
                }
                if (data.safe_playback_enabled) {
                  frame.setAttribute("sandbox", SAFE_PLAYER_SANDBOX);
                }
                event.target.setVolume(volumeRef.current);
                verifyIdentity(event.target, false);
                setReady(true);
              }
            },
            onStateChange: (e) => {
              if (disposed) return;
              // Reject every explicit identity mismatch, including related
              // videos entering UNSTARTED/CUED. Only enforce an unreadable
              // identity timeout after Playing/Paused; slow WebKit buffering
              // does not have a documented identity-readiness deadline.
              verifyIdentity(e.target, e.data === 1 || e.data === 2);
              if (e.data === 1) {
                setStarted(true);
                setEnded(false);
              }
              if (e.data === 2) void save();
              if (e.data === 0) {
                window.clearTimeout(identityTimer);
                identityTimer = undefined;
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
                setErrorKind(
                  failure.kind === "video-unavailable"
                    ? "unavailable"
                    : failure.kind === "embedding-disabled"
                      ? "embedding"
                      : failure.kind === "client-identity"
                        ? "initialization"
                        : failure.kind === "player-service"
                          ? "provider"
                          : "unknown",
                );
                setError(failure.childMessage);
                active.current = false;
              }
            },
            onAutoplayBlocked: () => {
              if (!disposed)
                setPlayerNotice("Tap Play in the video to begin.");
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
          player.current?.destroy();
          player.current = null;
          mount.current?.replaceChildren();
          if (data.safe_playback_enabled) {
            setErrorKind("initialization");
            setError(
              "The video player could not start safely. Please try again.",
            );
            active.current = false;
          } else {
            setStaticFallback(true);
            setPlayerNotice("Tap Play in the video to begin.");
          }
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
      window.clearTimeout(identityTimer);
      clearInterval(bookmark);
      document.removeEventListener("visibilitychange", visibility);
      window.removeEventListener("pagehide", pagehide);
      player.current?.destroy();
      player.current = null;
    };
  }, [data, videoId, staticFallback, timeUp]);
  useEffect(() => {
    if (!data) return;
    let disposed = false;
    const revalidate = () => {
      api<Playback>(
        `/api/child/player?videoId=${encodeURIComponent(videoId)}`,
      ).then((latest) => {
        if (disposed || !latest.session_access) return;
        if (!latest.session_access.allowed) {
          stopForTimeUp();
          return;
        }
        // Parent changes are server-authoritative. Replacing only the access
        // snapshot reschedules the local deadline without recreating the
        // cross-origin player or losing its native iPad play gesture.
        setSessionAccessState(latest.session_access);
      }).catch((e) => {
        if (!disposed) {
          const message = e instanceof Error ? e.message : "";
          if (/time.+up|more time/i.test(message)) {
            stopForTimeUp();
            return;
          }
          active.current = false;
          player.current?.pauseVideo();
          player.current?.destroy();
          player.current = null;
          setErrorKind(
            /not in your library|no longer assigned|sign in|session/i.test(
              message,
            )
              ? "authorization"
              : /unavailable|removed|private/i.test(message)
                ? "unavailable"
                : /reach|network|connection/i.test(message)
                  ? "network"
                  : "unknown",
          );
          setError(message || "WatchNest could not continue this video.");
        }
      });
    };
    const check = setInterval(revalidate, 5000);
    const resume = () => {
      if (!document.hidden) void revalidate();
    };
    document.addEventListener("visibilitychange", resume);
    window.addEventListener("pageshow", resume);
    window.addEventListener("focus", resume);
    return () => {
      disposed = true;
      clearInterval(check);
      document.removeEventListener("visibilitychange", resume);
      window.removeEventListener("pageshow", resume);
      window.removeEventListener("focus", resume);
    };
  }, [data, videoId]);
  return (
    <main id="main-content" tabIndex={-1} className="child-player-shell">
      <header className="child-player-topbar">
        <Link className="brand" href="/watch/home">
          WatchNest
        </Link>
        <div className="child-player-topbar-actions">
          <Link className="button button-secondary" href="/watch/home">
            ← Back to Library
          </Link>
        </div>
      </header>
      {timeUp ? (
        <section className="panel time-up-card" aria-labelledby="time-up-heading">
          <p className="eyebrow">WatchNest session</p>
          <h1 id="time-up-heading" tabIndex={-1}>Time’s up for now</h1>
          <p>Video has stopped. Ask Parent when you’re ready for more time.</p>
          <Link className="button" href="/watch">
            Choose profile
          </Link>
        </section>
      ) : error ? (
        <section className="panel" style={{ marginTop: 32 }}>
          <p className="eyebrow">Let’s pick something else</p>
          <h1>
            {error.includes("not available for this profile right now")
              ? "WatchNest is closed right now"
              : errorKind === "authorization"
                ? "This video isn’t approved"
                : errorKind === "unavailable"
                  ? "This video is unavailable"
                  : errorKind === "embedding"
                    ? "This video can’t play here"
                    : errorKind === "network"
                      ? "WatchNest can’t reach the video"
                      : "The video player didn’t start"}
          </h1>
          <p role="alert" className="error">
            {error}
          </p>
          <Link className="button" href="/watch/home">
            Back to Library
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
          <div className="child-player-heading">
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
          ) : staticFallback ? (
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
              autoplay={false}
              onLoad={() => setReady(true)}
              safePlayback={data.safe_playback_enabled}
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
          <style>{`.watchnest-player{width:100%;aspect-ratio:16/9;background:#06120f;border:0;border-radius:18px;overflow:hidden;display:block;box-shadow:0 24px 80px #0008}.watchnest-player iframe{width:100%;height:100%;display:block;border:0}`}</style>
          {!ended && !ready && (
            <p role="status" className="muted">
              Loading the video player…
            </p>
          )}
          {playerNotice && <p className="notice">{playerNotice}</p>}
          {data.video.made_for_kids === false && !staticFallback && (
            <label className="player-volume">
              Volume
              <input
                type="range"
                min="0"
                max="100"
                value={volume}
                onChange={(event) => {
                  const next = Number(event.target.value);
                  volumeRef.current = next;
                  setVolume(next);
                  player.current?.setVolume(next);
                  window.localStorage.setItem(
                    "watchnest-player-volume",
                    String(next),
                  );
                }}
              />
            </label>
          )}
          {data.safe_playback_enabled && (
            <p className="safe-playback-note" role="status">
              Safe Playback is on. External links stay blocked in Child Mode.
            </p>
          )}
          {(started || ended || staticFallback) && (
            <section
              className={`panel child-player-next ${ended ? "is-visible" : ""}`}
              style={{ marginTop: 24 }}
            >
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
                    onClick={requestImmersivePlayback}
                  >
                    Watch next →
                  </Link>
                </>
              ) : (
                <>
                  <h2>Want to pick something else?</h2>
                  <Link className="button button-secondary" href="/watch/home">
                    Explore Library
                  </Link>
                </>
              )}
            </section>
          )}
        </>
      )}
    </main>
  );
}
