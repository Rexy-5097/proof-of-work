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
      whose text must never exist in a low-contrast mid-fade state. */
  variant = "rise",
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  variant?: "rise" | "stamp";
}) {
  const { animate } = useMotionPrefs();
  const [ref, inView] = useInViewOnce<HTMLDivElement>(0.25);

  const shown = !animate || inView;
  const hidden =
    variant === "stamp" ? { scale: 0.9, y: 8 } : { opacity: 0, y: 16 };
  const visible =
    variant === "stamp" ? { scale: 1, y: 0 } : { opacity: 1, y: 0 };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={shown ? visible : hidden}
      transition={{
        duration: DUR.reveal,
        ease: variant === "stamp" ? EASE.stamp : EASE.out,
        delay,
      }}
    >
      {children}
    </motion.div>
  );
}
