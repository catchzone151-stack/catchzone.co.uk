import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";

const reasons = [
  {
    title: "One Connected Build",
    body: "Design and engineering aren't handed between unrelated teams — the same people carry a product from architecture through launch.",
  },
  {
    title: "Built Around The Business",
    body: "No forcing a business into a generic template. Architecture and interface follow how the product actually needs to work.",
  },
  {
    title: "From Idea To Working Product",
    body: "You don't need a technical specification to start. Bring the problem or the opportunity — we help shape it into something buildable.",
  },
  {
    title: "Engineered To Grow",
    body: "Architecture decisions account for what the product needs next, not just what it needs on day one.",
  },
  {
    title: "Real Products, Real Infrastructure",
    body: "CatchZone's own products run on the same kind of stack we build for clients — including production Supabase-backed accounts and data.",
  },
];

export function WhyCatchZone() {
  return (
    <section
      id="why-catchzone"
      className="border-t border-line bg-void py-24 md:py-32"
    >
      <div className="shell">
        <SectionHeading
          index="07"
          eyebrow="Why CatchZone"
          title="What you're actually hiring."
        />

        <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2">
          {reasons.map((reason, i) => (
            <Reveal
              key={reason.title}
              delay={i * 0.06}
              className="bg-surface p-8"
            >
              <h3 className="font-display text-lg font-bold text-ink">
                {reason.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                {reason.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
