import type { Metadata } from "next";
import Link from "next/link";
import { ProductLogo } from "@/components/brand/ProductLogo";
import { AtmosphereLayer } from "@/components/ui/AtmosphereLayer";
import { Reveal } from "@/components/ui/Reveal";
import { VoiceWaveform } from "@/components/voice/VoiceWaveform";
import { SchoolHrMiniFlow } from "@/components/products/SchoolHrMiniFlow";

const title = "Products — Specialist Software by CatchZone";
const description =
  "CatchZone designs, builds and licenses specialist software for organisations: CatchZone Voice for real-time voice translation, and CatchZone School HR for school staff requests and approvals.";

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/products" },
  openGraph: {
    type: "website",
    siteName: "CatchZone",
    url: "/products",
    title,
    description,
    // Site default social image (page-level openGraph replaces the layout's).
    images: [{ url: "/og/catchzone.png", width: 1200, height: 630, alt: "CatchZone — Built for what's next" }],
  },
};

function Audience({ items }: { items: string[] }) {
  return (
    <ul className="mt-3 flex flex-wrap gap-2">
      {items.map((t) => (
        <li key={t} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-ink-muted">
          {t}
        </li>
      ))}
    </ul>
  );
}

export default function ProductsPage() {
  return (
    <div className="product-contrast pt-32">
      {/* Introduction */}
      <section className="relative overflow-hidden border-b border-line pb-16 md:pb-20">
        <AtmosphereLayer />
        <div className="shell relative z-10">
          <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">Products</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] text-ink sm:text-5xl md:text-6xl">
            Software built for real-world challenges.
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-relaxed text-ink-muted md:text-lg">
            Alongside bespoke development for clients, CatchZone designs and builds its own specialist software —
            focused products that solve one problem well, offered to organisations under licence.
          </p>
          <div className="mt-10 grid max-w-2xl grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line text-sm">
            <div className="bg-void/80 p-4 sm:p-5">
              <p className="mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">Services</p>
              <p className="mt-1.5 text-ink">Bespoke software, built for your business.</p>
              <Link href="/services" className="mt-2 inline-block text-xs font-semibold text-accent-cyan hover:text-ink">
                View services →
              </Link>
            </div>
            <div className="bg-void/80 p-4 sm:p-5">
              <p className="mono text-[10px] uppercase tracking-[0.2em] text-accent-cyan">Products</p>
              <p className="mt-1.5 text-ink">Our own software, licensed to organisations.</p>
              <span className="mt-2 inline-block text-xs text-ink-faint">You are here</span>
            </div>
          </div>
        </div>
      </section>

      {/* 01 — CatchZone Voice (lead product) */}
      <section aria-labelledby="product-voice" className="py-16 md:py-24">
        <div className="shell">
          <Reveal className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "radial-gradient(50% 60% at 100% 0%, rgb(var(--accent-iris-rgb) / 0.14), transparent 70%), radial-gradient(40% 50% at 0% 100%, rgb(var(--accent-cyan-rgb) / 0.08), transparent 70%)",
              }}
              aria-hidden="true"
            />
            <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1fr_1.05fr] lg:gap-14 lg:p-14">
              <div>
                <p className="mono text-xs uppercase tracking-[0.25em] text-ink-faint">01 · Product</p>
                <h2 id="product-voice" className="sr-only">
                  CatchZone Voice
                </h2>
                <ProductLogo product="voice" className="mt-5 h-auto w-[260px] sm:w-[340px]" />
                <p className="mt-6 font-display text-2xl font-bold leading-snug text-ink md:text-3xl">
                  Real-time AI voice translation for multilingual customer conversations.
                </p>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-muted">
                  Two people speak their own languages. Each side is recognised, translated and spoken back, with
                  live captions in both languages, while the conversation keeps flowing.
                </p>
                <p className="mono mt-8 text-[11px] uppercase tracking-[0.2em] text-ink-faint">Designed for</p>
                <Audience items={["Customer-service teams", "Contact centres", "Booking & travel support", "Multilingual front desks"]} />
                <p className="mt-6 text-sm text-ink-muted">
                  <span className="font-semibold text-ink">Status:</span> two-way translation has been demonstrated in
                  a separate private evaluation application. Private demonstrations are available on request.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/voice"
                    className="min-h-[48px] rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
                  >
                    Explore CatchZone Voice
                  </Link>
                  <Link
                    href="/voice#voice-contact"
                    className="min-h-[48px] rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-accent-cyan/60 hover:text-accent-cyan"
                  >
                    Request a Demonstration
                  </Link>
                </div>
              </div>

              {/* Illustrative conversation bridge (decorative; sample phrases) */}
              <div className="relative flex flex-col justify-center" aria-hidden="true">
                <div className="rounded-3xl border border-white/10 bg-void/70 p-5 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.6)] sm:p-7 light:bg-surface-raised light:shadow-[0_40px_80px_-50px_rgba(14,17,22,0.35)]">
                  <div className="flex items-center justify-between">
                    <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">Illustration</span>
                    <span className="flex items-center gap-1.5 text-[11px] text-accent-cyan">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" /> Live captions
                    </span>
                  </div>
                  <div className="mt-5 space-y-3">
                    <div className="max-w-[85%] rounded-2xl rounded-tl-md border border-white/10 bg-white/[0.04] px-4 py-3">
                      <p className="mono text-[10px] uppercase tracking-[0.18em] text-ink-faint">EN · Customer</p>
                      <p className="mt-1 text-sm text-ink">I’d like to move my booking to Friday, please.</p>
                      <p className="mt-1 text-xs text-ink-muted">Me gustaría cambiar mi reserva al viernes, por favor.</p>
                    </div>
                    <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-md border border-accent-cyan/25 bg-accent-cyan/[0.06] px-4 py-3">
                      <p className="mono text-[10px] uppercase tracking-[0.18em] text-accent-cyan">ES · Adviser</p>
                      <p className="mt-1 text-sm text-ink">Claro, lo cambio ahora mismo.</p>
                      <p className="mt-1 text-xs text-ink-muted">Of course, I’ll change it right now.</p>
                    </div>
                  </div>
                  <div className="mt-5 h-16 overflow-hidden rounded-2xl border border-white/[0.06] bg-void/50 light:bg-void">
                    <VoiceWaveform idleAmplitude={0.18} className="h-full w-full" />
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 02 — CatchZone School HR */}
      <section aria-labelledby="product-school-hr" className="pb-16 md:pb-24">
        <div className="shell">
          <Reveal className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-surface">
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: "radial-gradient(50% 60% at 0% 0%, rgb(var(--accent-cyan-rgb) / 0.11), transparent 70%)" }}
              aria-hidden="true"
            />
            <div className="relative grid gap-10 p-6 sm:p-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:p-14">
              {/* Illustrative staff portal (fictional) */}
              <div className="order-2 flex flex-col justify-center lg:order-1" aria-hidden="true">
                <div className="rounded-3xl border border-white/10 bg-void/70 p-5 sm:p-7 light:bg-surface-raised">
                  <div className="flex items-center justify-between">
                    <span className="mono text-[10px] uppercase tracking-[0.2em] text-ink-faint">Illustrative preview</span>
                    <span className="rounded-full bg-accent-cyan/10 px-2 py-0.5 text-[10px] font-semibold text-accent-cyan">Fictional data</span>
                  </div>
                  <div className="mt-5 grid grid-cols-3 gap-2 text-center">
                    {[
                      ["Annual leave", "18.5 days"],
                      ["TOIL", "6.0 hrs"],
                      ["Open requests", "2"],
                    ].map(([k, v]) => (
                      <div key={k} className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-2 py-3">
                        <p className="text-[10.5px] text-ink-faint">{k}</p>
                        <p className="mt-0.5 font-display text-base font-bold text-ink">{v}</p>
                      </div>
                    ))}
                  </div>
                  <SchoolHrMiniFlow className="mt-5" />
                </div>
              </div>

              <div className="order-1 lg:order-2">
                <p className="mono text-xs uppercase tracking-[0.25em] text-ink-faint">02 · Product</p>
                <h2 id="product-school-hr" className="sr-only">
                  CatchZone School HR
                </h2>
                <ProductLogo product="school-hr" className="-ml-2 mt-3 h-[110px] w-auto sm:h-[128px]" />
                <p className="mt-4 font-display text-2xl font-bold leading-snug text-ink md:text-3xl">
                  Staff requests, approvals and HR workflows for schools.
                </p>
                <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-muted">
                  Additional hours, leave, TOIL and return-to-work administration in one connected place — routed to
                  the right approver, with clear statuses and finance-ready records.
                </p>
                <p className="mono mt-8 text-[11px] uppercase tracking-[0.2em] text-ink-faint">Designed for</p>
                <Audience items={["School staff", "Line managers", "Headteachers", "Finance & administration"]} />
                <p className="mt-6 text-sm text-ink-muted">
                  <span className="font-semibold text-ink">Status:</span> in development, at pilot stage. Proposed
                  licences from £1,800 per school per year, subject to final scope and terms.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link
                    href="/school-hr"
                    className="min-h-[48px] rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
                  >
                    Explore School HR
                  </Link>
                  <Link
                    href="/school-hr#school-hr-contact"
                    className="min-h-[48px] rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-accent-cyan/60 hover:text-accent-cyan"
                  >
                    Request a School Demonstration
                  </Link>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Bespoke alternative */}
      <section className="border-t border-line py-16 md:py-20">
        <div className="shell flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold text-ink md:text-3xl">Need something built around your business?</h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-ink-muted">
              Our products come from the same engineering we offer as a service: apps, web platforms and business
              systems designed and built end to end.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/services"
              className="min-h-[48px] rounded-full border border-white/15 px-6 py-3.5 text-sm font-semibold text-ink transition-colors hover:border-accent-cyan/60 hover:text-accent-cyan"
            >
              View Services
            </Link>
            <Link
              href="/start-a-project"
              className="min-h-[48px] rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
            >
              Start a Project
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
