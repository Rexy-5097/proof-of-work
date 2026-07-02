# Phase 3A — Technical Architecture
The engineering contract for the build. Frozen inputs: `content/*` (Phase 1), `design/*` (Phase 2). This document governs Phases 3A–3E; deviations require a note in the PR description.

---

## 1. Stack & Dependency Ledger (every byte justified)

| Dependency | Why it exists | Budget (gz) |
|---|---|---|
| `next` (App Router) + `react` | RSC = zero-JS static sections; Metadata API; route-level code splitting | framework |
| `typescript` (strict) | claims/evidence data model is typed end-to-end | 0 (build-time) |
| `tailwindcss` v4 | CSS-first `@theme` maps 1:1 onto our tokens; no config drift | ~10KB CSS |
| `gsap` + ScrollTrigger | chapter pinning + scrubbed DRAW sequences (client, lazy per chapter) | ~48KB, deferred |
| `motion` (Framer Motion) | local component states: Claim lifecycle, Provenance, menus | ~28KB tree-shaken |
| `lenis` | 1:1 smooth scroll, disabled on reduced-motion/touch | ~4KB |
| `clsx` + `tailwind-merge` | variant composition without class bugs | <2KB |
| `@radix-ui/react-popover` (only shadcn-adjacent piece) | Provenance focus-trap/positioning a11y is not worth hand-rolling | ~9KB, lazy |
| `next-mdx-remote-client` or `@next/mdx` (3D) | Engineering Journal | route-scoped |
| **Rejected:** Three.js (ASTRA header = 2D canvas from real light-curve data; 3D not earned), Motion One (redundant), React Icons (we use ~10 hand-inlined Lucide SVGs), any UI kit beyond the popover | | |

## 2. Repository Layout

```
Portfolio/                     # repo root = Next.js app
├── content/  design/          # frozen Phase 1–2 deliverables (docs, not shipped)
├── public/                    # og images, resume.pdf, favicon (seal glyph), sounds/*.mp3 (3B)
├── src/
│   ├── app/
│   │   ├── layout.tsx         # fonts, theme, nav, cursor, sound + lenis providers
│   │   ├── page.tsx           # the audit (sections 00–10, RSC shells)
│   │   ├── work/[slug]/page.tsx
│   │   ├── engineering/{page.tsx,[slug]/page.tsx}
│   │   ├── resume/page.tsx
│   │   ├── styleguide/page.tsx        # dev-only primitive gallery (noindex)
│   │   ├── {sitemap.ts,robots.ts,not-found.tsx,opengraph-image.tsx}
│   │   └── globals.css        # @theme tokens + base layer
│   ├── components/
│   │   ├── primitives/        # Seal, Claim, Provenance, VerdictBadge, Button,
│   │   │                      # SectionLabel, MonoBlock, DiagramFrame, CodeBlock
│   │   ├── layout/            # Section, Container, SiteNav, AuditRail, Footer
│   │   ├── sections/          # Hero, ThesisStrip, About, Principles, Interlude,
│   │   │                      # Timeline, IndexTable, Capabilities, Beyond,
│   │   │                      # Telemetry, Contact  (RSC where possible)
│   │   ├── chapters/          # ChapterShell + per-project evidence visuals
│   │   │                      # (FurnitureOpsFlow, RtbWaterfall, GeofenceTrajectory,
│   │   │                      #  AstraLightCurve, DdsoSeekGraph) — all next/dynamic
│   │   └── providers/         # LenisProvider, CursorProvider, SoundProvider,
│   │                          # MotionPrefsProvider
│   ├── hooks/                 # useVerifyOnView, useInViewOnce, usePrefersReducedMotion,
│   │                          # useCursorMode, useSound, useMagneticHover
│   ├── lib/                   # cn.ts, motion.ts (verb presets), format.ts, seo.ts,
│   │                          # gsap.ts (registration, single import point)
│   ├── data/                  # THE EVIDENCE LAYER (see §3)
│   │   ├── types.ts  claims.ts  projects/*.ts  timeline.ts
│   │   ├── principles.ts  skills.ts  telemetry.ts  site.ts
│   └── content/journal/*.mdx  # Engineering Journal articles
└── {package.json, tsconfig.json, next.config.ts, postcss.config.mjs}
```

## 3. Data Architecture — evidence as a type system

The Phase 1 rule "no claim without a source" is enforced by the compiler:

```ts
type Evidence = {
  label: string;              // "ground-truth audit"
  href: string;               // repo file / report / benchmark URL
  kind: "readme" | "report" | "benchmark" | "audit" | "dataset" | "ci" | "code" | "profile";
  hash?: string;              // SHA-256 fingerprint when it exists
  verifiedAt: `${number}-${number}-${number}`;
};
type Verdict = "verified" | "null" | "experimental" | "deployed" | "research" | "closed" | "practice";
type Claim = {
  id: string; value: string;  // "0.15ms" — rendered in mono, always
  detail?: string;            // "P99, single request path"
  verdict: Verdict;
  evidence: Evidence[];       // NON-EMPTY: enforced by a build-time assert
};
```

`Project`, `TimelineNode`, `TelemetryMetric`, `Principle` all compose `Claim`. A tiny build assertion (imported by `sitemap.ts` so it runs in CI) walks all data modules and **fails the build if any claim ships without evidence** — the site's editorial rule becomes a compile gate. All data is statically imported → fully static rendering, zero runtime fetching. GitHub live stats deliberately omitted from v1 (a stale number would violate the thesis; revisit with ISR in Phase 5 if wanted).

## 4. Rendering & Route Strategy

- Everything is **statically generated** (`output` default, no dynamic APIs). Contact form posts to a route handler → email relay (3D); no DB.
- Sections are **RSC by default**; interactivity is pushed to leaf client components (`Claim`, evidence visuals, providers). Client-component budget for `/`: ≤ 35% of shipped JS.
- Per-chapter evidence visuals load via `next/dynamic` + IntersectionObserver (200px margin) — the GSAP+visual bundle for FurnitureOps never loads if the visitor bounces at the hero.
- `/work/[slug]` and `/engineering/[slug]`: `generateStaticParams`, per-page Metadata, own OG images.

## 5. Animation Architecture

**One rule: a verb, a driver, one owner per element.**

- `lib/motion.ts` exports the five verbs as typed presets (`SCAN`, `VERIFY`, `SEAL`, `DRAW`, `BOOT`) carrying duration/easing token values — components never hardcode timing.
- **Framer Motion** owns *state* animation (Claim lifecycle, popovers, nav, staggered entries) — declarative, interruptible.
- **GSAP ScrollTrigger** owns *scroll* animation (chapter pins, scrubbed DRAW, act transitions) — registered once in `lib/gsap.ts`, instantiated inside `useGsapContext` (auto-cleanup via `gsap.context`).
- **Lenis** owns the scroll position only; ScrollTrigger reads it via `lenis.on("scroll", ScrollTrigger.update)`.
- `MotionPrefsProvider` resolves `prefers-reduced-motion` + the `Escape`-toggle once; every hook reads context, not media queries. Reduced = final states rendered server-side (no flash of animation, no JS needed to see content). This is also the a11y guarantee: **content never depends on an animation having run.**

## 6. Global State — deliberately minimal

No state library. Four React contexts, all leaf-scoped: `MotionPrefs` (reduced/full), `Cursor` (mode string), `Sound` (on/off, persisted `localStorage:pow-sound`, default OFF), `AuditProgress` (visited sections set — powers rail + final "10/10"). Everything else is local or URL state (`/`#section anchors, index filter as `?filter=`).

## 7. Performance Strategy (budgets, enforced in 3E)

- **JS on `/` first load: ≤ 160KB gz** (GSAP excluded — deferred). Fonts ≤ 220KB woff2 total (3 families, subsetted by `next/font`, `display: swap` + metric fallbacks → CLS 0).
- LCP = hero headline (server-rendered text) < 1.2s on Fast 3G-throttled desktop; boot sequence overlays but never blocks paint (it's `pointer-events: none` theater over real content, skippable, ≤ 3s, sessionStorage-gated to first visit).
- Animations: `transform/opacity/clip-path` only; `content-visibility: auto` on below-fold sections; single rAF loop shared by cursor + cursor-light; passive listeners everywhere.
- Images: near-zero image strategy (typography-led design) — only OG images, optional portrait (AVIF, `next/image`, explicit dimensions), diagram SVGs inlined.
- CI check (3E): `next build` + bundle-analyzer budget assert + Lighthouse CI on Vercel preview.

## 8. Accessibility Strategy

Semantic skeleton first: `<nav>`, `<main>`, one `<h1>`, sections with `aria-labelledby`, skip-link, landmarks. Claim = `<button aria-expanded>` opening Provenance `<dialog role="dialog">` (Radix handles focus trap/restore); counters have `aria-live="off"` with final value in DOM from SSR. AuditRail = plain anchor nav. Custom cursor is `aria-hidden`, pointer-fine only, and never replaces focus indicators (2px `--data` ring). Boot sequence announced as "Loading" via `aria-busy`, skippable by any key. Contrast: all ink-on-bg pairs ≥ 7:1 except ink-lo captions ≥ 4.6:1. Target: axe clean + keyboard-only walkthrough + VoiceOver pass in 3E.

## 9. SEO Strategy

Metadata API: per-route title template (`%s — Soumyadeb Tripathy`), descriptions from Phase 1 copy. JSON-LD: `Person` (+`sameAs` GitHub/LinkedIn/LeetCode) on `/`, `SoftwareSourceCode` per `/work/[slug]`, `TechArticle` per journal post. `sitemap.ts` + `robots.ts` generated; canonical via `metadataBase`; OG images generated with `next/og` (dark panel + seal + claim). Styleguide `noindex`.

## 10. Theming & Token Integration

`design/03-tokens.css` is copied verbatim into `globals.css` `:root` (single source, checked by a comment header with the design-doc version). Tailwind v4 `@theme inline` maps tokens → utilities (`bg-bg-1`, `text-ink-md`, `font-mono`, `rounded-r2`, `duration-ui`, `ease-out-pow`). Components use utilities; raw `var()` only inside keyframes/complex effects. `data-theme="paper"` on `/engineering/[slug]` `<article>` scope flips the palette (already defined in tokens). No runtime theme JS in v1 (dark is the product; paper is route-scoped).

## 11. Sound Architecture (3B)

Three assets (`tap`, `seal`, `toggle`), each <100ms, −30 LUFS-ish, lazy `AudioContext` created on first *user gesture after opt-in*. `useSound("seal")` no-ops when off/reduced-motion/SSR. Setting lives in nav (`SOUND: OFF/ON`, mono label). Never autoplay; never meaning-bearing.

## 12. Console Easter Egg (3B)

`layout.tsx` inlines a tiny script (guarded, dev-stripped): styled `console.info` block — build integrity line with real commit hash (`NEXT_PUBLIC_BUILD_SHA` injected at build), repositories 17, audit PASS, evidence chain COMPLETE, build timestamp, "Welcome, Engineer." Professional, once per session.

## 13. Testing & Quality Gates

- `tsc --noEmit` strict + ESLint (next/core-web-vitals) on every build.
- Evidence integrity assert (§3) — the signature test of this codebase.
- Vitest unit tests for `lib/` (format, motion presets, data guards); Playwright smoke (3E): boot skip, claim → provenance opens with link, keyboard walk, reduced-motion renders final states.

## 14. Build Order Mapping

3A foundation (this doc, scaffold, tokens, fonts, primitives, styleguide) → 3B boot/hero/nav/rail/scroll/sound → 3C chapters + verification UX → 3D timeline/journal/telemetry/beyond/contact/footer → 3E hardening (budgets, a11y audit, SEO finish, Lighthouse).
