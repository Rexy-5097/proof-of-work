import { Container } from "@/components/layout/Section";
import { SectionLabel } from "@/components/primitives/SectionLabel";
import { Reveal } from "@/components/primitives/Reveal";
import { principles } from "@/data/principles";

/** 03 / OPERATING CONSTRAINTS — engineering rules, each with its proof. */
export function Principles() {
  return (
    <Container>
      <Reveal>
        <SectionLabel number="03" label="OPERATING CONSTRAINTS" as="h2" className="mb-4" />
        <p className="mb-12 max-w-[var(--measure)] text-ink-md">
          Four rules the evidence will be tested against. Not values —
          constraints: each one names the repositories that enforce it.
        </p>
      </Reveal>
      <ol className="border-t border-line">
        {principles.map((p, i) => (
          <li key={p.id} className="border-b border-line">
            <Reveal delay={i * 0.06}>
              <div className="grid gap-3 py-8 md:grid-cols-12 md:gap-6">
                <p className="mono-label pt-1.5 md:col-span-1">{p.id}</p>
                <div className="md:col-span-7">
                  <h3 className="text-lg font-semibold text-ink-hi">{p.title}</h3>
                  <p className="mt-2 max-w-[58ch] text-sm leading-relaxed text-ink-md">
                    {p.body}
                  </p>
                </div>
                <div className="md:col-span-4 md:text-right">
                  <p className="mono-label mb-2 text-[0.6875rem]">PROVEN BY</p>
                  <ul className="space-y-1 font-mono text-[0.8125rem]">
                    {p.provenRepos.map((r) => (
                      <li key={r.name}>
                        <a
                          href={r.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-data transition-colors duration-[var(--dur-tick)] hover:text-ink-hi"
                        >
                          {r.name} ↗
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Container>
  );
}
