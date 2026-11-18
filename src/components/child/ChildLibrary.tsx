"use client";
import Link from "next/link";
import "./ChildExperience.css";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  api,
  ChildRequest,
  Collection,
  DiscoveryResult,
  duration,
  Profile,
  SessionAccess,
  Video,
} from "./model";
import { normalizeYouTubeThumbnailUrl } from "@/lib/youtube-thumbnail";
import ProfileImage from "../ProfileImage";
import Icon from "../ui/Icon";
import { requestImmersivePlayback } from "@/lib/immersive-playback";

type Tab = "library" | "discover";

function VideoGrid({
  videos,
  onFavorite,
  onHide,
}: {
  videos: Video[];
  onFavorite: (video: Video) => void;
  onHide: (video: Video) => void;
}) {
  return (
    <div className="child-video-grid">
      {videos.map((video) => (
        <article className="child-video-card" key={video.id}>
          <Link
            href={`/watch/player/${encodeURIComponent(video.id)}`}
            aria-label={`Play ${video.title}`}
            onClick={requestImmersivePlayback}
          >
            <div className="child-artwork">
              {normalizeYouTubeThumbnailUrl(video.thumbnail_url) ? (
                <img
                  src={
                    normalizeYouTubeThumbnailUrl(video.thumbnail_url) ||
                    undefined
                  }
                  alt=""
                />
              ) : (
                <div className="artwork-fallback">
                  <Icon name="play" width="38" />
                </div>
              )}
              {video.duration_seconds > 0 && (
                <span>{duration(video.duration_seconds)}</span>
              )}
              <div className="play-button">
                <Icon name="play" width="24" />
              </div>
            </div>
            <div className="child-video-copy">
              <h3>{video.title}</h3>
              <p>{video.channel_title}</p>
              {video.made_for_kids === false &&
                video.progress &&
                !video.progress.completed_at &&
                video.progress.current_time_seconds > 0 && (
                  <div className="resume-line">
                    <span
                      style={{
                        width: `${Math.min(100, (video.progress.current_time_seconds / Math.max(video.progress.duration_seconds, 1)) * 100)}%`,
                      }}
                    />
                  </div>
                )}
            </div>
          </Link>
          <button
            className={`favorite-button ${video.favorite ? "is-favorite" : ""}`}
            aria-label={
              video.favorite
                ? `Remove ${video.title} from Favorites`
                : `Add ${video.title} to Favorites`
            }
            aria-pressed={video.favorite}
            onClick={() => onFavorite(video)}
          >
            <Icon
              name="heart"
              width="20"
              fill={video.favorite ? "currentColor" : "none"}
            />
          </button>
          <details className="video-options">
            <summary aria-label={`More options for ${video.title}`}>
              <Icon name="more" width="21" />
            </summary>
            <button
              className="hide-video-button"
              aria-label={
                video.hidden
                  ? `Restore ${video.title} to your library`
                  : `Hide ${video.title} from your library`
              }
              onClick={() => onHide(video)}
            >
              {video.hidden ? "Restore" : "Hide"}
            </button>
          </details>
        </article>
      ))}
    </div>
  );
}

export default function ChildLibrary() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [tab, setTab] = useState<Tab>("library");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("newest");
  const [discoverSearched, setDiscoverSearched] = useState(false);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [hiddenOnly, setHiddenOnly] = useState(false);
  const librarySearchLabel = collection
    ? "Search this collection"
    : favoritesOnly
      ? "Search Favorites"
      : hiddenOnly
        ? "Search hidden videos"
        : "Search your library";
  const [undoVideo, setUndoVideo] = useState<Video | null>(null);
  const [error, setError] = useState("");
  const [kind, setKind] = useState("topic");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sessionAccess, setSessionAccess] = useState<SessionAccess | null>(
    null,
  );
  const [requests, setRequests] = useState<ChildRequest[]>([]);
  const [discoverQuery, setDiscoverQuery] = useState("");
  const [boundary, setBoundary] = useState("");
  const [discoverResults, setDiscoverResults] = useState<DiscoveryResult[]>([]);
  const [discoverBusy, setDiscoverBusy] = useState(false);

  useEffect(() => {
    if (
      !sessionAccess?.enabled ||
      !sessionAccess.expiresAt ||
      !sessionAccess.allowed
    )
      return;
    const delay =
      Date.parse(sessionAccess.expiresAt) - Date.parse(sessionAccess.serverNow);
    const timer = window.setTimeout(
      () =>
        setSessionAccess((current) =>
          current
            ? { ...current, allowed: false, remainingSeconds: 0 }
            : current,
        ),
      Math.max(0, delay),
    );
    return () => window.clearTimeout(timer);
  }, [
    sessionAccess?.expiresAt,
    sessionAccess?.serverNow,
    sessionAccess?.enabled,
    sessionAccess?.allowed,
  ]);

  useEffect(() => {
    api<{
      profile: Profile;
      videos: Video[];
      collections: Collection[];
      session_access?: SessionAccess;
    }>("/api/child/library")
      .then((data) => {
        setProfile(data.profile);
        setVideos(data.videos);
        setCollections(data.collections);
        setSessionAccess(data.session_access || null);
        const firstTopic = data.profile.discovery_topics?.[0];
        const firstChannel = data.profile.discovery_channels?.[0];
        setBoundary(
          firstTopic
            ? `topic:${firstTopic}`
            : firstChannel
              ? `channel:${firstChannel.id}`
              : "",
        );
        void api<{ requests: ChildRequest[] }>("/api/child/requests")
          .then((value) =>
            setRequests(Array.isArray(value.requests) ? value.requests : []),
          )
          .catch(() => {});
      })
      .catch((reason) => setError(reason.message));
  }, []);

  useEffect(() => {
    if (!profile) return;
    let disposed = false;
    let inFlight = false;
    let timeout: number | undefined;
    let controller: AbortController | undefined;
    let abortTimer: number | undefined;
    const refresh = async () => {
      if (disposed || inFlight) return;
      inFlight = true;
      controller = new AbortController();
      abortTimer = window.setTimeout(() => controller?.abort(), 4000);
      try {
        const response = await fetch("/api/child/session-access", {
          cache: "no-store",
          signal: controller.signal,
        });
        const result = await response.json();
        if (
          !response.ok ||
          typeof result.session_access?.allowed !== "boolean" ||
          !Number.isInteger(result.session_access.revision) ||
          !Number.isFinite(Date.parse(result.session_access.serverNow))
        )
          throw new Error("Unconfirmed time");
        if (!disposed)
          setSessionAccess((current) =>
            !current || result.session_access.revision >= current.revision
              ? result.session_access
              : current,
          );
      } catch {
        if (!disposed)
          setSessionAccess((current) =>
            current ? { ...current, allowed: false } : current,
          );
      } finally {
        inFlight = false;
        window.clearTimeout(abortTimer);
        if (!disposed) timeout = window.setTimeout(refresh, 5000);
      }
    };
    timeout = window.setTimeout(refresh, 5000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      disposed = true;
      controller?.abort();
      window.clearTimeout(abortTimer);
      window.clearTimeout(timeout);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [profile]);

  const filtered = useMemo(
    () =>
      videos
        .filter(
          (video) =>
            (hiddenOnly ? video.hidden : !video.hidden) &&
            (!collection || collection.video_ids.includes(video.id)) &&
            (!favoritesOnly || video.favorite) &&
            `${video.title} ${video.channel_title} ${(video.tags || []).join(" ")} ${(video.collections || []).map((item) => item.title).join(" ")}`
              .toLocaleLowerCase()
              .includes(query.trim().toLocaleLowerCase()),
        )
        .sort((a, b) =>
          sort === "title"
            ? a.title.localeCompare(b.title)
            : (b.added_at || "").localeCompare(a.added_at || ""),
        ),
    [videos, collection, favoritesOnly, hiddenOnly, query, sort],
  );

  function navigate(next: Tab) {
    setTab(next);
    setCollection(null);
    setFavoritesOnly(false);
    setHiddenOnly(false);
    setQuery("");
    setSent(false);
    setError("");
  }
  function askFromSearch() {
    setMessage(query.slice(0, 200));
    setTab("discover");
    setSent(false);
  }
  async function switchProfile() {
    setBusy(true);
    try {
      await api("/api/auth/profile-exit", {});
      router.replace("/watch");
    } catch (reason) {
      setError((reason as Error).message);
      setBusy(false);
    }
  }
  async function toggleFavorite(video: Video) {
    const favorite = !video.favorite;
    setVideos((items) =>
      items.map((item) =>
        item.id === video.id ? { ...item, favorite } : item,
      ),
    );
    try {
      await api("/api/child/favorites", { videoId: video.id, favorite });
    } catch (reason) {
      setVideos((items) =>
        items.map((item) =>
          item.id === video.id ? { ...item, favorite: !favorite } : item,
        ),
      );
      setError((reason as Error).message);
    }
  }
  async function toggleHidden(video: Video) {
    const hidden = !video.hidden;
    setUndoVideo(hidden ? video : null);
    setVideos((items) =>
      items.map((item) => (item.id === video.id ? { ...item, hidden } : item)),
    );
    try {
      await api("/api/child/hidden", { videoId: video.id, hidden });
    } catch (reason) {
      setVideos((items) =>
        items.map((item) =>
          item.id === video.id ? { ...item, hidden: !hidden } : item,
        ),
      );
      setUndoVideo(null);
      setError((reason as Error).message);
    }
  }
  async function request(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/child/requests", { kind, message: message.trim() });
      setSent(true);
      setMessage("");
      void api<{ requests: ChildRequest[] }>("/api/child/requests")
        .then((data) =>
          setRequests(Array.isArray(data.requests) ? data.requests : []),
        )
        .catch(() => {});
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function searchDiscover(event: FormEvent) {
    event.preventDefault();
    if (!boundary || !discoverQuery.trim()) return;
    const [boundaryKind, ...parts] = boundary.split(":");
    setDiscoverBusy(true);
    setError("");
    try {
      const data = await api<{ results: DiscoveryResult[] }>(
        `/api/child/discover?q=${encodeURIComponent(discoverQuery.trim())}&kind=${boundaryKind}&boundary=${encodeURIComponent(parts.join(":"))}`,
      );
      setDiscoverResults(data.results);
      setDiscoverSearched(true);
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setDiscoverBusy(false);
    }
  }

  async function requestVideo(video: DiscoveryResult) {
    setDiscoverBusy(true);
    setError("");
    try {
      await api("/api/child/requests", {
        kind: "video",
        request_token: video.request_token,
      });
      const data = await api<{ requests: ChildRequest[] }>(
        "/api/child/requests",
      );
      setRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setDiscoverBusy(false);
    }
  }

  if (!profile)
    return (
      <main
        id="main-content"
        className="child-shell premium-child-library"
        data-experience-mode="standard"
      >
        <div className="picker-loading" role="status">
          {error ? (
            <>
              <p>{error}</p>
              <Link className="button" href="/watch">
                Choose profile
              </Link>
            </>
          ) : (
            <>Opening your library…</>
          )}
        </div>
      </main>
    );

  return (
    <main
      id="main-content"
      className="child-shell premium-child-library"
      data-experience-mode={profile?.experience_mode || "standard"}
    >
      <header className="child-header">
        <span className="brand">
          <img src="/icon.svg" alt="" width="38" height="38" />
          WatchNest
        </span>
        <button
          className="profile-switch"
          onClick={switchProfile}
          disabled={busy}
        >
          <ProfileImage
            name={profile.display_name}
            avatar={profile.avatar_key}
            photoUrl={profile.photo_url}
            size="small"
          />
          <span>{profile.display_name}</span>
          <Icon name="switch" width="18" />
        </button>
      </header>
      <nav className="child-nav" aria-label="WatchNest">
        <button
          aria-current={tab === "library" ? "page" : undefined}
          onClick={() => navigate("library")}
        >
          <Icon name="library" />
          Library
        </button>
        <button
          aria-current={tab === "discover" ? "page" : undefined}
          onClick={() => navigate("discover")}
        >
          <Icon name="search" />
          {profile.discover_enabled ? "Discover" : "Ask Parent"}
        </button>
      </nav>
      {sessionAccess?.enabled && sessionAccess.allowed && (
        <p className="muted" role="status">
          {sessionAccess.mode === "daily" ? "Daily time" : "Your time"} ·{" "}
          {Math.max(0, Math.ceil((sessionAccess.remainingSeconds || 0) / 60))}{" "}
          min left
        </p>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {undoVideo && (
        <div className="notice child-undo" role="status">
          Hidden from your library.
          <button
            className="button-quiet"
            onClick={() => {
              void toggleHidden({ ...undoVideo, hidden: true });
              setUndoVideo(null);
            }}
          >
            Undo
          </button>
        </div>
      )}
      {sessionAccess?.enabled &&
      !sessionAccess.allowed &&
      tab !== "discover" ? (
        <section className="request-card time-up-card">
          <div className="time-up-symbol">
            <Icon name="clock" width="44" />
          </div>
          <p className="eyebrow">Watch time</p>
          <h1>
            {sessionAccess.state === "paused"
              ? "Parent paused WatchNest"
              : "Time’s up for now"}
          </h1>
          <p>
            {sessionAccess.state === "paused"
              ? "Parent can resume when it’s time to watch again."
              : sessionAccess.parentBlocked
                ? "Parent will let you know when it’s time to watch again."
                : sessionAccess.mode === "daily"
                  ? "Your daily time renews at 7 AM. Your videos will be here."
                  : "Your videos will be here when it’s time to watch again."}
          </p>
          <button className="button" onClick={switchProfile}>
            Choose profile
          </button>
        </section>
      ) : tab === "discover" ? (
        <section className="request-card discover-page">
          <h1>
            {profile.discover_enabled
              ? "Discover something new"
              : "What would you love to watch?"}
          </h1>
          <p>
            {profile.discover_enabled
              ? "Choose a video to ask Parent."
              : "Tell Parent what you’d like to add."}
          </p>
          {profile.discover_enabled && boundary && (
            <form onSubmit={searchDiscover}>
              <label>
                Search in
                <select
                  className="field"
                  value={boundary}
                  onChange={(event) => setBoundary(event.target.value)}
                >
                  {(profile.discovery_topics || []).map((topic) => (
                    <option key={topic} value={`topic:${topic}`}>
                      {topic}
                    </option>
                  ))}
                  {(profile.discovery_channels || []).map((channel) => (
                    <option key={channel.id} value={`channel:${channel.id}`}>
                      {channel.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                What do you want to find?
                <input
                  className="field"
                  type="search"
                  maxLength={120}
                  value={discoverQuery}
                  onChange={(event) => setDiscoverQuery(event.target.value)}
                  required
                />
              </label>
              <button
                className="button"
                disabled={discoverBusy || !discoverQuery.trim()}
              >
                {discoverBusy ? "Searching…" : "Search"}
              </button>
            </form>
          )}
          {discoverSearched && !discoverBusy && !discoverResults.length && (
            <div className="child-empty" role="status">
              <Icon name="search" width="32" />
              <h2>No matches this time</h2>
              <p>Try a different word, or send Parent an idea below.</p>
            </div>
          )}
          {!!discoverResults.length && (
            <div className="child-video-grid discover-results">
              {discoverResults.map((video) => {
                const existing = requests.find(
                  (item) => item.youtube_video_id === video.youtube_video_id,
                );
                const assigned = videos.some(
                  (item) => item.youtube_video_id === video.youtube_video_id,
                );
                return (
                  <article
                    className="child-video-card"
                    key={video.youtube_video_id}
                  >
                    <div className="child-artwork">
                      <img src={video.thumbnail_url} alt="" />
                    </div>
                    <div className="child-video-copy">
                      <h3>{video.title}</h3>
                      <p>{video.channel_title}</p>
                    </div>
                    <button
                      className="button-secondary"
                      disabled={
                        discoverBusy ||
                        existing?.status === "pending" ||
                        assigned
                      }
                      onClick={() => requestVideo(video)}
                    >
                      {existing?.status === "pending"
                        ? "Waiting for Parent"
                        : assigned
                          ? "Added to your library"
                          : existing?.status === "resolved" ||
                              existing?.status === "dismissed"
                            ? "Ask again"
                            : "Ask Parent"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
          <details
            className="request-another"
            open={!profile.discover_enabled || !!message || sent}
          >
            <summary>
              {profile.discover_enabled
                ? "Ask Parent another way"
                : "Send an idea"}
            </summary>
            {sent ? (
              <div className="request-success" role="status">
                <Icon name="check" width="30" />
                <h2>Sent to Parent</h2>
                <p>They’ll see your idea in their inbox.</p>
                <button
                  className="button-secondary"
                  onClick={() => setSent(false)}
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={request}>
                <label>
                  What are you looking for?
                  <select
                    className="field"
                    value={kind}
                    onChange={(event) => setKind(event.target.value)}
                  >
                    <option value="topic">A topic</option>
                    <option value="show">A show</option>
                    <option value="creator">A creator</option>
                    <option value="video">A video</option>
                  </select>
                </label>
                <label>
                  Tell Parent
                  <textarea
                    className="field"
                    rows={3}
                    maxLength={200}
                    value={message}
                    onChange={(event) => setMessage(event.target.value)}
                    placeholder="Drawing a puppy, Peppa Pig, science…"
                    required
                  />
                </label>
                <button className="button" disabled={busy || !message.trim()}>
                  {busy ? "Sending…" : "Send request"}
                </button>
              </form>
            )}
          </details>
          {!!requests.length && (
            <div className="request-history">
              <h2>My requests</h2>
              {requests.slice(0, 12).map((item) => (
                <p key={item.id}>
                  <strong>{item.video_title || item.message}</strong>
                  <br />
                  <span className="muted">
                    {item.status === "pending"
                      ? "Waiting for Parent"
                      : item.status === "resolved"
                        ? videos.some(
                            (video) =>
                              video.youtube_video_id === item.youtube_video_id,
                          )
                          ? "In your library"
                          : "Reviewed by Parent"
                        : "Not added"}
                  </span>
                </p>
              ))}
            </div>
          )}
        </section>
      ) : (
        <>
          <div className="library-heading-tools">
            <div className="child-page-title">
              <div>
                <h1>
                  {collection
                    ? collection.title
                    : favoritesOnly
                      ? "Favorites"
                      : hiddenOnly
                        ? "Hidden videos"
                        : "Your library"}
                </h1>
                <p className="library-count">
                  {filtered.length} {filtered.length === 1 ? "video" : "videos"}
                  {collection ? " in this collection" : " to explore"}
                </p>
              </div>
            </div>
            <div className="library-tools">
              <label className="child-search">
                <Icon name="search" width="20" />
                <span className="sr-only">{librarySearchLabel}</span>
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={librarySearchLabel}
                  autoComplete="off"
                />
              </label>
              <button
                aria-pressed={!favoritesOnly && !hiddenOnly && !collection}
                onClick={() => {
                  setFavoritesOnly(false);
                  setHiddenOnly(false);
                  setCollection(null);
                }}
              >
                <Icon name="library" width="19" /> All videos
              </button>
              <button
                aria-pressed={favoritesOnly}
                onClick={() => {
                  setFavoritesOnly(!favoritesOnly);
                  setHiddenOnly(false);
                  setCollection(null);
                }}
              >
                <Icon name="heart" width="19" /> Favorites
              </button>
              {profile.experience_mode === "simple" ? (
                <details className="library-more">
                  <summary>
                    <Icon name="more" width="20" />
                    <span>More</span>
                  </summary>
                  <div className="library-more-panel">
                    <button
                      aria-pressed={hiddenOnly}
                      onClick={() => {
                        setHiddenOnly(!hiddenOnly);
                        setFavoritesOnly(false);
                        setCollection(null);
                      }}
                    >
                      Hidden
                    </button>
                    <label className="library-sort">
                      <span className="sr-only">Sort videos</span>
                      <select
                        value={sort}
                        onChange={(event) => setSort(event.target.value)}
                      >
                        <option value="newest">Recently added</option>
                        <option value="title">A–Z</option>
                      </select>
                    </label>
                  </div>
                </details>
              ) : (
                <>
                  <button
                    aria-pressed={hiddenOnly}
                    onClick={() => {
                      setHiddenOnly(!hiddenOnly);
                      setFavoritesOnly(false);
                      setCollection(null);
                    }}
                  >
                    Hidden
                  </button>
                  <label className="library-sort">
                    <span className="sr-only">Sort videos</span>
                    <select
                      value={sort}
                      onChange={(event) => setSort(event.target.value)}
                    >
                      <option value="newest">Recently added</option>
                      <option value="title">A–Z</option>
                    </select>
                  </label>
                </>
              )}
            </div>
          </div>
          {!query.trim() &&
            !collection &&
            !favoritesOnly &&
            !hiddenOnly &&
            collections.length > 0 && (
              <section>
                <div className="row-heading">
                  <h2>Collections</h2>
                </div>
                <div
                  className="collection-row"
                  role="group"
                  aria-label="Collections"
                  tabIndex={0}
                >
                  {collections.map((item) => (
                    <button
                      key={item.id}
                      onFocus={(event) =>
                        event.currentTarget.scrollIntoView({
                          block: "nearest",
                          inline: "nearest",
                          behavior: "instant",
                        })
                      }
                      onClick={() => setCollection(item)}
                    >
                      <span className="collection-art" aria-hidden="true">
                        {(() => {
                          const cover = videos.find(
                            (video) =>
                              !video.hidden &&
                              item.video_ids.includes(video.id),
                          );
                          const thumbnail =
                            cover &&
                            normalizeYouTubeThumbnailUrl(cover.thumbnail_url);
                          return thumbnail ? (
                            <img src={thumbnail} alt="" loading="lazy" />
                          ) : (
                            <Icon name="collection" width="32" />
                          );
                        })()}
                      </span>
                      <span>{item.video_ids.length} videos</span>
                      <strong>{item.title}</strong>
                      <small>{item.description || "Open Collection"}</small>
                    </button>
                  ))}
                </div>
              </section>
            )}
          {(collection || favoritesOnly || hiddenOnly) && (
            <button
              className="back-button"
              onClick={() => {
                setCollection(null);
                setFavoritesOnly(false);
                setHiddenOnly(false);
              }}
            >
              ← All videos
            </button>
          )}
          {filtered.length ? (
            <section className="library-results" aria-label="Library videos">
              {!query.trim() &&
                !collection &&
                !favoritesOnly &&
                !hiddenOnly &&
                collections.length > 0 &&
                profile.experience_mode !== "simple" && (
                  <div className="row-heading">
                    <h2>All videos</h2>
                  </div>
                )}
              <VideoGrid
                videos={filtered}
                onFavorite={toggleFavorite}
                onHide={toggleHidden}
              />
            </section>
          ) : (
            <div className="child-empty">
              <Icon
                name={
                  favoritesOnly ? "heart" : hiddenOnly ? "library" : "search"
                }
                width="36"
              />
              <h2>
                {query
                  ? "Nothing found"
                  : favoritesOnly
                    ? "No Favorites yet"
                    : hiddenOnly
                      ? "Nothing hidden"
                      : "Nothing here yet"}
              </h2>
              <p>
                {query
                  ? collection || favoritesOnly || hiddenOnly
                    ? "Try another word, or search all your videos."
                    : "Try another word or ask Parent."
                  : favoritesOnly
                    ? "Tap the heart on a video to save it here."
                    : hiddenOnly
                      ? "Videos you hide will appear here."
                      : "Ask Parent to add something."}
              </p>
              {query &&
                (collection || favoritesOnly || hiddenOnly ? (
                  <button
                    className="button"
                    onClick={() => {
                      setCollection(null);
                      setFavoritesOnly(false);
                      setHiddenOnly(false);
                    }}
                  >
                    Search all videos
                  </button>
                ) : (
                  <button className="button" onClick={askFromSearch}>
                    Ask Parent for “{query}”
                  </button>
                ))}
            </div>
          )}
        </>
      )}
    </main>
  );
}
