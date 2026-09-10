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

function ServiceGlyph({ slug }: { slug: Service["slug"] }) {
  if (slug === "apps") {
    return (
      <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true">
        <rect x="15" y="6" width="18" height="36" rx="3" stroke="#5eead4" strokeWidth="1.4" fill="none" />
        <line x1="19" y1="12" x2="29" y2="12" stroke="#5eead4" strokeWidth="1.4" />
        <line x1="19" y1="20" x2="29" y2="20" stroke="#828b9a" strokeWidth="1.2" opacity="0.6" />
        <line x1="19" y1="26" x2="25" y2="26" stroke="#828b9a" strokeWidth="1.2" opacity="0.6" />
      </svg>
    );
  }
  if (slug === "web") {
    return (
      <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true">
        <rect x="5" y="10" width="38" height="26" rx="2" stroke="#5eead4" strokeWidth="1.4" fill="none" />
        <line x1="5" y1="17" x2="43" y2="17" stroke="#5eead4" strokeWidth="1.2" />
        <circle cx="9.5" cy="13.5" r="1" fill="#5eead4" />
        <circle cx="13" cy="13.5" r="1" fill="#828b9a" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden="true">
      <circle cx="24" cy="24" r="4" stroke="#6e62e5" strokeWidth="1.4" fill="none" />
      <circle cx="10" cy="12" r="2.2" fill="#6e62e5" />
      <circle cx="38" cy="12" r="2.2" fill="#6e62e5" />
      <circle cx="10" cy="36" r="2.2" fill="#5eead4" />
      <circle cx="38" cy="36" r="2.2" fill="#5eead4" />
      <line x1="21" y1="21" x2="10" y2="12" stroke="#6e62e5" strokeWidth="1" opacity="0.6" />
      <line x1="27" y1="21" x2="38" y2="12" stroke="#6e62e5" strokeWidth="1" opacity="0.6" />
      <line x1="21" y1="27" x2="10" y2="36" stroke="#5eead4" strokeWidth="1" opacity="0.6" />
      <line x1="27" y1="27" x2="38" y2="36" stroke="#5eead4" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

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
      className="flex min-h-[80vh] flex-col justify-center border-b border-line py-16 last:border-b-0 lg:min-h-screen lg:py-0"
    >
      <div className="flex items-center gap-4 lg:hidden">
        <ServiceGlyph slug={service.slug} />
        <span className="mono text-3xl font-semibold text-ink-faint">{service.index}</span>
      </div>

      <motion.span
        className="mono hidden text-6xl font-semibold lg:block xl:text-7xl"
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
        {service.outputs.map((output) => (
          <li key={output} className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-muted">
            {output}
          </li>
        ))}
      </ul>

      <p className="mt-6 max-w-md border-t border-line pt-6 text-sm font-medium text-ink">
        {service.outcome}
      </p>

      <Link
        href={`/services/${service.slug}`}
        className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-accent-cyan"
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
  const showCanvas = tier !== "safe";
  const coreState = SERVICE_CORE_STATE[services[active]!.slug];

  return (
    <section id="what-we-build" className="relative overflow-hidden border-t border-line bg-void">
      <AtmosphereLayer tone="cyan" />
      <div className="shell relative z-10 py-24 md:py-28">
        <SectionHeading
          index="01"
          eyebrow="What We Build"
          title="Three disciplines. One connected build."
          description="Every engagement draws on the same team and the same architecture — not a website agency, an app agency and a backend contractor stitched together after the fact. Scroll to see each capability."
        />
      </div>

      <div className="shell relative z-10 grid gap-x-16 lg:grid-cols-2">
        {showCanvas && (
          <div className="relative hidden lg:sticky lg:top-0 lg:block lg:h-screen">
            <div className="absolute inset-0 flex items-center justify-center">
              <ServicesCanvas state={coreState} frameloop={documentVisible ? "always" : "never"} />
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

      <div className="shell relative z-10 pb-24 md:pb-28">
        <Reveal className="max-w-2xl border-t border-accent-iris/25 pt-8">
          <span className="mono text-xs uppercase tracking-wider text-accent-iris">
            04 · Flagship Service
          </span>
          <h3 className="mt-3 font-display text-xl font-bold text-ink md:text-2xl">
            Complete Digital Ecosystems
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-muted">
            When a business needs everything connected, we design and build
            it as one system — not a website team, an app team and a
            backend team who never talk to each other.
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
