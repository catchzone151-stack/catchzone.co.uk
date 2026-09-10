import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { AtmosphereLayer } from "@/components/ui/AtmosphereLayer";

const stages = [
  {
    index: "01",
    name: "Architecture & Strategy",
    items: ["Understand the problem", "Map the product", "Define users & scope", "Select the right architecture"],
  },
  {
    index: "02",
    name: "Experience & Design",
    items: ["Flows", "Interface system", "Responsive behaviour", "Interaction & motion", "Prototype"],
  },
  {
    index: "03",
    name: "Engineering",
    items: ["Frontend", "Backend", "Database", "Integrations", "Testing"],
  },
  {
    index: "04",
    name: "Launch & Evolution",
    items: ["Deployment", "Analytics", "Monitoring", "Iteration"],
  },
];

const values = [
  {
    title: "One Connected Build",
    body: "Design and engineering aren't handed between unrelated teams — the same people carry a product from architecture through launch.",
  },
  {
    title: "Built Around The Business",
    body: "No forcing a business into a generic template. Architecture and interface follow how the product actually needs to work.",
  },
  {
    title: "Real Products, Real Infrastructure",
    body: "CatchZone's own products run on the same kind of stack we build for clients — including production Supabase-backed accounts and data.",
  },
];

export function Process() {
  return (
    <section
      id="process"
      className="relative overflow-hidden border-t border-line bg-surface py-24 md:py-32"
    >
      <AtmosphereLayer tone="iris" />
      <div className="shell relative z-10">
        <SectionHeading
          index="06"
          eyebrow="Process & Value"
          title="One build. Four stages. Built to last."
          description="Design and engineering move together, not handed between disconnected teams."
        />

        <div className="relative mt-16">
          <div
            className="absolute left-[19px] top-2 hidden h-[calc(100%-2rem)] w-px bg-line md:block lg:left-1/2"
            aria-hidden="true"
          />
          <ol className="grid gap-8 lg:grid-cols-4 lg:gap-6">
            {stages.map((stage, i) => (
              <Reveal key={stage.index} as="li" delay={i * 0.08} className="relative pl-12 md:pl-14 lg:pl-0">
                <div className="mb-4 flex items-center gap-4 lg:flex-col lg:items-start">
                  <span className="mono flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent-cyan/40 bg-void text-sm text-accent-cyan">
                    {stage.index}
                  </span>
                  <h3 className="font-display text-lg font-bold text-ink">
                    {stage.name}
                  </h3>
                </div>
                <ul className="space-y-2">
                  {stage.items.map((item) => (
                    <li key={item} className="text-sm text-ink-muted">
                      {item}
                    </li>
                  ))}
                </ul>
              </Reveal>
            ))}
          </ol>
        </div>

        <div className="mt-20 grid gap-10 sm:grid-cols-3 sm:gap-8">
          {values.map((value, i) => (
            <Reveal
              key={value.title}
              delay={i * 0.06}
              className="border-t border-accent-cyan/25 pt-6"
            >
              <h3 className="font-display text-base font-bold text-ink">
                {value.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-ink-muted">
                {value.body}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
