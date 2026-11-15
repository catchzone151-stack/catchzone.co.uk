import Image from "next/image";
import Link from "next/link";
import type { Project, ProjectStatus } from "@/data/projects";
import { Reveal } from "@/components/ui/Reveal";
import { BrandDeviceArt } from "@/components/work/BrandDeviceArt";
import { StoreBadges } from "@/components/work/StoreBadges";

const STATUS_STYLE: Record<ProjectStatus, string> = {
  live: "text-accent-cyan",
  "in-development": "text-accent-iris",
  "product-lab": "text-ink-faint",
};

export function ProjectCard({ project, delay = 0 }: { project: Project; delay?: number }) {
  return (
    <Reveal
      delay={delay}
      className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:border-ink/25"
    >
      <Link href={`/work/${project.slug}`} className="flex flex-1 flex-col">
        {/* Banner art is 1024×500: show it whole; other cards keep 4:3 device art. */}
        <div className={`relative overflow-hidden bg-surface-raised ${project.heroAsset ? "aspect-[1024/500]" : "aspect-[4/3]"}`}>
          {project.heroAsset ? (
            <Image
              src={project.heroAsset}
              alt={`${project.title} preview`}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 ease-cinematic group-hover:scale-105"
            />
          ) : project.accent && project.brandGlyph ? (
            <BrandDeviceArt
              title={project.title}
              statusLabel={project.type}
              accent={project.accent}
              glyph={project.brandGlyph}
              variant="card"
              className="h-full w-full"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-[radial-gradient(circle_at_50%_40%,rgba(110,98,229,0.08),transparent_65%)]">
              <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">
                {project.type}
              </span>
              <span className="mono text-xs uppercase tracking-widest text-ink-faint/70">
                {project.title}
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
          <p className={`mt-4 text-xs font-medium ${STATUS_STYLE[project.status]}`}>
            {project.statusLabel}
          </p>
        </div>
      </Link>
      {/* Store badges sit outside the case-study link (no nested links). */}
      {project.status === "live" && (project.playStoreUrl || project.appStoreUrl) && (
        <div className="border-t border-line px-6 py-4">
          <StoreBadges
            playStoreUrl={project.playStoreUrl}
            appStoreUrl={project.appStoreUrl}
            appName={project.title}
            size="sm"
            iosPlaceholder={false}
            iosNote=""
          />
        </div>
      )}
    </Reveal>
  );
}
