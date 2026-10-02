"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionPrefs } from "@/components/providers/MotionPrefsProvider";

/**
 * The inspection cursor (design/06-motion.md §5) — specified in Phase 2,
 * never built until now.
 *
 * The mechanism follows React Bits' TargetCursor (MIT): four
 * corner brackets that leave the pointer and lock onto the bounds of
 * whatever is under it. That is exactly the storyboard's "inspect" mode —
 * ring → ⌜⌝⌞⌟ around a Claim — so the port keeps the lock and drops
 * everything that fails this site's pillars:
 *
 *  · No idle spin. The source rotates the brackets forever; here nothing
 *    loops at full attention, so at rest the brackets are a still square.
 *  · No glow, and never green. The cursor inspects; it does not verdict.
 *  · No GSAP. The source tweens every corner through GSAP each frame; this
 *    is one rAF loop with frame-rate-independent exponential smoothing that
 *    parks itself once everything has settled, so an idle cursor costs
 *    nothing at all.
 *
 * Modes, resolved from the element under the pointer:
 *   default    6px dot + a 24px bracket square trailing it
 *   inspect    [data-cursor="inspect"] — brackets frame the element, a
 *              mono VERIFY tag rides its corner
 *   link       a / button / summary — brackets frame the control tightly
 *              and lean ≤3px toward the pointer, so the lock feels held
 *              rather than painted on
 *   crosshair  [data-cursor="crosshair"] — brackets fold away, the dot
 *              becomes a hairline cross with element-local coordinates
 *              (the dev-tool moment, over the architecture diagrams)
 *   text       inputs — everything hides, the native I-beam returns
 *
 * Fine pointers ≥1024px with motion allowed only. Escape toggles it off
 * (persisted) whenever no popover is open to claim the key first. Touch,
 * reduced motion and keyboard users never see it, and it never replaces a
 * focus ring.
 */

type Mode = "default" | "inspect" | "link" | "crosshair" | "text";

const STORAGE_KEY = "pow-cursor-off";
const LINK_SELECTOR = "a[href], button, summary, [role='button'], [role='switch'], label[for], select";
const TEXT_SELECTOR = "input, textarea, [contenteditable='true']";
/** Half the resting bracket square. */
const REST = 12;
/** Bracket arm length. */
const ARM = 9;
/** Anything larger than this is a region, not a control: framing a whole
 *  section in brackets reads as a selection box, not an inspection. */
const MAX_LOCK = { w: 560, h: 220 };

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

function resolve(el: Element | null): { mode: Mode; target: Element | null } {
  if (!el) return { mode: "default", target: null };
  if (el.closest(TEXT_SELECTOR)) return { mode: "text", target: null };
  const inspect = el.closest("[data-cursor='inspect']");
  if (inspect) return { mode: "inspect", target: inspect };
  const cross = el.closest("[data-cursor='crosshair']");
  if (cross) return { mode: "crosshair", target: cross };
  const link = el.closest(LINK_SELECTOR);
  if (link) {
    const r = link.getBoundingClientRect();
    if (r.width <= MAX_LOCK.w && r.height <= MAX_LOCK.h) return { mode: "link", target: link };
  }
  return { mode: "default", target: null };
}

export function InspectCursor() {
  const { animate } = useMotionPrefs();
  const [enabled, setEnabled] = useState(false);
  const [userOff, setUserOff] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const crossRef = useRef<HTMLDivElement>(null);
  const cornerRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const tagRef = useRef<HTMLSpanElement>(null);

  // Capability gate: decided once on mount and on media changes, never per
  // frame. A coarse pointer or a narrow viewport keeps the native cursor.
  useEffect(() => {
    setUserOff(localStorage.getItem(STORAGE_KEY) === "1");
    const mq = window.matchMedia("(pointer: fine) and (hover: hover) and (min-width: 1024px)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  // Escape toggles the custom cursor — unless a popover or dialog is open,
  // in which case Escape belongs to it (Radix closes the provenance card).
  useEffect(() => {
    if (!enabled || !animate) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      if (document.querySelector("[data-radix-popper-content-wrapper], [role='dialog']")) return;
      setUserOff((v) => {
        const next = !v;
        localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
        return next;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [enabled, animate]);

  const active = enabled && animate && !userOff;

  useEffect(() => {
    if (!active) return;
    const root = rootRef.current;
    const dot = dotRef.current;
    const cross = crossRef.current;
    const tag = tagRef.current;
    const corners = cornerRefs.current;
    if (!root || !dot || !cross || !tag || corners.some((c) => !c)) return;

    document.documentElement.classList.add("pow-cursor");

    const pointer = { x: -100, y: -100 };
    // The frame is what the brackets draw; it eases toward `goal` each frame.
    const frame: Box = { x: -100 - REST, y: -100 - REST, w: REST * 2, h: REST * 2 };
    const goal: Box = { ...frame };
    let mode: Mode = "default";
    let target: Element | null = null;
    let visible = false;
    let pressed = false;
    let raf = 0;
    let last = 0;
    let lastScroll = window.scrollY;
    let lastResolve = 0;
    /** Until when a locked frame must keep tracking its target's box: while
     *  the page is moving under it, and briefly after. */
    let trackUntil = 0;
    let tagText = "";

    const setTag = (text: string) => {
      if (text === tagText) return;
      tagText = text;
      tag.textContent = text;
    };

    const applyMode = (next: Mode, nextTarget: Element | null) => {
      if (next === mode && nextTarget === target) return;
      mode = next;
      target = nextTarget;
      root.dataset.mode = next;
      if (next === "inspect") setTag("VERIFY");
      else if (next !== "crosshair") setTag("");
    };

    const computeGoal = () => {
      const pressScale = pressed ? 0.86 : 1;
      if ((mode === "inspect" || mode === "link") && target?.isConnected) {
        const r = target.getBoundingClientRect();
        const pad = mode === "inspect" ? 6 : 4;
        // The lean: brackets drift a few px toward the pointer inside the
        // locked box, which is what keeps a held lock from looking static.
        const lx = ((pointer.x - (r.left + r.width / 2)) / Math.max(r.width, 1)) * 6;
        const ly = ((pointer.y - (r.top + r.height / 2)) / Math.max(r.height, 1)) * 6;
        goal.x = r.left - pad + lx;
        goal.y = r.top - pad + ly;
        goal.w = r.width + pad * 2;
        goal.h = r.height + pad * 2;
        if (pressed) {
          goal.x += (goal.w * (1 - pressScale)) / 2;
          goal.y += (goal.h * (1 - pressScale)) / 2;
          goal.w *= pressScale;
          goal.h *= pressScale;
        }
      } else {
        const half = (mode === "crosshair" ? 4 : REST) * pressScale;
        goal.x = pointer.x - half;
        goal.y = pointer.y - half;
        goal.w = half * 2;
        goal.h = half * 2;
      }
    };

    const render = () => {
      dot.style.transform = `translate3d(${pointer.x}px, ${pointer.y}px, 0)`;
      cross.style.transform = dot.style.transform;
      const { x, y, w, h } = frame;
      const right = x + w - ARM;
      const bottom = y + h - ARM;
      corners[0]!.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      corners[1]!.style.transform = `translate3d(${right}px, ${y}px, 0)`;
      corners[2]!.style.transform = `translate3d(${right}px, ${bottom}px, 0)`;
      corners[3]!.style.transform = `translate3d(${x}px, ${bottom}px, 0)`;
      if (mode === "crosshair") {
        tag.style.transform = `translate3d(${pointer.x + 14}px, ${pointer.y + 12}px, 0)`;
      } else {
        tag.style.transform = `translate3d(${x + w + 6}px, ${y + h - 4}px, 0)`;
      }
    };

    const tick = (now: number) => {
      raf = 0;
      const dt = Math.min((now - (last || now)) / 1000, 0.05) || 1 / 60;
      last = now;

      // Scrolling moves content under a still pointer, so the target has to
      // be re-resolved from the pointer position — but elementFromPoint is a
      // hit test that forces layout, and running it on every Lenis frame was
      // a measurable share of scroll cost. Eight times a second is plenty to
      // hand the lock over as rows pass under the pointer.
      if (window.scrollY !== lastScroll) {
        lastScroll = window.scrollY;
        trackUntil = now + 250;
        if (now - lastResolve > 120) {
          lastResolve = now;
          const r = resolve(document.elementFromPoint(pointer.x, pointer.y));
          applyMode(r.mode, r.target);
        }
      }

      if (mode === "crosshair" && target) {
        const r = target.getBoundingClientRect();
        setTag(`x:${Math.round(pointer.x - r.left)} y:${Math.round(pointer.y - r.top)}`);
      }

      computeGoal();
      // ~70ms time constant for the lock, a touch looser at rest so the
      // square visibly trails the dot — the storyboard's lerp 0.18 at 60fps.
      const tau = mode === "default" || mode === "crosshair" ? 0.075 : 0.06;
      const k = 1 - Math.exp(-dt / tau);
      let moving = false;
      for (const key of ["x", "y", "w", "h"] as const) {
        const d = goal[key] - frame[key];
        if (Math.abs(d) > 0.1) {
          frame[key] += d * k;
          moving = true;
        } else {
          frame[key] = goal[key];
        }
      }
      render();
      // Park when settled. A held lock only needs re-measuring while the page
      // moves under it; a still pointer on a still button costs nothing.
      // Pointer moves and scrolls wake the loop again.
      if (moving || (target && now < trackUntil)) raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!raf) {
        last = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      pointer.x = e.clientX;
      pointer.y = e.clientY;
      if (!visible) {
        visible = true;
        root.dataset.visible = "";
        // First sighting: snap rather than fly in from the corner.
        frame.x = pointer.x - REST;
        frame.y = pointer.y - REST;
      }
      const r = resolve(e.target as Element);
      applyMode(r.mode, r.target);
      wake();
    };
    const onDown = () => {
      pressed = true;
      wake();
    };
    const onUp = () => {
      pressed = false;
      wake();
    };
    const onLeave = () => {
      visible = false;
      delete root.dataset.visible;
    };
    const onScroll = () => {
      if (visible) wake();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("scroll", onScroll);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.documentElement.classList.remove("pow-cursor");
      delete root.dataset.visible;
    };
  }, [active]);

  if (!active) return null;

  return (
    <div ref={rootRef} aria-hidden="true" data-mode="default" className="pow-cursor-layer">
      <div ref={dotRef} className="pow-cursor-dot" />
      <div ref={crossRef} className="pow-cursor-cross" />
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          ref={(el) => {
            cornerRefs.current[i] = el;
          }}
          className="pow-cursor-corner"
          data-corner={i}
        />
      ))}
      <span ref={tagRef} className="pow-cursor-tag" />
    </div>
  );
}
