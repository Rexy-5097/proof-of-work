import { Container } from "@/components/layout/Section";
import { Reveal } from "@/components/primitives/Reveal";
import { Button } from "@/components/primitives/Button";

const CARDS = [
  {
    name: "RAPTOR-AI",
    oneLiner: "A voice assistant that doesn't phone home.",
    points: [
      "Wake-word, speech-to-text and TTS run entirely on-device; only LLM reasoning calls out.",
      "Six-layer architecture with an explicit agent state machine and a priority engine that learns alert relevance from feedback.",
    ],
    stack: "Python · FastAPI · Faster-Whisper · Next.js",
    links: [{ label: "REPO", href: "https://github.com/Rexy-5097/Raptor-AI" }],
  },
  {
    name: "ZKHEALTH-FHE",
    oneLiner: "Health records where the patient holds the keys.",
    points: [
      "AES-256-GCM encryption in the browser before anything leaves the device; the chain stores hashes and grants, never plaintext.",
      "Access control enforced by contracts on an FHE-capable EVM chain — not by trusting a backend.",
    ],
    stack: "Solidity · fhEVM · Node.js · Arweave",
    links: [
      { label: "REPO", href: "https://github.com/Rexy-5097/zkhealth-fhe" },
      { label: "LIVE", href: "https://zkhealth-live-2026.netlify.app/login" },
    ],
  },
  {
    name: "STOCKSPHERE",
    oneLiner: "A warehouse platform built as a modular monolith, not a microservice sprawl.",
    points: [
      "Fastify + Drizzle over PostgreSQL for transactions, TimescaleDB for time-series logs, Redis for cache and queue, MinIO for documents.",
      "Forecasting is a separate Python service (Prophet, XGBoost) so the transactional path never waits on a model.",
    ],
    stack: "Fastify · Drizzle · Next.js · TimescaleDB",
    links: [{ label: "REPO", href: "https://github.com/Rexy-5097/StockSphere_Project" }],
  },
] as const;

/** Cases held in reserve — condensed, qualitative, fully linked. */
export function ExtendedEvidence() {
  return (
    <Container className="border-t border-line py-16 lg:py-20">
      <Reveal>
        <p className="mono-label mb-8 tracking-[0.1em]">
          EXTENDED EVIDENCE <span className="text-ink-lo">/ HELD IN RESERVE</span>
        </p>
      </Reveal>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card, i) => (
          <Reveal key={card.name} delay={i * 0.08}>
            <div className="flex h-full flex-col rounded-r3 border border-line bg-bg-1 p-6">
              <p className="mono-label">{card.name}</p>
              <h3 className="mt-3 font-display text-xl text-ink-hi">{card.oneLiner}</h3>
              <ul className="mt-4 flex-1 space-y-2.5">
                {card.points.map((pt) => (
                  <li key={pt} className="flex gap-2.5 text-sm leading-relaxed text-ink-md">
                    <span aria-hidden="true" className="mt-0.5 text-ink-lo">—</span>
                    {pt}
                  </li>
                ))}
              </ul>
              <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
                <p className="font-mono text-micro text-ink-lo">{card.stack}</p>
                <span className="flex gap-2">
                  {card.links.map((l) => (
                    <Button key={l.href} variant="ghost" href={l.href} className="min-h-0 px-2 py-1 text-[0.6875rem]">
                      {l.label} ↗
                    </Button>
                  ))}
                </span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </Container>
  );
}
