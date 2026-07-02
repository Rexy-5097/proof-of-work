import { Seal } from "@/components/primitives/Seal";
import { site } from "@/data/site";
import pkg from "../../../package.json";

/**
 * The colophon: the site ends the way it began — with evidence.
 * Every value here is computed at build time, not typed.
 */
export function Footer() {
  const sha = process.env.NEXT_PUBLIC_BUILD_SHA ?? "unversioned";
  const built = process.env.NEXT_PUBLIC_BUILD_TIME ?? "unknown";

  return (
    <footer className="border-t border-line bg-bg-1 print:hidden">
      <div className="mx-auto max-w-[var(--content-max)] px-[var(--page-margin)] py-10">
        <div className="flex flex-wrap items-start justify-between gap-x-10 gap-y-6">
          <div>
            <p className="flex items-center gap-2 font-mono text-label font-medium tracking-[0.08em] text-ink-hi">
              <Seal state="verified" size={11} />
              PROOF OF WORK
            </p>
            <p className="mt-2 max-w-[44ch] font-mono text-micro leading-relaxed text-ink-lo">
              Generated from verified project data — every metric on this site
              links to the artifact that produced it.
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-10 gap-y-2 font-mono text-micro text-ink-lo sm:grid-cols-3">
            <div>
              <dt className="inline text-ink-md">BUILD </dt>
              <dd className="inline tabular">
                {sha} <span className="text-seal">◆</span>
              </dd>
            </div>
            <div>
              <dt className="inline text-ink-md">DEPLOYED </dt>
              <dd className="inline tabular">{built.slice(0, 16)}Z</dd>
            </div>
            <div>
              <dt className="inline text-ink-md">VERSION </dt>
              <dd className="inline tabular">v{pkg.version}</dd>
            </div>
            <div>
              <dt className="inline text-ink-md">LICENSE </dt>
              <dd className="inline">MIT</dd>
            </div>
            <div>
              <dt className="inline text-ink-md">STACK </dt>
              <dd className="inline">Next.js · Tailwind · Motion · Lenis · MDX</dd>
            </div>
            <div>
              <dt className="inline text-ink-md">SOURCE </dt>
              <dd className="inline">
                <a
                  href={site.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-data hover:text-ink-hi"
                >
                  github.com/Rexy-5097 ↗
                </a>
              </dd>
            </div>
          </dl>
        </div>
        <p className="mt-8 border-t border-line pt-5 font-mono text-micro text-ink-lo">
          © {new Date().getFullYear()} Soumyadeb Tripathy · self-audited ·
          reduced-motion respected · sounds off by default
        </p>
      </div>
    </footer>
  );
}
