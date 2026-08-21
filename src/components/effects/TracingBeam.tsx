"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/cn";
import { useMotionPrefs } from "@/components/providers/MotionPrefsProvider";

/**
 * Tracing Beam — inspired by Aceternity UI (MIT), https://ui.aceternity.com,
 * but deliberately NOT their implementation.
 *
 * The original animates `y1`/`y2` on an SVG <linearGradient> spanning the
 * whole scrolled region. Over this page's evidence act that SVG is roughly
 * 20 x 8650 px, so every frame asked the browser to re-rasterise an
 * 8650px-tall layer — which is what made scrolling feel heavy.
 *
 * This version paints a static hairline once and moves a short, fixed-height
 * beam down it with `translateY`. Transform on a small element is
 * compositor-only: no layout, no repaint of the rail. Same read, a tiny
 * fraction of the cost.
 */
const BEAM_HEIGHT = 260;

export function TracingBeam({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);
  const { animate } = useMotionPrefs();

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });

  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setHeight(el.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // One spring, one transform, one compositor-friendly property.
  const y = useSpring(
    useTransform(scrollYProgress, [0, 1], [-BEAM_HEIGHT, height]),
    { stiffness: 220, damping: 40, restDelta: 0.5 },
  );

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* Rail lives outside the reading column, wide screens only. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-3 left-6 hidden xl:block"
        style={{ height }}
      >
        <div className="relative h-full w-px overflow-hidden bg-line">
          {animate ? (
            <motion.div
              style={{ y, height: BEAM_HEIGHT }}
              className="absolute inset-x-0 top-0 w-px will-change-transform"
            >
              <div className="h-full w-px bg-gradient-to-b from-transparent via-seal to-transparent" />
            </motion.div>
          ) : null}
        </div>
      </div>
      <div ref={contentRef}>{children}</div>
    </div>
  );
}
