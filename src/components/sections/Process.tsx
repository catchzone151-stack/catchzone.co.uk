"use client";

import { motion } from "motion/react";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { AtmosphereLayer } from "@/components/ui/AtmosphereLayer";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { viewport as viewportToken } from "@/lib/motion/tokens";

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
    body: "Design and engineering aren't handed between unrelated teams — one connected build approach carries a product from architecture through launch.",
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

/** A single "platform" — styled with layered gradients/shadows to read as
 * a solid dimensional block without needing real CSS 3D transforms, which
 * keeps rendering predictable across browsers. */
function Platform({
  stage,
  index,
  liftPx,
}: {
  stage: (typeof stages)[number];
  index: number;
  liftPx: number;
}) {
  return (
    <motion.li
      initial={{ opacity: 0, y: 28, scale: 0.94 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={viewportToken}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full lg:w-44 xl:w-48"
      style={{ marginBottom: liftPx }}
    >
      <div className="rounded-xl border border-line bg-gradient-to-b from-surface-raised to-surface p-5 shadow-[0_20px_44px_-24px_rgba(0,0,0,0.7)]">
        <span className="mono flex h-9 w-9 items-center justify-center rounded-full border border-accent-cyan/40 bg-void text-xs text-accent-cyan">
          {stage.index}
        </span>
        <h3 className="mt-3 font-display text-base font-bold text-ink">
          {stage.name}
        </h3>
        <ul className="mt-3 space-y-1.5">
          {stage.items.map((item) => (
            <li key={item} className="text-xs leading-relaxed text-ink-muted">
              {item}
            </li>
          ))}
        </ul>
      </div>
      {/* riser — a thin darker strip beneath the platform suggesting it has
          real thickness, resting on the level below it */}
      <div
        className="mx-auto h-2.5 w-[88%] rounded-b-md border-x border-b border-line bg-void/70"
        aria-hidden="true"
      />
    </motion.li>
  );
}

export function Process() {
  const reducedMotion = useReducedMotion();
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const lift = reducedMotion || !isDesktop ? 0 : 46;

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
          description="Design and engineering move together, not handed between disconnected teams — each stage rises directly out of the one before it."
        />

        <div className="relative mt-20">
          {/* mint trace rising diagonally through the levels — desktop only */}
          <svg
            className="pointer-events-none absolute inset-0 hidden h-full w-full lg:block"
            aria-hidden="true"
          >
            <motion.line
              x1="6%"
              y1="88%"
              x2="94%"
              y2="10%"
              stroke="rgba(94,234,212,0.3)"
              strokeWidth="1"
              strokeDasharray="2 7"
              initial={{ opacity: 0, pathLength: 0 }}
              whileInView={{ opacity: 1, pathLength: 1 }}
              viewport={viewportToken}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
            />
            {!reducedMotion && (
              <motion.circle
                r="3"
                fill="#5eead4"
                initial={{ opacity: 0 }}
                whileInView={{
                  opacity: [0, 1, 1, 0],
                  cx: ["6%", "94%"],
                  cy: ["88%", "10%"],
                }}
                viewport={viewportToken}
                transition={{ duration: 3.4, repeat: Infinity, ease: "linear", repeatDelay: 0.6 }}
              />
            )}
          </svg>

          <ol className="grid gap-8 sm:grid-cols-2 lg:flex lg:items-end lg:justify-between lg:gap-6">
            {stages.map((stage, i) => (
              <Platform key={stage.index} stage={stage} index={i} liftPx={lift * i} />
            ))}

            {/* resolving core — the staircase arrives at one lit point,
                a small stand-in for the finished, connected product */}
            <motion.li
              className="mono hidden shrink-0 items-center justify-center pb-1 text-[10px] uppercase tracking-widest text-ink-faint lg:flex"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={viewportToken}
              transition={{ delay: 0.7, duration: 0.6 }}
              aria-hidden="true"
              style={{ marginBottom: lift * 3 + 8 }}
            >
              <motion.span
                className="h-2.5 w-2.5 rounded-full bg-accent-cyan"
                animate={
                  reducedMotion
                    ? {}
                    : {
                        boxShadow: [
                          "0 0 14px rgba(94,234,212,0.35)",
                          "0 0 34px rgba(94,234,212,0.75)",
                          "0 0 14px rgba(94,234,212,0.35)",
                        ],
                      }
                }
                transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.li>
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
