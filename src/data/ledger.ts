export type LedgerStatus =
  | "deployed"
  | "research"
  | "closed"
  | "active"
  | "hackathon"
  | "practice";

export type LedgerCategory =
  | "backend"
  | "ai-ml"
  | "research"
  | "systems"
  | "product"
  | "tooling"
  | "practice";

export interface LedgerEntry {
  name: string;
  oneLiner: string;
  stack: string[];
  category: LedgerCategory;
  status: LedgerStatus;
  year: string;
  repo: string;
  live?: string;
  /** Deep-dive anchor on the home page, when the project is a chapter. */
  caseAnchor?: string;
}

const GH = "https://github.com/Rexy-5097";

/** All 17 public repositories — the complete archive, nothing curated out. */
export const ledger: LedgerEntry[] = [
  {
    name: "ASTRA",
    oneLiner: "Audited ML pipeline classifying variable stars from TESS light curves",
    stack: ["Python", "PyTorch", "ONNX", "Next.js"],
    category: "research",
    status: "deployed",
    year: "2026",
    repo: `${GH}/ASTRA`,
    live: "https://astra-platform-wine.vercel.app",
    caseAnchor: "#case-astra",
  },
  {
    name: "GEOFENCE-LLM",
    oneLiner: "Jailbreak detection from hidden-state trajectory geometry",
    stack: ["Python", "PyTorch", "Transformers"],
    category: "research",
    status: "research",
    year: "2025",
    repo: `${GH}/GEOFENCE-LLM`,
    caseAnchor: "#case-geofence-llm",
  },
  {
    name: "FurnitureOps",
    oneLiner: "Inventory backend: stock stays correct under concurrency and crashes",
    stack: ["TypeScript", "Next.js", "Postgres", "Redis"],
    category: "backend",
    status: "deployed",
    year: "2026",
    repo: `${GH}/FurnitureOps`,
    live: "https://furniture-ops.vercel.app",
    caseAnchor: "#case-furnitureops",
  },
  {
    name: "nexus-rtb-engine",
    oneLiner: "Real-time bidding engine: calibrated models, six risk layers, 0.15ms P99",
    stack: ["Python", "LightGBM", "Prometheus", "Grafana"],
    category: "backend",
    status: "research",
    year: "2026",
    repo: `${GH}/nexus-rtb-engine`,
    caseAnchor: "#case-nexus-rtb-engine",
  },
  {
    name: "DDSO",
    oneLiner: "Adaptive Linux I/O scheduler with live kernel telemetry",
    stack: ["C", "Linux kernel", "Node.js", "Next.js"],
    category: "systems",
    status: "deployed",
    year: "2026",
    repo: `${GH}/DDSO`,
    live: "https://ddso.vercel.app",
    caseAnchor: "#case-ddso",
  },
  {
    name: "Helios-Dx",
    oneLiner: "Null result: no quantum advantage under FHE constraints — published",
    stack: ["PyTorch", "PennyLane", "Concrete-ML"],
    category: "research",
    status: "closed",
    year: "2025",
    repo: `${GH}/Helios-Dx`,
    caseAnchor: "#interlude",
  },
  {
    name: "Raptor-AI",
    oneLiner: "Local-first voice AI operating layer for macOS with explainable decisions",
    stack: ["Python", "FastAPI", "Whisper", "Next.js"],
    category: "ai-ml",
    status: "active",
    year: "2026",
    repo: `${GH}/Raptor-AI`,
  },
  {
    name: "zkhealth-fhe",
    oneLiner: "Privacy-preserving EHR on an FHE-capable EVM chain; patient-held keys",
    stack: ["Solidity", "fhEVM", "Node.js", "Arweave"],
    category: "backend",
    status: "deployed",
    year: "2026",
    repo: `${GH}/zkhealth-fhe`,
    live: "https://zkhealth-live-2026.netlify.app/login",
  },
  {
    name: "apexos",
    oneLiner: "GPU-rendered global OSINT dashboard: flights, seismic, cyber, news",
    stack: ["TypeScript", "Next.js", "MapLibre GL", "Docker"],
    category: "product",
    status: "active",
    year: "2026",
    repo: `${GH}/apexos`,
  },
  {
    name: "Aegis-Edge",
    oneLiner: "Uncertainty-aware offline medical triage: distillation + OOD gate",
    stack: ["Python", "PyTorch", "TorchScript"],
    category: "ai-ml",
    status: "research",
    year: "2026",
    repo: `${GH}/Aegis-Edge`,
  },
  {
    name: "crypto-ai-decision-system",
    oneLiner: "Trading research: regime detection, strict risk engine, kill-switch guardian",
    stack: ["Python", "XGBoost", "ccxt"],
    category: "ai-ml",
    status: "research",
    year: "2025",
    repo: `${GH}/crypto-ai-decision-system`,
  },
  {
    name: "ai_code_reviewer",
    oneLiner: "RL environment for code-review agents — Meta Hackathon (OpenEnv)",
    stack: ["Python", "FastAPI", "Docker"],
    category: "ai-ml",
    status: "hackathon",
    year: "2026",
    repo: `${GH}/ai_code_reviewer_Meta_Hackathon`,
  },
  {
    name: "career-agent-system",
    oneLiner: "Zero-LLM-token job-portal scanner with a Go TUI pipeline dashboard",
    stack: ["Node.js", "Go", "Bubble Tea"],
    category: "tooling",
    status: "active",
    year: "2026",
    repo: `${GH}/career-agent-system`,
  },
  {
    name: "aegis-command",
    oneLiner: "Offline-first tactical dashboard: in-browser vision inference, PouchDB sync",
    stack: ["React", "Transformers.js", "PouchDB"],
    category: "product",
    status: "active",
    year: "2025",
    repo: `${GH}/aegis-command`,
  },
  {
    name: "RESONANCE",
    oneLiner: "Real-time sensor-fusion dashboard for environmental awareness",
    stack: ["React 19", "Vite", "Framer Motion"],
    category: "product",
    status: "active",
    year: "2025",
    repo: `${GH}/RESONANCE`,
  },
  {
    name: "productivity-system",
    oneLiner: "Personal productivity dashboard with time blocks and analytics",
    stack: ["JavaScript", "Chart.js"],
    category: "product",
    status: "deployed",
    year: "2026",
    repo: `${GH}/productivity-system`,
    live: "http://skill-deploy-afgh58eago.vercel.app",
  },
  {
    name: "DSA-Practice-500",
    oneLiner: "149 curated interview solutions from 500+ solved DSA problems",
    stack: ["C++17"],
    category: "practice",
    status: "practice",
    year: "2026",
    repo: `${GH}/DSA-Practice-500`,
  },
];
