import type { Metadata } from "next";
import Link from "next/link";
import { featuredProjects, roadmapCategories } from "@/data/projects";
import { FeaturedProjectCard } from "@/components/work/FeaturedProjectCard";
import { ProjectCard } from "@/components/work/ProjectCard";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Real CatchZone products — live apps, in-development builds and the wider product roadmap.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  const [hero, ...rest] = featuredProjects;
  const live = rest.filter((p) => p.status === "live");
  const productLab = rest.filter((p) => p.status === "product-lab");
  const inDevelopment = rest.filter((p) => p.status === "in-development");

  return (
    <div className="pt-32">
      <section className="border-b border-line pb-16">
        <div className="shell">
          <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">
            Work
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold text-ink md:text-5xl">
            Real products. Built and shipped by CatchZone.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted">
            No client logos to show yet — every product below is our own,
            which means nothing here is dressed up. Status is labelled
            honestly: live, in development, or product lab.
          </p>
        </div>
      </section>

      {hero && (
        <section className="py-16 md:py-20">
          <div className="shell">
            <FeaturedProjectCard project={hero} />
          </div>
        </section>
      )}

      {[
        { label: "Live", items: live },
        { label: "In Development", items: inDevelopment },
        { label: "Product Lab", items: productLab },
      ]
        .filter((group) => group.items.length > 0)
        .map((group) => (
          <section key={group.label} className="pb-16 md:pb-20">
            <div className="shell">
              <h2 className="font-display text-xl font-bold text-ink">
                {group.label}
              </h2>
              <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {group.items.map((project, i) => (
                  <ProjectCard key={project.slug} project={project} delay={i * 0.06} />
                ))}
              </div>
            </div>
          </section>
        ))}

      <section className="border-t border-line bg-surface py-16 md:py-20">
        <div className="shell">
          <h2 className="font-display text-xl font-bold text-ink">
            Wider Roadmap
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
            Category hubs already reserved on the site for upcoming CatchZone
            products. Each is honestly labelled as roadmap, not a finished
            case study.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {roadmapCategories.map((category, i) => (
              <Reveal
                key={category.name}
                delay={i * 0.04}
                className="rounded-xl border border-line bg-void p-5"
              >
                <Link href={category.href} className="block">
                  <h3 className="text-sm font-semibold text-ink">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                    {category.description}
                  </p>
                  <span className="mt-3 inline-block text-xs font-medium text-accent-cyan">
                    Open category →
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
