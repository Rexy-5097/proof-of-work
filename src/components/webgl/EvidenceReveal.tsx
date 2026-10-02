"use client";

import { useEffect, useRef, useState } from "react";
import { useMotionPrefs } from "@/components/providers/MotionPrefsProvider";
import { drawEvidencePlate, readPlateTokens } from "@/lib/evidencePlate";
import {
  advectFrag,
  compositeFrag,
  curlFrag,
  divergenceFrag,
  gradientFrag,
  maskFrag,
  pressureFrag,
  quadVert,
  splatFrag,
} from "./fluidShaders";

/**
 * Scratch the surface of the claim and the evidence is underneath.
 *
 * A real-time fluid simulation whose dye is used as a mask, so the pointer
 * wipes a living, eddying hole through one layer into another. It opens the
 * hero sentence ("…and I publish the evidence") onto the evidence: over the
 * portrait, an evidence scan of the face; elsewhere, an audit log typeset
 * from the claim
 * registry (lib/evidencePlate.ts). The headline makes the claim; the
 * pointer audits it.
 *
 * What changed in the port, and why:
 *  · One quad, one orthographic camera, every pass. The source rendered
 *    the composite through a perspective camera sized to the DOM box; a
 *    full-bleed layer needs none of that.
 *  · Splat size is in CSS pixels, not a fraction of the box. The source's
 *    box was a 440px portrait; this one is the whole viewport, and a
 *    fraction-of-box radius grew the brush to 170px.
 *  · The composite gains a rim — the lens edge drawn in --data — and the
 *    plate drifts a few pixels against the pointer, so the revealed layer
 *    reads as *beneath* the page rather than printed on it.
 *  · Same lifecycle as KageWorld: three is imported on first intent (the
 *    pointer entering the hero), never in the main bundle; the loop runs
 *    only while the pointer is in the hero or the dye is still settling,
 *    and parks itself otherwise — an idle hero costs zero frames.
 *
 * Fine pointers with motion allowed only. Touch would fight the scroll for
 * the same gesture, and under reduced motion the page is already complete:
 * the evidence the plate shows is one hover away on every ◆.
 */

/** Splat radius in CSS px. */
const BRUSH_PX = 84;
/** The solver runs at a quarter of CSS resolution. The dye is a soft mask
 *  under a noise-eroded edge, so linear upsampling is invisible; halving
 *  the side length quarters every pass. */
const SIM_SCALE = 0.25;
/** Jacobi iterations. Each one is a full render call through three; past
 *  ~8 the remaining divergence is below anything the mask can show. */
const PRESSURE_ITERS = 8;
/** Seconds for the dye to fall to 1% once the pointer leaves. */
const SHRINK_S = 1.5;

/** True on a hovering, precise pointer — the only input the lens is for. */
function useFinePointer(): boolean {
  const [fine, setFine] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (hover: hover)");
    const update = () => setFine(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return fine;
}

/**
 * The "move to reveal" hint. Rendered only
 * where the lens actually runs — a hint for an effect that is not there
 * would be the one unverifiable claim on the page.
 */
export function RevealHint() {
  const { animate } = useMotionPrefs();
  const fine = useFinePointer();
  if (!animate || !fine) return null;
  return (
    <p className="mono-label flex items-center gap-2">
      <span aria-hidden="true" className="text-ink-md">
        ◇
      </span>
      MOVE ACROSS THE PAGE — THE EVIDENCE IS UNDERNEATH
    </p>
  );
}

export function EvidenceReveal() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { animate } = useMotionPrefs();
  const fine = useFinePointer();

  useEffect(() => {
    if (!animate || !fine) return;
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    let disposed = false;
    let teardown: (() => void) | undefined;
    let started = false;

    const start = () => {
      if (started) return;
      started = true;
      host.removeEventListener("pointerenter", start);

      void Promise.all([import("three"), document.fonts.ready]).then(([THREE]) => {
        if (disposed) return;

        let renderer: InstanceType<typeof THREE.WebGLRenderer>;
        try {
          renderer = new THREE.WebGLRenderer({
            canvas,
            alpha: true,
            antialias: false,
            premultipliedAlpha: true,
            powerPreference: "high-performance",
          });
        } catch {
          return; // no context — the hero is complete without this
        }
        // The solver needs float-ish render targets. WebGL1 without the
        // half-float extension would quantise velocity to 8 bits and the
        // fluid would stutter; better no effect than a broken one.
        if (!renderer.capabilities.isWebGL2 && !renderer.extensions.has("OES_texture_half_float")) {
          renderer.dispose();
          return;
        }
        renderer.setClearColor(0x000000, 0);
        renderer.autoClear = false;

        // 1.5, not 2: the composite is now two texture reads a pixel, but on
        // a retina screen every pixel still costs fill-rate the temple's
        // own WebGL scene is also asking for.
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        renderer.setPixelRatio(dpr);

        const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        const scene = new THREE.Scene();
        const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2));
        const placeholder = quad.material as InstanceType<typeof THREE.Material>;
        scene.add(quad);

        const material = (frag: string, uniforms: Record<string, { value: unknown }>) =>
          new THREE.ShaderMaterial({
            vertexShader: quadVert,
            fragmentShader: frag,
            uniforms,
            depthTest: false,
            depthWrite: false,
            blending: THREE.NoBlending,
          });

        const texel = new THREE.Vector2();
        const splatMat = material(splatFrag, {
          u_target: { value: null },
          u_point: { value: new THREE.Vector2() },
          u_value: { value: new THREE.Vector3() },
          u_radius: { value: 0.05 },
          u_aspect: { value: 1 },
        });
        const advectMat = material(advectFrag, {
          u_velocity: { value: null },
          u_source: { value: null },
          u_texel: { value: texel },
          u_dissipation: { value: 1 },
        });
        const curlMat = material(curlFrag, {
          u_velocity: { value: null },
          u_texel: { value: texel },
          u_curl: { value: 32 },
        });
        const divMat = material(divergenceFrag, {
          u_velocity: { value: null },
          u_texel: { value: texel },
        });
        const pressureMat = material(pressureFrag, {
          u_pressure: { value: null },
          u_divergence: { value: null },
          u_texel: { value: texel },
        });
        const gradientMat = material(gradientFrag, {
          u_velocity: { value: null },
          u_pressure: { value: null },
          u_texel: { value: texel },
        });

        // The plate: a 2D canvas, typeset once per size/theme, uploaded once.
        const plateCanvas = document.createElement("canvas");
        const plateCtx = plateCanvas.getContext("2d");
        const plateTex = new THREE.CanvasTexture(plateCanvas);
        plateTex.minFilter = THREE.LinearFilter;
        plateTex.magFilter = THREE.LinearFilter;
        plateTex.generateMipmaps = false;
        // Clamp the parallax drift at the edges instead of wrapping the log.
        plateTex.wrapS = THREE.ClampToEdgeWrapping;
        plateTex.wrapT = THREE.ClampToEdgeWrapping;

        const rimColor = new THREE.Color();
        const maskMat = material(maskFrag, {
          u_density: { value: null },
          u_time: { value: 0 },
          u_progress: { value: 0 },
        });
        const compositeMat = material(compositeFrag, {
          u_plate: { value: plateTex },
          u_mask: { value: null },
          u_parallax: { value: new THREE.Vector2() },
          u_rim: { value: rimColor },
        });

        type RT = InstanceType<typeof THREE.WebGLRenderTarget>;
        const rtOptions = {
          type: THREE.HalfFloatType,
          format: THREE.RGBAFormat,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter,
          depthBuffer: false,
          stencilBuffer: false,
          generateMipmaps: false,
        } as const;
        let simW = 1;
        let simH = 1;
        let vel: [RT, RT] | null = null;
        let dye: [RT, RT] | null = null;
        let prs: [RT, RT] | null = null;
        let div: RT | null = null;
        let maskRT: RT | null = null;
        const disposeTargets = () => {
          for (const t of [...(vel ?? []), ...(dye ?? []), ...(prs ?? []), div, maskRT]) t?.dispose();
        };

        let cssW = 1;
        let cssH = 1;
        const plateTokensFor = () => readPlateTokens(document.documentElement);
        const monoFamily =
          getComputedStyle(document.documentElement).getPropertyValue("--font-jbmono").trim() ||
          "ui-monospace, monospace";

        // The portrait's evidence scan (public/portrait, generated by
        // design/portrait-assets.py at the photograph's exact framing). It
        // is printed onto the plate over the photo's on-screen box, so where
        // the lens opens over the face it shows the face's scan, and
        // everywhere else the audit log.
        const portrait = host.querySelector<HTMLImageElement>("[data-portrait]");
        const scan = new Image();
        scan.decoding = "async";

        const printPlate = () => {
          if (!plateCtx) return;
          const tokens = plateTokensFor();
          plateCanvas.width = Math.max(1, Math.round(cssW * dpr));
          plateCanvas.height = Math.max(1, Math.round(cssH * dpr));
          drawEvidencePlate(plateCtx, plateCanvas.width, plateCanvas.height, dpr, tokens, monoFamily);
          if (portrait && scan.complete && scan.naturalWidth > 0) {
            const hr = host.getBoundingClientRect();
            const pr = portrait.getBoundingClientRect();
            if (pr.width > 0) {
              plateCtx.drawImage(
                scan,
                (pr.left - hr.left) * dpr,
                (pr.top - hr.top) * dpr,
                pr.width * dpr,
                pr.height * dpr,
              );
            }
          }
          plateTex.needsUpdate = true;
          rimColor.set(tokens.data || "#7fafe0");
        };
        if (portrait) {
          scan.onload = printPlate;
          scan.src = "/portrait/portrait-scan.webp";
        }

        const resize = () => {
          const r = host.getBoundingClientRect();
          cssW = Math.max(2, Math.round(r.width));
          cssH = Math.max(2, Math.round(r.height));
          renderer.setSize(cssW, cssH, false);
          const w = Math.max(2, Math.round(cssW * SIM_SCALE));
          const h = Math.max(2, Math.round(cssH * SIM_SCALE));
          if (w !== simW || h !== simH || !vel) {
            disposeTargets();
            simW = w;
            simH = h;
            const make = () => new THREE.WebGLRenderTarget(simW, simH, rtOptions);
            vel = [make(), make()];
            dye = [make(), make()];
            prs = [make(), make()];
            div = make();
            maskRT = new THREE.WebGLRenderTarget(simW, simH, { ...rtOptions, type: THREE.UnsignedByteType });
            texel.set(1 / simW, 1 / simH);
          }
          printPlate();
        };
        resize();

        const pass = (mat: InstanceType<typeof THREE.ShaderMaterial>, target: RT | null) => {
          quad.material = mat;
          renderer.setRenderTarget(target);
          renderer.render(scene, camera);
        };
        const swap = (pair: [RT, RT]) => {
          const t = pair[0];
          pair[0] = pair[1];
          pair[1] = t;
        };
        const clearTargets = () => {
          for (const t of [...(vel ?? []), ...(dye ?? []), ...(prs ?? [])]) {
            renderer.setRenderTarget(t);
            renderer.clear(true, false, false);
          }
          renderer.setRenderTarget(null);
        };
        clearTargets();

        // ── interaction state ────────────────────────────────────────────
        const pointer = { x: 0.5, y: 0.5, px: 0.5, py: 0.5, fresh: false };
        let bounds = host.getBoundingClientRect();
        // Scrolling only invalidates the box; it is re-read on the next
        // pointer move. Reading it on every scroll event forced a layout per
        // Lenis frame for nothing.
        let boundsDirty = false;
        let inside = false;
        let settleUntil = 0;
        let progress = 0;
        const parallax = new THREE.Vector2();
        const parallaxGoal = new THREE.Vector2();
        let raf = 0;
        let last = 0;
        let visible = true;
        const dyeDecay = Math.pow(0.01, 1 / (60 * SHRINK_S));

        const step = (dt: number) => {
          if (!vel || !dye || !prs || !div || !maskRT) return;
          const aspect = cssW / cssH;
          const dx = pointer.x - pointer.px;
          const dy = pointer.y - pointer.py;
          pointer.px = pointer.x;
          pointer.py = pointer.y;

          if (inside) {
            splatMat.uniforms.u_point!.value.set(pointer.x, pointer.y);
            splatMat.uniforms.u_radius!.value = BRUSH_PX / cssH;
            splatMat.uniforms.u_aspect!.value = aspect;
            if (pointer.fresh) {
              // Velocity in sim texels per frame: the pointer's own travel.
              splatMat.uniforms.u_value!.value.set(dx * simW * 0.6, dy * simH * 0.6, 0);
              splatMat.uniforms.u_target!.value = vel[0].texture;
              pass(splatMat, vel[1]);
              swap(vel);
            }
            // Dye goes in every frame the pointer is inside, moving or not,
            // so a resting pointer holds the lens open instead of watching it
            // close. Small per-frame dose: at the decay rate below it settles
            // around 6, enough to saturate the mask without flooding the box.
            splatMat.uniforms.u_value!.value.set(0.3, 0, 0);
            splatMat.uniforms.u_target!.value = dye[0].texture;
            pass(splatMat, dye[1]);
            swap(dye);
          }

          curlMat.uniforms.u_velocity!.value = vel[0].texture;
          pass(curlMat, vel[1]);
          swap(vel);

          divMat.uniforms.u_velocity!.value = vel[0].texture;
          pass(divMat, div);

          pressureMat.uniforms.u_divergence!.value = div.texture;
          for (let i = 0; i < PRESSURE_ITERS; i++) {
            pressureMat.uniforms.u_pressure!.value = prs[0].texture;
            pass(pressureMat, prs[1]);
            swap(prs);
          }

          gradientMat.uniforms.u_velocity!.value = vel[0].texture;
          gradientMat.uniforms.u_pressure!.value = prs[0].texture;
          pass(gradientMat, vel[1]);
          swap(vel);

          advectMat.uniforms.u_velocity!.value = vel[0].texture;
          advectMat.uniforms.u_source!.value = vel[0].texture;
          advectMat.uniforms.u_dissipation!.value = 0.97;
          pass(advectMat, vel[1]);
          swap(vel);

          advectMat.uniforms.u_velocity!.value = vel[0].texture;
          advectMat.uniforms.u_source!.value = dye[0].texture;
          advectMat.uniforms.u_dissipation!.value = Math.pow(dyeDecay, dt * 60);
          pass(advectMat, dye[1]);
          swap(dye);

          // The mask fades up on entry; on exit it is the dye's own decay
          // that closes the hole, so the reveal dissolves through its eddies
          // rather than blinking off.
          progress += (1 - progress) * (1 - Math.exp(-dt / 0.18));
          parallax.lerp(parallaxGoal, 1 - Math.exp(-dt / 0.25));

          maskMat.uniforms.u_density!.value = dye[0].texture;
          maskMat.uniforms.u_progress!.value = progress;
          maskMat.uniforms.u_time!.value += dt;
          pass(maskMat, maskRT);
          compositeMat.uniforms.u_mask!.value = maskRT!.texture;
          compositeMat.uniforms.u_parallax!.value.copy(parallax);
          renderer.setRenderTarget(null);
          renderer.clear(true, false, false);
          pass(compositeMat, null);
        };

        const loop = (now: number) => {
          raf = 0;
          const dt = Math.min((now - (last || now)) / 1000, 1 / 30) || 1 / 60;
          last = now;
          step(dt);
          pointer.fresh = false;
          if (visible && (inside || performance.now() < settleUntil)) {
            raf = requestAnimationFrame(loop);
          } else {
            // Parked: leave a clean canvas, not a frozen half-dissolved frame.
            renderer.setRenderTarget(null);
            renderer.clear(true, false, false);
            clearTargets();
            progress = 0;
          }
        };
        const wake = () => {
          if (!raf && visible) {
            last = 0;
            raf = requestAnimationFrame(loop);
          }
        };

        const onMove = (e: PointerEvent) => {
          if (e.pointerType !== "mouse") return;
          if (boundsDirty) {
            bounds = host.getBoundingClientRect();
            boundsDirty = false;
          }
          const x = (e.clientX - bounds.left) / bounds.width;
          const y = 1 - (e.clientY - bounds.top) / bounds.height;
          const within = x >= 0 && x <= 1 && y >= 0 && y <= 1;
          if (!within) {
            if (inside) leave();
            return;
          }
          if (!inside) {
            inside = true;
            pointer.px = x;
            pointer.py = y;
          }
          pointer.x = x;
          pointer.y = y;
          pointer.fresh = true;
          // ±4px of drift, against the pointer: the layer is underneath.
          // Kept small because the scan has to stay registered on the face.
          parallaxGoal.set(-(x - 0.5) * (8 / cssW), -(y - 0.5) * (8 / cssH));
          wake();
        };
        const leave = () => {
          inside = false;
          parallaxGoal.set(0, 0);
          settleUntil = performance.now() + SHRINK_S * 1000 + 200;
          wake();
        };
        const onScroll = () => {
          boundsDirty = true;
        };
        const onResize = () => {
          resize();
          bounds = host.getBoundingClientRect();
        };
        const onVisibility = () => {
          visible = !document.hidden;
          if (visible) wake();
        };
        const io = new IntersectionObserver(([entry]) => {
          visible = (entry?.isIntersecting ?? true) && !document.hidden;
          if (!visible && inside) inside = false;
        });
        io.observe(host);
        const ro = new ResizeObserver(onResize);
        ro.observe(host);
        // Re-typeset the plate when the theme flips: dark ink on paper
        // would read as a rendering fault.
        const mo = new MutationObserver(printPlate);
        mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

        window.addEventListener("pointermove", onMove, { passive: true });
        window.addEventListener("scroll", onScroll, { passive: true });
        document.addEventListener("visibilitychange", onVisibility);
        host.addEventListener("pointerleave", leave);

        teardown = () => {
          if (raf) cancelAnimationFrame(raf);
          io.disconnect();
          ro.disconnect();
          mo.disconnect();
          window.removeEventListener("pointermove", onMove);
          window.removeEventListener("scroll", onScroll);
          document.removeEventListener("visibilitychange", onVisibility);
          host.removeEventListener("pointerleave", leave);
          disposeTargets();
          for (const m of [splatMat, advectMat, curlMat, divMat, pressureMat, gradientMat, maskMat, compositeMat]) m.dispose();
          quad.geometry.dispose();
          placeholder.dispose();
          plateTex.dispose();
          renderer.dispose();
        };
      });
    };

    // First intent loads the solver: no three, no GPU work, until the
    // reader actually points at the hero.
    host.addEventListener("pointerenter", start);
    if (host.matches(":hover")) start();

    return () => {
      disposed = true;
      host.removeEventListener("pointerenter", start);
      teardown?.();
    };
  }, [animate, fine]);

  if (!animate || !fine) return null;

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-[1] h-full w-full"
    />
  );
}
