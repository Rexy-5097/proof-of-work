# Phase 2.4 — Scroll Narrative Map & Wireframes
Desktop (1440) → tablet (768–1279) → mobile (≤767). IA unchanged from Phase 1 except three approved additions: **Decision Records** inside chapters, **Beyond the Code** section, **/engineering** journal route.

---

## Scroll Narrative Map (the audit script)

| # | Section | Narrative beat | Audit-rail state | Ambient |
|---|---|---|---|---|
| 00 | Landing | **The Claim is made** | rail boots, all ◇ | Act I blue |
| 01 | Thesis strip | First evidence stamps — trust mechanic taught | 01 ◆ | |
| 02 | About | The engineer behind the claim | 02 ◆ | |
| 03 | Principles | The rules the audit will test against | 03 ◆ | |
| 04 | Evidence (6 chapters) | **The examination** — bulk of scroll | 04 fills fractionally per chapter | Act II neutral |
| 05 | Interlude — Null Result | The credibility peak: honesty proven | 05 stamps ◈ flag (the only non-green check) | dimmed |
| 06 | Timeline | Trajectory: how fast this happened | 06 ◆ | Act III green tint begins |
| 07 | Index | The full ledger, filterable | 07 ◆ | |
| 08 | Capabilities | Instrumentation available | 08 ◆ | |
| 08b | Beyond the Code | The person (brief, human) | — (sub-section) | |
| 09 | Telemetry | Live sourced metrics | 09 ◆ | |
| 10 | Contact | **The verdict → open channel** | 10 ◆ → rail shows `AUDIT COMPLETE 10/10` | |
| — | Footer/Colophon | The site audits itself (build hash, source) | | |

Transitions between acts get the only three "cinematic" moments (see 06-motion). Everything else is local reveals.

---

## Section Wireframes (desktop 1440, 12-col)

### 00 · Landing
```
|rail| [seal] SOUMYADEB TRIPATHY            WORK ENGINEERING INDEX CONTACT |
|    |                                                                     |
|    |  col 2-11:                                                          |
|    |  PROOF OF WORK                        <- mono label, small          |
|    |  I build software that stays          <- Newsreader --t-display     |
|    |  correct when things fail —                                         |
|    |  and I publish the evidence.          <- "evidence." gets scan+seal |
|    |                                                                     |
|    |  Backend systems · Applied AI · B.Tech CSE     <- ink-md            |
|    |  [ EXAMINE THE EVIDENCE ↓ ]  [ OPEN CHANNEL ]                       |
|    |                                                                     |
|    |  bottom-left: BUILD a3f9c21 ◆ VERIFIED   bottom-right: scroll cue   |
```
Boot sequence ≤1.2s total; the site's own commit hash verifying is the visitor's first Provenance encounter. No 3D, no image — typography is the hero.
**Tablet:** same, margins 48px. **Mobile:** display type at clamp floor, buttons stack full-width, build hash moves to footer.

### 01 · Thesis strip
Four Claims in a hairline-ruled row (col 2-11): `0.15ms P99` · `8/8 AUDIT CHECKS` · `17 SYSTEMS` · `1 NULL RESULT`. Each verifies with 120ms stagger on entry; each has Provenance. Beneath, one ink-md sentence: "Every number on this site links to the artifact that produced it. Hover any ◆."  *(teaches the mechanic explicitly, once)*.
**Mobile:** 2×2 grid.

### 02 · About
Two columns: left (col 2-6) `02 / THE ENGINEER` label + Newsreader h1 "I got interested in the moment things break." Right (col 7-11): story prose (~180w, 68ch), ending with mono signature block (name · location · `CURRENTLY: B.Tech CSE, LPU` · `SEEKING: BACKEND / AI SYSTEMS ROLES`). Optional portrait: small, monochrome, hairline-framed like an ID badge — not a hero image.
**Mobile:** stacks, headline first.

### 03 · Principles
`03 / OPERATING CONSTRAINTS` label. Four numbered rows (not cards): mono number `P-01` + Inter 500 principle ("Fail closed.") + ink-md one-liner + right-aligned mono list of proving repos (each a link). Row hover: cursor-light + proving repos brighten. Rows reveal sequentially.
**Mobile:** stack; proving repos wrap under.

### 04 · Evidence — six `<Chapter>`s
Chapter enters with header pinned briefly while evidence panel assembles:
```
|rail|  CASE 03 / GEOFENCE-LLM          VERIFIED ◆ | RESEARCH             |
|    |                                                                     |
|    |  col 2-6 (narrative):            col 7-12 (evidence panel, E1):    |
|    |  Jailbreak detection that        ┌──────────────────────────────┐  |
|    |  attackers can't paraphrase      │ [architecture diagram         │  |
|    |  around.        <- Newsreader    │  draws in dependency order]   │  |
|    |                                  │                               │  |
|    |  THE PROBLEM   <- mono label     │ RECALL 0.66 ◆  FPR 0.48 ◆     │  |
|    |  prose…                          │ LAYERS 5,10,15,20,24 ◆        │  |
|    |  THE INVARIANT                   │ ▸ ADR-001 WHY GEOMETRY, NOT   │  |
|    |  ┌ mono contract block ┐         │   TEXT CLASSIFICATION?        │  |
|    |  │ fail closed: any     │        │ ▸ ADR-002 WHY WINDOWED?       │  |
|    |  │ error → block        │        │ ⚠ LIMITATION: not a stand-    │  |
|    |  └──────────────────────┘        │   alone filter                │  |
|    |                                  │ [REPO] [DEEP DIVE →]          │  |
|    |                                  └──────────────────────────────┘  |
```
Chapter order: FurnitureOps → nexus-rtb → GEOFENCE → ASTRA → DDSO → (interlude) — Helios-Dx *is* the interlude; DDSO hands into it. Raptor-AI + zkhealth as two condensed half-width "extended evidence" cards after the interlude.
Per-chapter evidence-panel hero varies by project: FurnitureOps = animated queue→lock→ledger schematic · nexus-rtb = latency waterfall (0.15ms) · GEOFENCE = trajectory path visual (2D projection of hidden-state path, from repo plots) · ASTRA = phase-folded light curve drawing itself + class F1 bars (incl. caution-flagged Solar-like) · DDSO = seek-variance graph with algorithm-switch markers.
**Tablet:** narrative stacks above panel; no pinning. **Mobile:** same, diagrams h-scroll; ADRs collapsed by default; metrics 2-up.

### 05 · Interlude (wireframe deliberately empty)
```
            (near-black, rail dimmed, no nav CTA)

                 The experiment that said no.      <- Newsreader italic

        HYPOTHESIS  quantum advantage under FHE constraints
        RESULT      none observed — capacity-matched, seeded
        ACTION      published anyway, closed at v1.0, citable

                      ◈ NULL RESULT — PUBLISHED

                  [HELIOS-DX REPO]  [CITATION.CFF]
```

### 06 · Timeline
`06 / TRAJECTORY`. Horizontal thread with 7 nodes (Nov 25 → Jun 26), scroll-scrubbed: thread draws, nodes stamp, active node expands a two-line detail. Caption row: "8 months · kernel modules to publication-grade ML."
**Mobile:** vertical thread, left-aligned.

### 07 · Index
`07 / THE LEDGER` + filter chips + 17 `<IndexTable>` rows + footer row `TOTAL: 17 SYSTEMS · 8 LANGUAGES · 4 DEPLOYED`. Rows link to repo (Tier 3) or `/work/[slug]` (Tier 1).
**Mobile:** rows become two-line cells; chips h-scroll.

### 08 · Capabilities + Beyond
Skill groups as instrument readout: 6 hairline columns (Languages / Backend / Data / ML·AI / Infra / Security), mono lists, no proficiency bars (unverifiable = banned). Fundamentals Claim beneath: `500+ DSA PROBLEMS ◆` → Provenance links repo + LeetCode.
Then `<BeyondGrid>` under its own micro-label `08.1 / BEYOND THE CODE`.
**Mobile:** 2-col accordion groups.

### 09 · Telemetry
`09 / ENGINEERING TELEMETRY` + 8 `<TelemetryGrid>` Claim-cards: repositories 17 · live deployments 4 · research systems 3 · CI pipelines 5 · verification scripts 50+ · technical documents 100+ · languages 8 · DSA 500+. Footer line: `SOURCE: github.com/Rexy-5097 — recount any of these yourself.`
**Mobile:** 2-up.

### 10 · Contact + Colophon
```
  AUDIT COMPLETE — 10/10 SECTIONS VERIFIED ◆        <- rail state mirrored
  Newsreader h1: "The evidence is in. Your move."
  [ TRANSMIT A MESSAGE ]  (form: email + message)
  soumyadeb043@gmail.com · GitHub · LinkedIn · LeetCode · RESUME.PDF
  ───────────────────────────────────────────────
  COLOPHON: Next.js · self-audited · source ↗ · BUILD a3f9c21 ◆ ·
  DEPLOYED 2026-07-02T14:11Z · LICENSE MIT
```

---

## Secondary Routes

### `/work/[slug]` — case-study deep dive
Article-width (68ch) + full-bleed diagram breaks. Structure per project: header (title, verdict badges, stack, links) → Problem → Invariant → Architecture (full diagram + prose) → Engineering decisions (all ADRs expanded) → Failure handling → Verified metrics (Claims table w/ CIs) → Limitations (caution panel) → Outcome → prev/next case footer. Sticky right mini-TOC ≥1280.

### `/engineering` — the journal
Index: hairline-ruled article list (`NO. 001` + Newsreader title + abstract + meta). Article: Paper-mode toggle, 68ch, footnotes, CodeBlocks, "claims in this article" verification summary at top. Launch with 3 pieces (from existing repo docs): *Publishing a Null Result* (Helios-Dx) · *One Invariant, Defended End to End* (FurnitureOps) · *Reading a Model's Mind* (GEOFENCE).

### `/resume` — print-first single page, mono/Inter only, no motion.

---

## Open design decisions for your review
1. **Portrait in About:** include a photo (ID-badge treatment) or stay fully typographic?
2. **Sound:** a single sub-100ms tick on seal stamps (off by default, toggle in footer) — include the affordance or drop sound entirely? My recommendation: drop it for launch.
3. **Chess tile:** real game position in Beyond the Code — provide a memorable game of yours, or I use a clean board motif.
