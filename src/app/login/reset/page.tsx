"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
export default function Reset() {
  const router = useRouter();
  const started = useRef(false);
  const [verified, setVerified] = useState(false),
    [error, setError] = useState(""),
    [password, setPassword] = useState(""),
    [confirm, setConfirm] = useState(""),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    const q = new URLSearchParams(window.location.search);
    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const token = q.get("token_hash");
    const access = fragment.get("access_token");
    const refresh = fragment.get("refresh_token");
    const type = token ? q.get("type") || "recovery" : fragment.get("type");
    const callback = token
      ? { token_hash: token, type }
      : access && refresh && type === "recovery"
        ? { access_token: access, refresh_token: refresh, type }
        : null;
    window.history.replaceState({}, "", window.location.pathname);
    if (!callback) {
      setError(
        "This recovery link is incomplete. Request a new link from Parent sign in.",
      );
      return;
    }
    fetch("/api/auth/callback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(callback),
    })
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok)
          throw Error(d.error || "This link has expired. Request a new link.");
        window.history.replaceState({}, "", window.location.pathname);
        setVerified(true);
      })
      .catch((e) => setError(e.message));
  }, []);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("The passwords don’t match.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const r = await fetch("/api/auth/parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-password",
          email: "Avromy@gmail.com",
          password,
        }),
      });
      const d = await r.json();
      if (!r.ok) throw Error(d.error || "Unable to update password.");
      router.push("/parent/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please retry.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main
      id="main-content"
      className="shell"
      style={{ maxWidth: 600, paddingTop: 70 }}
    >
      <Link className="brand" href="/">
        <img src="/icon.svg" width="38" height="38" alt="" />
        WatchNest
      </Link>
      <section className="panel" style={{ marginTop: 32 }}>
        <h1 style={{ fontSize: "2rem" }}>A fresh start.</h1>
        <p className="muted">Choose a new password for Parent Mode.</p>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
        {!verified && !error && <p role="status">Checking your secure link…</p>}
        {verified && (
          <form onSubmit={submit} style={{ display: "grid", gap: 14 }}>
            <label htmlFor="new-password">New password</label>
            <input
              id="new-password"
              className="field"
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="confirm-password">Confirm new password</label>
            <input
              id="confirm-password"
              className="field"
              type="password"
              autoComplete="new-password"
              minLength={12}
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
            />
            <button className="button" disabled={busy}>
              {busy ? "Saving…" : "Save password"}
            </button>
          </form>
        )}
        <Link href="/login" className="button-quiet">
          Back to sign in
        </Link>
      </section>
    </main>
  );
}
