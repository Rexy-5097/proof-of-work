import type { ReactNode } from "react";
import { Container } from "@/components/layout/Section";
import { Reveal } from "@/components/primitives/Reveal";
import { Claim } from "@/components/primitives/Claim";
import { VerdictBadge } from "@/components/primitives/VerdictBadge";
import { DecisionRecordItem } from "@/components/primitives/DecisionRecordItem";
import { Button } from "@/components/primitives/Button";
import { chapters } from "@/data/projects";
import type { Project } from "@/data/types";

const TOTAL_CASES = chapters.length;

/**
 * One chapter of the audit. Every flagship follows the same rhythm:
 * problem → invariant → approach → architecture (visual) → verification
 * (claims) → decisions → limitation → links. Progressive disclosure via
 * staged <Reveal>s; all content is server-rendered and readable without
 * animation or JS.
 */
export function ChapterShell({
  project,
  visual,
}: {
  project: Project;
  visual: ReactNode;
}) {
  const p = project;
  const headingId = `case-${p.slug}-title`;

  return (
    <article
      id={`case-${p.slug}`}
      aria-labelledby={headingId}
      className="scroll-mt-28 border-t border-line py-20 first:border-t-0 lg:py-28"
    >
      <Container>
        <Reveal>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="mono-label tracking-[0.1em]">
              CASE {String(p.caseNumber).padStart(2, "0")}
              <span className="text-ink-lo"> / {String(TOTAL_CASES).padStart(2, "0")}</span>
              <span className="ml-3 text-ink-md">{p.name.toUpperCase()}</span>
            </p>
            <span className="flex gap-2">
              {p.verdicts.map((v) => (
                <VerdictBadge key={v} verdict={v} />
              ))}
            </span>
          </div>
          <h3
            id={headingId}
            className="max-w-[24ch] font-display text-[length:var(--t-h2)] leading-[1.15] text-ink-hi"
          >
            {p.oneLiner}
          </h3>
          <p className="mt-3 font-mono text-micro text-ink-lo">
            {p.stack.join(" · ")} · {p.year}
          </p>
        </Reveal>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="space-y-8 lg:col-span-5">
            <Reveal>
              <p className="mono-label mb-3">THE PROBLEM</p>
              <p className="text-[0.9375rem] leading-relaxed text-ink-md">{p.problem}</p>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="mono-label mb-3">THE INVARIANT</p>
              <p className="border-l-2 border-seal bg-bg-1 px-4 py-3 font-mono text-[0.8125rem] leading-relaxed text-ink-hi">
                {p.invariant}
              </p>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mono-label mb-3">THE APPROACH</p>
              <p className="text-[0.9375rem] leading-relaxed text-ink-md">{p.approach}</p>
            </Reveal>
          </div>

          {/* min-w-0: a grid item defaults to min-width:auto, which would let
              the 600px figure widen the page instead of scrolling inside it. */}
          <div className="min-w-0 lg:col-span-7">
            <Reveal delay={0.15}>
              <div className="panel-e1 p-5 md:p-6">
                {/* Diagrams carry ~8px labels at their native 640-unit width.
                    Letting them shrink to a phone's ~290px renders that text
                    at ~4px, so the panel scrolls horizontally instead and the
                    figure stays readable. No effect on desktop, where the
                    panel is already wider than the minimum. */}
                <div className="-mx-1 overflow-x-auto px-1 pb-1 md:overflow-x-visible">
                  <div className="min-w-[600px] md:min-w-0">{visual}</div>
                </div>
                <p className="mono-label mt-2 text-[0.625rem] md:hidden" aria-hidden="true">
                  SCROLL FIGURE →
                </p>

                <div className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-line pt-5">
                  {p.claims.map((c) => (
                    <div key={c.id}>
                      <p className="mono-label mb-2 text-[0.6875rem]">{c.label}</p>
                      <Claim claim={c} />
                    </div>
                  ))}
                </div>

                <div className="mt-6 border-t border-line pt-4">
                  <p className="mono-label mb-1">DECISION RECORDS</p>
                  {p.decisions.map((d) => (
                    <DecisionRecordItem key={d.id} record={d} />
                  ))}
                </div>

                <p className="mt-5 border-t border-line pt-4 font-mono text-[0.8125rem] leading-relaxed text-caution">
                  <span className="mono-label text-caution">⚠ LIMITATION — </span>
                  <span className="text-ink-md">{p.limitation}</span>
                </p>

                <div className="mt-5 flex flex-wrap items-center gap-3">
                  {p.links.map((l) => (
                    <Button
                      key={l.href}
                      variant={l.label === "LIVE" ? "secondary" : "ghost"}
                      href={l.href}
                      className="min-h-9 px-3 py-1.5 text-[0.75rem]"
                    >
                      {l.label} ↗
                    </Button>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </article>
  );
}
