"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as Popover from "@radix-ui/react-popover";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";
import { DUR, EASE } from "@/lib/motion";
import { splitClaimValue, formatCount } from "@/lib/format";
import { useInViewOnce } from "@/hooks/useInViewOnce";
import { useMotionPrefs } from "@/components/providers/MotionPrefsProvider";
import { Seal, verdictToSealState } from "./Seal";
import { Provenance } from "./Provenance";
import type { Claim as ClaimData } from "@/data/types";

const underlineByState: Record<string, string> = {
  verified: "border-line-seal",
  null: "border-flag/40",
  experimental: "border-caution/40",
  pending: "border-dotted border-line-strong",
};

/**
 * The signature component. Server-renders in its final verified state
 * (no-JS visitors see truth, not theater); with motion enabled it runs
 * the SCAN → VERIFY (count-up) → SEAL lifecycle once on first view,
 * and opens a Provenance popover on hover/click/tap.
 */
export function Claim({
  claim,
  size = "md",
  className,
}: {
  claim: ClaimData;
  size?: "md" | "lg";
  className?: string;
}) {
  const { animate } = useMotionPrefs();
  const [ref, inView] = useInViewOnce<HTMLSpanElement>(0.4);
  const sealState = verdictToSealState(claim.verdict);

  // Memoized: this object is an effect dependency; a fresh reference each
  // render would cancel the in-flight rAF loop via the effect cleanup.
  const parts = useMemo(() => splitClaimValue(claim.value), [claim.value]);
  const [display, setDisplay] = useState(claim.value);
  const [stamped, setStamped] = useState(true);
  const hasAnimated = useRef(false);

  // Arm the animation only after mount when motion is allowed — SSR
  // output stays in the final state.
  useEffect(() => {
    if (animate && !hasAnimated.current && !inView && parts) {
      setDisplay(`${parts.prefix}${formatCount(0, parts.decimals)}${parts.suffix}`);
      setStamped(false);
    }
  }, [animate, inView, parts]);

  // VERIFY: count the leading number up, then SEAL.
  useEffect(() => {
    if (!inView || hasAnimated.current || !animate) return;
    hasAnimated.current = true;
    if (!parts) {
      setStamped(true);
      return;
    }
    const start = performance.now();
    const durMs = DUR.reveal * 1000;
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / durMs, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(`${parts.prefix}${formatCount(parts.num * eased, parts.decimals)}${parts.suffix}`);
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setDisplay(claim.value);
        setStamped(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, animate, parts, claim.value]);

  const underline = stamped ? underlineByState[sealState] : underlineByState.pending;

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button
          type="button"
          data-cursor="inspect"
          className={cn(
            "group inline-flex cursor-pointer items-baseline gap-1.5 border-b pb-0.5 font-mono tabular",
            "text-ink-hi transition-colors duration-[var(--dur-tick)] hover:text-white",
            size === "lg" ? "text-2xl md:text-3xl" : "text-claim",
            underline,
            className,
          )}
        >
          {/* Visible text IS the accessible name (plus sr-only context), so
              screen readers and the label-content-name rule agree. */}
          <span ref={ref}>{display}</span>
          <span className="sr-only">
            — {claim.label}. View evidence.
          </span>
          {stamped ? (
            <motion.span
              initial={animate ? { scale: 1.3, opacity: 0 } : false}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: DUR.stamp, ease: EASE.stamp }}
              className="self-center"
            >
              <Seal state={sealState} size={size === "lg" ? 14 : 11} />
            </motion.span>
          ) : (
            <Seal state="pending" size={size === "lg" ? 14 : 11} className="self-center" />
          )}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          sideOffset={8}
          collisionPadding={16}
          className="panel-e2 z-60 outline-none data-[state=open]:animate-[pop-in_var(--dur-tick)_var(--ease-out-pow)] data-[state=closed]:animate-[pop-out_var(--dur-tick)_ease-out]"
        >
          <Provenance claim={claim} />
          <Popover.Arrow className="fill-bg-3" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
