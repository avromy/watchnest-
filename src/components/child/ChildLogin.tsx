"use client";
import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api, avatarColors, Profile } from "./model";
import ProfileIdentity from "../ProfileIdentity";
export default function ChildLogin() {
  const router = useRouter();
  const [family, setFamily] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [passcode, setPasscode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let cancelled = false;
    const supplied =
      new URLSearchParams(window.location.search).get("family")?.trim() || "";
    let remembered = "";
    try {
      remembered = localStorage.getItem("watchnest-household") || "";
    } catch {
      /* Private browsing may disable storage. */
    }
    const code = supplied || remembered;
    setFamily(code);
    if (supplied) setBusy(true);
    async function initialize() {
      try {
        const session = await api<{ role: string | null }>("/api/session");
        if (cancelled) return;
        if (session.role === "child") {
          router.replace("/watch/home");
          return;
        }
        if (supplied) {
          const result = await api<{ profiles: Profile[] }>(
            `/api/auth/children?family=${encodeURIComponent(supplied)}`,
          );
          if (cancelled) return;
          setProfiles(result.profiles);
          if (!result.profiles.length)
            setError(
              "No profiles found. Check your household code with a parent.",
            );
          try {
            localStorage.setItem("watchnest-household", supplied);
          } catch {
            /* Optional convenience only. */
          }
        }
      } catch (err) {
        if (!cancelled) setError((err as Error).message);
      } finally {
        if (!cancelled) setBusy(false);
      }
    }
    void initialize();
    return () => {
      cancelled = true;
    };
  }, [router]);
  async function load(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const d = await api<{ profiles: Profile[] }>(
        `/api/auth/children?family=${encodeURIComponent(family.trim())}`,
      );
      setProfiles(d.profiles);
      try {
        localStorage.setItem("watchnest-household", family.trim());
      } catch {
        /* Optional convenience only. */
      }
      if (!d.profiles.length)
        setError("No profiles found. Check your household code with a parent.");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function login(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/child", {
        family: family.trim(),
        profileId: selected.id,
        passcode,
      });
      router.replace("/watch/home");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="shell"
      style={{ maxWidth: 900 }}
    >
      <header className="topbar">
        <Link className="brand" href="/">
          WatchNest
        </Link>
        <Link className="button button-quiet" href="/parent">
          Parent sign in
        </Link>
      </header>
      <div
        className="page-heading"
        style={{ textAlign: "center", marginTop: 40 }}
      >
        <p className="eyebrow">Your own little library</p>
        <h1>
          {selected ? `Hi, ${selected.display_name}!` : "Who’s watching?"}
        </h1>
        <p className="muted">
          Pick your profile to find the videos chosen for you.
        </p>
      </div>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      {!profiles.length ? (
        <form
          className="panel"
          onSubmit={load}
          style={{ maxWidth: 440, margin: "24px auto" }}
        >
          <label className="field">
            Household code
            <input
              autoComplete="off"
              value={family}
              onChange={(e) => setFamily(e.target.value)}
              required
              placeholder="Ask a parent for your code"
            />
          </label>
          <button className="button" disabled={busy}>
            {busy ? "Finding your family…" : "Find my family"}
          </button>
        </form>
      ) : selected ? (
        <form
          className="panel"
          onSubmit={login}
          style={{ maxWidth: 440, margin: "24px auto" }}
        >
          {selected.pin_enabled ? (
            <label className="field">
              Your passcode
              <input
                type="password"
                inputMode="numeric"
                autoComplete="current-password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                required
                autoFocus
              />
            </label>
          ) : (
            <p>No passcode needed. Open your own library when you’re ready.</p>
          )}
          <div className="form-row">
            <button className="button" disabled={busy}>
              {busy ? "Opening…" : "Open my library"}
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                setSelected(null);
                setPasscode("");
                setError("");
              }}
            >
              Go back
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className="grid grid-2">
            {profiles.map((p) => (
              <button
                key={p.id}
                className="panel"
                style={{
                  cursor: "pointer",
                  textAlign: "center",
                  padding: 32,
                  minHeight: 200,
                }}
                onClick={() => setSelected(p)}
              >
                <span
                  className="avatar"
                  style={{
                    background: avatarColors[p.color_key] || avatarColors.mint,
                    display: "inline-flex",
                    fontSize: 36,
                    width: 88,
                    height: 88,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  aria-hidden="true"
                >
                  <ProfileIdentity identity={p.avatar_key} />
                </span>
                <h2 style={{ fontSize: 28 }}>{p.display_name}</h2>
                {p.pin_enabled && (
                  <span className="muted">Your own passcode</span>
                )}
                {!p.pin_enabled && (
                  <span className="muted">No passcode needed</span>
                )}
              </button>
            ))}
          </div>
          <button
            className="button button-quiet"
            style={{ marginTop: 24 }}
            onClick={() => {
              setProfiles([]);
              setError("");
            }}
          >
            Use a different household code
          </button>
        </>
      )}
    </main>
  );
}
