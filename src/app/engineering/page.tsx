import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/layout/Section";
import { SectionLabel } from "@/components/primitives/SectionLabel";
import { journal } from "@/data/journal";

export const metadata: Metadata = {
  title: "Engineering Journal",
  description:
    "A technical notebook: concurrency design, LLM security research, and honest research reporting — written to the same standard as the code.",
};

/** The technical notebook's index — hairline-ruled entries, not blog cards. */
export default function EngineeringJournal() {
  return (
    <main id="main" className="pt-28 pb-24">
      <Container>
        <SectionLabel number="EJ" label="ENGINEERING JOURNAL" as="h2" />
        <h1 className="mt-6 max-w-[22ch] font-display text-[length:var(--t-h1)] leading-[1.1] text-ink-hi">
          Notes written to the same standard as the code.
        </h1>
        <p className="mt-5 max-w-[var(--measure)] text-ink-md">
          Long-form entries on systems that appear in the evidence — what was
          decided, what it cost, and what broke along the way. Sources linked
          throughout.
        </p>

        <ol className="mt-14 border-t border-line">
          {journal.map((entry) => (
            <li key={entry.slug} className="border-b border-line">
              <Link
                href={`/engineering/${entry.slug}`}
                className="group grid gap-2 py-8 transition-colors duration-[var(--dur-tick)] md:grid-cols-12 md:gap-6"
              >
                <p className="mono-label md:col-span-2">
                  NO. {entry.number}
                  <span className="mt-1.5 block text-ink-lo normal-case">{entry.date}</span>
                </p>
                <div className="md:col-span-8">
                  <h2 className="font-display text-2xl text-ink-hi transition-colors duration-[var(--dur-tick)] group-hover:text-white">
                    {entry.title}
                  </h2>
                  <p className="mt-2.5 max-w-[64ch] text-sm leading-relaxed text-ink-md">
                    {entry.abstract}
                  </p>
                </div>
                <p className="font-mono text-micro text-ink-lo md:col-span-2 md:text-right">
                  {entry.readingMinutes} MIN
                  <span className="mt-1.5 block normal-case">
                    {entry.tags.slice(0, 2).map((t) => `#${t}`).join(" ")}
                  </span>
                  <span aria-hidden="true" className="mt-3 inline-block text-ink-md transition-transform duration-[var(--dur-tick)] group-hover:translate-x-1">
                    →
                  </span>
                </p>
              </Link>
            </li>
          ))}
        </ol>
      </Container>
    </main>
  );
}
