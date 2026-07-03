import { Container, Section } from "@/components/layout/Section";
import { HeroBackdrop } from "@/components/sections/HeroBackdrop";
import { HeroDissolveLayer } from "@/components/webgl/HeroDissolveLayer";
import { About } from "@/components/sections/About";
import { Principles } from "@/components/sections/Principles";
import { Interlude } from "@/components/sections/Interlude";
import { ExtendedEvidence } from "@/components/sections/ExtendedEvidence";
import { Timeline } from "@/components/sections/Timeline";
import { Ledger } from "@/components/sections/Ledger";
import { Capabilities } from "@/components/sections/Capabilities";
import { Beyond } from "@/components/sections/Beyond";
import { Telemetry } from "@/components/sections/Telemetry";
import { Lessons } from "@/components/sections/Lessons";
import { Contact } from "@/components/sections/Contact";
import { ChapterShell } from "@/components/chapters/ChapterShell";
import { EvidenceNav } from "@/components/chapters/EvidenceNav";
import { FurnitureOpsFlow } from "@/components/chapters/visuals/FurnitureOpsFlow";
import { RtbWaterfall } from "@/components/chapters/visuals/RtbWaterfall";
import { GeofenceTrajectory } from "@/components/chapters/visuals/GeofenceTrajectory";
import { AstraLightCurve } from "@/components/chapters/visuals/AstraLightCurve";
import { DdsoSeekGraph } from "@/components/chapters/visuals/DdsoSeekGraph";
import { SectionLabel } from "@/components/primitives/SectionLabel";
import { Reveal } from "@/components/primitives/Reveal";
import { Button } from "@/components/primitives/Button";
import { Claim } from "@/components/primitives/Claim";
import { thesisClaims } from "@/data/claims";
import { chapters } from "@/data/projects";
import { site } from "@/data/site";
import type { ReactNode } from "react";

const visuals: Record<string, ReactNode> = {
  furnitureops: <FurnitureOpsFlow />,
  "nexus-rtb-engine": <RtbWaterfall />,
  "geofence-llm": <GeofenceTrajectory />,
  astra: <AstraLightCurve />,
  ddso: <DdsoSeekGraph />,
};

/**
 * The audit, sections 00–10. 3C ships the evidence act (five chapters +
 * interlude + extended evidence); 02–03 and 06–10 land in 3D.
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
    "backend systems",
    "distributed computing",
    "applied machine learning",
    "LLM security",
    "privacy-preserving computation",
    "Linux kernel development",
  ],
};

export default function Home() {
  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <Section id="landing" className="flex min-h-svh items-center bg-[image:var(--ambient-act1)]">
        <HeroBackdrop />
        <Container className="relative">
          <p className="mono-label mb-6 tracking-[0.14em]">PROOF OF WORK</p>
          <h1
            id="hero-headline"
            className="max-w-[17ch] font-display text-[length:var(--t-display)] leading-[1.02] tracking-[-0.015em] text-ink-hi"
          >
            I build software that stays correct when things fail — and I publish
            the evidence.
          </h1>
          <HeroDissolveLayer />
          <p className="mt-6 text-lg text-ink-md">
            Backend systems · Applied AI · Distributed computing
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant="primary" href="#evidence">
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

      <Section id="about" labelledBy="about-h">
        <span id="about-h" className="sr-only">About the engineer</span>
        <About />
      </Section>

      <Section id="principles" labelledBy="principles-h">
        <span id="principles-h" className="sr-only">Operating constraints</span>
        <Principles />
      </Section>

      <Section id="evidence" labelledBy="evidence-h" className="bg-[image:var(--ambient-act2)] !py-0">
        <Container className="pt-20 lg:pt-28">
          <Reveal>
            <SectionLabel number="04" label="EVIDENCE" as="h2" className="mb-4" />
            <span id="evidence-h" className="sr-only">Evidence — five examined cases</span>
            <p className="mb-8 max-w-[var(--measure)] font-display text-[length:var(--t-h2)] leading-[1.2] text-ink-hi">
              Five systems, examined the way an auditor would.
            </p>
          </Reveal>
        </Container>
        <Container className="!max-w-none px-0">
          <EvidenceNav />
        </Container>
        {chapters.map((p) => (
          <ChapterShell key={p.slug} project={p} visual={visuals[p.slug]} />
        ))}
        <ExtendedEvidence />
      </Section>

      <Section id="interlude" labelledBy="interlude-h" className="!py-0">
        <span id="interlude-h" className="sr-only">The null result — Helios-Dx</span>
        <Interlude />
      </Section>

      <Section id="timeline" labelledBy="timeline-h" className="bg-[image:var(--ambient-act3)]">
        <span id="timeline-h" className="sr-only">Trajectory</span>
        <Timeline />
      </Section>

      <Section id="index" labelledBy="ledger-h">
        <span id="ledger-h" className="sr-only">Engineering ledger — all repositories</span>
        <Ledger />
      </Section>

      <Section id="capabilities" labelledBy="capabilities-h">
        <span id="capabilities-h" className="sr-only">Instrumentation — capabilities and interests</span>
        <Capabilities />
        <Beyond />
      </Section>

      <Section id="telemetry" labelledBy="telemetry-h">
        <span id="telemetry-h" className="sr-only">Engineering telemetry</span>
        <Telemetry />
        <Lessons />
      </Section>

      <Section id="contact" labelledBy="contact-h" className="pb-28 lg:pb-36">
        <span id="contact-h" className="sr-only">Open channel — contact</span>
        <Contact />
      </Section>
    </main>
  );
}
