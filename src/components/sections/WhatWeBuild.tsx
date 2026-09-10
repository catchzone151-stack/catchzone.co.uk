"use client";

import { useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "motion/react";
import { services, type Service } from "@/data/services";
import type { CoreState } from "@/lib/three/coreTargets";
import { useScrollActiveIndex } from "@/hooks/useScrollActiveIndex";
import { usePerformanceTier } from "@/lib/performance/usePerformanceTier";
import { useDocumentVisible } from "@/hooks/useDocumentVisible";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { AtmosphereLayer } from "@/components/ui/AtmosphereLayer";

const ServicesCanvas = dynamic(() => import("@/components/canvas/ServicesCanvas"), {
  ssr: false,
});

const SERVICE_CORE_STATE: Record<Service["slug"], CoreState> = {
  apps: "mobile",
  web: "web",
  systems: "systems",
};

function ServicePanel({
  service,
  index,
  active,
  panelRef,
}: {
  service: Service;
  index: number;
  active: boolean;
  panelRef: React.RefObject<HTMLDivElement>;
}) {
  return (
    <div
      ref={panelRef}
      className="flex min-h-[58vh] flex-col justify-center border-b border-line py-12 last:border-b-0 lg:min-h-[78vh] lg:py-0"
    >
      <motion.span
        className="mono text-5xl font-semibold sm:text-6xl lg:text-7xl"
        animate={{ color: active ? "#5eead4" : "#565f6e" }}
        transition={{ duration: 0.5 }}
      >
        {service.index}
      </motion.span>

      <h3 className="mt-4 font-display text-2xl font-bold text-ink sm:text-3xl lg:mt-6 lg:text-4xl">
        {service.name}
      </h3>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted lg:text-base">
        {service.description}
      </p>

      <ul className="mt-6 flex flex-wrap gap-2">
        {service.outputs.slice(0, 4).map((output) => (
          <li key={output} className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-muted">
            {output}
          </li>
        ))}
      </ul>

      <Link
        href={`/services/${service.slug}`}
        className="mt-7 inline-flex w-fit items-center gap-2 text-sm font-semibold text-accent-cyan"
      >
        Learn more
        <span aria-hidden="true">→</span>
      </Link>

      {index === 0 && (
        <p className="mono mt-10 text-xs uppercase tracking-wider text-ink-faint lg:hidden">
          Scroll for web platforms &amp; business systems
        </p>
      )}
    </div>
  );
}

export function WhatWeBuild() {
  const refs = useMemo(
    () => services.map(() => ({ current: null }) as React.RefObject<HTMLDivElement>),
    [],
  );
  const active = useScrollActiveIndex(refs);
  const tier = usePerformanceTier();
  const documentVisible = useDocumentVisible();
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const showCanvas = tier !== "safe";
  const coreState = SERVICE_CORE_STATE[services[active]!.slug];
  const frameloop = documentVisible ? "always" : "never";

  return (
    <section id="what-we-build" className="relative border-t border-line bg-void">
      <AtmosphereLayer tone="cyan" />
      <div className="shell relative z-10 pt-24 md:pt-28">
        <SectionHeading
          index="01"
          eyebrow="What We Build"
          title="Three disciplines. One connected build."
          description="Every engagement draws on the same team and the same architecture. Scroll to see each capability take shape."
        />
      </div>

      {/* Mobile/tablet: one compact canvas sitting above the scrolling
          panels — always visible, never gated behind a desktop-only
          breakpoint, so every state (01/02/03) carries a real visual. Only
          one ServicesCanvas is ever mounted at a time (desktop vs. mobile
          layout), avoiding two simultaneous WebGL contexts. */}
      {showCanvas && !isDesktop && (
        <div className="relative mx-auto mt-10 h-[48vh] w-full max-w-xl">
          <ServicesCanvas state={coreState} frameloop={frameloop} />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-transparent to-void" />
        </div>
      )}

      <div className="shell relative z-10 mt-8 grid gap-x-16 md:mt-10 md:grid-cols-2">
        {showCanvas && isDesktop && (
          <div className="relative sticky top-0 h-screen">
            <div className="absolute inset-0 flex items-center justify-center">
              <ServicesCanvas state={coreState} frameloop={frameloop} />
            </div>
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-transparent to-void" />
          </div>
        )}

        <div>
          {services.map((service, index) => (
            <ServicePanel
              key={service.slug}
              service={service}
              index={index}
              active={active === index}
              panelRef={refs[index]!}
            />
          ))}
        </div>
      </div>

      <div className="shell relative z-10 pb-20 pt-4 md:pb-24">
        <Reveal className="max-w-2xl border-t border-accent-iris/25 pt-8">
          <span className="mono text-xs uppercase tracking-wider text-accent-iris">
            04 · Flagship Service
          </span>
          <h3 className="mt-3 font-display text-xl font-bold text-ink md:text-2xl">
            Complete Digital Ecosystems
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
            When a business needs everything connected, we design and build
            it as one system.
          </p>
          <Link
            href="#ecosystem"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent-iris"
          >
            See the ecosystem model
            <span aria-hidden="true">→</span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
