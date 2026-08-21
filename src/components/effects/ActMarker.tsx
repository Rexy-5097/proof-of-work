"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { useMotionPrefs } from "@/components/providers/MotionPrefsProvider";
import { useLenis } from "@/components/providers/LenisProvider";

/**
 * A cinematic act transition — the beat between movements of the audit.
 * Specified in design/06-motion.md §3 ("Act transitions") and previously
 * unbuilt.
 *
 * Composition of libraries, each doing what it is best at:
 *  · CSS `position: sticky` holds the beat for one viewport. Deliberately
 *    NOT GSAP's pin — pin-spacers fight Lenis and mutate layout; sticky
 *    is layout-stable and free.
 *  · GSAP ScrollTrigger scrubs the rule line and the act's opacity to
 *    scroll position, so the beat is *driven* by the reader, not timed.
 *  · Anime.js staggers the title's letters on entry (its stagger engine
 *    is the cleanest of the three for per-character work).
 *
 * Under reduced motion the whole thing degrades to a static, fully
 * legible title card: no sticky runway, no scrub, no letter animation.
 */
/** Wired once per page load, however many act markers mount. */
let scrollTriggerBridged = false;

export function ActMarker({
  act,
  title,
  line,
  className,
}: {
  act: string;
  title: string;
  line: string;
  className?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const { animate: motionOn } = useMotionPrefs();
  const { getLenis } = useLenis();

  useEffect(() => {
    if (!motionOn) return;
    const root = rootRef.current;
    const sticky = stickyRef.current;
    const rule = ruleRef.current;
    if (!root || !sticky || !rule) return;

    let ctx: { revert: () => void } | undefined;
    let played = false;
    let cancelled = false;

    // Both animation engines are loaded on demand: neither GSAP nor
    // Anime.js appears in the initial bundle, so the act markers cost
    // nothing until a reader actually scrolls toward one.
    void Promise.all([import("@/lib/gsap"), import("animejs")]).then(([
      { gsap, ScrollTrigger },
      { animate, stagger },
    ]) => {
      if (cancelled) return;

      /* Sync ScrollTrigger to Lenis. Lenis writes scrollTop every frame;
         without this bridge ScrollTrigger keeps reading native scroll
         events and every scrub trails the page, which reads as lag.
         Wired here rather than in LenisProvider so GSAP stays off pages
         that use no triggers, and guarded so N markers wire it once. */
      const lenis = getLenis();
      if (lenis && !scrollTriggerBridged) {
        scrollTriggerBridged = true;
        lenis.on("scroll", ScrollTrigger.update);
        ScrollTrigger.refresh();
      }
      ctx = gsap.context(() => {
        gsap.fromTo(
          rule,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.4,
            },
          },
        );
        gsap.fromTo(
          sticky,
          { opacity: 0.25 },
          {
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top bottom",
              end: "top top",
              scrub: 0.4,
            },
          },
        );
        ScrollTrigger.create({
          trigger: root,
          start: "top 70%",
          once: true,
          onEnter: () => {
            if (played || !titleRef.current) return;
            played = true;
            animate(titleRef.current.querySelectorAll("[data-char]"), {
              opacity: [0, 1],
              translateY: [14, 0],
              duration: 620,
              delay: stagger(26),
              ease: "out(3)",
            });
          },
        });
      }, root);
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, [motionOn, getLenis]);

  const chars = [...title];

  return (
    <div
      ref={rootRef}
      className={cn(motionOn ? "relative h-[190vh]" : "relative", className)}
    >
      <div
        ref={stickyRef}
        className={cn(
          "flex flex-col justify-center",
          motionOn ? "sticky top-0 h-svh" : "py-24",
        )}
      >
        <p className="mono-label mb-6 tracking-[0.2em] text-ink-lo">{act}</p>
        <p
          ref={titleRef}
          className="font-display text-[length:var(--t-h1)] leading-[1.06] text-ink-hi"
        >
          {/* Real text for assistive tech; the spans are only animation targets. */}
          <span className="sr-only">{title}</span>
          <span aria-hidden="true">
            {chars.map((c, i) => (
              <span
                key={`${c}-${i}`}
                data-char
                className="inline-block whitespace-pre"
                style={motionOn ? { opacity: 0 } : undefined}
              >
                {c}
              </span>
            ))}
          </span>
        </p>
        <span
          ref={ruleRef}
          aria-hidden="true"
          className="mt-8 block h-px w-full origin-left bg-seal/60"
          style={motionOn ? { transform: "scaleX(0)" } : undefined}
        />
        <p className="mt-6 max-w-[46ch] text-ink-md">{line}</p>
      </div>
    </div>
  );
}
