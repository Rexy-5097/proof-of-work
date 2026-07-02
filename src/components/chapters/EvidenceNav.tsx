"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { chapters } from "@/data/projects";
import { useLenis } from "@/components/providers/LenisProvider";
import { useSound } from "@/components/providers/SoundProvider";

const ITEMS = [
  ...chapters.map((p) => ({
    id: `case-${p.slug}`,
    number: String(p.caseNumber).padStart(2, "0"),
    label: p.name.toUpperCase(),
  })),
  { id: "interlude", number: "──", label: "NULL RESULT" },
];

/**
 * Orientation inside the evidence act: a sticky case index that tracks
 * the chapter under review and jumps between chapters.
 */
export function EvidenceNav() {
  const [active, setActive] = useState<string | null>(null);
  const { scrollTo } = useLenis();
  const { play } = useSound();

  useEffect(() => {
    const els = ITEMS.map(({ id }) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-35% 0px -55% 0px" },
    );
    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <nav
      aria-label="Case index"
      className="sticky top-14 z-30 border-y border-line bg-bg-0/85 px-[var(--page-margin)] backdrop-blur-md"
    >
      <ol className="flex items-center gap-1 overflow-x-auto py-2.5 [scrollbar-width:none]">
        {ITEMS.map((item) => {
          const isActive = active === item.id;
          const isNull = item.id === "interlude";
          return (
            <li key={item.id} className="shrink-0">
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "location" : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(`#${item.id}`);
                  play("tap");
                }}
                className={cn(
                  "mono-label rounded-r1 px-3 py-1.5 transition-colors duration-[var(--dur-tick)]",
                  isActive
                    ? isNull
                      ? "bg-flag-dim text-flag"
                      : "bg-seal-dim text-seal"
                    : "hover:bg-bg-2 hover:text-ink-md",
                )}
              >
                <span className="tabular">{item.number}</span>
                <span className="ml-2 hidden sm:inline">{item.label}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
