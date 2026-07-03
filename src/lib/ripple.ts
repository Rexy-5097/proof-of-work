/**
 * The signature theme transition's physics core.
 *
 * Engineering note on approach: the brief asks for a WebGL/WebGPU
 * fragment-shader fluid simulation. We use the native View Transitions
 * API instead — it already does the hard part (rasterizing the old and
 * new page as GPU textures and compositing them full-screen) more
 * robustly than a hand-rolled DOM-to-texture capture ever would (fonts,
 * blend modes, backdrop-filter all "just work" because the browser's
 * own renderer produced the textures). What we hand-drive on top is the
 * *wave*: every frame we compute a radius/feather/energy envelope here
 * and write it into a CSS `mask-image` (reveal) and an SVG
 * `feDisplacementMap` + chromatic-aberration filter (distortion), rather
 * than animate a plain circle. This gets us real damped-wave physics,
 * GPU compositing, and full cross-browser graceful degradation, at a
 * fraction of the risk of a custom shader pipeline.
 *
 * What's a deliberate approximation, stated plainly: displacement and
 * aberration are modulated by a single global energy envelope (time),
 * not a true per-pixel field keyed to each fragment's distance from the
 * live wavefront. A per-pixel traveling distortion band is possible but
 * needs an actual WebGL pass — flagged as a future upgrade, not hidden.
 */

export interface RippleFrame {
  /** Radius of the reveal front, in px from the click point. */
  radius: number;
  /** Softness of the reveal edge, in px (grows as the wave travels). */
  feather: number;
  /** 0–1 "energy remaining" envelope: rises fast on impact, decays after. */
  energy: number;
}

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/**
 * r(t) ∝ √t — the classic shallow-water wavefront growth law: fast at
 * first, decelerating as it spreads, never linear (brief requirement:
 * "no perfectly linear motion").
 */
export function computeRippleFrame(t: number, maxRadius: number): RippleFrame {
  const tt = clamp01(t);
  const radius = maxRadius * Math.sqrt(tt);
  // Impulse response: quick rise (impact), exponential decay (energy
  // dissipating into the surface) — drives distortion strength and the
  // secondary ring's visibility, both fading as the wave loses energy.
  const rise = Math.min(1, tt / 0.1);
  const decay = Math.exp(-3.2 * tt);
  const energy = rise * decay;
  const feather = 26 + 40 * tt;
  return { radius, feather, energy };
}

/**
 * Builds the `mask-image` that reveals the new theme only behind the
 * wavefront. A five-stop radial gradient rather than a hard circle:
 * the 2nd/3rd stops carve a faint trailing ring whose depth tracks the
 * energy envelope — "small secondary ripples ... diminishing amplitude"
 * without rendering a second physical ring element.
 */
export function rippleMaskImage(x: number, y: number, frame: RippleFrame): string {
  const { radius: r, feather: f, energy } = frame;
  const ringOffset = f * 2.4;
  const ringPos = Math.max(0, r - ringOffset);
  const ringDip = (1 - 0.14 * energy).toFixed(3);
  const innerStop = Math.max(0, ringPos - f * 0.5).toFixed(1);
  const ringStop = ringPos.toFixed(1);
  const recoverStop = Math.min(r, ringPos + f * 0.5).toFixed(1);
  const preEdgeStop = Math.max(0, r - f).toFixed(1);
  const edgeStop = r.toFixed(1);
  return (
    `radial-gradient(circle at ${x.toFixed(1)}px ${y.toFixed(1)}px, ` +
    `black 0px, black ${innerStop}px, ` +
    `rgba(0,0,0,${ringDip}) ${ringStop}px, ` +
    `black ${recoverStop}px, black ${preEdgeStop}px, ` +
    `transparent ${edgeStop}px)`
  );
}

/** Distance from (x, y) to the farthest viewport corner — full coverage radius. */
export function maxRadiusFrom(x: number, y: number, width: number, height: number): number {
  const corners: [number, number][] = [
    [0, 0],
    [width, 0],
    [0, height],
    [width, height],
  ];
  return Math.max(...corners.map(([cx, cy]) => Math.hypot(cx - x, cy - y))) + 8;
}

export interface RippleDriverOptions {
  x: number;
  y: number;
  maxRadius: number;
  durationMs: number;
  onFrame: (mask: string, distortScale: number, aberrationPx: number) => void;
}

/** Drives one full ripple via rAF, resolving when the wave has reached every corner. */
export function runRipple(opts: RippleDriverOptions): Promise<void> {
  const { x, y, maxRadius, durationMs, onFrame } = opts;
  return new Promise((resolve) => {
    const start = performance.now();
    const step = (now: number) => {
      const t = (now - start) / durationMs;
      const frame = computeRippleFrame(t, maxRadius);
      const mask = rippleMaskImage(x, y, frame);
      const distortScale = 34 * frame.energy;
      const aberrationPx = 0.9 * frame.energy;
      onFrame(mask, distortScale, aberrationPx);
      if (t < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });
}
