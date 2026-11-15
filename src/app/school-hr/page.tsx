import type { Metadata } from "next";
import Link from "next/link";
import { ProductLogo } from "@/components/brand/ProductLogo";
import { SchoolHrHero } from "@/components/school-hr/SchoolHrHero";
import { WorkflowStudio } from "@/components/school-hr/WorkflowStudio";
import { RolePerspectives } from "@/components/school-hr/RolePerspectives";
import { SchoolHrPricing } from "@/components/school-hr/SchoolHrPricing";
import { ModuleExplorer } from "@/components/school-hr/ModuleExplorer";
import { SchoolHrEnquiryForm } from "@/components/school-hr/SchoolHrEnquiryForm";
import { Reveal } from "@/components/ui/Reveal";
import { CAPABILITIES, FAQS } from "@/data/schoolHr";

const title = "CatchZone School HR — Staff Requests & Approvals for Schools";
const description =
  "CatchZone School HR brings additional-hours claims, leave, TOIL and return-to-work forms into one place for schools, with approvals and finance-ready records. In development — try the interactive workflow preview.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/school-hr" },
  openGraph: {
    type: "website",
    siteName: "CatchZone",
    url: "/school-hr",
    title,
    description,
    // Site default social image (page-level openGraph replaces the layout's).
    images: [{ url: "/og/catchzone.png", width: 1200, height: 630, alt: "CatchZone — Built for what's next" }],
  },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://catchzone.co.uk" },
    { "@type": "ListItem", position: 2, name: "Products", item: "https://catchzone.co.uk/products" },
    { "@type": "ListItem", position: 3, name: "CatchZone School HR", item: "https://catchzone.co.uk/school-hr" },
  ],
};

const SECTIONS = [
  ["#workflows", "Workflows"],
  ["#roles", "Roles"],
  ["#packages", "Packages"],
  ["#modules", "Modules"],
  ["#faq", "FAQ"],
] as const;

function SectionHead({ eyebrow, title, id, children }: { eyebrow: string; title: string; id: string; children?: React.ReactNode }) {
  return (
    <div className="max-w-3xl">
      <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">{eyebrow}</p>
      <h2 id={id} className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl md:text-[2.75rem]">
        {title}
      </h2>
      {children && <p className="mt-4 text-base leading-relaxed text-ink-muted md:text-lg">{children}</p>}
    </div>
  );
}

export default function SchoolHrPage() {
  return (
    <div className="product-contrast">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Product sub-navigation */}
      <div className="shell pt-24 md:pt-28">
        <div className="flex flex-col gap-3 border-b border-line pb-3 sm:flex-row sm:items-center sm:justify-between">
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-xs text-ink-faint">
              <li>
                <Link href="/products" className="hover:text-ink">
                  Products
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li aria-current="page" className="text-ink-muted">
                CatchZone School HR
              </li>
            </ol>
          </nav>
          <nav aria-label="On this page" className="-mx-1 flex gap-1 overflow-x-auto">
            {SECTIONS.map(([href, label]) => (
              <a key={href} href={href} className="flex min-h-[40px] shrink-0 items-center rounded-full px-3.5 text-sm text-ink-muted transition-colors hover:text-ink">
                {label}
              </a>
            ))}
            <a
              href="#school-hr-contact"
              className="flex min-h-[40px] shrink-0 items-center rounded-full bg-white/[0.06] px-3.5 text-sm font-semibold text-ink transition-colors hover:text-accent-cyan"
            >
              Request a demo
            </a>
          </nav>
        </div>
      </div>

      <SchoolHrHero />

      {/* B — Interactive workflow studio */}
      <section id="workflows" aria-labelledby="workflows-title" className="scroll-mt-24 border-t border-line py-20 md:py-28">
        <div className="shell">
          <SectionHead eyebrow="Interactive preview" title="Step through the workflows." id="workflows-title">
            Choose a workflow and move it from request to record, seeing each stage from the right person’s view. It runs
            entirely in your browser with fictional data — nothing you choose is sent or saved.
          </SectionHead>
          <div className="mt-12">
            <WorkflowStudio />
          </div>
        </div>
      </section>

      {/* C — Role perspectives */}
      <section id="roles" aria-labelledby="roles-title" className="scroll-mt-24 border-t border-line bg-surface/40 py-20 md:py-28">
        <div className="shell">
          <SectionHead eyebrow="Role-based perspectives" title="One school. Four perspectives." id="roles-title">
            Everyone sees what their role needs — and work moves from one person to the next without chasing.
          </SectionHead>
          <div className="mt-12">
            <RolePerspectives />
          </div>
        </div>
      </section>

      {/* D — School-specific workflows */}
      <section id="capabilities" aria-labelledby="capabilities-title" className="scroll-mt-24 border-t border-line py-20 md:py-28">
        <div className="shell">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
            <div>
              <SectionHead eyebrow="Built for schools" title="Designed around how schools actually work." id="capabilities-title" />
              <p className="mt-5 text-base leading-relaxed text-ink-muted">
                These are configurable capabilities, agreed with each school during implementation. We don’t assume one
                school’s policies apply to every school.
              </p>
            </div>
            <ul className="grid gap-px overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.07] sm:grid-cols-2">
              {CAPABILITIES.map((c, i) => (
                <Reveal as="li" key={c.title} delay={(i % 2) * 0.05} className="bg-void p-5 sm:p-6">
                  <p className="mono text-[11px] text-ink-faint">{String(i + 1).padStart(2, "0")}</p>
                  <h3 className="mt-2 text-base font-semibold text-ink">{c.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{c.body}</p>
                </Reveal>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Packages and pricing */}
      <section id="packages" aria-labelledby="packages-title" className="scroll-mt-24 border-t border-line bg-surface/40 py-20 md:py-28">
        <div className="shell">
          <SectionHead eyebrow="Packages" title="Clear packages. Proposed pricing." id="packages-title">
            Annual licences per school. These are proposed prices for the pilot and development phase, subject to final
            scope and commercial terms.
          </SectionHead>
          <div className="mt-12">
            <SchoolHrPricing />
          </div>
        </div>
      </section>

      {/* Module explorer */}
      <section id="modules" aria-labelledby="modules-title" className="scroll-mt-24 border-t border-line py-20 md:py-28">
        <div className="shell">
          <SectionHead eyebrow="Module explorer" title="Explore what each package covers." id="modules-title">
            Browse the modules in Essentials and Standard, and the optional modules being planned.
          </SectionHead>
          <div className="mt-12">
            <ModuleExplorer />
          </div>
        </div>
      </section>

      {/* Adoption */}
      <section id="adoption" aria-labelledby="adoption-title" className="scroll-mt-24 border-t border-line bg-surface/40 py-20 md:py-28">
        <div className="shell">
          <SectionHead eyebrow="Adoption" title="From first conversation to pilot." id="adoption-title">
            A careful, school-by-school approach. Timelines are agreed with you rather than promised in advance.
          </SectionHead>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              ["01", "Understand your school", "Discuss your existing HR processes, roles, approval rules and priorities."],
              ["02", "Configure and validate", "Agree which workflows, rules and permissions are needed, then test them together."],
              ["03", "Pilot and roll out", "Run an agreed pilot, review any issues and prepare the school for wider use."],
            ].map(([n, t, b], i) => (
              <Reveal as="li" key={n} delay={i * 0.06} className="relative rounded-[1.5rem] border border-white/10 bg-void p-6 sm:p-7">
                <span className="font-display text-4xl font-bold text-accent-cyan/80">{n}</span>
                <h3 className="mt-4 text-lg font-semibold text-ink">{t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{b}</p>
              </Reveal>
            ))}
          </ol>
          <p className="mt-6 text-sm text-ink-faint">
            CatchZone School HR is designed to be reusable across schools; each school’s rules are configured
            separately.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" aria-labelledby="faq-title" className="scroll-mt-24 border-t border-line py-20 md:py-28">
        <div className="shell grid gap-10 lg:grid-cols-[0.75fr_1.25fr] lg:gap-16">
          <SectionHead eyebrow="FAQ" title="Questions schools ask." id="faq-title" />
          <div className="divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {FAQS.map((f) => (
              <details key={f.q} className="group">
                <summary className="flex min-h-[60px] cursor-pointer list-none items-center justify-between gap-6 py-4 text-left [&::-webkit-details-marker]:hidden">
                  <span className="text-base font-semibold text-ink">{f.q}</span>
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-ink-muted transition-transform duration-300 group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="pb-5 pr-12 text-sm leading-relaxed text-ink-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry */}
      <section
        id="school-hr-contact"
        aria-labelledby="hr-contact-title"
        className="relative isolate scroll-mt-24 overflow-hidden border-t border-line bg-void py-20 md:py-28"
      >
        <div
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(40% 50% at 10% 20%, rgb(var(--accent-cyan-rgb) / 0.09), transparent 70%), radial-gradient(45% 55% at 95% 90%, rgb(var(--accent-iris-rgb) / 0.11), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div className="shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <ProductLogo product="school-hr" className="-ml-2 h-[88px] w-auto" />
            <h2 id="hr-contact-title" className="mt-6 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl md:text-5xl">
              See it with your school’s workflows.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-muted md:text-lg">
              Request a demonstration and tell us how your school handles staff requests today. We’ll walk through the
              workflows and talk about what a pilot could look like.
            </p>
            <dl className="mt-10 space-y-4 border-t border-line pt-8 text-sm">
              <div>
                <dt className="mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Email</dt>
                <dd className="mt-1">
                  <a href="mailto:info@catchzone.co.uk" className="text-ink transition-colors hover:text-accent-cyan">
                    info@catchzone.co.uk
                  </a>
                </dd>
              </div>
              <div>
                <dt className="mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Company</dt>
                <dd className="mt-1 text-ink-muted">CatchZone School HR — a product by CatchZone Ltd.</dd>
              </div>
            </dl>
          </div>
          <SchoolHrEnquiryForm />
        </div>
      </section>

      {/* Quiet bridge back to the wider product range */}
      <div className="border-t border-line">
        <div className="shell flex flex-col items-start justify-between gap-4 py-10 sm:flex-row sm:items-center">
          <p className="text-sm text-ink-muted">
            Also from CatchZone:{" "}
            <Link href="/voice" className="font-semibold text-ink hover:text-accent-cyan">
              CatchZone Voice
            </Link>{" "}
            — real-time AI voice translation.
          </p>
          <Link href="/products" className="text-sm font-semibold text-accent-cyan hover:text-ink">
            All CatchZone products <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
