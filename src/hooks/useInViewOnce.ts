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

    // A ratio threshold is unreachable once the element is taller than
    // `viewportHeight / threshold` — the observer would then never fire and
    // the content would stay at opacity 0 forever. Sections here grow with
    // the data (the ledger table gains a row per repo), so clamp the ratio
    // to what this element can actually reach and let a sliver count.
    const height = el.getBoundingClientRect().height;
    const reachable = height > 0 ? window.innerHeight / height : 1;
    const effective = Math.min(threshold, reachable * 0.5);

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: effective },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold, inView]);

  return [ref, inView];
}
