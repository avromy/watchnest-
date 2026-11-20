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
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);
  const [handoff, setHandoff] = useState(false);
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
          active_profile_id: string | null;
        }>("/api/auth/device");
        if (cancelled) return;
        setProfiles(result.profiles);
        setParentPinSet(result.parent_pin_set);
        setActiveProfileId(result.active_profile_id ?? null);
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
        passcode: !handoff ? enteredPin || undefined : undefined,
        parentPin: handoff ? enteredPin || undefined : undefined,
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
          <h1 id="picker-title">Who’s watching?</h1>
          <p>
            Choose your library. A parent helps when it’s someone else’s turn.
          </p>
        </div>
        {error && !selected && !parentMode && (
          <p role="alert" className="error picker-error">
            {error}
          </p>
        )}
        {!profiles.length && (
          <div className="picker-empty">
            <p>
              No profiles are available. Refresh to check again, or open Parent
              Mode for family settings.
            </p>
            <button
              className="button-secondary"
              onClick={() => window.location.reload()}
            >
              Refresh profiles
            </button>
          </div>
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
                const needsHandoff = activeProfileId !== profile.id;
                setHandoff(needsHandoff);
                if (needsHandoff && !parentPinSet) {
                  router.push("/login?parent=1");
                } else if (needsHandoff || profile.pin_enabled)
                  setSelected(profile);
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
              <span className="profile-lock">
                {(activeProfileId !== profile.id || profile.pin_enabled) && (
                  <Icon name="lock" width="15" />
                )}
                {activeProfileId !== profile.id
                  ? "Parent handoff"
                  : profile.pin_enabled
                    ? "PIN"
                    : "Selected profile"}
              </span>
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
            setHandoff(false);
            if (parentPinSet) setParentMode(true);
            else router.push("/login?parent=1");
          }}
        >
          <Icon name="lock" width="18" /> Parent Mode
        </button>
      </section>
      <footer className="picker-footer">
        <Icon name="library" width="18" /> Approved videos for your family
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
              {parentMode
                ? "Parent Mode"
                : handoff
                  ? `Open ${selected?.display_name}’s library`
                  : `${selected?.display_name}’s PIN`}
            </h2>
            <p>
              {parentMode || handoff
                ? handoff
                  ? "Parent: enter your 4-digit PIN to hand over this device. This doesn’t change anyone’s time limit."
                  : "Enter the 4-digit Parent PIN."
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
