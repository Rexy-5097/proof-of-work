"use client";

import { useViz } from "@/hooks/useViz";

const NODES = [
  { y: 30, file: "CheckoutButton.tsx:34", detail: "onSubmit()", lang: "TS" },
  { y: 96, file: "POST /api/orders/{*}", detail: "canonical route shape", lang: "—" },
  { y: 162, file: "orders.py:12", detail: "create_order()", lang: "PY" },
] as const;

const EDGES = [
  { y: 63, kind: "http-call", conf: "0.94", prov: "template-eval" },
  { y: 129, kind: "route match", conf: "0.98", prov: "route-matcher" },
] as const;

const BOX = { x: 26, w: 250, h: 40 } as const;

/**
 * One resolved cross-stack chain: a TypeScript call site joined to a
 * Python handler through a canonicalised route — with the confidence and
 * provenance Cartograph stores on every edge. The right column is the
 * evidence record for the edge, which is the whole point: never `A → B`.
 */
export function CartographChain() {
  const { ref, attrs } = useViz();

  return (
    <svg
      ref={ref}
      {...attrs}
      viewBox="0 0 640 250"
      role="img"
      aria-label="A cross-stack resolution chain. A TypeScript call site in CheckoutButton.tsx line 34 is matched by template evaluation with confidence 0.94 to the canonical route shape POST /api/orders/{*}, which the route matcher joins with confidence 0.98 to the Python handler create_order in orders.py line 12. Each edge stores its kind, confidence, provenance, evidence string and commit."
      className="viz w-full font-mono"
    >
      <g className="rise">
        <text x={8} y={14} fontSize="9.5" fill="var(--ink-md)" letterSpacing="0.08em">
          CROSS-STACK RESOLUTION — THREE LANGUAGES, ONE EVIDENCED CHAIN
        </text>
      </g>

      {/* the chain */}
      {NODES.map((n, i) => (
        <g key={n.file} className="rise" data-d={Math.min(i * 2 + 1, 6)}>
          <rect
            x={BOX.x}
            y={n.y}
            width={BOX.w}
            height={BOX.h}
            rx="6"
            fill="var(--bg-2)"
            stroke={i === 1 ? "var(--line-seal)" : "var(--line-strong)"}
          />
          <text x={BOX.x + 12} y={n.y + 17} fontSize="10" fill={i === 1 ? "var(--seal)" : "var(--ink-hi)"}>
            {n.file}
          </text>
          <text x={BOX.x + 12} y={n.y + 31} fontSize="8.5" fill="var(--ink-lo)">
            {n.detail}
          </text>
          {n.lang !== "—" ? (
            <text x={BOX.x + BOX.w - 12} y={n.y + 17} textAnchor="end" fontSize="8" fill="var(--ink-lo)">
              {n.lang}
            </text>
          ) : null}
        </g>
      ))}

      {EDGES.map((e, i) => (
        <g key={e.kind} className="rise" data-d={Math.min(i * 2 + 2, 6)}>
          <line x1={BOX.x + BOX.w / 2} y1={e.y - 33} x2={BOX.x + BOX.w / 2} y2={e.y + 30} stroke="var(--data)" strokeWidth="1" />
          <path d={`M${BOX.x + BOX.w / 2 - 3.5},${e.y + 25} L${BOX.x + BOX.w / 2},${e.y + 31} L${BOX.x + BOX.w / 2 + 3.5},${e.y + 25}`} fill="none" stroke="var(--data)" strokeWidth="1" />
          <text x={BOX.x + BOX.w / 2 + 10} y={e.y + 2} fontSize="8.5" fill="var(--ink-md)">
            {e.kind}
          </text>
          <text x={BOX.x + BOX.w / 2 + 10} y={e.y + 14} fontSize="8" fill="var(--ink-lo)">
            {e.conf} · {e.prov}
          </text>
        </g>
      ))}

      {/* the evidence record — never `A → B` */}
      <g className="rise" data-d="5">
        <rect x={330} y={30} width={300} height={172} rx="6" fill="var(--bg-1)" stroke="var(--line)" />
        <text x={344} y={48} fontSize="8.5" fill="var(--ink-lo)" letterSpacing="0.08em">
          EDGE RECORD
        </text>
        {[
          ['"kind"', '"http-call"'],
          ['"confidence"', "0.94"],
          ['"provenance"', '"route-matcher"'],
          ['"evidence"', '"POST /api/orders"'],
          ['"commit"', '"a3f9c21"'],
          ['"created_at"', '"2026-08-17T09:14Z"'],
        ].map(([k, v], i) => (
          <g key={k}>
            <text x={344} y={70 + i * 19} fontSize="8.5" fill="var(--data)">
              {k}:
            </text>
            <text x={452} y={70 + i * 19} fontSize="8.5" fill="var(--ink-hi)">
              {v}
            </text>
          </g>
        ))}
        <text x={344} y={190} fontSize="8.5" fill="var(--seal)">
          ambiguous candidates produce no edge ◆
        </text>
      </g>

      <g className="rise" data-d="6">
        <text x={8} y={228} fontSize="9" fill="var(--ink-lo)">
          /orders/:id · /orders/&#123;id&#125; · /orders/&lt;int:id&gt; → one canonical shape before anything is joined
        </text>
        <text x={8} y={242} fontSize="9" fill="var(--caution)">
          ⚠ pre-alpha — M06 of 17; `cartograph analyze` not implemented
        </text>
      </g>
    </svg>
  );
}
