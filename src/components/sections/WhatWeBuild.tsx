import Link from "next/link";
import { services } from "@/data/services";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function WhatWeBuild() {
  return (
    <section
      id="what-we-build"
      className="border-t border-line bg-void py-24 md:py-32"
    >
      <div className="shell">
        <SectionHeading
          index="01"
          eyebrow="What We Build"
          title="Three disciplines. One connected build."
          description="Every engagement draws on the same team and the same architecture — not a website agency, an app agency and a backend contractor stitched together after the fact."
        />

        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-line bg-line md:grid-cols-3">
          {services.map((service, i) => (
            <Reveal
              key={service.slug}
              delay={i * 0.08}
              className="flex flex-col bg-surface p-8 md:p-10"
            >
              <span className="mono text-4xl font-semibold text-ink-faint md:text-5xl">
                {service.index}
              </span>
              <h3 className="mt-6 font-display text-xl font-bold text-ink md:text-2xl">
                {service.name}
              </h3>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                {service.description}
              </p>

              <ul className="mt-6 space-y-2">
                {service.outputs.map((output) => (
                  <li
                    key={output}
                    className="flex items-center gap-2 text-sm text-ink-muted"
                  >
                    <span
                      className="h-1 w-1 rounded-full bg-accent-cyan"
                      aria-hidden="true"
                    />
                    {output}
                  </li>
                ))}
              </ul>

              <p className="mt-6 border-t border-line pt-6 text-sm font-medium text-ink">
                {service.outcome}
              </p>

              <Link
                href={`/services/${service.slug}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-cyan"
              >
                Learn more
                <span aria-hidden="true">→</span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
