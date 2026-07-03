"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { registry } from "@/data/registry";
import { useMotionPrefs } from "@/components/providers/MotionPrefsProvider";

const SESSION_KEY = "pow-booted";

/**
 * The verification boot (design/06-motion.md §2, BOOT verb).
 * Not a loading screen: the page behind is fully rendered — this is a
 * ≤3s theater overlay, client-only (no-JS visitors never see it), run
 * once per session, skippable by button, key, or click, and skipped
 * entirely under reduced motion. Every line is real portfolio data.
 */

const sha = process.env.NEXT_PUBLIC_BUILD_SHA ?? "unversioned";

const LINES = [
  { at: 0, text: "INITIALIZING PROOF OF WORK" },
  { at: 350, text: `SCANNING REPOSITORIES .......... ${registry.repositories} FOUND` },
  { at: 750, text: `CHECKING EVIDENCE .............. ${registry.evidenceLinks} SOURCES LINKED` },
  { at: 1150, text: "VALIDATING AUDIT REPORTS ....... ASTRA 8/8 PASS" },
  { at: 1550, text: `COMPUTING METRICS .............. ${registry.verifiedClaims} CLAIMS, ${registry.nullResults} NULL RESULT` },
  { at: 1950, text: `VERIFYING BUILD INTEGRITY ...... ${sha} OK` },
  { at: 2400, text: "EVIDENCE CHAIN COMPLETE" },
] as const;

const TOTAL_MS = 2900;

export function BootSequence() {
  const { animate } = useMotionPrefs();
  const [active, setActive] = useState(false);
  const [lineCount, setLineCount] = useState(0);
  const timers = useRef<number[]>([]);

  const finish = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setActive(false);
    // Tell the WebGL scene (and anything else waiting on the curtain) that
    // the opaque boot overlay is gone, so its opening animation plays in
    // view rather than hidden behind the curtain.
    window.dispatchEvent(new Event("pow:ready"));
  }, []);

  useEffect(() => {
    const willSkip =
      process.env.NEXT_PUBLIC_DISABLE_BOOT === "1" ||
      !animate ||
      sessionStorage.getItem(SESSION_KEY) === "1";
    if (willSkip) {
      window.dispatchEvent(new Event("pow:ready"));
      return;
    }
    sessionStorage.setItem(SESSION_KEY, "1");
    setActive(true);
    document.documentElement.style.overflow = "hidden";

    LINES.forEach((line, i) => {
      timers.current.push(window.setTimeout(() => setLineCount(i + 1), line.at));
    });
    timers.current.push(window.setTimeout(finish, TOTAL_MS));
    return () => timers.current.forEach(clearTimeout);
  }, [animate, finish]);

  // Restore scroll + allow any key to skip while active.
  useEffect(() => {
    if (!active) {
      document.documentElement.style.overflow = "";
      return;
    }
    const onKey = () => finish();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [active, finish]);

  return (
    <AnimatePresence>
      {active ? (
        <motion.div
          role="status"
          aria-label="Verifying portfolio build"
          exit={{ opacity: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } }}
          onClick={finish}
          className="fixed inset-0 z-90 flex cursor-pointer items-center justify-center bg-bg-0"
        >
          <div className="w-[min(560px,calc(100vw-48px))]" aria-hidden="true">
            <ol className="min-h-44 space-y-1.5 font-mono text-[0.8125rem] leading-relaxed">
              {LINES.slice(0, lineCount).map((line, i) => {
                const isLast = i === LINES.length - 1;
                return (
                  <motion.li
                    key={line.text}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                    className={isLast ? "pt-2 text-seal" : "text-ink-md"}
                  >
                    {isLast ? "◆ " : ""}
                    {line.text}
                  </motion.li>
                );
              })}
            </ol>
          </div>
          <button
            type="button"
            onClick={finish}
            className="mono-label absolute right-6 bottom-6 cursor-pointer border border-line px-3 py-2 rounded-r1 hover:border-line-strong hover:text-ink-md"
          >
            SKIP [ESC]
          </button>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
