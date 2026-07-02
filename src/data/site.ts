export const site = {
  name: "Soumyadeb Tripathy",
  title: "Soumyadeb Tripathy — Proof of Work",
  description:
    "I build software that stays correct when things fail — and I publish the evidence. Backend systems, applied AI, and distributed computing, verified claim by claim.",
  url: "https://proof-of-work-roan.vercel.app",
  email: "soumyadeb043@gmail.com",
  github: "https://github.com/Rexy-5097",
  repo: "https://github.com/Rexy-5097/proof-of-work",
  linkedin: "https://www.linkedin.com/in/soumyadeb-tripathy/",
  leetcode: "https://leetcode.com/u/ApexRaptor_5097/",
} as const;

export const auditSections = [
  { id: "landing", number: "00", label: "THE CLAIM" },
  { id: "thesis", number: "01", label: "VERIFICATION" },
  { id: "about", number: "02", label: "THE ENGINEER" },
  { id: "principles", number: "03", label: "CONSTRAINTS" },
  { id: "evidence", number: "04", label: "EVIDENCE" },
  { id: "interlude", number: "05", label: "NULL RESULT" },
  { id: "timeline", number: "06", label: "TRAJECTORY" },
  { id: "index", number: "07", label: "THE LEDGER" },
  { id: "capabilities", number: "08", label: "INSTRUMENTATION" },
  { id: "telemetry", number: "09", label: "TELEMETRY" },
  { id: "contact", number: "10", label: "OPEN CHANNEL" },
] as const;

export type AuditSectionId = (typeof auditSections)[number]["id"];
