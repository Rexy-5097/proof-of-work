"use client";

import { useViz } from "@/hooks/useViz";

/** Benign path: low tortuosity — a calm arc through representation space. */
const BENIGN = "M24,196 C90,178 150,168 210,150 C260,135 310,124 356,112";
/** Adversarial path: same endpoints region, violently higher tortuosity. */
const ADVERSARIAL =
  "M24,196 C60,150 60,220 96,170 C130,120 120,215 160,160 C195,110 190,205 230,150 C265,100 260,190 300,135 C330,95 330,170 356,118";

const ACTIONS = ["ALLOW", "SLOW", "CLARIFY", "REFUSE", "HALT"] as const;

/**
 * The research idea in one picture: two prompts, two hidden-state paths.
 * Surface text is attacker-controlled; the geometry of the trajectory is
 * not. The decision stack on the right resolves risk to an action, and
 * errors resolve to HALT — never to a silent allow.
 */
export function GeofenceTrajectory() {
  const { ref, attrs } = useViz();

  return (
    <div>
      <svg
        ref={ref}
        {...attrs}
        viewBox="0 0 640 260"
        role="img"
        aria-label="Two hidden-state trajectories through model layers: an aligned prompt traces a smooth path, an adversarial prompt traces a jagged, high-tortuosity path. Windowed geometry features feed a state estimator, risk engine, and authority layer whose actions are allow, slow, clarify, refuse, or halt — with halt as the fail-closed default."
        className="viz w-full font-mono"
      >
        {/* layer axis */}
        <g className="rise">
          {[24, 107, 190, 273, 356].map((x, i) => (
            <g key={x}>
              <line x1={x} y1={210} x2={x} y2={216} stroke="var(--line-strong)" strokeWidth="1" />
              <text x={x} y={230} textAnchor="middle" fontSize="9" fill="var(--ink-lo)">
                L{[5, 10, 15, 20, 24][i]}
              </text>
            </g>
          ))}
          <line x1={24} y1={212} x2={356} y2={212} stroke="var(--line)" strokeWidth="1" />
          <text x={190} y={250} textAnchor="middle" fontSize="9" fill="var(--ink-lo)" letterSpacing="0.08em">
            HIDDEN-STATE TRAJECTORY ACROSS LAYERS
          </text>
        </g>

        <path d={BENIGN} pathLength={1} className="draw" fill="none" stroke="var(--data)" strokeWidth="1.5" data-d="1" />
        <path d={ADVERSARIAL} pathLength={1} className="draw" fill="none" stroke="var(--flag)" strokeWidth="1.5" data-d="2" />

        <g className="rise" data-d="3">
          <text x={362} y={108} fontSize="9.5" fill="var(--flag)">high tortuosity</text>
          <text x={362} y={122} fontSize="9" fill="var(--ink-lo)">adversarial</text>
        </g>
        <g className="rise" data-d="2">
          <text x={286} y={92} fontSize="9.5" fill="var(--data)">low tortuosity</text>
          <text x={286} y={78} fontSize="9" fill="var(--ink-lo)">aligned</text>
        </g>
        {/* sliding analysis window */}
        <rect x={120} y={110} width={80} height={110} className="rise" data-d="4" fill="none" stroke="var(--ink-lo)" strokeWidth="0.75" strokeDasharray="4 4" />
        <text x={160} y={102} textAnchor="middle" fontSize="9" fill="var(--ink-lo)" className="rise" data-d="4">
          window
        </text>

        {/* decision stack */}
        {(
          [
            ["SIGNALS", "tortuosity · drift · stability"],
            ["STATE", "normal → adversarial"],
            ["RISK", "base + trend + volatility"],
            ["AUTHORITY", "risk → action"],
          ] as const
        ).map(([label, sub], i) => (
          <g key={label} className="rise" data-d={Math.min(i + 2, 6)}>
            <rect x={452} y={18 + i * 46} width={168} height={36} rx="6" fill="var(--bg-2)" stroke="var(--line-strong)" />
            <text x={464} y={33 + i * 46} fontSize="10" fill="var(--ink-hi)" letterSpacing="0.08em">
              {label}
            </text>
            <text x={464} y={46 + i * 46} fontSize="8.5" fill="var(--ink-lo)">
              {sub}
            </text>
          </g>
        ))}
        <line x1={536} y1={202} x2={536} y2={214} stroke="var(--line-strong)" strokeWidth="1" className="rise" data-d="5" />

        <g className="rise" data-d="6">
          {ACTIONS.map((a, i) => {
            const halt = a === "HALT";
            return (
              <g key={a}>
                <rect x={412 + i * 46} y={218} width={42} height={20} rx="3" fill={halt ? "var(--flag-dim)" : "var(--bg-2)"} stroke={halt ? "var(--flag)" : "var(--line)"} strokeWidth="0.75" />
                <text x={433 + i * 46} y={231} textAnchor="middle" fontSize="7.5" fill={halt ? "var(--flag)" : "var(--ink-md)"}>
                  {a}
                </text>
              </g>
            );
          })}
          <text x={536} y={254} textAnchor="middle" fontSize="9" fill="var(--flag)" letterSpacing="0.06em">
            errors resolve to HALT — fail closed
          </text>
        </g>
      </svg>

      <details className="group mt-3 border-t border-line pt-3">
        <summary className="mono-label cursor-pointer list-none transition-colors duration-[var(--dur-tick)] hover:text-ink-md [&::-webkit-details-marker]:hidden">
          <span aria-hidden="true" className="mr-2 inline-block transition-transform duration-[var(--dur-ui)] group-open:rotate-90">▸</span>
          THE GEOMETRY, IF YOU WANT IT
        </summary>
        <dl className="mt-3 space-y-2 pl-5 font-mono text-[0.8125rem] leading-relaxed text-ink-md">
          <div>
            <dt className="inline text-ink-hi">tortuosity — </dt>
            <dd className="inline">path length divided by straight-line displacement; how much the trajectory wanders per unit of progress.</dd>
          </div>
          <div>
            <dt className="inline text-ink-hi">energy drift — </dt>
            <dd className="inline">change in hidden-state norm across layers; adversarial prompts show different energy profiles.</dd>
          </div>
          <div>
            <dt className="inline text-ink-hi">directional stability — </dt>
            <dd className="inline">cosine similarity of successive step directions; aligned prompts keep heading somewhere.</dd>
          </div>
          <div>
            <dt className="inline text-ink-hi">windowing — </dt>
            <dd className="inline">features computed over sliding windows, not the whole prompt — the repo&apos;s own audit showed global features are diluted by harmless prefixes.</dd>
          </div>
        </dl>
      </details>
    </div>
  );
}
