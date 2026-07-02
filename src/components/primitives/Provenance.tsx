"use client";

import { useState } from "react";
import { Seal, verdictToSealState } from "./Seal";
import type { Claim } from "@/data/types";

/**
 * The evidence card inside a Claim's popover.
 * Every provenance card contains at least one real link (enforced
 * upstream by assertEvidence).
 */
export function Provenance({ claim }: { claim: Claim }) {
  const [copied, setCopied] = useState(false);
  const hash = claim.evidence.find((e) => e.hash)?.hash;
  const latest = claim.evidence
    .map((e) => e.verifiedAt)
    .sort()
    .at(-1);

  const copyHash = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — the hash is still selectable text */
    }
  };

  return (
    <div className="w-[min(360px,calc(100vw-32px))] p-4 font-mono">
      <div className="mb-2.5 flex items-center justify-between">
        <span className="mono-label">SOURCE</span>
        <span className="flex items-center gap-1.5 text-micro text-ink-md">
          <Seal state={verdictToSealState(claim.verdict)} size={10} />
          {claim.verdict.toUpperCase()}
        </span>
      </div>

      <p className="mb-2 text-claim text-ink-hi tabular">
        {claim.value}
        {claim.detail ? (
          <span className="block pt-1 text-micro leading-relaxed text-ink-md">
            {claim.detail}
          </span>
        ) : null}
      </p>

      <ul className="mb-1 space-y-1.5">
        {claim.evidence.map((ev) => (
          <li key={ev.href}>
            <a
              href={ev.href}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-baseline gap-1.5 text-[0.8125rem] text-data hover:text-ink-hi"
            >
              <span className="text-micro text-ink-lo uppercase">{ev.kind}</span>
              <span className="underline decoration-data/40 underline-offset-2 group-hover:decoration-ink-hi">
                {ev.label}
              </span>
              <span aria-hidden="true">↗</span>
            </a>
          </li>
        ))}
      </ul>

      {hash ? (
        <button
          type="button"
          onClick={() => copyHash(hash)}
          className="mt-1 flex w-full items-center gap-1.5 text-left text-micro text-ink-lo hover:text-ink-md"
          aria-label="Copy dataset fingerprint"
        >
          <span className="shrink-0">SHA256</span>
          <span className="truncate tabular">{hash}</span>
          <span className={copied ? "text-seal" : ""} aria-hidden="true">
            {copied ? "✓" : "⧉"}
          </span>
        </button>
      ) : null}

      {latest ? (
        <p className="mt-2.5 border-t border-line pt-2 text-micro text-ink-lo">
          LAST VERIFIED {latest}
        </p>
      ) : null}
    </div>
  );
}
