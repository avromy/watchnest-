"use client";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Profile } from "./model";
import ProfileImage from "../ProfileImage";
import Icon from "../ui/Icon";

export default function ChildLogin() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [parentMode, setParentMode] = useState(false);
  const [parentPinSet, setParentPinSet] = useState(false);
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function openPicker() {
      try {
        await api("/api/auth/profile-exit", {});
        const result = await api<{
          profiles: Profile[];
          parent_pin_set: boolean;
        }>("/api/auth/device");
        if (cancelled) return;
        setProfiles(result.profiles);
        setParentPinSet(result.parent_pin_set);
        await api("/api/auth/parent-lock", {});
      } catch {
        if (!cancelled) router.replace("/login");
      } finally {
        if (!cancelled) setBusy(false);
      }
    }
    void openPicker();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function enterChild(profile: Profile, enteredPin = "") {
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/child", {
        profileId: profile.id,
        passcode: enteredPin || undefined,
      });
      router.replace("/watch/home");
    } catch (reason) {
      setError((reason as Error).message);
      setBusy(false);
    }
  }

  async function submitPin(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;
    await enterChild(selected, pin);
  }

  async function enterParent(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/parent-mode", { pin });
      router.replace("/parent/dashboard");
    } catch (reason) {
      setError((reason as Error).message);
      setBusy(false);
    }
  }

  if (busy && !profiles.length)
    return (
      <main id="main-content" className="profile-picker">
        <div className="picker-loading" role="status">
          <img src="/icon.svg" alt="" width="58" height="58" />
          <span>Opening WatchNest…</span>
        </div>
      </main>
    );

  return (
    <main id="main-content" className="profile-picker">
      <header className="picker-header">
        <span className="brand">
          <img src="/icon.svg" alt="" width="42" height="42" />
          WatchNest
        </span>
      </header>
      <section className="picker-content" aria-labelledby="picker-title">
        <div className="picker-heading">
          <h1 id="picker-title">Who’s watching?</h1>
        </div>
        {error && (
          <p role="alert" className="error picker-error">
            {error}
          </p>
        )}
        <div className="profile-grid">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              className="profile-choice"
              disabled={busy}
              onClick={() => {
                setError("");
                setPin("");
                if (profile.pin_enabled) setSelected(profile);
                else void enterChild(profile);
              }}
            >
              <ProfileImage
                name={profile.display_name}
                avatar={profile.avatar_key}
                photoUrl={profile.photo_url}
                size="large"
              />
              <strong>{profile.display_name}</strong>
              {profile.pin_enabled && (
                <span className="profile-lock">
                  <Icon name="lock" width="15" /> PIN
                </span>
              )}
            </button>
          ))}
        </div>
        <button
          className="parent-entry"
          onClick={() => {
            setError("");
            setPin("");
            if (parentPinSet) setParentMode(true);
            else router.push("/login?parent=1");
          }}
        >
          <Icon name="lock" width="18" /> Parent Mode
        </button>
      </section>
      {(selected || parentMode) && (
        <div
          className="picker-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pin-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelected(null);
              setParentMode(false);
              setPin("");
              setError("");
            }
          }}
        >
          <form
            className="pin-card"
            onSubmit={parentMode ? enterParent : submitPin}
          >
            {selected && (
              <ProfileImage
                name={selected.display_name}
                avatar={selected.avatar_key}
                photoUrl={selected.photo_url}
                size="medium"
              />
            )}
            <h2 id="pin-title">
              {parentMode ? "Parent Mode" : `${selected?.display_name}’s PIN`}
            </h2>
            <p>
              {parentMode
                ? "Enter the 4-digit Parent PIN."
                : "Enter the 4-digit PIN."}
            </p>
            <label className="sr-only" htmlFor="profile-pin">
              4-digit PIN
            </label>
            <input
              id="profile-pin"
              className="pin-input"
              type="password"
              inputMode="numeric"
              autoComplete="off"
              pattern="[0-9]{4}"
              minLength={4}
              maxLength={4}
              value={pin}
              onChange={(event) =>
                setPin(event.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="••••"
              autoFocus
              required
            />
            {error && (
              <p role="alert" className="error">
                {error}
              </p>
            )}
            <button className="button" disabled={busy || pin.length !== 4}>
              {busy ? "Opening…" : "Continue"}
            </button>
            <button
              type="button"
              className="button-quiet"
              onClick={() => {
                setSelected(null);
                setParentMode(false);
                setPin("");
                setError("");
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </main>
  );
}
