import type { Metadata } from "next";
import Link from "next/link";
import { services, flagshipService } from "@/data/services";
import { Reveal } from "@/components/ui/Reveal";
import { AtmosphereLayer } from "@/components/ui/AtmosphereLayer";
import { ProductCards } from "@/components/products/ProductCards";
import { breadcrumbJsonLd, jsonLd, pageMetadata } from "@/lib/seo";
import { BookCallLink } from "@/components/booking/BookCallLink";
import { enquiryHref, formatFrom, serviceById, type ServiceId } from "@/data/pricing";

/** Starting prices shown under each discipline (figures from src/data/pricing.ts). */
const DISCIPLINE_PRICES: Record<string, [label: string, id: ServiceId][]> = {
  apps: [
    ["Custom web applications", "web-application"],
    ["Android & iOS mobile apps", "mobile-app"],
  ],
  web: [["Premium websites", "premium-website"]],
  systems: [["Business platforms & dashboards", "business-system"]],
};

function PriceLine({ label, id }: { label: string; id: ServiceId }) {
  const service = serviceById(id)!;
  return (
    <li>
      <Link href={`/pricing#${service.anchor}`} className="group inline-flex flex-wrap items-baseline gap-x-2 text-sm text-ink-muted transition-colors hover:text-ink">
        {label}
        <span className="mono whitespace-nowrap text-xs text-accent-cyan">{formatFrom(service.from)}</span>
      </Link>
    </li>
  );
}

/** How a client project runs — mirrors the homepage process stages; no fixed timescales or guarantees. */
const DELIVERY_STEPS = [
  {
    title: "Discovery & scope",
    body: "We start with the problem, the people who will use the software and what success looks like, then agree a clear scope before anything is built.",
  },
  {
    title: "Architecture & technology",
    body: "We choose the platform, data model and integrations to suit the product — cross-platform where it saves time, native where it genuinely matters.",
  },
  {
    title: "Experience & design",
    body: "User flows, an interface system, responsive behaviour and prototypes, designed alongside the engineering rather than handed over separately.",
  },
  {
    title: "Engineering",
    body: "Frontend, backend, database and integrations built as one connected system, so each part is designed to work with the others.",
  },
  {
    title: "Testing & security",
    body: "Testing runs throughout the build. Access control, data protection, accessibility and performance are considered from the start, not bolted on at the end.",
  },
  {
    title: "Launch & evolution",
    body: "Deployment, app-store release where relevant, analytics and monitoring — then continued iteration once real people are using it.",
  },
];

export const metadata: Metadata = pageMetadata({
  title: "Software Development Services — Apps, Web & Systems | CatchZone",
  description: "Bespoke mobile apps, premium web platforms and custom business systems — or a complete connected digital ecosystem, designed and built by CatchZone.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <div className="pt-32">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd([["Services", "/services"]])) }}
      />
      <section className="relative overflow-hidden border-b border-line pb-16">
        <AtmosphereLayer />
        <div className="shell relative z-10">
          <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">
            Services
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold text-ink md:text-5xl">
            Software development services
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
                <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-1.5" aria-label="Starting prices">
                  {(DISCIPLINE_PRICES[service.slug] ?? []).map(([label, id]) => (
                    <PriceLine key={id} label={label} id={id} />
                  ))}
                </ul>
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

          <div id="flagship" className="scroll-mt-28">
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
              <p className="mt-4 flex items-baseline gap-2">
                <span className="mono text-[11px] uppercase tracking-[0.2em] text-accent-iris">From</span>{" "}
                <span className="font-display text-2xl font-bold text-ink">
                  {formatFrom(serviceById("complete-ecosystem")!.from).replace("From ", "")}
                </span>
                <span className="text-xs text-ink-muted">for an agreed, defined scope</span>
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
                <Link
                  href={enquiryHref(["complete-ecosystem"])}
                  className="inline-flex items-center gap-2 rounded-full border border-accent-iris/40 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent-iris hover:text-accent-iris"
                >
                  Plan Your Ecosystem
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/#ecosystem"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-accent-iris"
                >
                  See the ecosystem model
                  <span aria-hidden="true">→</span>
                </Link>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section aria-labelledby="delivery-title" className="border-t border-line py-16 md:py-24">
        <div className="shell">
          <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">How we work</p>
          <h2 id="delivery-title" className="mt-4 max-w-2xl font-display text-3xl font-bold text-ink md:text-4xl">
            How a CatchZone project runs
          </h2>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">
            Design and engineering move together from the first conversation to launch, so decisions about the
            interface, the data and the infrastructure are made as one.
          </p>
          <ol className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {DELIVERY_STEPS.map((step, i) => (
              <Reveal key={step.title} as="li" delay={(i % 3) * 0.06} className="rounded-2xl border border-line bg-surface p-7">
                <span className="mono text-xs text-accent-cyan">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-display text-lg font-bold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.body}</p>
              </Reveal>
            ))}
          </ol>
          <Reveal className="mt-8 flex flex-col gap-5 rounded-2xl border border-line bg-surface-raised p-7 md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <h3 className="font-display text-lg font-bold text-ink">How quotes work</h3>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">
                Every project is scoped and quoted individually. Start with a short brief — no technical specification
                needed — and we’ll discuss what you need before recommending an approach and a quote.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
                <Link href="/pricing" className="inline-flex items-center gap-2 text-sm font-semibold text-accent-cyan">
                  View starting prices
                  <span aria-hidden="true">→</span>
                </Link>
                <BookCallLink event="intro" className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-accent-cyan">
                  Book a 15-minute call
                  <span aria-hidden="true">→</span>
                </BookCallLink>
              </div>
            </div>
            <Link
              href="/start-a-project"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-ink px-6 py-3 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan md:self-auto"
            >
              Start a Project
              <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="products-title" className="border-t border-line py-16 md:py-24">
        <div className="shell">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">Products</p>
              <h2 id="products-title" className="mt-4 font-display text-3xl font-bold text-ink md:text-4xl">
                CatchZone Products
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">
                Specialist software designed and developed by CatchZone to solve specific business challenges.
              </p>
            </div>
            <Link
              href="/products"
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent-cyan hover:text-accent-cyan md:self-auto"
            >
              All products
              <span aria-hidden="true">→</span>
            </Link>
          </div>
          <div className="mt-10">
            <ProductCards />
          </div>
        </div>
      </section>
    </div>
  );
}
