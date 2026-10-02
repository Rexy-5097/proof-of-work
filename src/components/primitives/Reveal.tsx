"use client";

import { motion } from "motion/react";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import { useMotionPrefs } from "@/components/providers/MotionPrefsProvider";
import { DUR, EASE } from "@/lib/motion";
import type { ReactNode } from "react";

/**
 * Progressive-disclosure stage: rises into place once, on first view.
 * With motion off (or no JS — children are server-rendered), content is
 * simply present. `delay` staggers siblings within a stage.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  /** "stamp": SEAL-style scale-in with constant opacity — for elements
      whose text must never exist in a low-contrast mid-fade state.
      "focus": rise out of a 10px blur, an
      instrument pulling the reading into focus. Display type only: blur is
      a paint, not a composite, so it is kept off body copy and lists. */
  variant = "rise",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: "rise" | "stamp" | "focus";
}) {
  const { animate } = useMotionPrefs();
  const [ref, inView] = useInViewOnce<HTMLDivElement>(0.25);

  const shown = !animate || inView;
  const hidden =
    variant === "stamp"
      ? { scale: 0.9, y: 8 }
      : variant === "focus"
        ? { opacity: 0, y: 24, filter: "blur(10px)" }
        : { opacity: 0, y: 16 };
  const visible =
    variant === "stamp"
      ? { scale: 1, y: 0 }
      : variant === "focus"
        ? { opacity: 1, y: 0, filter: "blur(0px)" }
        : { opacity: 1, y: 0 };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={shown ? visible : hidden}
      transition={{
        duration: variant === "focus" ? DUR.cinema : DUR.reveal,
        ease: variant === "stamp" ? EASE.stamp : EASE.out,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
