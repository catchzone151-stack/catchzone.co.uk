import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { AtmosphereLayer } from "@/components/ui/AtmosphereLayer";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { projects } from "@/data/projects";

export const metadata: Metadata = {
  title: "About",
  description:
    "CatchZone is a digital product and engineering studio building apps, platforms and business systems.",
  alternates: { canonical: "/about" },
};

const themes = [
  {
    title: "Product Thinking First",
    body: "Every build starts with the problem the product needs to solve, not a template or a framework choice.",
  },
  {
    title: "Design & Engineering Together",
    body: "The same team carries a product from interface to backend — nothing gets lost translating between separate design and engineering functions.",
  },
  {
    title: "Idea Through Launch",
    body: "You don't need a technical specification to start. We help shape a rough idea into an architecture, then build it.",
  },
  {
    title: "Built As Connected Systems",
    body: "A website, an app and the backend behind them are designed to work as one system from the start, not bolted together later.",
  },
];

const liveProducts = projects.filter((p) => p.status === "live");

export default function AboutPage() {
  return (
    <div className="pt-32">
      <section className="relative overflow-hidden border-b border-line pb-16">
        <AtmosphereLayer />
        <div className="shell relative z-10">
          <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">
            About
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold text-ink md:text-5xl">
            A focused studio that designs and builds the whole product.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-muted">
            CatchZone is a digital product and engineering studio — not a
            freelancer, and not pretending to be a large agency either.
            Premium positioning here comes from craft, not claimed scale.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-20">
        <div className="shell grid gap-12 md:grid-cols-2">
          <Reveal>
            <h2 className="font-display text-xl font-bold text-ink">
              Our Approach
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              CatchZone designs and engineers digital products end to end —
              apps, web platforms and the business systems behind them. We
              work as one connected team rather than handing a project
              between separate design and engineering functions, which means
              the same people who shape the interface also build the backend
              it depends on.
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              Our own products, including IslamQuest and Lumi, run on the
              same infrastructure we build for client work — real accounts,
              real data, Supabase-backed authentication and storage, shipped
              to app stores rather than left as prototypes.
            </p>
          </Reveal>

          <Reveal delay={0.08}>
            <h2 className="font-display text-xl font-bold text-ink">
              What We Value
            </h2>
            <ul className="mt-4 space-y-3">
              {[
                "Simple, intuitive product design",
                "Respect for user privacy — no unnecessary data collection",
                "Architecture that holds up as a product grows",
                "Honest positioning — we don't claim results we haven't earned",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-base text-ink-muted"
                >
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-cyan" />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-line bg-surface py-16 md:py-20">
        <AtmosphereLayer />
        <div className="shell relative z-10">
          <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">
            How We Work
          </p>
          <h2 className="mt-3 max-w-xl font-display text-2xl font-bold text-ink md:text-3xl">
            Four things that stay true on every build.
          </h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
            {themes.map((theme, i) => (
              <Reveal key={theme.title} delay={i * 0.06} className="bg-void p-7">
                <h3 className="font-display text-base font-bold text-ink">
                  {theme.title}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
                  {theme.body}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {liveProducts.length > 0 && (
        <section className="border-t border-line py-16 md:py-20">
          <div className="shell">
            <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">
              Real Products
            </p>
            <h2 className="mt-3 max-w-xl font-display text-2xl font-bold text-ink md:text-3xl">
              We build what we say we can build — see it running.
            </h2>
            <div className="mt-8 flex flex-wrap gap-4">
              {liveProducts.map((product) => (
                <Link
                  key={product.slug}
                  href={`/work/${product.slug}`}
                  className="rounded-full border border-line px-5 py-3 text-sm font-semibold text-ink transition-colors hover:border-accent-cyan hover:text-accent-cyan"
                >
                  {product.title} →
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-line bg-surface py-16 md:py-20">
        <div className="shell grid gap-10 md:grid-cols-2">
          <Reveal>
            <h2 className="mono text-xs uppercase tracking-wider text-ink-faint">
              Contact
            </h2>
            <p className="mt-4 text-base text-ink">
              <a
                href="mailto:info@catchzone.co.uk"
                className="transition-colors hover:text-accent-cyan"
              >
                info@catchzone.co.uk
              </a>
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 className="mono text-xs uppercase tracking-wider text-ink-faint">
              Company Information
            </h2>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              CatchZone Ltd
              <br />
              124-128 City Road
              <br />
              London EC1V 2NX
              <br />
              United Kingdom
            </p>
          </Reveal>
        </div>
      </section>

      <section className="border-t border-line py-16 text-center md:py-20">
        <div className="shell">
          <h2 className="font-display text-xl font-bold text-ink md:text-2xl">
            Bring us the problem. We&apos;ll help you build the product.
          </h2>
          <div className="mt-6 flex justify-center">
            <MagneticLink
              href="/start-a-project"
              className="rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
            >
              Start a Project
            </MagneticLink>
          </div>
        </div>
      </section>
    </div>
  );
}
