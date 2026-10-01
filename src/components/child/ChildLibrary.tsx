"use client";
import Link from "next/link";
import ProfileIdentity from "../ProfileIdentity";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  api,
  avatarColors,
  Collection,
  duration,
  Profile,
  Video,
} from "./model";
type Tab = "home" | "videos" | "shows" | "request";
function VideoGrid({ videos }: { videos: Video[] }) {
  return (
    <div className="video-grid">
      {videos.map((v) => (
        <Link
          className="video-card"
          key={v.id}
          href={`/watch/player/${encodeURIComponent(v.id)}`}
        >
          <div style={{ position: "relative" }}>
            {v.thumbnail_url ? (
              <img
                src={v.thumbnail_url}
                alt=""
                style={{
                  width: "100%",
                  aspectRatio: "16/9",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <div style={{ aspectRatio: "16/9", background: "#E0EEE5" }} />
            )}
            {v.duration_seconds > 0 && (
              <span
                style={{
                  position: "absolute",
                  right: 10,
                  bottom: 10,
                  background: "#19332C",
                  color: "white",
                  padding: "3px 8px",
                  borderRadius: 8,
                  fontSize: 13,
                }}
              >
                {duration(v.duration_seconds)}
              </span>
            )}
          </div>
          <div style={{ padding: "16px 18px" }}>
            <h3 style={{ fontSize: 18, lineHeight: 1.4, margin: "0 0 6px" }}>
              {v.title}
            </h3>
            <p className="muted" style={{ fontSize: 14, margin: 0 }}>
              {v.channel_title}
            </p>
            {v.made_for_kids === false &&
              v.progress &&
              !v.progress.completed_at &&
              v.progress.current_time_seconds > 0 && (
                <p className="muted" style={{ marginTop: 12 }}>
                  Resume at {duration(v.progress.current_time_seconds)}
                </p>
              )}
          </div>
        </Link>
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
  const [error, setError] = useState("");
  const [kind, setKind] = useState("topic");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api<{ profile: Profile; videos: Video[]; collections: Collection[] }>(
      "/api/child/library",
    )
      .then((d) => {
        setProfile(d.profile);
        setVideos(d.videos);
        setCollections(d.collections);
      })
      .catch((e) => {
        setError(e.message);
      });
  }, []);
  async function logout() {
    setBusy(true);
    try {
      await api("/api/auth/logout", {});
      router.replace("/watch");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }
  async function request(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/child/requests", { kind, message: message.trim() });
      setSent(true);
      setMessage("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  function navigate(t: Tab) {
    setTab(t);
    setCollection(null);
    setQuery("");
    setSent(false);
    setError("");
  }
  function ask() {
    setMessage(query.slice(0, 200));
    setTab("request");
    setSent(false);
  }
  const filtered = videos.filter(
    (v) =>
      (!collection || collection.video_ids.includes(v.id)) &&
      `${v.title} ${v.channel_title} ${(v.tags || []).join(" ")} ${(v.collections || []).map((c) => c.title).join(" ")}`
        .toLocaleLowerCase()
        .includes(query.trim().toLocaleLowerCase()),
  );
  const continuing = videos
    .filter(
      (v) =>
        v.made_for_kids === false &&
        v.progress &&
        v.progress.current_time_seconds > 0 &&
        !v.progress.completed_at,
    )
    .sort((a, b) =>
      (b.progress?.updated_at || "").localeCompare(
        a.progress?.updated_at || "",
      ),
    );
  const recent = [...videos].sort((a, b) =>
    (b.added_at || "").localeCompare(a.added_at || ""),
  );
  if (!profile)
    return (
      <main id="main-content" tabIndex={-1} className="shell">
        <Link className="brand" href="/watch">
          WatchNest
        </Link>
        <div className="panel" style={{ marginTop: 40 }}>
          {error ? (
            <>
              <h1>Let’s open your library again</h1>
              <p role="alert">{error}</p>
              <Link className="button" href="/watch">
                Go to sign in
              </Link>
            </>
          ) : (
            <p role="status">Finding your videos…</p>
          )}
        </div>
      </main>
    );
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={`shell ${profile.experience_mode === "simple" ? "simple-mode" : ""}`}
    >
      <header className="topbar">
        <Link className="brand" href="/watch/home">
          WatchNest
        </Link>
        <div className="form-row">
          <span
            className="avatar"
            style={{
              background: avatarColors[profile.color_key] || avatarColors.mint,
              width: 44,
              height: 44,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            aria-hidden="true"
          >
            <ProfileIdentity identity={profile.avatar_key} />
          </span>
          <strong>{profile.display_name}</strong>
          <button
            className="button button-quiet"
            onClick={logout}
            disabled={busy}
          >
            Sign out
          </button>
        </div>
      </header>
      <nav className="nav" aria-label="Your library">
        {(["home", "videos", "shows", "request"] as Tab[])
          .filter((t) => profile.experience_mode !== "simple" || t !== "shows")
          .map((t) => (
            <button
              className={`button ${tab === t ? "" : "button-quiet"}`}
              key={t}
              aria-current={tab === t ? "page" : undefined}
              onClick={() => navigate(t)}
            >
              {
                {
                  home: "Home",
                  videos: "My Videos",
                  shows: "Shows",
                  request: "Ask Parent",
                }[t]
              }
            </button>
          ))}
      </nav>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {tab === "request" ? (
        <section
          className="panel"
          style={{ maxWidth: 680, margin: "32px auto" }}
        >
          <p className="eyebrow">Something you’d like to watch?</p>
          <h1>Ask Parent</h1>
          <p className="muted">
            Tell your parent what you’re looking for. They’ll choose videos for
            your library.
          </p>
          {sent ? (
            <div role="status" className="notice">
              <h2>Your request is on its way!</h2>
              <p>Your parent can see it in their Inbox.</p>
              <button className="button" onClick={() => navigate("home")}>
                Back to my videos
              </button>
              <button
                className="button button-quiet"
                onClick={() => setSent(false)}
              >
                Ask for something else
              </button>
            </div>
          ) : (
            <form onSubmit={request}>
              <label className="field">
                I’m asking for
                <select value={kind} onChange={(e) => setKind(e.target.value)}>
                  <option value="topic">A topic or idea</option>
                  <option value="show">A show</option>
                  <option value="creator">A creator</option>
                  <option value="video">A specific video</option>
                </select>
              </label>
              <label className="field">
                What would you like?
                <textarea
                  rows={4}
                  maxLength={200}
                  aria-describedby="request-length"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="A Lego train video, drawing, or a favorite show…"
                  required
                />
              </label>
              <p id="request-length" className="muted">
                {message.length}/200 characters
              </p>
              <button className="button" disabled={busy || !message.trim()}>
                {busy ? "Sending…" : "Send to Parent"}
              </button>
            </form>
          )}
        </section>
      ) : (
        <>
          <div className="page-heading">
            <p className="eyebrow">Chosen just for you</p>
            <h1>
              {collection
                ? collection.title
                : tab === "home"
                  ? `Hello, ${profile.display_name}`
                  : tab === "shows"
                    ? "Your Shows & Collections"
                    : "My Videos"}
            </h1>
            <p className="muted">
              {tab === "home"
                ? "A good place to find your next favorite."
                : tab === "shows"
                  ? "Favorite videos, gathered together."
                  : "Search the videos in your own library."}
            </p>
          </div>
          {tab !== "shows" || collection ? (
            <label className="field" style={{ maxWidth: 620 }}>
              Search My Videos
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Try a video, show, or topic"
              />
            </label>
          ) : null}
          {collection && (
            <button
              className="button button-quiet"
              onClick={() => setCollection(null)}
            >
              ← All Shows
            </button>
          )}
          {tab === "shows" && !collection ? (
            <div className="grid grid-3">
              {collections.map((c) => (
                <button
                  key={c.id}
                  className="panel"
                  style={{
                    textAlign: "left",
                    cursor: "pointer",
                    minHeight: 150,
                  }}
                  onClick={() => setCollection(c)}
                >
                  <span className="badge">{c.video_ids.length} videos</span>
                  <h2>{c.title}</h2>
                  <p className="muted">
                    {c.description || "Open your collection"}
                  </p>
                </button>
              ))}
              {!collections.length && (
                <div className="empty">
                  <h2>Shows are coming</h2>
                  <p>
                    Your parent can gather videos into collections. Your videos
                    are ready in My Videos.
                  </p>
                  <button className="button" onClick={() => navigate("videos")}>
                    My Videos
                  </button>
                </div>
              )}
            </div>
          ) : query.trim() || tab === "videos" || collection ? (
            <section>
              <div className="section-heading">
                <h2>
                  {query.trim()
                    ? `${filtered.length} ${filtered.length === 1 ? "video" : "videos"} found`
                    : collection
                      ? "Videos in this collection"
                      : "All your videos"}
                </h2>
              </div>
              {filtered.length ? (
                <VideoGrid videos={filtered} />
              ) : (
                <div className="empty">
                  <h2>
                    {query
                      ? "No videos found yet"
                      : "Your library is ready for its first video"}
                  </h2>
                  <p className="muted">
                    Ask your parent to add something you’d enjoy.
                  </p>
                  <button className="button" onClick={ask}>
                    Ask Parent
                  </button>
                </div>
              )}
            </section>
          ) : videos.length ? (
            <>
              {continuing.length > 0 && (
                <section style={{ marginBottom: 32 }}>
                  <div className="section-heading">
                    <h2>Continue Watching</h2>
                  </div>
                  <VideoGrid
                    videos={continuing.slice(
                      0,
                      profile.experience_mode === "simple" ? 3 : 6,
                    )}
                  />
                </section>
              )}
              <section>
                <div className="section-heading">
                  <h2>
                    {profile.experience_mode === "simple"
                      ? "Pick a video"
                      : "Recently Added"}
                  </h2>
                  <button
                    className="button button-quiet"
                    onClick={() => navigate("videos")}
                  >
                    See all videos →
                  </button>
                </div>
                <VideoGrid
                  videos={recent.slice(
                    0,
                    profile.experience_mode === "simple" ? 6 : 9,
                  )}
                />
              </section>
              {profile.experience_mode === "simple" &&
                collections.length > 0 && (
                  <section>
                    <div className="section-heading">
                      <h2>Your Shows</h2>
                    </div>
                    <div className="grid grid-2">
                      {collections.slice(0, 4).map((c) => (
                        <button
                          className="panel"
                          key={c.id}
                          onClick={() => {
                            setTab("shows");
                            setCollection(c);
                          }}
                        >
                          <h3>{c.title}</h3>
                          <span className="muted">
                            {c.video_ids.length} videos
                          </span>
                        </button>
                      ))}
                    </div>
                  </section>
                )}
            </>
          ) : (
            <div className="empty">
              <h2>Your next favorite is on its way</h2>
              <p className="muted">
                Your parent will add videos here. Have an idea?
              </p>
              <button className="button" onClick={ask}>
                Ask Parent
              </button>
            </div>
          )}
        </>
      )}
    </main>
  );
}
