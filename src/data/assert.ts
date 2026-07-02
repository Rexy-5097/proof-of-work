import type { Claim } from "./types";

/**
 * The editorial rule of this site, enforced mechanically:
 * a claim without evidence does not build.
 * Imported by app/sitemap.ts so it runs on every production build.
 */
export function assertEvidence(claims: Claim[], context: string): void {
  for (const claim of claims) {
    if (claim.evidence.length === 0) {
      throw new Error(
        `[proof-of-work] Claim "${claim.id}" in ${context} has no evidence. ` +
          `Every claim on this site must link to the artifact that produced it.`,
      );
    }
    for (const ev of claim.evidence) {
      if (!ev.href.startsWith("https://")) {
        throw new Error(
          `[proof-of-work] Evidence "${ev.label}" on claim "${claim.id}" has a non-https href.`,
        );
      }
    }
  }
}
