"use client";

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useMotionPrefs } from "./MotionPrefsProvider";

export type CursorMode = "default" | "inspect" | "link" | "crosshair";

interface CursorApi {
  enabled: boolean;
}

const CursorContext = createContext<CursorApi>({ enabled: false });

/**
 * The custom cursor speced in design/06-motion.md §5 and never built in
 * Phase 3E: a 6px dot + 28px lerp-following ring, pointer-fine only,
 * that reads `data-cursor` on whatever it's hovering (Claim → "inspect"
 * brackets, links/buttons → "link" contraction, diagram frames →
 * "crosshair"). One shared rAF loop; off entirely for touch, reduced
 * motion, and the Escape toggle. The cursor is a tool-state indicator,
 * not a decorative pet — it never turns seal-green (that color is
 * reserved for verified claims) and never blocks native focus rings.
 */
export function CursorProvider({ children }: { children: ReactNode }) {
  const { animate } = useMotionPrefs();
  const [pointerFine, setPointerFine] = useState(false);
  const [userOff, setUserOff] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const mode = useRef<CursorMode>("default");
  const pos = useRef({ x: -100, y: -100 });
  const ring = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine)");
    setPointerFine(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setPointerFine(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const enabled = animate && pointerFine && !userOff;

  useEffect(() => {
    if (!enabled) return;

    const resolveMode = (el: Element | null): CursorMode => {
      const target = el?.closest<HTMLElement>("[data-cursor]");
      const m = target?.dataset.cursor;
      return m === "inspect" || m === "link" || m === "crosshair" ? m : "default";
    };

    const onMove = (e: PointerEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      mode.current = resolveMode(e.target as Element);
    };
    const onDown = () => ringRef.current?.style.setProperty("--cursor-scale", "0.85");
    const onUp = () => ringRef.current?.style.setProperty("--cursor-scale", "1");
    const onLeave = () => {
      pos.current = { x: -100, y: -100 };
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setUserOff((v) => !v);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    window.addEventListener("keydown", onKey);

    let raf = 0;
    const tick = () => {
      const dot = dotRef.current;
      const r = ringRef.current;
      if (dot && r) {
        ring.current.x += (pos.current.x - ring.current.x) * 0.2;
        ring.current.y += (pos.current.y - ring.current.y) * 0.2;
        dot.style.transform = `translate(${pos.current.x}px, ${pos.current.y}px)`;
        r.style.transform = `translate(${ring.current.x}px, ${ring.current.y}px)`;
        r.dataset.mode = mode.current;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("keydown", onKey);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return (
    <CursorContext.Provider value={{ enabled }}>
      {children}
      {enabled ? (
        <div aria-hidden="true" className="pow-cursor-layer">
          <div ref={dotRef} className="pow-cursor-dot" />
          <div ref={ringRef} className="pow-cursor-ring" data-mode="default" />
        </div>
      ) : null}
    </CursorContext.Provider>
  );
}

export function useCursor(): CursorApi {
  return useContext(CursorContext);
}
