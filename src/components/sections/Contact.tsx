import { Container } from "@/components/layout/Section";
import { SectionLabel } from "@/components/primitives/SectionLabel";
import { Reveal } from "@/components/primitives/Reveal";
import { Button } from "@/components/primitives/Button";
import { site } from "@/data/site";

const CHANNELS = [
  { label: "GITHUB", href: site.github },
  { label: "LINKEDIN", href: site.linkedin },
  { label: "LEETCODE", href: site.leetcode },
  { label: "RÉSUMÉ", href: "/resume" },
] as const;

/** 10 / OPEN CHANNEL — the verdict's invitation. Email is the action. */
export function Contact() {
  return (
    <Container>
      <Reveal>
        <SectionLabel number="10" label="OPEN CHANNEL" as="h2" className="mb-4" />
        <p className="mono-label mb-10 text-seal">
          AUDIT COMPLETE — THE EVIDENCE IS YOURS TO RE-RUN
        </p>
      </Reveal>
      <Reveal delay={0.1}>
        <h3 className="max-w-[18ch] font-display text-[length:var(--t-h1)] leading-[1.08] text-ink-hi">
          Let&apos;s build systems that deserve trust.
        </h3>
      </Reveal>
      <Reveal delay={0.18}>
        <p className="mt-6 max-w-[52ch] leading-relaxed text-ink-md">
          I&apos;m looking for backend and AI-systems engineering work — the
          kind where correctness is a requirement, not a hope. If that&apos;s
          the kind of system you&apos;re building, the channel is open.
        </p>
      </Reveal>
      <Reveal delay={0.24}>
        <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
          <Button variant="primary" href={`mailto:${site.email}`}>
            {site.email}
          </Button>
          <span className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-[0.8125rem]">
            {CHANNELS.map((c) => (
              <Button key={c.label} variant="ghost" href={c.href} className="min-h-0 px-0 py-1 text-[0.8125rem]">
                {c.label} ↗
              </Button>
            ))}
          </span>
        </div>
      </Reveal>
    </Container>
  );
}
