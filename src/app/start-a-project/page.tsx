import type { Metadata } from "next";
import { ProjectConfigurator } from "@/components/forms/ProjectConfigurator";

export const metadata: Metadata = {
  title: "Start a Project",
  description:
    "Tell CatchZone what you're building — a short configurator, not a corporate contact form.",
};

export default function StartAProjectPage() {
  return (
    <div className="pt-32 pb-24">
      <div className="shell max-w-3xl">
        <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">
          Start a Project
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold text-ink md:text-4xl">
          Let&apos;s start a build.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">
          Five short steps. No technical specification required.
        </p>

        <div className="mt-12">
          <ProjectConfigurator />
        </div>
      </div>
    </div>
  );
}
