"use client";

import { useEffect, useRef } from "react";
import {
  Color,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";
import { BLACK_HOLE_FRAGMENT, FULLSCREEN_VERTEX } from "./blackHoleShader";

/**
 * One fullscreen quad running the black-hole shader. Everything is done
 * in the fragment stage, so cost scales with pixels rather than geometry
 * — which is why the device pixel ratio is capped and lowered further on
 * small screens.
 *
 * `progressRef` is a ref, not a prop: scroll updates it every frame and
 * re-rendering React 60 times a second to move one uniform would be
 * pure waste.
 */
export default function BlackHoleScene({
  progressRef,
}: {
  progressRef: React.RefObject<number>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, antialias: false, powerPreference: "high-performance" });
    } catch {
      return;
    }

    const small = window.matchMedia("(max-width: 767px)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
    renderer.setPixelRatio(dpr);

    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const css = getComputedStyle(document.documentElement);
    const read = (name: string, fallback: string) =>
      new Color(css.getPropertyValue(name).trim() || fallback);

    const uniforms = {
      uResolution: { value: new Vector2(1, 1) },
      uTime: { value: 0 },
      uProgress: { value: 0 },
      // disk runs warm→cool through the site's own accent tokens
      uDiskWarm: { value: read("--caution", "#d9a245") },
      uDiskCool: { value: read("--data", "#7fafe0") },
      uRing: { value: read("--seal", "#3dd698") },
    };

    const material = new ShaderMaterial({
      vertexShader: FULLSCREEN_VERTEX,
      fragmentShader: BLACK_HOLE_FRAGMENT,
      uniforms,
      depthWrite: false,
      depthTest: false,
    });

    const quad = new Mesh(new PlaneGeometry(2, 2), material);
    quad.frustumCulled = false;
    scene.add(quad);

    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      uniforms.uResolution.value.set(w * dpr, h * dpr);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    let running = document.visibilityState === "visible";
    const start = performance.now();
    let smoothed = 0;

    const onVis = () => {
      running = document.visibilityState === "visible";
      if (running) raf = requestAnimationFrame(loop);
    };
    document.addEventListener("visibilitychange", onVis);

    function loop(now: number) {
      if (!running) return;
      uniforms.uTime.value = (now - start) / 1000;
      // ease toward the scroll target so flicks read as momentum, not jumps
      const target = progressRef.current ?? 0;
      smoothed += (target - smoothed) * 0.08;
      uniforms.uProgress.value = smoothed;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      quad.geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [progressRef]);

  return <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />;
}
