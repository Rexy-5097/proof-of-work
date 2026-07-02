"use client";

import { useEffect, useState, type RefObject } from "react";
import { useInViewOnce } from "./useInViewOnce";
import { useMotionPrefs } from "@/components/providers/MotionPrefsProvider";

interface VizState<T extends Element> {
  ref: RefObject<T | null>;
  /** Spread onto the root: `data-armed` hides stages, `data-run` plays them. */
  attrs: { "data-armed"?: ""; "data-run"?: "" };
  /** True while the visual should actively animate (SMIL dots, loops). */
  running: boolean;
}

/**
 * Shared lifecycle for evidence visuals (mirrors <Claim>): server output
 * is the finished diagram; with motion allowed we arm (hide stages) after
 * mount, then run on first view. No JS or reduced motion ⇒ final state.
 */
export function useViz<T extends Element = SVGSVGElement>(threshold = 0.35): VizState<T> {
  const { animate } = useMotionPrefs();
  const [ref, inView] = useInViewOnce<T>(threshold);
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (animate && !inView && !armed) setArmed(true);
  }, [animate, inView, armed]);

  const running = armed && inView;
  return {
    ref,
    attrs: {
      ...(armed ? { "data-armed": "" as const } : {}),
      ...(running ? { "data-run": "" as const } : {}),
    },
    running,
  };
}
