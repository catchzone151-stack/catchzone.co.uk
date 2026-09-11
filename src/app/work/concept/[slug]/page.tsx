import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { showcaseProjects, sortedShowcaseProjects } from "@/data/showcase";
import { ShowcaseSectionBlock } from "@/components/showcase/ShowcaseSectionBlock";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticLink } from "@/components/ui/MagneticLink";

export function generateStaticParams() {
  return showcaseProjects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = showcaseProjects.find((p) => p.slug === slug);
  if (!project) return {};
  return {
    title: `${project.name} — Concept Showcase`,
    description: project.tagline,
    alternates: { canonical: `/work/concept/${project.slug}` },
  };
}

export default async function ConceptShowcasePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = showcaseProjects.find((p) => p.slug === slug);
  if (!project) notFound();

  const orderIndex = sortedShowcaseProjects.findIndex((p) => p.slug === slug);
  const next = sortedShowcaseProjects[(orderIndex + 1) % sortedShowcaseProjects.length]!;

  return (
    <div className="pt-32">
      <section className="border-b border-line pb-16">
        <div className="shell">
          <p className="mono text-xs">
            <Link href="/work" className="text-ink-muted hover:text-ink">
              Work
            </Link>
            <span className="text-ink-faint"> / </span>
            <span className="text-ink-muted">{project.name}</span>
          </p>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
            <div>
              <p
                className="mono text-xs uppercase tracking-[0.25em]"
                style={{ color: project.accent.accent }}
              >
                {project.category}
              </p>
              <h1 className="mt-3 font-display text-4xl font-bold text-ink md:text-5xl">
                {project.name}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">
                {project.tagline}
              </p>
            </div>
            <span className="mono shrink-0 rounded-full border border-line px-4 py-2 text-xs uppercase tracking-wider text-ink-faint">
              Concept Showcase · Private System
            </span>
          </div>
        </div>
      </section>

      <div className="space-y-20 overflow-x-hidden py-20 md:space-y-28 md:py-28">
        {project.sections.map((section, i) => (
          <ShowcaseSectionBlock key={i} project={project} section={section} />
        ))}
      </div>

      <section className="border-t border-line bg-surface py-16 md:py-20">
        <div className="shell">
          <Reveal className="mx-auto max-w-2xl rounded-2xl border border-line bg-void p-6 md:p-8">
            <h2 className="mono text-xs uppercase tracking-wider text-ink-faint">
              Key Capabilities
            </h2>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {project.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-ink-muted">
                  <span
                    className="mt-1.5 h-1 w-1 shrink-0 rounded-full"
                    style={{ background: project.accent.accent }}
                  />
                  {feature}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line py-16 text-center">
        <div className="shell">
          <h2 className="font-display text-xl font-bold text-ink md:text-2xl">
            Have a similar build in mind?
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <MagneticLink
              href="/start-a-project"
              className="rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
            >
              Start a Project
            </MagneticLink>
            <Link
              href={`/work/concept/${next.slug}`}
              className="rounded-full border border-line px-7 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-ink/40"
            >
              Next: {next.name} →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
