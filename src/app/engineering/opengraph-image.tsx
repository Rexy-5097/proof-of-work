import { renderOgCard, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Engineering Journal — Soumyadeb Tripathy";

export default function Image() {
  return renderOgCard({
    label: "ENGINEERING JOURNAL",
    title: "Notes written to the same standard as the code.",
    footer: "SOUMYADEB TRIPATHY — TECHNICAL NOTEBOOK",
  });
}
