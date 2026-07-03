"use client";

import { useEffect, useRef } from "react";
import { useMotionPrefs } from "@/components/providers/MotionPrefsProvider";

/**
 * Subtle magnetic pull toward the cursor (design/04-components.md,
 * "Primary buttons: hover magnetic ≤4px toward cursor"). Transform-only,
 * capped small, pointer-fine + motion-enabled only — on touch or
 * reduced motion this is a no-op and the element sits still.
 */
export function useMagnetic<T extends HTMLElement>(strength = 10, max = 5) {
  const ref = useRef<T>(null);
  const { animate } = useMotionPrefs();

  useEffect(() => {
    const el = ref.current;
    if (!el || !animate || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const onMove = (e: PointerEvent) => {
      const rect = el.getBoundingClientRect();
      const dx = e.clientX - (rect.left + rect.width / 2);
      const dy = e.clientY - (rect.top + rect.height / 2);
      const x = Math.max(-max, Math.min(max, dx / strength));
      const y = Math.max(-max, Math.min(max, dy / strength));
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    };
    const onLeave = () => {
      el.style.transform = "";
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      el.style.transform = "";
    };
  }, [animate, strength, max]);

  return ref;
}
