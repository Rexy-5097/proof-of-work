"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

/**
 * True once the element has entered the viewport; never resets.
 * An audit doesn't re-run its checks (design/04-components.md, rule 6).
 */
export function useInViewOnce<T extends Element>(
  threshold = 0.4,
): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, inView]);

  return [ref, inView];
}
