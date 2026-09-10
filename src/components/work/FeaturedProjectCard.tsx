import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";
import { Reveal } from "@/components/ui/Reveal";
import { ScreenCascade } from "@/components/work/ScreenCascade";

export function FeaturedProjectCard({ project }: { project: Project }) {
  const cascadeShots = (project.screenshots ?? []).filter((_, i) => i % 2 === 0).slice(0, 4);

  return (
    <Reveal className="grid gap-10 overflow-hidden rounded-3xl border border-line bg-surface-raised p-8 md:grid-cols-2 md:p-12">
      <div className="flex flex-col justify-center">
        <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">
          Featured Build
        </p>
        <h3 className="mt-4 font-display text-3xl font-bold text-ink md:text-4xl">
          {project.title}
        </h3>
        <p className="mt-4 text-sm font-medium text-ink-muted">
          {project.statusLabel}
        </p>
        <p className="mt-5 max-w-md text-base leading-relaxed text-ink-muted">
          {project.shortDescription}
        </p>

        <ul className="mt-6 flex flex-wrap gap-2">
          {project.capabilities.slice(0, 4).map((cap) => (
            <li
              key={cap}
              className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-muted"
            >
              {cap}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-5">
          <Link
            href={`/work/${project.slug}`}
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
          >
            View Case Study
          </Link>
          {project.playStoreUrl && (
            <a
              href={project.playStoreUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-ink transition-colors hover:text-accent-cyan"
            >
              Open on Google Play →
            </a>
          )}
        </div>
      </div>

      {cascadeShots.length >= 2 ? (
        <ScreenCascade images={cascadeShots} alt={project.title} className="min-h-[440px]" />
      ) : project.heroAsset ? (
        <div className="relative min-h-[300px] overflow-hidden rounded-2xl border border-line">
          <Image
            src={project.heroAsset}
            alt={`${project.title} banner`}
            fill
            className="object-cover"
          />
        </div>
      ) : null}
    </Reveal>
  );
}
