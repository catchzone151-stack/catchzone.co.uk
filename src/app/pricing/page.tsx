import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { AtmosphereLayer } from "@/components/ui/AtmosphereLayer";
import { BetterTogether } from "@/components/pricing/BetterTogether";
import { BookCallLink } from "@/components/booking/BookCallLink";
import { isBookable } from "@/data/booking";
import { enquiryHref, formatFrom, pricedServices, pricingFaqs, type PricedService } from "@/data/pricing";
import { breadcrumbJsonLd, jsonLd, pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "Pricing — Websites, Apps & Business Platforms | CatchZone",
  description:
    "Starting prices for bespoke websites, web applications, Android & iOS apps, business platforms and Complete Digital Ecosystems from CatchZone.",
  path: "/pricing",
});

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: pricingFaqs.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

/** "From" set small above the figure, so the price always reads as a starting point. */
function Price({ amount, tone = "cyan" }: { amount: number; tone?: "cyan" | "iris" }) {
  return (
    <p className="mt-4 flex items-baseline gap-2">
      <span className={`mono text-[11px] uppercase tracking-[0.2em] ${tone === "iris" ? "text-accent-iris" : "text-accent-cyan"}`}>
        From
      </span>{" "}
      <span className="font-display text-3xl font-bold tracking-tight text-ink md:text-[2.1rem]">
        {formatFrom(amount).replace("From ", "")}
      </span>
    </p>
  );
}

function Bullets({ items, tone = "cyan" }: { items: string[]; tone?: "cyan" | "iris" }) {
  return (
    <ul className="mt-3 space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-relaxed text-ink-muted">
          <span
            className={`mt-[0.6rem] h-1 w-1 shrink-0 rounded-full ${tone === "iris" ? "bg-accent-iris" : "bg-accent-cyan"}`}
            aria-hidden="true"
          />
          {item}
        </li>
      ))}
    </ul>
  );
}

function Conditions({ conditions }: { conditions: NonNullable<PricedService["conditions"]> }) {
  return (
    <details className="group mt-5 rounded-xl border border-line">
      <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-4 px-4 text-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
        {conditions.title}
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 text-ink-muted transition-transform group-open:rotate-45"
          aria-hidden="true"
        >
          +
        </span>
      </summary>
      <div className="px-4 pb-4">
        <Bullets items={conditions.items} />
      </div>
    </details>
  );
}

function ServiceCard({ service, index }: { service: PricedService; index: number }) {
  return (
    <Reveal delay={(index % 2) * 0.06} className="flex">
      <article
        id={service.anchor}
        aria-labelledby={`${service.anchor}-title`}
        className="flex flex-1 scroll-mt-28 flex-col rounded-2xl border border-line bg-surface p-7 md:p-9"
      >
        <span className="mono text-xs text-ink-faint">{String(index + 1).padStart(2, "0")}</span>
        <h2 id={`${service.anchor}-title`} className="mt-3 font-display text-xl font-bold text-ink md:text-2xl">
          {service.name}
        </h2>
        <Price amount={service.from} />
        <p className="mt-4 text-sm leading-relaxed text-ink-muted md:text-base">{service.summary}</p>
        <p className="mono mt-6 text-[11px] uppercase tracking-wider text-ink-faint">{service.deliverablesLabel}</p>
        <Bullets items={service.deliverables} />
        {service.note && (
          <p className="mt-5 border-l border-accent-cyan/40 pl-3 text-xs leading-relaxed text-ink-muted">{service.note}</p>
        )}
        {service.conditions && <Conditions conditions={service.conditions} />}
        <div className="mt-auto pt-8">
          <Link
            href={enquiryHref([service.id])}
            className="inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent-cyan hover:text-accent-cyan"
          >
            {service.cta}
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </article>
    </Reveal>
  );
}

function FlagshipCard({ service }: { service: PricedService }) {
  return (
    <Reveal>
      <article
        id={service.anchor}
        aria-labelledby={`${service.anchor}-title`}
        className="relative scroll-mt-28 overflow-hidden rounded-2xl border border-accent-iris/30 bg-surface-raised p-8 md:p-10"
      >
        <div
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-iris/10 blur-3xl"
          aria-hidden="true"
        />
        <div className="relative grid gap-10 md:grid-cols-[1.1fr_0.9fr] md:gap-14">
          <div className="flex flex-col">
            <span className="mono text-xs uppercase tracking-wider text-accent-iris">05 · Flagship Service</span>
            <h2 id={`${service.anchor}-title`} className="mt-3 font-display text-2xl font-bold text-ink md:text-3xl">
              {service.name}
            </h2>
            <Price amount={service.from} tone="iris" />
            <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">{service.summary}</p>
            {service.note && <p className="mt-4 max-w-xl text-xs leading-relaxed text-ink-muted">{service.note}</p>}
            <div className="mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 pt-8">
              <Link
                href={enquiryHref([service.id])}
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
              >
                {service.cta}
                <span aria-hidden="true">→</span>
              </Link>
              <Link href="/#ecosystem" className="inline-flex items-center gap-2 text-sm font-semibold text-accent-iris">
                See the ecosystem model
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div className="md:border-l md:border-line md:pl-10">
            <p className="mono text-[11px] uppercase tracking-wider text-ink-faint">{service.deliverablesLabel}</p>
            <ol className="mt-4 space-y-3">
              {service.deliverables.map((item, i) => (
                <li key={item} className="flex items-baseline gap-4 text-sm leading-relaxed text-ink">
                  <span className="mono text-[11px] text-accent-iris">{String(i + 1).padStart(2, "0")}</span>
                  {item}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export default function PricingPage() {
  const standard = pricedServices.filter((s) => !s.flagship);
  const flagship = pricedServices.find((s) => s.flagship)!;
  const canBook = isBookable("intro");

  return (
    <div className="pt-32">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd([["Pricing", "/pricing"]])) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd) }}
      />

      <section className="relative overflow-hidden border-b border-line pb-16">
        <AtmosphereLayer />
        <div className="shell relative z-10">
          <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">Pricing</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold text-ink md:text-5xl">
            Clear starting prices for bespoke builds
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted">
            Every CatchZone project is designed and built around your business, then scoped and quoted
            individually. These prices show where a clearly defined build begins — your quote follows a
            conversation about what you need.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
            <Link
              href="/start-a-project"
              className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
            >
              Start a Project
              <span aria-hidden="true">→</span>
            </Link>
            <BookCallLink
              event="intro"
              className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-accent-cyan"
            >
              Book a 15-minute call
              <span aria-hidden="true">→</span>
            </BookCallLink>
          </div>
        </div>
      </section>

      <section aria-label="Services and starting prices" className="py-16 md:py-20">
        <div className="shell space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {standard.map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>
          <FlagshipCard service={flagship} />
        </div>
      </section>

      <section id="better-together" aria-labelledby="together-title" className="scroll-mt-24 border-t border-line py-16 md:py-24">
        <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">Combined builds</p>
            <h2 id="together-title" className="mt-4 font-display text-3xl font-bold leading-tight text-ink md:text-4xl">
              Better Together
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-muted">
              Some projects need more than one solution. Combine services into a connected build, with a
              tailored starting price where shared development reduces duplication.
            </p>
            <p className="mt-4 max-w-md text-xs leading-relaxed text-ink-faint">
              Scoped starting examples, not automatic fixed-price discounts. Need three or more parts working
              together? See the{" "}
              <Link href={`#${flagship.anchor}`} className="text-ink-muted underline underline-offset-2 hover:text-ink">
                Complete Digital Ecosystem
              </Link>
              .
            </p>
          </div>
          <BetterTogether />
        </div>
      </section>

      <section aria-labelledby="quote-title" className="border-t border-line py-16 md:py-24">
        <div className="shell">
          <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">How quotes work</p>
          <h2 id="quote-title" className="mt-4 max-w-2xl font-display text-3xl font-bold text-ink md:text-4xl">
            From starting price to your quote
          </h2>
          <ol className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              {
                title: "Scope first",
                body: "We start with what you need the product to do and who will use it, then agree a clear scope before recommending an approach and a quote.",
              },
              {
                title: "Running costs, agreed openly",
                body: "Hosting, third-party subscriptions, developer account fees and ongoing maintenance depend on your needs, so we clarify them in your quote rather than silently including them.",
              },
              {
                title: "Products priced separately",
                body: "CatchZone Voice and CatchZone School HR are our own products, with their own pages and plans — they aren’t part of bespoke development pricing.",
              },
            ].map((step, i) => (
              <Reveal key={step.title} as="li" delay={i * 0.06} className="rounded-2xl border border-line bg-surface p-7">
                <span className="mono text-xs text-accent-cyan">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-display text-lg font-bold text-ink">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{step.body}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      <section aria-labelledby="pricing-faq-title" className="border-t border-line py-16 md:py-24">
        <div className="shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">FAQ</p>
            <h2 id="pricing-faq-title" className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Pricing questions
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-ink-muted">
              Can’t find your answer?{" "}
              <a
                href="mailto:info@catchzone.co.uk"
                className="text-accent-cyan underline decoration-accent-cyan/40 underline-offset-2 hover:decoration-accent-cyan"
              >
                info@catchzone.co.uk
              </a>
            </p>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {pricingFaqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-6 text-left [&::-webkit-details-marker]:hidden">
                  <h3 className="font-display text-lg font-bold text-ink">{f.q}</h3>
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-ink-muted transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-line py-16 md:py-24">
        <div className="shell">
          <Reveal className="flex flex-col gap-6 rounded-2xl border border-line bg-surface-raised p-7 md:flex-row md:items-center md:justify-between md:p-10">
            <div>
              <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">Not sure which fits?</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-muted md:text-base">
                Tell us what you’re trying to build — no technical specification needed — and we’ll recommend the
                right approach and a quote.
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-x-6 gap-y-3">
              <Link
                href="/start-a-project"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-3 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
              >
                Start a Project
                <span aria-hidden="true">→</span>
              </Link>
              {canBook && (
                <BookCallLink
                  event="consultation"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-accent-cyan"
                >
                  Book a consultation
                  <span aria-hidden="true">→</span>
                </BookCallLink>
              )}
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
