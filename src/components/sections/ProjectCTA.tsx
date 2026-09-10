import { Reveal } from "@/components/ui/Reveal";
import { MagneticLink } from "@/components/ui/MagneticLink";

export function ProjectCTA() {
  return (
    <section className="relative overflow-hidden border-t border-line bg-surface py-24 md:py-32">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgba(110,98,229,0.14), transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div className="shell relative text-center">
        <Reveal className="mx-auto max-w-2xl">
          <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">
            07 · Start a Build
          </p>
          <h2 className="mt-5 font-display text-3xl font-bold text-ink sm:text-4xl md:text-5xl">
            Bring us the problem. We&apos;ll help you build the product.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-muted md:text-lg">
            No technical specification required. Tell us what you&apos;re
            trying to build and we&apos;ll help shape it from there.
          </p>
          <div className="mt-9 flex justify-center">
            <MagneticLink
              href="/start-a-project"
              className="rounded-full bg-ink px-8 py-4 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
            >
              Start a Project
            </MagneticLink>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
