"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useScroll, useSpring, useTransform, useVelocity } from "motion/react";
import { cn } from "@/lib/cn";
import { useMotionPrefs } from "@/components/providers/MotionPrefsProvider";

/**
 * Tracing Beam — adapted from Aceternity UI (MIT),
 * https://ui.aceternity.com. A line is drawn down the left edge as the
 * reader advances, so the evidence act reads as one continuous
 * examination rather than seven disconnected cards.
 *
 * Adapted for this design system: the beam is coloured from the verdict
 * tokens (seal green — the site's "verified" colour) instead of the
 * original's purple/blue, it re-measures on resize, and it renders as a
 * static hairline under reduced motion so the structure survives without
 * the movement.
 */
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

  // Velocity drives the head's glow: the beam brightens while the reader
  // is actually moving, and settles when they stop to read.
  const velocity = useVelocity(scrollYProgress);
  const glow = useSpring(useTransform(velocity, [-1.5, 0, 1.5], [1, 0.25, 1]), {
    stiffness: 200,
    damping: 40,
  });

  const y1 = useSpring(useTransform(scrollYProgress, [0, 0.85], [0, height]), {
    stiffness: 500,
    damping: 90,
  });
  const y2 = useSpring(useTransform(scrollYProgress, [0, 1], [0, height - 200]), {
    stiffness: 500,
    damping: 90,
  });

  return (
    <div ref={ref} className={cn("relative", className)}>
      {/* The rail sits outside the reading column on wide screens only —
          on narrow screens it would steal horizontal space from prose. */}
      <div className="pointer-events-none absolute top-3 left-2 hidden xl:block" aria-hidden="true">
        <svg
          viewBox={`0 0 20 ${height}`}
          width="20"
          height={height}
          className="ml-4 block"
          aria-hidden="true"
        >
          <motion.path
            d={`M 1 0 V ${height}`}
            fill="none"
            stroke="var(--line)"
            strokeWidth="1"
          />
          {animate ? (
            <motion.path
              d={`M 1 0 V ${height}`}
              fill="none"
              stroke="url(#tracing-gradient)"
              strokeWidth="1.5"
              className="motion-reduce:hidden"
            />
          ) : null}
          <defs>
            <motion.linearGradient
              id="tracing-gradient"
              gradientUnits="userSpaceOnUse"
              x1="0"
              x2="0"
              y1={y1}
              y2={y2}
            >
              <stop stopColor="var(--seal)" stopOpacity="0" />
              <stop stopColor="var(--seal)" />
              <stop offset="0.6" stopColor="var(--data)" />
              <stop offset="1" stopColor="var(--data)" stopOpacity="0" />
            </motion.linearGradient>
          </defs>
        </svg>
        {animate ? (
          <motion.span
            style={{ top: y1, opacity: glow }}
            className="absolute left-[13px] block h-2 w-2 -translate-x-1/2 rounded-full bg-seal shadow-[0_0_12px_2px_var(--seal)]"
          />
        ) : null}
      </div>
      <div ref={contentRef}>{children}</div>
    </div>
  );
}
