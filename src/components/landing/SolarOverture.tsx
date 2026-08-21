"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useMotionPrefs } from "@/components/providers/MotionPrefsProvider";

/**
 * The prologue: NASA's Sun, scrubbed by the reader's own scroll.
 *
 * This is deliberately NOT the wheel-capturing overlay it replaces. That
 * one preventDefault()ed every wheel event to drive its own progress
 * counter, which meant it was fighting Lenis for the scroll position and
 * made the whole page feel heavy. Here the page scrolls normally: a tall
 * section holds a sticky stage, and the section's own scroll progress
 * drives the video's currentTime. Nothing is hijacked, so there is no
 * scroll to lose a fight over — and the reader can flick past it.
 *
 * The five beats are the argument the rest of the site makes, in
 * miniature: this is a real measurement, of a real star, and the honest
 * finding was a negative one.
 */

/** Narrative beats, keyed to scroll progress through the section. */
const BEATS: {
  at: [number, number];
  kicker: string;
  line: string;
  sub?: string;
}[] = [
  {
    at: [0.0, 0.2],
    kicker: "1 FEBRUARY 2026 · 171 Å",
    line: "This is the Sun, as an instrument sees it.",
    sub: "NASA's Solar Dynamics Observatory, extreme ultraviolet. The timestamps are the spacecraft's own.",
  },
  {
    at: [0.2, 0.4],
    kicker: "SOLAR MAXIMUM",
    line: "The bright regions are the star at its loudest.",
    sub: "Four days inside the high point of an eleven-year cycle, when active regions are most common.",
  },
  {
    at: [0.4, 0.58],
    kicker: "FIVE X-CLASS FLARES",
    line: "In these four days it flared five times.",
    sub: "The highest-energy class. In NASA's footage they arrive as flashes with vertical stripes — the camera saturating.",
  },
  {
    at: [0.58, 0.78],
    kicker: "ADITYA-L1 · SoLEXS / HEL1OS",
    line: "Another spacecraft watched the same star.",
    sub: "I built a verifiable pipeline over its X-ray archive and held out 192,541 minutes chronologically, because random splits leak.",
  },
  {
    at: [0.78, 1.0],
    kicker: "THE FINDING",
    line: "The models did not beat a single threshold.",
    sub: "Learned: 0.966. One count-rate threshold: 0.954. The intervals overlap. I published that instead of reframing it.",
  },
];

/** Width of a cross-dissolve, in section-progress units. Outgoing and
 *  incoming beats share one interval so their opacities sum to 1 — give
 *  them separate intervals and the handoff dips to 0.25/0.25, which reads
 *  as a flicker rather than a dissolve. */
const W = 0.035;
/** How long the opening beat holds full opacity before it can be
 *  interpolated. Must be a real interval, not an epsilon (see below). */
const HOLD = 0.01;

function Beat({
  beat,
  progress,
  first,
  last,
}: {
  beat: (typeof BEATS)[number];
  progress: MotionValue<number>;
  /** The opening beat has no lead-in: it must already be legible at
   *  progress 0, or the reader meets the Sun with nothing to read. */
  first?: boolean;
  /** The closing beat never fades out — it hands over to the hero. */
  last?: boolean;
}) {
  const [start, end] = beat.at;
  // Every beat uses the same four-stop shape, and the stops must be four,
  // distinct, and inside [0, 1]. Both shortcuts here are traps: a repeated
  // stop or a three-stop list loses useTransform's clamping (the beat fades
  // back in as the reader scrolls past it, over the top of later beats),
  // and a negative stop reaches WAAPI as a negative keyframe offset, which
  // throws and unmounts the section. The opening beat — which must already
  // be readable at progress 0 — therefore holds opacity 1 over a small but
  // real interval. It has to be real: an epsilon like 1e-4 rounds back into
  // a duplicate stop and the value sticks at 1 forever, so the beat never
  // leaves the screen. 1% of the section is ~30px, i.e. invisible.
  const opacity = useTransform(
    progress,
    [
      first ? start : start - W,
      first ? start + HOLD : start,
      last ? end - HOLD : end - W,
      end,
    ],
    [first ? 1 : 0, 1, 1, last ? 1 : 0],
  );
  const y = useTransform(progress, [start, end], first ? [0, -18] : [18, -18]);

  return (
    <motion.div
      style={{ opacity, y }}
      className="absolute inset-x-0 bottom-0 will-change-transform"
      aria-hidden="true"
    >
      <p className="mono-label mb-3 tracking-[0.16em] text-seal">{beat.kicker}</p>
      <p className="max-w-[20ch] font-display text-[clamp(1.75rem,4.5vw,3rem)] leading-[1.06] text-ink-hi">
        {beat.line}
      </p>
      {beat.sub ? (
        <p className="mt-4 max-w-[46ch] text-sm leading-relaxed text-ink-md">
          {beat.sub}
        </p>
      ) : null}
    </motion.div>
  );
}

export function SolarOverture() {
  const { animate } = useMotionPrefs();
  const sectionRef = useRef<HTMLElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const targetRef = useRef(0);
  const rafRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (p) => {
    targetRef.current = p;
  });

  // Scrubbing is done off the scroll event, in a rAF loop, because seeking
  // is asynchronous: setting currentTime on every scroll tick queues seeks
  // faster than the decoder retires them and the picture falls behind. One
  // seek per frame, and only when the delta is worth a decode.
  useEffect(() => {
    if (!animate) return;
    const video = videoRef.current;
    if (!video) return;

    video.pause();
    let last = -1;

    const tick = () => {
      rafRef.current = requestAnimationFrame(tick);
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration === 0) return;
      if (video.seeking) return;
      const next = Math.min(targetRef.current, 0.999) * duration;
      if (Math.abs(next - last) < 1 / 30) return;
      last = next;
      video.currentTime = next;
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  // The disc grows and settles as the reader scrolls the argument.
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 0.92]);
  const glow = useTransform(scrollYProgress, [0, 0.5, 1], [0.35, 0.6, 0.3]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  // Reduced motion: no sticky stage, no scrubbing. One still frame and the
  // same five beats as ordinary prose, which is the whole argument anyway.
  if (!animate) {
    return (
      <section
        id="overture"
        aria-label="Prologue — the Sun, and a negative result"
        className="border-b border-line bg-[#04060b]"
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-[var(--page-margin)] py-20 md:grid-cols-2 md:items-center">
          <img
            src="/nasa-sun-poster.jpg"
            alt="The Sun in 171 ångström extreme ultraviolet, imaged by NASA's Solar Dynamics Observatory on 1 February 2026."
            width={720}
            height={720}
            className="mx-auto w-full max-w-sm rounded-full"
          />
          <div className="space-y-8">
            {BEATS.map((b) => (
              <div key={b.kicker}>
                <p className="mono-label mb-2 tracking-[0.16em] text-seal">{b.kicker}</p>
                <p className="font-display text-2xl leading-snug text-ink-hi">{b.line}</p>
                {b.sub ? <p className="mt-2 text-sm text-ink-md">{b.sub}</p> : null}
              </div>
            ))}
            <Credit />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id="overture"
      aria-label="Prologue — the Sun, and a negative result"
      className="relative h-[420svh] bg-[#04060b]"
    >
      <div className="sticky top-0 h-svh overflow-hidden">
        {/* The star itself. */}
        <motion.div
          style={{ scale }}
          className="absolute inset-0 flex items-center justify-center will-change-transform"
        >
          <div className="relative aspect-square h-[min(78svh,78vw)]">
            <motion.div
              aria-hidden="true"
              style={{ opacity: glow }}
              className="absolute -inset-[12%] rounded-full bg-[radial-gradient(circle,#ffb347_0%,#c2410c_45%,transparent_70%)] blur-2xl"
            />
            {/* object-contain keeps NASA's full square frame — including
                their burned-in timestamp — rather than cropping it. The
                source's background is pure black, so `screen` drops it
                into the page instead of leaving a hard square edge. */}
            <video
              ref={videoRef}
              className="relative h-full w-full object-contain mix-blend-screen"
              src="/nasa-sun.mp4"
              poster="/nasa-sun-poster.jpg"
              muted
              playsInline
              preload="auto"
              // Decorative here: the same facts are in the beats as text.
              aria-hidden="true"
              tabIndex={-1}
            />
          </div>
        </motion.div>

        {/* Vignette, so the type stays legible over the corona. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,#04060bE6_78%)]"
        />

        {/* The argument, one beat at a time. */}
        <div className="absolute inset-0 p-[var(--page-margin)]">
          <p className="mono-label tracking-[0.16em] text-ink-md">
            PROOF OF WORK — SOUMYADEB TRIPATHY
          </p>

          <div className="absolute inset-x-[var(--page-margin)] bottom-[calc(var(--page-margin)+5.5rem)] h-[13rem]">
            {BEATS.map((b, i) => (
              <Beat
                key={b.kicker}
                beat={b}
                progress={scrollYProgress}
                first={i === 0}
                last={i === BEATS.length - 1}
              />
            ))}
          </div>
        </div>

        {/* Screen readers get the beats once, in order, as real prose —
            the motion version is aria-hidden because five cross-fading
            copies would otherwise all be announced. */}
        <div className="sr-only">
          <h2>Prologue</h2>
          {BEATS.map((b) => (
            <p key={b.kicker}>
              {b.kicker}. {b.line} {b.sub}
            </p>
          ))}
        </div>

        <motion.p
          style={{ opacity: cueOpacity }}
          className="absolute inset-x-0 bottom-[var(--page-margin)] text-center font-mono text-label tracking-[0.16em] text-ink-lo"
        >
          SCROLL ↓
        </motion.p>

        <div className="absolute right-[var(--page-margin)] bottom-[var(--page-margin)] flex items-center gap-4">
          <Credit />
          <a
            href="#landing"
            className="rounded-r1 border border-line px-3 py-2 font-mono text-label whitespace-nowrap text-ink-lo transition-colors duration-[var(--dur-tick)] hover:border-line-strong hover:text-ink-md"
          >
            SKIP ↓
          </a>
        </div>
      </div>
    </section>
  );
}

/** NASA asks that its media be credited where it is used, not only in a
 *  licence file — so the credit rides in the running interface. */
function Credit() {
  return (
    <p className="max-w-[30ch] font-mono text-micro leading-relaxed text-ink-lo">
      SDO/AIA 171 Å ·{" "}
      <a
        href="https://svs.gsfc.nasa.gov/5649/"
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-ink-lo/40 underline-offset-2 hover:text-ink-md"
      >
        NASA&apos;s Scientific Visualization Studio
      </a>{" "}
      / Goddard Space Flight Center
    </p>
  );
}
