import { thesisClaims } from "./claims";
import { flagshipProjects } from "./projects";
import type { Claim } from "./types";

/**
 * Every claim shipped on the site, aggregated. Data modules append here
 * as they land (telemetry in 3D) so counts shown in the boot sequence
 * and console are computed, never typed by hand.
 */
export const allClaims: Claim[] = [
  ...thesisClaims,
  ...flagshipProjects.flatMap((p) => p.claims),
];

export const registry = {
  repositories: 17,
  verifiedClaims: allClaims.length,
  evidenceLinks: allClaims.reduce((n, c) => n + c.evidence.length, 0),
  nullResults: allClaims.filter((c) => c.verdict === "null").length,
} as const;
