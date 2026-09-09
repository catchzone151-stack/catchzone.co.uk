import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/projects";
import { Reveal } from "@/components/ui/Reveal";

export function ProjectCard({ project, delay = 0 }: { project: Project; delay?: number }) {
  return (
    <Reveal
      delay={delay}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:border-ink/25"
    >
      <Link href={`/work/${project.slug}`} className="flex h-full flex-col">
        <div className="relative aspect-[4/3] bg-surface-raised">
          {project.heroAsset ? (
            <Image
              src={project.heroAsset}
              alt={`${project.title} preview`}
              fill
              className="object-cover transition-transform duration-500 ease-cinematic group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="mono text-xs uppercase tracking-widest text-ink-faint">
                {project.type}
              </span>
            </div>
          )}
        </div>
        <div className="flex flex-1 flex-col p-6">
          <p className="mono text-[11px] uppercase tracking-wider text-ink-faint">
            {project.type}
          </p>
          <h3 className="mt-2 font-display text-lg font-bold text-ink">
            {project.title}
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
            {project.shortDescription}
          </p>
          <p className="mt-4 text-xs font-medium text-accent-cyan">
            {project.statusLabel}
          </p>
        </div>
      </Link>
    </Reveal>
  );
}
