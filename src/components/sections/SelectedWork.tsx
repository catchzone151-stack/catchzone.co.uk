import Link from "next/link";
import { featuredProjects } from "@/data/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FeaturedProjectCard } from "@/components/work/FeaturedProjectCard";
import { AtmosphereLayer } from "@/components/ui/AtmosphereLayer";

export function SelectedWork() {
  const [hero, ...rest] = featuredProjects;
  const otherLive = rest.filter((p) => p.status === "live");

  return (
    <section
      id="work"
      className="relative overflow-hidden border-t border-line bg-void py-24 md:py-32"
    >
      <AtmosphereLayer tone="cyan" />
      <div className="shell relative z-10">
        <SectionHeading
          index="05"
          eyebrow="Featured Build"
          title="Taken from idea to working software."
          description="One flagship product, shown in full — built end-to-end by CatchZone, the same connected approach behind every build."
        />

        {hero && (
          <div className="mt-16">
            <FeaturedProjectCard project={hero} />
          </div>
        )}

        {otherLive.length > 0 && (
          <div className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-line pt-8 text-center">
            <p className="mono text-xs uppercase tracking-wider text-ink-faint">
              Also live on Google Play
            </p>
            {otherLive.map((project) => (
              <Link
                key={project.slug}
                href={`/work/${project.slug}`}
                className="text-sm font-semibold text-ink transition-colors hover:text-accent-cyan"
              >
                {project.title}
              </Link>
            ))}
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            href="/work"
            className="inline-flex items-center gap-2 text-sm font-semibold text-accent-cyan"
          >
            View All Work
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
