import Link from "next/link";
import { featuredProjects } from "@/data/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FeaturedProjectCard } from "@/components/work/FeaturedProjectCard";
import { ProjectCard } from "@/components/work/ProjectCard";
import { AtmosphereLayer } from "@/components/ui/AtmosphereLayer";

export function SelectedWork() {
  const [hero, ...rest] = featuredProjects;

  return (
    <section
      id="work"
      className="relative overflow-hidden border-t border-line bg-void py-24 md:py-32"
    >
      <AtmosphereLayer />
      <div className="shell relative z-10">
        <SectionHeading
          index="05"
          eyebrow="Selected Work"
          title="Real CatchZone products, not stock mockups."
          description="Every product here is our own — built, shipped and maintained by the same team that would build yours."
        />

        {hero && (
          <div className="mt-16">
            <FeaturedProjectCard project={hero} />
          </div>
        )}

        {rest.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((project, i) => (
              <ProjectCard key={project.slug} project={project} delay={i * 0.06} />
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent-cyan"
          >
            See the full body of work
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
