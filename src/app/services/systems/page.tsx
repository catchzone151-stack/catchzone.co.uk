import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/data/services";
import { ServiceHero } from "@/components/work/ServiceHero";
import { ServiceBody } from "@/components/work/ServiceBody";
import { breadcrumbJsonLd, jsonLd, pageMetadata, serviceJsonLd } from "@/lib/seo";

const service = services.find((s) => s.slug === "systems")!;

export const metadata: Metadata = pageMetadata({
  title: "Custom Business Software, Portals & Automation | CatchZone",
  description: "Bespoke business software — admin systems, dashboards, client portals, booking and workflow automation that replace spreadsheets and disconnected tools.",
  path: "/services/systems",
});

export default function SystemsServicePage() {
  return (
    <div>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: jsonLd([
            serviceJsonLd({ name: service.name, description: service.description, path: "/services/systems", outputs: service.outputs }),
            breadcrumbJsonLd([["Services", "/services"], [service.shortName, "/services/systems"]]),
          ]),
        }}
      />
      <ServiceHero service={service} coreState="systems" />
      <ServiceBody service={service} accent="iris" />

      <section className="border-t border-line bg-surface py-16 text-center md:py-20">
        <div className="shell">
          <p className="mono text-xs uppercase tracking-[0.25em] text-accent-iris">
            Flagship Service
          </p>
          <h2 className="mt-3 font-display text-xl font-bold text-ink md:text-2xl">
            This is the discipline behind Complete Digital Ecosystems
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-muted">
            Backend, database and automation work rarely stands alone — see
            how it connects to the website, app and admin layer as one
            system.
          </p>
          <Link
            href="/#ecosystem"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-iris"
          >
            See the ecosystem model
            <span aria-hidden="true">→</span>
          </Link>
          <p className="mx-auto mt-6 max-w-lg text-sm text-ink-muted">
            See this discipline in one of our own products:{" "}
            <Link href="/school-hr" className="font-semibold text-ink hover:text-accent-cyan">
              CatchZone School HR
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
