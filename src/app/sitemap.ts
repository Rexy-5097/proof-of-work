import type { MetadataRoute } from "next";
import { site } from "@/data/site";
import { journal } from "@/data/journal";
import { allClaims } from "@/data/registry";
import { assertEvidence } from "@/data/assert";

// The evidence gate runs here on every production build: a claim without
// a source fails the deploy (design/07-architecture.md §3).
assertEvidence(allClaims, "sitemap build gate (all registered claims)");

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: site.url, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${site.url}/proof`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${site.url}/engineering`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    ...journal.map((entry) => ({
      url: `${site.url}/engineering/${entry.slug}`,
      lastModified: new Date(entry.date),
      changeFrequency: "yearly" as const,
      priority: 0.7,
    })),
    { url: `${site.url}/resume`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
  ];
}
