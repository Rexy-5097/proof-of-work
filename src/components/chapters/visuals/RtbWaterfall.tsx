"use client";

import { useViz } from "@/hooks/useViz";

const STAGES = [
  { label: "PARSE", sub: "bid request" },
  { label: "HASH", sub: "262K dims" },
  { label: "INFER ×3", sub: "ctr · cvr · price" },
  { label: "EV", sub: "lagrangian bid" },
  { label: "RISK ×6", sub: "gate→shade→pace" },
  { label: "BID", sub: "response" },
] as const;

const W = 640;
const STEP = W / STAGES.length;
const MID = 92;
const PULSE_PATH = `M4,${MID} H${W - 4}`;

/**
 * The 0.15ms request path: six stages, one pulse. The pulse crosses the
 * entire pipeline in 900ms of screen time; the real engine does it in
 * 0.15ms — the caption owns that honesty.
 */
export function RtbWaterfall() {
  const { ref, attrs, running } = useViz();

  return (
    <svg
      ref={ref}
      {...attrs}
      viewBox="0 0 640 200"
      role="img"
      aria-label="Bidding pipeline diagram: parse, feature hashing into 262 thousand dimensions, three model inferences, expected-value computation, six risk-control layers, then the bid response — 0.15 milliseconds at the 99th percentile."
      className="viz w-full font-mono"
    >
      <path d={PULSE_PATH} pathLength={1} className="draw" stroke="var(--data)" strokeWidth="1" fill="none" strokeDasharray="1" opacity="0.5" />

      {STAGES.map((s, i) => {
        const cx = STEP * i + STEP / 2;
        const last = i === STAGES.length - 1;
        return (
          <g key={s.label} className="rise" data-d={Math.min(i + 1, 6)}>
            <line x1={cx} y1={MID - 14} x2={cx} y2={MID + 14} stroke={last ? "var(--seal)" : "var(--line-strong)"} strokeWidth="1" />
            <circle cx={cx} cy={MID} r="3.5" fill="var(--bg-0)" stroke={last ? "var(--seal)" : "var(--data)"} strokeWidth="1.2" />
            <text x={cx} y={MID - 26} textAnchor="middle" fontSize="10.5" fill={last ? "var(--seal)" : "var(--ink-hi)"} letterSpacing="0.08em">
              {s.label}
            </text>
            <text x={cx} y={MID + 34} textAnchor="middle" fontSize="9" fill="var(--ink-lo)">
              {s.sub}
            </text>
          </g>
        );
      })}

      <g className="rise" data-d="6">
        <text x={W / 2} y={172} textAnchor="middle" fontSize="11" fill="var(--ink-md)" letterSpacing="0.06em">
          shown at ~6000× real speed — the engine crosses this line in
          <tspan fill="var(--seal)"> 0.15ms P99</tspan>
        </text>
      </g>

      {running ? (
        <circle r="4" fill="var(--seal)">
          <animateMotion
            id="pulse"
            dur="0.9s"
            begin="0.4s; pulse.end+2.2s"
            fill="freeze"
            path={PULSE_PATH}
            calcMode="spline"
            keySplines="0.65 0 0.35 1"
            keyTimes="0;1"
            keyPoints="0;1"
          />
          <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;0.08;0.92;1" dur="0.9s" begin="0.4s; pulse.end+2.2s" fill="freeze" />
        </circle>
      ) : null}
    </svg>
  );
}
