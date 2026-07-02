import { cn } from "@/lib/cn";
import type { Verdict } from "@/data/types";

type SealState = "pending" | "verified" | "null" | "experimental";

export function verdictToSealState(verdict: Verdict): SealState {
  switch (verdict) {
    case "null":
    case "closed":
      return "null";
    case "experimental":
      return "experimental";
    default:
      return "verified";
  }
}

const stateColor: Record<SealState, string> = {
  pending: "text-ink-lo",
  verified: "text-seal",
  null: "text-flag",
  experimental: "text-caution",
};

/**
 * The seal glyph: ◇ pending → ◆ verified → ◈ null/closed.
 * Pure SVG so the stamp animation can scale it without text jitter.
 */
export function Seal({
  state,
  size = 12,
  className,
}: {
  state: SealState;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 12 12"
      aria-hidden="true"
      className={cn("inline-block shrink-0", stateColor[state], className)}
    >
      <path
        d="M6 0.8 L11.2 6 L6 11.2 L0.8 6 Z"
        fill={state === "pending" ? "none" : "currentColor"}
        stroke="currentColor"
        strokeWidth="1.2"
      />
      {state === "null" && (
        <path d="M2.6 2.6 L9.4 9.4" stroke="var(--bg-0)" strokeWidth="1.4" />
      )}
    </svg>
  );
}
