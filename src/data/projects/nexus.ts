import type { Project } from "../types";

const R = "https://github.com/Rexy-5097/nexus-rtb-engine";

export const nexus: Project = {
  slug: "nexus-rtb-engine",
  name: "Nexus-RTB",
  caseNumber: 2,
  oneLiner: "Every microsecond and every unit of budget accounted for.",
  problem:
    "A real-time bidding engine gets one bid request and a hard deadline. It must predict click-through, conversion, and clearing price, decide a bid that is economically sound, and enforce budget discipline — all inside a latency budget where a slow answer is the same as no answer.",
  invariant:
    "No bid leaves the engine without passing every risk control — EV gate, shading, pacing, profit cap, and budget circuit breaker.",
  approach:
    "Three calibrated LightGBM models (CTR, CVR, clearing price) read a 262,144-dimension hashed feature space. Expected value feeds a Lagrangian bid optimizer, then a six-layer risk chain shapes or kills the bid. The whole request path — parse, extract, infer, decide — executes in 0.15ms at P99.",
  stack: ["Python", "LightGBM", "Prometheus", "Grafana", "Docker"],
  verdicts: ["verified", "research"],
  claims: [
    {
      id: "rtb-p99",
      value: "0.15ms",
      label: "P99 REQUEST PATH",
      detail: "parse → 35 features → 3 model inferences → EV computation → 6 risk layers → response",
      verdict: "verified",
      evidence: [
        { label: "latency benchmark", href: `${R}/blob/main/benchmarks/latency_benchmark.py`, kind: "benchmark", verifiedAt: "2026-07-02" },
        { label: "README — architecture", href: `${R}#readme`, kind: "readme", verifiedAt: "2026-07-02" },
      ],
    },
    {
      id: "rtb-dims",
      value: "262K",
      label: "HASHED FEATURE SPACE",
      detail: "MurmurHash3 hashing trick, hybrid top-K + tail encoding",
      verdict: "verified",
      evidence: [
        { label: "README — model description", href: `${R}#readme`, kind: "readme", verifiedAt: "2026-07-02" },
      ],
    },
    {
      id: "rtb-risk",
      value: "6",
      label: "RISK CONTROL LAYERS",
      detail: "adaptive EV gate → win-prob shader → dynamic multiplier → PID pacing → profit cap → budget circuit breaker",
      verdict: "verified",
      evidence: [
        { label: "README — request path", href: `${R}#readme`, kind: "readme", verifiedAt: "2026-07-02" },
      ],
    },
    {
      id: "rtb-signed",
      value: "signed",
      label: "MODEL ARTIFACTS",
      detail: "weights ship with a cryptographic signature; deploys verify before serving",
      verdict: "verified",
      evidence: [
        { label: "model_weights.pkl.sig", href: `${R}/blob/main/src/model_weights.pkl.sig`, kind: "code", verifiedAt: "2026-07-02" },
        { label: "sign_model.py", href: `${R}/blob/main/scripts/sign_model.py`, kind: "code", verifiedAt: "2026-07-02" },
      ],
    },
  ],
  decisions: [
    {
      id: "ADR-001",
      title: "Why gradient boosting, not a neural model?",
      context: "The latency budget is sub-millisecond on CPU, and the feature space is sparse and categorical.",
      options: [
        { option: "Deep CTR model (DeepFM-class)", rejected: true, reason: "inference cost blows the latency budget without a GPU serving stack; marginal AUC gain on this data" },
        { option: "LightGBM with isotonic calibration per model", rejected: false, reason: "" },
      ],
      decision:
        "Three small LightGBM models (300 trees, depth 4) with per-model isotonic calibration on validation data.",
      consequences:
        "Probabilities are trustworthy enough to do economics on — EV math needs calibrated inputs, not just good ranking. The ceiling on raw accuracy is accepted.",
    },
    {
      id: "ADR-002",
      title: "Why PID pacing instead of even spend?",
      context: "Budgets must survive bursty traffic without either exhausting early or under-delivering.",
      options: [
        { option: "Static per-minute spend caps", rejected: true, reason: "oscillates under bursty auctions; wastes budget in quiet periods" },
        { option: "PID controller tracking spend trajectory", rejected: false, reason: "" },
      ],
      decision:
        "A PID pacing controller adjusts bid aggressiveness continuously, with a hard budget circuit breaker behind it as the last line.",
      consequences:
        "Two knobs to tune (controller gains, breaker thresholds) — documented in the monitoring stack with Grafana dashboards rather than left as folklore.",
    },
  ],
  limitation:
    "Evaluated in a simulation/replay environment against auction datasets — the disciplines are production-grade; the traffic is not production traffic.",
  links: [{ label: "REPO", href: R }],
  tier: 1,
  category: "backend",
  year: "2026",
};
