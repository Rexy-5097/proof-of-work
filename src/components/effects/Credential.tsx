"use client";

import { useEffect, useId, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Seal } from "@/components/primitives/Seal";
import { useMotionPrefs } from "@/components/providers/MotionPrefsProvider";
import { useSound } from "@/components/providers/SoundProvider";
import { registry } from "@/data/registry";
import { site } from "@/data/site";

/** Rope segments and their rest length (px). */
const SEGMENTS = 8;
const SEG_LEN = 18;
const CARD_W = 232;
const CARD_H = 388;
/** px/s² — a touch heavier than Earth at this scale, so the card settles
 *  in a couple of swings rather than drifting. */
const GRAVITY = 2200;
const DAMPING = 0.986;
const ITERATIONS = 14;
const STEP = 1 / 120;
const STAGE_H = 24 + SEGMENTS * SEG_LEN + CARD_H + 48;

interface Pt {
  x: number;
  y: number;
  px: number;
  py: number;
}

const sha = process.env.NEXT_PUBLIC_BUILD_SHA ?? "unversioned";

/** Bars derived from the build hash — the barcode encodes something real. */
function barsFrom(hex: string): number[] {
  const digits = hex.replace(/[^0-9a-f]/gi, "").padEnd(7, "0").slice(0, 7);
  return [...digits].flatMap((d) => {
    const n = Number.parseInt(d, 16);
    return [1 + (n & 3), 1 + ((n >> 2) & 1), 1 + ((n >> 3) & 1) * 2];
  });
}

/**
 * The auditor's credential — a lanyard ID card on a physics rope.
 *
 * The source is React Bits' Lanyard: react-three-fiber, Rapier physics
 * (WASM) and meshline, rendering a GLB card on a rope. That is a lot of
 * engine for one object, and it would not even install here — this site
 * pins three r151 for the Kage world, below what the R3F/Rapier stack
 * needs. So the behaviour is kept and the engine is not:
 *
 *  · The rope is a Verlet chain (positions + previous positions, distance
 *    constraints relaxed a dozen times per substep) — the textbook cloth
 *    integrator, ~60 lines, no dependencies. The card hangs off the end as
 *    a two-point rigid rod, so it swings like a pendulum and its angle
 *    falls out of the simulation instead of being animated.
 *  · Grab the card anywhere and drag; release and it keeps your velocity,
 *    because Verlet velocity *is* the gap between the two positions. A
 *    click without travel flips it, because a credential's front and back
 *    actually mean something.
 *  · Horizontal speed twists the card a few degrees about its vertical
 *    axis, the cheap version of the source's 3D tumble.
 *  · The strap carries the site's name as an SVG textPath along the rope,
 *    in place of the source's printed lanyard texture.
 *
 * The card is a credential, not decoration: name, role, the build it was
 * issued by (the barcode is that hash, bar for bar), and on the back the
 * counts the boot sequence verifies. On first view it drops in and swings
 * once; then the loop parks until someone touches it. Reduced motion: it
 * hangs still, and still flips.
 */
export function Credential({ className }: { className?: string }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const strapRef = useRef<SVGPathElement>(null);
  const [flipped, setFlipped] = useState(false);
  const { animate } = useMotionPrefs();
  const { play } = useSound();
  const strapId = useId().replace(/:/g, "");

  // Kept in a ref so the physics effect does not tear down on every flip.
  const flipRef = useRef<() => void>(() => {});
  flipRef.current = () => {
    setFlipped((f) => !f);
    play("toggle");
  };

  useEffect(() => {
    const stage = stageRef.current;
    const card = cardRef.current;
    const strap = strapRef.current;
    if (!stage || !card || !strap) return;

    let width = stage.clientWidth;
    const anchor = () => ({ x: width / 2, y: 24 });

    // Chain: rope[0] is the fixed anchor; rope[SEGMENTS] is the card's clip.
    const rope: Pt[] = [];
    const reset = (dropIn: boolean) => {
      const a = anchor();
      rope.length = 0;
      for (let i = 0; i <= SEGMENTS; i++) {
        // Drop-in pose: the rope laid out to the upper right of the anchor,
        // so gravity swings it down through the frame on first view.
        const x = dropIn ? a.x + i * SEG_LEN * 0.9 : a.x;
        const y = dropIn ? a.y - i * SEG_LEN * 0.25 : a.y + i * SEG_LEN;
        rope.push({ x, y, px: x, py: y });
      }
      const top = rope[SEGMENTS]!;
      const bx = dropIn ? top.x + CARD_H * 0.85 : top.x;
      const by = dropIn ? top.y + CARD_H * 0.5 : top.y + CARD_H;
      bottom.x = bottom.px = bx;
      bottom.y = bottom.py = by;
    };
    const bottom: Pt = { x: 0, y: 0, px: 0, py: 0 };

    let twist = 0;
    const render = () => {
      const top = rope[SEGMENTS]!;
      const angle = Math.atan2(bottom.x - top.x, bottom.y - top.y);
      card.style.transform =
        `translate3d(${top.x - CARD_W / 2}px, ${top.y}px, 0) ` +
        `rotate(${(-angle * 180) / Math.PI}deg) perspective(900px) rotateY(${twist}deg)`;
      // Strap: a smooth curve through the chain (midpoint quadratic).
      let d = `M ${rope[0]!.x} ${rope[0]!.y}`;
      for (let i = 1; i < rope.length - 1; i++) {
        const p = rope[i]!;
        const n = rope[i + 1]!;
        d += ` Q ${p.x} ${p.y} ${(p.x + n.x) / 2} ${(p.y + n.y) / 2}`;
      }
      d += ` L ${top.x} ${top.y}`;
      strap.setAttribute("d", d);
    };

    const satisfy = (a: Pt, b: Pt, len: number, aFixed: boolean, bFixed: boolean) => {
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 1e-6;
      const diff = (dist - len) / dist;
      if (aFixed && bFixed) return;
      if (aFixed) {
        b.x -= dx * diff;
        b.y -= dy * diff;
      } else if (bFixed) {
        a.x += dx * diff;
        a.y += dy * diff;
      } else {
        a.x += dx * diff * 0.5;
        a.y += dy * diff * 0.5;
        b.x -= dx * diff * 0.5;
        b.y -= dy * diff * 0.5;
      }
    };

    // ── drag state ─────────────────────────────────────────────────────
    let dragging = false;
    let pressed = false;
    let grabT = 0.5;
    const grabOffset = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let downAt = { x: 0, y: 0 };
    let travelled = 0;

    const applyDrag = () => {
      const top = rope[SEGMENTS]!;
      const gx = top.x + (bottom.x - top.x) * grabT;
      const gy = top.y + (bottom.y - top.y) * grabT;
      // Keep the card within reach of the rope (plus a little stretch),
      // or the constraints and the hand would fight every frame.
      const a = anchor();
      let tx = target.x + grabOffset.x;
      let ty = target.y + grabOffset.y;
      const reach = SEGMENTS * SEG_LEN * 1.08 + CARD_H * grabT;
      const rx = tx - a.x;
      const ry = ty - a.y;
      const rl = Math.hypot(rx, ry);
      if (rl > reach) {
        tx = a.x + (rx / rl) * reach;
        ty = a.y + (ry / rl) * reach;
      }
      const dx = tx - gx;
      const dy = ty - gy;
      top.x += dx;
      top.y += dy;
      bottom.x += dx;
      bottom.y += dy;
    };

    const simulate = (dt: number) => {
      const a = anchor();
      const g = GRAVITY * dt * dt;
      rope[0]!.x = rope[0]!.px = a.x;
      rope[0]!.y = rope[0]!.py = a.y;
      for (let i = 1; i <= SEGMENTS + 1; i++) {
        const p = i <= SEGMENTS ? rope[i]! : bottom;
        const vx = (p.x - p.px) * DAMPING;
        const vy = (p.y - p.py) * DAMPING;
        p.px = p.x;
        p.py = p.y;
        p.x += vx;
        p.y += vy + g;
      }
      for (let k = 0; k < ITERATIONS; k++) {
        if (dragging) applyDrag();
        for (let i = 0; i < SEGMENTS; i++) {
          satisfy(rope[i]!, rope[i + 1]!, SEG_LEN, i === 0, false);
        }
        satisfy(rope[SEGMENTS]!, bottom, CARD_H, false, false);
      }
      if (dragging) applyDrag();
      const top = rope[SEGMENTS]!;
      const vx = top.x - top.px;
      twist += (Math.max(-28, Math.min(28, -vx * 4)) - twist) * 0.12;
    };

    let raf = 0;
    let last = 0;
    let acc = 0;
    let calm = 0;
    let visible = false;

    const energy = () => {
      let e = Math.abs(bottom.x - bottom.px) + Math.abs(bottom.y - bottom.py);
      for (const p of rope) e += Math.abs(p.x - p.px) + Math.abs(p.y - p.py);
      return e;
    };

    const loop = (now: number) => {
      raf = 0;
      const dt = Math.min((now - (last || now)) / 1000, 1 / 20);
      last = now;
      acc += dt;
      while (acc >= STEP) {
        simulate(STEP);
        acc -= STEP;
      }
      render();
      calm = energy() < 0.05 && Math.abs(twist) < 0.05 ? calm + 1 : 0;
      // Park once it has hung still for half a second.
      if (visible && (dragging || calm < 30)) raf = requestAnimationFrame(loop);
    };
    const wake = () => {
      if (!raf && animate) {
        last = 0;
        calm = 0;
        raf = requestAnimationFrame(loop);
      }
    };

    reset(false);
    render();
    stage.dataset.live = "";

    // The drop fires as the anchor rail comes into view — the card itself
    // is still below the fold, so it is never seen snapping to the pose.
    let dropped = false;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry?.isIntersecting ?? false;
        if (!visible) return;
        if (animate && !dropped) {
          dropped = true;
          reset(true);
        }
        wake();
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(stage);

    const local = (e: PointerEvent) => {
      const r = stage.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      pressed = true;
      downAt = { x: e.clientX, y: e.clientY };
      travelled = 0;
      if (!animate) return;
      dragging = true;
      card.setPointerCapture(e.pointerId);
      const p = local(e);
      const top = rope[SEGMENTS]!;
      // Project the grab onto the card's axis to find how far down it is.
      const ax = bottom.x - top.x;
      const ay = bottom.y - top.y;
      grabT = Math.max(0.05, Math.min(0.95, ((p.x - top.x) * ax + (p.y - top.y) * ay) / (CARD_H * CARD_H)));
      const gx = top.x + ax * grabT;
      const gy = top.y + ay * grabT;
      grabOffset.x = gx - p.x;
      grabOffset.y = gy - p.y;
      target.x = p.x;
      target.y = p.y;
      stage.dataset.dragging = "";
      wake();
    };
    const onMove = (e: PointerEvent) => {
      if (pressed) travelled = Math.max(travelled, Math.hypot(e.clientX - downAt.x, e.clientY - downAt.y));
      if (!dragging) return;
      const p = local(e);
      target.x = p.x;
      target.y = p.y;
    };
    const onUp = (e: PointerEvent) => {
      if (dragging) {
        dragging = false;
        delete stage.dataset.dragging;
        if (card.hasPointerCapture(e.pointerId)) card.releasePointerCapture(e.pointerId);
        wake();
      }
      // A press that never travelled is a click: turn the card over.
      if (pressed && travelled < 5) flipRef.current();
      pressed = false;
    };
    const onResize = () => {
      const prev = width;
      width = stage.clientWidth;
      const shift = (width - prev) / 2;
      for (const p of [...rope, bottom]) {
        p.x += shift;
        p.px += shift;
      }
      render();
      wake();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(stage);

    card.addEventListener("pointerdown", onDown);
    card.addEventListener("pointermove", onMove);
    card.addEventListener("pointerup", onUp);
    card.addEventListener("pointercancel", onUp);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      card.removeEventListener("pointerdown", onDown);
      card.removeEventListener("pointermove", onMove);
      card.removeEventListener("pointerup", onUp);
      card.removeEventListener("pointercancel", onUp);
    };
  }, [animate]);

  const bars = barsFrom(sha);

  return (
    <div
      ref={stageRef}
      className={cn("credential relative w-full select-none [container-type:inline-size]", className)}
      style={{ height: STAGE_H }}
    >
      {/* The anchor: a hairline rail and a ring, so the strap hangs from
          something rather than from the edge of the layout box. */}
      <div aria-hidden="true" className="absolute top-[18px] left-1/2 h-px w-28 -translate-x-1/2 bg-line-strong" />
      <div aria-hidden="true" className="absolute top-[19px] left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full border border-ink-lo" />

      {/* No-JS strap: a plain vertical band, hidden once the rope is live. */}
      <div
        aria-hidden="true"
        className="credential-strap-fallback absolute top-6 left-1/2 w-3 -translate-x-1/2 rounded-full bg-bg-3"
        style={{ height: SEGMENTS * SEG_LEN }}
      />

      {/* One path, drawn twice through <use> (a hairline edge under the
          band) and carrying the strap text along it. */}
      <svg aria-hidden="true" className="pointer-events-none absolute inset-0 h-full w-full overflow-visible">
        <defs>
          <path ref={strapRef} id={strapId} d="M 0 0" />
        </defs>
        <use href={`#${strapId}`} fill="none" stroke="var(--line-strong)" strokeWidth="13" strokeLinecap="round" />
        <use href={`#${strapId}`} fill="none" stroke="var(--bg-3)" strokeWidth="11" strokeLinecap="round" />
        <text className="fill-ink-lo font-mono" fontSize="7" letterSpacing="1.6" dy="2.5">
          <textPath href={`#${strapId}`} startOffset="6">
            PROOF OF WORK · AUDITOR · PROOF OF WORK · AUDITOR
          </textPath>
        </text>
      </svg>

      <div
        ref={cardRef}
        role="button"
        tabIndex={0}
        aria-pressed={flipped}
        aria-label={`Auditor credential for ${site.name}. Press to turn it over.`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            flipRef.current();
          }
        }}
        className="credential-card absolute top-0 left-0 cursor-grab touch-none [transform-origin:50%_0] active:cursor-grabbing"
        style={{
          width: CARD_W,
          height: CARD_H,
          // Server/no-JS position: hanging straight down from the anchor.
          // The physics loop takes over with transforms after mount.
          transform: `translate3d(calc(50cqw - ${CARD_W / 2}px), ${24 + SEGMENTS * SEG_LEN}px, 0)`,
        }}
      >
        <div className={cn("credential-flip relative h-full w-full", flipped && "is-flipped")}>
          {/* ── front ─────────────────────────────────────────────── */}
          <div className="credential-face panel-e2 flex flex-col overflow-hidden !rounded-r3 p-5">
            <div aria-hidden="true" className="mx-auto -mt-1 mb-4 h-1.5 w-10 rounded-full bg-bg-0 shadow-[inset_0_1px_2px_rgb(0_0_0/0.6)]" />
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-mono text-micro tracking-[0.12em] text-ink-hi">
                <Seal state="verified" size={9} />
                PROOF OF WORK
              </span>
              <span className="font-mono text-micro text-ink-lo">AUDITOR</span>
            </div>
            {/* The ID photograph, with the hero's reveal in miniature: a lens
                follows the pointer and shows the evidence scan of the same
                frame through it (a CSS mask, no WebGL — the card is small). */}
            <div
              className="credential-photo relative mt-4 h-44 overflow-hidden rounded-r2 border border-line bg-bg-1"
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--lx", `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty("--ly", `${e.clientY - r.top}px`);
              }}
            >
              <div
                aria-hidden="true"
                className="absolute inset-0 opacity-60"
                style={{
                  backgroundImage:
                    "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
                  backgroundSize: "12px 12px",
                }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/portrait/id.webp"
                alt={`${site.name}, ID photograph`}
                width={480}
                height={600}
                draggable={false}
                loading="lazy"
                className="relative h-full w-full object-cover object-[50%_58%]"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/portrait/id-scan.webp"
                alt=""
                aria-hidden="true"
                width={480}
                height={600}
                draggable={false}
                loading="lazy"
                className="credential-photo__scan absolute inset-0 h-full w-full object-cover object-[50%_58%]"
              />
              <span aria-hidden="true" className="absolute top-1.5 left-1.5 h-2.5 w-2.5 border-t border-l border-ink-md" />
              <span aria-hidden="true" className="absolute top-1.5 right-1.5 h-2.5 w-2.5 border-t border-r border-ink-md" />
              <span aria-hidden="true" className="absolute bottom-1.5 left-1.5 h-2.5 w-2.5 border-b border-l border-ink-md" />
              <span aria-hidden="true" className="absolute right-1.5 bottom-1.5 h-2.5 w-2.5 border-r border-b border-ink-md" />
            </div>
            <p className="mt-4 font-mono text-[0.8125rem] font-medium tracking-[0.08em] text-ink-hi">
              {site.name.toUpperCase()}
            </p>
            <p className="mt-1 text-[0.8125rem] text-ink-md">Backend &amp; AI-Systems Engineer</p>
            <dl className="mt-4 space-y-1 font-mono text-micro text-ink-lo">
              <div className="flex justify-between">
                <dt>CLEARANCE</dt>
                <dd className="flex items-center gap-1 text-seal">
                  <Seal state="verified" size={8} /> VERIFIED
                </dd>
              </div>
              <div className="flex justify-between">
                <dt>ISSUED BY BUILD</dt>
                <dd className="tabular text-ink-md">{sha}</dd>
              </div>
            </dl>
            <div aria-hidden="true" className="mt-auto flex h-7 items-stretch gap-[2px] pt-3 opacity-70">
              {bars.map((w, i) => (
                <span key={i} className={i % 2 === 0 ? "bg-ink-md" : "bg-transparent"} style={{ width: w }} />
              ))}
            </div>
          </div>

          {/* ── back ──────────────────────────────────────────────── */}
          <div className="credential-face credential-back panel-e2 flex flex-col overflow-hidden !rounded-r3 p-5 font-mono">
            <div aria-hidden="true" className="mx-auto -mt-1 mb-4 h-1.5 w-10 rounded-full bg-bg-0 shadow-[inset_0_1px_2px_rgb(0_0_0/0.6)]" />
            {/* The back wears the evidence scan of the front's photo. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/portrait/id-scan.webp"
              alt="Evidence scan of the ID photograph"
              width={480}
              height={600}
              draggable={false}
              loading="lazy"
              className="h-32 w-full rounded-r2 border border-line bg-bg-0 object-cover object-[50%_55%]"
            />
            <p className="mono-label mt-3 text-[0.6875rem]">CREDENTIAL TERMS</p>
            <p className="mt-1.5 text-micro leading-relaxed text-ink-md">
              Valid while the evidence holds.
            </p>
            <dl className="mt-3 space-y-1 text-micro text-ink-lo">
              <div className="flex justify-between">
                <dt>REPOSITORIES</dt>
                <dd className="tabular text-ink-hi">{registry.repositories}</dd>
              </div>
              <div className="flex justify-between">
                <dt>VERIFIED CLAIMS</dt>
                <dd className="tabular text-ink-hi">{registry.verifiedClaims}</dd>
              </div>
              <div className="flex justify-between">
                <dt>EVIDENCE LINKS</dt>
                <dd className="tabular text-ink-hi">{registry.evidenceLinks}</dd>
              </div>
              <div className="flex justify-between">
                <dt>NULL VERDICTS</dt>
                <dd className="flex items-center gap-1 tabular text-flag">
                  <Seal state="null" size={8} /> {registry.nullResults}
                </dd>
              </div>
            </dl>
            <p className="mt-auto border-t border-line pt-3 text-micro leading-relaxed text-ink-lo">
              IF FOUND, RETURN TO
              <br />
              <span className="text-data">{site.email}</span>
            </p>
          </div>
        </div>
      </div>

      <p className="pointer-events-none absolute right-0 bottom-0 left-0 text-center font-mono text-micro tracking-[0.1em] text-ink-lo">
        {animate ? "DRAG IT · CLICK TO TURN OVER" : "PRESS TO TURN OVER"}
      </p>
    </div>
  );
}
