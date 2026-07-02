# Phase 2.3 — Component Library & Interaction Guidelines
Every component listed with anatomy, states, and interaction contract. Naming is final (these become React component names in Phase 3).

---

## Core (the identity carriers)

### `<Claim>` — the signature component
A verifiable statement. Inline or standalone.
- **Anatomy:** mono value (tabular nums) + dotted underline (`1px dotted --line-strong`) + seal glyph (◇/◆/◈, 12px, right-attached).
- **States:** `pending` (◇ hollow, ink-md) → `verifying` (scan sweep runs left→right along underline, value counts up with `--ease-mech`) → `verified` (◆ `--seal`, underline solidifies to `--line-seal`) · `null` (◈ `--flag`, for Helios-Dx) · `experimental` (◆ `--caution`).
- **Interaction:** hover (desktop) or tap (touch) opens `<Provenance>`. Focusable; `Enter` opens; `aria-describedby` links the popover. Verification triggers once per session at 40% viewport entry.
- **Reduced motion:** renders directly in final state.

### `<Provenance>` — evidence popover
- **Anatomy (E2 panel, --r-4, max 360px):** label row (`SOURCE` mono label + verdict badge) · claim restated · source link (repo file/report, external-link icon) · optional hash row (`SHA256 f99b…bf58`, copy button) · `LAST VERIFIED` date footer.
- **Behavior:** anchored above claim, flips if clipped; 120ms fade+4px rise; dismiss on scroll/esc/outside. Mobile: bottom sheet with drag handle.
- **Rule:** every Provenance must contain ≥1 real link. No orphan claims.

### `<Seal>` — the stamp
12px SVG glyph, three cuts (pending/verified/null). Stamp animation: scale 1.3→1.0, opacity 0→1, `--dur-stamp` `--ease-stamp`, one subtle 1px ring pulse outward (400ms fade). Used by Claim, AuditRail, VerdictBadge, footer build hash. Also the favicon.

### `<AuditRail>` — navigation as checklist
Fixed left rail (56px, ≥1280px only).
- **Anatomy:** vertical list of section items: mono number (`04`) + seal state + tick line. Current section: number in `--ink-hi` + label slides out on hover (`EVIDENCE`). Visited: ◆ seal. Unvisited: ◇.
- **Interaction:** click scrolls (Lenis, 900ms `--ease-inout`); keyboard accessible (it's a `<nav>` of anchor links). Progress thread (1px line) fills `--seal` behind visited items.
- **Tablet/mobile fallback:** 2px top progress bar with section tick marks; tap opens section menu.

## Structure

### `<SiteNav>` — top bar
Transparent over hero; on scroll >80px gains `--bg-3`/blur(12px)/hairline-bottom. Left: seal glyph + `SOUMYADEB TRIPATHY` (mono label). Right: `WORK · ENGINEERING · INDEX · CONTACT` (Inter 500 0.875rem) + primary CTA `OPEN CHANNEL` only after 60% scroll. Mobile: seal + hamburger → full-screen menu with mono numbering.

### `<Chapter>` — featured project template
Full-bleed section, min-height 100vh, two-column ≥1280 (narrative 5 cols left, evidence panel 7 cols right).
- **Header:** `CASE 01 / FURNITUREOPS` mono label · Newsreader title (the one-liner) · stack chips.
- **Narrative column:** Problem → Invariant (styled as a bordered mono block — the "contract") → approach prose.
- **Evidence panel (E1, cursor-lit):** architecture diagram (draw-in SVG) OR terminal readout, then metric Claims row, then `<DecisionRecord>` accordion, then `LIMITATION` row (caution), then links row (repo / live / deep-dive →`/work/[slug]`).
- **Progressive disclosure:** panel reveals in stages as chapter pins/scrolls (see motion spec). Never more than ~3 elements animating at once.

### `<Interlude>` — the Null Result
Full viewport, `--bg-0` only, ambient light dimmed, AuditRail dims to 30%. Newsreader italic centered: "The experiment that said no." Below: three mono lines (hypothesis / result / action) revealed at reading pace, then a single `◈ NULL RESULT — PUBLISHED` stamp in `--flag`. Links: repo + CITATION.cff. The only section with no green and almost no motion. Silence as design.

### `<TimelineRail>` — trajectory
Horizontal scroll-driven on desktop (vertical on mobile). Nodes = month stamps (mono date + one-line event + micro seal). A 1px thread connects; thread draws with scroll; each node stamps on arrival.

### `<IndexTable>` — all projects
Dense rows: name (Inter 500) · one-liner (ink-md) · stack (mono micro) · status badge · year · arrow. Filter chips above (`ALL / BACKEND / AI–ML / RESEARCH / SYSTEMS / PRODUCT / HACKATHON`) — pill radius, mono labels; active chip = ink-hi border, *not* green (filtering isn't verification). Row hover: bg-2 + arrow slides 4px. Rows are `<a>` to repo or case study.

### `<TelemetryGrid>` — sourced metrics
Cards (E1): mono label top (`PRODUCTION DEPLOYMENTS`), Claim number large (2.5rem mono), source line bottom (`— vercel.app, netlify.app, render`). Counters tick up on entry (`--ease-mech`). 4-up ≥1280, 2-up tablet/mobile. **Every card is a Claim with Provenance. No stars, no followers.**

### `<BeyondGrid>` — the person
Six small flat tiles (E0): Lucide icon + label + one honest sentence (chess · space technology · AI research · distributed systems · Linux · continuous learning). One tile may hold a real chess position (static SVG board, a game he actually played, mono caption). No animation beyond entry fade. Placed after Capabilities, before Telemetry.

### `<ArticleCard>` + `/engineering` journal
Index route styled as technical journal: `NO. 001` mono numeral · Newsreader title · abstract (2 lines) · meta row (date · reading time · tags). Hairline-separated list, not cards. Article template: 68ch measure, sticky mini-TOC right, Paper-mode toggle, `<CodeBlock>`s, footnotes, "verified claims in this article" summary box at top.

## Elements

### Buttons
- **Primary (one per view):** `--seal-dim` bg, `--seal` text+border, hover bg deepens + magnetic pull (≤4px translate toward cursor, spring back). Mono label uppercase.
- **Secondary:** transparent, `--line-strong` border, ink-hi text; hover border brightens + bg-2.
- **Ghost/inline:** ink-md, underline on hover, arrow nudge 4px.
- All: `--r-2`, 44px min hit target, visible focus ring (`2px --data` offset 2px — focus is data-blue, not green; focus isn't verification).

### `<CodeBlock>`
E1 panel, --r-3: header bar (mono file path + language + copy button) · body JetBrains Mono 0.875rem/1.7, line numbers ink-lo · syntax theme derived from token palette (strings seal-dim-green, keywords data-blue, comments ink-lo italic) · optional `HIGHLIGHT` line marker (caution left-border). Max-height 480px then internal scroll with fade masks.

### Forms (contact)
Mono labels above fields; inputs E0 with hairline, focus ring data-blue; single-field email + message. Submit = primary button `TRANSMIT`. Success state: the submitted message gets a ◆ `DELIVERED` stamp + mono timestamp — verification mechanic to the end. Errors: `--flag` text below field, plain language.

### Badges — `<VerdictBadge>`
Mono micro uppercase, --r-1, 1px border, dim bg: `VERIFIED`(seal) `PUBLISHED`(seal) `NULL RESULT`(flag) `CLOSED`(flag) `EXPERIMENTAL`(caution) `DEPLOYED`(data) `RESEARCH`(data) `PRACTICE`(ink-lo).

### `<DecisionRecord>` — ADR accordion
Mono header `ADR-001 — WHY A QUEUE, NOT A LOCK?` + chevron. Open: Context / Options considered (rejected ones struck with `--flag` ◈ + reason) / Decision / Consequences & lessons. One open at a time. Content sourced from each repo's actual docs.

### `<DiagramFrame>`
SVG architecture diagrams: hairline nodes (--r-2 rects, bg-1 fill), `--data` edges with 4px-dash flow, mono labels 0.75rem. Scroll-triggered draw-in by dependency order (`--dur-cinema`, stagger 80ms). Cursor becomes crosshair with mono coordinates inside frame. Mobile: horizontal scroll, `SCROLL →` hint.

## Cursor System (summary — full storyboard in 06)
Custom cursor ≥1280px, pointer-fine only: 6px dot (ink-hi) + 28px ring (line-strong, lerp-follow 0.18). Modes: **default** · **inspect** (over Claims: ring → corner brackets + `VERIFY` micro-label) · **link** (ring contracts, magnetic) · **crosshair** (over diagrams, + coordinates) · **text** (native I-beam, custom hides). Native cursor never suppressed for touch/reduced-motion/`Escape`-toggled. The cursor is a tool-state indicator, not a pet.

## Global Interaction Rules
1. Hover states ≤ `--dur-tick`; nothing on hover moves layout.
2. One primary (green) action per viewport.
3. Everything keyboard-reachable; custom components are progressive enhancement over semantic HTML (`<a>`, `<button>`, `<details>`).
4. Scroll is never hijacked — Lenis smooths but 1:1 ratio; pinned chapters release within one viewport height.
5. Touch replaces hover 1:1 (tap = open Provenance, second tap elsewhere closes).
6. All entry animations trigger once; revisiting a section doesn't re-animate (an audit doesn't re-run checks).
