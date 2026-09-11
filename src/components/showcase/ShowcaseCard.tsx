import Link from "next/link";
import type { ShowcaseProject } from "@/data/showcase";
import { DeviceFrame } from "@/components/showcase/DeviceFrame";
import { Reveal } from "@/components/ui/Reveal";

export function ShowcaseCard({
  project,
  delay = 0,
  featured = false,
}: {
  project: ShowcaseProject;
  delay?: number;
  featured?: boolean;
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
      className={`group overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:border-ink/25 ${featured ? "sm:col-span-2 lg:col-span-3" : ""}`}
    >
      <Link
        href={`/work/concept/${project.slug}`}
        className={`flex h-full ${featured ? "flex-col md:flex-row" : "flex-col"}`}
      >
        <div
          className={`relative flex items-center justify-center overflow-hidden bg-surface-raised p-6 ${featured ? "md:w-[58%] md:p-10" : "aspect-[4/3]"}`}
        >
          <DeviceFrame
            kind={project.cardFrame}
            src={cover.src}
            alt={cover.alt}
            accent={accent}
            compact
            className={featured ? "max-w-[520px]" : ""}
            sizes={featured ? "(min-width: 768px) 500px, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
          />
        </div>
        <div className={`flex flex-1 flex-col p-6 ${featured ? "justify-center md:p-10" : ""}`}>
          <p className="mono text-[11px] uppercase tracking-wider text-ink-faint">
            {project.category}
          </p>
          <h3
            className={`mt-2 font-display font-bold text-ink ${featured ? "text-2xl md:text-3xl" : "text-lg"}`}
          >
            {project.name}
          </h3>
          <p
            className={`mt-2 flex-1 text-sm leading-relaxed text-ink-muted ${featured ? "max-w-md" : ""}`}
          >
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
