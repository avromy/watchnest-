"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import styles from "./login.module.css";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/auth/parent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: recovery ? undefined : password,
          action: recovery ? "reset" : "login",
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(
          data.error || "We couldn’t sign you in. Please try again.",
        );
      if (data.message) setMessage(data.message);
      else
        router.replace(
          new URLSearchParams(window.location.search).get("parent") === "1"
            ? "/parent/settings"
            : "/watch",
        );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Unable to connect. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <main id="main-content" className={styles.loginPage}>
      <aside className={styles.introduction} aria-label="About WatchNest">
        <span className={styles.kicker}>WATCHNEST · FAMILY LIBRARY</span>
        <h2>Your family’s<br />video library.</h2>
        <p>Videos you choose. A space of their own.</p>
        <div className={styles.libraryMark} aria-hidden="true"><img src="/icon.svg" alt="" width="112" height="112" /></div>
        <span className={styles.assurance}>Individual profiles. Parent-approved videos.</span>
      </aside>
      <section className={styles.loginCard}>
        <Link className={styles.logo} href="/" aria-label="WatchNest home">
          <img src="/icon.svg" alt="" width="48" height="48" />
          <span>WatchNest</span>
        </Link>
        <div className={styles.heading}>
          <h1>{recovery ? "Reset your password" : "Sign in"}</h1>
          <p>
            {recovery
              ? "We’ll email you a secure reset link."
              : "Open your family’s WatchNest."}
          </p>
        </div>
        <form onSubmit={submit}>
          <label htmlFor="email">Email</label>
          <input
            className="field"
            id="email"
            autoComplete="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          {!recovery && (
            <>
              <label htmlFor="password">Password</label>
              <input
                className="field"
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
              />
              <button type="button" className={styles.passwordToggle} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? "Hide password" : "Show password"}</button>
            </>
          )}
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
          <button className="button" type="submit" disabled={busy}>
            {busy ? "Please wait…" : recovery ? "Send reset link" : "Sign in"}
          </button>
        </form>
        <button
          className="button-quiet"
          onClick={() => {
            setRecovery(!recovery);
            setError("");
            setMessage("");
          }}
        >
          {recovery ? "Back to sign in" : "Forgot password?"}
        </button>
        <Link className={styles.privacy} href="/privacy">
          Privacy and YouTube playback
        </Link>
      </section>
    </main>
  );
}
