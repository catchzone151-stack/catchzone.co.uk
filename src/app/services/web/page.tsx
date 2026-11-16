import type { Metadata } from "next";
import { services } from "@/data/services";
import { ServiceHero } from "@/components/work/ServiceHero";
import { ServiceBody } from "@/components/work/ServiceBody";
import { breadcrumbJsonLd, jsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

const service = services.find((s) => s.slug === "web")!;

export const metadata: Metadata = pageMetadata({
  title: "Bespoke Website & Web Platform Development | CatchZone",
  description: "Bespoke websites and interactive web platforms, designed and engineered to look and perform like the category leader — fast, accessible and built around your brand.",
  path: "/services/web",
});

export default function WebServicePage() {
  return (
    <div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: jsonLd([
            serviceJsonLd({ name: service.name, description: service.description, path: "/services/web", outputs: service.outputs }),
            breadcrumbJsonLd([["Services", "/services"], [service.shortName, "/services/web"]]),
          ]),
        }}
      />
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
