import { renderOgCard, OG_SIZE } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt =
  "Proof of Work — Soumyadeb Tripathy. I build software that stays correct when things fail — and I publish the evidence.";

export default function Image() {
  return renderOgCard({
    label: "PROOF OF WORK",
    title:
      "I build software that stays correct when things fail — and I publish the evidence.",
    footer: "SOUMYADEB TRIPATHY — BACKEND · APPLIED AI",
  });
}
