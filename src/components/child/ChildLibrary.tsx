"use client";
import Link from "next/link";
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

type Tab = "home" | "library" | "discover";

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
  const [tab, setTab] = useState<Tab>("home");
  const [query, setQuery] = useState("");
  const [collection, setCollection] = useState<Collection | null>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [hiddenOnly, setHiddenOnly] = useState(false);
  const [undoVideo, setUndoVideo] = useState<Video | null>(null);
  const [error, setError] = useState("");
  const [kind, setKind] = useState("topic");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [sessionAccess, setSessionAccess] = useState<SessionAccess | null>(null);
  const [requests, setRequests] = useState<ChildRequest[]>([]);
  const [discoverQuery, setDiscoverQuery] = useState("");
  const [boundary, setBoundary] = useState("");
  const [discoverResults, setDiscoverResults] = useState<DiscoveryResult[]>([]);
  const [discoverBusy, setDiscoverBusy] = useState(false);

  useEffect(() => {
    if (!sessionAccess?.enabled || !sessionAccess.expiresAt || !sessionAccess.allowed) return;
    const delay = Date.parse(sessionAccess.expiresAt) - Date.parse(sessionAccess.serverNow);
    const timer = window.setTimeout(
      () => setSessionAccess((current) => current ? { ...current, allowed: false, remainingSeconds: 0 } : current),
      Math.max(0, delay),
    );
    return () => window.clearTimeout(timer);
  }, [sessionAccess?.expiresAt, sessionAccess?.serverNow, sessionAccess?.enabled, sessionAccess?.allowed]);

  useEffect(() => {
    api<{ profile: Profile; videos: Video[]; collections: Collection[]; session_access?: SessionAccess }>(
      "/api/child/library",
    )
      .then((data) => {
        setProfile(data.profile);
        setVideos(data.videos);
        setCollections(data.collections);
        setSessionAccess(data.session_access || null);
        const firstTopic = data.profile.discovery_topics?.[0];
        const firstChannel = data.profile.discovery_channels?.[0];
        setBoundary(firstTopic ? `topic:${firstTopic}` : firstChannel ? `channel:${firstChannel.id}` : "");
        void api<{ requests: ChildRequest[] }>("/api/child/requests")
          .then((value) => setRequests(Array.isArray(value.requests) ? value.requests : []))
          .catch(() => {});
      })
      .catch((reason) => setError(reason.message));
  }, []);

  const filtered = useMemo(
    () =>
      videos.filter(
        (video) =>
          (hiddenOnly ? video.hidden : !video.hidden) &&
          (!collection || collection.video_ids.includes(video.id)) &&
          (!favoritesOnly || video.favorite) &&
          `${video.title} ${video.channel_title} ${(video.tags || []).join(" ")} ${(video.collections || []).map((item) => item.title).join(" ")}`
            .toLocaleLowerCase()
            .includes(query.trim().toLocaleLowerCase()),
      ),
    [videos, collection, favoritesOnly, hiddenOnly, query],
  );
  const continuing = videos
    .filter(
      (video) =>
        !video.hidden &&
        video.made_for_kids === false &&
        video.progress &&
        video.progress.current_time_seconds > 0 &&
        !video.progress.completed_at,
    )
    .sort((a, b) =>
      (b.progress?.updated_at || "").localeCompare(
        a.progress?.updated_at || "",
      ),
    );
  const recent = videos
    .filter((video) => !video.hidden)
    .sort((a, b) => (b.added_at || "").localeCompare(a.added_at || ""));
  const favorites = videos.filter((video) => video.favorite && !video.hidden);

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
      const data = await api<{ requests: ChildRequest[] }>("/api/child/requests");
      setRequests(Array.isArray(data.requests) ? data.requests : []);
    } catch (reason) {
      setError((reason as Error).message);
    } finally {
      setDiscoverBusy(false);
    }
  }

  if (!profile)
    return (
      <main id="main-content" className="child-shell">
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
    <main id="main-content" className="child-shell">
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
          aria-current={tab === "home" ? "page" : undefined}
          onClick={() => navigate("home")}
        >
          <Icon name="home" />
          Home
        </button>
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
      {sessionAccess?.enabled && !sessionAccess.allowed && tab !== "discover" ? (
        <section className="request-card time-up-card">
          <p className="eyebrow">WatchNest session</p>
          <h1>Time’s up for now</h1>
          <p>Ask Parent when you’re ready for more time.</p>
          <button className="button" onClick={switchProfile}>Choose profile</button>
        </section>
      ) : tab === "discover" ? (
        <section className="request-card discover-page">
          <div className="request-icon">
            <Icon name="search" width="30" />
          </div>
          <h1>{profile.discover_enabled ? "Discover" : "Ask Parent"}</h1>
          <p>Find something you’d like Parent to add.</p>
          {profile.discover_enabled && boundary && (
            <form onSubmit={searchDiscover}>
              <label>
                Search in
                <select className="field" value={boundary} onChange={(event) => setBoundary(event.target.value)}>
                  {(profile.discovery_topics || []).map((topic) => <option key={topic} value={`topic:${topic}`}>{topic}</option>)}
                  {(profile.discovery_channels || []).map((channel) => <option key={channel.id} value={`channel:${channel.id}`}>{channel.title}</option>)}
                </select>
              </label>
              <label>
                What do you want to find?
                <input className="field" type="search" maxLength={120} value={discoverQuery} onChange={(event) => setDiscoverQuery(event.target.value)} required />
              </label>
              <button className="button" disabled={discoverBusy || !discoverQuery.trim()}>{discoverBusy ? "Searching…" : "Search"}</button>
            </form>
          )}
          {!!discoverResults.length && (
            <div className="child-video-grid discover-results">
              {discoverResults.map((video) => {
                const existing = requests.find((item) => item.youtube_video_id === video.youtube_video_id);
                return (
                  <article className="child-video-card" key={video.youtube_video_id}>
                    <div className="child-artwork"><img src={video.thumbnail_url} alt="" /></div>
                    <div className="child-video-copy"><h3>{video.title}</h3><p>{video.channel_title}</p></div>
                    <button className="button" disabled={discoverBusy || existing?.status === "pending"} onClick={() => requestVideo(video)}>
                      {existing?.status === "pending" ? "Waiting for Parent" : existing?.status === "resolved" ? "Added to your library" : existing?.status === "dismissed" ? "Ask again" : "Ask Parent"}
                    </button>
                  </article>
                );
              })}
            </div>
          )}
          <details open={!profile.discover_enabled || !!message}>
            <summary>Ask Parent another way</summary>
          {sent ? (
            <div className="request-success" role="status">
              <Icon name="check" width="30" />
              <h2>Sent to Parent</h2>
              <button className="button-secondary" onClick={() => setSent(false)}>Send another</button>
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
              {requests.slice(0, 12).map((item) => <p key={item.id}><strong>{item.video_title || item.message}</strong><br /><span className="muted">{item.status === "pending" ? "Waiting for Parent" : item.status === "resolved" ? "Added to your library" : "Not added"}</span></p>)}
            </div>
          )}
        </section>
      ) : tab === "library" ? (
        <>
          <div className="child-page-title">
            <div>
              <p>Library</p>
              <h1>
                {collection
                  ? collection.title
                  : favoritesOnly
                    ? "Favorites"
                    : "All videos"}
              </h1>
            </div>
          </div>
          <div className="library-tools">
            <label className="child-search">
              <Icon name="search" width="20" />
              <span className="sr-only">Search your library</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search your library"
              />
            </label>
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
          </div>
          {!collection &&
            !favoritesOnly &&
            !hiddenOnly &&
            collections.length > 0 && (
              <section>
                <div className="row-heading">
                  <h2>Collections</h2>
                </div>
                <div className="collection-row">
                  {collections.map((item) => (
                    <button key={item.id} onClick={() => setCollection(item)}>
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
            <VideoGrid
              videos={filtered}
              onFavorite={toggleFavorite}
              onHide={toggleHidden}
            />
          ) : (
            <div className="child-empty">
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
                  ? "Try another word or ask Parent."
                  : favoritesOnly
                    ? "Tap the heart on a video to save it here."
                    : hiddenOnly
                      ? "Videos you hide will appear here."
                      : "Ask Parent to add something."}
              </p>
              {query && (
                <button className="button" onClick={askFromSearch}>
                  Ask Parent for “{query}”
                </button>
              )}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="child-welcome">
            <div>
              <p>Hi, {profile.display_name}</p>
              <h1>What would you like to watch?</h1>
            </div>
            <button
              className="search-shortcut"
              onClick={() => navigate("library")}
            >
              <Icon name="search" width="22" />
              Search
            </button>
          </div>
          {continuing.length > 0 && (
            <section>
              <div className="row-heading">
                <h2>Continue Watching</h2>
              </div>
              <VideoGrid
                videos={continuing.slice(0, 6)}
                onFavorite={toggleFavorite}
                onHide={toggleHidden}
              />
            </section>
          )}
          {favorites.length > 0 && (
            <section>
              <div className="row-heading">
                <h2>Favorites</h2>
                <button
                  onClick={() => {
                    setTab("library");
                    setFavoritesOnly(true);
                  }}
                >
                  See all
                </button>
              </div>
              <VideoGrid
                videos={favorites.slice(0, 6)}
                onFavorite={toggleFavorite}
                onHide={toggleHidden}
              />
            </section>
          )}
          {collections.length > 0 && (
            <section>
              <div className="row-heading">
                <h2>Collections</h2>
                <button onClick={() => navigate("library")}>See all</button>
              </div>
              <div className="collection-row">
                {collections.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setTab("library");
                      setCollection(item);
                    }}
                  >
                    <span>{item.video_ids.length} videos</span>
                    <strong>{item.title}</strong>
                    <small>{item.description || "Open Collection"}</small>
                  </button>
                ))}
              </div>
            </section>
          )}
          {videos.length ? (
            <section>
              <div className="row-heading">
                <h2>Recently Added</h2>
                <button onClick={() => navigate("library")}>See all</button>
              </div>
              <VideoGrid
                videos={recent.slice(0, 9)}
                onFavorite={toggleFavorite}
                onHide={toggleHidden}
              />
            </section>
          ) : (
            <div className="child-empty">
              <h2>Your library is ready</h2>
              <p>Ask Parent to add your first video.</p>
              <button className="button" onClick={() => navigate("discover")}>
                Ask Parent
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
