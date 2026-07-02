# Phase 2.1 — Creative Direction
**Project:** PROOF OF WORK — the portfolio of Soumyadeb Tripathy
**Format:** An interactive documentary about engineering, structured as a verified audit.

---

## 1. The Concept, Sharpened

The site is not "about" Soumyadeb. The site **is an audit of his work, conducted in front of the visitor.**

Three consequences follow, and they drive every decision below:

1. **The interface is an instrument, not a stage.** Everything looks like it was built to measure, inspect, and record — an observatory console crossed with a beautifully typeset lab journal. Nothing exists to impress; things impress because they are exact.
2. **Color is evidence.** The accent green is a semantic verdict, not a brand decoration. It appears *only* when something has been verified — a metric with a source, a completed audit step, the primary CTA. **Green pixels are earned.** This single rule makes the design language original: on most sites accent color is applied; here it is *awarded*.
3. **Typography testifies.** Three voices, strictly cast:
   - **The Narrator** (serif display) — tells the documentary story. Chapter titles, the interlude, editorial pull-lines.
   - **The Engineer** (sans body) — explains clearly, readable for hours.
   - **The Machine** (monospace) — states facts. *Every claim, metric, hash, label, and timestamp is set in mono.* If it's a number, it's mono; if it's mono, it can be inspected.

## 2. Moodboard (verbal)

| Reference feeling | What we take | What we refuse |
|---|---|---|
| Observatory control room at night | Deep blue-black ambient dark, calm telemetry, small points of light with meaning | Sci-fi HUD clutter, fake radar sweeps |
| A well-typeset physics paper (Tufte, CERN preprints) | Serif display + generous margins + numbered sections (`04 / EVIDENCE`), confidence intervals shown honestly | Academic dryness; we keep cinematic pacing |
| Audit stamp & notary seal | The "verified" stamp moment, dotted-underline claims, provenance popovers | Skeuomorphic rubber-stamp textures |
| Blueprint / engineering drawing | Hairline strokes, SVG diagrams that draw themselves in dependency order, crosshair cursor over schematics | Blueprint-blue kitsch, grid paper backgrounds everywhere |
| Terminal & developer tools | Mono type as truth-voice, boot-sequence reveals, inspectable everything | Green-on-black hacker cliché, CRT scanlines, glitch effects |
| Apple product storytelling | One idea per viewport, scroll-paced revelation, restraint | Product-launch gloss, oversized device renders |
| Linear / Stripe / Vercel | Token discipline, hairline borders, keyboard-grade polish | SaaS marketing layouts, feature grids, testimonial walls |

**Texture of the site in one sentence:** *a quiet, deep-blue instrument panel where a serif narrator walks you through evidence that checks itself green as you scroll.*

## 3. Design Pillars (decision filters)

Every proposed element must pass all five, in order:

1. **Does it verify?** If an element can't be tied to the audit narrative, it doesn't ship. (Kills: floating particles, decorative 3D blobs, random parallax objects.)
2. **Is it calm?** The site must be readable for an hour. Contrast is soft-high, motion is scarce and purposeful, nothing loops forever at full attention.
3. **Is it exact?** Hairlines are 1px, numbers are tabular, alignments are to the grid, corners are tight. Sloppiness anywhere breaks the persona everywhere.
4. **Will it age?** Ten-year test: serif + mono + hairlines + dark instrument panels were credible in 2015 and will be in 2035. Trend effects (glassmorphism, neon glow, glitch text, chrome gradients) fail this test and are banned.
5. **Is it fast?** 60fps floor. Any effect that can't hold it on a mid-range laptop is cut, not degraded.

## 4. The Signature Mechanic — the Seal

The one interaction visitors will remember and describe to others:

Every measurable claim on the site renders as a **Claim**: mono text with a subtle dotted underline and a small hollow seal glyph `◇`. When the claim scrolls into view, it *verifies*: a scan-line sweeps the underline, the number counts up in tabular mono, and the glyph stamps to a filled green seal `◆` with a 180ms overshoot tick. On hover/tap, the claim opens a **Provenance card**: source file, repo link, dataset hash or report name, and a "last verified" date. Reduced-motion users get the verified state instantly — same information, no theater.

This mechanic scales everywhere: hero thesis numbers, case-study metrics, telemetry counters, the audit-rail section checkmarks, even the footer's build hash. One idea, systemically applied — that's the identity.

## 5. Voice & Microcopy Rules

- Verdict vocabulary, used precisely: `VERIFIED`, `MEASURED`, `PUBLISHED`, `CLOSED`, `NULL RESULT`, `EXPERIMENTAL`, `IN PROGRESS`. Never "blazingly fast", never "passionate".
- Labels are short mono smallcaps: `SOURCE`, `DATASET HASH`, `P99 LATENCY`, `LIMITATION`.
- Limitations are typeset with the same care as achievements — amber label, never hidden, never apologetic.
- Sentence case for prose; mono labels may be uppercase (they are machine output, not shouting).

## 6. What This Is Not (anti-references)

Not a SaaS landing page (no pricing-page rhythm, no feature cards with icons). Not a hacker aesthetic (no green-on-black, no glitch). Not a Dribbble dark portfolio (no giant gradient orbs, no oversized emoji, no "Hi, I'm ✌️"). Not Active Theory literally (we take their *standard of craft*, not their WebGL maximalism — our 3D budget is nearly zero and spent only where evidence benefits, e.g. ASTRA's star-field header rendered from actual light-curve data).
