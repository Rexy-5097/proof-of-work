/**
 * The evidence layer. Every number rendered on the site flows through
 * these types; `assertEvidence` (data/assert.ts) fails the build if a
 * claim ships without at least one source.
 */

export type EvidenceKind =
  | "readme"
  | "report"
  | "benchmark"
  | "audit"
  | "dataset"
  | "ci"
  | "code"
  | "profile";

export interface Evidence {
  label: string;
  href: string;
  kind: EvidenceKind;
  /** SHA-256 fingerprint, when the artifact publishes one. */
  hash?: string;
  /** Date the link/number was last manually re-checked (ISO). */
  verifiedAt: string;
}

export type Verdict =
  | "verified"
  | "null"
  | "experimental"
  | "deployed"
  | "research"
  | "closed"
  | "practice";

export interface Claim {
  id: string;
  /** Rendered in mono, always. e.g. "0.15ms", "8/8", "500+" */
  value: string;
  /** Short mono label above/beside the value. e.g. "P99 LATENCY" */
  label: string;
  /** One-line plain-language restatement shown in the provenance card. */
  detail?: string;
  verdict: Verdict;
  /** Non-empty. Enforced by assertEvidence at build time. */
  evidence: Evidence[];
}

export interface ProjectLink {
  label: "REPO" | "LIVE" | "DEEP DIVE" | "CITATION";
  href: string;
}

export interface DecisionRecord {
  id: string;
  title: string;
  context: string;
  options: { option: string; rejected: boolean; reason: string }[];
  decision: string;
  consequences: string;
}

export interface Project {
  slug: string;
  name: string;
  /** Case number in the audit, 1-based; Tier 2/3 projects omit it. */
  caseNumber?: number;
  oneLiner: string;
  problem: string;
  invariant: string;
  approach: string;
  stack: string[];
  verdicts: Verdict[];
  claims: Claim[];
  decisions: DecisionRecord[];
  limitation: string;
  links: ProjectLink[];
  tier: 1 | 2 | 3;
  category: "backend" | "ai-ml" | "research" | "systems" | "product" | "hackathon" | "practice";
  year: string;
}

export interface TimelineNode {
  date: string;
  title: string;
  detail: string;
  claimId?: string;
}

export interface Principle {
  id: string;
  title: string;
  body: string;
  provenRepos: { name: string; href: string }[];
}
