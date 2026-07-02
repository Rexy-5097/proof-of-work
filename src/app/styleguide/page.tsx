import type { Metadata } from "next";
import { Container } from "@/components/layout/Section";
import { Seal } from "@/components/primitives/Seal";
import { VerdictBadge } from "@/components/primitives/VerdictBadge";
import { SectionLabel } from "@/components/primitives/SectionLabel";
import { Button } from "@/components/primitives/Button";
import { Claim } from "@/components/primitives/Claim";
import { thesisClaims } from "@/data/claims";
import type { Verdict } from "@/data/types";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const verdicts: Verdict[] = [
  "verified",
  "null",
  "closed",
  "experimental",
  "deployed",
  "research",
  "practice",
];

/** Dev gallery — every primitive in every state. Not linked from the site. */
export default function Styleguide() {
  return (
    <main className="py-16">
      <Container className="space-y-16">
        <header>
          <SectionLabel number="XX" label="STYLEGUIDE — PRIMITIVES" />
          <h1 className="mt-4 font-display text-[length:var(--t-h1)] leading-[1.08] text-ink-hi">
            Every component, every state.
          </h1>
        </header>

        <section aria-label="Typography">
          <p className="mono-label mb-6">TYPOGRAPHY — THREE VOICES</p>
          <p className="font-display text-4xl text-ink-hi">
            The narrator states the claim.
          </p>
          <p className="mt-4 max-w-[var(--measure)] text-ink-md">
            The engineer explains clearly: body text set in Inter, readable for
            hours, never competing with the evidence it describes.
          </p>
          <p className="mt-4 font-mono text-claim text-ink-hi tabular">
            the_machine states facts: 78.17% [71.13, 85.21]
          </p>
        </section>

        <section aria-label="Seals">
          <p className="mono-label mb-6">SEAL GLYPH</p>
          <div className="flex items-center gap-8">
            {(["pending", "verified", "null", "experimental"] as const).map((s) => (
              <span key={s} className="flex items-center gap-2 font-mono text-micro text-ink-md">
                <Seal state={s} size={14} /> {s}
              </span>
            ))}
          </div>
        </section>

        <section aria-label="Verdict badges">
          <p className="mono-label mb-6">VERDICT BADGES</p>
          <div className="flex flex-wrap gap-3">
            {verdicts.map((v) => (
              <VerdictBadge key={v} verdict={v} />
            ))}
          </div>
        </section>

        <section aria-label="Buttons">
          <p className="mono-label mb-6">BUTTONS</p>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="primary">Examine the evidence ↓</Button>
            <Button variant="secondary">Open channel</Button>
            <Button variant="ghost">Deep dive →</Button>
          </div>
        </section>

        <section aria-label="Claims">
          <p className="mono-label mb-6">CLAIM — HOVER/TAP FOR PROVENANCE</p>
          <div className="flex flex-wrap gap-10">
            {thesisClaims.map((c) => (
              <Claim key={c.id} claim={c} />
            ))}
          </div>
          <div className="mt-8">
            <Claim claim={thesisClaims[0]!} size="lg" />
          </div>
        </section>

        <section aria-label="Panels">
          <p className="mono-label mb-6">ELEVATION</p>
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-r3 border border-line bg-bg-1 p-6 font-mono text-micro text-ink-md">
              E0 — flat
            </div>
            <div className="panel-e1 p-6 font-mono text-micro text-ink-md">E1 — raised</div>
            <div className="panel-e2 p-6 font-mono text-micro text-ink-md">E2 — floating</div>
          </div>
        </section>
      </Container>
    </main>
  );
}
