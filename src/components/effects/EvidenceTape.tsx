import { Seal, verdictToSealState } from "@/components/primitives/Seal";
import { flagshipProjects } from "@/data/projects";
import { thesisClaims } from "@/data/claims";

interface TapeItem {
  id: string;
  value: string;
  label: string;
  source: string;
  href: string;
  state: ReturnType<typeof verdictToSealState>;
}

/** Thesis first, then the two lead readings of every examined case. */
const ITEMS: TapeItem[] = [
  ...thesisClaims.map((c) => ({
    id: c.id,
    value: c.value,
    label: c.label,
    source: "THESIS",
    href: "#thesis",
    state: verdictToSealState(c.verdict),
  })),
  ...flagshipProjects.flatMap((p) =>
    p.claims.slice(0, 2).map((c) => ({
      id: c.id,
      value: c.value,
      label: c.label,
      source: p.name.toUpperCase(),
      href: p.slug === "helios" ? "#interlude" : `#case-${p.slug}`,
      state: verdictToSealState(c.verdict),
    })),
  ),
];

function Run({ copy }: { copy: 0 | 1 }) {
  return (
    <ul
      className="flex shrink-0 items-center gap-10 pr-10"
      // The second run exists only to make the loop seamless. It is hidden
      // from assistive tech and taken out of the tab order, so a keyboard
      // walk meets each reading once.
      aria-hidden={copy === 1 || undefined}
      inert={copy === 1 || undefined}
    >
      {ITEMS.map((item) => (
        <li key={`${copy}-${item.id}`} className="flex items-center">
          <a
            href={item.href}
            className="flex items-center gap-2.5 font-mono text-micro tracking-[0.14em] whitespace-nowrap text-ink-lo uppercase transition-colors duration-[var(--dur-tick)] hover:text-ink-md"
          >
            <Seal state={item.state} size={9} />
            <span className="tabular text-ink-hi normal-case tracking-normal">{item.value}</span>
            <span>{item.label}</span>
            <span className="text-ink-lo/70">— {item.source}</span>
          </a>
        </li>
      ))}
    </ul>
  );
}

/**
 * The evidence tape — a hero ticker band loaded with readings instead of
 * job titles. Every item is a real claim with its verdict glyph,
 * and every item is a link down to the case that produced it, so the band
 * is an index of the audit rather than a slogan reel.
 *
 * Server-rendered, CSS-driven: one transform keyframe on the compositor,
 * no JS. It pauses under the pointer and on keyboard focus (you can read
 * and follow what you are pointing at), and under reduced motion it does
 * not move at all — it becomes a static strip you scroll sideways.
 */
export function EvidenceTape({ className }: { className?: string }) {
  return (
    <div
      className={
        "evidence-tape group/tape relative overflow-hidden border-y border-line bg-bg-0/70 py-3.5 " +
        (className ?? "")
      }
    >
      <p className="sr-only">Selected verified readings — each links to the case that produced it.</p>
      <div className="evidence-tape-track flex w-max">
        <Run copy={0} />
        <Run copy={1} />
      </div>
      {/* Edge fades, so readings enter and leave rather than being cut. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-bg-0 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-bg-0 to-transparent"
      />
    </div>
  );
}
