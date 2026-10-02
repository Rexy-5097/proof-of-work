# Phase 6 — Interaction Layer
The effects added on top of the audit, and how each one was cut to pass the five pillars in `01-creative-direction.md`.

The rule for every effect: it enters only if it can be made to verify something, hold 60fps, and degrade to a complete page under reduced motion, touch, or no JS.

---

## Effects

| Effect | Where | Design |
|---|---|---|
| Fluid evidence lens | `webgl/EvidenceReveal.tsx` + `lib/evidencePlate.ts` on the `/proof` hero | A stable-fluids sim whose dye masks one layer onto another. Over the portrait it reveals the face's evidence scan; elsewhere an **audit log typeset from the claim registry** — every line a real source path, fingerprint and verification date. The headline makes the claim; the pointer audits it. Lens rim in `--data`, never green. three loads on first `pointerenter`; loop parks when idle. Fine pointers + motion only. |
| Inspection cursor | `chrome/InspectCursor.tsx` | Implements the cursor storyboard (06 §5): **inspect** (brackets frame a Claim + `VERIFY` tag), **link**, **crosshair** (element-local `x:/y:` over diagrams), **text**. No spin, no glow, no GSAP — one self-parking rAF loop. Escape toggles it (persisted) unless a popover owns the key. |
| Proximity audit rail | `layout/AuditRail.tsx` | Every rail item reads its distance to the pointer (smoothstep falloff); nearest opens fully, neighbours half-open. One `--effect` property per item; labels reveal by SCAN-style clip and never take pointer events. |
| Horizontal trajectory | `sections/TrajectoryTrack.tsx` | Implements the horizontal TimelineRail (04). Sticky viewport; runway = exact track overflow, so scroll is **1:1**. The thread DRAWs with scroll and each stage SEALs on arrival; `NEXT` stays ◇ caution. Counter + ←/→. ≥1024px with motion; vertical list otherwise and in SSR. |
| Auditor credential | `effects/Credential.tsx` (About) | A lanyard ID card with **zero dependencies**: a Verlet rope + two-point rigid card (an R3F/Rapier version would not install against the r151 pin). Drag, fling, twist; click turns it over. Barcode = build SHA; back = registry counts. |
| Evidence tape | `effects/EvidenceTape.tsx` | A hero ticker of **verified readings**, each a link to its case. CSS-only, pauses on hover/focus, static under reduced motion. |
| Instrument clock | `effects/InstrumentClock.tsx` | UTC readout; direct `textContent` writes at 10Hz in a contained box, only on screen; 1Hz without ms under reduced motion. |
| Focus reveal | `<Reveal variant="focus">` | Rise out of a blur — display headlines only (blur is a paint). |
| Sliding indicators | `SiteNav`, `Ledger` | A hairline under the active nav link that follows the section in review; a sliding ring between Ledger chips. Ink, never green — filtering isn't verifying. |
| Contact console | `sections/ContactConsole.tsx` | Implements the contact spec (04 "Forms"): copyable address, `TRANSMIT` primary, `◆ DELIVERED hh:mm:ssZ` stamp. Relay via `NEXT_PUBLIC_CONTACT_ENDPOINT` (JSON POST); without one it composes into the visitor's mail client and the stamp says so — "delivered" is only claimed when a server confirmed it. |

## The portrait

`public/portrait/*` is generated from the source photograph by `design/portrait-assets.py` (re-run it on a new photo; landmark coordinates at the top of the script must be re-measured).

| Asset | What it is |
|---|---|
| `portrait.webp` | Low-key black and white: neutral greyscale with highlights rolled off below white (the shirt and face read as ink, not light), fall-off away from the face, fine grain, bottom 22% dissolved. Sides feathered in CSS (`.hero-portrait`). The credential's `id.webp` uses the same grade, slightly more open. |
| `portrait-scan.webp` | The mask: an **evidence scan** of the same frame — a glyph field typeset from real claim values (brightness = the photo's luminance), contour line drawing, landmark HUD, `◆ MATCH VERIFIED` tab. |
| `id.webp`, `id-scan.webp` | 4:5 head-and-shoulders crops for the credential: photo on the front (with a small CSS-mask lens onto the scan), scan on the back. |

The hero lens prints `portrait-scan.webp` onto its plate over the `[data-portrait]` box, so one fluid solver reveals the scan over the face and the audit log everywhere else. The scan only downloads once the pointer enters the hero.

## Considered and left out

| Idea | Why |
|---|---|
| Tilt + glare cards | "Cards never lift or tilt — evidence doesn't wobble." (06 §4). The flip survives only on the credential. |
| Pixel shimmer on hover | Decorative; fails pillar 1. |
| Trailing-circles cursor | "The cursor is a tool-state indicator, not a pet." |
| Loading screen | Preloaders are banned; `BootSequence` already does the honest version. |
| Like counter | A vanity counter on a site that refuses stars and followers. |
| Language switcher, glassmorphism, neon glows | Out of scope or fail the ten-year test. |

## Budgets

- No new dependencies. three stays a lazy chunk shared by `KageWorld` and `EvidenceReveal`.
- Every new loop parks itself when settled, off screen, or the tab is hidden.
- Hero with the pointer moving: 60fps, 0 frames >25ms, including under 4× CPU throttling.
- Reduced motion: no cursor, no lens, vertical trajectory, static tape, credential hangs still (still flips), focus-reveal resolves instantly.
