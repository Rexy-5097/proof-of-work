# Phase 2.2 — Visual Language
Color, typography, spacing, grid, depth, lighting. All values are final and mirrored in `03-tokens.css`.

---

## 1. Color System

Dark-first. The background is a deep blue-black — "the observatory at night" — never pure black (pure black + pure white fatigues; our extremes are #070B12 and #E6EDF6, a ~15.8:1 pair that still passes AAA).

### Substrate (backgrounds, darkest → lightest)
| Token | Hex | Use |
|---|---|---|
| `--bg-0` | `#070B12` | Page canvas |
| `--bg-1` | `#0B111B` | Section panels, cards at rest |
| `--bg-2` | `#101826` | Raised cards, code blocks, hover states |
| `--bg-3` | `#16202F` | Popovers, provenance cards, nav on scroll |

### Ink (text)
| Token | Value | Use |
|---|---|---|
| `--ink-hi` | `#E6EDF6` | Headlines, primary text |
| `--ink-md` | `#9DB0C4` | Body-secondary, descriptions |
| `--ink-lo` | `#5F7288` | Captions, timestamps, disabled |

### Line (borders)
`--line` `rgba(148,163,184,0.14)` hairlines · `--line-strong` `rgba(148,163,184,0.26)` hover/active · `--line-seal` `rgba(61,214,152,0.4)` verified containers.

### Verdict colors (semantic only — never decorative)
| Token | Hex | Meaning | Where |
|---|---|---|---|
| `--seal` | `#3DD698` | Verified / proven | Claim seals, audit checks, primary CTA, verified borders |
| `--seal-dim` | `rgba(61,214,152,0.12)` | Verified surface tint | Provenance card wash, stamp backgrounds |
| `--caution` | `#D9A245` | Experimental / limitation | Limitation labels, "experimental" tags (e.g. ASTRA's Solar-like class) |
| `--flag` | `#D9705C` | Null / closed / rejected | Helios-Dx verdict, rejected ADR options, fail-closed states |
| `--data` | `#7FAFE0` | Telemetry / neutral data | Chart lines, diagram strokes, graph fills. Cool, quiet, non-competing |

**The Earned Green rule (enforced in code review):** `--seal` may only style (a) a verified Claim, (b) an audit-rail check, (c) the single primary CTA per view, (d) a `VERIFIED`/`PUBLISHED` badge. It never appears in gradients, illustrations, hover flourishes, or backgrounds larger than a provenance card.

### Ambient light
Two fixed radial gradients per act, not per section — e.g. `radial-gradient(1200px 800px at 70% -10%, rgba(127,175,224,0.05), transparent)` — shifting hue slightly across the three acts (blue → neutral → green as the audit completes). Rendered as CSS on `--bg-0`, zero JS, zero repaint cost. This is the entire "lighting system" at page level; cursor lighting is component-level (see §5).

### Light mode
Deferred by design: the primary experience is dark. Phase 5 adds **Paper mode** for `/engineering` articles only (warm off-white `#F7F5F0`, ink `#1A2330`, same seal semantics at darkened values) — reading long-form on paper, auditing in the lab.

## 2. Typography System

| Voice | Family | Weights | Role |
|---|---|---|---|
| Narrator | **Newsreader** (variable, optical sizing) | 400, 500 italic | Chapter headlines, interlude, editorial pull-lines |
| Engineer | **Inter** (variable) | 400, 500, 600 | Body, UI, navigation, descriptions |
| Machine | **JetBrains Mono** | 400, 500 | Claims, metrics, labels, hashes, code, timestamps |

All self-hosted (woff2 subsets), `font-display: swap`, preloaded. Total budget ≤ 220KB.

### Scale (fluid, clamp-based; rem root 16px)
| Token | Size | Face | Use |
|---|---|---|---|
| `--t-display` | `clamp(3.4rem, 7.5vw, 7rem)` / 1.02 / -0.015em | Newsreader 400 | Hero line, act titles |
| `--t-h1` | `clamp(2.4rem, 4.5vw, 4rem)` / 1.08 | Newsreader 400 | Chapter titles |
| `--t-h2` | `clamp(1.6rem, 2.6vw, 2.25rem)` / 1.2 | Inter 500 | Section subheads |
| `--t-h3` | `1.25rem` / 1.35 | Inter 600 | Card titles |
| `--t-body-lg` | `1.125rem` / 1.65 | Inter 400 | Lead paragraphs |
| `--t-body` | `1rem` / 1.7 | Inter 400 | Default prose (measure ≤ 68ch) |
| `--t-mono` | `0.9375rem` / 1.6 | JetBrains Mono 400 | Claims, code |
| `--t-label` | `0.75rem` / 1.2 / +0.08em uppercase | JetBrains Mono 500 | Section numbers, labels, badges |
| `--t-micro` | `0.6875rem` | JetBrains Mono 400 | Timestamps, hashes, footnotes |

Rules: numerals always `font-variant-numeric: tabular-nums` in mono contexts; Newsreader never below 1.6rem (it's a display voice, not a text face); italic Newsreader reserved for the Null Result interlude and pull-quotes — the "human aside" register.

## 3. Spacing, Grid, Radius

- **Base unit 8px.** Scale: `4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160, 224`.
- **Grid:** 12 columns, 24px gutters, max content 1280px, page margins `clamp(20px, 5vw, 80px)`. Prose column 68ch. The **audit rail** occupies a fixed 56px left gutter on ≥1280px viewports (hidden ≤ tablet, replaced by top progress bar).
- **Section rhythm:** desktop 160–224px vertical padding between chapters; tablet 112px; mobile 80px. The interlude gets double padding — silence is layout.
- **Radius:** `--r-1: 3px` (chips, stamps, badges — near-sharp = technical), `--r-2: 6px` (buttons, inputs), `--r-3: 10px` (cards, code blocks), `--r-4: 14px` (provenance popovers, large panels). Nothing rounder; pill shapes only for filter chips in the Index.

## 4. Depth & Elevation

Depth is communicated by **surface step + hairline + minimal shadow**, in that priority:

| Level | Recipe |
|---|---|
| E0 flat | `--bg-1`, `1px --line` |
| E1 raised (cards) | `--bg-2`, `1px --line`, inset top highlight `0 1px 0 rgba(255,255,255,0.04)`, shadow `0 16px 40px -24px rgba(0,0,0,0.55)` |
| E2 floating (popovers, nav) | `--bg-3`, `1px --line-strong`, shadow `0 24px 64px -24px rgba(0,0,0,0.65)` |

The inset top highlight is our entire "soft neumorphism" allowance — a 1px suggestion that surfaces are machined, not painted. No embossed buttons, no double inner/outer shadow plates.

## 5. Lighting

- **Page level:** the two ambient radials per act (§1). Static, CSS-only.
- **Component level — cursor light:** on E1 evidence panels and project chapters, a `radial-gradient(600px at var(--mx) var(--my), rgba(127,175,224,0.06), transparent)` overlay plus a border-brightening mask follows the pointer. Implemented with two CSS custom properties updated on `pointermove` (rAF-throttled, transform-free, paint-cheap). Disabled on touch and reduced-motion.
- **Verification flash:** when a Claim verifies, its container border passes a brief 400ms luminance wave (mask animation) — light as *confirmation*, never as ambience.

## 6. Iconography & Diagrams

- Icons: **Lucide**, 1.5px stroke, 16/20px, `--ink-md` default. No filled icons except the seal glyph.
- The seal glyph is custom: hollow diamond `◇` (pending) → filled `◆` (verified) → struck `◈` (null/closed). Drawn as a 12px SVG, our favicon and the closest thing to a logo.
- Architecture diagrams: hand-authored SVG, hairline `--line-strong` strokes, `--data` for flow edges, mono labels, drawn-in on scroll (stroke-dashoffset). One diagram style site-wide; sourced from each repo's actual mermaid architecture.

## 7. Responsive Strategy

Desktop-first design, degradation is *re-composition* not shrinkage:
- **≥1280 (design target 1440):** audit rail visible, chapters are two-column (narrative left, evidence panel right), cursor system active.
- **768–1279 (tablet):** rail collapses to a 2px top progress bar with section ticks; chapters stack narrative-then-evidence; cursor system off; hover provenance becomes tap-to-open.
- **≤767 (mobile):** single column, 20px margins, display type drops to the clamp floor, diagrams become horizontally scrollable with a mono `SCROLL →` affordance, telemetry grid 2-up. Everything remains verifiable — provenance cards open as bottom sheets.
