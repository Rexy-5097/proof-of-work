import { allClaims } from "@/data/registry";
import { ledger } from "@/data/ledger";
import type { Claim } from "@/data/types";

/**
 * The evidence plate — what <EvidenceReveal> shows under the hero.
 *
 * What this site has under every sentence is the evidence for it. So the
 * hidden layer is generated, not photographed (the portrait's own scan is
 * printed over it separately, by <EvidenceReveal>): an
 * audit log typeset from the same claim registry the boot sequence counts,
 * one record per claim — value, label, verdict glyph, each source path,
 * fingerprint and verification date. Nothing on it is decorative filler;
 * every line is a real record a visitor could go and check.
 */

interface Run {
  text: string;
  color: string;
}

type Line = Run[];

export interface PlateTokens {
  ground: string;
  ink: string;
  mid: string;
  dim: string;
  data: string;
  seal: string;
  flag: string;
  caution: string;
  line: string;
}

/** Read the live theme tokens, so the plate re-prints correctly after the
 *  droplet theme transition rather than carrying dark ink onto paper. */
export function readPlateTokens(el: Element): PlateTokens {
  const cs = getComputedStyle(el);
  const v = (name: string) => cs.getPropertyValue(name).trim();
  return {
    ground: v("--bg-0"),
    ink: v("--ink-hi"),
    mid: v("--ink-md"),
    dim: v("--ink-lo"),
    data: v("--data"),
    seal: v("--seal"),
    flag: v("--flag"),
    caution: v("--caution"),
    line: v("--line-strong"),
  };
}

function glyphFor(claim: Claim, t: PlateTokens): Run {
  switch (claim.verdict) {
    case "null":
    case "closed":
      return { text: "◈", color: t.flag };
    case "experimental":
      return { text: "◆", color: t.caution };
    default:
      return { text: "◆", color: t.seal };
  }
}

/** "https://github.com/Rexy-5097/ASTRA/blob/main/x.py" → "ASTRA/x.py" */
function shortPath(href: string): string {
  const gh = /github\.com\/Rexy-5097\/([^/#?]+)(?:\/blob\/[^/]+\/)?([^#?]*)/.exec(href);
  if (gh) return [gh[1], gh[2]].filter(Boolean).join("/");
  return href.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function recordFor(claim: Claim, t: PlateTokens): Line[] {
  const lines: Line[] = [
    [
      glyphFor(claim, t),
      { text: ` ${claim.value}`, color: t.ink },
      { text: `  ${claim.label}`, color: t.mid },
    ],
  ];
  claim.evidence.forEach((ev, i) => {
    const branch = i === claim.evidence.length - 1 ? "└" : "├";
    lines.push([
      { text: `  ${branch} ${ev.kind.padEnd(9)} `, color: t.dim },
      { text: shortPath(ev.href), color: t.data },
    ]);
    if (ev.hash) {
      lines.push([
        { text: "  │   sha256 ", color: t.dim },
        { text: `${ev.hash.slice(0, 24)}…`, color: t.data },
      ]);
    }
  });
  const latest = claim.evidence.map((e) => e.verifiedAt).sort().at(-1);
  lines.push([{ text: `    verified ${latest ?? "—"} · ${claim.verdict.toUpperCase()}`, color: t.dim }]);
  lines.push([]);
  return lines;
}

/**
 * Typeset the plate into `ctx` at the canvas's own pixel size. Columns of
 * records, each column starting at a different point in the registry so
 * neighbouring columns never read as a repeated block; the ledger's repo
 * names run along the top as the index of what is being audited.
 */
export function drawEvidencePlate(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number,
  tokens: PlateTokens,
  monoFamily: string,
): void {
  ctx.clearRect(0, 0, width, height);

  const size = 12 * dpr;
  const lh = 18 * dpr;
  const colW = 470 * dpr;
  const pad = 28 * dpr;

  // The plate has its own ground. Without it the log is printed straight
  // onto the temple and loses every line that crosses a lit panel; with it,
  // the lens reads as a window cut through the scene onto a darker layer.
  ctx.globalAlpha = 0.8;
  ctx.fillStyle = tokens.ground;
  ctx.fillRect(0, 0, width, height);
  ctx.globalAlpha = 1;

  // A faint construction grid, the same 72px rhythm as the hero blueprint,
  // so the revealed layer reads as the drawing under the drawing.
  ctx.strokeStyle = tokens.line;
  ctx.globalAlpha = 0.35;
  ctx.lineWidth = Math.max(1, dpr * 0.5);
  const grid = 72 * dpr;
  ctx.beginPath();
  for (let x = 0; x < width; x += grid) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, height);
  }
  for (let y = 0; y < height; y += grid) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(width, y + 0.5);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;

  ctx.font = `400 ${size}px ${monoFamily}`;
  ctx.textBaseline = "top";

  // Index strip: every repository in the archive.
  let x = pad;
  const header = `AUDIT LOG · ${allClaims.length} CLAIMS · ${ledger.length} REPOSITORIES ·`;
  ctx.fillStyle = tokens.dim;
  ctx.fillText(header, x, pad);
  x += ctx.measureText(header).width + 10 * dpr;
  for (const entry of ledger) {
    const w = ctx.measureText(entry.name).width;
    if (x + w > width - pad) break;
    ctx.fillStyle = tokens.data;
    ctx.fillText(entry.name, x, pad);
    x += w + 14 * dpr;
  }

  const records = allClaims.map((c) => recordFor(c, tokens));
  const cols = Math.max(1, Math.ceil((width - pad) / colW));
  const top = pad + lh * 2;

  for (let col = 0; col < cols; col++) {
    let recordIndex = (col * 7) % records.length;
    let lineInRecord = 0;
    const cx = pad + col * colW;
    for (let y = top; y < height - lh; y += lh) {
      const record = records[recordIndex]!;
      const line = record[lineInRecord]!;
      let rx = cx;
      for (const run of line) {
        ctx.fillStyle = run.color;
        ctx.fillText(run.text, rx, y);
        rx += ctx.measureText(run.text).width;
      }
      lineInRecord++;
      if (lineInRecord >= record.length) {
        lineInRecord = 0;
        recordIndex = (recordIndex + 1) % records.length;
      }
    }
  }
}
