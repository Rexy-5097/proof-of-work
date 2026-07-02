import { renderOgCard, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Hidden-state geometry for LLM security — Engineering Journal, Soumyadeb Tripathy";

export default function Image() {
  return renderOgCard({
    label: "ENGINEERING JOURNAL",
    title: "Hidden-state geometry for LLM security",
    footer: "SOUMYADEB TRIPATHY — TECHNICAL NOTEBOOK",
  });
}
