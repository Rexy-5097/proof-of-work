import { Container } from "@/components/layout/Section";
import { Reveal } from "@/components/primitives/Reveal";
import { Claim } from "@/components/primitives/Claim";
import { Button } from "@/components/primitives/Button";
import { Seal } from "@/components/primitives/Seal";
import { helios } from "@/data/projects";

/**
 * The null result (design/05-wireframes.md §05). The one section that
 * inverts the language: near-black, no green, reveals paced for reading,
 * and almost nothing moves. The restraint is the point.
 */
export function Interlude() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-[#05080d] py-24 text-center">
      <Container className="max-w-3xl">
        <Reveal>
          <p className="mono-label mb-12 tracking-[0.14em] text-ink-lo">
            CASE HELIOS-DX — CLOSED
          </p>
          <p className="font-display text-[length:var(--t-h1)] leading-[1.15] text-ink-hi italic">
            &ldquo;No consistent quantum advantage was observed.&rdquo;
          </p>
        </Reveal>

        <Reveal delay={1.1}>
          <p className="mt-10 font-display text-[length:var(--t-h2)] leading-snug text-ink-md italic">
            We published the result anyway.
          </p>
        </Reveal>

        <Reveal delay={2}>
          <p className="mx-auto mt-12 max-w-[52ch] text-[0.9375rem] leading-relaxed text-ink-lo">
            Research integrity is measured by reporting what is true, not what
            is convenient. Helios-Dx ran a capacity-matched comparison — same
            frozen backbone, same 768→4 bottleneck, same seeds — of a 4-qubit
            variational circuit against a plain linear head, under FHE
            constraints. The classical head was never beaten consistently.
          </p>
        </Reveal>

        <Reveal delay={2.4}>
          <p className="mt-12 inline-flex items-center gap-2.5 rounded-r1 border border-flag/50 px-5 py-3 font-mono text-label tracking-[0.08em] text-flag">
            <Seal state="null" size={12} />
            NULL RESULT — PUBLISHED
          </p>
        </Reveal>

        <Reveal delay={2.7}>
          <div className="mt-14 flex flex-wrap items-start justify-center gap-x-12 gap-y-6 border-t border-line pt-8">
            {helios.claims.map((c) => (
              <div key={c.id} className="text-left">
                <p className="mono-label mb-2 text-[0.6875rem]">{c.label}</p>
                <Claim claim={c} />
              </div>
            ))}
          </div>
          <div className="mt-10 flex justify-center gap-3">
            {helios.links.map((l) => (
              <Button key={l.href} variant="ghost" href={l.href} className="text-[0.75rem]">
                {l.label} ↗
              </Button>
            ))}
          </div>
        </Reveal>
      </Container>
    </div>
  );
}
