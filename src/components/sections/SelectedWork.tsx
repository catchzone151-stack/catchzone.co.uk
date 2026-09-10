import Link from "next/link";
import { featuredProjects } from "@/data/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FeaturedProjectCard } from "@/components/work/FeaturedProjectCard";
import { AtmosphereLayer } from "@/components/ui/AtmosphereLayer";

export function SelectedWork() {
  const [hero] = featuredProjects;

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
          description="One flagship product, shown in full. The same team that built this would build yours."
        />

        {hero && (
          <div className="mt-16">
            <FeaturedProjectCard project={hero} />
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
