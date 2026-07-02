import type { Project } from "../types";

const R = "https://github.com/Rexy-5097/DDSO";

export const ddso: Project = {
  slug: "ddso",
  name: "DDSO",
  caseNumber: 5,
  oneLiner: "An I/O scheduler that rewrites its own strategy.",
  problem:
    "No single disk-scheduling algorithm wins everywhere: FIFO is fair but seek-blind, SSTF minimizes head travel but starves distant requests, batching helps sequential loads and hurts random ones. Workloads change at runtime; static schedulers don't.",
  invariant:
    "Algorithm switches are deliberate: hysteresis and a cooldown window prevent the scheduler from thrashing between strategies on noisy telemetry.",
  approach:
    "A Linux block-layer elevator module (C) tracks seek distance variance in real time and switches between FIFO, SSTF, and BATCH when the variance signal crosses calibrated thresholds. Kernel tracepoints stream every switch and dispatch through a WebSocket bridge into a live Next.js dashboard — the kernel explains itself while it runs.",
  stack: ["C", "Linux kernel", "ftrace", "Node.js", "Next.js"],
  verdicts: ["verified", "deployed", "research"],
  claims: [
    {
      id: "ddso-algos",
      value: "3",
      label: "SCHEDULING STRATEGIES",
      detail: "FIFO, SSTF, BATCH — selected at runtime by the decision engine",
      verdict: "verified",
      evidence: [
        { label: "kernel module source", href: `${R}/tree/main/kernel`, kind: "code", verifiedAt: "2026-07-02" },
        { label: "README — decision engine", href: `${R}#readme`, kind: "readme", verifiedAt: "2026-07-02" },
      ],
    },
    {
      id: "ddso-signal",
      value: "σ²",
      label: "SWITCH SIGNAL",
      detail: "running seek variance (seek_total, seek_sq_total, sample_count) — cheap enough for the dispatch path",
      verdict: "verified",
      evidence: [
        { label: "README — variance engine", href: `${R}#readme`, kind: "readme", verifiedAt: "2026-07-02" },
      ],
    },
    {
      id: "ddso-trace",
      value: "trace_pipe",
      label: "KERNEL TELEMETRY PATH",
      detail: "trace_ddso_switch / trace_ddso_dispatch → WebSocket bridge → live dashboard",
      verdict: "verified",
      evidence: [
        { label: "backend bridge", href: `${R}/tree/main/backend`, kind: "code", verifiedAt: "2026-07-02" },
        { label: "validation artifacts", href: `${R}/tree/main/artifacts`, kind: "report", verifiedAt: "2026-07-02" },
      ],
    },
  ],
  decisions: [
    {
      id: "ADR-001",
      title: "Why seek variance as the signal?",
      context: "The decision engine runs in the kernel's dispatch path; the signal must be nearly free.",
      options: [
        { option: "Full workload classification (pattern mining)", rejected: true, reason: "too expensive for the hot path; belongs in userspace, adds latency to every dispatch" },
        { option: "Running seek-distance variance", rejected: false, reason: "" },
      ],
      decision:
        "Three counters updated per dispatch give a variance estimate that separates sequential, clustered, and random workloads well enough to pick a strategy.",
      consequences:
        "Coarser than a learned classifier — a deliberately dumb, fast signal in the kernel, with the fancy analysis pushed out to the dashboard.",
    },
    {
      id: "ADR-002",
      title: "Hysteresis and cooldown before any switch.",
      context: "Variance is noisy; naive thresholding would flip algorithms constantly, costing more than it saves.",
      options: [
        { option: "Switch immediately on threshold cross", rejected: true, reason: "thrashing — each switch has re-ordering cost and destroys locality" },
        { option: "Hysteresis band + cooldown window", rejected: false, reason: "" },
      ],
      decision: "A switch requires sustained evidence and a minimum dwell time in the current strategy.",
      consequences: "Slower to react to genuine regime changes — the cost of stability, chosen consciously.",
    },
  ],
  limitation:
    "Developed and validated against a WSL-hosted kernel with fio workloads; not benchmarked on bare-metal production storage. Latency-improvement numbers are therefore not published as claims.",
  links: [
    { label: "REPO", href: R },
    { label: "LIVE", href: "https://ddso.vercel.app" },
  ],
  tier: 1,
  category: "systems",
  year: "2026",
};
