"use client";

import { useEffect, useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useMotionPrefs } from "@/components/providers/MotionPrefsProvider";

/**
 * The prologue: NASA's Sun, with the reader's scroll driving the story
 * told over it.
 *
 * This is deliberately NOT the wheel-capturing overlay it replaces. That
 * one preventDefault()ed every wheel event to drive its own progress
 * counter, which meant it was fighting Lenis for the scroll position and
 * made the whole page feel heavy. Here the page scrolls normally: a tall
 * section holds a sticky stage, and the section's own scroll progress
 * drives the beats and the disc. Nothing is hijacked, so there is no
 * scroll to lose a fight over — and the reader can flick past it.
 *
 * The footage plays on its own clock rather than being scrubbed; see the
 * effect below for why scrubbing showed a still image instead of a star.
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

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

function Beat({
  beat,
  progress,
  first,
  last,
  travel = true,
}: {
  beat: (typeof BEATS)[number];
  progress: MotionValue<number>;
  /** The opening beat has no lead-in: it must already be legible at
   *  progress 0, or the reader meets the Sun with nothing to read. */
  first?: boolean;
  /** The closing beat never fades out — it hands over to the hero. */
  last?: boolean;
  /** Reduced motion keeps the cross-dissolve (opacity is not a vestibular
   *  trigger) but drops the travel. */
  travel?: boolean;
}) {
  const [start, end] = beat.at;

  // Computed, not interpolated between stops. Every stop-list form of this
  // failed in a different way — a repeated stop, a three-stop list and a
  // 1e-4 epsilon each lose clamping, so the opening beat faded back IN on
  // top of the later beats, and a negative stop reaches WAAPI as a negative
  // keyframe offset and throws. A plain function has no stop-list semantics
  // to get wrong: it is explicitly clamped and cannot rise again once past.
  //
  // Outgoing and incoming beats share one interval — beat i fades out over
  // [end - W, end] and beat i+1 fades in over exactly the same span — so
  // the pair always sums to 1 and the handoff reads as a dissolve rather
  // than a dip through darkness.
  const opacity = useTransform(progress, (p) => {
    const fadeIn = first ? 1 : clamp01((p - (start - W)) / W);
    const fadeOut = last ? 1 : clamp01((end - p) / W);
    return Math.min(fadeIn, fadeOut);
  });
  const rise = useTransform(progress, [start, end], first ? [0, -18] : [18, -18]);
  const y = travel ? rise : 0;

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

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // The Sun runs on its own clock.
  //
  // This used to scrub: paused, with scroll driving currentTime. Two things
  // made that show a still image instead of a star. A paused <video> keeps
  // painting its `poster` until a frame has actually been decoded, so before
  // the first seek lands there is nothing but the JPEG; and seeking is
  // asynchronous, so a slow reader — or a fast one on a slow decoder —
  // spends most of the section watching one frame while seeks queue behind
  // it. Scroll-driven video looks broken exactly when the reader is gentle
  // with it, which is the wrong failure mode for the first thing on the page.
  //
  // So it simply plays, muted and looping. The corona is always moving,
  // scroll still drives the story (the beats, the disc, the light), and
  // there is no decoder race to lose.
  //
  // This runs even under reduced motion, deliberately. The previous version
  // swapped the whole section for a still poster when `animate` was false —
  // which is what anyone with macOS "Reduce Motion" on, or who had ever hit
  // the site's own Escape motion toggle, actually saw: a round JPEG, never
  // the Sun. The footage is the content here, not decoration. What reduced
  // motion switches off is the vestibular part — the disc's scale and the
  // beats' travel below — while the cross-dissolve and the loop stay.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // play() rejects if autoplay is refused; the poster is then the honest
    // fallback and the beats still carry the argument, so this is not fatal.
    const start = () => void video.play().catch(() => {});
    if (video.readyState >= 2) start();
    video.addEventListener("loadeddata", start);
    return () => video.removeEventListener("loadeddata", start);
  }, [animate]);

  // The disc grows and settles as the reader scrolls the argument.
  const scale = useTransform(scrollYProgress, [0, 1], [1.12, 0.92]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

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
          style={{ scale: animate ? scale : 1 }}
          className="absolute inset-0 flex items-center justify-center will-change-transform"
        >
          <div className="relative aspect-square h-[min(78svh,78vw)]">
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
              loop
              autoPlay
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
                travel={animate}
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
