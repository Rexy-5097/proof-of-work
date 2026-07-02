import Link from "next/link";
import { Container } from "@/components/layout/Section";
import { journal } from "@/data/journal";
import { PaperToggle } from "./PaperToggle";
import type { ReactNode } from "react";

/**
 * The technical-notebook page template. Finds its own metadata by slug,
 * renders the entry header and prev/next footer; body is MDX children.
 */
export function ArticleShell({ slug, children }: { slug: string; children: ReactNode }) {
  const idx = journal.findIndex((j) => j.slug === slug);
  const entry = journal[idx];
  if (!entry) throw new Error(`[journal] unknown slug "${slug}" — add it to data/journal.ts`);
  const prev = journal[idx - 1];
  const next = journal[idx + 1];

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: entry.title,
    abstract: entry.abstract,
    datePublished: entry.date,
    keywords: entry.tags.join(", "),
    author: {
      "@type": "Person",
      name: "Soumyadeb Tripathy",
      url: "https://github.com/Rexy-5097",
    },
  };

  return (
    <div id="article-root" className="bg-bg-0 transition-colors duration-[var(--dur-ui)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <main id="main" className="pt-28 pb-24">
        <Container className="max-w-[820px]">
          <header className="mb-12 border-b border-line pb-8">
            <div className="flex items-baseline justify-between gap-4">
              <p className="mono-label tracking-[0.1em]">
                ENTRY NO. {entry.number}
                <span className="ml-4 text-ink-lo">{entry.date}</span>
                <span className="ml-4 text-ink-lo">{entry.readingMinutes} MIN</span>
              </p>
              <PaperToggle />
            </div>
            <h1 className="mt-6 font-display text-[length:var(--t-h1)] leading-[1.1] text-ink-hi">
              {entry.title}
            </h1>
            <p className="mt-5 max-w-[60ch] text-ink-md">{entry.abstract}</p>
            <p className="mt-4 font-mono text-micro text-ink-lo">
              {entry.tags.map((t) => `#${t}`).join("  ")}
            </p>
          </header>

          <article className="max-w-[68ch]">{children}</article>

          <footer className="mt-16 flex justify-between gap-4 border-t border-line pt-8 font-mono text-[0.8125rem]">
            {prev ? (
              <Link href={`/engineering/${prev.slug}`} className="text-ink-md hover:text-ink-hi">
                ← NO. {prev.number}
              </Link>
            ) : (
              <span />
            )}
            <Link href="/engineering" className="text-ink-lo hover:text-ink-md">
              ALL ENTRIES
            </Link>
            {next ? (
              <Link href={`/engineering/${next.slug}`} className="text-ink-md hover:text-ink-hi">
                NO. {next.number} →
              </Link>
            ) : (
              <span />
            )}
          </footer>
        </Container>
      </main>
    </div>
  );
}
