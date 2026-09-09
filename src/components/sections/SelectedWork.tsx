import Link from "next/link";
import { featuredProject, projects, roadmapCategories } from "@/data/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FeaturedProjectCard } from "@/components/work/FeaturedProjectCard";
import { ProjectCard } from "@/components/work/ProjectCard";
import { Reveal } from "@/components/ui/Reveal";

export function SelectedWork() {
  const secondary = projects.filter((p) => p.slug !== featuredProject.slug);

  return (
    <section
      id="work"
      className="border-t border-line bg-void py-24 md:py-32"
    >
      <div className="shell">
        <SectionHeading
          index="05"
          eyebrow="Selected Work"
          title="Real CatchZone products, not stock mockups."
          description="Every product here is our own — built, shipped and maintained by the same team that would build yours."
        />

        <div className="mt-16">
          <FeaturedProjectCard project={featuredProject} />
        </div>

        {secondary.length > 0 && (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {secondary.map((project, i) => (
              <ProjectCard key={project.slug} project={project} delay={i * 0.06} />
            ))}
          </div>
        )}

        <Reveal className="mt-14 rounded-2xl border border-line bg-surface p-8 md:p-10">
          <p className="mono text-xs uppercase tracking-[0.25em] text-ink-faint">
            Product Lab
          </p>
          <h3 className="mt-3 font-display text-xl font-bold text-ink md:text-2xl">
            A wider roadmap of category-specific products
          </h3>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
            Beyond the products above, CatchZone maintains an active roadmap
            across {roadmapCategories.length} product categories — each with
            a reserved destination on the site, honestly labelled as
            in-progress rather than dressed up as finished work.
          </p>
          <Link
            href="/work"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-cyan"
          >
            See the full roadmap
            <span aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
