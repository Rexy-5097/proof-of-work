import { thesisClaims } from "./claims";
import { flagshipProjects } from "./projects";
import { telemetryClaims } from "./telemetry";
import { ledger } from "./ledger";
import type { Claim } from "./types";

/**
 * Every claim shipped on the site, aggregated, so counts shown in the
 * boot sequence and console are computed, never typed by hand.
 */
export const allClaims: Claim[] = [
  ...thesisClaims,
  ...flagshipProjects.flatMap((p) => p.claims),
  ...telemetryClaims,
];

export const registry = {
  // Derived from the ledger, not typed: this number is rendered in the
  // intro readout and the console banner, and a hardcoded copy had
  // already drifted (17) from the archive it describes.
  repositories: ledger.length,
  verifiedClaims: allClaims.length,
  evidenceLinks: allClaims.reduce((n, c) => n + c.evidence.length, 0),
  nullResults: allClaims.filter((c) => c.verdict === "null").length,
} as const;
