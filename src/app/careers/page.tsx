import type { Metadata } from "next";
import Link from "next/link";
import { AtmosphereLayer } from "@/components/ui/AtmosphereLayer";
import { Reveal } from "@/components/ui/Reveal";
import { RoleProfiles } from "@/components/careers/RoleProfiles";
import { CareersInterestForm } from "@/components/careers/CareersInterestForm";
import { jsonLd, pageMetadata } from "@/lib/seo";

// A normal company Careers page: role profiles, not live vacancies.
// Deliberately no JobPosting structured data and no job-board feeds.
const title = "Careers — Software Engineering & QA at CatchZone";
const description =
  "Explore the software engineering and quality assurance disciplines behind CatchZone’s work, and register your interest in future opportunities.";

export const metadata: Metadata = pageMetadata({
  title,
  description,
  path: "/careers",
});

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://catchzone.co.uk" },
    { "@type": "ListItem", position: 2, name: "Careers", item: "https://catchzone.co.uk/careers" },
  ],
};

const PRINCIPLES = [
  {
    title: "Product-minded engineering",
    body: "We build software around how people actually work — the interface, the data and the edge cases together.",
  },
  {
    title: "Quality as a habit",
    body: "Testing, accessibility and performance are part of the build, not a final check before release.",
  },
  {
    title: "Secure by default",
    body: "Access controls, validation and careful handling of data are designed in from the start.",
  },
];

/** Decorative build-pipeline motif for the hero (no text content). */
function PipelineMotif() {
  const nodes = ["Idea", "Design", "Build", "Test", "Ship"];
  return (
    <div className="relative mx-auto w-full max-w-[520px]" aria-hidden="true">
      <div className="rounded-[1.75rem] border border-white/10 bg-surface/80 p-6 shadow-[0_40px_90px_-50px_rgba(0,0,0,0.8)] backdrop-blur light:shadow-[0_40px_90px_-55px_rgba(14,17,22,0.35)]">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="mono ml-3 text-[11px] text-ink-faint">release-pipeline</span>
        </div>
        <ol className="mt-6 space-y-3">
          {nodes.map((n, i) => (
            <li key={n} className="flex items-center gap-4">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-[11px] font-semibold ${
                  i < 3
                    ? "border-accent-cyan/40 bg-accent-cyan/10 text-accent-cyan"
                    : i === 3
                      ? "border-accent-iris/40 bg-accent-iris/10 text-ink"
                      : "border-white/15 text-ink-muted"
                }`}
              >
                {i < 3 ? "✓" : i + 1}
              </span>
              <span className="w-16 text-sm font-medium text-ink">{n}</span>
              <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <span
                  className={`absolute inset-y-0 left-0 rounded-full ${i < 3 ? "w-full bg-accent-cyan/70" : i === 3 ? "w-2/3 bg-gradient-to-r from-accent-cyan to-accent-iris motion-safe:animate-pulse" : "w-0"}`}
                />
              </span>
            </li>
          ))}
        </ol>
        <div className="mono mt-6 rounded-xl border border-white/[0.07] bg-void/60 p-3 text-[11.5px] leading-relaxed text-ink-muted light:bg-void">
          <p>
            <span className="text-accent-cyan">✓</span> typecheck · lint · unit tests
          </p>
          <p>
            <span className="text-accent-cyan">✓</span> accessibility · responsive checks
          </p>
          <p>
            <span className="text-ink-faint">…</span> end-to-end journeys
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CareersPage() {
  return (
    <div className="product-contrast">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbJsonLd) }}
      />

      {/* Hero */}
      <section aria-labelledby="careers-title" className="relative overflow-hidden border-b border-line pb-20 pt-32 md:pb-24 md:pt-40">
        <AtmosphereLayer />
        <div className="shell relative z-10 grid gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">Careers</p>
            <h1 id="careers-title" className="mt-5 font-display text-5xl font-bold leading-[1.02] text-ink sm:text-6xl md:text-7xl">
              Build what’s next.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
              Great digital products come from people who care about the details. Explore the technical roles and
              disciplines behind the work we do at CatchZone.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href="#roles"
                className="inline-flex min-h-[48px] items-center rounded-full bg-ink px-6 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
              >
                Explore the roles
              </a>
              <a
                href="#careers-interest"
                className="inline-flex min-h-[48px] items-center rounded-full border border-white/15 px-6 text-sm font-semibold text-ink transition-colors hover:border-accent-cyan/60 hover:text-accent-cyan"
              >
                Register your interest
              </a>
            </div>
          </div>
          <PipelineMotif />
        </div>
      </section>

      {/* How we work */}
      <section aria-labelledby="principles-title" className="py-16 md:py-24">
        <div className="shell">
          <h2 id="principles-title" className="max-w-2xl font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            How we work
          </h2>
          <ul className="mt-10 grid gap-5 md:grid-cols-3">
            {PRINCIPLES.map((p, i) => (
              <Reveal as="li" key={p.title} delay={i * 0.06} className="rounded-[1.5rem] border border-white/10 bg-surface p-6 sm:p-7">
                <span className="mono text-[11px] text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 text-lg font-semibold text-ink">{p.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{p.body}</p>
              </Reveal>
            ))}
          </ul>
          <p className="mt-8 text-sm text-ink-muted">
            See the kind of products we build in{" "}
            <Link href="/work" className="font-semibold text-accent-cyan hover:underline">
              our work
            </Link>
            , our{" "}
            <Link href="/services" className="font-semibold text-accent-cyan hover:underline">
              services
            </Link>{" "}
            and{" "}
            <Link href="/products" className="font-semibold text-accent-cyan hover:underline">
              CatchZone products
            </Link>
            .
          </p>
        </div>
      </section>

      {/* Role profiles */}
      <section id="roles" aria-labelledby="roles-title" className="scroll-mt-24 border-t border-line bg-surface/40 py-16 md:py-24">
        <div className="shell">
          <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">Disciplines</p>
          <h2 id="roles-title" className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
            The roles behind our work
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-ink-muted">
            Two technical disciplines at the centre of how we design, build and release software.
          </p>
          <div className="mt-10">
            <RoleProfiles />
          </div>
        </div>
      </section>

      {/* Register interest */}
      <section id="careers-interest" aria-labelledby="interest-title" className="scroll-mt-24 border-t border-line py-16 md:py-24">
        <div className="shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">Register your interest</p>
            <h2 id="interest-title" className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Interested in working with us?
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-muted">
              Tell us a little about yourself and the work you’d like to do. Registering interest doesn’t mean a
              vacancy is open, but we read every message.
            </p>
            <p className="mt-6 text-sm text-ink-muted">
              Prefer email?{" "}
              <a href="mailto:info@catchzone.co.uk" className="font-semibold text-ink hover:text-accent-cyan">
                info@catchzone.co.uk
              </a>
            </p>
          </div>
          <CareersInterestForm />
        </div>
      </section>
    </div>
  );
}
