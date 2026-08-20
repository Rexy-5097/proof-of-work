"use client";

import { useViz } from "@/hooks/useViz";

/** Axis window — zoomed so the interval overlap is legible, and labelled as such. */
const AXIS_MIN = 0.93;
const AXIS_MAX = 0.99;

interface Row {
  label: string;
  auc: number;
  lo: number;
  hi: number;
  kind: "baseline" | "learned" | "trivial";
}

/** Values read from the repo's benchmark table; see the chapter's evidence links. */
const ROWS: Row[] = [
  { label: "THRESHOLD (count rate)", auc: 0.954, lo: 0.94, hi: 0.966, kind: "baseline" },
  { label: "LightGBM", auc: 0.961, lo: 0.949, hi: 0.972, kind: "learned" },
  { label: "Logistic regression", auc: 0.964, lo: 0.953, hi: 0.974, kind: "learned" },
  { label: "Random forest", auc: 0.966, lo: 0.956, hi: 0.976, kind: "learned" },
  { label: "Persistence (trivial)", auc: 0.982, lo: 0.978, hi: 0.986, kind: "trivial" },
];

const PLOT = { x: 214, y: 34, w: 386, h: 150 } as const;
const ROW_H = PLOT.h / ROWS.length;

const colorFor = (k: Row["kind"]) =>
  k === "baseline" ? "var(--seal)" : k === "trivial" ? "var(--caution)" : "var(--data)";

const sx = (v: number) => PLOT.x + ((v - AXIS_MIN) / (AXIS_MAX - AXIS_MIN)) * PLOT.w;

/**
 * The null result, made visible: every learned model's 95% interval
 * overlaps the simple threshold detector's, so none is distinguishable
 * from it. A ranking would hide that; the intervals show it.
 */
export function AdityaNetVerdict() {
  const { ref, attrs } = useViz();
  const baselineX = sx(0.954);

  return (
    <svg
      ref={ref}
      {...attrs}
      viewBox="0 0 640 250"
      role="img"
      aria-label="Flare-nowcast ROC-AUC with 95% confidence intervals. The threshold detector on the SoLEXS count rate scores 0.954 (0.940 to 0.966). Logistic regression 0.964, LightGBM 0.961 and random forest 0.966 all have intervals overlapping the threshold's, so no learned model is statistically distinguishable from it. Persistence, a trivial baseline, scores highest at 0.982."
      className="viz w-full font-mono"
    >
      <g className="rise">
        <text x={8} y={16} fontSize="9.5" fill="var(--ink-md)" letterSpacing="0.08em">
          M/X-CLASS FLARE NOWCAST — ROC-AUC, 95% CI
        </text>
        <rect x={PLOT.x} y={PLOT.y} width={PLOT.w} height={PLOT.h} fill="var(--bg-1)" stroke="var(--line)" />
        {[0.93, 0.945, 0.96, 0.975, 0.99].map((t) => (
          <g key={t}>
            <line x1={sx(t)} y1={PLOT.y + PLOT.h} x2={sx(t)} y2={PLOT.y + PLOT.h + 4} stroke="var(--line-strong)" strokeWidth="1" />
            <text x={sx(t)} y={PLOT.y + PLOT.h + 16} textAnchor="middle" fontSize="8.5" fill="var(--ink-lo)">
              {t.toFixed(3)}
            </text>
          </g>
        ))}
      </g>

      {/* the baseline the whole verdict turns on */}
      <g className="rise" data-d="1">
        <line x1={baselineX} y1={PLOT.y} x2={baselineX} y2={PLOT.y + PLOT.h} stroke="var(--seal)" strokeWidth="1" strokeDasharray="3 3" opacity="0.55" />
      </g>

      {ROWS.map((r, i) => {
        const cy = PLOT.y + ROW_H * i + ROW_H / 2;
        const c = colorFor(r.kind);
        return (
          <g key={r.label} className="rise" data-d={Math.min(i + 1, 6)}>
            <text x={PLOT.x - 10} y={cy + 3} textAnchor="end" fontSize="9" fill={r.kind === "baseline" ? "var(--seal)" : "var(--ink-md)"}>
              {r.label}
            </text>
            <line x1={sx(r.lo)} y1={cy} x2={sx(r.hi)} y2={cy} stroke={c} strokeWidth="1.25" opacity="0.85" />
            <line x1={sx(r.lo)} y1={cy - 3.5} x2={sx(r.lo)} y2={cy + 3.5} stroke={c} strokeWidth="1.25" />
            <line x1={sx(r.hi)} y1={cy - 3.5} x2={sx(r.hi)} y2={cy + 3.5} stroke={c} strokeWidth="1.25" />
            <circle cx={sx(r.auc)} cy={cy} r="3" fill={c} />
            <text x={sx(r.hi) + 8} y={cy + 3} fontSize="8.5" fill="var(--ink-lo)" className="tabular">
              {r.auc.toFixed(3)}
            </text>
          </g>
        );
      })}

      <g className="rise" data-d="6">
        <text x={8} y={PLOT.y + PLOT.h + 42} fontSize="9" fill="var(--ink-lo)">
          axis zoomed to {AXIS_MIN}–{AXIS_MAX} so the overlap is legible · 192,541 test minutes · 581 M/X events
        </text>
        <text x={8} y={PLOT.y + PLOT.h + 58} fontSize="9.5" fill="var(--seal)" letterSpacing="0.06em">
          EVERY LEARNED INTERVAL OVERLAPS THE THRESHOLD — VERDICT: NO GAIN ◆
        </text>
      </g>
    </svg>
  );
}
