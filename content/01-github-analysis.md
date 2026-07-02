# Phase 1A — GitHub Profile Analysis
**Profile:** [Rexy-5097](https://github.com/Rexy-5097) · Soumyadeb Tripathy · 17 substantive public repositories
**Analyzed:** July 2026 · Method: full file-tree inspection, language breakdowns, README audits, CI/test/docs scans, source spot-checks

---

## 1. The Signal That Matters Most

Across every serious repository, one pattern repeats — and it is rare enough to be the entire portfolio thesis:

**This engineer verifies his own claims and reports what is actually true.**

Evidence, directly from the repos:

- **ASTRA** independently recomputes its reported metrics from checkpoint weights ("Ground Truth Audit: All 8 checks PASS, 0 mismatches"), SHA-256 fingerprints its dataset, and *explicitly flags its weakest class* (Solar-like, F1 0.52) as not production-ready.
- **Helios-Dx** is a completed research project whose headline is a **null result**: "No consistent quantum advantage was observed." Closed at v1.0 with a CITATION.cff instead of being quietly abandoned or spun positive.
- **GEOFENCE-LLM** publishes its own unflattering numbers (obfuscated-prompt recall 0.66 at 0.48 FPR) alongside the admission that this makes it unsuitable as a standalone filter — and documents an earlier architecture its own audit found brittle.
- **FurnitureOps** ships 19 test/verify scripts (concurrency, idempotency, RLS, chaos) against a single stated invariant: no oversells, no lost updates.
- **nexus-rtb-engine** signs its model weights (`model_weights.pkl.sig`, `sign_model.py`) and ships calibration, stress-test, and economic reports as first-class artifacts.

Most portfolios claim. This GitHub **audits**. That distinction drives all content and creative direction downstream.

## 2. Technical Identity (Evidence-Backed)

| Theme | Supporting repos |
|---|---|
| **Backend correctness under concurrency & failure** | FurnitureOps (row-locking RPC, idempotency, circuit breaker, DLQ), nexus-rtb-engine (risk-control chain, PID pacing, budget circuit breaker), crypto-ai-decision-system (kill-switch guardian daemon) |
| **Applied ML with research rigor** | ASTRA (hybrid CNN+Transformer, CV across seeds, calibration, MC-dropout uncertainty), Aegis-Edge (distillation, OOD gating, MC dropout), Helios-Dx (capacity-matched ablation) |
| **AI safety & LLM security** | GEOFENCE-LLM (hidden-state trajectory geometry, fail-closed control loop), ai_code_reviewer (RL environment for review agents) |
| **Privacy-preserving computation** | zkhealth-fhe (fhEVM, client-side AES-256-GCM, on-chain access control), Helios-Dx (Concrete-ML FHE inference) |
| **Systems programming** | DDSO (Linux kernel I/O scheduler in C with runtime algorithm switching + tracepoint telemetry) |
| **Local-first / edge AI** | Raptor-AI (wake-word + Whisper fully local), aegis-command (in-browser YOLOS via Transformers.js, PouchDB offline sync), RESONANCE, Aegis-Edge |
| **Full-stack product delivery** | apexos (Next.js 16 + MapLibre WebGL OSINT dashboard), ASTRA platform (Next.js + Three.js + live ONNX inference), FurnitureOps, productivity-system |

**Languages by actual volume:** Python (dominant — ML/backend), TypeScript (Next.js products), JavaScript, C/C++ (kernel module, DSA), Solidity, Go (TUI dashboard).

**Infrastructure literacy:** GitHub Actions CI on 5 repos (ASTRA, apexos, nexus-rtb-engine, crypto-ai-decision-system, FurnitureOps); Docker on 8+; Prometheus/Grafana monitoring configs; systemd deployment docs; Vercel/Netlify/Render deployments (4 live URLs).

## 3. Project Tiering

### Tier 1 — Flagship (full case-study treatment)
1. **ASTRA** — Automated Stellar Transient Recognition & Analysis. End-to-end ML research pipeline (VSX/MAST data acquisition → hybrid CNN+Transformer → calibration → uncertainty → ONNX web deployment). 78.17% test accuracy [95% CI 71.13–85.21], macro F1 0.7677, hash-locked dataset of 944 stars, 8/8 audit checks, 55+ docs files, CI, live platform. *The most complete single artifact on the profile.*
2. **GEOFENCE-LLM** — LLM jailbreak detection from hidden-state trajectory geometry rather than text classification. Windowed geometric signals (tortuosity, energy drift) → state estimator → risk engine → fail-closed authority. Honest published limitations. *The most intellectually original.*
3. **FurnitureOps** — Inventory backend built around one invariant: stock stays correct under concurrent purchases, retries, partial failures. Redis queue + idempotency + `SELECT ... FOR UPDATE` RPC + circuit breaker + DLQ + Postgres RLS + edge security middleware. Live on Vercel, CI, 19 test scripts. *The strongest pure backend-engineering story.*
4. **nexus-rtb-engine** — Real-time bidding engine: LightGBM CTR/CVR/price models, isotonic calibration, 262K-dim hashed feature space, Lagrangian bid optimization, six-layer risk-control chain, PID pacing, P99 0.15 ms. Signed model artifacts, Grafana/Prometheus stack, extensive engineering reports. *The strongest performance-engineering story.*
5. **Raptor-AI** — Local-first voice AI operating layer for macOS: wake-word (ONNX) → Faster-Whisper STT → intent planner → OS automation, with adaptive alert learning and explainable decisions. Six-layer architecture, agent FSM, Next.js dashboard, Chrome-extension bridge. *The strongest agentic-AI story.*
6. **Helios-Dx** — Controlled audit of hybrid quantum-classical networks under noise + FHE constraints. Capacity-matched comparison, frozen ConvNeXt backbone, 768→4 bottleneck for FHE compatibility. **Published null result.** *The strongest scientific-integrity story — arguably the most memorable.*

### Tier 2 — Strong supporting work
7. **DDSO** — Linux kernel elevator module (C) that switches FIFO/SSTF/BATCH at runtime from seek-variance telemetry, with tracepoints → WebSocket → live Next.js dashboard. Live demo.
8. **zkhealth-fhe** — Privacy-preserving EHR on Inco fhEVM: patient-held keys, client-side AES-256-GCM, EIP-712 auth, Arweave storage, on-chain access control. Live demo. Honest labeling of the FL coordinator as a design prototype.
9. **apexos** — Real-time global OSINT dashboard (flights, seismic, CCTV, cyber threats) on Next.js 16 + MapLibre GL WebGL. CI, 279 MB Docker image, screenshots.
10. **Aegis-Edge** — Uncertainty-aware offline medical triage: EfficientNet-B3 → MobileNetV3 distillation (~2.9 MB int8), autoencoder OOD gate, MC-dropout deferral, CPU Grad-CAM.
11. **crypto-ai-decision-system** — Trading research system: XGBoost/LSTM regime detection, strict risk engine, separate guardian daemon with kill-switch, ccxt execution, 31 test files, audit reports.

### Tier 3 — Context & breadth (index treatment)
12. **ai_code_reviewer_Meta_Hackathon** — RL environment (OpenEnv/FastAPI) for training code-review agents; Meta Hackathon entry.
13. **career-agent-system** — Job-search automation: Node scanner hitting Greenhouse/Ashby/Lever APIs directly (zero LLM tokens) + Go/Bubble Tea TUI dashboard.
14. **aegis-command** — Offline-first tactical dashboard; in-browser YOLOS-Tiny inference; PouchDB sync.
15. **RESONANCE** — Real-time sensor-fusion dashboard UI (React 19, Framer Motion).
16. **productivity-system** — Deployed personal productivity dashboard (vanilla JS + Chart.js).
17. **DSA-Practice-500** — 149 curated C++ interview solutions (from 500+ solved), each with approach + complexity analysis. Supports the fundamentals story, not a project card.

## 4. Honest Weaknesses (to manage, not hide)

- **No stars/forks/external contributors yet** — GitHub Statistics section should show contribution intensity and code volume, not social proof.
- **No confirmed open-source contributions to external projects** — omit that claimed section from the IA rather than fake it.
- **Short public history** (account 2024, serious work Nov 2025 →) — reframed as a strength: *velocity*. Seventeen projects across kernel modules, FHE, RL, and astrophysics ML in ~8 months.
- **Housekeeping to fix before launch:** apexos homepage is a literal `{{YOUR_DOMAIN}}` placeholder; crypto-ai-decision-system README clone URL points to another username (`Himanish-18`) — clarify provenance/collaboration before featuring it prominently; RESONANCE README references `Start-Up-Inc/Resonance`.
- **Tone drift in a few READMEs** (e.g. "Enterprise-Grade", "defense-grade") conflicts with the evidence-first voice. Portfolio copy will not inherit it.

## 5. Timeline (from repo creation dates)

- **Nov 2025** — crypto-ai-decision-system (risk-managed trading research)
- **Dec 2025** — GEOFENCE-LLM · aegis-command · RESONANCE · Helios-Dx
- **Jan 2026** — Aegis-Edge · zkhealth-fhe
- **Feb 2026** — nexus-rtb-engine · FurnitureOps · productivity-system
- **Apr 2026** — DSA-Practice-500 · Meta Hackathon RL env · career-agent-system · Raptor-AI
- **May 2026** — DDSO (kernel) · apexos
- **Jun 2026** — ASTRA (flagship research pipeline)

Reading: a deliberate escalation — safety-critical ML → security research → production backends → systems programming → a full publication-grade research system.
