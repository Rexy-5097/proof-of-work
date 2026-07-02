"use client";

import { Container } from "@/components/layout/Section";
import { SectionLabel } from "@/components/primitives/SectionLabel";
import { Reveal } from "@/components/primitives/Reveal";
import { Seal } from "@/components/primitives/Seal";
import { useViz } from "@/hooks/useViz";
import { timeline } from "@/data/timeline";

/**
 * 06 / TRAJECTORY — progression as escalation of constraints, not dates.
 * A vertical thread DRAWs downward; each stage stamps as it's crossed.
 */
export function Timeline() {
  const { ref, attrs } = useViz<HTMLOListElement>(0.1);

  return (
    <Container>
      <Reveal>
        <SectionLabel number="06" label="TRAJECTORY" as="h2" className="mb-4" />
        <p className="mb-12 max-w-[var(--measure)] text-ink-md">
          Eight months, read as an escalation: each stage takes on a
          constraint the previous one didn&apos;t have.
        </p>
      </Reveal>
      <ol ref={ref} {...attrs} className="viz relative ml-1 space-y-0 border-l border-line pl-8 md:ml-24">
        {timeline.map((stage, i) => {
          const future = stage.date === "NEXT";
          return (
            <li key={stage.date} className="relative pb-12 last:pb-0">
              <span
                aria-hidden="true"
                className="absolute top-1 -left-[37px] flex h-4 w-4 items-center justify-center bg-bg-0"
              >
                <Seal state={future ? "pending" : "verified"} size={10} />
              </span>
              <div className="rise" data-d={Math.min(i + 1, 6)}>
                <p className="mono-label">
                  <span className={future ? "text-caution" : "text-ink-md"}>{stage.date}</span>
                  <span className="ml-3 text-ink-lo">{stage.domain}</span>
                </p>
                <h3 className="mt-2 font-display text-xl text-ink-hi">{stage.title}</h3>
                <p className="mt-1.5 max-w-[56ch] text-sm leading-relaxed text-ink-md">
                  {stage.detail}
                </p>
                {stage.repos.length > 0 ? (
                  <p className="mt-2 font-mono text-micro text-ink-lo">
                    {stage.repos.join(" · ")}
                  </p>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </Container>
  );
}
