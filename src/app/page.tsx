import { Container, Section } from "@/components/layout/Section";
import { SectionLabel } from "@/components/primitives/SectionLabel";
import { Button } from "@/components/primitives/Button";
import { Claim } from "@/components/primitives/Claim";
import { thesisClaims } from "@/data/claims";

/**
 * The audit, sections 00–10.
 * 3A ships the static skeleton: hero copy (real), thesis strip (real,
 * fully verifiable), and placeholder shells for the remaining sections.
 * Boot sequence, nav, rail and Lenis arrive in 3B; chapters in 3C.
 */
export default function Home() {
  return (
    <main id="main">
      <Section id="landing" className="flex min-h-svh items-center bg-[image:var(--ambient-act1)]">
        <Container>
          <p className="mono-label mb-6 tracking-[0.14em]">PROOF OF WORK</p>
          <h1
            className="max-w-[17ch] font-display text-[length:var(--t-display)] leading-[1.02] tracking-[-0.015em] text-ink-hi"
          >
            I build software that stays correct when things fail — and I publish
            the evidence.
          </h1>
          <p className="mt-6 text-lg text-ink-md">
            Backend systems · Applied AI · Distributed computing
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="primary" href="#thesis">
              Examine the evidence ↓
            </Button>
            <Button variant="secondary" href="#contact">
              Open channel
            </Button>
          </div>
          <p className="mono-label mt-16">
            BUILD {process.env.NEXT_PUBLIC_BUILD_SHA}{" "}
            <span className="text-seal">◆ VERIFIED</span>
          </p>
        </Container>
      </Section>

      <Section id="thesis" labelledBy="thesis-h">
        <Container>
          <SectionLabel number="01" label="VERIFICATION" as="h2" className="mb-10" />
          <span id="thesis-h" className="sr-only">
            Verification — four verified claims
          </span>
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 border-y border-line py-10 lg:grid-cols-4">
            {thesisClaims.map((claim) => (
              <div key={claim.id}>
                <p className="mono-label mb-3">{claim.label}</p>
                <Claim claim={claim} size="lg" />
              </div>
            ))}
          </div>
          <p className="mt-6 max-w-[var(--measure)] text-ink-md">
            Every number on this site links to the artifact that produced it.
            Hover any <span className="text-seal">◆</span>.
          </p>
        </Container>
      </Section>

      {/* 02–10 arrive in phases 3B–3D; anchors exist so navigation is stable now. */}
      {(
        [
          ["about", "02", "THE ENGINEER"],
          ["principles", "03", "OPERATING CONSTRAINTS"],
          ["evidence", "04", "EVIDENCE"],
          ["interlude", "05", "NULL RESULT"],
          ["timeline", "06", "TRAJECTORY"],
          ["index", "07", "THE LEDGER"],
          ["capabilities", "08", "INSTRUMENTATION"],
          ["telemetry", "09", "TELEMETRY"],
          ["contact", "10", "OPEN CHANNEL"],
        ] as const
      ).map(([id, number, label]) => (
        <Section key={id} id={id}>
          <Container>
            <SectionLabel number={number} label={label} />
            <p className="mt-4 font-mono text-micro text-ink-lo">
              SECTION UNDER CONSTRUCTION — PHASE 3B–3D
            </p>
          </Container>
        </Section>
      ))}
    </main>
  );
}
