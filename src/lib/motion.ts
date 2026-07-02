/**
 * The five motion verbs (design/06-motion.md).
 * Components never hardcode timing — they import a verb.
 * Durations are in seconds (Framer Motion convention).
 */

export const EASE = {
  out: [0.16, 1, 0.3, 1],
  inOut: [0.65, 0, 0.35, 1],
  stamp: [0.34, 1.4, 0.64, 1],
} as const;

export const DUR = {
  tick: 0.12,
  ui: 0.24,
  stamp: 0.18,
  scan: 0.5,
  reveal: 0.6,
  cinema: 0.9,
} as const;

/** SCAN — a bounded sweep marking inspection in progress. */
export const SCAN = {
  initial: { scaleX: 0, originX: 0 },
  animate: { scaleX: 1 },
  transition: { duration: DUR.scan, ease: EASE.inOut },
} as const;

/** VERIFY — value settles; pair with a counter, then SEAL. */
export const VERIFY = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: { duration: DUR.reveal, ease: EASE.out },
} as const;

/** SEAL — the stamp: scale overshoot, single ring pulse handled in CSS. */
export const SEAL = {
  initial: { scale: 1.3, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  transition: { duration: DUR.stamp, ease: EASE.stamp },
} as const;

/** DRAW — reveal by clip for panels; SVG strokes use dashoffset in GSAP. */
export const DRAW = {
  initial: { clipPath: "inset(0 100% 0 0)" },
  animate: { clipPath: "inset(0 0% 0 0)" },
  transition: { duration: DUR.cinema, ease: EASE.inOut },
} as const;

/** BOOT — mono lines appearing top-down. Use with staggerChildren. */
export const BOOT = {
  container: {
    animate: { transition: { staggerChildren: 0.06 } },
  },
  line: {
    initial: { opacity: 0, y: 4 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: DUR.ui, ease: EASE.out },
  },
} as const;

/** Standard content entry (rise + fade) for section reveals. */
export const RISE = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: DUR.reveal, ease: EASE.out },
} as const;
