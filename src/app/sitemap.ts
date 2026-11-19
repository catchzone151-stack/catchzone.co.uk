import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";
import { showcaseProjects } from "@/data/showcase";

const siteUrl = "https://catchzone.co.uk";

/**
 * Indexable public routes with the date their CONTENT last meaningfully
 * changed (from git history) — not the build time. Update a date only when
 * the page's visible content changes. Product Lab concept pages and /apps/*
 * legacy pages are intentionally excluded (noindex).
 */
const staticRoutes: [route: string, lastModified: string][] = [
  ["", "2026-11-14"],
  ["/services", "2026-11-19"],
  ["/services/apps", "2026-09-10"],
  ["/services/web", "2026-09-10"],
  ["/services/systems", "2026-09-10"],
  ["/pricing", "2026-11-19"],
  ["/products", "2026-11-15"],
  ["/voice", "2026-11-15"],
  ["/voice/languages", "2026-11-14"],
  ["/voice/business", "2026-11-15"],
  ["/school-hr", "2026-11-15"],
  ["/work", "2026-10-06"],
  ["/about", "2026-09-10"],
  ["/careers", "2026-11-15"],
  ["/start-a-project", "2026-11-19"],
  ["/privacy", "2026-11-19"],
];

/** Case studies and showcase systems: last content change in projects.ts / showcase.ts. */
const WORK_LAST_MODIFIED = "2026-10-07";

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = staticRoutes.map(([route, lastModified]) => ({
    url: `${siteUrl}${route}`,
    lastModified,
  }));

  const projectEntries = [...projects, ...showcaseProjects].map((project) => ({
    url: `${siteUrl}/work/${project.slug}`,
    lastModified: WORK_LAST_MODIFIED,
  }));

  return [...staticEntries, ...projectEntries];
}
