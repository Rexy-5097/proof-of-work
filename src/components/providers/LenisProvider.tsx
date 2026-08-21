"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type ReactNode,
} from "react";
import Lenis from "lenis";
import { useMotionPrefs } from "./MotionPrefsProvider";

type ScrollToTarget = string | HTMLElement;

interface LenisApi {
  /** Smooth-scroll to an anchor; falls back to native when Lenis is off. */
  scrollTo: (target: ScrollToTarget) => void;
  /** The live instance, so scroll-linked libraries can sync to it.
   *  Null when reduced motion has disabled smooth scrolling. */
  getLenis: () => Lenis | null;
}

const LenisContext = createContext<LenisApi>({
  getLenis: () => null,
  scrollTo: (target) => {
    const el =
      typeof target === "string" ? document.querySelector(target) : target;
    el?.scrollIntoView();
  },
});

/**
 * Owns the scroll position (design/07-architecture.md §5).
 * 1:1 wheel ratio, no hijacking; disabled entirely for reduced motion,
 * where native scrolling and `scroll-behavior: auto` take over.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  const { animate } = useMotionPrefs();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (!animate) return;
    // anchors: false — Lenis's built-in anchor handler would double-fire
    // alongside our nav/rail click handlers (it never preventDefaults),
    // racing two scrollTo calls. Navigation components own anchor scrolls.
    const lenis = new Lenis({ lerp: 0.1 });
    lenisRef.current = lenis;

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [animate]);

  const api: LenisApi = {
    getLenis: () => lenisRef.current,
    scrollTo: (target) => {
      const lenis = lenisRef.current;
      if (lenis) {
        // Re-sync to the real scroll position first: Lenis ignores native
        // position changes while it animates, and resolves element targets
        // against its own believed position — a stale belief sends every
        // subsequent jump to the wrong place (see lenis.mjs onNativeScroll).
        // An immediate scrollTo to the actual position is the public-API
        // way to force that resync.
        lenis.scrollTo(window.scrollY, { immediate: true, force: true });
        lenis.scrollTo(target, { duration: 0.9, force: true });
      } else {
        const el =
          typeof target === "string" ? document.querySelector(target) : target;
        el?.scrollIntoView();
      }
    },
  };

  return <LenisContext.Provider value={api}>{children}</LenisContext.Provider>;
}

export function useLenis(): LenisApi {
  return useContext(LenisContext);
}
