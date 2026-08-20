export interface CapabilityDomain {
  domain: string;
  technologies: string[];
  /** Repos that prove the domain — rendered as evidence links. */
  provenBy: { name: string; href: string }[];
}

const GH = "https://github.com/Rexy-5097";

/** No skill bars, no percentages — domains with the repos that prove them. */
export const capabilities: CapabilityDomain[] = [
  {
    domain: "BACKEND SYSTEMS",
    technologies: ["Node.js", "FastAPI", "Next.js API routes", "REST", "WebSockets", "Redis queues", "idempotency", "circuit breakers"],
    provenBy: [
      { name: "FurnitureOps", href: `${GH}/FurnitureOps` },
      { name: "nexus-rtb-engine", href: `${GH}/nexus-rtb-engine` },
    ],
  },
  {
    domain: "DISTRIBUTED COMPUTING",
    technologies: ["async queue architectures", "row-level locking", "PID pacing", "budget coordination", "dead-letter queues", "offline-first sync"],
    provenBy: [
      { name: "FurnitureOps", href: `${GH}/FurnitureOps` },
      { name: "aegis-command", href: `${GH}/aegis-command` },
    ],
  },
  {
    domain: "APPLIED MACHINE LEARNING",
    technologies: ["PyTorch", "LightGBM/XGBoost", "CNN+Transformer hybrids", "knowledge distillation", "isotonic & temperature calibration", "MC-dropout uncertainty", "ONNX deployment"],
    provenBy: [
      { name: "ASTRA", href: `${GH}/ASTRA` },
      { name: "Aegis-Edge", href: `${GH}/Aegis-Edge` },
    ],
  },
  {
    domain: "RESEARCH ENGINEERING",
    technologies: [
      "reproducible pipelines",
      "digest-addressed datasets",
      "build-time evidence gates",
      "ground-truth audits",
      "bootstrap confidence intervals",
      "null-result reporting",
    ],
    provenBy: [
      { name: "AdityaNet", href: `${GH}/AdityaNet` },
      { name: "ASTRA", href: `${GH}/ASTRA` },
      { name: "Helios-Dx", href: `${GH}/Helios-Dx` },
    ],
  },
  {
    domain: "SYSTEMS & PROGRAM ANALYSIS",
    technologies: [
      "Rust",
      "tree-sitter",
      "static analysis (symbol extraction, route canonicalisation)",
      "C",
      "C++17",
      "Linux kernel modules",
      "ftrace tracepoints",
    ],
    provenBy: [
      { name: "cartograph", href: `${GH}/cartograph` },
      { name: "DDSO", href: `${GH}/DDSO` },
    ],
  },
  {
    domain: "SECURITY & AI SAFETY",
    technologies: ["LLM jailbreak defense", "hidden-state interpretability", "fail-closed control loops", "CSP/HSTS hardening", "rate limiting", "EIP-712 auth"],
    provenBy: [
      { name: "GEOFENCE-LLM", href: `${GH}/GEOFENCE-LLM` },
      { name: "FurnitureOps", href: `${GH}/FurnitureOps` },
    ],
  },
  {
    domain: "PRIVACY ENGINEERING",
    technologies: ["fully homomorphic encryption (Concrete-ML, fhEVM)", "client-side AES-256-GCM", "on-chain access control", "local-first inference"],
    provenBy: [
      { name: "zkhealth-fhe", href: `${GH}/zkhealth-fhe` },
      { name: "Helios-Dx", href: `${GH}/Helios-Dx` },
    ],
  },
  {
    domain: "FRONTEND SYSTEMS",
    technologies: ["React 19", "Next.js 14–16", "TypeScript", "Tailwind CSS", "MapLibre GL / WebGL", "real-time WebSocket UIs"],
    provenBy: [
      { name: "apexos", href: `${GH}/apexos` },
      { name: "DDSO", href: `${GH}/DDSO` },
    ],
  },
];
