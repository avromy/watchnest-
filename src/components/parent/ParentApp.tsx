"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  ReactNode,
  FormEvent,
} from "react";
import styles from "./Parent.module.css";
import ProfileIdentity from "../ProfileIdentity";
import type {
  Profile,
  LibraryVideo as Video,
  Collection,
  Request,
} from "@/types/product";
import { normalizeYouTubeThumbnailUrl } from "@/lib/youtube-thumbnail";
import YouTubeEmbed from "../YouTubeEmbed";
import ProfileImage from "../ProfileImage";
import Icon, { type IconName } from "../ui/Icon";

type Dashboard = {
  profiles: Profile[];
  videos: Video[];
  collections: Collection[];
  requests: Request[];
  familyCode: string;
  workflow: {
    approvedVideos: number;
    activeChildren: number;
    assignedVideos: number;
    unassignedVideos: number;
    openRequests: number;
    byChild: {
      profile_id: string;
      assignedVideos: number;
      openRequests: number;
    }[];
    source: string;
  };
  attention: { id: string; title: string; detail: string }[];
};
async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(data.error || "Something went wrong. Please try again.");
  return data as T;
}
const Context = createContext<{
  data: Dashboard;
  reload: () => Promise<void>;
  act: (path: string, method: string, body?: unknown) => Promise<boolean>;
  busy: boolean;
} | null>(null);
function useParent() {
  const value = useContext(Context);
  if (!value) throw new Error("Parent session unavailable");
  return value;
}
export function ParentShell({ children }: { children: ReactNode }) {
  const router = useRouter(),
    path = usePathname();
  const [data, setData] = useState<Dashboard | null>(null),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [ready, setReady] = useState(false);
  async function reload() {
    setData(await api<Dashboard>("/api/parent/dashboard"));
  }
  useEffect(() => {
    let active = true;
    api<{ role: string | null }>("/api/session")
      .then(async (session) => {
        if (session.role !== "parent") {
          router.replace("/login");
          return;
        }
        const result = await api<Dashboard>("/api/parent/dashboard");
        if (active) {
          setData(result);
          setReady(true);
        }
      })
      .catch((e) => {
        if (active) {
          setError(e.message);
          setReady(true);
        }
      });
    return () => {
      active = false;
    };
  }, [router]);
  async function act(endpoint: string, method: string, body?: unknown) {
    setBusy(true);
    setError("");
    try {
      await api(endpoint, method, body);
      await reload();
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
      return false;
    } finally {
      setBusy(false);
    }
  }
  const nav: [string, string, IconName][] = [
    ["Dashboard", "/parent/dashboard", "home"],
    ["Children", "/parent/children", "children"],
    ["Add Videos", "/parent/add-video", "plus"],
    ["Library", "/parent/library", "library"],
    ["Collections", "/parent/collections", "collection"],
    ["Inbox", "/parent/inbox", "inbox"],
    ["Controls", "/parent/controls", "controls"],
    ["Settings", "/parent/settings", "settings"],
  ];
  return (
    <div className="shell">
      {data && (
        <>
          <header className="topbar">
            <Link href="/parent/dashboard" className="brand">
              <img src="/icon.svg" alt="" width="36" height="36" /> WatchNest{" "}
              <span className="badge">Parent</span>
            </Link>
            <button
              className="button-quiet"
              onClick={async () => {
                try {
                  await api("/api/auth/parent-lock", "POST", {});
                  router.replace("/watch");
                } catch (e) {
                  setError(
                    e instanceof Error
                      ? e.message
                      : "Could not switch profiles. Try again.",
                  );
                }
              }}
            >
              <Icon name="switch" width="18" /> Switch profile
            </button>
          </header>
          <nav
            className={`nav ${styles.navigation}`}
            aria-label="Parent navigation"
          >
            {nav.map(([label, href, icon]) => (
              <Link
                key={href}
                href={href}
                aria-current={path === href ? "page" : undefined}
              >
                <Icon name={icon} width="18" /> {label}
                {label === "Inbox" &&
                data.requests.filter((r) => r.status === "pending").length > 0
                  ? ` (${data.requests.filter((r) => r.status === "pending").length})`
                  : ""}
              </Link>
            ))}
          </nav>
        </>
      )}
      <main id="main-content" className={styles.main}>
        {error && (
          <div className="error" role="alert">
            {error}{" "}
            {!data && (
              <button
                className="button-secondary"
                onClick={() => window.location.reload()}
              >
                Try again
              </button>
            )}
          </div>
        )}
        {!ready && (
          <div className="panel" role="status">
            Opening your family space…
          </div>
        )}
        {data && (
          <Context.Provider value={{ data, reload, act, busy }}>
            {children}
          </Context.Provider>
        )}
      </main>
    </div>
  );
}
function Heading({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className={`page-heading ${styles.heading}`}>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="muted">{description}</p>
      </div>
      {action}
    </div>
  );
}
function minutes(seconds: number) {
  return `${Math.round(seconds / 60)} min`;
}
function Choices({
  profiles,
  value,
  setValue,
}: {
  profiles: Profile[];
  value: string[];
  setValue: (v: string[]) => void;
}) {
  return (
    <fieldset className={styles.choices}>
      <legend>Who can watch?</legend>
      <button
        type="button"
        className="button-quiet"
        onClick={() => setValue(profiles.map((p) => p.id))}
      >
        Select all children
      </button>
      {profiles.map((p) => (
        <label key={p.id}>
          <input
            type="checkbox"
            checked={value.includes(p.id)}
            onChange={() =>
              setValue(
                value.includes(p.id)
                  ? value.filter((id) => id !== p.id)
                  : [...value, p.id],
              )
            }
          />
          {p.display_name}
        </label>
      ))}
    </fieldset>
  );
}
function Thumb({ video }: { video: Video }) {
  const thumbnail = normalizeYouTubeThumbnailUrl(video.thumbnail_url);
  return (
    <div className={styles.thumbnail}>
      {thumbnail ? (
        <img src={thumbnail} alt="" loading="lazy" />
      ) : (
        <span>Video thumbnail unavailable</span>
      )}
      <span>{minutes(video.duration_seconds)}</span>
    </div>
  );
}
export function Overview() {
  const { data } = useParent();
  const { workflow } = data;
  const pending = data.requests.filter((r) => r.status === "pending");
  return (
    <>
      <Heading
        eyebrow="Dashboard"
        title="Family overview"
        description="Requests, library health, and each child’s approved content."
        action={
          <Link className="button" href="/parent/add-video">
            Add videos
          </Link>
        }
      />
      {(pending.length > 0 || data.attention.length > 0) && (
        <section
          className={`panel ${styles.attention}`}
          aria-label="Needs your attention"
        >
          <div>
            <p className="eyebrow">Needs your attention</p>
            <h2>
              {pending.length} child requests · {data.attention.length} library
              issues
            </h2>
            <p className="muted">
              {pending[0]
                ? `${pending[0].display_name || "A child"} asked: ${pending[0].message}`
                : data.attention[0]?.title}
            </p>
          </div>
          <Link className="button" href="/parent/inbox">
            Review Inbox
          </Link>
        </section>
      )}
      <section
        className={styles.dashboardSection}
        aria-labelledby="library-overview-title"
      >
        <div>
          <h2 id="library-overview-title">Library and requests</h2>
        </div>
        <div className={`stats ${styles.stats}`}>
          <div className="stat">
            <span className="muted">Approved videos</span>
            <strong>{workflow.approvedVideos}</strong>
            <small className="muted">
              Individually approved in your library
            </small>
          </div>
          <div className="stat">
            <span className="muted">Shared with children</span>
            <strong>{workflow.assignedVideos}</strong>
            <small className="muted">Available to at least one child</small>
          </div>
          <div className="stat">
            <span className="muted">Not shared yet</span>
            <strong>{workflow.unassignedVideos}</strong>
            <small className="muted">Approved, with no child access yet</small>
            {workflow.unassignedVideos > 0 && (
              <Link href="/parent/library">Choose who can watch</Link>
            )}
          </div>
          <div className="stat">
            <span className="muted">Open child requests</span>
            <strong>{workflow.openRequests}</strong>
            <small className="muted">Waiting for your review</small>
            {workflow.openRequests > 0 && (
              <Link href="/parent/inbox">Review requests</Link>
            )}
          </div>
        </div>
        <div className="grid grid-2">
          {data.profiles.map((profile) => {
            const library = workflow.byChild.find(
              (child) => child.profile_id === profile.id,
            );
            return (
              <section
                className="panel"
                key={profile.id}
                aria-label={`${profile.display_name} library status`}
              >
                <div className={styles.row}>
                  <h3>{profile.display_name}</h3>
                  <ProfileImage
                    name={profile.display_name}
                    avatar={profile.avatar_key}
                    photoUrl={profile.photo_url}
                    size="small"
                  />
                </div>
                <p className={styles.libraryCount}>
                  <strong>{library?.assignedVideos ?? 0}</strong> approved
                  videos in their library
                </p>
                <p className="muted">
                  {(library?.openRequests ?? 0) > 0
                    ? `${library!.openRequests} open request${library!.openRequests === 1 ? "" : "s"}`
                    : "No open requests"}{" "}
                  ·{" "}
                  {profile.pin_enabled
                    ? "PIN protection on"
                    : "PIN protection off"}
                </p>
                {(library?.assignedVideos ?? 0) === 0 && (
                  <p className="muted">
                    Choose a first video to give them something to explore.
                  </p>
                )}
                <Link
                  className="button-secondary"
                  href={
                    (library?.assignedVideos ?? 0) === 0
                      ? "/parent/add-video"
                      : "/parent/children"
                  }
                >
                  {(library?.assignedVideos ?? 0) === 0
                    ? "Add their first video"
                    : `View ${profile.display_name}`}
                </Link>
              </section>
            );
          })}
        </div>
      </section>
    </>
  );
}
export function AddVideos() {
  const { data, act, busy } = useParent();
  const previewReturnFocus = useRef<HTMLButtonElement | null>(null);
  const [query, setQuery] = useState(""),
    [urls, setUrls] = useState(""),
    [results, setResults] = useState<Video[]>([]),
    [resultType, setResultType] = useState<"video" | "channel" | "playlist">(
      "video",
    ),
    [discoveries, setDiscoveries] = useState<
      {
        id: string;
        type: "channel" | "playlist";
        title: string;
        description: string;
        thumbnail_url: string;
        channel_title: string;
      }[]
    >([]),
    [source, setSource] = useState<{
      id: string;
      type: "channel" | "playlist";
      title: string;
    } | null>(null),
    [selected, setSelected] = useState<string[]>([]),
    [profiles, setProfiles] = useState<string[]>([]),
    [collection, setCollection] = useState(""),
    [preview, setPreview] = useState<Video | null>(null),
    [previewLoaded, setPreviewLoaded] = useState(false),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [message, setMessage] = useState(""),
    [searched, setSearched] = useState(false);
  function closePreview() {
    setPreview(null);
    requestAnimationFrame(() => previewReturnFocus.current?.focus());
  }
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get("q");
    if (requested) setQuery(requested);
  }, []);
  async function find(e: FormEvent, lookup: boolean) {
    e.preventDefault();
    const links = urls
      .split(/[\n,]+/)
      .map((v) => v.trim())
      .filter(Boolean);
    if (lookup && links.length > 20) {
      setError("Please look up up to 20 video links at a time.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    setSearched(true);
    try {
      const result = lookup
        ? await api<{
            videos: Video[];
            errors: { url: string; error: string }[];
          }>("/api/parent/videos/lookup", "POST", { urls: links })
        : await api<{ videos?: Video[]; items?: typeof discoveries }>(
            `/api/parent/videos/search?q=${encodeURIComponent(query)}&type=${source?.type || resultType}${source ? `&source=${encodeURIComponent(source.id)}` : ""}`,
          );
      if (!lookup && !source && resultType !== "video") {
        setDiscoveries("items" in result ? result.items || [] : []);
        setResults([]);
        setSelected([]);
        return;
      }
      setResults(
        Array.from(
          new Map(
            (result.videos || []).map((v) => [v.youtube_video_id, v]),
          ).values(),
        ),
      );
      setDiscoveries([]);
      setSelected([]);
      if ("errors" in result)
        setError(
          (result.errors as { url: string; error: string }[])
            .map((v) => `${v.url}: ${v.error}`)
            .join(" · "),
        );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not find videos.");
    } finally {
      setLoading(false);
    }
  }
  async function approve() {
    if (
      await act("/api/parent/videos", "POST", {
        youtube_video_ids: selected,
        profile_ids: profiles,
        ...(collection ? { collection_id: collection } : {}),
      })
    ) {
      setMessage(
        `${selected.length} individually selected video${selected.length === 1 ? "" : "s"} approved.`,
      );
      setSelected([]);
    }
  }
  return (
    <>
      <Heading
        eyebrow="Add Videos"
        title="Find videos"
        description="Search or paste links, preview each video, then choose who can watch."
      />
      <div className="grid grid-2">
        <form className="panel" onSubmit={(e) => find(e, false)}>
          <h2>Search YouTube</h2>
          <div className={styles.segmented} aria-label="Search type">
            {(["video", "channel", "playlist"] as const).map((type) => (
              <button
                key={type}
                type="button"
                aria-pressed={!source && resultType === type}
                onClick={() => {
                  setResultType(type);
                  setSource(null);
                  setResults([]);
                  setDiscoveries([]);
                }}
              >
                {type === "video"
                  ? "Videos"
                  : type === "channel"
                    ? "Channels"
                    : "Playlists"}
              </button>
            ))}
          </div>
          {source && (
            <div className="notice">
              <strong>Browsing {source.title}</strong>
              <button
                type="button"
                className="button-quiet"
                onClick={() => {
                  setSource(null);
                  setResults([]);
                }}
              >
                Back to search
              </button>
            </div>
          )}
          <label htmlFor="yt-query">
            {source ? "Search within this source (optional)" : "Search"}
          </label>
          <div className="form-row">
            <input
              className="field"
              id="yt-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required={!source}
              maxLength={200}
            />
            <button
              className="button"
              disabled={loading || (!source && !query.trim())}
            >
              Search
            </button>
          </div>
        </form>
        <form className="panel" onSubmit={(e) => find(e, true)}>
          <h2>Already have links?</h2>
          <label htmlFor="yt-urls">Paste one YouTube video link per line</label>
          <textarea
            className="field"
            id="yt-urls"
            value={urls}
            onChange={(e) => setUrls(e.target.value)}
            rows={3}
            required
            placeholder="https://www.youtube.com/watch?v=…"
          />
          <button
            className="button-secondary"
            disabled={loading || !urls.trim()}
          >
            Look up videos
          </button>
        </form>
      </div>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      {message && (
        <div className="notice" role="status">
          {message}
        </div>
      )}
      {loading && <p role="status">Finding real video details…</p>}
      {searched &&
        !loading &&
        !results.length &&
        !discoveries.length &&
        !error && (
          <div className="empty">
            <h2>No matching videos</h2>
            <p>Try another search or paste a specific video link.</p>
          </div>
        )}
      {!!discoveries.length && (
        <div className="grid grid-3">
          {discoveries.map((item) => (
            <article className="panel" key={item.id}>
              {item.thumbnail_url && (
                <img
                  className={styles.discoveryImage}
                  src={item.thumbnail_url}
                  alt=""
                />
              )}
              <p className="eyebrow">{item.type}</p>
              <h2>{item.title}</h2>
              <p className="muted">{item.channel_title || item.description}</p>
              <button
                className="button"
                onClick={() => {
                  setSource({
                    id: item.id,
                    type: item.type,
                    title: item.title,
                  });
                  setResultType(item.type);
                  setQuery("");
                  setDiscoveries([]);
                  setSearched(false);
                }}
              >
                Browse videos
              </button>
            </article>
          ))}
        </div>
      )}
      {!!results.length && (
        <>
          <section className="panel">
            <Choices
              profiles={data.profiles}
              value={profiles}
              setValue={setProfiles}
            />
            <label htmlFor="add-collection">Collection (optional)</label>
            <select
              id="add-collection"
              className="field"
              value={collection}
              onChange={(e) => setCollection(e.target.value)}
            >
              <option value="">No collection</option>
              {data.collections.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
            <button
              className="button"
              disabled={!selected.length || !profiles.length || busy}
              onClick={approve}
            >
              Approve {selected.length || ""} selected videos
            </button>
          </section>
          <div className="video-grid">
            {results.map((v) => (
              <article className="video-card" key={v.youtube_video_id}>
                <Thumb video={v} />
                <div className={styles.cardBody}>
                  <h3>{v.title}</h3>
                  <p className="muted">{v.channel_title}</p>
                  {data.videos.some(
                    (existing) =>
                      existing.youtube_video_id === v.youtube_video_id,
                  ) && (
                    <p className="notice">
                      <strong>Already approved</strong>
                      <br />
                      {data.profiles
                        .filter((profile) =>
                          data.videos
                            .find(
                              (existing) =>
                                existing.youtube_video_id ===
                                v.youtube_video_id,
                            )
                            ?.profile_ids?.includes(profile.id),
                        )
                        .map((profile) => profile.display_name)
                        .join(" · ") || "Not shared yet"}
                    </p>
                  )}
                  <label className={styles.check}>
                    <input
                      type="checkbox"
                      checked={selected.includes(v.youtube_video_id)}
                      onChange={() =>
                        setSelected(
                          selected.includes(v.youtube_video_id)
                            ? selected.filter((id) => id !== v.youtube_video_id)
                            : [...selected, v.youtube_video_id],
                        )
                      }
                    />
                    Select this video
                  </label>
                  <button
                    className="button-secondary"
                    onClick={(event) => {
                      previewReturnFocus.current = event.currentTarget;
                      setPreviewLoaded(false);
                      setPreview(v);
                    }}
                  >
                    Preview
                  </button>
                </div>
              </article>
            ))}
          </div>
        </>
      )}
      {preview && (
        <div
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") closePreview();
            if (e.key === "Tab") {
              const controls = Array.from(
                e.currentTarget.querySelectorAll<HTMLElement>("button, iframe"),
              );
              const first = controls[0],
                last = controls[controls.length - 1];
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last?.focus();
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first?.focus();
              }
            }
          }}
        >
          <section className="panel">
            <div className={styles.row}>
              <h2 id="preview-title">{preview.title}</h2>
              <button
                className="button-secondary"
                autoFocus
                onClick={closePreview}
              >
                Close preview
              </button>
            </div>
            <YouTubeEmbed
              className={styles.player}
              videoId={preview.youtube_video_id}
              title={preview.title}
              onLoad={() => setPreviewLoaded(true)}
            />
            <p role="status" className="muted">
              {previewLoaded
                ? "YouTube’s player frame loaded."
                : "Loading YouTube’s player…"}
            </p>
            <p className="notice">
              Press Play and confirm this exact video starts before approving
              it. A loaded player alone is not playback proof.
            </p>
            <p className="muted">
              Source: {preview.channel_title || "YouTube"}. Audience status:{" "}
              {preview.made_for_kids === true
                ? "Made for Kids — WatchNest resume will stay off"
                : preview.made_for_kids === false
                  ? "not marked Made for Kids"
                  : "not confirmed — WatchNest resume will stay off"}
              .
            </p>
            <p className="muted">
              Parent preview uses YouTube’s player. YouTube controls its
              branding, links and some recommendations. If YouTube shows an
              availability or embedding message, do not approve the video.
            </p>
          </section>
        </div>
      )}
    </>
  );
}
export function Library() {
  const { data, act, busy } = useParent();
  const previewReturnFocus = useRef<HTMLButtonElement | null>(null);
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState(""),
    [selected, setSelected] = useState<string[]>([]),
    [profiles, setProfiles] = useState<string[]>([]),
    [edit, setEdit] = useState<Video | null>(null),
    [preview, setPreview] = useState<Video | null>(null),
    [previewLoaded, setPreviewLoaded] = useState(false),
    [tags, setTags] = useState("");
  const videos = data.videos.filter(
    (v) =>
      (!filter || v.profile_ids?.includes(filter)) &&
      `${v.title} ${v.channel_title} ${v.tags?.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  async function save() {
    for (const id of selected) {
      if (
        !(await act("/api/parent/videos", "PATCH", {
          video_id: id,
          profile_ids: profiles,
          ...(edit
            ? {
                tags: tags
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean),
              }
            : {}),
        }))
      )
        return;
    }
    setSelected([]);
    setEdit(null);
  }
  function closePreview() {
    setPreview(null);
    requestAnimationFrame(() => previewReturnFocus.current?.focus());
  }
  return (
    <>
      <Heading
        eyebrow="Your approved library"
        title="Good videos, easy to find."
        description="Organize the library, preview playback, and control exactly who can watch each video."
        action={
          <Link className="button" href="/parent/add-video">
            Add videos
          </Link>
        }
      />
      <section className="panel">
        <div className="form-row">
          <label className={styles.grow}>
            Search approved videos
            <input
              type="search"
              className="field"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Title, creator or tag"
            />
          </label>
          <label>
            Child library
            <select
              className="field"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All children</option>
              {data.profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.display_name}
                </option>
              ))}
            </select>
          </label>
        </div>
        {selected.length > 0 && (
          <div className={styles.bulk}>
            <h3>{selected.length} selected · Choose who can watch</h3>
            <Choices
              profiles={data.profiles}
              value={profiles}
              setValue={setProfiles}
            />
            <p className="muted">
              Only the children selected here will retain access. Selecting none
              removes all child access.
            </p>
            {edit && (
              <label>
                Tags, separated by commas
                <input
                  className="field"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </label>
            )}
            <button className="button" disabled={busy} onClick={save}>
              Save
            </button>{" "}
            <button
              className="button-quiet"
              onClick={() => {
                setSelected([]);
                setEdit(null);
              }}
            >
              Cancel selection
            </button>
          </div>
        )}
      </section>
      {videos.length ? (
        <div className="video-grid">
          {videos.map((v) => (
            <article className="video-card" key={v.id}>
              <Thumb video={v} />
              <div className={styles.cardBody}>
                <label className={styles.check}>
                  <input
                    type="checkbox"
                    checked={selected.includes(v.id)}
                    onChange={() => {
                      setEdit(null);
                      setSelected(
                        selected.includes(v.id)
                          ? selected.filter((id) => id !== v.id)
                          : [...selected, v.id],
                      );
                    }}
                  />
                  <strong>{v.title}</strong>
                </label>
                <p className="muted">{v.channel_title}</p>
                <p>
                  {data.profiles
                    .filter((p) => v.profile_ids?.includes(p.id))
                    .map((p) => p.display_name)
                    .join(" · ") || "Not shared with a child"}
                </p>
                <div className={styles.row}>
                  <button
                    className="button-secondary"
                    onClick={(event) => {
                      previewReturnFocus.current = event.currentTarget;
                      setPreviewLoaded(false);
                      setPreview(v);
                    }}
                  >
                    Preview
                  </button>
                  <button
                    className="button-secondary"
                    onClick={() => {
                      setEdit(v);
                      setSelected([v.id]);
                      setProfiles(v.profile_ids || []);
                      setTags(v.tags?.join(", ") || "");
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                  >
                    Manage
                  </button>
                  <button
                    className="button-quiet"
                    disabled={busy}
                    onClick={() => {
                      if (
                        window.confirm(
                          `Remove “${v.title}” from every child's library?`,
                        )
                      )
                        void act("/api/parent/videos", "DELETE", {
                          video_id: v.id,
                        });
                    }}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty">
          <h2>{data.videos.length ? "No matches" : "A fresh start"}</h2>
          <p>
            {data.videos.length
              ? "Try a different search or child."
              : "Add your first approved video to begin building their libraries."}
          </p>
          <Link className="button" href="/parent/add-video">
            Find videos
          </Link>
        </div>
      )}
      {preview && (
        <div
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="library-preview-title"
          onKeyDown={(e) => {
            if (e.key === "Escape") closePreview();
            if (e.key === "Tab") {
              const controls = Array.from(
                e.currentTarget.querySelectorAll<HTMLElement>("button, iframe"),
              );
              const first = controls[0],
                last = controls[controls.length - 1];
              if (e.shiftKey && document.activeElement === first) {
                e.preventDefault();
                last?.focus();
              } else if (!e.shiftKey && document.activeElement === last) {
                e.preventDefault();
                first?.focus();
              }
            }
          }}
        >
          <section className="panel">
            <div className={styles.row}>
              <h2 id="library-preview-title">{preview.title}</h2>
              <button
                className="button-secondary"
                autoFocus
                onClick={closePreview}
              >
                Close preview
              </button>
            </div>
            <YouTubeEmbed
              className={styles.player}
              videoId={preview.youtube_video_id}
              title={preview.title}
              onLoad={() => setPreviewLoaded(true)}
            />
            <p role="status" className="muted">
              {previewLoaded
                ? "YouTube’s player frame loaded."
                : "Loading YouTube’s player…"}
            </p>
            <p className="notice">
              Press Play and confirm the approved video still starts before
              relying on it. A loaded player alone is not playback proof.
            </p>
            <p className="muted">
              Source: {preview.channel_title || "YouTube"}. Audience status:{" "}
              {preview.made_for_kids === true
                ? "Made for Kids — progress isn’t saved"
                : preview.made_for_kids === false
                  ? "not marked Made for Kids"
                  : "not confirmed — progress isn’t saved"}
              .
            </p>
            <p className="muted">
              A loaded player is not proof that the video plays in every region.
              If YouTube shows an availability or embedding message, do not
              share this video. Child access still follows “Who can watch?”
              on the card.
            </p>
          </section>
        </div>
      )}
    </>
  );
}
export function Collections() {
  const { data, act, busy } = useParent();
  const [id, setId] = useState(""),
    [title, setTitle] = useState(""),
    [description, setDescription] = useState(""),
    [ids, setIds] = useState<string[]>([]),
    [profileIds, setProfileIds] = useState<string[]>([]),
    [saved, setSaved] = useState(false);
  async function submit(e: FormEvent) {
    e.preventDefault();
    if (
      await act("/api/parent/collections", id ? "PATCH" : "POST", {
        ...(id ? { id } : {}),
        title,
        description,
        video_ids: ids,
      })
    ) {
      setId("");
      setTitle("");
      setDescription("");
      setIds([]);
      setSaved(true);
    }
  }
  return (
    <>
      <Heading
        eyebrow="Collections"
        title="Organize the library"
        description="Group approved videos by show, creator, topic, or anything your family recognizes."
      />
      <div className="grid grid-2">
        <section className="panel">
          <h2>Your collections</h2>
          {data.collections.length ? (
            data.collections.map((c) => (
              <div className={styles.collection} key={c.id}>
                <h3>{c.title}</h3>
                <p className="muted">
                  {c.description || "A family collection"} ·{" "}
                  {c.video_ids.length} videos
                </p>
                <button
                  className="button-secondary"
                  onClick={() => {
                    setId(c.id);
                    setTitle(c.title);
                    setDescription(c.description || "");
                    setIds(c.video_ids);
                    setSaved(false);
                  }}
                >
                  Edit collection
                </button>
                <Choices
                  profiles={data.profiles}
                  value={profileIds}
                  setValue={setProfileIds}
                />
                <button
                  className="button-quiet"
                  disabled={busy || !profileIds.length}
                  onClick={async () => {
                    if (
                      await act("/api/parent/collections/assign", "POST", {
                        collection_id: c.id,
                        profile_ids: profileIds,
                      })
                    )
                      setSaved(true);
                  }}
                >
                  Share collection
                </button>
              </div>
            ))
          ) : (
            <p className="muted">
              Create a Collection for a show, creator, topic, or family
              favorite.
            </p>
          )}
        </section>
        <form className="panel" onSubmit={submit}>
          <h2>{id ? "Edit collection" : "Create a collection"}</h2>
          {saved && (
            <p className="notice" role="status">
              Collection saved.
            </p>
          )}
          <label>
            Name
            <input
              className="field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
            />
          </label>
          <label>
            Description (optional)
            <input
              className="field"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={300}
            />
          </label>
          <fieldset className={styles.videoChoices}>
            <legend>Approved videos</legend>
            {data.videos.map((v) => (
              <label key={v.id}>
                <input
                  type="checkbox"
                  checked={ids.includes(v.id)}
                  onChange={() =>
                    setIds(
                      ids.includes(v.id)
                        ? ids.filter((id) => id !== v.id)
                        : [...ids, v.id],
                    )
                  }
                />
                {v.title}
              </label>
            ))}
            {!data.videos.length && (
              <p className="muted">
                Approve some videos first. You can create an empty collection
                now.
              </p>
            )}
          </fieldset>
          <button className="button" disabled={busy}>
            Save collection
          </button>
          {id && (
            <button
              className="button-quiet"
              type="button"
              onClick={() => {
                setId("");
                setTitle("");
                setDescription("");
                setIds([]);
              }}
            >
              Cancel edit
            </button>
          )}
        </form>
      </div>
    </>
  );
}
function ChildSettings({ profile }: { profile: Profile }) {
  const { act, busy, reload } = useParent();
  const router = useRouter();
  const [pin, setPin] = useState(""),
    [confirmPin, setConfirmPin] = useState(""),
    [enabled, setEnabled] = useState(profile.pin_enabled),
    [avatar, setAvatar] = useState(profile.avatar_key || "leaf"),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [photoBusy, setPhotoBusy] = useState(false);
  async function uploadPhoto(file: File) {
    setPhotoBusy(true);
    setError("");
    setMessage("");
    const form = new FormData();
    form.set("photo", file);
    try {
      const response = await fetch(`/api/parent/profile-photo/${profile.id}`, {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await reload();
      setMessage("Photo updated.");
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not save the photo.",
      );
    } finally {
      setPhotoBusy(false);
    }
  }
  async function removePhoto() {
    setPhotoBusy(true);
    setError("");
    try {
      const response = await fetch(`/api/parent/profile-photo/${profile.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await reload();
      setMessage("Photo removed.");
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not remove the photo.",
      );
    } finally {
      setPhotoBusy(false);
    }
  }
  return (
    <section className={`panel ${styles.childCard}`}>
      <div className={styles.childHeader}>
        <ProfileImage
          name={profile.display_name}
          avatar={profile.avatar_key}
          photoUrl={profile.photo_url}
          size="medium"
        />
        <div>
          <h2>{profile.display_name}</h2>
          <p className="muted">
            {profile.pin_enabled ? "4-digit PIN on" : "Opens without a PIN"}
          </p>
        </div>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setMessage("");
          setError("");
          if (pin && pin.length !== 4) {
            setError("Enter a 4-digit PIN.");
            return;
          }
          if (pin && pin !== confirmPin) {
            setError("The PINs do not match.");
            return;
          }
          if (
            await act("/api/parent/profiles", "PATCH", {
              id: profile.id,
              avatar_key: avatar,
              pin_enabled: enabled,
              ...(pin ? { passcode: pin } : {}),
            })
          ) {
            setPin("");
            setConfirmPin("");
            setMessage("Changes saved.");
          }
        }}
      >
        <fieldset className={styles.photoField}>
          <legend>Photo or avatar</legend>
          <div className={styles.avatarChoices}>
            {[
              "leaf",
              "sun",
              "star",
              "moon",
              "bird",
              "fox",
              "bear",
              "cat",
              "rocket",
            ].map((key) => (
              <button
                type="button"
                aria-label={`Use ${key} avatar`}
                aria-pressed={!profile.photo_url && avatar === key}
                key={key}
                onClick={() => setAvatar(key)}
              >
                <ProfileIdentity identity={key} />
              </button>
            ))}
          </div>
          <label className="button-secondary">
            <Icon name="upload" width="18" />
            {photoBusy
              ? "Saving…"
              : profile.photo_url
                ? "Change photo"
                : "Upload photo"}
            <input
              className="sr-only"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={photoBusy}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void uploadPhoto(file);
              }}
            />
          </label>
          {profile.photo_url && (
            <button
              className="button-quiet"
              type="button"
              disabled={photoBusy}
              onClick={() => void removePhoto()}
            >
              Remove photo
            </button>
          )}
          <p className="muted">
            Photos are stored privately. JPG, PNG or WebP, up to 2 MB.
          </p>
        </fieldset>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          <span>
            <strong>Require a PIN</strong>
            <small>
              Ask for a 4-digit PIN before opening {profile.display_name}’s
              library.
            </small>
          </span>
        </label>
        {(enabled || pin) && (
          <div className={styles.pinGrid}>
            <label>
              {profile.pin_enabled ? "New PIN (optional)" : "4-digit PIN"}
              <input
                className="field"
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                pattern="[0-9]{4}"
                minLength={4}
                maxLength={4}
                value={pin}
                onChange={(e) =>
                  setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                required={enabled && !profile.pin_enabled}
                placeholder="4 digits"
              />
            </label>
            <label>
              Confirm PIN
              <input
                className="field"
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                pattern="[0-9]{4}"
                minLength={4}
                maxLength={4}
                value={confirmPin}
                onChange={(e) =>
                  setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                required={Boolean(pin)}
                placeholder="Enter it again"
              />
            </label>
          </div>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        <button className="button" disabled={busy}>
          Save changes
        </button>
        {message && (
          <p className="notice" role="status">
            {message}
          </p>
        )}
      </form>
      <button
        className="button-secondary"
        onClick={async () => {
          setError("");
          try {
            await api("/api/parent/view-as-child", "POST", {
              profile_id: profile.id,
            });
            router.replace("/watch/home");
          } catch (reason) {
            setError(
              reason instanceof Error
                ? reason.message
                : "Could not open this profile.",
            );
          }
        }}
      >
        View as {profile.display_name}
      </button>
    </section>
  );
}
export function Children() {
  const { data } = useParent();
  return (
    <>
      <Heading
        eyebrow="Children"
        title="Profiles"
        description="Choose a photo or avatar, manage PINs, and check each child’s experience."
      />
      <div className="grid grid-2">
        {data.profiles.map((p) => (
          <ChildSettings profile={p} key={p.id} />
        ))}
      </div>
    </>
  );
}
export function Inbox() {
  const { data, act, busy } = useParent();
  const pending = data.requests.filter((r) => r.status === "pending");
  const [checked, setChecked] = useState(false);
  return (
    <>
      <Heading
        eyebrow="Parent inbox"
        title="A few things that need you."
        description="Requests, library health and useful actions in one place."
        action={
          <button
            className="button-secondary"
            disabled={busy}
            onClick={async () => {
              if (await act("/api/parent/videos/check", "POST", {}))
                setChecked(true);
            }}
          >
            Check video availability
          </button>
        }
      />
      {checked && (
        <p className="notice" role="status">
          Video availability check complete.
        </p>
      )}
      <section className="panel">
        <h2>Asked by the children</h2>
        {pending.length ? (
          pending.map((r) => (
            <article className={styles.request} key={r.id}>
              <p className="eyebrow">
                {r.display_name ||
                  data.profiles.find((p) => p.id === r.profile_id)
                    ?.display_name ||
                  "Child"}{" "}
                · {r.kind}
              </p>
              <h3>{r.message}</h3>
              <p className="muted">
                {new Date(r.created_at).toLocaleDateString()}
              </p>
              <div className={styles.row}>
                <Link
                  className="button"
                  href={`/parent/add-video?q=${encodeURIComponent(r.message)}`}
                >
                  Find a video
                </Link>
                <button
                  className="button-secondary"
                  disabled={busy}
                  onClick={() =>
                    act("/api/parent/requests", "PATCH", {
                      id: r.id,
                      status: "resolved",
                    })
                  }
                >
                  Mark resolved
                </button>
                <button
                  className="button-quiet"
                  disabled={busy}
                  onClick={() =>
                    act("/api/parent/requests", "PATCH", {
                      id: r.id,
                      status: "dismissed",
                    })
                  }
                >
                  Dismiss
                </button>
              </div>
            </article>
          ))
        ) : (
          <div className="empty">
            <h3>All caught up</h3>
            <p>Requests arrive here when a child uses Ask Parent.</p>
          </div>
        )}
      </section>
      <section className="panel">
        <h2>Library attention</h2>
        {data.attention.length ? (
          data.attention.map((item) => (
            <article key={item.id} className={styles.request}>
              <h3>{item.title}</h3>
              <p className="muted">{item.detail}</p>
              <Link href="/parent/library" className="button-secondary">
                Review library
              </Link>
            </article>
          ))
        ) : (
          <p className="muted">No library issues reported.</p>
        )}
      </section>
    </>
  );
}

function timeLabel(value: number) {
  const hour = Math.floor(value / 60),
    minute = value % 60;
  return new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(2026, 0, 1, hour, minute)));
}

export function Controls() {
  const { data, act, busy } = useParent();
  const options = Array.from(
    { length: 37 },
    (_, index) => index * 30 + 300,
  ).filter((value) => value < 1440);
  return (
    <>
      <Heading
        eyebrow="Controls"
        title="When WatchNest is available"
        description="Set an optional daily window for each child. These controls govern access to WatchNest without measuring YouTube playback."
      />
      <div className="grid grid-2">
        {data.profiles.map((profile) => (
          <form
            className="panel"
            key={profile.id}
            onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const start = form.get("start"),
                end = form.get("end");
              await act("/api/parent/profiles", "PATCH", {
                id: profile.id,
                available_from_minute: start ? Number(start) : null,
                available_until_minute: end ? Number(end) : null,
              });
            }}
          >
            <div className={styles.childHeader}>
              <ProfileImage
                name={profile.display_name}
                avatar={profile.avatar_key}
                photoUrl={profile.photo_url}
                size="small"
              />
              <div>
                <h2>{profile.display_name}</h2>
                <p className="muted">
                  {profile.available_from_minute == null
                    ? "Available anytime"
                    : `${timeLabel(profile.available_from_minute)}–${timeLabel(profile.available_until_minute || 0)}`}
                </p>
              </div>
            </div>
            <div className={styles.pinGrid}>
              <label>
                Available from
                <select
                  className="field"
                  name="start"
                  defaultValue={profile.available_from_minute ?? ""}
                >
                  <option value="">Any time</option>
                  {options.map((value) => (
                    <option key={value} value={value}>
                      {timeLabel(value)}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Until
                <select
                  className="field"
                  name="end"
                  defaultValue={profile.available_until_minute ?? ""}
                >
                  <option value="">Any time</option>
                  {options.map((value) => (
                    <option key={value} value={value}>
                      {timeLabel(value)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <button className="button" disabled={busy}>
              Save schedule
            </button>
          </form>
        ))}
      </div>
      <section className="notice">
        <h2>About minute limits</h2>
        <p>
          WatchNest does not read or reconstruct viewing time from Made-for-Kids
          players. Daily and Collection minute budgets remain deferred until
          they can be enforced without prohibited player tracking. Schedule
          windows are enforced independently of YouTube.
        </p>
      </section>
    </>
  );
}

export function Settings() {
  const router = useRouter();
  const [pin, setPin] = useState(""),
    [confirmPin, setConfirmPin] = useState(""),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  return (
    <>
      <Heading
        eyebrow="Settings"
        title="Family device"
        description="Protect Parent Mode and manage this device."
      />
      <div className="grid grid-2">
        <form
          className="panel"
          onSubmit={async (event) => {
            event.preventDefault();
            setError("");
            setMessage("");
            if (pin.length !== 4) {
              setError("Enter a 4-digit Parent PIN.");
              return;
            }
            if (pin !== confirmPin) {
              setError("The PINs do not match.");
              return;
            }
            setBusy(true);
            try {
              await api("/api/parent/settings", "PATCH", { parent_pin: pin });
              setPin("");
              setConfirmPin("");
              setMessage("Parent PIN saved.");
            } catch (reason) {
              setError(
                reason instanceof Error
                  ? reason.message
                  : "Could not save the PIN.",
              );
            } finally {
              setBusy(false);
            }
          }}
        >
          <h2>Parent Mode PIN</h2>
          <p className="muted">
            Use this 4-digit PIN to enter Parent Mode from the profile picker.
          </p>
          <label>
            New Parent PIN
            <input
              className="field"
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              pattern="[0-9]{4}"
              maxLength={4}
              value={pin}
              onChange={(event) =>
                setPin(event.target.value.replace(/\D/g, "").slice(0, 4))
              }
              required
            />
          </label>
          <label>
            Confirm PIN
            <input
              className="field"
              type="password"
              inputMode="numeric"
              autoComplete="new-password"
              pattern="[0-9]{4}"
              maxLength={4}
              value={confirmPin}
              onChange={(event) =>
                setConfirmPin(event.target.value.replace(/\D/g, "").slice(0, 4))
              }
              required
            />
          </label>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          {message && (
            <p className="notice" role="status">
              {message}
            </p>
          )}
          <button className="button" disabled={busy}>
            Save Parent PIN
          </button>
        </form>
        <section className="panel">
          <h2>Device access</h2>
          <p className="muted">
            Switch profiles keeps this family iPad connected. Sign out removes
            WatchNest access from this browser.
          </p>
          <button
            className="button-secondary"
            onClick={() => router.push("/watch")}
          >
            <Icon name="switch" width="18" /> Switch profile
          </button>
          <button
            className="button-quiet"
            onClick={async () => {
              await api("/api/auth/logout", "POST", {});
              router.replace("/login");
            }}
          >
            Sign out of this device
          </button>
        </section>
      </div>
    </>
  );
}
