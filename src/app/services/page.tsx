import type { Metadata } from "next";
import Link from "next/link";
import { services, flagshipService } from "@/data/services";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Services",
  description:
    "Mobile & digital products, premium web platforms, business systems, and complete connected digital ecosystems.",
};

export default function ServicesPage() {
  return (
    <div className="pt-32">
      <section className="border-b border-line pb-16">
        <div className="shell">
          <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">
            Services
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold text-ink md:text-5xl">
            Capabilities
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted">
            Three build disciplines, and one flagship service that brings
            them together as a single connected system.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="shell space-y-6">
          {services.map((service, i) => (
            <Reveal
              key={service.slug}
              delay={i * 0.06}
              className="grid gap-6 rounded-2xl border border-line bg-surface p-8 md:grid-cols-[auto_1fr_auto] md:items-center md:p-10"
            >
              <span className="mono text-4xl font-semibold text-ink-faint">
                {service.index}
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-ink md:text-2xl">
                  {service.name}
                </h2>
                <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
                  {service.description}
                </p>
              </div>
              <Link
                href={`/services/${service.slug}`}
                className="inline-flex shrink-0 items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent-cyan hover:text-accent-cyan"
              >
                Details
                <span aria-hidden="true">→</span>
              </Link>
            </Reveal>
          ))}

          <Reveal className="rounded-2xl border border-accent-iris/30 bg-surface-raised p-8 md:p-10">
            <span className="mono text-xs uppercase tracking-wider text-accent-iris">
              {flagshipService.index} · Flagship Service
            </span>
            <h2 className="mt-3 font-display text-xl font-bold text-ink md:text-2xl">
              {flagshipService.name}
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
              {flagshipService.description}
            </p>
            <Link
              href="/#ecosystem"
              className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-iris"
            >
              See the ecosystem model
              <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
