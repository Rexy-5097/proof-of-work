"use client";

import { useEffect, useRef } from "react";
import { useMotionPrefs } from "@/components/providers/MotionPrefsProvider";
import { createKageWorld, type KageWorld as KageWorldApi } from "./kageRenderer";

/** requestIdleCallback where it exists, a short timer where it does not
 *  (Safari only shipped it in 17). Either way the point is the same: start
 *  after the page has drawn, not during. */
const requestIdle = (fn: () => void): number =>
  typeof window.requestIdleCallback === "function"
    ? window.requestIdleCallback(fn, { timeout: 1200 })
    : window.setTimeout(fn, 200);

const cancelIdle = (id: number): void => {
  if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(id);
  else window.clearTimeout(id);
};

/**
 * The world the audit is read inside — ThreeUI's Kage temple, ported.
 *
 * This replaces the constellation that stood here before. The brief was to
 * use Kage's landing page as the reference, and Kage's own scene is the part
 * of that bundle which is genuinely portable: its comment says as much —
 * "everything on this page is generated at runtime: no photographs, no
 * video, no external assets beyond three.js and two subset fonts". The
 * fourteen .webp files the bundle ships are page decoration (three card
 * stills and nine DOM foreground cut-outs), and the scene regenerates
 * equivalent cut-outs procedurally in buildForeground().
 *
 * The mount is the constellation's, unchanged, because the reasons for it
 * have not changed: three is imported dynamically so it never enters the
 * main bundle, the import is deferred to first idle so parsing it does not
 * land in the LCP window, and the loop parks itself whenever the page is
 * hidden or the canvas is off screen.
 *
 * Cost is the one thing to keep an eye on here. Kage is a far heavier scene
 * than the constellation was — procedural canvas textures, a bloom chain,
 * shadows, rain, leaves, wisps — so the renderer keeps the source's own
 * resolution governor (it trades pixels for frame rate on unknown hardware)
 * and its LOW path, which is what a coarse pointer gets: no shadows, no
 * post-processing, no rain, no wisps, and roughly a third of the blades.
 */
export function KageWorld() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { animate } = useMotionPrefs();

  useEffect(() => {
    if (!animate) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    // A software rasteriser would make this the most expensive thing on the
    // page for the least benefit, so the world is a progressive enhancement:
    // no context, no world, and the page is complete without it.
    const probe = document.createElement("canvas");
    if (!probe.getContext("webgl2") && !probe.getContext("webgl")) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    // Deferred, but not gated on scrolling.
    //
    // This used to wait until the reader had scrolled half a viewport down,
    // which was correct when the solar prologue and the audit were one page:
    // the prologue owned the first several screens, so there was nothing of
    // this world on show and building it early would have put three, twenty
    // procedural canvases and a bloom chain in the load path to render pixels
    // nobody could see. Splitting the prologue onto its own route invalidated
    // that: a reader arriving at /proof is at scroll 0 looking straight at the
    // world, and the old gate held it back until they scrolled — so the
    // background appeared to arrive late, only once the page had moved.
    //
    // What still matters is staying out of the load path, and that is what
    // the idle callback buys. The build itself is already spread over frames
    // by the renderer's job queue, so starting at first idle costs nothing
    // measurable and the world is up within a frame or two of the page
    // settling. The timeout is the floor: on a busy main thread idle may
    // never come, and waiting forever is the same bug in a different costume.
    //
    // Scroll stays as a second trigger, now unconditional — any scroll means
    // the reader is moving and the world should already be there.
    let armed = false;
    let idle = 0;
    const build = () => {
      if (armed || disposed) return;
      armed = true;
      window.removeEventListener("scroll", build);
      if (idle) cancelIdle(idle);

      void import("three").then((THREE) => {
        if (disposed) return;

        let world: KageWorldApi;
        try {
          world = createKageWorld({
            THREE,
            canvas,
            reduce: false,
            coarse: window.matchMedia("(hover: none)").matches,
          });
        } catch (err) {
          // The scene builds a lot of canvases up front. If any of that
          // fails the page is still complete without it, so swallow it
          // rather than taking the render tree down.
          console.error("[kage] world failed to build", err);
          return;
        }

        const vpH = () => document.documentElement.clientHeight || window.innerHeight;
        const vpW = () => document.documentElement.clientWidth || window.innerWidth;

        /** Scroll as a fraction of the whole document, which is what the
         *  renderer's spline is parameterised on. */
        const onScroll = () => {
          const max = Math.max(1, document.documentElement.scrollHeight - vpH());
          world.setProgress((window.scrollY || window.pageYOffset || 0) / max);
        };
        const onPointer = (e: PointerEvent) => {
          world.setPointer((e.clientX / vpW()) * 2 - 1, -((e.clientY / vpH()) * 2 - 1));
        };
        const onResize = () => { world.resize(); onScroll(); };

        onScroll();
        world.start();

        // Off-screen means genuinely idle: the whole world lives behind the
        // document, so once the reader is past it there is nothing to draw.
        const io = new IntersectionObserver(
          ([entry]) => { if (entry?.isIntersecting ?? true) world.start(); else world.stop(); },
          { threshold: 0 },
        );
        io.observe(canvas);
        const onVisibility = () => { if (document.hidden) world.stop(); else world.start(); };

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize);
        window.addEventListener("pointermove", onPointer, { passive: true });
        document.addEventListener("visibilitychange", onVisibility);

        cleanup = () => {
          io.disconnect();
          window.removeEventListener("scroll", onScroll);
          window.removeEventListener("resize", onResize);
          window.removeEventListener("pointermove", onPointer);
          document.removeEventListener("visibilitychange", onVisibility);
          world.dispose();
        };
      });
    };

    window.addEventListener("scroll", build, { passive: true });
    idle = requestIdle(build);

    return () => {
      disposed = true;
      window.removeEventListener("scroll", build);
      if (idle) cancelIdle(idle);
      cleanup?.();
    };
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      // z-0, not a negative index: `body` paints an opaque colour, and that
      // background propagates to the root canvas, which sits behind anything
      // with a negative z-index — the world would be invisible. At z-0 it
      // paints above the page colour, and the sections (also positioned, and
      // later in the DOM) paint above it in turn.
      //
      // The paper theme is a lit room; a night temple in it would read as a
      // mistake, so the world is faded out there rather than conditionally
      // mounted (which would drop and rebuild the whole scene on a toggle).
      className="pointer-events-none fixed inset-0 z-0 h-full w-full opacity-100 transition-opacity duration-500 [html[data-theme=paper]_&]:opacity-0"
    />
  );
}
