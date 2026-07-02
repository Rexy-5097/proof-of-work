import { Seal } from "./Seal";
import type { DecisionRecord } from "@/data/types";

/**
 * An architecture decision record as a native disclosure — keyboard and
 * screen-reader complete with zero JS. Rejected options are struck and
 * carry their reason; compromises are shown, not hidden.
 */
export function DecisionRecordItem({ record }: { record: DecisionRecord }) {
  return (
    <details className="group border-t border-line py-3 first:border-t-0">
      <summary className="flex cursor-pointer list-none items-baseline gap-3 font-mono text-[0.8125rem] text-ink-md transition-colors duration-[var(--dur-tick)] hover:text-ink-hi [&::-webkit-details-marker]:hidden">
        <span className="text-micro text-ink-lo">{record.id}</span>
        <span className="uppercase tracking-[0.04em]">{record.title}</span>
        <span
          aria-hidden="true"
          className="ml-auto text-ink-lo transition-transform duration-[var(--dur-ui)] group-open:rotate-90"
        >
          ▸
        </span>
      </summary>
      <div className="space-y-3 pt-3 pb-1 pl-0 text-sm leading-relaxed text-ink-md md:pl-12">
        <p>
          <span className="mono-label">CONTEXT — </span>
          {record.context}
        </p>
        <ul className="space-y-1.5">
          {record.options.map((o) => (
            <li key={o.option} className="flex items-baseline gap-2 font-mono text-[0.8125rem]">
              <Seal state={o.rejected ? "null" : "verified"} size={9} className="shrink-0 self-center" />
              <span className={o.rejected ? "text-ink-lo line-through decoration-flag/50" : "text-ink-hi"}>
                {o.option}
              </span>
              {o.rejected ? <span className="text-micro text-ink-lo">— {o.reason}</span> : null}
            </li>
          ))}
        </ul>
        <p>
          <span className="mono-label text-seal">DECISION — </span>
          {record.decision}
        </p>
        <p>
          <span className="mono-label text-caution">ACCEPTED COST — </span>
          {record.consequences}
        </p>
      </div>
    </details>
  );
}
