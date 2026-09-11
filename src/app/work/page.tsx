import type { Metadata } from "next";
import Link from "next/link";
import { featuredProjects, roadmapCategories } from "@/data/projects";
import { clientWork } from "@/data/clientWork";
import { sortedShowcaseProjects } from "@/data/showcase";
import { FeaturedProjectCard } from "@/components/work/FeaturedProjectCard";
import { ProjectCard } from "@/components/work/ProjectCard";
import { ClientWorkCard } from "@/components/work/ClientWorkCard";
import { ShowcaseCard } from "@/components/showcase/ShowcaseCard";
import { DeviceFrame } from "@/components/showcase/DeviceFrame";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Work",
  description:
    "CatchZone's range — business systems, CatchZone's own products, and real client work.",
  alternates: { canonical: "/work" },
};

export default function WorkPage() {
  const [heroApp, ...restApps] = featuredProjects;
  const live = restApps.filter((p) => p.status === "live");
  const productLab = restApps.filter((p) => p.status === "product-lab");
  const inDevelopment = restApps.filter((p) => p.status === "in-development");
  const sortedClientWork = [...clientWork].sort((a, b) => a.order - b.order);

  const [foundryLane, ...otherSystems] = sortedShowcaseProjects;
  const foundryAccent = foundryLane
    ? {
        chassis: [foundryLane.accent.primary, "#050506"] as [string, string],
        ring: foundryLane.accent.ring,
        glow: foundryLane.accent.glow,
      }
    : null;
  const foundryCover = foundryLane?.images[0];

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
            Sophisticated business systems, CatchZone&apos;s own live
            products, and real client work — each labelled clearly.
          </p>
        </div>
      </section>

      {/* 1. Foundry Lane Events — opening feature. Elevated purely through
          scale/composition/motion, never a "Showpiece" label. */}
      {foundryLane && foundryAccent && foundryCover && (
        <section className="border-b border-line pb-20 pt-4 md:pb-28 md:pt-8">
          <div className="shell">
            <p
              className="mono text-xs uppercase tracking-[0.25em]"
              style={{ color: foundryLane.accent.accent }}
            >
              {foundryLane.category}
            </p>
            <h2 className="mt-4 max-w-3xl font-display text-3xl font-bold text-ink md:text-5xl">
              {foundryLane.tagline}
            </h2>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted">
              {foundryLane.name}
            </p>
            <div className="mt-8">
              <Link
                href={`/work/concept/${foundryLane.slug}`}
                className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
              >
                View System
              </Link>
            </div>
            <DeviceFrame
              kind={foundryLane.cardFrame}
              src={foundryCover.src}
              alt={foundryCover.alt}
              accent={foundryAccent}
              className="mx-auto mt-16 max-w-[1040px]"
              sizes="(min-width: 1024px) 1000px, 100vw"
              priority
            />
          </div>
        </section>
      )}

      {/* 2. The other six business systems */}
      {otherSystems.length > 0 && (
        <section className="border-b border-line py-16 md:py-20">
          <div className="shell">
            <h2 className="font-display text-xl font-bold text-ink md:text-2xl">
              Six more businesses. Six connected systems.
            </h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {otherSystems.map((project, i) => (
                <ShowcaseCard key={project.slug} project={project} delay={i * 0.05} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3. CatchZone-owned apps/products */}
      <section className="border-b border-line py-16 md:py-20">
        <div className="shell">
          <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">
            CatchZone Products
          </p>
          <h2 className="mt-3 font-display text-xl font-bold text-ink md:text-2xl">
            Real apps, designed, built and operated by CatchZone.
          </h2>
        </div>
      </section>

      {heroApp && (
        <section className="overflow-hidden pb-16 md:pb-20">
          <div className="shell">
            <FeaturedProjectCard project={heroApp} />
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

      {inDevelopment.length > 0 && (
        <section className="pb-16 md:pb-20">
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

      <section className="border-b border-line bg-surface py-16 md:py-20">
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

      {/* 4. Real client / delivered web work — last */}
      {sortedClientWork.length > 0 && (
        <section className="py-16 md:py-20">
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
    </div>
  );
}
