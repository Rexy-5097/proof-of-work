import { cn } from "@/lib/cn";
import type { Verdict } from "@/data/types";

const verdictStyles: Record<Verdict, string> = {
  verified: "text-seal border-line-seal bg-seal-dim",
  null: "text-flag border-flag/40 bg-flag-dim",
  closed: "text-flag border-flag/40 bg-flag-dim",
  experimental: "text-caution border-caution/40 bg-caution-dim",
  deployed: "text-data border-data/40 bg-data-dim",
  research: "text-data border-data/40 bg-data-dim",
  practice: "text-ink-lo border-line bg-bg-2",
};

const verdictLabels: Record<Verdict, string> = {
  verified: "VERIFIED",
  null: "NULL RESULT",
  closed: "CLOSED",
  experimental: "EXPERIMENTAL",
  deployed: "DEPLOYED",
  research: "RESEARCH",
  practice: "PRACTICE",
};

export function VerdictBadge({
  verdict,
  className,
}: {
  verdict: Verdict;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-block rounded-r1 border px-2 py-1 font-mono text-micro font-medium tracking-[0.06em]",
        verdictStyles[verdict],
        className,
      )}
    >
      {verdictLabels[verdict]}
    </span>
  );
}
