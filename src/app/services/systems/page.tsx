import type { Metadata } from "next";
import Link from "next/link";
import { services } from "@/data/services";
import { ServiceHero } from "@/components/work/ServiceHero";
import { ServiceBody } from "@/components/work/ServiceBody";

const service = services.find((s) => s.slug === "systems")!;

export const metadata: Metadata = {
  title: service.shortName,
  description: service.description,
  alternates: { canonical: "/services/systems" },
};

export default function SystemsServicePage() {
  return (
    <div>
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
        </div>
      </section>
    </div>
  );
}
