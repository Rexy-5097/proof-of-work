import { cn } from "@/lib/cn";
import type { ReactNode } from "react";
import type { AuditSectionId } from "@/data/site";

/**
 * A chapter of the audit. Registers the section id for the AuditRail
 * (observed in 3B) and provides the standard vertical rhythm.
 */
export function Section({
  id,
  labelledBy,
  className,
  children,
}: {
  id: AuditSectionId;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      data-audit-section={id}
      aria-labelledby={labelledBy}
      className={cn("relative scroll-mt-24 py-20 md:py-28 lg:py-40", className)}
    >
      {children}
    </section>
  );
}

export function Container({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn("mx-auto w-full max-w-[var(--content-max)] px-[var(--page-margin)]", className)}
    >
      {children}
    </div>
  );
}
