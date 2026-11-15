import Link from "next/link";
import { featuredProjects } from "@/data/projects";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { VoiceSpotlight } from "@/components/sections/VoiceSpotlight";
import { AtmosphereLayer } from "@/components/ui/AtmosphereLayer";

export function SelectedWork() {
  // The homepage feature is CatchZone Voice. IslamQuest stays a featured
  // Live card on /work (with its own case study) but is not shown on the homepage.
  const otherLive = featuredProjects.filter((p) => p.status === "live" && p.slug !== "islamquest");

  return (
    <section
      id="work"
      className="relative overflow-x-clip bg-void pb-24 pt-10 md:pb-32 md:pt-16"
    >
      <AtmosphereLayer tone="cyan" />
      {/* feathers the hand-off from the journey's final scene */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-void via-void/70 to-transparent"
        aria-hidden="true"
      />
      <div className="shell relative z-10">
        <SectionHeading
          index="05"
          eyebrow="Featured Product"
          title="Conversations without language barriers."
          description="CatchZone Voice — our own real-time speech translation product, designed and built end-to-end by CatchZone."
        />

        <div className="mt-16">
          <VoiceSpotlight />
        </div>

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
