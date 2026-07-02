import type { Claim } from "./types";
import { assertEvidence } from "./assert";

const GH = "https://github.com/Rexy-5097";

/**
 * Engineering telemetry — instrumentation, not achievements. Every card
 * is a Claim with provenance; recount any of them yourself.
 */
export const telemetryClaims: Claim[] = [
  {
    id: "tel-repos",
    value: "17",
    label: "REPOSITORIES",
    detail: "public repositories, Nov 2025 – Jun 2026",
    verdict: "verified",
    evidence: [
      { label: "github profile", href: `${GH}?tab=repositories`, kind: "profile", verifiedAt: "2026-07-02" },
    ],
  },
  {
    id: "tel-research",
    value: "3",
    label: "RESEARCH SYSTEMS",
    detail: "ASTRA · GEOFENCE-LLM · Helios-Dx — reproducible, audited, one closed with citation metadata",
    verdict: "verified",
    evidence: [
      { label: "ASTRA", href: `${GH}/ASTRA`, kind: "readme", verifiedAt: "2026-07-02" },
      { label: "GEOFENCE-LLM", href: `${GH}/GEOFENCE-LLM`, kind: "readme", verifiedAt: "2026-07-02" },
      { label: "Helios-Dx", href: `${GH}/Helios-Dx`, kind: "readme", verifiedAt: "2026-07-02" },
    ],
  },
  {
    id: "tel-deploys",
    value: "4",
    label: "LIVE DEPLOYMENTS",
    detail: "ASTRA platform · FurnitureOps · zkhealth · DDSO dashboard",
    verdict: "deployed",
    evidence: [
      { label: "astra-platform (vercel)", href: "https://astra-platform-wine.vercel.app", kind: "code", verifiedAt: "2026-07-02" },
      { label: "furniture-ops (vercel)", href: "https://furniture-ops.vercel.app", kind: "code", verifiedAt: "2026-07-02" },
      { label: "zkhealth (netlify)", href: "https://zkhealth-live-2026.netlify.app/login", kind: "code", verifiedAt: "2026-07-02" },
      { label: "ddso (vercel)", href: "https://ddso.vercel.app", kind: "code", verifiedAt: "2026-07-02" },
    ],
  },
  {
    id: "tel-ci",
    value: "5",
    label: "CI PIPELINES",
    detail: "GitHub Actions workflows: ASTRA, apexos, nexus-rtb, crypto-ai, FurnitureOps",
    verdict: "verified",
    evidence: [
      { label: "e.g. FurnitureOps actions", href: `${GH}/FurnitureOps/actions`, kind: "ci", verifiedAt: "2026-07-02" },
      { label: "e.g. ASTRA workflows", href: `${GH}/ASTRA/tree/main/.github`, kind: "ci", verifiedAt: "2026-07-02" },
    ],
  },
  {
    id: "tel-tests",
    value: "50+",
    label: "VERIFICATION SCRIPTS",
    detail: "dedicated test/verify files: 19 in FurnitureOps, 31 in crypto-ai-decision-system, more elsewhere",
    verdict: "verified",
    evidence: [
      { label: "FurnitureOps scripts/", href: `${GH}/FurnitureOps/tree/main/scripts`, kind: "code", verifiedAt: "2026-07-02" },
      { label: "crypto-ai tests", href: `${GH}/crypto-ai-decision-system`, kind: "code", verifiedAt: "2026-07-02" },
    ],
  },
  {
    id: "tel-docs",
    value: "100+",
    label: "TECHNICAL DOCUMENTS",
    detail: "engineering logs, reports and design docs across repos: 55+ in ASTRA, 20+ in Helios-Dx, 23 in FurnitureOps",
    verdict: "verified",
    evidence: [
      { label: "ASTRA docs/", href: `${GH}/ASTRA/tree/main/docs`, kind: "report", verifiedAt: "2026-07-02" },
      { label: "nexus reports", href: `${GH}/nexus-rtb-engine`, kind: "report", verifiedAt: "2026-07-02" },
    ],
  },
  {
    id: "tel-langs",
    value: "8",
    label: "LANGUAGES IN PRODUCTION USE",
    detail: "Python · TypeScript · JavaScript · C · C++ · Solidity · Go · SQL",
    verdict: "verified",
    evidence: [
      { label: "github profile", href: GH, kind: "profile", verifiedAt: "2026-07-02" },
    ],
  },
  {
    id: "tel-dsa",
    value: "500+",
    label: "DSA PROBLEMS SOLVED",
    detail: "149 curated medium/hard C++ solutions published with complexity analysis",
    verdict: "verified",
    evidence: [
      { label: "DSA-Practice-500", href: `${GH}/DSA-Practice-500`, kind: "code", verifiedAt: "2026-07-02" },
      { label: "LeetCode profile", href: "https://leetcode.com/u/ApexRaptor_5097/", kind: "profile", verifiedAt: "2026-07-02" },
    ],
  },
];

assertEvidence(telemetryClaims, "data/telemetry.ts");
