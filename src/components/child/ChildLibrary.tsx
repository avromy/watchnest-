"use client";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Collection, duration, Profile, Video } from "./model";
import { normalizeYouTubeThumbnailUrl } from "@/lib/youtube-thumbnail";
import ProfileImage from "../ProfileImage";
import Icon from "../ui/Icon";

type Tab = "home" | "library" | "request";

function VideoGrid({
  videos,
  onFavorite,
}: {
  videos: Video[];
  onFavorite: (video: Video) => void;
}) {
  return (
    <div className="child-video-grid">
      {videos.map((video) => (
        <article className="child-video-card" key={video.id}>
          <Link
            href={`/watch/player/${encodeURIComponent(video.id)}`}
            aria-label={`Play ${video.title}`}
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
  const [error, setError] = useState("");
  const [kind, setKind] = useState("topic");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ profile: Profile; videos: Video[]; collections: Collection[] }>(
      "/api/child/library",
    )
      .then((data) => {
        setProfile(data.profile);
        setVideos(data.videos);
        setCollections(data.collections);
      })
      .catch((reason) => setError(reason.message));
  }, []);

  const filtered = useMemo(
    () =>
      videos.filter(
        (video) =>
          (!collection || collection.video_ids.includes(video.id)) &&
          (!favoritesOnly || video.favorite) &&
          `${video.title} ${video.channel_title} ${(video.tags || []).join(" ")} ${(video.collections || []).map((item) => item.title).join(" ")}`
            .toLocaleLowerCase()
            .includes(query.trim().toLocaleLowerCase()),
      ),
    [videos, collection, favoritesOnly, query],
  );
  const continuing = videos
    .filter(
      (video) =>
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
  const recent = [...videos].sort((a, b) =>
    (b.added_at || "").localeCompare(a.added_at || ""),
  );
  const favorites = videos.filter((video) => video.favorite);

  function navigate(next: Tab) {
    setTab(next);
    setCollection(null);
    setFavoritesOnly(false);
    setQuery("");
    setSent(false);
    setError("");
  }
  function askFromSearch() {
    setMessage(query.slice(0, 200));
    setTab("request");
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
          aria-current={tab === "request" ? "page" : undefined}
          onClick={() => navigate("request")}
        >
          <Icon name="plus" />
          Ask Parent
        </button>
      </nav>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {tab === "request" ? (
        <section className="request-card">
          <div className="request-icon">
            <Icon name="plus" width="30" />
          </div>
          <h1>Ask Parent</h1>
          <p>What would you like added to your library?</p>
          {sent ? (
            <div className="request-success" role="status">
              <Icon name="check" width="30" />
              <h2>Sent to Parent</h2>
              <button className="button" onClick={() => navigate("home")}>
                Back home
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
                setCollection(null);
              }}
            >
              <Icon name="heart" width="19" /> Favorites
            </button>
          </div>
          {!collection && !favoritesOnly && collections.length > 0 && (
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
          {(collection || favoritesOnly) && (
            <button
              className="back-button"
              onClick={() => {
                setCollection(null);
                setFavoritesOnly(false);
              }}
            >
              ← All videos
            </button>
          )}
          {filtered.length ? (
            <VideoGrid videos={filtered} onFavorite={toggleFavorite} />
          ) : (
            <div className="child-empty">
              <h2>
                {query
                  ? "Nothing found"
                  : favoritesOnly
                    ? "No Favorites yet"
                    : "Nothing here yet"}
              </h2>
              <p>
                {query
                  ? "Try another word or ask Parent."
                  : favoritesOnly
                    ? "Tap the heart on a video to save it here."
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
              />
            </section>
          ) : (
            <div className="child-empty">
              <h2>Your library is ready</h2>
              <p>Ask Parent to add your first video.</p>
              <button className="button" onClick={() => navigate("request")}>
                Ask Parent
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
