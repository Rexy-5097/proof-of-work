import type { Project } from "../types";

const R = "https://github.com/Rexy-5097/ASTRA";
const DATASET_HASH = "f99b4b06f16952033b5445bb0682d059e9ea4c3f99320a05d31aebb25c2dbf58";

export const astra: Project = {
  slug: "astra",
  name: "ASTRA",
  caseNumber: 6,
  oneLiner: "Classifying variable stars with a pipeline that audits itself.",
  problem:
    "TESS produces light curves by the hundred thousand; classifying stellar variability by hand does not scale, and ML results in the literature are notoriously hard to reproduce — metrics logged during training quietly drift from what the shipped weights actually do.",
  invariant:
    "Every reported number is recomputed from the checkpoint weights and the hash-locked test set — not read from a training log.",
  approach:
    "An end-to-end pipeline from VSX/MAST acquisition through a dual-branch Hybrid CNN + Transformer (raw and phase-folded photometry), five-fold cross-validation across three seeds, temperature calibration, MC-dropout uncertainty, and ONNX export to a live web platform. A ground-truth audit re-derives the published metrics from artifacts; the dataset carries a SHA-256 fingerprint.",
  stack: ["Python", "PyTorch", "lightkurve", "ONNX", "Next.js", "Three.js"],
  verdicts: ["verified", "deployed", "research"],
  claims: [
    {
      id: "astra-acc",
      value: "78.17%",
      label: "TEST ACCURACY",
      detail: "95% CI [71.13, 85.21] on the held-out set of 142 stars — recomputed from checkpoint weights",
      verdict: "verified",
      evidence: [
        { label: "scientific integrity notice", href: `${R}#%EF%B8%8F-scientific-integrity-notice`, kind: "audit", verifiedAt: "2026-07-02" },
      ],
    },
    {
      id: "astra-f1",
      value: "0.7677",
      label: "MACRO F1",
      detail: "95% CI [0.6944, 0.8320], HybridTransformer (shared), 1,373,701 parameters",
      verdict: "verified",
      evidence: [
        { label: "model comparison table", href: `${R}#-key-results`, kind: "report", verifiedAt: "2026-07-02" },
      ],
    },
    {
      id: "astra-audit",
      value: "8/8",
      label: "GROUND-TRUTH AUDIT",
      detail: "all checks pass, zero mismatches between reported metrics and recomputed values",
      verdict: "verified",
      evidence: [
        {
          label: "integrity notice + dataset fingerprint",
          href: `${R}#%EF%B8%8F-scientific-integrity-notice`,
          kind: "audit",
          hash: DATASET_HASH,
          verifiedAt: "2026-07-02",
        },
      ],
    },
    {
      id: "astra-solar",
      value: "0.52",
      label: "SOLAR-LIKE F1 — FLAGGED",
      detail: "weakest class, under-represented (142 samples); explicitly marked not production-ready",
      verdict: "experimental",
      evidence: [
        { label: "per-class F1 table", href: `${R}#-key-results`, kind: "report", verifiedAt: "2026-07-02" },
      ],
    },
  ],
  decisions: [
    {
      id: "ADR-001",
      title: "Ship the shared variant, not the highest-scoring one.",
      context:
        "The 'separate' hybrid variant scored 84.51% test accuracy — six points above the 'shared' variant's 78.17%.",
      options: [
        { option: "Deploy 'separate' (84.51%)", rejected: true, reason: "more parameters, less interpretable attention, and the gap sits inside overlapping confidence intervals" },
        { option: "Deploy 'shared' (78.17%)", rejected: false, reason: "" },
      ],
      decision:
        "Production model = shared variant: better parameter efficiency, interpretable attention maps, honest CI-aware comparison. Both results stay published side by side.",
      consequences:
        "The headline number is lower than it could have been. That is the point: the README reports the choice and the alternatives' scores.",
    },
    {
      id: "ADR-002",
      title: "Hash-lock the dataset; audit from artifacts.",
      context: "Reproducibility claims are cheap; most 'accuracy' numbers cannot be re-derived a month later.",
      options: [
        { option: "Trust training logs", rejected: true, reason: "logs drift from artifacts; nobody re-runs them" },
        { option: "SHA-256 fingerprint + independent recompute", rejected: false, reason: "" },
      ],
      decision:
        "The 944-star dataset is fingerprinted; an audit script recomputes accuracy and F1 from checkpoint weights and test-set IDs. 8/8 checks, 0 mismatches.",
      consequences: "Slower to change the dataset (by design). Anyone can re-run the audit and catch drift.",
    },
  ],
  limitation:
    "Solar-like classification (F1 0.52) is not production-ready and is flagged as experimental in the repo — more data is required before those predictions mean anything scientifically.",
  links: [
    { label: "REPO", href: R },
    { label: "LIVE", href: "https://astra-platform-wine.vercel.app" },
  ],
  tier: 1,
  category: "research",
  year: "2026",
};
