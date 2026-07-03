"use client";

import { forwardRef, useImperativeHandle, useRef, useState } from "react";

export interface DropletHandle {
  /** Falls to (x, y), triggers a small crown splash, resolves at impact. */
  play(x: number, y: number): Promise<void>;
}

const FALL_MS = 210;
const CROWN_MS = 220;

/**
 * The small local flourish before the page-wide ripple: a droplet falls
 * (ease-in, "gravity") and bursts into a brief crown ring on impact —
 * brief steps 2–4. Plain WAAPI on real DOM nodes; the ripple itself
 * (steps 5–11) is the separate view-transition + SVG-filter pipeline,
 * since that part genuinely benefits from GPU compositing across the
 * whole frame.
 */
export const ThemeDroplet = forwardRef<DropletHandle>(function ThemeDroplet(_props, ref) {
  const dropRef = useRef<HTMLDivElement>(null);
  const crownRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  useImperativeHandle(
    ref,
    () => ({
      play(x, y) {
        setPos({ x, y });
        return new Promise<void>((resolve) => {
          // Wait a frame so the elements exist at the new position before animating.
          requestAnimationFrame(() => {
            const drop = dropRef.current;
            const crown = crownRef.current;
            if (!drop || !crown) {
              resolve();
              return;
            }
            const fall = drop.animate(
              [
                { transform: "translate(-50%, -50%) translateY(-34px) scale(0.4)", opacity: 0 },
                { transform: "translate(-50%, -50%) translateY(-14px) scale(0.85)", opacity: 1, offset: 0.4 },
                { transform: "translate(-50%, -50%) translateY(0) scale(1)", opacity: 1 },
              ],
              // ease-in cubic ≈ constant acceleration: "slightly accelerates due to gravity"
              { duration: FALL_MS, easing: "cubic-bezier(0.55, 0, 1, 0.45)", fill: "forwards" },
            );
            fall.onfinish = () => {
              drop.animate([{ opacity: 1 }, { opacity: 0 }], {
                duration: 90,
                easing: "ease-out",
                fill: "forwards",
              });
              crown.animate(
                [
                  { transform: "translate(-50%, -50%) scale(0.15)", opacity: 0.5, offset: 0 },
                  { transform: "translate(-50%, -50%) scale(1)", opacity: 0, offset: 1 },
                ],
                { duration: CROWN_MS, easing: "ease-out", fill: "forwards" },
              );
              resolve();
            };
          });
        });
      },
    }),
    [],
  );

  if (!pos) return null;

  return (
    <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 90, pointerEvents: "none" }}>
      <div
        ref={dropRef}
        style={{
          position: "absolute",
          left: pos.x,
          top: pos.y,
          width: 7,
          height: 7,
          borderRadius: "50%",
          opacity: 0,
          background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.9), var(--data) 70%)",
        }}
      />
      <div
        ref={crownRef}
        style={{
          position: "absolute",
          left: pos.x,
          top: pos.y,
          width: 26,
          height: 26,
          borderRadius: "50%",
          opacity: 0,
          border: "1px solid var(--ink-hi)",
        }}
      />
    </div>
  );
});
