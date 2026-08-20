import type { Project } from "../types";

const R = "https://github.com/Rexy-5097/cartograph";

export const cartograph: Project = {
  slug: "cartograph",
  name: "Cartograph",
  caseNumber: 2,
  oneLiner: "Architecture graphs that show their evidence, not their guesses.",
  problem:
    "Ask a code-intelligence tool what a checkout button touches and it answers with the files that import each other. That is a lexical fact; the question was a causal one. A React component, an HTTP route, a Python handler and a database table are four artefacts in three languages with no shared symbol table — and the gap between the import graph and the real call chain is where production incidents live.",
  invariant:
    "No edge without evidence. Ambiguous candidates produce no edge at all, and no language model ever constructs graph structure.",
  approach:
    "A Rust workspace that derives a symbol-level, cross-language graph from source. tree-sitter extracts symbols, imports, call sites and route declarations from TypeScript/TSX and Python; a resolver canonicalises four route dialects into one comparable shape, partially evaluates dynamically constructed URLs, and only then joins a call site to a handler. Every edge it draws stores how it was known — confidence, provenance, the evidence string, and the commit it was observed at.",
  stack: ["Rust", "tree-sitter", "petgraph", "TypeScript/TSX + Python analysis"],
  verdicts: ["active", "research"],
  claims: [
    {
      id: "cg-chain",
      value: "TS → Python",
      label: "CROSS-STACK CHAIN RESOLVES",
      detail:
        "a TypeScript call site is matched to a Python handler and becomes an evidenced graph edge — the chain the product exists to produce",
      verdict: "verified",
      evidence: [
        { label: "cross_stack + full_stack tests", href: `${R}/tree/main/crates/cartograph-resolver/tests`, kind: "code", verifiedAt: "2026-08-21" },
        { label: "README — what works today", href: `${R}#what-works-today`, kind: "readme", verifiedAt: "2026-08-21" },
      ],
    },
    {
      id: "cg-milestone",
      value: "M06 / 17",
      label: "MILESTONE — PRE-ALPHA",
      detail:
        "the repository states plainly what does not exist yet; `cartograph analyze` is not implemented",
      verdict: "active",
      evidence: [
        { label: "README — status", href: `${R}#readme`, kind: "readme", verifiedAt: "2026-08-21" },
      ],
    },
    {
      id: "cg-crates",
      value: "6",
      label: "RUST CRATES",
      detail: "core · graph · parser · resolver · cli · testkit — each with its own test suite",
      verdict: "verified",
      evidence: [
        { label: "crates/", href: `${R}/tree/main/crates`, kind: "code", verifiedAt: "2026-08-21" },
      ],
    },
    {
      id: "cg-adr",
      value: "13",
      label: "ARCHITECTURE DECISION RECORDS",
      detail:
        "including ADR-0007: no LLM constructs graph structure — an immutable principle, not a current limitation",
      verdict: "verified",
      evidence: [
        { label: "docs/adr", href: `${R}/tree/main/docs/adr`, kind: "report", verifiedAt: "2026-08-21" },
      ],
    },
  ],
  decisions: [
    {
      id: "ADR-0007",
      title: "No language model may propose an edge.",
      context:
        "An LLM could plausibly infer relationships the static analysis cannot resolve, and it would look impressive in a demo.",
      options: [
        { option: "Let a model fill gaps the resolver cannot close", rejected: true, reason: "a plausible edge is indistinguishable from a real one once it is in the graph; the graph stops being evidence" },
        { option: "Deterministic analysis first, evidence second, inference third — the model last, and never in the graph", rejected: false, reason: "" },
      ],
      decision:
        "A model may explain a subgraph after static analysis has produced it. It may never propose an edge. This is recorded as an immutable architectural principle.",
      consequences:
        "Coverage grows more slowly, and some real relationships stay unresolved until a compiler problem is solved properly. In exchange, every edge in the graph means the same thing.",
    },
    {
      id: "ADR-002",
      title: "Refusing to answer, rather than guessing.",
      context:
        "Dynamically constructed URLs, ambiguous route candidates and calls to absolute hosts all resist resolution.",
      options: [
        { option: "Emit a best-guess edge with a low confidence score", rejected: true, reason: "consumers read the edge and ignore the score" },
        { option: "Decline the edge and record why", rejected: false, reason: "" },
      ],
      decision:
        "Ambiguous candidates produce no edge, an unresolved URL prefix is declined until the milestone that can evaluate it, and a call to an absolute host is never joined to a local route.",
      consequences:
        "The graph is deliberately incomplete. That is the difference between a map and a guess.",
    },
  ],
  limitation:
    "Pre-alpha at milestone M06 of 17. The desktop app and MCP integration do not exist, and `cartograph analyze` is not implemented — the README says so before it says anything else. What exists is the extraction, canonicalisation and cross-stack resolution core, with tests.",
  links: [{ label: "REPO", href: R }],
  tier: 1,
  category: "systems",
  year: "2026",
};
