"use client";

import { useMemo } from "react";
import { useViz } from "@/hooks/useViz";

/** Deterministic jitter so server and client render identical points. */
function jitter(i: number): number {
  const x = Math.sin(i * 12.9898) * 43758.5453;
  return (x - Math.floor(x) - 0.5) * 2;
}

/** Phase-folded eclipsing-binary brightness model: primary + secondary dip. */
function brightness(phase: number): number {
  const dip = (c: number, depth: number, width: number) =>
    depth * Math.exp(-(((phase - c) / width) ** 2));
  return 1 - dip(0.25, 0.62, 0.035) - dip(0.75, 0.28, 0.035);
}

interface ClassScore {
  label: string;
  f1: number;
  predicted?: boolean;
  caution?: boolean;
}

const CLASSES: ClassScore[] = [
  { label: "RR LYRAE", f1: 0.94 },
  { label: "ECL. BINARY", f1: 0.91, predicted: true },
  { label: "CEPHEID", f1: 0.81 },
  { label: "STABLE", f1: 0.66 },
  { label: "SOLAR-LIKE", f1: 0.52, caution: true },
];

const PLOT = { x: 24, y: 26, w: 344, h: 158 } as const;
const BARS = { x: 420, w: 30, gap: 42, base: 184, maxH: 120 } as const;

/**
 * The opening flagship's instrument: a phase-folded TESS light curve
 * (drawn as the pipeline would see it), the classifier's per-class F1 —
 * including the honestly flagged Solar-like class — and the audit row.
 */
export function AstraLightCurve() {
  const { ref, attrs, running } = useViz();

  const { points, path } = useMemo(() => {
    const pts: { x: number; y: number }[] = [];
    const n = 96;
    for (let i = 0; i < n; i++) {
      const phase = i / (n - 1);
      const b = brightness(phase) + jitter(i) * 0.018;
      pts.push({
        x: PLOT.x + phase * PLOT.w,
        y: PLOT.y + (1 - (b - 0.3) / 0.75) * PLOT.h,
      });
    }
    const model = Array.from({ length: 121 }, (_, i) => {
      const phase = i / 120;
      const b = brightness(phase);
      const x = PLOT.x + phase * PLOT.w;
      const y = PLOT.y + (1 - (b - 0.3) / 0.75) * PLOT.h;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(" ");
    return { points: pts, path: model };
  }, []);

  return (
    <svg
      ref={ref}
      {...attrs}
      viewBox="0 0 640 300"
      role="img"
      aria-label="ASTRA instrument panel: a phase-folded light curve of an eclipsing binary with primary and secondary eclipse dips, per-class F1 bars — RR Lyrae 0.94, eclipsing binary 0.91 predicted, Cepheid 0.81, stable 0.66, and Solar-like 0.52 flagged experimental — plus the dataset SHA-256 fingerprint and the 8-of-8 ground-truth audit result."
      className="viz w-full font-mono"
    >
      {/* plot frame */}
      <g className="rise">
        <rect x={PLOT.x} y={PLOT.y} width={PLOT.w} height={PLOT.h} fill="var(--bg-1)" stroke="var(--line)" />
        {[0, 0.25, 0.5, 0.75, 1].map((p) => (
          <g key={p}>
            <line x1={PLOT.x + p * PLOT.w} y1={PLOT.y + PLOT.h} x2={PLOT.x + p * PLOT.w} y2={PLOT.y + PLOT.h + 4} stroke="var(--line-strong)" strokeWidth="1" />
            <text x={PLOT.x + p * PLOT.w} y={PLOT.y + PLOT.h + 16} textAnchor="middle" fontSize="8.5" fill="var(--ink-lo)">
              {p.toFixed(2)}
            </text>
          </g>
        ))}
        <text x={PLOT.x} y={PLOT.y - 8} fontSize="9.5" fill="var(--ink-md)" letterSpacing="0.08em">
          TIC 0231702397 — PHASE-FOLDED FLUX
        </text>
        <text x={PLOT.x + PLOT.w / 2} y={PLOT.y + PLOT.h + 32} textAnchor="middle" fontSize="9" fill="var(--ink-lo)" letterSpacing="0.06em">
          ORBITAL PHASE
        </text>
      </g>

      {/* observations then model fit */}
      <g className="rise" data-d="1" fill="var(--data)" opacity="0.75">
        {points.map((p, i) => (
          <circle key={i} cx={p.x.toFixed(1)} cy={p.y.toFixed(1)} r="1.3" />
        ))}
      </g>
      <path d={path} pathLength={1} className="draw" data-d="2" fill="none" stroke="var(--seal)" strokeWidth="1.25" opacity="0.9" />
      <g className="rise" data-d="3">
        <text x={PLOT.x + 0.25 * PLOT.w + 6} y={PLOT.y + PLOT.h - 6} fontSize="8.5" fill="var(--ink-lo)">
          primary eclipse
        </text>
      </g>

      {/* classifier readout */}
      <g className="rise" data-d="2">
        <text x={BARS.x} y={PLOT.y - 8} fontSize="9.5" fill="var(--ink-md)" letterSpacing="0.08em">
          PER-CLASS F1 — HYBRID CNN+TRANSFORMER
        </text>
      </g>
      {CLASSES.map((c, i) => {
        const h = c.f1 * BARS.maxH;
        const x = BARS.x + i * BARS.gap;
        const color = c.caution ? "var(--caution)" : c.predicted ? "var(--seal)" : "var(--data)";
        return (
          <g key={c.label}>
            <rect className="bar" data-d={Math.min(i + 2, 6)} x={x} y={BARS.base - h} width={BARS.w} height={h} fill={color} opacity={c.predicted ? 0.85 : 0.4} />
            <g className="rise" data-d={Math.min(i + 2, 6)}>
              <text x={x + BARS.w / 2} y={BARS.base - h - 6} textAnchor="middle" fontSize="9" fill={color}>
                {c.f1.toFixed(2)}
              </text>
              <text x={x + BARS.w / 2} y={BARS.base + 12} textAnchor="middle" fontSize="7" fill="var(--ink-lo)">
                {c.label}
              </text>
            </g>
          </g>
        );
      })}
      <g className="rise" data-d="6">
        <text x={BARS.x + BARS.gap + BARS.w / 2} y={BARS.base + 26} textAnchor="middle" fontSize="8" fill="var(--seal)">
          ▲ prediction
        </text>
        <text x={BARS.x + 4 * BARS.gap + BARS.w / 2} y={BARS.base + 26} textAnchor="middle" fontSize="8" fill="var(--caution)">
          ⚠ flagged
        </text>
      </g>

      {/* audit row */}
      <g className="rise" data-d="6">
        <line x1={24} y1={258} x2={616} y2={258} stroke="var(--line)" strokeWidth="1" />
        <text x={24} y={280} fontSize="9" fill="var(--ink-lo)">
          DATASET SHA256 f99b4b06…2dbf58
        </text>
        <text x={360} y={280} fontSize="9" fill="var(--ink-md)">
          944 STARS · HASH-LOCKED
        </text>
        <text x={616} y={280} textAnchor="end" fontSize="9.5" fill="var(--seal)" letterSpacing="0.06em">
          GROUND-TRUTH AUDIT 8/8 PASS ◆
        </text>
      </g>

      {/* incoming starlight: one photon line while running */}
      {running ? (
        <line x1={PLOT.x} y1={PLOT.y} x2={PLOT.x + PLOT.w} y2={PLOT.y} stroke="var(--seal)" strokeWidth="0.5" opacity="0.35">
          <animate attributeName="y1" values={`${PLOT.y};${PLOT.y + PLOT.h}`} dur="7s" repeatCount="indefinite" />
          <animate attributeName="y2" values={`${PLOT.y};${PLOT.y + PLOT.h}`} dur="7s" repeatCount="indefinite" />
        </line>
      ) : null}
    </svg>
  );
}
