# Phase 1B — Portfolio Content
All copy below is grounded in repository evidence. Nothing invented. Voice: precise, calm, evidence-first — the voice already present in the profile README ("I'd rather report a negative result honestly than round a number up").

---

## Positioning Statement (the one-liner)

> **I build software that stays correct when things fail — and I publish the evidence.**

Alternates (pick during Phase 2):
- "Systems that survive concurrency, failure, and scrutiny."
- "Engineering measured by audits, not adjectives."

## Professional Biography (~100 words)

Soumyadeb Tripathy is a computer science engineer focused on backend systems, distributed computing, and applied AI. His work centers on a single discipline: software must stay correct under concurrency, partial failure, and adversarial input — and its claims must survive independent verification. He has built a Linux kernel I/O scheduler, a sub-millisecond real-time bidding engine, privacy-preserving healthcare infrastructure on fully homomorphic encryption, an LLM jailbreak detector that reads model internals instead of text, and a publication-grade astrophysics ML pipeline whose metrics are recomputed from checkpoint weights. He is completing a B.Tech in Computer Science and Engineering at Lovely Professional University, working toward backend and AI systems engineering roles.

## Personal Story (About section, ~180 words)

Most software works until it meets reality: two requests arriving at once, a network that drops mid-transaction, a benchmark nobody re-ran. I got interested in the moment things break — and in what it takes to build systems that don't.

That interest shaped everything I've built. An inventory backend whose entire design exists to make one guarantee hold — no oversells, no lost updates — under concurrent purchases and crashed workers. A bidding engine where six layers of risk controls stand between a model's prediction and real money. A jailbreak detector that doesn't trust text, because attackers control text; it reads the geometry of the model's hidden states instead. A kernel module that watches its own seek variance and switches scheduling algorithms at runtime.

The other habit I've kept is reporting what's actually true. My astrophysics pipeline ships a ground-truth audit that recomputes every published number from checkpoint weights. My quantum-ML study concluded with a null result — no advantage observed — and I published it as exactly that. Numbers you can't verify are marketing. I'd rather show the audit.

## Engineering Philosophy (four principles — these become a portfolio section)

1. **Fail closed.** When a system can't decide safely, it should block, defer, or hand off to a human — never guess. (GEOFENCE-LLM's authority layer, Aegis-Edge's OOD gate and uncertainty deferral, the crypto guardian's kill-switch.)
2. **Correctness is a database property, not an application promise.** Invariants live where they can't be bypassed: row locks, RLS policies, atomic RPCs, on-chain access control. (FurnitureOps, zkhealth-fhe.)
3. **Evidence over claims.** Metrics get recomputed, datasets get fingerprinted, models get signed, null results get published. (ASTRA's audit, Helios-Dx, nexus-rtb's signed weights.)
4. **Local-first when it matters.** Privacy-sensitive and availability-critical processing stays on-device; the network is an optimization, not a dependency. (Raptor-AI, aegis-command, Aegis-Edge, RESONANCE.)

## Technical Strengths / Core Expertise

- **Backend & distributed systems** — async queue architectures, idempotency, circuit breakers, dead-letter queues, row-level locking, PID-controlled pacing, budget coordination, sub-millisecond request paths
- **Applied machine learning** — CNN/Transformer hybrids, gradient boosting, knowledge distillation, calibration (isotonic, temperature), uncertainty quantification (MC dropout), ONNX/TorchScript deployment
- **AI safety & LLM security** — hidden-state interpretability, adversarial robustness evaluation, fail-closed control loops, RL environments for agent evaluation
- **Privacy-preserving computation** — fully homomorphic encryption (Concrete-ML, fhEVM), client-side encryption architectures, zero-knowledge concepts, on-chain access control
- **Systems programming** — Linux kernel modules, block-layer schedulers, tracepoint instrumentation, C/C++
- **Full-stack product engineering** — Next.js/React/TypeScript, WebGL mapping, real-time WebSocket pipelines, three deployed products

## Skills by Category

| Category | Stack |
|---|---|
| Languages | Python, TypeScript, JavaScript, C, C++, Solidity, Go, SQL |
| Backend | FastAPI, Node.js, Express, Next.js API routes, WebSockets, REST |
| Data | PostgreSQL (RLS, RPCs), Redis/Upstash, MongoDB, Supabase, TimescaleDB, Arweave |
| ML/AI | PyTorch, scikit-learn, LightGBM/XGBoost, Hugging Face Transformers, PennyLane, ONNX, Faster-Whisper |
| Infra | Docker, GitHub Actions, Prometheus, Grafana, systemd, Vercel/Netlify/Render, Nix (exposure) |
| Frontend | React 19, Next.js 14–16, Tailwind CSS, Framer Motion, Three.js, MapLibre GL, Chart.js |
| Security/Privacy | FHE, EIP-712 auth, AES-256-GCM client-side encryption, CSP/HSTS hardening, rate limiting |
| Fundamentals | 500+ DSA problems solved (149 curated C++ solutions with complexity analysis) |

## Professional Timeline (narrative arc)

- **Nov 2025 — Risk before returns.** crypto-ai-decision-system: regime detection mattered less than the guardian daemon and kill-switch built around it.
- **Dec 2025 — Reading a model's mind.** GEOFENCE-LLM: jailbreak detection moved from text to hidden-state geometry. Plus three edge/offline dashboards and the start of Helios-Dx.
- **Jan 2026 — Privacy as architecture.** zkhealth-fhe (patient-held keys, on-chain enforcement) and Aegis-Edge (uncertainty-aware offline triage).
- **Feb 2026 — Correctness under load.** nexus-rtb-engine (0.15 ms P99) and FurnitureOps (atomic stock under concurrency).
- **Apr 2026 — Agents and automation.** Meta Hackathon RL environment for code-review agents; Raptor-AI local-first voice OS layer; career-agent tooling.
- **May 2026 — Into the kernel.** DDSO: an adaptive Linux I/O scheduler with live telemetry. Plus apexos, a GPU-rendered OSINT dashboard.
- **Jun 2026 — Publication-grade.** ASTRA: a fully audited, reproducible ML pipeline for stellar classification, deployed with live in-browser inference.

## Featured Project Copy (case-study one-liners + impact statements)

**ASTRA** — *Classifying variable stars with a pipeline that audits itself.*
Hybrid CNN+Transformer over TESS photometry; 78.17% test accuracy (95% CI 71.13–85.21%) on a hash-locked, 944-star dataset; every reported metric independently recomputed from checkpoint weights; deployed with live ONNX inference.

**GEOFENCE-LLM** — *Jailbreak detection that attackers can't paraphrase around.*
Treats an LLM as a dynamical system: windowed geometric features of hidden-state trajectories feed a fail-closed risk pipeline. Published its own limitation honestly: recall 0.66 at 0.48 FPR on obfuscated prompts — a research direction, not a product claim.

**FurnitureOps** — *One invariant, defended end to end.*
Stock counts stay correct under concurrent purchases, retries, and crashed workers: idempotency keys → Redis queue → row-locking atomic RPC → audit log in the same transaction, with circuit breaker and dead-letter queue. Verified by dedicated concurrency, idempotency, RLS, and chaos test scripts.

**nexus-rtb-engine** — *Every microsecond and every rupee accounted for.*
Second-price auction bidding: three calibrated LightGBM models, Lagrangian bid optimization, and a six-layer risk chain (EV gate → shading → multiplier → PID pacing → profit cap → circuit breaker) at 0.15 ms P99, with signed model artifacts and a Grafana/Prometheus stack.

**Raptor-AI** — *A voice assistant that doesn't phone home.*
Wake-word, speech-to-text, and TTS run entirely on-device; a finite-state-machine agent plans intents, automates macOS, monitors system and network health, learns alert priorities from feedback, and explains every decision it makes.

**Helios-Dx** — *The experiment that said no — published anyway.*
Capacity-matched evaluation of variational quantum circuits vs. classical heads for FHE-compatible medical inference. Result: no consistent quantum advantage. Closed at v1.0, citable, reproducible — because negative results are results.

**DDSO** — *An I/O scheduler that rewrites its own strategy.*
Linux block-layer elevator module (C) switching FIFO/SSTF/BATCH at runtime from seek-variance telemetry, with hysteresis and cooldown; kernel tracepoints stream through a WebSocket bridge into a live dashboard.

**zkhealth-fhe** — *Health records where the patient holds the keys.*
EHR platform on an FHE-capable EVM chain: AES-256-GCM encryption in the browser before upload, Arweave permanence, EIP-712 wallet auth, and access control enforced by contracts rather than a trusted backend.

*(Tier-2/3 short descriptions for the project index: apexos, Aegis-Edge, crypto-ai-decision-system, ai_code_reviewer, career-agent-system, aegis-command, RESONANCE, productivity-system — one sentence each, drawn from §3 of the analysis.)*

## Problem-Solving Approach / Development Workflow

1. **State the invariant first.** Every project begins with the guarantee it must keep (no oversells; fail closed; keys never leave the device).
2. **Design the failure path before the happy path.** Retries, DLQs, circuit breakers, kill-switches, OOD gates are architecture, not afterthoughts.
3. **Instrument everything.** Tracepoints, Prometheus metrics, engineering logs, phase-by-phase reports.
4. **Audit the result.** Recompute metrics from artifacts, fingerprint datasets, sign models, attack your own architecture and document what broke.
5. **Report honestly.** Confidence intervals over point estimates; limitations in the README, not the appendix; null results published.

## Achievements (evidence-backed only)

- Published a fully audited ML research pipeline (ASTRA): hash-locked dataset, CI, 8/8 ground-truth checks, live deployment
- Authored and closed a null-result research study with citation metadata (Helios-Dx)
- Built a working Linux kernel scheduler module with live telemetry (DDSO)
- Achieved 0.15 ms P99 request path in a multi-model bidding engine (nexus-rtb-engine)
- Meta Hackathon: RL environment for AI code-review agents (OpenEnv)
- 500+ DSA problems solved; 149 curated C++ solutions published
- 4 live deployed products (ASTRA platform, FurnitureOps, zkhealth, DDSO dashboard)

## Future Goals

Backend and AI-systems engineering roles; continued research in LLM security (hidden-state interpretability) and privacy-preserving computation; taking one research thread (GEOFENCE-LLM or ASTRA) toward formal publication.

## Contact

- Email: soumyadeb043@gmail.com
- GitHub: https://github.com/Rexy-5097
- LinkedIn: https://www.linkedin.com/in/soumyadeb-tripathy/
- LeetCode: https://leetcode.com/u/ApexRaptor_5097/
