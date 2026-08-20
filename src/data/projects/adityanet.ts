import type { Project } from "../types";

const R = "https://github.com/Rexy-5097/AdityaNet";
const LIVE = "https://adityanet-re1t.onrender.com";

export const adityanet: Project = {
  slug: "adityanet",
  name: "AdityaNet",
  caseNumber: 1,
  oneLiner: "A research platform where no number is typed by a person.",
  problem:
    "India's Aditya-L1 mission publishes solar X-ray data from its SoLEXS and HEL1OS instruments, but the archive is hard to use and results built on it are hard to check. The usual failure is quieter than fraud: a figure in prose drifts from the artifact it came from, and nobody notices because re-deriving it is harder than trusting it.",
  invariant:
    "Every rendered figure resolves at build time from a committed artifact — and CI fails the build if a single value drifts from its source.",
  approach:
    "A frozen, digest-addressed dataset derived from both instruments, published alongside its full provenance record and validation history. The site reads every number from committed JSON at build time; a byte-budget and value-drift gate re-reads those artifacts from disk in CI. Evidence routes ship essentially no JavaScript, and a hash-based CSP means the page loads nothing from any external origin.",
  stack: ["Astro 7", "TypeScript (strictest)", "React 19 islands", "Python", "uPlot", "GitHub Actions"],
  verdicts: ["null", "deployed", "research"],
  claims: [
    {
      id: "adi-verdict",
      value: "no gain",
      label: "ML vs. THRESHOLD DETECTOR",
      detail:
        "M/X-class flare nowcast: learned models are not statistically distinguishable from a single threshold on the SoLEXS count rate",
      verdict: "null",
      evidence: [
        { label: "findings — the verdict", href: `${LIVE}/findings/`, kind: "report", verifiedAt: "2026-08-21" },
        { label: "README — research results", href: `${R}#research-results`, kind: "readme", verifiedAt: "2026-08-21" },
      ],
    },
    {
      id: "adi-roc",
      value: "0.954",
      label: "THRESHOLD ROC-AUC — 95% CI [0.940, 0.966]",
      detail:
        "the simple detector; best learned model (random forest) reaches 0.966 [0.956, 0.976] — intervals overlap, so the difference is not distinguishable",
      verdict: "verified",
      evidence: [
        { label: "benchmark tables + frozen protocol", href: `${LIVE}/findings/method/`, kind: "benchmark", verifiedAt: "2026-08-21" },
      ],
    },
    {
      id: "adi-test",
      value: "192,541",
      label: "HELD-OUT TEST MINUTES",
      detail: "581 M/X events, day-block bootstrap 95% CIs, seed 20260718",
      verdict: "verified",
      evidence: [
        { label: "README — research results", href: `${R}#research-results`, kind: "report", verifiedAt: "2026-08-21" },
      ],
    },
    {
      id: "adi-js",
      value: "~0 KB",
      label: "JAVASCRIPT ON EVIDENCE ROUTES",
      detail:
        "five of seven areas are pure HTML/CSS; the one interactive charting island is isolated to a single route, enforced by a per-route byte budget in CI",
      verdict: "verified",
      evidence: [
        { label: "CI workflows", href: `${R}/actions`, kind: "ci", verifiedAt: "2026-08-21" },
        { label: "README — performance", href: `${R}#performance`, kind: "readme", verifiedAt: "2026-08-21" },
      ],
    },
  ],
  decisions: [
    {
      id: "ADR-001",
      title: "Why a build-time gate instead of careful proofreading?",
      context:
        "A research site's credibility rests on the match between its prose and its artifacts. Humans re-checking that by eye is a control that silently degrades the moment the dataset is regenerated.",
      options: [
        { option: "Review figures manually before publishing", rejected: true, reason: "drift is invisible until someone re-derives it; the control fails quietly" },
        { option: "Render every figure from a committed artifact, and gate it in CI", rejected: false, reason: "" },
      ],
      decision:
        "No number is typed by a person. Each figure is resolved from a committed JSON artifact by a code path, and `pnpm budget` re-reads those artifacts from disk in CI — a drifted value fails the build.",
      consequences:
        "Changing a headline number means changing the data and re-running the pipeline. Slower to edit, which is the point: the site cannot claim something its artifacts do not say.",
    },
    {
      id: "ADR-002",
      title: "Publishing the result that does not flatter the method.",
      context:
        "The evaluated models did not beat a single threshold on the count rate. A positive-result incentive buries that finding.",
      options: [
        { option: "Report the best model's higher point estimate as an improvement", rejected: true, reason: "the confidence intervals overlap — that framing would be a claim the data does not support" },
        { option: "Publish the null at full weight, with intervals shown", rejected: false, reason: "" },
      ],
      decision:
        "The verdict is 'no gain', not a ranking. The site plots every model against the simple detector with its 95% interval so a sceptic can see the overlap rather than take the prose on trust.",
      consequences:
        "A less exciting headline. A platform whose central claim is 'our evidence is checkable' only earns it by publishing this kind of result.",
    },
  ],
  limitation:
    "The null applies to the evaluated nowcast tasks and this feature set — it is not a general claim about machine learning on solar data. Persistence, a trivial baseline, scores highest of all (0.982), which says the task is dominated by short-timescale autocorrelation rather than by anything a model learns.",
  links: [
    { label: "LIVE", href: LIVE },
    { label: "REPO", href: R },
  ],
  tier: 1,
  category: "research",
  year: "2026",
};
