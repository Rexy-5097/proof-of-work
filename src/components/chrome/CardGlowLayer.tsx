"use client";

import { useEffect, useRef } from "react";
import { useMotionPrefs } from "@/components/providers/MotionPrefsProvider";

/**
 * Cursor-as-weak-light-source (design/02-visual-language.md §5): one
 * document-level, rAF-throttled pointermove listener finds whichever
 * `.panel-e1` the pointer is over and writes `--mx`/`--my` (percent)
 * onto it; the glow itself is a pure-CSS radial-gradient pseudo-element
 * (see `.panel-e1-glow-target` in globals.css) so this component only
 * ever touches two custom properties and one data attribute — no
 * layout, no repaint of anything but the target panel.
 */
export function CardGlowLayer() {
  const { animate } = useMotionPrefs();
  const activeRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!animate || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let raf = 0;
    let last: { x: number; y: number; target: EventTarget | null } | null = null;

    const apply = () => {
      raf = 0;
      if (!last) return;
      const panel = (last.target as Element | null)?.closest<HTMLElement>(".panel-e1-glow-target") ?? null;
      if (panel !== activeRef.current) {
        activeRef.current?.removeAttribute("data-glow");
        activeRef.current = panel;
        panel?.setAttribute("data-glow", "1");
      }
      if (panel) {
        const rect = panel.getBoundingClientRect();
        const mx = ((last.x - rect.left) / rect.width) * 100;
        const my = ((last.y - rect.top) / rect.height) * 100;
        panel.style.setProperty("--mx", `${mx.toFixed(1)}%`);
        panel.style.setProperty("--my", `${my.toFixed(1)}%`);
      }
    };

    const onMove = (e: PointerEvent) => {
      last = { x: e.clientX, y: e.clientY, target: e.target };
      if (!raf) raf = requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf) cancelAnimationFrame(raf);
      activeRef.current?.removeAttribute("data-glow");
    };
  }, [animate]);

  return null;
}
