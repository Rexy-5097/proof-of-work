import { Container } from "@/components/layout/Section";
import { Reveal } from "@/components/primitives/Reveal";

const INTERESTS = [
  {
    label: "CHESS",
    note: "Long games, slow time controls — the same appetite for thinking three failure modes ahead.",
  },
  {
    label: "SPACE TECHNOLOGY",
    note: "TESS photometry turned into a research project; launch coverage watched like sports.",
  },
  {
    label: "LINUX",
    note: "Daily driver and dissection subject — one kernel module so far, not the last.",
  },
  {
    label: "DISTRIBUTED SYSTEMS",
    note: "Reading material of choice: post-mortems, consensus papers, and other people's outages.",
  },
  {
    label: "RESEARCH",
    note: "The habit of asking a question precisely enough that 'no' becomes a useful answer.",
  },
  {
    label: "CONTINUOUS LEARNING",
    note: "Eight months from trading bots to kernel schedulers — the curve is the point.",
  },
] as const;

/** 08.1 / BEYOND THE CODE — understated, typographic, human. */
export function Beyond() {
  return (
    <Container className="mt-20 border-t border-line pt-12 lg:mt-28">
      <Reveal>
        <p className="mono-label mb-8 tracking-[0.1em]">
          08.1 <span className="text-ink-lo">/ BEYOND THE CODE</span>
        </p>
      </Reveal>
      <div className="grid gap-x-10 gap-y-7 sm:grid-cols-2 lg:grid-cols-3">
        {INTERESTS.map((item, i) => (
          <Reveal key={item.label} delay={Math.min(i * 0.04, 0.2)}>
            <div>
              <h3 className="mono-label text-ink-md">{item.label}</h3>
              <p className="mt-2 max-w-[38ch] text-sm leading-relaxed text-ink-lo">
                {item.note}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </Container>
  );
}
