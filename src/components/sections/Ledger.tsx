"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Container } from "@/components/layout/Section";
import { SectionLabel } from "@/components/primitives/SectionLabel";
import { Reveal } from "@/components/primitives/Reveal";
import { ledger, type LedgerCategory, type LedgerStatus } from "@/data/ledger";
import { useSound } from "@/components/providers/SoundProvider";

const FILTERS: { label: string; value: LedgerCategory | "all" }[] = [
  { label: "ALL", value: "all" },
  { label: "BACKEND", value: "backend" },
  { label: "AI–ML", value: "ai-ml" },
  { label: "RESEARCH", value: "research" },
  { label: "SYSTEMS", value: "systems" },
  { label: "PRODUCT", value: "product" },
  { label: "TOOLING", value: "tooling" },
  { label: "PRACTICE", value: "practice" },
];

type SortKey = "year" | "name" | "status";

const statusStyle: Record<LedgerStatus, string> = {
  deployed: "text-data",
  research: "text-data",
  closed: "text-flag",
  active: "text-ink-md",
  hackathon: "text-caution",
  practice: "text-ink-lo",
};

/** 07 / ENGINEERING LEDGER — the complete archive as a dense catalog. */
export function Ledger() {
  const [filter, setFilter] = useState<LedgerCategory | "all">("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<SortKey>("year");
  const { play } = useSound();

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ledger
      .filter((e) => filter === "all" || e.category === filter)
      .filter(
        (e) =>
          q === "" ||
          e.name.toLowerCase().includes(q) ||
          e.oneLiner.toLowerCase().includes(q) ||
          e.stack.some((s) => s.toLowerCase().includes(q)),
      )
      .sort((a, b) => {
        if (sort === "year") return b.year.localeCompare(a.year) || a.name.localeCompare(b.name);
        if (sort === "status") return a.status.localeCompare(b.status) || a.name.localeCompare(b.name);
        return a.name.localeCompare(b.name);
      });
  }, [filter, query, sort]);

  return (
    <Container>
      <Reveal>
        <SectionLabel number="07" label="ENGINEERING LEDGER" as="h2" className="mb-4" />
        <p className="mb-8 max-w-[var(--measure)] text-ink-md">
          The complete archive — all 17 public repositories, nothing curated
          out. Five appear above as examined cases; the ledger holds the rest
          of the record.
        </p>
      </Reveal>

      <Reveal delay={0.05}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              aria-pressed={filter === f.value}
              onClick={() => {
                setFilter(f.value);
                play("tap");
              }}
              className={cn(
                "mono-label cursor-pointer rounded-full border px-3.5 py-1.5 transition-colors duration-[var(--dur-tick)]",
                filter === f.value
                  ? "border-ink-md text-ink-hi"
                  : "border-line hover:border-line-strong hover:text-ink-md",
              )}
            >
              {f.label}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-3">
            <label className="sr-only" htmlFor="ledger-search">
              Search the ledger
            </label>
            <input
              id="ledger-search"
              type="search"
              placeholder="grep…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-36 rounded-r2 border border-line bg-bg-1 px-3 py-1.5 font-mono text-[0.8125rem] text-ink-hi placeholder:text-ink-lo focus:border-line-strong focus:outline-none md:w-48"
            />
            <label className="sr-only" htmlFor="ledger-sort">
              Sort entries
            </label>
            <select
              id="ledger-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className="cursor-pointer rounded-r2 border border-line bg-bg-1 px-2 py-1.5 font-mono text-micro text-ink-md focus:border-line-strong focus:outline-none"
            >
              <option value="year">SORT: YEAR</option>
              <option value="name">SORT: NAME</option>
              <option value="status">SORT: STATUS</option>
            </select>
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse">
            <thead>
              <tr className="border-y border-line-strong">
                {["ENTRY", "DESCRIPTION", "STACK", "STATUS", "YEAR", "LINKS"].map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="mono-label px-3 py-2.5 text-left text-[0.6875rem] first:pl-0 last:pr-0 last:text-right"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((e) => (
                <tr
                  key={e.name}
                  className="group border-b border-line transition-colors duration-[var(--dur-tick)] hover:bg-bg-1"
                >
                  <td className="py-3 pr-3 pl-0 font-mono text-[0.8125rem] font-medium whitespace-nowrap text-ink-hi">
                    {e.name}
                  </td>
                  <td className="max-w-[34ch] px-3 py-3 text-[0.8125rem] leading-snug text-ink-md">
                    {e.oneLiner}
                  </td>
                  <td className="px-3 py-3 font-mono text-micro whitespace-nowrap text-ink-lo">
                    {e.stack.slice(0, 3).join(" · ")}
                  </td>
                  <td className={cn("px-3 py-3 font-mono text-micro uppercase", statusStyle[e.status])}>
                    {e.status}
                  </td>
                  <td className="px-3 py-3 font-mono text-micro text-ink-lo tabular">{e.year}</td>
                  <td className="py-3 pr-0 pl-3 text-right font-mono text-micro whitespace-nowrap">
                    {e.caseAnchor ? (
                      <Link href={e.caseAnchor} className="mr-3 text-seal hover:text-seal-bright">
                        CASE ↑
                      </Link>
                    ) : null}
                    <a href={e.repo} target="_blank" rel="noopener noreferrer" className="text-data hover:text-ink-hi">
                      REPO ↗
                    </a>
                    {e.live ? (
                      <a href={e.live} target="_blank" rel="noopener noreferrer" className="ml-3 text-data hover:text-ink-hi">
                        LIVE ↗
                      </a>
                    ) : null}
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center font-mono text-[0.8125rem] text-ink-lo">
                    0 ENTRIES MATCH — <span className="text-flag">◈</span> claim not found
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        <p className="mt-4 font-mono text-micro text-ink-lo">
          TOTAL: {rows.length}/{ledger.length} ENTRIES · 8 LANGUAGES · 4 DEPLOYED ·
          SOURCE: github.com/Rexy-5097
        </p>
      </Reveal>
    </Container>
  );
}
