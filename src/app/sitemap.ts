import type { MetadataRoute } from "next";
import { projects } from "@/data/projects";

const siteUrl = "https://catchzone.co.uk";

const staticRoutes = [
  "",
  "/work",
  "/services",
  "/services/apps",
  "/services/web",
  "/services/systems",
  "/about",
  "/start-a-project",
  "/privacy",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = staticRoutes.map((route) => ({
    url: `${siteUrl}${route}`,
    lastModified: new Date(),
  }));

  const projectEntries = projects.map((project) => ({
    url: `${siteUrl}/work/${project.slug}`,
    lastModified: new Date(),
  }));

  return [...staticEntries, ...projectEntries];
}
