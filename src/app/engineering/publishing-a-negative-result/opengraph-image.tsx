import { renderOgCard, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Lessons from publishing a negative result — Engineering Journal, Soumyadeb Tripathy";

export default function Image() {
  return renderOgCard({
    label: "ENGINEERING JOURNAL",
    title: "Lessons from publishing a negative result",
    footer: "SOUMYADEB TRIPATHY — TECHNICAL NOTEBOOK",
  });
}
