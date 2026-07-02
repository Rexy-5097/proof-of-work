import Link from "next/link";
import { Seal } from "@/components/primitives/Seal";

/** 404 — in this site's language: a claim with no evidence. */
export default function NotFound() {
  return (
    <main id="main" className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <p className="mono-label mb-6 flex items-center gap-2 tracking-[0.12em]">
        <Seal state="null" size={12} />
        404 — CLAIM NOT FOUND
      </p>
      <h1 className="max-w-[20ch] font-display text-[length:var(--t-h2)] leading-[1.2] text-ink-hi">
        This route carries zero evidence.
      </h1>
      <p className="mt-4 max-w-[44ch] text-sm text-ink-md">
        Nothing was ever published here — and this site doesn&apos;t display
        what it can&apos;t source.
      </p>
      <Link
        href="/"
        className="mt-8 rounded-r2 border border-line-strong px-5 py-2.5 font-mono text-label tracking-[0.08em] text-ink-hi transition-colors duration-[var(--dur-tick)] hover:border-ink-md"
      >
        RETURN TO THE AUDIT
      </Link>
    </main>
  );
}
