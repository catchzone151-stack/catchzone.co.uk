import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/data/services";
import { projects } from "@/data/projects";
import { ServiceHero } from "@/components/work/ServiceHero";
import { ServiceBody } from "@/components/work/ServiceBody";
import { ProjectCard } from "@/components/work/ProjectCard";

const service = services.find((s) => s.slug === "apps")!;
const relatedProjects = projects.filter((p) => p.type === "Mobile App" && p.status !== "product-lab");

export const metadata: Metadata = {
  title: service.shortName,
  description: service.description,
  alternates: { canonical: "/services/apps" },
};

export default function AppsServicePage() {
  return (
    <div>
      <ServiceHero service={service} coreState="mobile" />
      <ServiceBody service={service} accent="cyan" />

      {relatedProjects.length > 0 && (
        <section className="border-t border-line bg-surface py-16 md:py-20">
          <div className="shell">
            <h2 className="font-display text-xl font-bold text-ink">
              Related Work
            </h2>
            <p className="mt-2 max-w-xl text-sm text-ink-muted">
              Real CatchZone apps built with this exact discipline.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProjects.map((project) => (
                <ProjectCard key={project.slug} project={project} />
              ))}
            </div>
            <Link
              href="/work"
              className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent-cyan"
            >
              See all work
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
