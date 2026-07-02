# Phase 2.5 — Motion Language, Cursor Storyboard & Transition Specs

## 1. Motion Grammar — five verbs, nothing else

Every animation on the site is one of these verbs. If a proposed animation isn't one of them, it's cut.

| Verb | Meaning | Recipe | Where |
|---|---|---|---|
| **SCAN** | inspection in progress | 1px luminous line sweeps a bounded region, `--dur-scan`, `--ease-inout` | Claim underlines, section-header rules, hero thesis line |
| **VERIFY** | value confirmed | tabular counter ticks to final (`--ease-mech`), then SEAL | metrics, telemetry, thesis strip |
| **SEAL** | verdict stamped | glyph scale 1.3→1, `--dur-stamp` `--ease-stamp`, single 1px ring pulse | Claims, audit rail, badges, contact success |
| **DRAW** | architecture assembling | SVG stroke-dashoffset in dependency order, `--dur-cinema`, 80ms stagger | diagrams, timeline thread, evidence-panel frames |
| **BOOT** | system initializing | mono lines appear top-down w/ 60ms stagger + brief cursor-block on last line | hero load, terminal readouts, footer colophon |

Global rules: animate `transform`/`opacity`/`clip-path` only (compositor-safe); nothing loops indefinitely except the ≤1Hz audit-rail "current section" breathing dot; entry animations fire once per session; stagger cap 6 elements; concurrent animation cap 3 per viewport.

## 2. Page-Load Sequence (hero, ≤1.2s, no preloader screen)

```
0ms     bg + ambient paint immediately (no flash, no spinner)
0–300   nav BOOTs (logo seal draws, links fade 60ms stagger)
150–900 headline: three lines rise+fade sequentially (--dur-reveal, --ease-out)
900     SCAN sweeps "evidence." → SEAL stamps after it
950     subline + buttons fade in
1050    build hash BOOTs bottom-left, VERIFY ticks, SEAL stamps
```
A preloader is banned — the audit starts on time. Fonts preloaded; headline uses `font-display: swap` with size-adjusted fallback to prevent CLS.

## 3. Scroll Choreography

- **Engine:** Lenis (1:1 ratio, ~0.1 lerp). GSAP ScrollTrigger drives pins and scrubs; Framer Motion handles local component states. One driver per concern, never both on one element.
- **Standard section entry:** label SCAN → heading rise (`--dur-reveal`) → content stagger. Trigger at 30% viewport. That's it — restraint is the style.
- **Chapter pinning (desktop only):** each Chapter pins for +100vh of scrub while the evidence panel assembles in stages: (1) panel frame DRAWs → (2) diagram DRAWs → (3) metric Claims VERIFY → (4) ADR/limitation rows fade in. Release, scroll continues. Tablet/mobile: no pin; stages become plain sequential entries.
- **Act transitions (the only 3 cinematic moments):**
  - *Act I→II* (Principles→Evidence): viewport briefly dims 8%, mono line `BEGINNING EXAMINATION — 6 CASES` types on, ambient shifts blue→neutral. ~800ms, non-blocking.
  - *Act II→interlude:* ambient dims 20% over 600ms, rail fades to 30%, Lenis lerp raised (scroll feels heavier — weight as metaphor). Restores on exit.
  - *Interlude→Act III:* ambient warms toward green tint; timeline thread begins DRAWing immediately — recovery, momentum.
- **Parallax budget:** evidence panels translate at 0.96× scroll speed vs narrative 1.0× (max 24px divergence). No other parallax. Depth via light and surface, not motion.

## 4. Micro-interactions

| Element | Interaction | Spec |
|---|---|---|
| Buttons (primary) | hover | magnetic ≤4px toward cursor (spring stiffness 300/damping 20), bg deepen `--dur-tick`; label unaffected |
| Links | hover | underline SCAN (250ms), arrow +4px |
| Index rows | hover | bg-2 fade, arrow slide; no scale/lift |
| Cards | hover | cursor-light + border brighten only; **cards never lift or tilt** (evidence doesn't wobble) |
| Claims | in-view | VERIFY+SEAL; hover → Provenance (120ms fade+4px rise) |
| Audit rail | section crossed | thread fills to node, SEAL stamps, 1Hz breathing dot moves |
| Copy hash | click | glyph → ✓ `--seal` 800ms, mono toast `COPIED` |
| Form submit | success | message block gets SEAL + `DELIVERED 14:32:07Z` |
| 404 | load | `CLAIM NOT FOUND — 0 EVIDENCE` + ◈, link home |

## 5. Cursor Storyboard (≥1280px, pointer-fine only)

Rendering: single fixed layer, two elements (dot 6px ink-hi, ring 28px `--line-strong`), rAF loop, ring lerp 0.18. Hidden until first pointermove. `Escape` toggles custom cursor off (preference persisted). Native cursor always present for text inputs; touch and reduced-motion never see the custom cursor.

| Context | Dot | Ring | Extra |
|---|---|---|---|
| Default | 6px | 28px circle | — |
| Claim / evidence (`data-cursor="inspect"`) | 4px | → 4 corner brackets ⌜⌝⌞⌟ (24px, 150ms morph) | mono micro `VERIFY` fades in below-right |
| Link/button (`data-cursor="link"`) | 6px | contracts to 20px, snaps magnetically to target center | — |
| Diagram (`data-cursor="crosshair"`) | 1px × 12px cross | fades out | mono coordinates `x:412 y:88` trail bottom-right *(the dev-tool moment)* |
| Text/prose | hidden | hidden | native I-beam |
| Drag (timeline, mobile-index chips) | 6px | ring + `← →` chevrons | — |

Ring color never turns green (the cursor inspects; it doesn't verdict).

## 6. Reduced Motion Contract

`prefers-reduced-motion: reduce` ⇒ durations zero (token-level), so: all content renders in final verified state (◆ shown, counters at value, diagrams fully drawn, thread filled); pins disabled — normal document flow; Lenis disabled (native scroll); cursor system off; act transitions become instant ambient swaps; Provenance popovers open/close with opacity only. **Identical information, identical hierarchy, identical beauty — minus the theater.** Also honored: `prefers-contrast: more` brightens `--line` to 0.3 alpha and drops ambient gradients.

## 7. Performance Budget (motion-related)

- 60fps floor on M1 Air / mid-range Windows laptop; ScrollTrigger scrub values ≤1 (no heavy smoothing debt).
- Cursor + cursor-light: one rAF loop total, passive listeners, `pointermove` work = 2 style-property writes.
- Diagrams: inline SVG ≤ 40KB each, stroke animation via CSS where possible.
- Three.js: **not in the base bundle.** Only candidate use is ASTRA's light-curve header; ship it as a lazy, in-view-only, 2D-canvas fallback-first module — and only if Phase 4 proves it earns its bytes.
- Animation libs: GSAP+ScrollTrigger (~48KB gz) + Framer Motion (tree-shaken) + Lenis (~4KB). Motion One dropped — redundant with this stack.
- All chapter evidence panels code-split (`next/dynamic`), IO-triggered 200px early.
- `will-change` applied on animation start, removed on complete; never persistent.

## 8. Storyboard — the first 30 seconds (reference cut)

1. **0s** Land: dark instrument panel, headline rises, "evidence." scanned and sealed. Build hash verifies bottom-left. *Message: this site holds itself to the standard.*
2. **~5s** Scroll: thesis strip — four numbers tick and stamp in sequence. One line teaches: "hover any ◆."
3. **~10s** Visitor hovers `0.15ms P99` → Provenance: `SOURCE: nexus-rtb-engine/README — latency benchmark`, repo link, date. *Trust mechanic proven interactively.*
4. **~15s** About + Principles pass with calm reveals; audit rail quietly collects ◆s left side.
5. **~25s** Act transition dims: `BEGINNING EXAMINATION — 6 CASES`. FurnitureOps chapter pins; queue→lock→ledger schematic draws; `0 OVERSELLS` verifies. *The visitor is now conducting an audit, not reading a resume.*
