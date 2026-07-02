import type { Principle } from "./types";

const GH = "https://github.com/Rexy-5097";

/** The four operating constraints (content/02-portfolio-content.md). */
export const principles: Principle[] = [
  {
    id: "P-01",
    title: "Fail closed.",
    body:
      "When a system can't decide safely, it blocks, defers, or hands off to a human — it never guesses. Errors and unrecognized states resolve to the safe side by construction.",
    provenRepos: [
      { name: "GEOFENCE-LLM", href: `${GH}/GEOFENCE-LLM` },
      { name: "Aegis-Edge", href: `${GH}/Aegis-Edge` },
      { name: "crypto-ai-decision-system", href: `${GH}/crypto-ai-decision-system` },
    ],
  },
  {
    id: "P-02",
    title: "Correctness is a database property, not an application promise.",
    body:
      "Invariants live where they cannot be bypassed: row locks, row-level security, atomic RPCs, on-chain access control. Application code may misbehave; the invariant holds anyway.",
    provenRepos: [
      { name: "FurnitureOps", href: `${GH}/FurnitureOps` },
      { name: "zkhealth-fhe", href: `${GH}/zkhealth-fhe` },
    ],
  },
  {
    id: "P-03",
    title: "Evidence over claims.",
    body:
      "Metrics are recomputed from artifacts, datasets are fingerprinted, models are signed, and null results are published. A number that can't be re-derived doesn't ship.",
    provenRepos: [
      { name: "ASTRA", href: `${GH}/ASTRA` },
      { name: "Helios-Dx", href: `${GH}/Helios-Dx` },
      { name: "nexus-rtb-engine", href: `${GH}/nexus-rtb-engine` },
    ],
  },
  {
    id: "P-04",
    title: "Local-first when it matters.",
    body:
      "Privacy-sensitive and availability-critical processing stays on the device. The network is an optimization, not a dependency.",
    provenRepos: [
      { name: "Raptor-AI", href: `${GH}/Raptor-AI` },
      { name: "aegis-command", href: `${GH}/aegis-command` },
      { name: "Aegis-Edge", href: `${GH}/Aegis-Edge` },
    ],
  },
];
