"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { registry } from "@/data/registry";
import { useMotionPrefs } from "@/components/providers/MotionPrefsProvider";

const BlackHoleScene = dynamic(() => import("./BlackHoleScene"), { ssr: false });

const SESSION_KEY = "pow-intro";
const SCROLL_TO_COMPLETE = 2600; // px of accumulated intent

const sha = process.env.NEXT_PUBLIC_BUILD_SHA ?? "unversioned";

/** Readout lines, revealed as the singularity forms. All values are real. */
const LINES: { at: number; text: string }[] = [
  { at: 0.08, text: `SCANNING REPOSITORIES .......... ${registry.repositories} FOUND` },
  { at: 0.28, text: `RESOLVING EVIDENCE ............. ${registry.evidenceLinks} SOURCES LINKED` },
  { at: 0.48, text: `RECOMPUTING CLAIMS ............. ${registry.verifiedClaims} VERIFIED` },
  { at: 0.68, text: `NULL RESULTS ................... ${registry.nullResults} PUBLISHED` },
  { at: 0.86, text: `BUILD INTEGRITY ................ ${sha} OK` },
];

/**
 * The landing gate: a black hole that the reader forms by scrolling, and
 * passes through to reach the portfolio.
 *
 * Deliberate constraints, because an intro that stands between a
 * recruiter and the work is a liability if it misbehaves:
 *  · Once per session — a returning visitor never sees it twice.
 *  · Always skippable (button, Escape, or Enter) and never traps focus.
 *  · Reduced motion, or no WebGL: it does not mount at all.
 *  · It is an overlay on `/`, not a separate route, so the portfolio HTML
 *    is still what crawlers and direct links get. Nothing here is
 *    server-rendered; the page underneath is complete without it.
 *
 * Scroll is captured rather than delegated: wheel/touch accumulate a
 * progress value while the page underneath stays locked, so the gate
 * cannot fight Lenis for the real scroll position.
 */
export function IntroGate() {
  const { animate } = useMotionPrefs();
  const [active, setActive] = useState(false);
  const [complete, setComplete] = useState(false);
  const [shown, setShown] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const progressRef = useRef(0);
  const accRef = useRef(0);
  const touchRef = useRef(0);

  const dismiss = useCallback(() => {
    setLeaving(true);
    window.setTimeout(() => {
      setActive(false);
      document.documentElement.style.overflow = "";
    }, 620);
  }, []);

  // Decide once, on mount, whether the gate runs at all.
  useEffect(() => {
    if (!animate) return;
    if (sessionStorage.getItem(SESSION_KEY) === "1") return;
    let webgl = false;
    try {
      const c = document.createElement("canvas");
      webgl = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      webgl = false;
    }
    if (!webgl) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    // The gate replaces the terminal boot overlay for this visit — a
    // first-time reader must never be handed two curtains in a row.
    // If the gate bails out above (reduced motion, no WebGL), the boot
    // sequence still runs as the fallback intro.
    sessionStorage.setItem("pow-booted", "1");
    setActive(true);
    document.documentElement.style.overflow = "hidden";
  }, [animate]);

  // Scroll capture + keyboard escape hatches.
  useEffect(() => {
    if (!active) return;

    const advance = (delta: number) => {
      accRef.current = Math.min(
        Math.max(accRef.current + delta, 0),
        SCROLL_TO_COMPLETE,
      );
      const p = accRef.current / SCROLL_TO_COMPLETE;
      progressRef.current = p;
      setShown(LINES.filter((l) => p >= l.at).length);
      if (p >= 1) setComplete(true);
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      advance(e.deltaY);
    };
    const onTouchStart = (e: TouchEvent) => {
      touchRef.current = e.touches[0]?.clientY ?? 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const y = e.touches[0]?.clientY ?? 0;
      advance((touchRef.current - y) * 2.2);
      touchRef.current = y;
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        dismiss();
        return;
      }
      if (e.key === "Enter" && progressRef.current >= 1) {
        dismiss();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "PageDown" || e.key === " ") {
        e.preventDefault();
        advance(320);
      }
      if (e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        advance(-320);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKey);
    };
  }, [active, dismiss]);

  // Never leave the page locked if this unmounts unexpectedly.
  useEffect(() => {
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, []);

  if (!active) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Introduction — scroll to continue to the portfolio"
      className="fixed inset-0 z-[95] bg-[#03050a] transition-opacity duration-[620ms]"
      style={{ opacity: leaving ? 0 : 1 }}
    >
      <BlackHoleScene progressRef={progressRef} />

      {/* readout */}
      <div className="pointer-events-none absolute inset-x-0 top-0 p-[var(--page-margin)]">
        <p className="font-mono text-label tracking-[0.16em] text-ink-md">
          PROOF OF WORK — SOUMYADEB TRIPATHY
        </p>
        <ol className="mt-6 space-y-1.5">
          {LINES.slice(0, shown).map((l) => (
            <li key={l.text} className="font-mono text-[0.8125rem] text-ink-md">
              {l.text}
            </li>
          ))}
        </ol>
      </div>

      {/* progress + entry */}
      <div className="absolute inset-x-0 bottom-0 p-[var(--page-margin)]">
        <div className="mx-auto max-w-md text-center">
          {complete ? (
            <button
              type="button"
              onClick={dismiss}
              autoFocus
              className="rounded-r2 border border-seal bg-seal-dim px-7 py-3 font-mono text-claim font-medium tracking-[0.14em] text-seal uppercase transition-colors duration-[var(--dur-tick)] hover:bg-seal/20"
            >
              Enter the portfolio ↓
            </button>
          ) : (
            <>
              <p className="mono-label mb-3 text-ink-md">SCROLL TO COLLAPSE</p>
              <div
                className="mx-auto h-px w-56 overflow-hidden bg-line"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Intro progress"
              >
                <div
                  className="h-full origin-left bg-seal transition-[width] duration-150"
                  style={{ width: `${Math.round((shown / LINES.length) * 100)}%` }}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={dismiss}
        className="absolute right-[var(--page-margin)] bottom-[var(--page-margin)] rounded-r1 border border-line px-3 py-2 font-mono text-label text-ink-lo transition-colors duration-[var(--dur-tick)] hover:border-line-strong hover:text-ink-md"
      >
        SKIP [ESC]
      </button>
    </div>
  );
}
