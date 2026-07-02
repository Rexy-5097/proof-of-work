"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { auditSections, type AuditSectionId } from "@/data/site";

interface AuditProgress {
  /** Sections that have been seen at least once. An audit never un-checks. */
  visited: ReadonlySet<AuditSectionId>;
  /** The section currently under review. */
  current: AuditSectionId | null;
}

const AuditProgressContext = createContext<AuditProgress>({
  visited: new Set(),
  current: null,
});

export function AuditProgressProvider({ children }: { children: ReactNode }) {
  const [visited, setVisited] = useState<ReadonlySet<AuditSectionId>>(new Set());
  const [current, setCurrent] = useState<AuditSectionId | null>(null);

  useEffect(() => {
    const els = auditSections
      .map(({ id }) => document.querySelector<HTMLElement>(`[data-audit-section="${id}"]`))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const id = entry.target.getAttribute("data-audit-section") as AuditSectionId;
          if (!entry.isIntersecting) continue;
          setCurrent(id);
          setVisited((prev) => {
            if (prev.has(id)) return prev;
            const next = new Set(prev);
            next.add(id);
            return next;
          });
        }
      },
      // A section counts as "under review" when a meaningful part is visible.
      { rootMargin: "-30% 0px -50% 0px" },
    );
    for (const el of els) io.observe(el);
    return () => io.disconnect();
  }, []);

  const value = useMemo(() => ({ visited, current }), [visited, current]);
  return (
    <AuditProgressContext.Provider value={value}>
      {children}
    </AuditProgressContext.Provider>
  );
}

export function useAuditProgress(): AuditProgress {
  return useContext(AuditProgressContext);
}
