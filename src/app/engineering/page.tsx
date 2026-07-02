import type { Metadata } from "next";
import { Container } from "@/components/layout/Section";
import { SectionLabel } from "@/components/primitives/SectionLabel";
import { Button } from "@/components/primitives/Button";

export const metadata: Metadata = {
  title: "Engineering Journal",
  description:
    "Long-form technical writing: concurrency, LLM security, kernel scheduling, and honest research reporting.",
};

/**
 * Journal index shell. Articles land in Phase 3D (MDX); the route exists
 * now so navigation is stable and the page is honest about its state.
 */
export default function EngineeringJournal() {
  return (
    <main id="main" className="py-32">
      <Container>
        <SectionLabel number="EJ" label="ENGINEERING JOURNAL" as="h2" />
        <h1 className="mt-6 max-w-[20ch] font-display text-[length:var(--t-h1)] leading-[1.08] text-ink-hi">
          Technical writing, held to the same standard as the code.
        </h1>
        <p className="mt-6 max-w-[var(--measure)] text-ink-md">
          First entries — on defending a single invariant end to end, reading a
          model&apos;s hidden states, and publishing a null result — are being
          prepared. Until then, the primary sources are public.
        </p>
        <div className="mt-8">
          <Button variant="secondary" href="https://github.com/Rexy-5097">
            Read the repositories ↗
          </Button>
        </div>
      </Container>
    </main>
  );
}
