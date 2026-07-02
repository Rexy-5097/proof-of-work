# Phase 1C — Information Architecture
The site is structured as a **narrative in three acts**, not a stack of resume sections. Concept name (working): **"PROOF OF WORK"** — every claim on the site is paired with its evidence, and the interface itself behaves like an audit trail. This is the original identity that separates it from every template portfolio: the *storytelling mechanic* is verification.

---

## Narrative Arc

- **Act I — The Claim** (who I am, what I promise)
- **Act II — The Evidence** (the work, examined like an audit)
- **Act III — The Verdict** (how I work, where I'm going, how to reach me)

## Page Structure (single-page cinematic scroll + two secondary routes)

### `/` — Main experience

1. **00 / Landing — "The Claim"**
   Name, positioning line ("I build software that stays correct when things fail — and I publish the evidence"), role targets, subtle live signal (current GitHub commit hash of the portfolio itself as a provenance mark). Scroll cue.

2. **01 / Thesis strip — "Verified"**
   3–4 hard numbers, each visually "stamped" as verified with a link to its source: `0.15ms P99` · `8/8 audit checks` · `17 systems shipped` · `1 published null result`. Sets the audit mechanic immediately.

3. **02 / About — "The Engineer"**
   Personal story (the "I got interested in the moment things break" narrative). Compact. Photo optional.

4. **03 / Principles — "Operating Constraints"**
   The four engineering principles, each rendered like a system rule with the projects that prove it.

5. **04 / Featured Work — "The Evidence"** *(core of the site, ~60% of scroll)*
   Six case studies, each a full-viewport cinematic sequence: problem → invariant → architecture → verified result → live link/repo. Order: **FurnitureOps → nexus-rtb-engine → GEOFENCE-LLM → ASTRA → DDSO → Helios-Dx** (backend credibility first, research depth building to the null-result as the emotional peak). Raptor-AI and zkhealth-fhe appear as "extended evidence" cards bridging into the index.

6. **05 / The Null Result — "Interlude"** *(unique storytelling beat)*
   A quiet, typographically distinct moment for Helios-Dx: "The experiment that said no." This is the section visitors remember.

7. **06 / Timeline — "Trajectory"**
   Nov 2025 → present, the escalation narrative (risk systems → LLM security → privacy → kernel → publication-grade research). Scroll-driven.

8. **07 / All Projects — "The Index"**
   Dense, filterable grid of all 17 repos (filter: Backend / AI–ML / Research / Systems / Product / Hackathon). Each row: name, one-liner, stack, status (deployed / research / closed / practice), links.

9. **08 / Capabilities — "Instrumentation"**
   Skills by category + fundamentals note (500+ DSA). Rendered as a system readout, not badge soup.

10. **09 / GitHub Telemetry**
    Live stats: contribution graph, language distribution, repo count. Framed as telemetry, consistent with the audit mechanic. (No star counts — intensity, not social proof.)

11. **10 / Contact — "Open Channel"**
    Email (primary CTA), GitHub, LinkedIn, LeetCode, resume download.

12. **Footer — "Colophon"**
    Built-with note, source link to the portfolio repo (the portfolio itself becomes evidence), last-deployed timestamp, license.

### `/work/[slug]` — Case-study deep dives (secondary route)
Full write-ups for the six featured projects: architecture diagram, decisions, failure modes, verified metrics, honest limitations. Keeps the main scroll cinematic while giving technical reviewers depth. Also makes each project shareable/SEO-indexable.

### `/resume` — Print-optimized one-pager (tertiary)

## Sections deliberately cut (and why)

- **Experience / employment** — no public evidence of employment; the timeline of shipped systems replaces it. Add when real experience exists.
- **Open-source contributions** — no external contributions found; faking it with own-repo commits would undermine the entire thesis.
- **Separate Hackathons section** — only one confirmed hackathon; it lives in the Index with a "Hackathon" filter tag instead of a thin dedicated section.
- **Separate Research section** — research *is* the featured work (ASTRA, GEOFENCE, Helios-Dx); duplicating it would dilute the arc. "Research" becomes an Index filter + the Null Result interlude.
- **Testimonials** — none exist; nothing erodes credibility faster than invented ones.

## Content-to-evidence contract (rule for all future phases)

Every number displayed on the site must carry a hover/tap "source" affordance linking to the repo file or report that produced it. If a claim can't be sourced, it doesn't ship. This rule is the design system's soul and will drive Phase 2 (visual language of stamps, hashes, telemetry) and Phase 4 (motion language of scanning, verifying, revealing).

## Pre-launch housekeeping (owner actions)

1. Fix apexos `homepage` field (currently the literal string `{{YOUR_DOMAIN}}`).
2. Clarify crypto-ai-decision-system provenance (README clone URL references `Himanish-18`) — feature it only after clarification.
3. RESONANCE README clone URL references `Start-Up-Inc/Resonance` — same.
4. Decide on a custom domain (e.g. `soumyadeb.dev`) before Phase 5 SEO work.
