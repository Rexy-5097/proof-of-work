import type { Project } from "../types";

const R = "https://github.com/Rexy-5097/GEOFENCE-LLM";

export const geofence: Project = {
  slug: "geofence-llm",
  name: "GEOFENCE-LLM",
  caseNumber: 4,
  oneLiner: "Jailbreak detection that attackers can't paraphrase around.",
  problem:
    "Text-level jailbreak filters are brittle: synonym substitution, encodings, and adversarial prefixes are all authored by the attacker, and all defeat classifiers that only read the prompt. Detection needs a signal the attacker cannot directly write.",
  invariant:
    "Fail closed — any internal error, unrecognized state, or ambiguous signal resolves to a block, never a pass-through.",
  approach:
    "Treat the model as a dynamical system. As a prompt moves through Llama-3.2-3B's layers, its hidden states trace a path; geometric features of that path (tortuosity, energy drift, directional stability) — computed over sliding windows, not one global trajectory — feed a state estimator, a risk engine, and an authority layer that maps risk to ALLOW, SLOW, CLARIFY, REFUSE, or HALT.",
  stack: ["Python", "PyTorch", "Transformers", "scikit-learn"],
  verdicts: ["verified", "research"],
  claims: [
    {
      id: "geo-recall",
      value: "0.66",
      label: "OBFUSCATED-PROMPT RECALL",
      detail: "measured on obfuscated jailbreaks the text baseline misses — published with its cost, below",
      verdict: "verified",
      evidence: [
        { label: "README — results and limitations", href: `${R}#readme`, kind: "report", verifiedAt: "2026-07-02" },
      ],
    },
    {
      id: "geo-fpr",
      value: "0.48",
      label: "FALSE-POSITIVE RATE",
      detail: "the honest number: too high for a standalone filter, published anyway as a research result",
      verdict: "experimental",
      evidence: [
        { label: "README — results and limitations", href: `${R}#readme`, kind: "report", verifiedAt: "2026-07-02" },
      ],
    },
    {
      id: "geo-layers",
      value: "5",
      label: "PROBED LAYERS",
      detail: "hidden states pulled from layers 5, 10, 15, 20, 24; mean-pooled per layer",
      verdict: "verified",
      evidence: [
        { label: "README — approach", href: `${R}#readme`, kind: "readme", verifiedAt: "2026-07-02" },
        { label: "extract_trajectories.py", href: `${R}/blob/main/extract_trajectories.py`, kind: "code", verifiedAt: "2026-07-02" },
      ],
    },
    {
      id: "geo-failclosed",
      value: "HALT",
      label: "DEFAULT ON ERROR",
      detail: "the authority layer's unrecognized-state branch blocks; there is no silent allow",
      verdict: "verified",
      evidence: [
        { label: "authority_interface.py", href: `${R}/blob/main/authority_interface.py`, kind: "code", verifiedAt: "2026-07-02" },
      ],
    },
  ],
  decisions: [
    {
      id: "ADR-001",
      title: "Why trajectory geometry, not text classification?",
      context: "Every text-level signal is under attacker control by definition.",
      options: [
        { option: "Prompt classifier over text", rejected: true, reason: "defeated by paraphrase, encodings, prefix injection — exactly the threat model" },
        { option: "Hidden-state trajectory geometry", rejected: false, reason: "" },
      ],
      decision:
        "Read the model's internals: adversarial prompts produce geometrically distinguishable paths even when their surface text is obfuscated.",
      consequences:
        "Requires access to model internals (white-box only), and inference cost grows with probing. Accepted: this is a defense layer for models you host, not a universal proxy.",
    },
    {
      id: "ADR-002",
      title: "Windowed signals over one global trajectory.",
      context:
        "The project's own phase-5.3 audit found whole-prompt trajectory features brittle: sensitive to prompt length and defeated by harmless prefixes.",
      options: [
        { option: "One global trajectory per prompt", rejected: true, reason: "the repo's own hardening audit documents the failure — length sensitivity, prefix dilution" },
        { option: "Sliding-window geometry features", rejected: false, reason: "" },
      ],
      decision: "Compute tortuosity, directional stability, energy drift and velocity variance over windows, then aggregate.",
      consequences:
        "More computation per prompt, and window size becomes a tunable. The failed architecture stays documented in architecture_hardening.md instead of being deleted.",
    },
  ],
  limitation:
    "A 0.48 false-positive rate makes this unsuitable as a standalone filter — the repo says so plainly. It is a research direction and a defense-in-depth layer, not a product claim.",
  links: [{ label: "REPO", href: R }],
  tier: 1,
  category: "research",
  year: "2025",
};
