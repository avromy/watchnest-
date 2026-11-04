"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { api, Profile } from "./model";
import ProfileImage from "../ProfileImage";
import Icon from "../ui/Icon";
import "./ChildExperience.css";

export default function ChildLogin() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [parentMode, setParentMode] = useState(false);
  const [parentPinSet, setParentPinSet] = useState(false);
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(true);
  const [error, setError] = useState("");
  const submittedPin = useRef("");
  const modalRef = useRef<HTMLDivElement>(null);
  const modalTrigger = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!selected && !parentMode) return;
    const dialog = modalRef.current;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelected(null);
        setParentMode(false);
        setPin("");
        setError("");
        submittedPin.current = "";
      }
      if (event.key !== "Tab" || !dialog) return;
      const controls = Array.from(
        dialog.querySelectorAll<HTMLElement>("input, button:not(:disabled)"),
      );
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      modalTrigger.current?.focus();
    };
  }, [selected, parentMode]);

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
      setPin("");
      submittedPin.current = "";
      setBusy(false);
    }
  }

  async function enterParent(enteredPin: string) {
    setBusy(true);
    setError("");
    try {
      await api("/api/auth/parent-mode", { pin: enteredPin });
      router.replace("/parent/dashboard");
    } catch (reason) {
      setError((reason as Error).message);
      setPin("");
      submittedPin.current = "";
      setBusy(false);
    }
  }

  useEffect(() => {
    if (pin.length !== 4 || busy || submittedPin.current === pin) return;
    submittedPin.current = pin;
    if (parentMode) void enterParent(pin);
    else if (selected) void enterChild(selected, pin);
    // Entry is intentionally triggered by the completed four-digit value.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin, parentMode, selected, busy]);

  if (busy && !profiles.length)
    return (
      <main id="main-content" className="profile-picker premium-profile-picker">
        <div className="picker-loading" role="status">
          <img src="/icon.svg" alt="" width="58" height="58" />
          <span>Opening WatchNest…</span>
        </div>
      </main>
    );

  return (
    <main id="main-content" className="profile-picker premium-profile-picker">
      <header className="picker-header">
        <span className="brand">
          <img src="/icon.svg" alt="" width="42" height="42" />
          WatchNest
        </span>
      </header>
      <section className="picker-content" aria-labelledby="picker-title">
        <div className="picker-heading">
          <p className="eyebrow">Make yourself at home</p>
          <h1 id="picker-title">Who’s watching?</h1>
          <p>Your favorites. Your discoveries. Your own little library.</p>
        </div>
        {error && !selected && !parentMode && (
          <p role="alert" className="error picker-error">
            {error}
          </p>
        )}
        {!profiles.length && (
          <p className="picker-empty">
            Your family library is almost ready. Parent can add a profile in
            Parent Mode.
          </p>
        )}
        <div className="profile-grid">
          {profiles.map((profile) => (
            <button
              key={profile.id}
              className="profile-choice"
              disabled={busy}
              onClick={(event) => {
                modalTrigger.current = event.currentTarget;
                setError("");
                setPin("");
                submittedPin.current = "";
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
              <span className="profile-enter">
                Open my library <span aria-hidden="true">↗</span>
              </span>
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
          onClick={(event) => {
            modalTrigger.current = event.currentTarget;
            setError("");
            setPin("");
            submittedPin.current = "";
            if (parentPinSet) setParentMode(true);
            else router.push("/login?parent=1");
          }}
        >
          <Icon name="lock" width="18" /> Parent Mode
        </button>
      </section>
      <footer className="picker-footer">
        <Icon name="library" width="18" /> A little library. A world to explore.
      </footer>
      {(selected || parentMode) && (
        <div
          className="picker-modal"
          ref={modalRef}
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
          <div className="pin-card">
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
            {busy && <p role="status">Opening…</p>}
            <button
              type="button"
              className="button-quiet"
              onClick={() => {
                setSelected(null);
                setParentMode(false);
                setPin("");
                submittedPin.current = "";
                setError("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
