import { Container } from "@/components/layout/Section";
import { Reveal } from "@/components/primitives/Reveal";

const LESSONS = [
  "Correctness is designed, not tested into existence.",
  "The invariant comes first; the architecture is whatever defends it.",
  "A null result published is worth more than a positive result embellished.",
  "When a system can't decide safely, not deciding is the feature.",
  "Every number you can't re-derive is a liability wearing a metric's clothes.",
] as const;

/**
 * 09.1 / LESSONS — the personal residue of the evidence, closing the
 * technical narrative before the invitation. Deliberately slow: wide
 * spacing, generous reveals, nothing else on screen.
 */
export function Lessons() {
  return (
    <Container className="mt-24 border-t border-line pt-16 lg:mt-32">
      <Reveal>
        <p className="mono-label mb-12 tracking-[0.1em]">
          09.1 <span className="text-ink-lo">/ LESSONS CARRIED FORWARD</span>
        </p>
      </Reveal>
      <ol className="max-w-3xl space-y-10">
        {LESSONS.map((lesson, i) => (
          <Reveal key={lesson} delay={Math.min(i * 0.08, 0.4)}>
            <li className="flex items-baseline gap-6">
              <span aria-hidden="true" className="mono-label text-ink-lo tabular">
                {String(i + 1).padStart(2, "0")}
              </span>
              <p className="font-display text-xl leading-snug text-ink-hi md:text-2xl">
                {lesson}
              </p>
            </li>
          </Reveal>
        ))}
      </ol>
    </Container>
  );
}
