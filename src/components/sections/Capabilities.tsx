import { Container } from "@/components/layout/Section";
import { SectionLabel } from "@/components/primitives/SectionLabel";
import { Reveal } from "@/components/primitives/Reveal";
import { Claim } from "@/components/primitives/Claim";
import { capabilities } from "@/data/capabilities";
import { telemetryClaims } from "@/data/telemetry";

/** 08 / INSTRUMENTATION — domains with proof, never bars or percentages. */
export function Capabilities() {
  const dsaClaim = telemetryClaims.find((c) => c.id === "tel-dsa");

  return (
    <Container>
      <Reveal>
        <SectionLabel number="08" label="INSTRUMENTATION" as="h2" className="mb-4" />
        <p className="mb-12 max-w-[var(--measure)] text-ink-md">
          Capabilities by engineering domain. No proficiency bars — a
          percentage nobody can re-derive is exactly the kind of number this
          site refuses to ship. Each domain lists the repositories that prove
          it.
        </p>
      </Reveal>
      <div className="grid gap-x-10 gap-y-8 border-t border-line pt-10 md:grid-cols-2 lg:grid-cols-4">
        {capabilities.map((cap, i) => (
          <Reveal key={cap.domain} delay={Math.min(i * 0.05, 0.3)}>
            <div>
              <h3 className="mono-label text-ink-md">{cap.domain}</h3>
              <ul className="mt-3 space-y-1 text-[0.8125rem] leading-relaxed text-ink-md">
                {cap.technologies.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
              <p className="mt-3 border-t border-line pt-2.5 font-mono text-micro">
                <span className="text-ink-lo">PROVEN BY </span>
                {cap.provenBy.map((r, j) => (
                  <span key={r.name}>
                    {j > 0 ? <span className="text-ink-lo"> · </span> : null}
                    <a
                      href={r.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-data hover:text-ink-hi"
                    >
                      {r.name}
                    </a>
                  </span>
                ))}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
      {dsaClaim ? (
        <Reveal delay={0.1}>
          <p className="mt-10 flex flex-wrap items-baseline gap-3 border-t border-line pt-6">
            <span className="mono-label">FUNDAMENTALS —</span>
            <Claim claim={dsaClaim} />
            <span className="text-sm text-ink-lo">
              data structures &amp; algorithms, kept sharp on purpose
            </span>
          </p>
        </Reveal>
      ) : null}
    </Container>
  );
}
