"use client";

import { useEffect, useId, useRef, useState } from "react";
import YouTubeEmbed from "../YouTubeEmbed";
import styles from "./Parent.module.css";

/** Parent-only review surface. Opening it never approves or assigns a video. */
export default function RequestPreview({
  videoId,
  title,
}: {
  videoId: string;
  title: string;
}) {
  const [open, setOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [slow, setSlow] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const trigger = useRef<HTMLButtonElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  useEffect(() => {
    if (!open) return;
    close.current?.focus();
    const returnFocus = trigger.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
      returnFocus?.focus();
    };
  }, [open]);
  useEffect(() => {
    if (!open || loaded) return;
    const timer = window.setTimeout(() => setSlow(true), 12000);
    return () => window.clearTimeout(timer);
  }, [open, loaded, attempt]);
  const valid = /^[A-Za-z0-9_-]{11}$/.test(videoId);
  return (
    <>
      <button
        ref={trigger}
        type="button"
        className="button-secondary"
        onClick={() => {
          setLoaded(false);
          setSlow(false);
          setOpen(true);
        }}
      >
        Preview
      </button>
      {open && (
        <div
          className={styles.modal}
          role="dialog"
          aria-modal="true"
          aria-labelledby={headingId}
          onKeyDown={(event) => {
            if (event.key === "Escape") {
              event.preventDefault();
              setOpen(false);
            }
            if (event.key === "Tab") {
              const items = Array.from(
                event.currentTarget.querySelectorAll<HTMLElement>(
                  "button, iframe, a[href]",
                ),
              );
              const first = items[0],
                last = items[items.length - 1];
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last?.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first?.focus();
              }
            }
          }}
        >
          <section className="panel">
            <div className={styles.row}>
              <h2 id={headingId}>{title}</h2>
              <button
                ref={close}
                type="button"
                className="button-secondary"
                onClick={() => setOpen(false)}
              >
                Close preview
              </button>
            </div>
            {valid ? (
              <>
                <YouTubeEmbed
                  key={attempt}
                  className={styles.player}
                  videoId={videoId}
                  title={title}
                  onLoad={() => {
                    setLoaded(true);
                    setSlow(false);
                  }}
                />
                <p role="status" className="muted">
                  {slow
                    ? "The preview is taking longer than expected. Check your connection or device video filter, then retry."
                    : loaded
                      ? "If the video is available, use YouTube’s Play button to preview it."
                      : "Loading the preview…"}
                </p>
                <button
                  type="button"
                  className="button-secondary"
                  onClick={() => {
                    setLoaded(false);
                    setSlow(false);
                    setAttempt((value) => value + 1);
                  }}
                >
                  Retry preview
                </button>
              </>
            ) : (
              <p role="alert" className="error">
                This request has an invalid video link. Use Review &amp;
                organize to check it.
              </p>
            )}
            <p className="muted">
              Parent preview uses YouTube’s player. YouTube controls its
              recommendations and availability. Previewing does not add this
              video to any child’s library.
            </p>
          </section>
        </div>
      )}
    </>
  );
}
