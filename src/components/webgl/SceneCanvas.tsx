"use client";

import { useEffect, useRef } from "react";
import {
  BufferAttribute,
  BufferGeometry,
  Color,
  Points,
  PerspectiveCamera,
  Plane,
  Raycaster,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
  AdditiveBlending,
  NormalBlending,
} from "three";
import { SIMPLEX_3D, CURL_NOISE } from "@/lib/webgl/noise";
import { readWebglTheme } from "@/lib/webgl/themeColors";

/**
 * The ambient GPU particle field behind the whole site.
 *
 * All motion is done on the GPU in the vertex shader: each particle
 * blends from a scattered start toward its home in a hexagonal lattice
 * (the opening animation), then curl-noise flow (see lib/webgl/noise.ts)
 * advects it into a slow, divergence-free drift. The camera does subtle
 * scroll + pointer parallax on the CPU. Click bursts are a second Points
 * system driven by small uniform arrays.
 *
 * This component only ever mounts client-side, behind a reduced-motion /
 * WebGL-capability gate (see webgl/index.tsx) — the static SVG topology
 * in HeroBackdrop remains the no-JS / reduced-motion truth.
 */

const FIELD_COUNT = 5200;
const HEX_SPACING = 2.05;
const MAX_BURSTS = 16;
const BURST_PARTICLES = 70;
const BURST_LIFE = 1.0;

function buildHexField() {
  // Pointy-top triangular packing → reads as a hexagonal distribution.
  const positions: number[] = [];
  const rowH = HEX_SPACING * Math.sqrt(3) * 0.5;
  const cols = 96;
  const rows = 64;
  for (let r = -rows / 2; r < rows / 2; r++) {
    for (let c = -cols / 2; c < cols / 2; c++) {
      const x = HEX_SPACING * (c + (r & 1 ? 0.5 : 0));
      const y = rowH * r;
      // Trim to a soft elliptical footprint so edges fade, not hard-cut.
      if ((x * x) / (100 * 100) + (y * y) / (62 * 62) > 1) continue;
      positions.push(x, y, 0);
    }
  }
  return positions;
}

export default function SceneCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: WebGLRenderer;
    try {
      renderer = new WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "low-power" });
    } catch {
      return; // WebGL unavailable — the static SVG fallback stays.
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);

    const scene = new Scene();
    const camera = new PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.set(0, 0, 92);

    // ---- theme ----
    let theme = readWebglTheme();

    // ---- field geometry ----
    const homeArr = buildHexField();
    const count = Math.min(FIELD_COUNT, homeArr.length / 3);
    const home = new Float32Array(count * 3);
    const scatter = new Float32Array(count * 3);
    const seed = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      home[i * 3] = homeArr[i * 3]!;
      home[i * 3 + 1] = homeArr[i * 3 + 1]!;
      home[i * 3 + 2] = homeArr[i * 3 + 2]!;
      // Scattered start: a wide shell the particles converge inward from.
      const a = Math.random() * Math.PI * 2;
      const rad = 120 + Math.random() * 90;
      scatter[i * 3] = Math.cos(a) * rad;
      scatter[i * 3 + 1] = Math.sin(a) * rad * 0.6;
      scatter[i * 3 + 2] = (Math.random() - 0.5) * 120;
      seed[i] = Math.random();
    }

    const geo = new BufferGeometry();
    geo.setAttribute("position", new BufferAttribute(home, 3));
    geo.setAttribute("aScatter", new BufferAttribute(scatter, 3));
    geo.setAttribute("aSeed", new BufferAttribute(seed, 1));

    const fieldUniforms = {
      uTime: { value: 0 },
      uOpening: { value: 0 },
      uFlow: { value: 0 },
      uMouse: { value: new Vector3(9999, 9999, 0) },
      uMouseStrength: { value: 0 },
      uColor: { value: theme.particle.clone() },
      uAccent: { value: theme.accent.clone() },
      uSize: { value: 2.1 * dpr },
      uOpacity: { value: theme.isLight ? 0.38 : 0.6 },
    };

    const fieldMat = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: theme.isLight ? NormalBlending : AdditiveBlending,
      uniforms: fieldUniforms,
      vertexShader: /* glsl */ `
        attribute vec3 aScatter;
        attribute float aSeed;
        uniform float uTime;
        uniform float uOpening;
        uniform float uFlow;
        uniform vec3 uMouse;
        uniform float uMouseStrength;
        uniform float uSize;
        varying float vMix;
        varying float vAlpha;
        ${SIMPLEX_3D}
        ${CURL_NOISE}
        void main(){
          float o = smoothstep(0.0, 1.0, uOpening);
          vec3 base = mix(aScatter, position, o);

          // curl-noise drift, enabled only after the lattice assembles.
          // Amplitude kept low so the hexagonal structure stays legible —
          // the field breathes and swirls in place rather than dissolving
          // into uniform noise.
          vec3 flow = curlNoise(position * 0.02 + vec3(0.0, 0.0, uTime * 0.04) + aSeed);
          base += flow * uFlow * (1.15 + aSeed * 0.7);
          base.z += sin(uTime * 0.35 + aSeed * 6.28) * uFlow * 0.9;

          // soft mouse repulsion in the particle plane
          float md = distance(base.xy, uMouse.xy);
          float push = smoothstep(16.0, 0.0, md) * uMouseStrength;
          base.xy += normalize(base.xy - uMouse.xy + 0.001) * push * 7.0;

          vMix = clamp(length(flow.xy) * uFlow, 0.0, 1.0);
          vAlpha = o;

          vec4 mv = modelViewMatrix * vec4(base, 1.0);
          gl_PointSize = uSize * (300.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        precision mediump float;
        uniform vec3 uColor;
        uniform vec3 uAccent;
        uniform float uOpacity;
        varying float vMix;
        varying float vAlpha;
        void main(){
          vec2 uv = gl_PointCoord - 0.5;
          float d = dot(uv, uv);
          if (d > 0.25) discard;
          float soft = smoothstep(0.25, 0.02, d);
          vec3 col = mix(uColor, uAccent, vMix * 0.55);
          gl_FragColor = vec4(col, soft * uOpacity * vAlpha);
        }
      `,
    });

    const field = new Points(geo, fieldMat);
    field.frustumCulled = false;
    scene.add(field);

    // ---- burst system ----
    const bTotal = MAX_BURSTS * BURST_PARTICLES;
    const bIndex = new Float32Array(bTotal); // which burst slot
    const bVel = new Float32Array(bTotal * 3);
    const bSeed = new Float32Array(bTotal);
    const bPos = new Float32Array(bTotal * 3); // unused home, kept at 0
    for (let b = 0; b < MAX_BURSTS; b++) {
      for (let p = 0; p < BURST_PARTICLES; p++) {
        const i = b * BURST_PARTICLES + p;
        bIndex[i] = b;
        // random direction on a slightly flattened sphere
        const th = Math.random() * Math.PI * 2;
        const ph = Math.acos(2 * Math.random() - 1);
        const sp = 10 + Math.random() * 22;
        bVel[i * 3] = Math.sin(ph) * Math.cos(th) * sp;
        bVel[i * 3 + 1] = Math.sin(ph) * Math.sin(th) * sp;
        bVel[i * 3 + 2] = Math.cos(ph) * sp * 0.5;
        bSeed[i] = Math.random();
      }
    }
    const burstGeo = new BufferGeometry();
    burstGeo.setAttribute("position", new BufferAttribute(bPos, 3));
    burstGeo.setAttribute("aVel", new BufferAttribute(bVel, 3));
    burstGeo.setAttribute("aIndex", new BufferAttribute(bIndex, 1));
    burstGeo.setAttribute("aSeed", new BufferAttribute(bSeed, 1));

    const burstTimes = new Float32Array(MAX_BURSTS).fill(-100);

    const burstUniforms = {
      uTime: { value: 0 },
      uOrigins: { value: Array.from({ length: MAX_BURSTS }, () => new Vector3()) },
      uTimes: { value: Array.from(burstTimes) },
      uSeal: { value: theme.seal.clone() },
      uAccent: { value: theme.accent.clone() },
      uSize: { value: 4.6 * dpr },
      uLife: { value: BURST_LIFE },
    };

    const burstMat = new ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: AdditiveBlending,
      uniforms: burstUniforms,
      vertexShader: /* glsl */ `
        attribute vec3 aVel;
        attribute float aIndex;
        attribute float aSeed;
        uniform float uTime;
        uniform vec3 uOrigins[${MAX_BURSTS}];
        uniform float uTimes[${MAX_BURSTS}];
        uniform float uSize;
        uniform float uLife;
        varying float vAge;
        ${SIMPLEX_3D}
        ${CURL_NOISE}
        void main(){
          int idx = int(aIndex + 0.5);
          float t0 = uTimes[idx];
          float age = uTime - t0;
          vAge = age / uLife;
          if (age < 0.0 || age > uLife) {
            gl_Position = vec4(2.0, 2.0, 2.0, 1.0); // offscreen
            gl_PointSize = 0.0;
            return;
          }
          vec3 origin = uOrigins[idx];
          float decel = 1.0 - exp(-age * 3.0);
          vec3 pos = origin + aVel * decel * (uLife * 0.5);
          pos += curlNoise(pos * 0.05 + aSeed) * age * 3.0;
          float fade = 1.0 - vAge;
          vec4 mv = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = uSize * fade * (300.0 / -mv.z);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        precision mediump float;
        uniform vec3 uSeal;
        uniform vec3 uAccent;
        varying float vAge;
        void main(){
          vec2 uv = gl_PointCoord - 0.5;
          float d = dot(uv, uv);
          if (d > 0.25) discard;
          float soft = smoothstep(0.25, 0.0, d);
          vec3 col = mix(uSeal, uAccent, vAge);
          gl_FragColor = vec4(col, soft * (1.0 - vAge) * 0.9);
        }
      `,
    });
    const bursts = new Points(burstGeo, burstMat);
    bursts.frustumCulled = false;
    scene.add(bursts);

    // ---- interaction state ----
    const mouseNdc = new Vector2(9999, 9999);
    const mouseWorld = new Vector3(9999, 9999, 0);
    const raycaster = new Raycaster();
    const plane = new Plane(new Vector3(0, 0, 1), 0);
    const pointerTarget = new Vector2(0, 0);
    const pointerEased = new Vector2(0, 0);
    let mouseStrengthTarget = 0;
    let scrollY = window.scrollY;
    let burstCursor = 0;

    const projectMouse = () => {
      if (mouseNdc.x > 9000) {
        mouseWorld.set(9999, 9999, 0);
        return;
      }
      raycaster.setFromCamera(mouseNdc, camera);
      raycaster.ray.intersectPlane(plane, mouseWorld);
    };

    const onPointerMove = (e: PointerEvent) => {
      mouseNdc.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNdc.y = -(e.clientY / window.innerHeight) * 2 + 1;
      pointerTarget.set(mouseNdc.x, mouseNdc.y);
      mouseStrengthTarget = 1;
    };
    const onPointerLeave = () => {
      mouseNdc.set(9999, 9999);
      mouseStrengthTarget = 0;
    };
    const onClick = (e: MouseEvent) => {
      mouseNdc.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseNdc.y = -(e.clientY / window.innerHeight) * 2 + 1;
      projectMouse();
      const slot = burstCursor % MAX_BURSTS;
      burstCursor++;
      burstUniforms.uOrigins.value[slot]!.set(mouseWorld.x, mouseWorld.y, 0);
      burstTimes[slot] = clock;
      burstUniforms.uTimes.value[slot] = clock;
    };
    const onScroll = () => {
      scrollY = window.scrollY;
    };

    // The opening animation must play *after* the opaque boot curtain
    // lifts, not behind it. `pow:ready` fires from BootSequence when the
    // curtain is gone (or immediately for a returning visitor). A 4s
    // fallback guarantees the field still reveals if the event is missed.
    let revealStart: number | null = null;
    const onReady = () => {
      if (revealStart === null) revealStart = performance.now();
    };
    window.addEventListener("pow:ready", onReady);
    const readyFallback = window.setTimeout(onReady, 4000);

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);
    window.addEventListener("click", onClick);
    window.addEventListener("scroll", onScroll, { passive: true });

    const onThemeChange = () => {
      theme = readWebglTheme();
      fieldUniforms.uColor.value.copy(theme.particle);
      fieldUniforms.uAccent.value.copy(theme.accent);
      fieldUniforms.uOpacity.value = theme.isLight ? 0.38 : 0.6;
      fieldMat.blending = theme.isLight ? NormalBlending : AdditiveBlending;
      fieldMat.needsUpdate = true;
      burstUniforms.uSeal.value.copy(theme.seal);
      burstUniforms.uAccent.value.copy(theme.accent);
    };
    const themeObserver = new MutationObserver(onThemeChange);
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

    // ---- resize ----
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    // ---- loop ----
    let raf = 0;
    let clock = 0;
    let last = performance.now();
    const start = performance.now();
    let running = document.visibilityState === "visible";
    const onVis = () => {
      running = document.visibilityState === "visible";
      if (running) {
        last = performance.now();
        raf = requestAnimationFrame(loop);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    function loop(now: number) {
      if (!running) return;
      last = now;
      clock = (now - start) / 1000;

      // opening ramps — measured from the reveal signal, not mount, so the
      // hexagonal assembly is seen once the boot curtain lifts.
      const openT = revealStart === null ? 0 : (now - revealStart) / 1000;
      fieldUniforms.uOpening.value = Math.min(openT / 1.3, 1);
      fieldUniforms.uFlow.value = Math.max(0, Math.min((openT - 1.2) / 1.4, 1));
      fieldUniforms.uTime.value = clock;
      burstUniforms.uTime.value = clock;

      // mouse
      projectMouse();
      fieldUniforms.uMouse.value.copy(mouseWorld);
      const ms = fieldUniforms.uMouseStrength.value;
      fieldUniforms.uMouseStrength.value = ms + (mouseStrengthTarget - ms) * 0.08;

      // camera parallax (pointer tilt + scroll drift), eased
      pointerEased.lerp(pointerTarget, 0.04);
      const scrollNorm = scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
      camera.position.x = pointerEased.x * 4;
      camera.position.y = pointerEased.y * 3 - scrollNorm * 10;
      camera.position.z = 92 - scrollNorm * 14;
      camera.rotation.z = pointerEased.x * 0.01;
      camera.lookAt(0, camera.position.y * 0.4, 0);

      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    }
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(readyFallback);
      window.removeEventListener("pow:ready", onReady);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
      window.removeEventListener("click", onClick);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
      themeObserver.disconnect();
      geo.dispose();
      burstGeo.dispose();
      fieldMat.dispose();
      burstMat.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 h-full w-full"
    />
  );
}
