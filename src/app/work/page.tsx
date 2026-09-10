import type { Metadata } from "next";
import Link from "next/link";
import { featuredProjects, roadmapCategories } from "@/data/projects";
import { clientWork } from "@/data/clientWork";
import { FeaturedProjectCard } from "@/components/work/FeaturedProjectCard";
import { ProjectCard } from "@/components/work/ProjectCard";
import { ClientWorkCard } from "@/components/work/ClientWorkCard";
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
  const sortedClientWork = [...clientWork].sort((a, b) => a.order - b.order);

  return (
    <div className="pt-32">
      <section className="border-b border-line pb-16">
        <div className="shell">
          <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">
            Work
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold text-ink md:text-5xl">
            Products taken from idea to working software.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted">
            Real CatchZone products and real client work, each labelled
            clearly: live, client work, in development, or product lab.
          </p>
        </div>
      </section>

      {/* A. Featured / Live Products */}
      {hero && (
        <section className="overflow-hidden py-16 md:py-20">
          <div className="shell">
            <FeaturedProjectCard project={hero} />
          </div>
        </section>
      )}

      {live.length > 0 && (
        <section className="pb-16 md:pb-20">
          <div className="shell">
            <h2 className="font-display text-xl font-bold text-ink">Live</h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {live.map((project, i) => (
                <ProjectCard key={project.slug} project={project} delay={i * 0.06} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* B. Client Work — order is mandatory: Blossom, then FDE */}
      {sortedClientWork.length > 0 && (
        <section className="border-t border-line bg-surface py-16 md:py-20">
          <div className="shell space-y-20">
            <div>
              <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">
                Client Work
              </p>
              <h2 className="mt-3 font-display text-xl font-bold text-ink md:text-2xl">
                Real websites, built for real clients.
              </h2>
            </div>
            {sortedClientWork.map((project) => (
              <ClientWorkCard key={project.slug} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* C. In Development */}
      {inDevelopment.length > 0 && (
        <section className="pb-16 pt-16 md:pb-20 md:pt-20">
          <div className="shell">
            <h2 className="font-display text-xl font-bold text-ink">
              In Development
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {inDevelopment.map((project, i) => (
                <ProjectCard key={project.slug} project={project} delay={i * 0.06} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* D. Future / Product Lab */}
      <section className="border-t border-line bg-surface py-16 md:py-20">
        <div className="shell">
          <h2 className="font-display text-xl font-bold text-ink">
            Future / Product Lab
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
            Category hubs already reserved for upcoming CatchZone products —
            labelled as roadmap, ahead of a full case study.
          </p>
          {productLab.length > 0 && (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {productLab.map((project, i) => (
                <ProjectCard key={project.slug} project={project} delay={i * 0.06} />
              ))}
            </div>
          )}
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
