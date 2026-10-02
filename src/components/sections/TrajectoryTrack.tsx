"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import { cn } from "@/lib/cn";
import { DUR, EASE } from "@/lib/motion";
import { Seal } from "@/components/primitives/Seal";
import { SectionLabel } from "@/components/primitives/SectionLabel";
import { useLenis } from "@/components/providers/LenisProvider";
import { useSound } from "@/components/providers/SoundProvider";
import { timeline } from "@/data/timeline";

/** Where on screen the thread's drawn head starts — a little left of
 *  centre, so the first stages stamp as they settle into reading position.
 *  The head then travels right until it lands on the last node exactly as
 *  the runway ends, so every stage is reached and none is skipped. */
const HEAD_START = 0.38;
const CARD_W = 340;
const GAP = 56;

/**
 * 06 / TRAJECTORY as the horizontal, scroll-driven rail design/04 asked
 * for ("TimelineRail — horizontal scroll-driven on desktop … thread draws
 * with scroll; each node stamps on arrival") and the vertical build never
 * delivered.
 *
 * The mechanism: a tall section holds a sticky viewport, and the section's
 * own scroll progress translates a horizontal track. Two decisions:
 *
 *  · The runway is the track's overflow, not a guess. Sizing the section
 *    per card (say 60vh each) makes the horizontal speed depend on the card
 *    count. Here the section is exactly 100svh + the distance the track has
 *    to travel, which makes vertical-to-horizontal 1:1 — the page is never
 *    scrolled faster or slower than the wheel says (design/04 rule 4).
 *  · Stages stamp, they don't slide in. Each node is ◇ until the drawn
 *    thread reaches the inspection line, then it SEALs ◆ — the same verb
 *    the claims use — and stays sealed (an audit doesn't re-run its
 *    checks). "NEXT" is future work, so it is the one node that never
 *    stamps: it stays ◇ in caution.
 *
 * The prev/next controls and the "STAGE 04 / 10" counter are there because
 * a horizontal track with no position readout is disorienting.
 * Only mounted on wide, motion-allowed viewports — see <Timeline>.
 */
export function TrajectoryTrack() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const railRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const [geom, setGeom] = useState({ travel: 0, start: 0 });
  const [reached, setReached] = useState(-1);
  const [index, setIndex] = useState(0);
  const { getLenis } = useLenis();
  const { play } = useSound();

  const pitch = CARD_W + GAP;
  /** Distance along the track from the first node to the last. */
  const span = (timeline.length - 1) * pitch;

  // Measure the overflow before paint, so the runway is right on the first
  // frame instead of collapsing and then jumping the page.
  useLayoutEffect(() => {
    const measure = () => {
      const rail = railRef.current;
      const vp = viewportRef.current;
      if (!rail || !vp) return;
      const margin = rail.firstElementChild instanceof HTMLElement ? rail.firstElementChild.offsetLeft : 0;
      setGeom({
        travel: Math.max(0, rail.scrollWidth - vp.clientWidth),
        start: Math.max(0, vp.clientWidth * HEAD_START - margin),
      });
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (railRef.current) ro.observe(railRef.current);
    if (viewportRef.current) ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, (p) => -p * geom.travel);
  /** How far along the track the inspection has got, in px from node 0. */
  const alongAt = (p: number) => geom.start + p * Math.max(0, span - geom.start);
  const thread = useTransform(scrollYProgress, (p) => Math.min(1, alongAt(p) / span));

  // Only a change of integer stage touches React state; the thread and the
  // track themselves are motion values and never re-render anything.
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const crossed = Math.min(timeline.length - 1, Math.floor(alongAt(p) / pitch + 1e-3));
    if (crossed > reached) {
      setReached(crossed);
      play("seal");
    }
    if (crossed !== index) setIndex(crossed);
  });

  const scrollToStage = (i: number) => {
    const el = sectionRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(i, timeline.length - 1));
    const p = Math.max(0, Math.min(1, (clamped * pitch - geom.start) / Math.max(1, span - geom.start)));
    const top = el.getBoundingClientRect().top + window.scrollY;
    const target = top + p * (el.offsetHeight - window.innerHeight) + 1;
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(target, { duration: 0.9, force: true });
    else window.scrollTo({ top: target });
    play("tap");
  };

  // Keyboard: ←/→ step stages while focus is inside the track controls.
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (!el.contains(document.activeElement)) return;
      if (e.key === "ArrowRight") scrollToStage(index + 1);
      if (e.key === "ArrowLeft") scrollToStage(index - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const stage = timeline[index]!;

  return (
    <div ref={sectionRef} data-trajectory className="relative" style={{ height: `calc(100svh + ${geom.travel}px)` }}>
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        {/* The chapter scrim's job, done locally: the section's own radial
            wash is centred on a runway several screens tall, so by the time
            the track is pinned it has thinned out behind the copy. This one
            is pinned with it. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(90%_55%_at_50%_58%,rgb(4_7_11/0.62),rgb(4_7_11/0.3)_60%,transparent)] [html[data-theme=paper]_&]:hidden"
        />
        <div className="relative mx-auto mb-10 flex w-full max-w-[var(--content-max)] flex-wrap items-end justify-between gap-6 px-[var(--page-margin)]">
          <div>
            <SectionLabel number="06" label="TRAJECTORY" as="h2" className="mb-4" />
            <p className="max-w-[var(--measure)] text-ink-md">
              Eight months, read as an escalation: each stage takes on a
              constraint the previous one didn&apos;t have.
            </p>
          </div>
          <div className="flex items-center gap-5">
            <p className="font-mono text-micro tracking-[0.08em] text-ink-lo tabular" aria-live="polite">
              STAGE <span className="text-ink-hi">{String(index + 1).padStart(2, "0")}</span>
              {" / "}
              {String(timeline.length).padStart(2, "0")}
              <span className="ml-3 text-ink-md">{stage.date}</span>
            </p>
            <div className="flex gap-1.5">
              <button
                type="button"
                onClick={() => scrollToStage(index - 1)}
                disabled={index === 0}
                aria-label="Previous stage"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-r2 border border-line-strong font-mono text-claim text-ink-hi transition-colors duration-[var(--dur-tick)] hover:bg-bg-2 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => scrollToStage(index + 1)}
                disabled={index === timeline.length - 1}
                aria-label="Next stage"
                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-r2 border border-line-strong font-mono text-claim text-ink-hi transition-colors duration-[var(--dur-tick)] hover:bg-bg-2 disabled:cursor-default disabled:opacity-30 disabled:hover:bg-transparent"
              >
                →
              </button>
            </div>
          </div>
        </div>

        {/* Edge fades, as a mask on the track rather than a bg-0 gradient
            painted over it. Over the
            temple a painted fade is a dark band; a mask fades the stages
            themselves, and the left fade is wide enough that a stage has
            gone before it reaches the audit rail. */}
        <div
          ref={viewportRef}
          className="relative w-full [mask-image:linear-gradient(to_right,transparent_0,transparent_clamp(0px,calc(var(--page-margin)+24px),120px),#000_clamp(140px,17vw,260px),#000_calc(100%-96px),transparent)]"
        >

          <motion.div ref={railRef} style={{ x }} className="relative w-max pl-[var(--page-margin)]">
            <ol className="relative flex w-max pr-24" style={{ gap: GAP }}>
              {/* The thread: node centre to node centre, drawn by scroll.
                  One scaleX on one element — compositor only. */}
              <li aria-hidden="true" className="absolute top-[7px] left-2 h-px bg-line" style={{ width: span }}>
                <motion.div style={{ scaleX: thread }} className="h-full origin-left bg-seal/60" />
              </li>
              {timeline.map((s, i) => {
                const future = s.date === "NEXT";
                const sealed = i <= reached && !future;
                return (
                  <li key={s.date} style={{ width: CARD_W }} className="shrink-0">
                    <span className="relative flex h-4 w-4 items-center justify-center rounded-full bg-bg-0">
                      {sealed ? (
                        <motion.span
                          initial={{ scale: 1.3, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: DUR.stamp, ease: EASE.stamp }}
                          className="flex"
                        >
                          <Seal state="verified" size={11} />
                        </motion.span>
                      ) : (
                        <Seal state="pending" size={11} className={future ? "text-caution" : undefined} />
                      )}
                    </span>
                    <div
                      className={cn(
                        "mt-6 border-l pl-5 transition-colors duration-[var(--dur-ui)]",
                        sealed ? "border-line-strong" : "border-line",
                      )}
                    >
                      <p className="mono-label">
                        <span className={future ? "text-caution" : "text-ink-md"}>{s.date}</span>
                        <span className="ml-3 text-ink-lo">{s.domain}</span>
                      </p>
                      <h3 className="mt-3 font-display text-2xl leading-snug text-ink-hi">{s.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-ink-md">{s.detail}</p>
                      {s.repos.length > 0 ? (
                        <p className="mt-3 font-mono text-micro text-ink-lo">{s.repos.join(" · ")}</p>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ol>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
