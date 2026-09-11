import type { Metadata } from "next";
import { services } from "@/data/services";
import { ServiceHero } from "@/components/work/ServiceHero";
import { ServiceBody } from "@/components/work/ServiceBody";

const service = services.find((s) => s.slug === "web")!;

export const metadata: Metadata = {
  title: service.shortName,
  description: service.description,
  alternates: { canonical: "/services/web" },
};

export default function WebServicePage() {
  return (
    <div>
      <ServiceHero service={service} coreState="web" />
      <ServiceBody service={service} accent="cyan" />

      <section className="border-t border-line bg-surface py-16 text-center md:py-20">
        <div className="shell">
          <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">
            This Very Site
          </p>
          <h2 className="mt-3 font-display text-xl font-bold text-ink md:text-2xl">
            Everything on catchzone.co.uk is our own build
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-muted">
            The composition, motion and spatial work you&apos;re looking at
            right now — the dimensional hero, the reconfiguring system
            behind this page — is the same engineering discipline we bring
            to a client web platform.
          </p>
        </div>
      </section>
    </div>
  );
}
