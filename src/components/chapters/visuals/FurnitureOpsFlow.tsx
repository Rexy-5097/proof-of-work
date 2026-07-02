"use client";

import { useViz } from "@/hooks/useViz";

const BOX = { y: 96, h: 48 } as const;
const STAGES = [
  { x: 96, w: 104, label: "IDEMPOTENCY", sub: "dedupe key" },
  { x: 232, w: 88, label: "QUEUE", sub: "redis list" },
  { x: 352, w: 88, label: "WORKER", sub: "retry · cb · dlq" },
  { x: 472, w: 120, label: "FOR UPDATE", sub: "row lock + txn" },
] as const;

const FLOW_PATH = `M8,${BOX.y + 24} H472`;

/**
 * Why overselling cannot happen: requests dedupe, queue, and serialize
 * through one locking transaction that also writes the audit log.
 * Green dots = accepted purchases; the red dot is a duplicate rejected
 * at the idempotency gate.
 */
export function FurnitureOpsFlow() {
  const { ref, attrs, running } = useViz();

  return (
    <svg
      ref={ref}
      {...attrs}
      viewBox="0 0 640 240"
      role="img"
      aria-label="Purchase flow diagram: requests pass an idempotency check, enter a Redis queue, and a worker applies them through a row-locking Postgres transaction that also writes the audit log. A duplicate request is rejected at the idempotency gate."
      className="viz w-full font-mono"
    >
      <path d={FLOW_PATH} pathLength={1} className="draw" stroke="var(--data)" strokeWidth="1" fill="none" strokeDasharray="1" opacity="0.6" />

      {STAGES.map((s, i) => (
        <g key={s.label} className="rise" data-d={i + 1}>
          <rect x={s.x} y={BOX.y} width={s.w} height={BOX.h} rx="6" fill="var(--bg-2)" stroke={i === 3 ? "var(--line-seal)" : "var(--line-strong)"} />
          <text x={s.x + s.w / 2} y={BOX.y + 21} textAnchor="middle" fontSize="11" fill={i === 3 ? "var(--seal)" : "var(--ink-hi)"} letterSpacing="0.08em">
            {s.label}
          </text>
          <text x={s.x + s.w / 2} y={BOX.y + 37} textAnchor="middle" fontSize="9" fill="var(--ink-lo)">
            {s.sub}
          </text>
        </g>
      ))}

      {/* audit log, written inside the same transaction */}
      <g className="rise" data-d="5">
        <path d={`M532,${BOX.y + BOX.h} V${BOX.y + 88} H556`} fill="none" stroke="var(--line-strong)" strokeWidth="1" strokeDasharray="3 3" />
        <rect x={556} y={BOX.y + 72} width={76} height={32} rx="6" fill="var(--bg-2)" stroke="var(--line-strong)" />
        <text x={594} y={BOX.y + 92} textAnchor="middle" fontSize="9" fill="var(--ink-md)" letterSpacing="0.06em">
          AUDIT LOG
        </text>
        <text x={532} y={BOX.y + 116} textAnchor="middle" fontSize="9" fill="var(--seal)">
          same transaction
        </text>
      </g>

      <g className="rise" data-d="6">
        <text x={8} y={40} fontSize="10" fill="var(--ink-md)" letterSpacing="0.08em">
          CONCURRENT PURCHASES
        </text>
        <text x={8} y={56} fontSize="9" fill="var(--ink-lo)">
          retries and duplicates included
        </text>
        <text x={632} y={40} textAnchor="end" fontSize="10" fill="var(--seal)" letterSpacing="0.08em">
          INVARIANT: NEVER OVERSOLD ◆
        </text>
      </g>

      {running ? (
        <>
          {[0, 1.4, 2.8].map((begin) => (
            <circle key={begin} r="3" fill="var(--seal)">
              <animateMotion dur="4.2s" begin={`${begin}s`} repeatCount="indefinite" path={FLOW_PATH} />
            </circle>
          ))}
          {/* duplicate request: stopped at the idempotency gate */}
          <circle r="3" fill="var(--flag)">
            <animateMotion dur="1.6s" begin="0.7s" repeatCount="indefinite" path={`M8,${BOX.y + 24} H96`} />
            <animate attributeName="opacity" values="1;1;0" keyTimes="0;0.85;1" dur="1.6s" begin="0.7s" repeatCount="indefinite" />
          </circle>
        </>
      ) : null}
    </svg>
  );
}
