import type { Project } from "../types";

const R = "https://github.com/Rexy-5097/FurnitureOps";

export const furnitureops: Project = {
  slug: "furnitureops",
  name: "FurnitureOps",
  caseNumber: 1,
  oneLiner: "One invariant, defended end to end.",
  problem:
    "A naive stock decrement is a race condition: two buyers read the same count, both succeed, and the shop oversells. Handling it at the API layer alone does not survive retried requests, duplicate submissions, or a worker that crashes mid-transaction.",
  invariant:
    "Stock is never oversold — under concurrent purchases, retries, and partial failures.",
  approach:
    "Purchases are accepted at the edge, checked for idempotency, and enqueued to Redis instead of written synchronously. A separate worker drains the queue through a Postgres RPC that row-locks the item, validates stock, and writes the audit log in the same transaction — with retries, a circuit breaker, and a dead-letter queue around it.",
  stack: ["Next.js 14", "TypeScript", "Supabase Postgres", "Upstash Redis", "Playwright"],
  verdicts: ["verified", "deployed"],
  claims: [
    {
      id: "fo-scripts",
      value: "19",
      label: "VERIFICATION SCRIPTS",
      detail: "dedicated concurrency, idempotency, RLS, load and chaos test scripts in scripts/",
      verdict: "verified",
      evidence: [
        { label: "scripts/ directory", href: `${R}/tree/main/scripts`, kind: "code", verifiedAt: "2026-07-02" },
      ],
    },
    {
      id: "fo-lock",
      value: "FOR UPDATE",
      label: "ATOMIC STOCK RPC",
      detail: "decrement_stock_atomic(): row lock, stock check, and audit write in one transaction",
      verdict: "verified",
      evidence: [
        { label: "atomic_stock_rpc.sql", href: `${R}/blob/main/supabase/atomic_stock_rpc.sql`, kind: "code", verifiedAt: "2026-07-02" },
      ],
    },
    {
      id: "fo-rls",
      value: "RLS",
      label: "ACCESS CONTROL IN THE DATABASE",
      detail: "row-level security separates authenticated-read from admin-write below the application layer",
      verdict: "verified",
      evidence: [
        { label: "audit lockdown policies", href: `${R}/blob/main/supabase/audit_lockdown.sql`, kind: "code", verifiedAt: "2026-07-02" },
        { label: "README — architecture", href: `${R}#readme`, kind: "readme", verifiedAt: "2026-07-02" },
      ],
    },
    {
      id: "fo-jwt",
      value: "30min",
      label: "ADMIN JWT MAX AGE",
      detail: "edge middleware rejects admin requests carrying a session token older than 30 minutes",
      verdict: "verified",
      evidence: [
        { label: "edge middleware", href: `${R}/blob/main/src/middleware.ts`, kind: "code", verifiedAt: "2026-07-02" },
      ],
    },
  ],
  decisions: [
    {
      id: "ADR-001",
      title: "Why a queue, not a synchronous write?",
      context:
        "The obvious design writes stock changes inside the request handler. Under load, that couples user latency to database contention and makes retry semantics ambiguous.",
      options: [
        { option: "Synchronous decrement in the API route", rejected: true, reason: "retries and duplicate submissions double-decrement; a crash mid-request loses the order" },
        { option: "Optimistic locking in application code", rejected: true, reason: "does not survive retried requests or a worker dying between read and write" },
        { option: "Idempotency check → Redis queue → single worker", rejected: false, reason: "" },
      ],
      decision:
        "Accept at the edge, deduplicate by idempotency key, enqueue, and let one consumer apply changes through the locking RPC.",
      consequences:
        "Purchases are eventually consistent (queue latency), which the UI must communicate. In exchange: exactly-once effects, calm failure handling, and a database that can be busy without users feeling it.",
    },
    {
      id: "ADR-002",
      title: "Why row locks over application-level checks?",
      context: "The invariant must hold even if every process above the database misbehaves.",
      options: [
        { option: "Check-then-write in the worker", rejected: true, reason: "TOCTOU race between check and write" },
        { option: "SELECT … FOR UPDATE inside a Postgres RPC", rejected: false, reason: "" },
      ],
      decision:
        "decrement_stock_atomic() locks the row, validates available stock, applies the change, and appends the audit entry — one transaction, one place where the invariant lives.",
      consequences:
        "Throughput on a single hot item is serialized by design. Jobs are sorted by item id before processing to avoid deadlocks across items.",
    },
    {
      id: "ADR-003",
      title: "Rate limiter fails open — a documented compromise.",
      context: "Edge rate limiting depends on Redis. What happens when Redis itself is unreachable?",
      options: [
        { option: "Fail closed: reject all traffic without Redis", rejected: true, reason: "turns a cache outage into a full outage; protection becomes self-inflicted denial of service" },
        { option: "Fail open with a logged warning", rejected: false, reason: "" },
      ],
      decision: "Availability wins for the rate limiter; the stock invariant never depends on it.",
      consequences:
        "A Redis outage temporarily removes rate protection — accepted and logged, because correctness is enforced a layer down.",
    },
  ],
  limitation:
    "Single-region queue and database; regional failover is untested. The chaos scripts cover process crashes, not datacenter loss.",
  links: [
    { label: "REPO", href: R },
    { label: "LIVE", href: "https://furniture-ops.vercel.app" },
  ],
  tier: 1,
  category: "backend",
  year: "2026",
};
