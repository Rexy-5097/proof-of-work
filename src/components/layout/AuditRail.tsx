"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { auditSections } from "@/data/site";
import { Seal } from "@/components/primitives/Seal";
import { useAuditProgress } from "@/components/providers/AuditProgressProvider";
import { useLenis } from "@/components/providers/LenisProvider";
import { useSound } from "@/components/providers/SoundProvider";

/**
 * Navigation as checklist (design/04-components.md). Desktop ≥1280 only;
 * smaller viewports get <ScrollProgress> instead. The interlude section
 * intentionally stamps ◈ in flag red — the audit's one honest "no".
 */
export function AuditRail() {
  const { visited, current } = useAuditProgress();
  const { scrollTo } = useLenis();
  const { play } = useSound();
  const pathname = usePathname();
  const done = visited.size;
  const total = auditSections.length;

  // The audit is its own route now; every other page gets ScrollProgress.
  if (pathname !== "/proof") return null;

  return (
    <nav
      aria-label="Audit progress"
      className="fixed top-1/2 left-0 z-40 hidden w-[var(--rail-width)] -translate-y-1/2 flex-col items-center xl:flex"
    >
      <ol className="flex flex-col gap-4">
        {auditSections.map((s) => {
          const isVisited = visited.has(s.id);
          const isCurrent = current === s.id;
          const isNull = s.id === "interlude";
          return (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(`#${s.id}`);
                  play("tap");
                }}
                aria-current={isCurrent ? "location" : undefined}
                className="group flex min-h-6 items-center gap-2 py-0.5"
              >
                {isVisited ? (
                  <Seal state={isNull ? "null" : "verified"} size={9} />
                ) : (
                  <Seal state="pending" size={9} />
                )}
                <span
                  className={cn(
                    "font-mono text-micro tabular transition-colors duration-[var(--dur-tick)]",
                    isCurrent ? "text-ink-hi" : "text-ink-lo group-hover:text-ink-md",
                  )}
                >
                  {s.number}
                </span>
                <span
                  className={cn(
                    "mono-label pointer-events-none max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-[var(--dur-ui)]",
                    "group-hover:max-w-40 group-hover:opacity-100 group-focus-visible:max-w-40 group-focus-visible:opacity-100",
                    isCurrent && "text-ink-md",
                  )}
                >
                  {s.label}
                </span>
              </a>
            </li>
          );
        })}
      </ol>
      <p className="mt-6 -rotate-90 font-mono text-micro whitespace-nowrap text-ink-lo tabular">
        {done}/{total}
      </p>
    </nav>
  );
}
