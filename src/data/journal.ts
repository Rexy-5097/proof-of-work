export interface JournalEntry {
  number: string;
  slug: string;
  title: string;
  abstract: string;
  date: string;
  readingMinutes: number;
  tags: string[];
}

/** The technical notebook's table of contents. Articles live as MDX in app/engineering/. */
export const journal: JournalEntry[] = [
  {
    number: "001",
    slug: "publishing-a-negative-result",
    title: "Lessons from publishing a negative result",
    abstract:
      "Helios-Dx set out to find a quantum advantage for privacy-preserving medical inference. It found none. What closing a study honestly — capacity-matched, seeded, citable — taught me about engineering discipline.",
    date: "2026-07-02",
    readingMinutes: 7,
    tags: ["research", "integrity", "quantum", "FHE"],
  },
  {
    number: "002",
    slug: "designing-concurrent-inventory-systems",
    title: "Designing concurrent inventory systems",
    abstract:
      "One invariant — stock is never oversold — defended through idempotency keys, a Redis queue, and a row-locking Postgres transaction. Why the queue exists, why optimistic locking wasn't enough, and what it cost.",
    date: "2026-07-02",
    readingMinutes: 9,
    tags: ["backend", "concurrency", "postgres", "redis"],
  },
  {
    number: "003",
    slug: "hidden-state-geometry",
    title: "Hidden-state geometry for LLM security",
    abstract:
      "Text filters read what attackers write. GEOFENCE-LLM reads what the model does: trajectory geometry across layers, windowed features, and a fail-closed authority — plus the honest numbers that keep it a research direction.",
    date: "2026-07-02",
    readingMinutes: 8,
    tags: ["llm-security", "interpretability", "research"],
  },
];
