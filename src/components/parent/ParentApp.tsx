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
import { extractYouTubeVideoUrls } from "@/lib/youtube";

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
type SessionStatus = {
  serverNow: string;
  localReceivedAt?: number;
  profiles: Array<
    Pick<
      Profile,
      | "id"
      | "session_duration_minutes"
      | "session_expires_at"
      | "session_paused_seconds"
      | "session_state_revision"
      | "session_updated_at"
    > & {
      access: {
        enabled: boolean;
        allowed: boolean;
        expiresAt: string | null;
        remainingSeconds: number | null;
        pausedSeconds: number | null;
        revision: number;
        state: "unlimited" | "active" | "paused" | "expired";
      };
      devices: Array<{
        device_id: string | null;
        timer_last_seen_at: string | null;
        timer_ack_revision: number;
        timer_playback_active: boolean;
      }>;
    }
  >;
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
type LookupResult = {
  videos: Video[];
  errors: { url: string; error: string }[];
};
type RecentVideoLookup = {
  key: string;
  at: number;
  promise: Promise<LookupResult>;
};
type WatchNestBrowserWindow = typeof window & {
  __watchnestRecentVideoLookup?: RecentVideoLookup;
  __watchnestAutoResolvedKey?: string;
};
function lookupVideoUrls(links: string[]) {
  const key = links.join("|");
  const now = Date.now();
  const scope = window as WatchNestBrowserWindow;
  try {
    const cached = JSON.parse(
      window.sessionStorage.getItem("watchnest-recent-video-lookup") || "null",
    ) as { key: string; at: number; result: LookupResult } | null;
    if (cached?.key === key && now - cached.at < 1500)
      return Promise.resolve(cached.result);
  } catch {
    // The in-memory request coalescer below remains available when storage is
    // disabled or contains an invalid value.
  }
  const recentVideoLookup = scope.__watchnestRecentVideoLookup;
  if (recentVideoLookup?.key === key && now - recentVideoLookup.at < 1500)
    return recentVideoLookup.promise;
  const promise = api<LookupResult>("/api/parent/videos/lookup", "POST", {
    urls: links,
  })
    .then((result) => {
      try {
        window.sessionStorage.setItem(
          "watchnest-recent-video-lookup",
          JSON.stringify({ key, at: Date.now(), result }),
        );
      } catch {}
      return result;
    })
    .catch((error) => {
      if (scope.__watchnestRecentVideoLookup?.promise === promise)
        delete scope.__watchnestRecentVideoLookup;
      throw error;
    });
  scope.__watchnestRecentVideoLookup = { key, at: now, promise };
  return promise;
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
  const navRef = useRef<HTMLElement>(null);
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
          router.replace(session.role === "device" ? "/watch" : "/login");
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
  useEffect(() => {
    const navigation = navRef.current;
    const activeLink = navigation?.querySelector<HTMLElement>(
      '[aria-current="page"]',
    );
    if (!navigation || !activeLink) return;
    const navigationBox = navigation.getBoundingClientRect();
    const activeBox = activeLink.getBoundingClientRect();
    navigation.scrollTo({
      left:
        navigation.scrollLeft +
        activeBox.left -
        navigationBox.left -
        (navigation.clientWidth - activeBox.width) / 2,
      behavior: "auto",
    });
  }, [path, data]);
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
  const pendingRequests =
    data?.requests.filter((request) => request.status === "pending").length ||
    0;
  const libraryRoutes = [
    "/parent/library",
    "/parent/collections",
    "/parent/add-video",
  ];
  const familyRoutes = [
    "/parent/children",
    "/parent/controls",
    "/parent/settings",
  ];
  const nav: [string, string, IconName, boolean][] = [
    ["Overview", "/parent/dashboard", "home", path === "/parent/dashboard"],
    ["Library", "/parent/library", "library", libraryRoutes.includes(path)],
    ["Requests", "/parent/inbox", "inbox", path === "/parent/inbox"],
    ["Family", "/parent/children", "children", familyRoutes.includes(path)],
  ];
  const secondaryNav = libraryRoutes.includes(path)
    ? [
        ["Videos", "/parent/library"],
        ["Collections", "/parent/collections"],
        ["Add videos", "/parent/add-video"],
      ]
    : familyRoutes.includes(path)
      ? [
          ["Profiles", "/parent/children"],
          ["Time & discovery", "/parent/controls"],
          ["Settings", "/parent/settings"],
        ]
      : [];
  return (
    <div className={`shell ${styles.parentShell}`}>
      {data && (
        <>
          <header className={`topbar ${styles.topbar}`}>
            <Link href="/parent/dashboard" className="brand">
              <img src="/icon.svg" alt="" width="36" height="36" /> WatchNest{" "}
              <span className="badge">Parent</span>
            </Link>
            <div className={styles.headerActions}>
              {path !== "/parent/add-video" && (
                <Link
                  className={`button ${styles.addButton}`}
                  href="/parent/add-video"
                >
                  <Icon name="plus" width="18" />
                  <span>Add videos</span>
                </Link>
              )}
              <button
                className={`button-quiet ${styles.profileSwitch}`}
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
                <Icon name="switch" width="18" /> <span>Switch profile</span>
              </button>
            </div>
          </header>
          <nav
            ref={navRef}
            className={styles.navigation}
            aria-label="Parent navigation"
          >
            {nav.map(([label, href, icon, active]) => (
              <Link
                key={href}
                href={href}
                aria-current={active ? "page" : undefined}
              >
                <Icon name={icon} width="18" /> {label}
                {label === "Requests" && pendingRequests > 0 && (
                  <span className={styles.navCount}>{pendingRequests}</span>
                )}
              </Link>
            ))}
          </nav>
          {secondaryNav.length > 0 && (
            <nav
              className={styles.secondaryNav}
              aria-label={
                libraryRoutes.includes(path)
                  ? "Library sections"
                  : "Family sections"
              }
            >
              {secondaryNav.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  aria-current={path === href ? "page" : undefined}
                >
                  {label}
                </Link>
              ))}
            </nav>
          )}
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
        <label className={styles.choiceOption} key={p.id}>
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
          <span>{p.display_name}</span>
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
  const pending = data.requests.filter(
    (request) => request.status === "pending",
  );
  return (
    <>
      <section className={styles.overviewHero} aria-labelledby="overview-title">
        <div className={styles.heroContent}>
          <p className="eyebrow">Your family space</p>
          <h1 id="overview-title">
            Their favorites.
            <br />
            Your family library.
          </h1>
          <p>Choose the videos. Make room for their favorites.</p>
          <Link className="button" href="/parent/add-video">
            <Icon name="plus" width="19" /> Add to the library
          </Link>
          <span className={styles.heroProtection}>
            <Icon name="lock" width="15" /> Approved-only playback in Child Mode
          </span>
        </div>
        <div className={styles.heroShelf} aria-hidden="true">
          {data.videos.slice(0, 3).map((video) => (
            <div key={video.id}>
              <Thumb video={video} />
              <span>{video.title}</span>
            </div>
          ))}
          {!data.videos.length && (
            <div className={styles.heroEmpty}>
              <Icon name="library" width="64" />
              <span>Their next favorite starts here.</span>
            </div>
          )}
        </div>
      </section>
      <div className={styles.overviewMetrics} aria-label="Library overview">
        <Link href="/parent/library">
          <strong>{workflow.approvedVideos}</strong>
          <span>Approved videos</span>
          <Icon name="library" width="21" />
        </Link>
        <Link href="/parent/collections">
          <strong>{data.collections.length}</strong>
          <span>Collections</span>
          <Icon name="collection" width="21" />
        </Link>
        <Link href="/parent/inbox">
          <strong>{workflow.openRequests}</strong>
          <span>Waiting for you</span>
          <Icon name="inbox" width="21" />
        </Link>
      </div>
      {(pending.length > 0 ||
        data.attention.length > 0 ||
        workflow.unassignedVideos > 0) && (
        <section className={styles.attention} aria-label="Needs your attention">
          <div>
            <p className="eyebrow">Next up</p>
            <h2>
              {pending.length
                ? `${pending.length} ${pending.length === 1 ? "request" : "requests"} from the children`
                : data.attention.length
                  ? "A library update needs you"
                  : `${workflow.unassignedVideos} approved videos to share`}
            </h2>
            <p className="muted">
              {pending.length
                ? `${pending[0].display_name || "A child"} asked for ${pending[0].video_title || pending[0].message}`
                : data.attention[0]?.title ||
                  "Choose who can watch your latest additions."}
            </p>
          </div>
          <Link
            className="button-secondary"
            href={
              pending.length || data.attention.length
                ? "/parent/inbox"
                : "/parent/library"
            }
          >
            {pending.length
              ? "Review requests"
              : data.attention.length
                ? "Open requests"
                : "Share videos"}
            <span aria-hidden="true"> →</span>
          </Link>
        </section>
      )}
      <section
        className={styles.dashboardSection}
        aria-labelledby="family-library-title"
      >
        <div className={styles.sectionHeading}>
          <div>
            <p className="eyebrow">Made for each of them</p>
            <h2 id="family-library-title">Their libraries</h2>
          </div>
          <Link href="/parent/children">
            Manage family <span aria-hidden="true">→</span>
          </Link>
        </div>
        <div className={styles.familyGrid}>
          {data.profiles.map((profile) => {
            const library = workflow.byChild.find(
              (child) => child.profile_id === profile.id,
            );
            return (
              <article className={styles.familySummary} key={profile.id}>
                <ProfileImage
                  name={profile.display_name}
                  avatar={profile.avatar_key}
                  photoUrl={profile.photo_url}
                  size="medium"
                />
                <div className={styles.grow}>
                  <h3>{profile.display_name}</h3>
                  <p>
                    {library?.assignedVideos ?? 0} approved videos
                    {(library?.openRequests ?? 0) > 0
                      ? ` · ${library!.openRequests} requests`
                      : ""}
                  </p>
                  <span className={styles.profileProtection}>
                    <Icon name="lock" width="13" />
                    {profile.pin_enabled ? "PIN protected" : "No profile PIN"}
                  </span>
                </div>
                <Link
                  href={
                    (library?.assignedVideos ?? 0) === 0
                      ? "/parent/add-video"
                      : "/parent/children"
                  }
                  aria-label={`Manage ${profile.display_name}’s library`}
                  className={styles.circleLink}
                >
                  <Icon
                    name={
                      (library?.assignedVideos ?? 0) === 0 ? "plus" : "controls"
                    }
                    width="20"
                  />
                </Link>
              </article>
            );
          })}
        </div>
      </section>
      <Link href="/parent/controls" className={styles.timerShortcut}>
        <span className={styles.shortcutIcon}>
          <Icon name="clock" width="25" />
        </span>
        <span>
          <strong>A little time for watching</strong>
          <small>Start a session, add time, or end playback from here.</small>
        </span>
        <span aria-hidden="true">→</span>
      </Link>
    </>
  );
}
export function AddVideos() {
  const { data, act, busy, reload } = useParent();
  const previewReturnFocus = useRef<HTMLButtonElement | null>(null);
  const urlInput = useRef<HTMLTextAreaElement | null>(null);
  const [entryMode, setEntryMode] = useState<"search" | "links">("search");
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
    [creatingCollection, setCreatingCollection] = useState(false),
    [newCollectionTitle, setNewCollectionTitle] = useState(""),
    [nextPageToken, setNextPageToken] = useState<string | null>(null),
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
    const params = new URLSearchParams(window.location.search);
    const requested = params.get("q");
    const sharedUrl = params.get("url");
    if (requested) setQuery(requested);
    if (sharedUrl) {
      setUrls(sharedUrl);
      setEntryMode("links");
    }
  }, []);
  async function runFind(
    lookup: boolean,
    pageToken?: string,
    append = false,
    options?: {
      pastedText?: string;
      selectedSource?: typeof source;
      selectedType?: typeof resultType;
      searchQuery?: string;
    },
  ) {
    const sourceForRequest = options?.selectedSource ?? source;
    const typeForRequest = options?.selectedType ?? resultType;
    const queryForRequest = options?.searchQuery ?? query;
    const pastedText = options?.pastedText ?? urls;
    const links = extractYouTubeVideoUrls(pastedText);
    if (lookup && !links.length) {
      setError("Paste a YouTube video link, then choose Load videos.");
      return;
    }
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
        ? await lookupVideoUrls(links)
        : await api<{
            videos?: Video[];
            items?: typeof discoveries;
            nextPageToken?: string | null;
          }>(
            `/api/parent/videos/search?q=${encodeURIComponent(queryForRequest)}&type=${sourceForRequest?.type || typeForRequest}${sourceForRequest ? `&source=${encodeURIComponent(sourceForRequest.id)}` : ""}${pageToken ? `&pageToken=${encodeURIComponent(pageToken)}` : ""}`,
          );
      setNextPageToken(
        "nextPageToken" in result ? result.nextPageToken || null : null,
      );
      if (!lookup && !sourceForRequest && typeForRequest !== "video") {
        setDiscoveries((current) =>
          append
            ? [...current, ...(("items" in result ? result.items : []) || [])]
            : ("items" in result ? result.items : []) || [],
        );
        setResults([]);
        setSelected([]);
        return;
      }
      setResults((current) =>
        Array.from(
          new Map(
            [...(append ? current : []), ...(result.videos || [])].map((v) => [
              v.youtube_video_id,
              v,
            ]),
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
  function find(e: FormEvent, lookup: boolean) {
    e.preventDefault();
    if (lookup) {
      const scope = window as WatchNestBrowserWindow;
      const currentValue = urlInput.current?.value.trim() || urls.trim();
      const key = extractYouTubeVideoUrls(currentValue).join("|");
      scope.__watchnestAutoResolvedKey = key;
      void runFind(true, undefined, false, { pastedText: currentValue });
      return;
    }
    void runFind(lookup);
  }
  function acceptUrlText(value: string) {
    setUrls(value);
    const scope = window as WatchNestBrowserWindow;
    const links = extractYouTubeVideoUrls(value);
    if (!links.length || links.length > 20) return;
    const key = links.join("|");
    if (scope.__watchnestAutoResolvedKey === key) return;
    scope.__watchnestAutoResolvedKey = key;
    void runFind(true, undefined, false, { pastedText: value });
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
      setUrls("");
      delete (window as WatchNestBrowserWindow).__watchnestAutoResolvedKey;
      requestAnimationFrame(() => urlInput.current?.focus());
    }
  }
  return (
    <>
      <Heading
        eyebrow="Add Videos"
        title="Find their next favorite."
        description="Find a video, take a look, then share it with the children."
      />
      <div className={styles.addWorkspace}>
        <div className={styles.entryModes} aria-label="How to find videos">
          <button
            type="button"
            aria-pressed={entryMode === "search"}
            onClick={() => setEntryMode("search")}
          >
            <Icon name="search" width="20" /> Search YouTube
          </button>
          <button
            type="button"
            aria-pressed={entryMode === "links"}
            onClick={() => setEntryMode("links")}
          >
            <Icon name="plus" width="20" /> Paste video links
          </button>
        </div>
        <form
          className={styles.sourcePanel}
          hidden={entryMode !== "search"}
          onSubmit={(e) => find(e, false)}
        >
          <h2>What would they love to watch?</h2>
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
              placeholder="A show, a creator, a new curiosity…"
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
        <form
          className={styles.sourcePanel}
          hidden={entryMode !== "links"}
          onSubmit={(e) => find(e, true)}
        >
          <h2>Bring your family’s favorites.</h2>
          <label htmlFor="yt-urls">Paste one YouTube video link per line</label>
          <textarea
            ref={urlInput}
            className="field"
            id="yt-urls"
            value={urls}
            onChange={(e) => acceptUrlText(e.target.value)}
            onPaste={(event) => {
              const pasted = event.clipboardData.getData("text");
              if (!pasted) return;
              event.preventDefault();
              const next = `${urls}${urls ? "\n" : ""}${pasted}`;
              acceptUrlText(next);
            }}
            rows={3}
            required
            inputMode="url"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="https://www.youtube.com/watch?v=…"
          />
          <p className="muted">
            Valid links load automatically. Paste several at once.
          </p>
          <button className="button-secondary" type="submit" disabled={loading}>
            {loading ? "Loading…" : "Load videos"}
          </button>
        </form>
      </div>
      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
      <details className="panel">
        <summary>
          <strong>Move existing family picks</strong>
        </summary>
        <p className="muted">
          YouTube Kids does not provide WatchNest with an official
          approved-content import. Use Share or Copy link for the videos you
          want to keep, then paste all the links above. WatchNest resolves them
          together, marks duplicates, and still requires individual approval.
        </p>
      </details>
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
                type="button"
                className="button"
                onClick={() => {
                  const selectedSource = {
                    id: item.id,
                    type: item.type,
                    title: item.title,
                  };
                  setSource(selectedSource);
                  setResultType(item.type);
                  setQuery("");
                  setDiscoveries([]);
                  setSearched(true);
                  void runFind(false, undefined, false, {
                    selectedSource,
                    selectedType: item.type,
                    searchQuery: "",
                  });
                }}
              >
                Browse videos
              </button>
              {item.type === "channel" && (
                <details>
                  <summary>Allow in child Discover</summary>
                  <div className={styles.row}>
                    {data.profiles.map((profile) => {
                      const channels = profile.discovery_channels || [];
                      const allowed = channels.some(
                        (channel) => channel.id === item.id,
                      );
                      return (
                        <button
                          key={profile.id}
                          type="button"
                          className="button-quiet"
                          disabled={busy || allowed}
                          onClick={() =>
                            act("/api/parent/profiles", "PATCH", {
                              id: profile.id,
                              discover_enabled: true,
                              discovery_channels: [
                                ...channels,
                                { id: item.id, title: item.title },
                              ],
                            })
                          }
                        >
                          {allowed
                            ? `${profile.display_name}: allowed`
                            : `Allow for ${profile.display_name}`}
                        </button>
                      );
                    })}
                  </div>
                </details>
              )}
            </article>
          ))}
        </div>
      )}
      {!!results.length && (
        <>
          <section className={`panel ${styles.approvalPanel}`}>
            <div className={styles.sectionHeading}>
              <div>
                <p className="eyebrow">Make it theirs</p>
                <h2>
                  {selected.length
                    ? `${selected.length} selected for approval`
                    : "Choose videos below"}
                </h2>
              </div>
              <span className={styles.selectionCount}>
                {results.length} videos found
              </span>
            </div>
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
              <option value="__new">+ New Collection</option>
            </select>
            {collection === "__new" && (
              <div className="form-row">
                <input
                  className="field"
                  value={newCollectionTitle}
                  onChange={(event) =>
                    setNewCollectionTitle(event.target.value)
                  }
                  placeholder="Collection name"
                  maxLength={120}
                  autoFocus
                />
                <button
                  type="button"
                  className="button-secondary"
                  disabled={creatingCollection || !newCollectionTitle.trim()}
                  onClick={async () => {
                    setCreatingCollection(true);
                    setError("");
                    try {
                      const result = await api<{ collection: Collection }>(
                        "/api/parent/collections",
                        "POST",
                        { title: newCollectionTitle.trim(), video_ids: [] },
                      );
                      await reload();
                      setCollection(result.collection.id);
                      setNewCollectionTitle("");
                    } catch (reason) {
                      setError(
                        reason instanceof Error
                          ? reason.message
                          : "Could not create the Collection.",
                      );
                    } finally {
                      setCreatingCollection(false);
                    }
                  }}
                >
                  Create
                </button>
              </div>
            )}
            <button
              className="button"
              disabled={
                !selected.length ||
                !profiles.length ||
                busy ||
                collection === "__new"
              }
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
          {nextPageToken && (
            <button
              type="button"
              className="button-secondary"
              disabled={loading}
              onClick={() => void runFind(false, nextPageToken, true)}
            >
              {loading ? "Loading…" : "Load more"}
            </button>
          )}
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
              safePlayback
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
  const { data, act, busy, reload } = useParent();
  const previewReturnFocus = useRef<HTMLButtonElement | null>(null);
  const [query, setQuery] = useState(""),
    [filter, setFilter] = useState(""),
    [selected, setSelected] = useState<string[]>([]),
    [profiles, setProfiles] = useState<string[]>([]),
    [edit, setEdit] = useState<Video | null>(null),
    [preview, setPreview] = useState<Video | null>(null),
    [previewLoaded, setPreviewLoaded] = useState(false),
    [tags, setTags] = useState(""),
    [bulkCollection, setBulkCollection] = useState("");
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
        title="The family library."
        description="Your approved picks. Shared with just the right children."
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
            <label>
              Add to Collection
              <select
                className="field"
                value={bulkCollection}
                onChange={(event) => setBulkCollection(event.target.value)}
              >
                <option value="">Choose a Collection</option>
                {data.collections.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.title}
                  </option>
                ))}
              </select>
            </label>
            <button
              className="button-secondary"
              disabled={busy || !bulkCollection}
              onClick={async () => {
                const target = data.collections.find(
                  (item) => item.id === bulkCollection,
                );
                if (!target) return;
                await api("/api/parent/collections", "PATCH", {
                  id: target.id,
                  video_ids: Array.from(
                    new Set([...target.video_ids, ...selected]),
                  ),
                });
                await reload();
                setSelected([]);
                setBulkCollection("");
              }}
            >
              Add selected to Collection
            </button>{" "}
            <button className="button" disabled={busy} onClick={save}>
              Save
            </button>{" "}
            <button
              className="button-quiet"
              disabled={busy}
              onClick={async () => {
                if (
                  !window.confirm(
                    `Remove ${selected.length} selected video${selected.length === 1 ? "" : "s"} from every child library?`,
                  )
                )
                  return;
                for (const videoId of selected)
                  await api("/api/parent/videos", "DELETE", {
                    video_id: videoId,
                  });
                await reload();
                setSelected([]);
              }}
            >
              Remove selected
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
              safePlayback
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
              share this video. Child access still follows “Who can watch?” on
              the card.
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
    [collectionProfiles, setCollectionProfiles] = useState<
      Record<string, string[]>
    >({}),
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
        title="Favorites belong together."
        description="Build familiar shelves for the shows, creators, and topics they love."
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
                    requestAnimationFrame(() => {
                      const editor =
                        document.getElementById("collection-editor");
                      editor?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                      editor?.focus({ preventScroll: true });
                    });
                  }}
                >
                  Edit collection
                </button>
                <details className={styles.collectionShare}>
                  <summary>Share with children</summary>
                  <Choices
                    profiles={data.profiles}
                    value={collectionProfiles[c.id] || []}
                    setValue={(value) =>
                      setCollectionProfiles((current) => ({
                        ...current,
                        [c.id]: value,
                      }))
                    }
                  />
                  <button
                    className="button-secondary"
                    disabled={busy || !collectionProfiles[c.id]?.length}
                    onClick={async () => {
                      if (
                        await act("/api/parent/collections/assign", "POST", {
                          collection_id: c.id,
                          profile_ids: collectionProfiles[c.id],
                        })
                      )
                        setSaved(true);
                    }}
                  >
                    Share collection
                  </button>
                </details>
              </div>
            ))
          ) : (
            <p className="muted">
              Create a Collection for a show, creator, topic, or family
              favorite.
            </p>
          )}
        </section>
        <form
          id="collection-editor"
          tabIndex={-1}
          className="panel"
          onSubmit={submit}
        >
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
              <label className={styles.choiceOption} key={v.id}>
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
                <span>{v.title}</span>
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

async function imageBitmapFromFile(file: File) {
  return await createImageBitmap(file, { imageOrientation: "from-image" });
}

async function suggestedPhotoFocus(file: File) {
  const bitmap = await imageBitmapFromFile(file);
  try {
    const Detector = (
      window as unknown as {
        FaceDetector?: new (options: { maxDetectedFaces: number }) => {
          detect: (source: ImageBitmap) => Promise<
            {
              boundingBox: {
                x: number;
                y: number;
                width: number;
                height: number;
              };
            }[]
          >;
        };
      }
    ).FaceDetector;
    if (!Detector) return { x: 50, y: 42 };
    const faces = await new Detector({ maxDetectedFaces: 1 }).detect(bitmap);
    const face = faces[0]?.boundingBox;
    if (!face) return { x: 50, y: 42 };
    return {
      x: Math.round(((face.x + face.width / 2) / bitmap.width) * 100),
      y: Math.round(((face.y + face.height / 2) / bitmap.height) * 100),
    };
  } finally {
    bitmap.close();
  }
}

async function optimizedProfilePhoto(
  file: File,
  focusX: number,
  focusY: number,
) {
  const bitmap = await imageBitmapFromFile(file);
  try {
    const side = Math.min(bitmap.width, bitmap.height);
    const centerX = (focusX / 100) * bitmap.width;
    const centerY = (focusY / 100) * bitmap.height;
    const sourceX = Math.max(
      0,
      Math.min(bitmap.width - side, centerX - side / 2),
    );
    const sourceY = Math.max(
      0,
      Math.min(bitmap.height - side, centerY - side / 2),
    );
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("This browser could not prepare the photo.");
    context.drawImage(bitmap, sourceX, sourceY, side, side, 0, 0, 1024, 1024);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", 0.82),
    );
    if (!blob) throw new Error("This browser could not prepare the photo.");
    return new File([blob], "profile-photo.jpg", { type: "image/jpeg" });
  } finally {
    bitmap.close();
  }
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
    [photoFile, setPhotoFile] = useState<File | null>(null),
    [photoPreview, setPhotoPreview] = useState(""),
    [focusX, setFocusX] = useState(50),
    [focusY, setFocusY] = useState(42),
    [photoBusy, setPhotoBusy] = useState(false);
  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
    };
  }, [photoPreview]);
  async function uploadPhoto(file: File) {
    setPhotoBusy(true);
    setError("");
    setMessage("");
    try {
      const prepared = await optimizedProfilePhoto(file, focusX, focusY);
      const form = new FormData();
      form.set("photo", prepared);
      const response = await fetch(`/api/parent/profile-photo/${profile.id}`, {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error);
      await reload();
      setPhotoFile(null);
      setPhotoPreview("");
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
        <details className={styles.profileEditor}>
          <summary>Photo or avatar</summary>
          <fieldset className={styles.photoField}>
            <legend className="sr-only">Photo or avatar</legend>
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
                  if (!file) return;
                  if (file.size > 25 * 1024 * 1024) {
                    setError("Choose a photo smaller than 25 MB.");
                    return;
                  }
                  setError("");
                  if (photoPreview) URL.revokeObjectURL(photoPreview);
                  setPhotoFile(file);
                  setPhotoPreview(URL.createObjectURL(file));
                  void suggestedPhotoFocus(file)
                    .then((focus) => {
                      setFocusX(focus.x);
                      setFocusY(focus.y);
                    })
                    .catch(() => {
                      setFocusX(50);
                      setFocusY(42);
                    });
                }}
              />
            </label>
            {photoFile && photoPreview && (
              <div className={styles.photoEditor}>
                <img
                  src={photoPreview}
                  alt="Profile photo preview"
                  style={{ objectPosition: `${focusX}% ${focusY}%` }}
                />
                <label>
                  Move left or right
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={focusX}
                    onChange={(event) => setFocusX(Number(event.target.value))}
                  />
                </label>
                <label>
                  Move up or down
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={focusY}
                    onChange={(event) => setFocusY(Number(event.target.value))}
                  />
                </label>
                <button
                  className="button"
                  type="button"
                  disabled={photoBusy}
                  onClick={() => void uploadPhoto(photoFile)}
                >
                  {photoBusy ? "Saving…" : "Use this photo"}
                </button>
              </div>
            )}
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
              Photos are cropped and compressed on this device, then stored
              privately. JPG, PNG, or WebP; up to 25 MB before processing.
            </p>
          </fieldset>
        </details>
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
        eyebrow="Family"
        title="Each one, their own space."
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
function RequestApproval({
  request,
  data,
  act,
  busy,
  reload,
}: {
  request: Request;
  data: Dashboard;
  act: (path: string, method: string, body?: unknown) => Promise<boolean>;
  busy: boolean;
  reload: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [profiles, setProfiles] = useState([request.profile_id]);
  const [collection, setCollection] = useState("");
  const [newTitle, setNewTitle] = useState("");
  if (!request.youtube_video_id) return null;
  return (
    <div>
      <div className={styles.row}>
        <button className="button" type="button" onClick={() => setOpen(!open)}>
          Approve
        </button>
        <details>
          <summary>Preview</summary>
          <YouTubeEmbed
            videoId={request.youtube_video_id}
            title={request.video_title || request.message}
          />
        </details>
      </div>
      {open && (
        <form
          onSubmit={async (event) => {
            event.preventDefault();
            if (collection === "__new") return;
            await act("/api/parent/requests", "PATCH", {
              id: request.id,
              status: "resolved",
              approve: true,
              profile_ids: profiles,
              ...(collection ? { collection_id: collection } : {}),
            });
          }}
        >
          <Choices
            profiles={data.profiles}
            value={profiles}
            setValue={setProfiles}
          />
          <label>
            Collection (optional)
            <select
              className="field"
              value={collection}
              onChange={(event) => setCollection(event.target.value)}
            >
              <option value="">No collection</option>
              {data.collections.map((item) => (
                <option value={item.id} key={item.id}>
                  {item.title}
                </option>
              ))}
              <option value="__new">+ New Collection</option>
            </select>
          </label>
          {collection === "__new" && (
            <div className="form-row">
              <input
                className="field"
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="Collection name"
                maxLength={120}
              />
              <button
                type="button"
                className="button-secondary"
                disabled={busy || !newTitle.trim()}
                onClick={async () => {
                  const created = await api<{ collection: Collection }>(
                    "/api/parent/collections",
                    "POST",
                    { title: newTitle.trim(), video_ids: [] },
                  );
                  await reload();
                  setCollection(created.collection.id);
                  setNewTitle("");
                }}
              >
                Create
              </button>
            </div>
          )}
          <button
            className="button"
            disabled={
              busy ||
              !profiles.includes(request.profile_id) ||
              collection === "__new"
            }
          >
            Approve video
          </button>
        </form>
      )}
    </div>
  );
}

export function Inbox() {
  const { data, act, busy, reload } = useParent();
  const pending = data.requests.filter((r) => r.status === "pending");
  const [checked, setChecked] = useState(false);
  return (
    <>
      <Heading
        eyebrow="Parent inbox"
        title={
          pending.length
            ? `${pending.length} little ${pending.length === 1 ? "request" : "requests"}.`
            : data.attention.length
              ? "A library update needs you."
              : "You’re all caught up."
        }
        description="See what caught their eye. You decide what joins the library."
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
              {r.thumbnail_url && (
                <img
                  className={styles.discoveryImage}
                  src={r.thumbnail_url}
                  alt=""
                />
              )}
              <h3>{r.video_title || r.message}</h3>
              {r.channel_title && <p className="muted">{r.channel_title}</p>}
              <p className="muted">
                {new Date(r.created_at).toLocaleDateString()}
              </p>
              <div className={styles.row}>
                {r.youtube_video_id ? (
                  <>
                    <RequestApproval
                      request={r}
                      data={data}
                      act={act}
                      busy={busy}
                      reload={reload}
                    />
                    <Link
                      className="button-secondary"
                      href={`/parent/add-video?url=${encodeURIComponent(`https://www.youtube.com/watch?v=${r.youtube_video_id}`)}`}
                    >
                      Review & organize
                    </Link>
                  </>
                ) : (
                  <Link
                    className="button"
                    href={`/parent/add-video?q=${encodeURIComponent(r.message)}`}
                  >
                    Find a video
                  </Link>
                )}
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
                  Not now
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

function SessionTimerCard({
  profile,
  status,
  serverNow,
  localReceivedAt,
  statusState,
  act,
  busy,
}: {
  profile: Profile;
  status?: SessionStatus["profiles"][number];
  serverNow?: string;
  localReceivedAt?: number;
  statusState: "checking" | "ready" | "unavailable";
  act: (path: string, method: string, body?: unknown) => Promise<boolean>;
  busy: boolean;
}) {
  const [duration, setDuration] = useState(
    profile.session_duration_minutes || 20,
  );
  const [clock, setClock] = useState({ monotonic: 0, wall: 0 });
  useEffect(() => {
    const tick = () =>
      setClock({ monotonic: performance.now(), wall: Date.now() });
    tick();
    const timer = window.setInterval(tick, 1000);
    return () => window.clearInterval(timer);
  }, []);
  const serverAnchor = Date.parse(serverNow || "");
  const localAnchor = localReceivedAt || clock.monotonic;
  const authoritative = Boolean(
    statusState === "ready" &&
    status &&
    Number.isFinite(serverAnchor) &&
    localReceivedAt,
  );
  const estimatedServerNow = Number.isFinite(serverAnchor)
    ? serverAnchor + Math.max(0, clock.monotonic - localAnchor)
    : clock.wall;
  const expiry = Date.parse(
    status?.access.expiresAt || profile.session_expires_at || "",
  );
  const pausedSeconds =
    status?.access.pausedSeconds ?? profile.session_paused_seconds ?? null;
  const remainingSeconds =
    status?.access.state === "paused"
      ? pausedSeconds || 0
      : estimatedServerNow > 0 && Number.isFinite(expiry)
        ? Math.max(0, Math.ceil((expiry - estimatedServerNow) / 1000))
        : 0;
  const remaining = authoritative
    ? Math.max(0, Math.ceil(remainingSeconds / 60))
    : null;
  const enabled =
    status?.access.enabled ?? profile.session_duration_minutes != null;
  const state = status?.access.state || (!enabled ? "unlimited" : "unknown");
  const revision =
    status?.access.revision ?? profile.session_state_revision ?? 0;
  const distinctDeviceMap = new Map<
    string,
    NonNullable<typeof status>["devices"][number]
  >();
  (status?.devices || []).forEach((device, index) => {
    if (!device.timer_last_seen_at) return;
    const key = device.device_id || `session-${index}`;
    // The API orders newest-first. Keep the first live session for a known device.
    if (!distinctDeviceMap.has(key)) distinctDeviceMap.set(key, device);
  });
  const distinctDevices = Array.from(distinctDeviceMap.values());
  const withAge = distinctDevices.map((device) => ({
    ...device,
    ageSeconds: Math.max(
      0,
      Math.floor(
        (estimatedServerNow - Date.parse(device.timer_last_seen_at || "")) /
          1000,
      ),
    ),
  }));
  const connected = withAge.filter(
    (device) => Number.isFinite(device.ageSeconds) && device.ageSeconds <= 10,
  );
  const offline = withAge.filter(
    (device) => !Number.isFinite(device.ageSeconds) || device.ageSeconds > 10,
  );
  const allConnectedAcknowledged =
    connected.length > 0 &&
    connected.every((device) => device.timer_ack_revision >= revision);
  const anyPlayerOpen = connected.some(
    (device) => device.timer_playback_active,
  );
  const latestAge = withAge.length
    ? Math.min(...withAge.map((device) => device.ageSeconds))
    : null;
  const offlineSuffix = offline.length
    ? ` · ${offline.length} other ${offline.length === 1 ? "device" : "devices"} offline or unconfirmed`
    : "";
  const deviceStatus =
    statusState === "checking"
      ? "Checking child devices…"
      : statusState === "unavailable"
        ? "Remote device status is unavailable. Try again in a moment."
        : latestAge === null
          ? "No child device has checked in yet."
          : connected.length
            ? `${connected.length} child ${connected.length === 1 ? "device" : "devices"} connected · ${
                allConnectedAcknowledged
                  ? "latest change received"
                  : "sending latest change"
              }${anyPlayerOpen ? " · player open" : ""}${offlineSuffix}`
            : `No child device is connected · last check-in ${Math.max(1, Math.ceil(latestAge / 60))} min ago${offlineSuffix}`;
  const control = (action: string, minutes?: number) =>
    act("/api/parent/session-timer", "POST", {
      profile_id: profile.id,
      action,
      ...(minutes ? { duration_minutes: minutes } : {}),
    });
  return (
    <section className={`panel ${styles.timerCard}`}>
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
            {state === "unlimited"
              ? "No session timer"
              : state === "unknown"
                ? "Timer on · checking time…"
                : state === "paused"
                  ? `Paused · ${remaining} min saved`
                  : state === "active"
                    ? `${remaining} min left`
                    : "Time’s up"}
          </p>
        </div>
      </div>
      <label>
        Session length
        <select
          className="field"
          value={duration}
          onChange={(event) => setDuration(Number(event.target.value))}
        >
          {[15, 20, 30, 45, 60, 90, 120].map((minutes) => (
            <option key={minutes} value={minutes}>
              {minutes} minutes
            </option>
          ))}
        </select>
      </label>
      <div className={styles.timerActions}>
        {state === "active" ? (
          <>
            <button
              className="button"
              disabled={busy || !authoritative}
              onClick={() => control("extend", 15)}
            >
              Add 15 minutes
            </button>
            <button
              className="button-secondary"
              disabled={busy || !authoritative}
              onClick={() => control("pause")}
            >
              Pause
            </button>
            <button
              className={styles.endButton}
              disabled={busy || !authoritative}
              onClick={() => control("end")}
            >
              End now
            </button>
          </>
        ) : state === "paused" ? (
          <>
            <button
              className="button"
              disabled={busy || !authoritative || remainingSeconds <= 0}
              onClick={() => control("resume")}
            >
              Resume
            </button>
            <button
              className="button-secondary"
              disabled={busy || !authoritative}
              onClick={() => control("extend", 15)}
            >
              Add 15 minutes
            </button>
            <button
              className={styles.endButton}
              disabled={busy || !authoritative}
              onClick={() => control("end")}
            >
              End now
            </button>
          </>
        ) : (
          <button
            className="button"
            disabled={busy || statusState !== "ready"}
            onClick={() => control("start", duration)}
          >
            Give {duration} minutes
          </button>
        )}
        {enabled && (
          <button
            className="button-quiet"
            disabled={busy || !authoritative}
            onClick={() => control("disable")}
          >
            Turn timer off
          </button>
        )}
      </div>
      <p className={styles.deviceStatus} role="status">
        <span data-connected={authoritative && connected.length > 0} />
        {deviceStatus}
      </p>
      <p className="muted">
        Active time counts down by the clock, including while a video is paused
        or WatchNest is in the background. Pausing from here saves the remaining
        allowance.
      </p>
    </section>
  );
}

export function Controls() {
  const { data, act, busy } = useParent();
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(
    null,
  );
  const [sessionStatusError, setSessionStatusError] = useState(false);
  useEffect(() => {
    let disposed = false;
    let timer: number | undefined;
    const refresh = async () => {
      try {
        const result = await api<SessionStatus>("/api/parent/session-status");
        if (!disposed) {
          setSessionStatus({ ...result, localReceivedAt: performance.now() });
          setSessionStatusError(false);
        }
      } catch {
        // Keep the last confirmed status visible; Parent actions still surface
        // their own errors through the shared Parent shell.
        if (!disposed) setSessionStatusError(true);
      } finally {
        if (!disposed) timer = window.setTimeout(refresh, 4000);
      }
    };
    void refresh();
    return () => {
      disposed = true;
      window.clearTimeout(timer);
    };
  }, []);
  const options = Array.from(
    { length: 37 },
    (_, index) => index * 30 + 300,
  ).filter((value) => value < 1440);
  return (
    <>
      <Heading
        eyebrow="Controls"
        title="Time & discovery."
        description="Choose when each child can watch and what they may ask you to add."
      />
      <h2>Session time</h2>
      <div className="grid grid-2">
        {data.profiles.map((profile) => (
          <SessionTimerCard
            profile={profile}
            status={sessionStatus?.profiles.find(
              (item) => item.id === profile.id,
            )}
            serverNow={sessionStatus?.serverNow}
            localReceivedAt={sessionStatus?.localReceivedAt}
            statusState={
              sessionStatusError
                ? "unavailable"
                : sessionStatus
                  ? "ready"
                  : "checking"
            }
            act={act}
            busy={busy}
            key={profile.id}
          />
        ))}
      </div>
      <p className="muted">
        Remote changes reach a connected child device in a few seconds. If a
        device is offline, it cannot receive an early End command until it
        reconnects, but it cannot continue beyond its last confirmed deadline.
      </p>
      <section className="notice">
        <h2>Using Guided Access</h2>
        <p>
          WatchNest stops playback when its timer ends. Guided Access can keep
          your child inside WatchNest, but Apple does not let this website read
          or control the Guided Access timer. Use Guided Access for navigation
          protection and the WatchNest timer for stopping video and sound.
        </p>
      </section>
      <h2>Discover</h2>
      <div className="grid grid-2">
        {data.profiles.map((profile) => (
          <form
            className="panel"
            key={`discover-${profile.id}`}
            onSubmit={async (event) => {
              event.preventDefault();
              const form = new FormData(event.currentTarget);
              const topics = String(form.get("topics") || "")
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
                .slice(0, 12);
              await act("/api/parent/profiles", "PATCH", {
                id: profile.id,
                discover_enabled:
                  form.get("enabled") === "on" &&
                  (topics.length > 0 || !!profile.discovery_channels?.length),
                discovery_topics: topics,
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
                  Every result still needs Parent approval.
                </p>
              </div>
            </div>
            <label className={styles.switchRow}>
              <input
                type="checkbox"
                name="enabled"
                defaultChecked={profile.discover_enabled}
              />
              <span>
                <strong>Discover videos</strong>
              </span>
            </label>
            <label>
              Topics they may search
              <input
                className="field"
                name="topics"
                defaultValue={(profile.discovery_topics || []).join(", ")}
                placeholder="Drawing, science, Jewish music"
              />
            </label>
            {!!profile.discovery_channels?.length && (
              <div>
                <p className="muted">
                  Allowed channels:{" "}
                  {profile.discovery_channels
                    .map((item) => item.title)
                    .join(" · ")}
                </p>
                <button
                  type="button"
                  className="button-quiet"
                  disabled={busy}
                  onClick={() =>
                    act("/api/parent/profiles", "PATCH", {
                      id: profile.id,
                      discovery_channels: [],
                    })
                  }
                >
                  Remove allowed channels
                </button>
              </div>
            )}
            <button className="button" disabled={busy}>
              Save Discover
            </button>
          </form>
        ))}
      </div>
      <h2>Available hours</h2>
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
      <p className="muted">
        Session time is a wall-clock access deadline. WatchNest does not measure
        or reconstruct YouTube watch time.
      </p>
    </>
  );
}

export function Settings() {
  const router = useRouter();
  const [pin, setPin] = useState(""),
    [confirmPin, setConfirmPin] = useState(""),
    [pinMessage, setPinMessage] = useState(""),
    [pinError, setPinError] = useState(""),
    [busy, setBusy] = useState(false),
    [setupResult, setSetupResult] = useState("");
  return (
    <>
      <Heading
        eyebrow="Settings"
        title="Family settings."
        description="Protect Parent Mode and manage this device."
      />
      <div className="grid grid-2">
        <section className="panel" style={{ gridColumn: "1 / -1" }}>
          <p className="eyebrow">Protection levels</p>
          <h2>Protection options</h2>
          <p className="muted">
            Safe Playback protects every Child Mode session. Add an iPad option
            if it fits your family.
          </p>
          <div className={styles.protectionGrid}>
            <article className={styles.protectionCard}>
              <span className={styles.protectionBadge}>Required</span>
              <h3>1. Safe Playback</h3>
              <p>
                Required in Child Mode. Only Parent-approved videos may play.
              </p>
              <div className={styles.switchRow}>
                <span>
                  <strong>Always on</strong>
                  <small>No special iPad setup needed</small>
                </span>
              </div>
            </article>
            <article className={styles.protectionCard}>
              <span className={styles.protectionBadge}>Optional</span>
              <h3>2. Enhanced YouTube protection</h3>
              <p>
                Keep normal web access while trying to restrict unrestricted
                YouTube.
              </p>
              <strong className={styles.protectionStatus}>
                Limited on iPad
              </strong>
              <p className="muted">
                Apple does not currently provide a reliable family setting that
                blocks only YouTube pages while guaranteeing embedded playback.
                Do not use Approved Websites Only; it can stop videos from
                playing.
              </p>
              <p className="muted">
                Removing the YouTube app still adds useful protection.
              </p>
            </article>
            <article className={styles.protectionCard}>
              <span className={styles.protectionBadge}>Maximum</span>
              <h3>3. Dedicated WatchNest device</h3>
              <p>For an iPad used mainly for WatchNest.</p>
              <ol className={styles.setupList}>
                <li>In Safari, add WatchNest to the Home Screen.</li>
                <li>Open the new WatchNest icon and confirm a video plays.</li>
                <li>Remove or restrict the YouTube app.</li>
                <li>Turn Safari off in Screen Time.</li>
                <li>Optional: use Guided Access for a focused session.</li>
              </ol>
            </article>
          </div>
          <p className="muted">
            Device restrictions are extra protection. Safe Playback remains the
            WatchNest control.
          </p>
          <button
            type="button"
            className="button-secondary"
            onClick={() => {
              const standalone =
                window.matchMedia("(display-mode: standalone)").matches ||
                (navigator as Navigator & { standalone?: boolean }).standalone;
              const touch = navigator.maxTouchPoints > 0;
              setSetupResult(
                `Safe Playback is always on. ${standalone ? "Home Screen mode is active" : "Open the Home Screen app for the strongest device setup"}. ${touch ? "Touch input detected" : "No touch input detected"}. YouTube app and Safari restrictions must be confirmed in iPad Settings.`,
              );
            }}
          >
            Check this browser
          </button>
          {setupResult && (
            <p className="notice" role="status">
              {setupResult}
            </p>
          )}
        </section>
        <form
          className="panel"
          onSubmit={async (event) => {
            event.preventDefault();
            setPinError("");
            setPinMessage("");
            if (pin.length !== 4) {
              setPinError("Enter a 4-digit Parent PIN.");
              return;
            }
            if (pin !== confirmPin) {
              setPinError("The PINs do not match.");
              return;
            }
            setBusy(true);
            try {
              await api("/api/parent/settings", "PATCH", { parent_pin: pin });
              setPin("");
              setConfirmPin("");
              setPinMessage("Parent PIN saved.");
            } catch (reason) {
              setPinError(
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
          {pinError && (
            <p className="error" role="alert">
              {pinError}
            </p>
          )}
          {pinMessage && (
            <p className="notice" role="status">
              {pinMessage}
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
        <section className="panel">
          <h2>Playback on this device</h2>
          <details>
            <summary>Ads and YouTube Premium</summary>
            <p className="muted">
              YouTube may show ads in embedded playback. WatchNest does not
              receive or transfer Premium entitlement through Google OAuth, so
              it cannot promise ad-free playback or a one-time Premium
              connection.
            </p>
          </details>
          <details>
            <summary>Volume</summary>
            <p className="muted">
              WatchNest starts supported player sessions at a comfortable 60%
              and remembers changes in this browser. On iPad, the physical
              volume buttons remain the reliable control; some embedded videos
              use the device volume directly.
            </p>
          </details>
          <details>
            <summary>Offline and travel</summary>
            <p className="muted">
              Offline YouTube downloads stay inside YouTube’s own signed-in apps
              and website. WatchNest does not copy or cache videos, so an
              internet connection is required for this beta.
            </p>
          </details>
        </section>
      </div>
    </>
  );
}
