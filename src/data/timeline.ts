export interface TimelineStage {
  date: string;
  domain: string;
  title: string;
  detail: string;
  repos: string[];
}

/**
 * The trajectory, told as escalation of difficulty — each stage takes on
 * a constraint the previous one didn't have.
 */
export const timeline: TimelineStage[] = [
  {
    date: "NOV 2025",
    domain: "RISK SYSTEMS",
    title: "Risk before returns.",
    detail:
      "A trading system where the regime-detection model mattered less than the guardian daemon and kill-switch built around it.",
    repos: ["crypto-ai-decision-system"],
  },
  {
    date: "DEC 2025",
    domain: "LLM SECURITY",
    title: "Reading a model's mind.",
    detail:
      "Jailbreak detection moved from classifying text to measuring the geometry of hidden-state trajectories — a signal attackers can't author.",
    repos: ["GEOFENCE-LLM", "Helios-Dx"],
  },
  {
    date: "JAN 2026",
    domain: "PRIVACY",
    title: "Privacy as architecture.",
    detail:
      "Patient-held keys on an FHE-capable chain, and an offline medical triage pipeline that defers to humans under uncertainty.",
    repos: ["zkhealth-fhe", "Aegis-Edge"],
  },
  {
    date: "FEB 2026",
    domain: "DISTRIBUTED SYSTEMS",
    title: "Correctness under load.",
    detail:
      "A sub-millisecond bidding engine with six risk layers, and an inventory backend whose one invariant survives concurrency and crashes.",
    repos: ["nexus-rtb-engine", "FurnitureOps"],
  },
  {
    date: "APR 2026",
    domain: "AGENTS",
    title: "Autonomy, explained.",
    detail:
      "A local-first voice agent with an explicit state machine and explainable decisions; an RL environment for training code-review agents.",
    repos: ["Raptor-AI", "ai_code_reviewer_Meta_Hackathon"],
  },
  {
    date: "MAY 2026",
    domain: "KERNEL",
    title: "Into the kernel.",
    detail:
      "A Linux block-layer scheduler that switches strategy at runtime from seek-variance telemetry — with hysteresis, cooldown, and live tracepoints.",
    repos: ["DDSO", "apexos"],
  },
  {
    date: "JUN 2026",
    domain: "RESEARCH PLATFORM",
    title: "Publication-grade.",
    detail:
      "A fully audited astrophysics ML pipeline: hash-locked data, recomputed metrics, calibrated uncertainty, live in-browser inference.",
    repos: ["ASTRA"],
  },
  {
    date: "JUL 2026",
    domain: "VERIFIABLE RESEARCH",
    title: "Evidence, enforced by the build.",
    detail:
      "A research platform over the Aditya-L1 solar X-ray archive where no figure is typed by a person — every number resolves from a committed artifact, and CI fails the build if one drifts. It published a null result.",
    repos: ["AdityaNet"],
  },
  {
    date: "AUG 2026",
    domain: "PROGRAM ANALYSIS",
    title: "Compiler problems, in Rust.",
    detail:
      "Cartograph resolves a call chain across three languages — partial evaluation of dynamic URLs, route canonicalisation, symbol-level matching — and refuses to draw an edge it cannot evidence.",
    repos: ["cartograph"],
  },
  {
    date: "NEXT",
    domain: "FUTURE WORK",
    title: "Toward publication.",
    detail:
      "Software engineering internships and new-grad roles. Cartograph is pre-alpha at M06 of 17 and continues; one research thread is headed toward formal write-up.",
    repos: [],
  },
];
