import Image from "next/image";
import Link from "next/link";
import type { ShowcaseProject } from "@/data/showcase";
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
          className={`relative overflow-hidden bg-surface-raised ${featured ? "aspect-[16/9] md:aspect-auto md:w-[60%]" : "aspect-[4/3]"}`}
        >
          <div
            className="pointer-events-none absolute inset-0 z-10"
            style={{
              background: `radial-gradient(60% 60% at 50% 0%, ${project.accent.glow}, transparent 70%)`,
            }}
            aria-hidden="true"
          />
          <Image
            src={cover.src}
            alt={cover.alt}
            fill
            sizes={featured ? "(min-width: 768px) 60vw, 100vw" : "(min-width: 1024px) 33vw, 100vw"}
            className="object-cover object-top transition-transform duration-500 ease-cinematic group-hover:scale-105"
          />
          {featured && (
            <span
              className="mono absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-[10px] uppercase tracking-wider text-white"
              style={{ background: project.accent.accent }}
            >
              Showpiece
            </span>
          )}
        </div>
        <div className={`flex flex-1 flex-col p-6 ${featured ? "justify-center md:p-10" : ""}`}>
          <p className="mono text-[11px] uppercase tracking-wider text-ink-faint">
            {project.category}
          </p>
          <h3 className={`mt-2 font-display font-bold text-ink ${featured ? "text-2xl md:text-3xl" : "text-lg"}`}>
            {project.name}
          </h3>
          <p className={`mt-2 flex-1 text-sm leading-relaxed text-ink-muted ${featured ? "max-w-md" : ""}`}>
            {project.tagline}
          </p>
          <p
            className="mt-4 text-xs font-medium"
            style={{ color: project.accent.accent }}
          >
            Concept Showcase
          </p>
        </div>
      </Link>
    </Reveal>
  );
}
