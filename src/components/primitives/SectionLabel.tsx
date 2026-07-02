import { cn } from "@/lib/cn";

/** Mono section marker: `04 / EVIDENCE`. */
export function SectionLabel({
  number,
  label,
  as: Tag = "p",
  className,
}: {
  number: string;
  label: string;
  as?: "p" | "h2" | "h3";
  className?: string;
}) {
  return (
    <Tag className={cn("mono-label", className)}>
      <span className="text-ink-md">{number}</span>
      <span aria-hidden="true"> / </span>
      {label}
    </Tag>
  );
}
