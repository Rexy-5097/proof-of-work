import { Container } from "@/components/layout/Section";
import { SectionLabel } from "@/components/primitives/SectionLabel";
import { Reveal } from "@/components/primitives/Reveal";
import { Claim } from "@/components/primitives/Claim";
import { telemetryClaims } from "@/data/telemetry";

/** 09 / TELEMETRY — instrumentation, not achievements. Counters tick on entry only. */
export function Telemetry() {
  return (
    <Container>
      <Reveal>
        <SectionLabel number="09" label="ENGINEERING TELEMETRY" as="h2" className="mb-4" />
        <p className="mb-10 max-w-[var(--measure)] text-ink-md">
          Current instrument readings. No stars, no followers — only counts
          you can re-derive from public artifacts.
        </p>
      </Reveal>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {telemetryClaims.map((claim, i) => (
          <Reveal key={claim.id} delay={Math.min(i * 0.05, 0.35)}>
            <div className="panel-e1 flex h-full flex-col p-5">
              <p className="mono-label text-[0.6875rem]">{claim.label}</p>
              <p className="mt-3 mb-2">
                <Claim claim={claim} size="lg" />
              </p>
              <p className="mt-auto border-t border-line pt-2.5 font-mono text-micro leading-relaxed text-ink-lo">
                {claim.detail}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={0.1}>
        <p className="mt-6 font-mono text-micro text-ink-lo">
          SOURCE: github.com/Rexy-5097 — recount any of these yourself. Hover
          any <span className="text-seal">◆</span> for provenance.
        </p>
      </Reveal>
    </Container>
  );
}
