"use client";

import { useEffect, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  OrthographicCamera,
  Points,
  Scene,
  ShaderMaterial,
  Vector2,
  WebGLRenderer,
} from "three";
import { SIMPLEX_3D, CURL_NOISE } from "@/lib/webgl/noise";

/**
 * Curl-noise dissolution of the hero headline.
 *
 * The real DOM `#hero-headline` is rendered server-side (LCP + a11y +
 * no-JS fallback). Here we sample its exact rendered glyphs into GPU
 * particles: an offscreen 2D canvas re-lays the same text at the same
 * computed font, we read its pixels, and every filled pixel becomes a
 * particle home. On mount we fade the DOM text to transparent (kept in
 * the a11y tree) so only the particle version shows.
 *
 * When the cursor passes near, particles within a radius are advected by
 * curl noise (lib/webgl/noise.ts) — the letters locally dissolve and
 * drift — and spring back perfectly to their glyph homes as the cursor
 * moves away, because displacement is scaled purely by cursor proximity.
 * The letters never explode or leave; the text always reconstructs.
 */

const LINES_FALLBACK = [
  "I build software that",
  "stays correct when",
  "things fail — and I",
  "publish the evidence.",
];
const HEADLINE_TEXT =
  "I build software that stays correct when things fail — and I publish the evidence.";
const MAX_PARTICLES = 9000;

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export default function HeroDissolveScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const headline = document.getElementById("hero-headline");
    if (!canvas || !headline) return;

    let renderer: WebGLRenderer | null = null;
    let raf = 0;
    let disposed = false;
    const cleanups: Array<() => void> = [];

    const build = async () => {
      await document.fonts.ready;
      if (disposed) return;

      const cs = getComputedStyle(headline);
      const boxW = headline.offsetWidth;
      const boxH = headline.offsetHeight;
      if (boxW < 2 || boxH < 2) return;

      // position the canvas exactly over the headline within the shared
      // relative Container (same offsetParent)
      canvas.style.left = `${headline.offsetLeft}px`;
      canvas.style.top = `${headline.offsetTop}px`;
      canvas.style.width = `${boxW}px`;
      canvas.style.height = `${boxH}px`;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const sample = document.createElement("canvas");
      sample.width = Math.ceil(boxW * dpr);
      sample.height = Math.ceil(boxH * dpr);
      const sctx = sample.getContext("2d");
      if (!sctx) return;

      const fontSize = parseFloat(cs.fontSize);
      const lineHeight = parseFloat(cs.lineHeight) || fontSize * 1.02;
      sctx.scale(dpr, dpr);
      sctx.font = `${cs.fontWeight} ${fontSize}px ${cs.fontFamily}`;
      sctx.textBaseline = "top";
      sctx.fillStyle = "#fff";
      try {
        // match the display face's slight negative tracking when supported
        (sctx as CanvasRenderingContext2D & { letterSpacing?: string }).letterSpacing =
          cs.letterSpacing && cs.letterSpacing !== "normal" ? cs.letterSpacing : "0px";
      } catch {
        /* letterSpacing unsupported — negligible drift */
      }

      const lines = wrapText(sctx, HEADLINE_TEXT, boxW) ;
      const useLines = lines.length >= 3 ? lines : LINES_FALLBACK;
      // vertical centering within the line-box, matching CSS line-height
      const topPad = (lineHeight - fontSize) * 0.5;
      useLines.forEach((ln, i) => sctx.fillText(ln, 0, topPad + i * lineHeight));

      const img = sctx.getImageData(0, 0, sample.width, sample.height).data;
      const homes: number[] = [];
      // step chosen to land near MAX_PARTICLES for this glyph coverage
      let step = 3;
      const estimate = () => {
        let n = 0;
        for (let y = 0; y < sample.height; y += step) {
          for (let x = 0; x < sample.width; x += step) {
            if (img[(y * sample.width + x) * 4 + 3]! > 130) n++;
          }
        }
        return n;
      };
      while (estimate() > MAX_PARTICLES && step < 8) step++;
      for (let y = 0; y < sample.height; y += step) {
        for (let x = 0; x < sample.width; x += step) {
          if (img[(y * sample.width + x) * 4 + 3]! > 130) {
            homes.push(x / dpr, y / dpr); // back to CSS px within the box
          }
        }
      }
      const count = homes.length / 2;
      if (count < 10) return;

      // ---- three setup (pixel-space ortho) ----
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" });
      renderer.setPixelRatio(dpr);
      renderer.setSize(boxW, boxH, false);

      const scene = new Scene();
      const camera = new OrthographicCamera(0, boxW, 0, boxH, -10, 10);
      camera.position.z = 5;

      const pos = new Float32Array(count * 3);
      const seed = new Float32Array(count);
      for (let i = 0; i < count; i++) {
        pos[i * 3] = homes[i * 2]!;
        pos[i * 3 + 1] = homes[i * 2 + 1]!;
        pos[i * 3 + 2] = 0;
        seed[i] = Math.random();
      }
      const geo = new BufferGeometry();
      geo.setAttribute("position", new BufferAttribute(pos, 3));
      geo.setAttribute("aSeed", new BufferAttribute(seed, 1));

      const inkHi = new Color(getComputedStyle(document.documentElement).getPropertyValue("--ink-hi").trim() || "#e6edf6");
      const accent = new Color(getComputedStyle(document.documentElement).getPropertyValue("--data").trim() || "#7fafe0");

      const uniforms = {
        uTime: { value: 0 },
        uMouse: { value: new Vector2(-9999, -9999) },
        uHover: { value: 0 },
        uColor: { value: inkHi },
        uAccent: { value: accent },
        uSize: { value: 2.05 * dpr },
        uRadius: { value: Math.max(70, boxW * 0.09) },
      };

      const mat = new ShaderMaterial({
        transparent: true,
        depthWrite: false,
        uniforms,
        vertexShader: /* glsl */ `
          attribute float aSeed;
          uniform float uTime;
          uniform vec2 uMouse;
          uniform float uHover;
          uniform float uSize;
          uniform float uRadius;
          varying float vDisp;
          ${SIMPLEX_3D}
          ${CURL_NOISE}
          void main(){
            vec3 home = position;
            float d = distance(home.xy, uMouse);
            float influence = smoothstep(uRadius, 0.0, d) * uHover;
            vec3 c = curlNoise(home * 0.012 + vec3(0.0, 0.0, uTime * 0.25) + aSeed * 3.0);
            vec2 disp = c.xy * influence * (uRadius * 0.55);
            vec3 p = vec3(home.xy + disp, 0.0);
            vDisp = influence;
            gl_PointSize = uSize * (1.0 + influence * 0.6);
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
          }
        `,
        fragmentShader: /* glsl */ `
          precision mediump float;
          uniform vec3 uColor;
          uniform vec3 uAccent;
          varying float vDisp;
          void main(){
            vec2 uv = gl_PointCoord - 0.5;
            float dd = dot(uv, uv);
            if (dd > 0.25) discard;
            float soft = smoothstep(0.25, 0.02, dd);
            vec3 col = mix(uColor, uAccent, vDisp * 0.7);
            // fade a touch while dissolving so letters "thin out" then reform
            float a = soft * (1.0 - vDisp * 0.35);
            gl_FragColor = vec4(col, a);
          }
        `,
      });

      const points = new Points(geo, mat);
      points.frustumCulled = false;
      scene.add(points);

      // hand the visual over from DOM text to particles (a11y text stays)
      const prevColor = headline.style.color;
      headline.style.color = "transparent";
      cleanups.push(() => {
        headline.style.color = prevColor;
      });

      // ---- interaction ----
      const mouse = new Vector2(-9999, -9999);
      let hoverTarget = 0;
      const onMove = (e: PointerEvent) => {
        const r = canvas.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        const near = x > -80 && x < boxW + 80 && y > -80 && y < boxH + 80;
        if (near) {
          mouse.set(x, y);
          hoverTarget = 1;
        } else {
          hoverTarget = 0;
        }
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      cleanups.push(() => window.removeEventListener("pointermove", onMove));

      const themeObs = new MutationObserver(() => {
        const rs = getComputedStyle(document.documentElement);
        uniforms.uColor.value.set(rs.getPropertyValue("--ink-hi").trim() || "#e6edf6");
        uniforms.uAccent.value.set(rs.getPropertyValue("--data").trim() || "#7fafe0");
      });
      themeObs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
      cleanups.push(() => themeObs.disconnect());

      let running = document.visibilityState === "visible";
      const onVis = () => {
        running = document.visibilityState === "visible";
        if (running) raf = requestAnimationFrame(loop);
      };
      document.addEventListener("visibilitychange", onVis);
      cleanups.push(() => document.removeEventListener("visibilitychange", onVis));

      const start = performance.now();
      function loop(now: number) {
        if (!running || disposed || !renderer) return;
        uniforms.uTime.value = (now - start) / 1000;
        uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * 0.09;
        uniforms.uMouse.value.copy(mouse);
        renderer.render(scene, camera);
        raf = requestAnimationFrame(loop);
      }
      raf = requestAnimationFrame(loop);

      cleanups.push(() => {
        geo.dispose();
        mat.dispose();
        renderer?.dispose();
      });
    };

    void build();

    // rebuild on resize (headline reflows) — debounced
    let resizeT = 0;
    const onResize = () => {
      window.clearTimeout(resizeT);
      resizeT = window.setTimeout(() => {
        cancelAnimationFrame(raf);
        cleanups.splice(0).forEach((fn) => fn());
        renderer = null;
        void build();
      }, 250);
    };
    window.addEventListener("resize", onResize);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.clearTimeout(resizeT);
      window.removeEventListener("resize", onResize);
      cleanups.splice(0).forEach((fn) => fn());
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute z-[5]"
    />
  );
}
