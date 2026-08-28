import Link from "next/link";
import { SolarOverture } from "@/components/landing/SolarOverture";
import { Button } from "@/components/primitives/Button";
import { site } from "@/data/site";

/**
 * The gate.
 *
 * The audit used to live here, with the solar prologue stacked on top of
 * it as one very long page. It is now two routes: this one is the walk up
 * to the door, and /proof is what is behind it.
 *
 * The cost of that split is real and worth naming — a homepage that is
 * mostly a scroll-scrubbed video is a homepage with very little for a
 * crawler to read. So the gate is not only the animation: the panel below
 * it carries the site's name, its one-line thesis and the Person entity,
 * and it links into the audit with a real <Link>, which is also what
 * gives Next something to prefetch. The heavy chapter text lives on
 * /proof, which is where it belongs and where it is now canonical.
 */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Soumyadeb Tripathy",
  jobTitle: "Backend & AI Systems Engineer",
  email: `mailto:${site.email}`,
  url: site.url,
  sameAs: [
    "https://github.com/Rexy-5097",
    "https://www.linkedin.com/in/soumyadeb-tripathy/",
    "https://leetcode.com/u/ApexRaptor_5097/",
  ],
  alumniOf: { "@type": "CollegeOrUniversity", name: "Lovely Professional University" },
  knowsAbout: [
    "systems programming",
    "Rust",
    "static program analysis",
    "backend systems",
    "distributed computing",
    "applied machine learning",
    "reproducible research",
    "LLM security",
    "Linux kernel development",
  ],
};

export default function Gate() {
  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      <SolarOverture />

      {/* The door. It sits directly under the prologue's last frame, so the
          star fades out of the sticky stage and this is what is behind it —
          the handoff the scroll has been walking toward, rather than a
          button bolted to the end of a video. */}
      <section
        aria-labelledby="gate-h"
        className="relative flex min-h-svh items-center bg-[image:var(--ambient-act1)] px-[var(--page-margin)]"
      >
        <div className="mx-auto w-full max-w-[var(--content-max)]">
          <p className="mono-label mb-6 tracking-[0.14em]">
            SOUMYADEB TRIPATHY — BACKEND &amp; AI SYSTEMS ENGINEER
          </p>
          <h1
            id="gate-h"
            className="max-w-[14ch] font-display text-[length:var(--t-display)] leading-[1.02] tracking-[-0.015em] text-ink-hi"
          >
            Proof of Work
          </h1>
          <p className="mt-8 max-w-[var(--measure)] text-lg text-ink-md">
            An audit of eleven systems, read the way an auditor would read it —
            problem, invariant, architecture, verified result, and the
            limitation each one still carries. Every figure links to the
            artifact that produced it.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Button variant="primary" href="/proof">
              Enter the audit →
            </Button>
            <Button variant="secondary" href="/engineering">
              Read the journal
            </Button>
          </div>
          <p className="mono-label mt-16">
            BUILD {process.env.NEXT_PUBLIC_BUILD_SHA}{" "}
            <span className="text-seal">◆ VERIFIED</span>
          </p>

          {/* A plain prefetching link the reader never sees, so the audit's
              first paint is already warm by the time the button is pressed.
              sr-only rather than hidden: hidden would take it out of the
              accessibility tree and Next would still prefetch, but a second
              reachable route out of the gate costs nothing. */}
          <Link href="/proof" className="sr-only">
            Skip the prologue and go straight to the audit
          </Link>
        </div>
      </section>
    </main>
  );
}
