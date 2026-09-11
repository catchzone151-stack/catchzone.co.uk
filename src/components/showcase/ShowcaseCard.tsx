import Link from "next/link";
import type { ShowcaseProject } from "@/data/showcase";
import { DeviceFrame } from "@/components/showcase/DeviceFrame";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Work-landing thumbnail for the six supporting client systems. The device
 * is the visual focus — large and readable, filling most of the tile width
 * — with a compact information panel underneath. Per
 * docs/CATCHZONE_REFINEMENT_BRIEF.md section 8: no tiny screen floating in
 * a large empty box.
 */
export function ShowcaseCard({
  project,
  delay = 0,
}: {
  project: ShowcaseProject;
  delay?: number;
}) {
  const cover = project.images[0]!;
  const accent = {
    chassis: [project.accent.primary, "#050506"] as [string, string],
    ring: project.accent.ring,
    glow: project.accent.glow,
  };

  return (
    <Reveal
      delay={delay}
      className="group overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:border-ink/25"
    >
      <Link href={`/work/concept/${project.slug}`} className="flex h-full flex-col">
        <div className="relative flex items-center justify-center overflow-hidden bg-surface-raised px-4 pb-3 pt-7 sm:px-5">
          <DeviceFrame
            kind={project.cardFrame}
            src={cover.src}
            alt={cover.alt}
            accent={accent}
            compact
            className="w-full"
            sizes="(min-width: 1024px) 33vw, 100vw"
          />
        </div>
        <div className="flex flex-1 flex-col border-t border-line p-5">
          <p className="mono text-[11px] uppercase tracking-wider text-ink-faint">
            {project.category}
          </p>
          <h3 className="mt-2 font-display text-lg font-bold text-ink">
            {project.name}
          </h3>
          <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-muted">
            {project.tagline}
          </p>
          <span
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold"
            style={{ color: project.accent.accent }}
          >
            View project
            <span aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
