"use client";

import { useEffect, useRef } from "react";
import { useMotionPrefs } from "@/components/providers/MotionPrefsProvider";

const pad = (n: number, w = 2) => String(n).padStart(w, "0");

function stamp(d: Date, ms: boolean): string {
  const base = `${d.getUTCFullYear()}.${pad(d.getUTCMonth() + 1)}.${pad(d.getUTCDate())} · ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}`;
  return ms ? `${base}.${pad(d.getUTCMilliseconds(), 3)}` : base;
}

/**
 * The instrument's own clock — a millisecond readout, as telemetry. Every reading on this site carries a timestamp, so
 * the panel shows the one it is taking now, in UTC like the solar archive.
 *
 * It writes textContent directly (no React state, no re-render), at 10Hz,
 * and only while it is on screen. Server output is a dashed placeholder so
 * hydration never disagrees with a clock that has moved on. Under reduced
 * motion it ticks once a second and drops the milliseconds, which keep a
 * readout changing at 10Hz — a reading, not a display.
 */
export function InstrumentClock({ className }: { className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const { animate } = useMotionPrefs();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const interval = animate ? 100 : 1000;
    let timer = 0;
    let onScreen = true;
    const tick = () => {
      el.textContent = stamp(new Date(), animate);
    };
    const run = () => {
      window.clearInterval(timer);
      if (onScreen && !document.hidden) {
        tick();
        timer = window.setInterval(tick, interval);
      }
    };
    const io = new IntersectionObserver(([entry]) => {
      onScreen = entry?.isIntersecting ?? true;
      run();
    });
    io.observe(el);
    document.addEventListener("visibilitychange", run);
    run();
    return () => {
      window.clearInterval(timer);
      io.disconnect();
      document.removeEventListener("visibilitychange", run);
    };
  }, [animate]);

  return (
    <span className={className}>
      <span className="text-ink-lo">UTC </span>
      {/* Fixed-width, contained box: a 10Hz text change is then a repaint of
          these 25 characters, not a layout of the hero's bottom row. */}
      <span ref={ref} className="tabular inline-block w-[28ch] whitespace-nowrap text-ink-md [contain:layout_paint_style]">
        ----.--.-- · --:--:--.---
      </span>
    </span>
  );
}
