import type { Metadata } from "next";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "About",
  description:
    "CatchZone is a digital product and engineering studio building apps, platforms and business systems.",
};

export default function AboutPage() {
  return (
    <div className="pt-32">
      <section className="border-b border-line pb-16">
        <div className="shell">
          <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">
            About
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold text-ink md:text-5xl">
            A studio that designs and builds the whole product.
          </h1>
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
    </div>
  );
}
