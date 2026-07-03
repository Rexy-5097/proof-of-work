"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionPrefs } from "@/components/providers/MotionPrefsProvider";
import { TOPOLOGY_NODES, TOPOLOGY_EDGES, TOPOLOGY_HUB_INDEX, TOPOLOGY_VIEWBOX } from "@/data/repoTopology";

/**
 * The animated take on the same repository graph HeroBackdrop renders
 * statically. Deliberately NOT a generic particle soup: 17 nodes, one
 * per repo, connected by real relationships — drift is procedural
 * (each node orbits a tiny fixed radius on its own phase, seeded by
 * index) rather than random, and the mouse nudges nearby nodes within a
 * small radius rather than driving the whole field. Canvas 2D — no
 * WebGL, no particle-physics library; the node count (17) and area
 * (one hero, not the full page) keep this cheap enough that reaching
 * for a GPU shader wouldn't earn its bundle cost.
 *
 * Progressive enhancement: HeroBackdrop's static SVG is the real,
 * server-rendered, no-JS content. This canvas only mounts and takes
 * over once motion is enabled and the hero is in view; it never
 * changes what's *there*, only how it moves.
 */
export function HeroParticleNetwork() {
  const { animate } = useMotionPrefs();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!animate) return;
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setActive(!!entry?.isIntersecting), {
      threshold: 0.1,
    });
    io.observe(el);
    return () => io.disconnect();
  }, [animate]);

  useEffect(() => {
    if (!animate || !active) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    const resize = () => {
      const rect = container.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const sx = () => width / TOPOLOGY_VIEWBOX.w;
    const sy = () => height / TOPOLOGY_VIEWBOX.h;

    const mouse = { x: -9999, y: -9999 };
    const onMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    container.addEventListener("pointermove", onMove, { passive: true });
    container.addEventListener("pointerleave", onLeave);

    const lineColor = getComputedStyle(document.documentElement).getPropertyValue("--line-strong").trim();
    const dotColor = getComputedStyle(document.documentElement).getPropertyValue("--ink-lo").trim();

    let raf = 0;
    const start = performance.now();
    const draw = (now: number) => {
      const t = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);

      // Each node orbits a tiny fixed radius at its own phase — a
      // deterministic Lissajous-like drift, not randomness.
      const positions = TOPOLOGY_NODES.map(([bx, by], i) => {
        const phase = i * 0.9;
        let x = bx + Math.sin(t * 0.15 + phase) * 6;
        let y = by + Math.cos(t * 0.12 + phase * 1.3) * 6;
        const px = x * sx();
        const py = y * sy();
        const dx = px - mouse.x;
        const dy = py - mouse.y;
        const dist = Math.hypot(dx, dy);
        const radius = 90;
        if (dist < radius && dist > 0.01) {
          const push = ((radius - dist) / radius) * 10;
          x += (dx / dist) * push * (1 / sx());
          y += (dy / dist) * push * (1 / sy());
        }
        return [x * sx(), y * sy()] as const;
      });

      ctx.strokeStyle = lineColor || "rgba(148,163,184,0.26)";
      ctx.lineWidth = 0.6;
      for (const [a, b] of TOPOLOGY_EDGES) {
        const pa = positions[a];
        const pb = positions[b];
        if (!pa || !pb) continue;
        ctx.beginPath();
        ctx.moveTo(pa[0], pa[1]);
        ctx.lineTo(pb[0], pb[1]);
        ctx.stroke();
      }

      ctx.fillStyle = dotColor || "rgba(107,131,160,1)";
      positions.forEach(([x, y], i) => {
        ctx.beginPath();
        ctx.arc(x, y, i === TOPOLOGY_HUB_INDEX ? 2.5 : 1.5, 0, Math.PI * 2);
        ctx.fill();
      });

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    const staticSvg = document.getElementById("hero-topology-static");
    staticSvg?.style.setProperty("display", "none");

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
      staticSvg?.style.removeProperty("display");
    };
  }, [animate, active]);

  if (!animate) return null;

  return (
    <div ref={containerRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full opacity-[0.5]" />
    </div>
  );
}
