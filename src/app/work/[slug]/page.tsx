import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projects, STATUS_LABEL, type ProjectStatus } from "@/data/projects";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { ScreenCascade } from "@/components/work/ScreenCascade";
import { getIslamQuestHeroShots } from "@/lib/work/islamquestShots";
import { GooglePlayIcon } from "@/components/icons/GooglePlayIcon";

const STATUS_BADGE_STYLE: Record<ProjectStatus, string> = {
  live: "border-accent-cyan/30 text-accent-cyan",
  "in-development": "border-accent-iris/30 text-accent-iris",
  "product-lab": "border-ink/20 text-ink-faint",
};

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.shortDescription,
    alternates: { canonical: `/work/${project.slug}` },
  };
}

export default function ProjectPage({ params }: { params: { slug: string } }) {
  const project = projects.find((p) => p.slug === params.slug);
  if (!project) notFound();

  const allShots = project.screenshots ?? [];
  const cascadeShots =
    project.slug === "islamquest" && allShots.length >= 5
      ? getIslamQuestHeroShots(allShots)
      : allShots.filter((_, i) => i % 2 === 0).slice(0, 4);
  const hasDepth = Boolean(project.challenge || project.build);
  const hasSidebar = Boolean(
    project.capabilities.length || project.platforms?.length || project.technicalHighlights?.length,
  );

  return (
    <div className="pt-32">
      <section className="border-b border-line pb-16">
        <div className="shell">
          <p className="mono text-xs">
            <Link href="/work" className="text-ink-muted hover:text-ink">
              Work
            </Link>
            <span className="text-ink-faint"> / </span>
            <span className="text-ink-muted">{project.title}</span>
          </p>

          <div className="mt-6 flex flex-wrap items-start justify-between gap-6">
            <div>
              <h1 className="font-display text-4xl font-bold text-ink md:text-5xl">
                {project.title}
              </h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">
                {project.shortDescription}
              </p>
            </div>
            <span
              className={`mono shrink-0 rounded-full border px-4 py-2 text-xs uppercase tracking-wider ${STATUS_BADGE_STYLE[project.status]}`}
            >
              {STATUS_LABEL[project.status]}
            </span>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {project.playStoreUrl && (
              <MagneticLink
                href={project.playStoreUrl}
                external
                className="flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-void"
              >
                <GooglePlayIcon className="h-5 w-5" />
                Get it on Google Play
              </MagneticLink>
            )}
            {project.internalUrl && (
              <Link
                href={project.internalUrl}
                className="rounded-full border border-line px-6 py-3 text-sm font-semibold text-ink transition-colors hover:border-ink/40"
              >
                View product page
              </Link>
            )}
          </div>
        </div>
      </section>

      {cascadeShots.length >= 2 ? (
        <section className="overflow-hidden py-16">
          <div className="shell">
            <ScreenCascade images={cascadeShots} alt={project.title} className="min-h-[440px] md:min-h-[520px]" />
          </div>
        </section>
      ) : project.heroAsset ? (
        <section className="py-16">
          <div className="shell">
            <Reveal className="overflow-hidden rounded-2xl border border-line">
              <Image
                src={project.heroAsset}
                alt={`${project.title} banner`}
                width={1600}
                height={900}
                className="w-full object-cover"
              />
            </Reveal>
          </div>
        </section>
      ) : (
        <section className="py-16">
          <div className="shell">
            <Reveal className="flex min-h-[220px] flex-col items-center justify-center rounded-2xl border border-dashed border-line bg-surface/40 p-10 text-center">
              <p className="mono text-xs uppercase tracking-[0.25em] text-ink-faint">
                {STATUS_LABEL[project.status]}
              </p>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
                This product hasn&apos;t been publicly detailed yet. We&apos;d
                rather leave this page honest than fill it with placeholder
                screens.
              </p>
            </Reveal>
          </div>
        </section>
      )}

      {(hasDepth || hasSidebar) && (
        <section className="pb-16">
          <div
            className={`shell grid gap-12 ${hasDepth && hasSidebar ? "md:grid-cols-[1.1fr_0.9fr]" : ""}`}
          >
            {hasDepth && (
              <div className="space-y-10">
                {project.challenge && (
                  <Reveal>
                    <h2 className="font-display text-xl font-bold text-ink">
                      The Challenge
                    </h2>
                    <p className="mt-3 text-base leading-relaxed text-ink-muted">
                      {project.challenge}
                    </p>
                  </Reveal>
                )}
                {project.build && (
                  <Reveal>
                    <h2 className="font-display text-xl font-bold text-ink">
                      The Build
                    </h2>
                    <p className="mt-3 text-base leading-relaxed text-ink-muted">
                      {project.build}
                    </p>
                  </Reveal>
                )}
              </div>
            )}

            {hasSidebar && (
              <div className="space-y-8">
                {project.capabilities.length > 0 && (
                  <Reveal className="rounded-2xl border border-line bg-surface p-6">
                    <h2 className="mono text-xs uppercase tracking-wider text-ink-faint">
                      Capabilities
                    </h2>
                    <ul className="mt-4 space-y-2.5">
                      {project.capabilities.map((cap) => (
                        <li
                          key={cap}
                          className="flex items-start gap-2 text-sm text-ink-muted"
                        >
                          <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent-cyan" />
                          {cap}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                )}

                {project.platforms && (
                  <Reveal className="rounded-2xl border border-line bg-surface p-6">
                    <h2 className="mono text-xs uppercase tracking-wider text-ink-faint">
                      Platforms
                    </h2>
                    <ul className="mt-4 space-y-2">
                      {project.platforms.map((platform) => (
                        <li key={platform} className="text-sm text-ink-muted">
                          {platform}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                )}

                {project.technicalHighlights && (
                  <Reveal className="rounded-2xl border border-line bg-surface p-6">
                    <h2 className="mono text-xs uppercase tracking-wider text-ink-faint">
                      Technical Highlights
                    </h2>
                    <ul className="mt-4 space-y-2">
                      {project.technicalHighlights.map((item) => (
                        <li key={item} className="text-sm text-ink-muted">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Reveal>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {project.screenshots && project.screenshots.length > 0 && (
        <section className="border-t border-line bg-surface py-16">
          <div className="shell">
            <h2 className="font-display text-xl font-bold text-ink">
              All Screens
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
              {project.screenshots.map((shot, i) => (
                <Reveal
                  key={shot}
                  delay={i * 0.03}
                  className="overflow-hidden rounded-xl border border-line"
                >
                  <Image
                    src={shot}
                    alt={`${project.title} screenshot ${i + 1}`}
                    width={400}
                    height={800}
                    className="w-full object-cover"
                  />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-line py-16 text-center">
        <div className="shell">
          <h2 className="font-display text-xl font-bold text-ink md:text-2xl">
            Have a similar build in mind?
          </h2>
          <div className="mt-6 flex justify-center">
            <MagneticLink
              href="/start-a-project"
              className="rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
            >
              Start a Project
            </MagneticLink>
          </div>
        </div>
      </section>
    </div>
  );
}
