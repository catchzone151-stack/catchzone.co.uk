import type { Metadata } from "next";
import { ProjectConfigurator } from "@/components/forms/ProjectConfigurator";
import { AtmosphereLayer } from "@/components/ui/AtmosphereLayer";
import { pageMetadata } from "@/lib/seo";
import { BookCallLink } from "@/components/booking/BookCallLink";
import { isBookable } from "@/data/booking";

export const metadata: Metadata = pageMetadata({
  title: "Start a Project — Tell Us What You’re Building | CatchZone",
  description: "Tell CatchZone about the app, platform or business system you need. A short project brief instead of a long contact form — we’ll be in touch to discuss it.",
  path: "/start-a-project",
});

export default function StartAProjectPage() {
  return (
    <div className="relative overflow-hidden pb-24 pt-32">
      <AtmosphereLayer />
      <div className="shell relative z-10 max-w-3xl">
        <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">
          Start a Project
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold text-ink md:text-4xl">
          Let&apos;s start a build.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">
          Five short steps. No technical specification required.
        </p>
        {isBookable("consultation") && (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted">
            Prefer to talk it through first?{" "}
            <BookCallLink
              event="consultation"
              className="font-semibold text-accent-cyan underline decoration-accent-cyan/40 underline-offset-2 hover:decoration-accent-cyan"
            >
              Book a 30-minute project consultation
            </BookCallLink>
            .
          </p>
        )}

        <div className="mt-12">
          <ProjectConfigurator />
        </div>
      </div>
    </div>
  );
}
