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
    value: "17",
    label: "SYSTEMS SHIPPED",
    detail: "public repositories: kernel module to publication-grade ML, Nov 2025 – Jun 2026",
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
    value: "1",
    label: "NULL RESULT PUBLISHED",
    detail: "Helios-Dx: no consistent quantum advantage observed — closed at v1.0, citable",
    verdict: "null",
    evidence: [
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
