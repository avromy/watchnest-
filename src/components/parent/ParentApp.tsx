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
  const nav = [
    ["Overview", "/parent/dashboard"],
    ["Library", "/parent/library"],
    ["Add videos", "/parent/add-video"],
    ["Collections", "/parent/collections"],
    ["Children", "/parent/children"],
    ["Inbox", "/parent/inbox"],
  ];
  return (
    <div className="shell">
      {data && (
        <>
          <header className="topbar">
            <Link href="/parent/dashboard" className="brand">
              WatchNest <span className="badge">Parent</span>
            </Link>
            <button
              className="button-quiet"
              onClick={async () => {
                try {
                  await api("/api/auth/logout", "POST", {});
                  router.replace("/login");
                } catch (e) {
                  setError(
                    e instanceof Error
                      ? e.message
                      : "Could not sign out. Try again.",
                  );
                }
              }}
            >
              Sign out
            </button>
          </header>
          <nav
            className={`nav ${styles.navigation}`}
            aria-label="Parent navigation"
          >
            {nav.map(([label, href]) => (
              <Link
                key={href}
                href={href}
                aria-current={path === href ? "page" : undefined}
              >
                {label}
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
        eyebrow="Your family at a glance"
        title="A little watching. A lot of curiosity."
        description="Your approved videos, their own little libraries."
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
          <p className="eyebrow">Ready for their next visit</p>
          <h2 id="library-overview-title">Your library & requests</h2>
          <p className="muted">
            What you’ve approved, who can access it, and what the children have
            asked for.
          </p>
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
            <span className="muted">Assigned videos</span>
            <strong>{workflow.assignedVideos}</strong>
            <small className="muted">Assigned to at least one child</small>
          </div>
          <div className="stat">
            <span className="muted">Unassigned videos</span>
            <strong>{workflow.unassignedVideos}</strong>
            <small className="muted">Approved, with no child access yet</small>
            {workflow.unassignedVideos > 0 && (
              <Link href="/parent/library">Manage assignments</Link>
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
                  <span className="badge">
                    {profile.experience_mode === "simple"
                      ? "Simple mode"
                      : "Standard mode"}
                  </span>
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
                    : "Manage child profile"}
                </Link>
              </section>
            );
          })}
        </div>
        <p className={`muted ${styles.dataNote}`}>
          WatchNest reports approvals, assignments and requests. It does not
          report YouTube watch time.
        </p>
      </section>
    </>
  );
}
export function AddVideos() {
  const { data, act, busy } = useParent();
  const [query, setQuery] = useState(""),
    [urls, setUrls] = useState(""),
    [results, setResults] = useState<Video[]>([]),
    [selected, setSelected] = useState<string[]>([]),
    [profiles, setProfiles] = useState<string[]>([]),
    [collection, setCollection] = useState(""),
    [preview, setPreview] = useState<Video | null>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [message, setMessage] = useState(""),
    [searched, setSearched] = useState(false);
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
        : await api<{ videos: Video[] }>(
            `/api/parent/videos/search?q=${encodeURIComponent(query)}`,
          );
      setResults(
        Array.from(
          new Map(result.videos.map((v) => [v.youtube_video_id, v])).values(),
        ),
      );
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
        eyebrow="Parent-only discovery"
        title="Find something worth watching."
        description="Preview each video, choose children, then approve. Channels and future uploads are never automatically included."
      />
      <div className="grid grid-2">
        <form className="panel" onSubmit={(e) => find(e, false)}>
          <h2>Search YouTube</h2>
          <label htmlFor="yt-query">Video, show, creator or topic</label>
          <div className="form-row">
            <input
              className="field"
              id="yt-query"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              required
              maxLength={200}
            />
            <button className="button" disabled={loading || !query.trim()}>
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
      {searched && !loading && !results.length && !error && (
        <div className="empty">
          <h2>No matching videos</h2>
          <p>Try another search or paste a specific video link.</p>
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
                    onClick={() => setPreview(v)}
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
            if (e.key === "Escape") setPreview(null);
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
                onClick={() => setPreview(null)}
              >
                Close preview
              </button>
            </div>
            <YouTubeEmbed
              className={styles.player}
              videoId={preview.youtube_video_id}
              title={preview.title}
            />
            <p className="muted">
              Parent preview uses YouTube’s player. YouTube controls its
              branding, links and some recommendations.
            </p>
          </section>
        </div>
      )}
    </>
  );
}
export function Library() {
  const { data, act, busy } = useParent();
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
            <h3>{selected.length} selected · Replace assignments</h3>
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
              Save assignments
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
                    .join(" · ") || "No child assignments"}
                </p>
                <div className={styles.row}>
                  <button
                    className="button-secondary"
                    onClick={() => {
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
            if (e.key === "Escape") setPreview(null);
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
                onClick={() => setPreview(null)}
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
            <p role="status" className={previewLoaded ? "notice" : "muted"}>
              {previewLoaded
                ? "YouTube’s player loaded. Press Play and confirm the video starts before assigning it."
                : "Loading YouTube’s player…"}
            </p>
            <p className="muted">
              Source: {preview.channel_title || "YouTube"}. Audience status:{" "}
              {preview.made_for_kids === true
                ? "Made for Kids — WatchNest resume is off"
                : preview.made_for_kids === false
                  ? "not marked Made for Kids"
                  : "not confirmed — WatchNest resume stays off"}
              .
            </p>
            <p className="muted">
              A loaded player is not proof that the video plays in every region.
              If YouTube shows an availability or embedding message, do not
              assign this video. Child access still follows the assignments
              shown on the card.
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
        eyebrow="Shows & collections"
        title="Give their favorites a home."
        description="Group individually approved videos by show, interest or occasion. Each child still sees only their own assigned videos."
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
              </div>
            ))
          ) : (
            <p className="muted">
              Make a collection like Drawing Time, Science or a favorite show.
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
  const { act, busy, data } = useParent();
  const [mode, setMode] = useState(profile.experience_mode),
    [pin, setPin] = useState(""),
    [enabled, setEnabled] = useState(profile.pin_enabled),
    [avatar, setAvatar] = useState(profile.avatar_key || "leaf"),
    [message, setMessage] = useState(""),
    [preview, setPreview] = useState(false);
  return (
    <section className="panel">
      <div className={styles.row}>
        <div className="avatar" aria-hidden="true">
          <ProfileIdentity identity={profile.avatar_key} />
        </div>
        <h2>{profile.display_name}</h2>
        <span className="badge">
          {profile.pin_enabled ? "PIN protection on" : "PIN protection off"}
        </span>
      </div>
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setMessage("");
          if (
            await act("/api/parent/profiles", "PATCH", {
              id: profile.id,
              experience_mode: mode,
              avatar_key: avatar,
              pin_enabled: enabled,
              ...(pin ? { passcode: pin } : {}),
            })
          ) {
            setPin("");
            setMessage("Profile settings saved.");
          }
        }}
      >
        <label>
          Experience
          <select
            className="field"
            value={mode}
            onChange={(e) => setMode(e.target.value as "simple" | "standard")}
          >
            <option value="simple">
              Simple · bigger targets, fewer choices
            </option>
            <option value="standard">Standard · explore and search</option>
          </select>
        </label>
        <label>
          Profile identity
          <select
            className="field"
            value={avatar}
            onChange={(e) => setAvatar(e.target.value)}
          >
            <option value="leaf">Leaf</option>
            <option value="sun">Sun</option>
            <option value="star">Star</option>
            <option value="moon">Moon</option>
          </select>
        </label>
        <label className={styles.check}>
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Require a personal PIN
        </label>
        <label>
          {profile.pin_enabled
            ? "Change or reset PIN (leave blank to keep current)"
            : "Set PIN before turning protection on"}
          <input
            className="field"
            type="password"
            inputMode="numeric"
            autoComplete="new-password"
            pattern="[0-9]{6,12}"
            minLength={6}
            maxLength={12}
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            required={enabled && !profile.pin_enabled}
            placeholder="6–12 digits"
          />
        </label>
        <p className="muted">
          PIN protection is optional. When it is off, this profile opens
          directly from the family link. Every child session still receives only
          that child’s assigned library.
        </p>
        <button className="button" disabled={busy}>
          Save settings
        </button>
        {message && (
          <p className="notice" role="status">
            {message}
          </p>
        )}
      </form>
      <button className="button-secondary" onClick={() => setPreview(!preview)}>
        View as {profile.display_name}
      </button>
      {preview && (
        <div className={styles.bulk}>
          <p className="badge">
            Parent preview · {profile.display_name}’s assigned library
          </p>
          {data.videos
            .filter((v) => v.profile_ids?.includes(profile.id))
            .map((v) => (
              <p key={v.id}>{v.title}</p>
            ))}
          {!data.videos.some((v) => v.profile_ids?.includes(profile.id)) && (
            <p className="muted">No videos assigned yet.</p>
          )}
          <p className="muted">
            This checks their library contents. Use the family link to test
            their actual child experience.
          </p>
        </div>
      )}
    </section>
  );
}
export function Children() {
  const { data } = useParent();
  const [copyStatus, setCopyStatus] = useState("");
  const linkRef = useRef<HTMLInputElement>(null);
  const familyPath = `/watch?family=${encodeURIComponent(data.familyCode)}`;
  const familyLink =
    typeof window !== "undefined"
      ? `${window.location.origin}${familyPath}`
      : familyPath;
  async function copyLink() {
    try {
      if (!navigator.clipboard) throw new Error("Clipboard unavailable");
      await navigator.clipboard.writeText(familyLink);
      setCopyStatus("Child sign-in link copied.");
    } catch {
      linkRef.current?.focus();
      linkRef.current?.select();
      setCopyStatus(
        "Copy is unavailable on this browser. The link below is selected; use Copy to share it.",
      );
    }
  }
  return (
    <>
      <Heading
        eyebrow="Four little explorers"
        title="Their space. Your peace of mind."
        description="Individual libraries, optional personal PINs, and an experience that grows with each child."
      />
      <section className="notice">
        <h2>Open WatchNest on the family iPad</h2>
        <p>
          Share this link on the family iPad. Children whose PIN protection is
          off open their profile directly; children with protection on enter
          their own PIN. Parent Mode stays separately protected.
        </p>
        <div className={styles.row}>
          <Link className="button-secondary" href={familyPath}>
            Open child sign-in
          </Link>
          <button className="button" onClick={copyLink}>
            Copy child sign-in link
          </button>
        </div>
        <label className={styles.share}>
          Child sign-in link
          <input
            className="field"
            ref={linkRef}
            readOnly
            value={familyLink}
            onFocus={(e) => e.currentTarget.select()}
          />
        </label>
        {copyStatus && <p role="status">{copyStatus}</p>}
      </section>
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
