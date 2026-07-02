import type { Metadata } from "next";
import { chapters, helios } from "@/data/projects";
import { capabilities } from "@/data/capabilities";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: "Résumé",
  description: "Print-first résumé of Soumyadeb Tripathy, generated from verified project data.",
  robots: { index: false },
};

/**
 * Print-first, paper-themed, generated from the same verified data as
 * the site — no second source of truth to drift.
 */
export default function Resume() {
  const projects = [...chapters, helios];

  return (
    <div data-theme="paper" className="min-h-svh bg-bg-0 text-ink-md print:bg-white">
      <main id="main" className="mx-auto max-w-[52rem] px-6 py-14 print:py-6">
        <header className="border-b border-line-strong pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-3xl text-ink-hi">Soumyadeb Tripathy</h1>
              <p className="mt-1 text-sm">
                Backend systems · Applied AI · Distributed computing
              </p>
              <p className="mt-2 font-mono text-micro text-ink-lo">
                {site.email} · Jalandhar, India — open to relocation
              </p>
              <p className="mt-1 font-mono text-micro text-ink-lo">
                github.com/Rexy-5097 · linkedin.com/in/soumyadeb-tripathy ·
                leetcode.com/u/ApexRaptor_5097
              </p>
            </div>
            <a
              href="/resume.pdf"
              className="rounded-r2 border border-line-strong px-4 py-2 font-mono text-label tracking-[0.08em] text-ink-hi transition-colors duration-[var(--dur-tick)] hover:border-ink-md print:hidden"
            >
              DOWNLOAD PDF ↓
            </a>
          </div>
        </header>

        <section className="mt-6">
          <h2 className="mono-label mb-3">PROFILE</h2>
          <p className="text-sm leading-relaxed">
            Computer science engineer focused on software that stays correct
            under concurrency, partial failure, and adversarial input — with
            claims that survive independent verification. Shipped 17 public
            systems in eight months, from a Linux kernel I/O scheduler to a
            fully audited astrophysics ML pipeline; published one null result
            rather than reframing it.
          </p>
        </section>

        <section className="mt-6">
          <h2 className="mono-label mb-3">SELECTED SYSTEMS</h2>
          <ul className="space-y-3">
            {projects.map((p) => (
              <li key={p.slug} className="text-sm leading-relaxed">
                <span className="font-mono font-medium text-ink-hi">{p.name}</span>
                <span className="text-ink-lo"> — {p.stack.slice(0, 4).join(", ")} · </span>
                {p.oneLiner} {p.claims[0] ? (
                  <span className="text-ink-lo">
                    Key result: {p.claims[0].label.toLowerCase()} {p.claims[0].value}.
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="mono-label mb-3">CAPABILITIES</h2>
          <ul className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
            {capabilities.map((c) => (
              <li key={c.domain}>
                <span className="font-mono text-micro text-ink-lo">{c.domain} — </span>
                {c.technologies.slice(0, 4).join(", ")}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="mono-label mb-3">EDUCATION</h2>
          <p className="text-sm">
            B.Tech, Computer Science and Engineering — Lovely Professional
            University <span className="text-ink-lo">(2025 – present)</span>
          </p>
          <p className="mt-1 text-sm">
            Higher secondary — Kishorenagar Sachindra Siksha Sadan{" "}
            <span className="text-ink-lo">(2024)</span>
          </p>
        </section>

        <section className="mt-6">
          <h2 className="mono-label mb-3">LANGUAGES</h2>
          <p className="text-sm">English · Hindi · Bengali</p>
        </section>

        <footer className="mt-8 border-t border-line pt-3 font-mono text-micro text-ink-lo print:hidden">
          Generated from verified project data · every claim sourced at{" "}
          {site.url.replace("https://", "")} · build {process.env.NEXT_PUBLIC_BUILD_SHA}
        </footer>
      </main>
    </div>
  );
}
