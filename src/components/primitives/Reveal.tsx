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
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { animate } = useMotionPrefs();
  const [ref, inView] = useInViewOnce<HTMLDivElement>(0.25);

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={false}
      animate={
        !animate || inView
          ? { opacity: 1, y: 0 }
          : { opacity: 0, y: 16 }
      }
      transition={{ duration: DUR.reveal, ease: EASE.out, delay }}
    >
      {children}
    </motion.div>
  );
}
