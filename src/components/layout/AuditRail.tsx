"use client";

import { useCallback, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { auditSections } from "@/data/site";
import { Seal } from "@/components/primitives/Seal";
import { useAuditProgress } from "@/components/providers/AuditProgressProvider";
import { useLenis } from "@/components/providers/LenisProvider";
import { useSound } from "@/components/providers/SoundProvider";
import { useMotionPrefs } from "@/components/providers/MotionPrefsProvider";

/** Pointer distance (px) at which an item stops responding. */
const RADIUS = 72;
/** Exponential-smoothing time constant (s) for every item's --effect. */
const TAU = 0.1;
/** smoothstep falloff. */
const falloff = (p: number) => p * p * (3 - 2 * p);

/**
 * Navigation as checklist (design/04-components.md). Desktop ≥1280 only;
 * smaller viewports get <ScrollProgress> instead. The interlude section
 * intentionally stamps ◈ in flag red — the audit's one honest "no".
 *
 * The hover behaviour is proximity-driven: instead of one item
 * reacting when the pointer is exactly on it, every item reads its
 * distance to the pointer and responds on a smooth falloff — so running a
 * finger down the rail sweeps a lens along the checklist, the nearest
 * entry fully open and its neighbours half-open. Each item eases toward
 * its target in a single rAF loop (frame-rate independent, parked once
 * settled), writing one custom property; CSS turns `--effect` into the
 * lean, the tick length and the label's SCAN-style clip reveal.
 *
 * Keyboard focus opens an item fully without the physics; reduced motion
 * keeps the plain one-item hover.
 */
export function AuditRail() {
  const { visited, current } = useAuditProgress();
  const { scrollTo } = useLenis();
  const { play } = useSound();
  const { animate } = useMotionPrefs();
  const pathname = usePathname();
  const done = visited.size;
  const total = auditSections.length;

  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const targets = useRef<number[]>([]);
  const values = useRef<number[]>([]);
  const raf = useRef(0);
  const last = useRef(0);

  const frame = useCallback((now: number) => {
    const dt = Math.min((now - last.current) / 1000, 0.05);
    last.current = now;
    const k = 1 - Math.exp(-dt / TAU);
    let moving = false;
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const target = targets.current[i] ?? 0;
      const cur = values.current[i] ?? 0;
      let next = cur + (target - cur) * k;
      if (Math.abs(target - next) < 0.002) next = target;
      else moving = true;
      values.current[i] = next;
      el.style.setProperty("--effect", next.toFixed(3));
    });
    raf.current = moving ? requestAnimationFrame(frame) : 0;
  }, []);

  const wake = useCallback(() => {
    if (raf.current) return;
    last.current = performance.now();
    raf.current = requestAnimationFrame(frame);
  }, [frame]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  const onPointerMove = (e: React.PointerEvent<HTMLOListElement>) => {
    if (!animate || e.pointerType !== "mouse") return;
    itemRefs.current.forEach((el, i) => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const d = Math.abs(e.clientY - (r.top + r.height / 2));
      targets.current[i] = falloff(Math.max(0, 1 - d / RADIUS));
    });
    wake();
  };

  const onPointerLeave = () => {
    targets.current = targets.current.map(() => 0);
    wake();
  };

  // The audit is its own route now; every other page gets ScrollProgress.
  if (pathname !== "/proof") return null;

  return (
    <nav
      aria-label="Audit progress"
      className="fixed top-1/2 left-0 z-40 hidden w-[var(--rail-width)] -translate-y-1/2 flex-col items-start xl:flex"
    >
      <ol
        className={cn("audit-rail flex flex-col gap-4 py-2 pr-6", animate && "audit-rail--physics")}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
      >
        {auditSections.map((s, i) => {
          const isVisited = visited.has(s.id);
          const isCurrent = current === s.id;
          const isNull = s.id === "interlude";
          return (
            <li
              key={s.id}
              ref={(el) => {
                itemRefs.current[i] = el;
              }}
              className="audit-rail__item"
            >
              <a
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(`#${s.id}`);
                  play("tap");
                }}
                aria-current={isCurrent ? "location" : undefined}
                className="audit-rail__link group relative flex min-h-6 items-center gap-2 py-0.5"
              >
                <span aria-hidden="true" className="audit-rail__tick" />
                {isVisited ? (
                  <Seal state={isNull ? "null" : "verified"} size={9} />
                ) : (
                  <Seal state="pending" size={9} />
                )}
                <span
                  className={cn(
                    "font-mono text-micro tabular transition-colors duration-[var(--dur-tick)]",
                    isCurrent ? "text-ink-hi" : "audit-rail__num text-ink-lo",
                  )}
                >
                  {s.number}
                </span>
                <span className={cn("audit-rail__label mono-label whitespace-nowrap", isCurrent && "text-ink-md")}>
                  {s.label}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
      <p className="mt-6 ml-[18px] -rotate-90 font-mono text-micro whitespace-nowrap text-ink-lo tabular">
        {done}/{total}
      </p>
    </nav>
  );
}
