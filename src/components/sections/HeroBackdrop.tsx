/**
 * Blueprint construction layer behind the hero (design brief 3B).
 * Server-rendered, zero JS: a fine grid, construction guides, and a
 * "repository topology" — 17 nodes, one per public repo. This is the
 * real content and the no-JS / reduced-motion fallback. When the global
 * WebGL particle field mounts (webgl/index.tsx), it hides the animated
 * topology SVG (`#hero-topology-static`) so the two don't overlap; the
 * grid and guides stay as the blueprint frame under the particles.
 */
import { TOPOLOGY_NODES as NODES, TOPOLOGY_EDGES as EDGES, TOPOLOGY_HUB_INDEX } from "@/data/repoTopology";

export function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* blueprint grid */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(900px 600px at 60% 40%, black 30%, transparent 100%)",
        }}
      />
      {/* construction guides */}
      <div className="absolute top-0 bottom-0 left-[var(--page-margin)] w-px bg-line opacity-60" />
      <div className="absolute top-[22%] right-0 left-0 h-px bg-line opacity-40" />

      {/* repository topology — static SSR truth; hidden by JS once the
          canvas layer (same graph, gentle procedural drift) takes over */}
      <svg
        id="hero-topology-static"
        viewBox="0 0 1000 640"
        className="absolute inset-0 h-full w-full opacity-[0.5] motion-safe:animate-[drift_60s_ease-in-out_infinite_alternate]"
        preserveAspectRatio="xMidYMid slice"
      >
        <g stroke="var(--line-strong)" strokeWidth="0.5">
          {EDGES.map(([a, b]) => {
            const na = NODES[a];
            const nb = NODES[b];
            if (!na || !nb) return null;
            return (
              <line key={`${a}-${b}`} x1={na[0]} y1={na[1]} x2={nb[0]} y2={nb[1]} />
            );
          })}
        </g>
        <g fill="var(--ink-lo)">
          {NODES.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={i === TOPOLOGY_HUB_INDEX ? 2.5 : 1.5} />
          ))}
        </g>
        {/* crosshair construction mark on the hub node */}
        <g stroke="var(--ink-lo)" strokeWidth="0.5" opacity="0.7">
          <line x1={418} y1={240} x2={442} y2={240} />
          <line x1={430} y1={228} x2={430} y2={252} />
        </g>
      </svg>
    </div>
  );
}
