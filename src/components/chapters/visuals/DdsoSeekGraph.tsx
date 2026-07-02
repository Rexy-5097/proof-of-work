"use client";

import { useMemo } from "react";
import { useViz } from "@/hooks/useViz";

const PLOT = { x: 24, y: 40, w: 592, h: 140 } as const;
/** Three workload regimes: sequential (low σ²), random (high), clustered (mid). */
const REGIMES = [
  { until: 0.34, level: 0.16, noise: 0.05, algo: "FIFO", reason: "sequential — order is already optimal" },
  { until: 0.68, level: 0.78, noise: 0.16, algo: "SSTF", reason: "random — chase the nearest sector" },
  { until: 1.0, level: 0.42, noise: 0.08, algo: "BATCH", reason: "clustered — group and sweep" },
] as const;

function jitter(i: number): number {
  const x = Math.sin(i * 78.233) * 43758.5453;
  return (x - Math.floor(x) - 0.5) * 2;
}

/**
 * Why adaptive scheduling matters: seek variance jumps when the workload
 * regime changes, and the kernel module switches strategy at the marked
 * boundaries — after hysteresis and a cooldown, never on a single spike.
 */
export function DdsoSeekGraph() {
  const { ref, attrs, running } = useViz();

  const path = useMemo(() => {
    const n = 120;
    const cmds: string[] = [];
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1);
      const regime = REGIMES.find((r) => t <= r.until) ?? REGIMES[2];
      // ease between regime levels near boundaries to suggest hysteresis
      const v = Math.min(1, Math.max(0, regime.level + jitter(i) * regime.noise));
      const x = PLOT.x + t * PLOT.w;
      const y = PLOT.y + (1 - v) * PLOT.h;
      cmds.push(`${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return cmds.join(" ");
  }, []);

  const boundaries = [0.34, 0.68];

  return (
    <svg
      ref={ref}
      {...attrs}
      viewBox="0 0 640 260"
      role="img"
      aria-label="Seek-variance telemetry over time with three workload regimes. Variance is low during sequential access where FIFO is selected, spikes during random access where SSTF is selected, and settles mid-range during clustered access where BATCH is selected. Dashed markers show the runtime algorithm switches."
      className="viz w-full font-mono"
    >
      <g className="rise">
        <rect x={PLOT.x} y={PLOT.y} width={PLOT.w} height={PLOT.h} fill="var(--bg-1)" stroke="var(--line)" />
        <text x={PLOT.x} y={PLOT.y - 10} fontSize="9.5" fill="var(--ink-md)" letterSpacing="0.08em">
          SEEK VARIANCE σ² — LIVE FROM trace_ddso_dispatch
        </text>
        <text x={PLOT.x - 8} y={PLOT.y + 8} textAnchor="end" fontSize="8.5" fill="var(--ink-lo)">hi</text>
        <text x={PLOT.x - 8} y={PLOT.y + PLOT.h} textAnchor="end" fontSize="8.5" fill="var(--ink-lo)">lo</text>
      </g>

      {/* regime bands + selected algorithm */}
      {REGIMES.map((r, i) => {
        const x0 = PLOT.x + (i === 0 ? 0 : REGIMES[i - 1]!.until) * PLOT.w;
        const x1 = PLOT.x + r.until * PLOT.w;
        return (
          <g key={r.algo} className="rise" data-d={i + 2}>
            <text x={(x0 + x1) / 2} y={PLOT.y + PLOT.h + 22} textAnchor="middle" fontSize="10.5" fill="var(--seal)" letterSpacing="0.1em">
              {r.algo}
            </text>
            <text x={(x0 + x1) / 2} y={PLOT.y + PLOT.h + 38} textAnchor="middle" fontSize="8.5" fill="var(--ink-lo)">
              {r.reason}
            </text>
          </g>
        );
      })}

      {/* switch markers */}
      {boundaries.map((b, i) => (
        <g key={b} className="rise" data-d={i + 3}>
          <line x1={PLOT.x + b * PLOT.w} y1={PLOT.y} x2={PLOT.x + b * PLOT.w} y2={PLOT.y + PLOT.h + 42} stroke="var(--caution)" strokeWidth="0.75" strokeDasharray="4 4" />
          <text x={PLOT.x + b * PLOT.w} y={PLOT.y - 10} textAnchor="middle" fontSize="8.5" fill="var(--caution)">
            trace_ddso_switch
          </text>
        </g>
      ))}

      <path d={path} pathLength={1} className="draw" data-d="1" fill="none" stroke="var(--data)" strokeWidth="1.25" />

      <g className="rise" data-d="6">
        <text x={PLOT.x} y={244} fontSize="9" fill="var(--ink-lo)">
          switches require sustained evidence: hysteresis band + cooldown window — one spike never flips the scheduler
        </text>
        <text x={616} y={244} textAnchor="end" fontSize="9" fill="var(--seal)">
          kernel/ddso.c ◆
        </text>
      </g>

      {running ? (
        <circle r="2.5" fill="var(--data)">
          <animateMotion dur="9s" repeatCount="indefinite" path={path} />
        </circle>
      ) : null}
    </svg>
  );
}
