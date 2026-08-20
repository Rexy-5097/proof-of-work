import type { Claim } from "./types";
import { assertEvidence } from "./assert";

const GH = "https://github.com/Rexy-5097";

/** 01 / Thesis strip — the four numbers that teach the mechanic. */
export const thesisClaims: Claim[] = [
  {
    id: "thesis-p99",
    value: "0.15ms",
    label: "P99 LATENCY",
    detail: "nexus-rtb-engine request path: parse → 3 model inferences → 6 risk layers",
    verdict: "verified",
    evidence: [
      {
        label: "latency benchmark",
        href: `${GH}/nexus-rtb-engine/blob/main/benchmarks/latency_benchmark.py`,
        kind: "benchmark",
        verifiedAt: "2026-07-02",
      },
      {
        label: "README — system overview",
        href: `${GH}/nexus-rtb-engine#readme`,
        kind: "readme",
        verifiedAt: "2026-07-02",
      },
    ],
  },
  {
    id: "thesis-audit",
    value: "8/8",
    label: "AUDIT CHECKS",
    detail: "ASTRA ground-truth audit: reported metrics recomputed from checkpoint weights, 0 mismatches",
    verdict: "verified",
    evidence: [
      {
        label: "scientific integrity notice",
        href: `${GH}/ASTRA#%EF%B8%8F-scientific-integrity-notice`,
        kind: "audit",
        hash: "f99b4b06f16952033b5445bb0682d059e9ea4c3f99320a05d31aebb25c2dbf58",
        verifiedAt: "2026-07-02",
      },
    ],
  },
  {
    id: "thesis-systems",
    value: "23",
    label: "SYSTEMS SHIPPED",
    detail: "public repositories: Rust program analysis to publication-grade research, Nov 2025 – Aug 2026",
    verdict: "verified",
    evidence: [
      {
        label: "github profile",
        href: `${GH}?tab=repositories`,
        kind: "profile",
        verifiedAt: "2026-07-02",
      },
    ],
  },
  {
    id: "thesis-null",
    value: "2",
    label: "NULL RESULTS PUBLISHED",
    detail:
      "AdityaNet: ML gives no gain over a threshold detector. Helios-Dx: no quantum advantage. Both published at full weight.",
    verdict: "null",
    evidence: [
      {
        label: "AdityaNet findings",
        href: "https://adityanet-re1t.onrender.com/findings/",
        kind: "report",
        verifiedAt: "2026-08-21",
      },
      {
        label: "Helios-Dx disclaimers",
        href: `${GH}/Helios-Dx#%EF%B8%8F-important-disclaimers`,
        kind: "report",
        verifiedAt: "2026-07-02",
      },
    ],
  },
];

assertEvidence(thesisClaims, "data/claims.ts#thesisClaims");
