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
 * The star is full-bleed and its footage is scrubbed by scroll position,
 * so coronal loops and flares cross the screen as the reader descends.
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

  // Scroll drives the footage: the star advances because the reader moved,
  // not because a clock is running. This is the same thing adityanet does
  // with its own hero — a paused <video> whose currentTime is a function of
  // scroll — and it is why the flares arrive on the way down.
  //
  // Two details keep it from degrading into a still image, which is how
  // every earlier attempt here failed. The poster is painted by the wrapper
  // behind, so a slow decode never shows blank; and the first frame is
  // forced out with a play/pause pair, because a <video> that has never
  // played keeps showing its poster until a frame is actually decoded — so
  // without this the picture only "starts" once the reader scrolls far
  // enough to trigger a seek that lands.
  //
  // Driven by the scroll event, and deliberately NOT by requestAnimationFrame.
  // An rAF loop stops the moment the browser throttles frames — a background
  // tab, a hidden window, Low Power Mode — and a scrub loop that stops is
  // indistinguishable from a broken one: the star simply freezes and there is
  // nothing on screen to say why. That is the failure that kept showing a
  // still image here. Scroll events keep firing when rAF does not, which is
  // also how adityanet's hero survives the same conditions.
  //
  // Progress is measured off the section's own box rather than read from a
  // motion value, because motion values are themselves updated on rAF and
  // would reintroduce exactly the dependency this is avoiding.
  //
  // Seeks are skipped while one is already in flight, and while the target
  // has not moved a frame's worth: queuing a seek per scroll event leaves the
  // decoder permanently behind the scroll position.
  //
  // But a skipped seek must be retried, and the earlier version had nothing to
  // retry it with. Scrolling fast keeps `seeking` true almost continuously, so
  // the last few scroll events of a flick were all dropped; then the scrolling
  // stopped, no further scroll events fired, and the star simply stayed where
  // the decoder happened to land. Measured on production: scrolling to the end
  // of the prologue left the video at 34.7s of 39.9s and it never caught up.
  // That is the "not animating" fault — it is not that the scrub never starts,
  // it is that it stops partway and has no way back.
  //
  // Hence the split below: `target` is where the scroll says we should be and
  // is always current, `applied` is the last seek actually issued, and `seeked`
  // re-runs apply() the instant the decoder frees up. Every dropped update is
  // recovered by the seek that dropped it.
  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    if (!video || !section) return;

    let target = 0;
    let applied = -1;

    const prime = () => {
      void video.play().then(() => video.pause()).catch(() => {});
    };
    if (video.readyState >= 2) prime();
    else video.addEventListener("loadeddata", prime, { once: true });

    const apply = () => {
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration === 0) return;
      // Still in flight — leave it; the `seeked` handler below calls back in
      // with whatever `target` has become by then.
      if (video.seeking) return;
      if (Math.abs(target - applied) < 1 / 30) return;
      applied = target;
      video.currentTime = target;
    };

    const update = () => {
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration === 0) return;
      const span = section.offsetHeight - window.innerHeight;
      if (span <= 0) return;
      const p = clamp01(-section.getBoundingClientRect().top / span);
      target = p * (duration - 0.05);
      apply();
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    video.addEventListener("loadedmetadata", update);
    video.addEventListener("seeked", apply);
    update();

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      video.removeEventListener("loadedmetadata", update);
      video.removeEventListener("seeked", apply);
      video.removeEventListener("loadeddata", prime);
    };
  }, []);

  // A slow push in. This must never drop below 1: the plate is sized to the
  // viewport, so any value under 1 shrinks it inside its own frame and lets
  // the page background show around the edges of a supposedly full-bleed
  // star.
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);
  const cueOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);
  // The gate. The prologue is a place the reader passes through, not a
  // banner they scroll past, so the last stretch dissolves the whole stage —
  // colour included, which is why the opaque background sits here and not on
  // the section — and the world behind it comes up as the audit begins.
  const stageOpacity = useTransform(scrollYProgress, [0.9, 1], [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="overture"
      aria-label="Prologue — the Sun, and a negative result"
      className="relative h-[420svh]"
    >
      {/* The poster is a CSS background on a full-viewport element, which
          makes it an LCP candidate that the preload scanner cannot see: it is
          only discovered once the stylesheet has parsed. Declaring it here
          pulls the request forward to the start of the load. */}
      <link
        rel="preload"
        as="image"
        href="/nasa-sun-poster.jpg"
        fetchPriority="high"
      />
      <motion.div
        style={{ opacity: stageOpacity }}
        className="sticky top-0 h-svh overflow-hidden bg-[#04060b]"
      >
        {/* The star itself, full-bleed.
            `cover` is the whole point: the disc is cropped well past the
            viewport so the reader is down among the coronal loops, where a
            flare is a third of the screen. Fitted inside a tidy circle
            instead, the same footage reads as a small logo that barely
            changes — which is exactly what it looked like before.
            The poster sits on the wrapper as a background so there is never
            a blank frame while the video decodes or seeks. */}
        <motion.div
          style={{ scale: animate ? scale : 1 }}
          className="absolute inset-0 bg-[url('/nasa-sun-poster.jpg')] bg-cover bg-center will-change-transform"
        >
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src="/nasa-sun.mp4"
            muted
            playsInline
            // metadata, not auto: `auto` pulled 2.7 MB of a 7.7 MB file during
            // first load and pushed mobile LCP to 4.7s. Seeking range-requests
            // what it needs, and the poster on the wrapper covers the gap, so
            // the section is never blank while the buffer fills.
            preload="metadata"
            // Decorative: the same facts are in the beats as text.
            aria-hidden="true"
            tabIndex={-1}
          />
        </motion.div>

        {/* Vignette, so the type stays legible over the corona. Full-bleed
            changed what this has to do: the old centred disc left dark page
            around the edges to set type on, but the corona now fills the
            frame and the bottom-left copy sits directly on the brightest
            part of the star. Hence the second, harder scrim under the
            beats — the radial alone leaves them at roughly 2:1. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,#04060bCC_85%)]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-[62%] bg-gradient-to-t from-[#04060b] via-[#04060b]/85 to-transparent"
        />

        {/* The argument, one beat at a time. */}
        {/* Cleared past the fixed nav (h-14). The prologue is the first thing
            on the site now that it has a route of its own, so its own
            identity line is the one piece of copy guaranteed to sit directly
            under the header rather than scrolling in from below it. */}
        <div className="absolute inset-0 p-[var(--page-margin)] pt-[calc(var(--page-margin)+3.5rem)]">
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
            href="/proof"
            className="rounded-r1 border border-line px-3 py-2 font-mono text-label whitespace-nowrap text-ink-lo transition-colors duration-[var(--dur-tick)] hover:border-line-strong hover:text-ink-md"
          >
            SKIP ↓
          </a>
        </div>
      </motion.div>
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
