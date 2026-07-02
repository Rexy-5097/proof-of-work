import { thesisClaims } from "./claims";
import type { Claim } from "./types";

/**
 * Every claim shipped on the site, aggregated. Data modules append here
 * as they land (projects in 3C, telemetry in 3D) so counts shown in the
 * boot sequence and console are computed, never typed by hand.
 */
export const allClaims: Claim[] = [...thesisClaims];

export const registry = {
  repositories: 17,
  verifiedClaims: allClaims.length,
  evidenceLinks: allClaims.reduce((n, c) => n + c.evidence.length, 0),
  nullResults: allClaims.filter((c) => c.verdict === "null").length,
} as const;
