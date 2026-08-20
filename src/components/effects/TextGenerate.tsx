"use client";

import { useEffect } from "react";
import { motion, stagger, useAnimate } from "motion/react";
import { cn } from "@/lib/cn";
import { useMotionPrefs } from "@/components/providers/MotionPrefsProvider";

/**
 * Text Generate Effect — adapted from Aceternity UI (MIT),
 * https://ui.aceternity.com. Words resolve in sequence with a blur
 * lift, which reads as the sentence being *derived* rather than typed.
 *
 * Accessibility: the full sentence is always in the DOM as real text —
 * the animation only tweens opacity/filter on spans, so screen readers
 * and no-JS visitors get the complete headline, and reduced motion
 * renders it fully resolved with no animation at all.
 */
export function TextGenerate({
  words,
  className,
  duration = 0.7,
  stagger: staggerBy = 0.11,
}: {
  words: string;
  className?: string;
  duration?: number;
  stagger?: number;
}) {
  const [scope, animateScope] = useAnimate();
  const { animate: motionOn } = useMotionPrefs();
  const wordList = words.split(" ");

  useEffect(() => {
    if (!motionOn) return;
    void animateScope(
      "span",
      { opacity: 1, filter: "blur(0px)" },
      { duration, delay: stagger(staggerBy) },
    );
  }, [motionOn, animateScope, duration, staggerBy]);

  return (
    <motion.span ref={scope} className={cn(className)}>
      {wordList.map((word, i) => (
        <span
          key={`${word}-${i}`}
          style={motionOn ? { opacity: 0, filter: "blur(8px)" } : undefined}
        >
          {word}
          {i < wordList.length - 1 ? " " : ""}
        </span>
      ))}
    </motion.span>
  );
}
