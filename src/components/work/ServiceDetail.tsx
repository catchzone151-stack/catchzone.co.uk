import Link from "next/link";
import type { Service } from "@/data/services";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticLink } from "@/components/ui/MagneticLink";

export function ServiceDetail({ service }: { service: Service }) {
  return (
    <div className="pt-32">
      <section className="border-b border-line pb-16">
        <div className="shell">
          <p className="mono text-xs">
            <Link href="/services" className="text-ink-muted hover:text-ink">
              Services
            </Link>
            <span className="text-ink-faint"> / </span>
            <span className="text-ink-muted">{service.shortName}</span>
          </p>
          <p className="mono mt-6 text-xs uppercase tracking-[0.25em] text-accent-cyan">
            {service.index}
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold text-ink md:text-5xl">
            {service.name}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted">
            {service.description}
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="shell grid gap-10 md:grid-cols-2">
          <Reveal className="rounded-2xl border border-line bg-surface p-8">
            <h2 className="mono text-xs uppercase tracking-wider text-ink-faint">
              Typical Outputs
            </h2>
            <ul className="mt-5 space-y-3">
              {service.outputs.map((output) => (
                <li
                  key={output}
                  className="flex items-start gap-3 text-sm text-ink-muted"
                >
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent-cyan" />
                  {output}
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.08} className="rounded-2xl border border-line bg-surface p-8">
            <h2 className="mono text-xs uppercase tracking-wider text-ink-faint">
              Business Outcome
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink">
              {service.outcome}
            </p>

            <h2 className="mono mt-8 text-xs uppercase tracking-wider text-ink-faint">
              Under The Hood
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-ink-muted">
              {service.technicalDetail}
            </p>
          </Reveal>
        </div>

        <Reveal className="shell mt-10">
          <div className="rounded-2xl border border-line bg-surface-raised p-8 text-center md:p-10">
            <h2 className="font-display text-xl font-bold text-ink md:text-2xl">
              Have a project in this area?
            </h2>
            <div className="mt-6 flex justify-center">
              <MagneticLink
                href="/start-a-project"
                className="rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
              >
                Start a Project
              </MagneticLink>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
