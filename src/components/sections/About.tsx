import { Container } from "@/components/layout/Section";
import { SectionLabel } from "@/components/primitives/SectionLabel";
import { Reveal } from "@/components/primitives/Reveal";

/** 02 / THE ENGINEER — mindset, not project descriptions. */
export function About() {
  return (
    <Container>
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
        <div className="lg:col-span-5">
          <Reveal>
            <SectionLabel number="02" label="THE ENGINEER" as="h2" className="mb-6" />
            <p className="max-w-[16ch] font-display text-[length:var(--t-h1)] leading-[1.1] text-ink-hi">
              I got interested in the moment things break.
            </p>
          </Reveal>
        </div>
        <div className="space-y-6 lg:col-span-6 lg:col-start-7">
          <Reveal delay={0.1}>
            <p className="max-w-[var(--measure)] leading-[1.75] text-ink-md">
              Most software works until it meets reality: two requests arriving
              at once, a network that drops mid-transaction, a benchmark nobody
              re-ran. That moment — where the demo ends and the system either
              holds or doesn&apos;t — is the part of engineering I find worth
              staring at. Difficult systems problems are honest: they don&apos;t
              care how the code looks, only whether the invariant held.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <p className="max-w-[var(--measure)] leading-[1.75] text-ink-md">
              The same instinct explains why I publish limitations. A weak class
              flagged in a README, a false-positive rate that disqualifies a
              filter, a study closed on a null result — these aren&apos;t
              confessions, they&apos;re calibration. If my record can&apos;t say
              &ldquo;no,&rdquo; its &ldquo;yes&rdquo; means nothing. I&apos;d
              rather hand someone an instrument that reads true than a
              highlight reel.
            </p>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="border-t border-line pt-5 font-mono text-[0.8125rem] leading-loose text-ink-lo">
              <p>
                <span className="text-ink-md">CURRENTLY</span> — B.Tech CSE, Lovely
                Professional University
              </p>
              <p>
                <span className="text-ink-md">SEEKING</span> — backend / AI-systems
                engineering roles
              </p>
              <p>
                <span className="text-ink-md">LOCATION</span> — Jalandhar, India ·
                open to relocation
              </p>
            </div>
          </Reveal>
        </div>
      </div>
    </Container>
  );
}
