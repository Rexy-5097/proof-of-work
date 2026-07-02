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
}

const LenisContext = createContext<LenisApi>({
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
    const lenis = new Lenis({ lerp: 0.1, anchors: true });
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
    scrollTo: (target) => {
      if (lenisRef.current) {
        lenisRef.current.scrollTo(target, { duration: 0.9 });
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
