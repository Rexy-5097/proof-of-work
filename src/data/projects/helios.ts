import type { Project } from "../types";

const R = "https://github.com/Rexy-5097/Helios-Dx";

/** The interlude. Rendered by <Interlude>, not <ChapterShell>. */
export const helios: Project = {
  slug: "helios-dx",
  name: "Helios-Dx",
  oneLiner: "The experiment that said no.",
  problem:
    "Do variational quantum circuits offer any advantage over classical layers for privacy-preserving medical inference under FHE constraints?",
  invariant:
    "Capacity-matched comparison: same frozen ConvNeXt backbone, same 768→4 bottleneck, same optimizer and seeds — the only variable is the classification head.",
  approach:
    "A 'split-compute' pipeline: classical feature extraction feeding a swappable head — Linear(4→2) classical vs a 4-qubit VQC — compiled for homomorphic execution with Concrete-ML, evaluated under simulated noise.",
  stack: ["PyTorch", "PennyLane", "Concrete-ML", "Docker"],
  verdicts: ["null", "closed"],
  claims: [
    {
      id: "hx-null",
      value: "none",
      label: "QUANTUM ADVANTAGE OBSERVED",
      detail: "no consistent advantage over classical baselines; architectures functionally equivalent",
      verdict: "null",
      evidence: [
        { label: "disclaimers — null result", href: `${R}#%EF%B8%8F-important-disclaimers`, kind: "report", verifiedAt: "2026-07-02" },
      ],
    },
    {
      id: "hx-closed",
      value: "v1.0",
      label: "CLOSED AND CITABLE",
      detail: "study completed, closed, and published with citation metadata rather than quietly abandoned",
      verdict: "closed",
      evidence: [
        { label: "CITATION.cff", href: `${R}/blob/main/CITATION.cff`, kind: "report", verifiedAt: "2026-07-02" },
      ],
    },
    {
      id: "hx-bottleneck",
      value: "768→4",
      label: "FHE BOTTLENECK",
      detail: "extreme dimensionality reduction so the trainable head (~30 params) fits homomorphic compilation",
      verdict: "verified",
      evidence: [
        { label: "README — architecture", href: `${R}#readme`, kind: "readme", verifiedAt: "2026-07-02" },
      ],
    },
  ],
  decisions: [
    {
      id: "ADR-001",
      title: "Publish the null result.",
      context: "Months of work produced no advantage. The convenient options were reframing or silence.",
      options: [
        { option: "Reframe as a positive ('novel hybrid pipeline')", rejected: true, reason: "would be marketing, not science" },
        { option: "Abandon quietly", rejected: true, reason: "the negative is informative — it saves the next person the experiment" },
        { option: "Close at v1.0, disclaim clearly, make it citable", rejected: false, reason: "" },
      ],
      decision: "The README leads with the disclaimers: null result, simulation-only, not clinically validated.",
      consequences: "A weaker headline and a stronger record.",
    },
  ],
  limitation:
    "Quantum circuits ran on PennyLane's default.mixed simulator only — no hardware claims. Not clinically validated; a systems artifact, not a medical device.",
  links: [
    { label: "REPO", href: R },
    { label: "CITATION", href: `${R}/blob/main/CITATION.cff` },
  ],
  tier: 1,
  category: "research",
  year: "2025",
};
