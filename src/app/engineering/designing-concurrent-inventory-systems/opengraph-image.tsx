import { renderOgCard, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Designing concurrent inventory systems — Engineering Journal, Soumyadeb Tripathy";

export default function Image() {
  return renderOgCard({
    label: "ENGINEERING JOURNAL",
    title: "Designing concurrent inventory systems",
    footer: "SOUMYADEB TRIPATHY — TECHNICAL NOTEBOOK",
  });
}
