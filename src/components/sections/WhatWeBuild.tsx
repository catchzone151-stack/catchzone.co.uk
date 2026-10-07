"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { services, type Service } from "@/data/services";
import type { CoreState } from "@/lib/three/coreTargets";
import { usePerformanceTier } from "@/lib/performance/usePerformanceTier";
import { useDocumentVisible } from "@/hooks/useDocumentVisible";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { AtmosphereLayer } from "@/components/ui/AtmosphereLayer";

const ServicesCanvas = dynamic(() => import("@/components/canvas/ServicesCanvas"), {
  ssr: false,
});

const SERVICE_CORE_STATE: Record<Service["slug"], CoreState> = {
  apps: "mobile",
  web: "web",
  systems: "systems",
};

/**
 * Scroll progress → capability position (0, 1, 2). Each capability holds
 * long enough to read before the next slides in; the final beat converges
 * the 3D pieces into one system as the section hands off to 07.
 */
const POSITION_KEYS = { input: [0, 0.2, 0.38, 0.56, 0.74, 1], output: [0, 0, 1, 1, 2, 2] };
const CONVERGE_FROM = 0.9;

function CapabilitySlide({
  service,
  index,
  position,
}: {
  service: Service;
  index: number;
  position: MotionValue<number>;
}) {
  // offset < 0: already passed (exits left); offset > 0: still to come
  // (enters from the right). Each slide is fully gone before the next
  // arrives, so the two never overlap mid-transition.
  const x = useTransform(position, (p) => `${(index - p) * 30}%`);
  const opacity = useTransform(position, (p) => {
    const t = Math.max(0, 1 - Math.abs(index - p) * 2.4);
    return t * t * (3 - 2 * t);
  });
  const visibility = useTransform(opacity, (o) => (o < 0.02 ? "hidden" : "visible"));

  return (
    <motion.div className="absolute inset-x-0 top-0" style={{ x, opacity, visibility }}>
      <h3 className="font-display text-2xl font-bold leading-tight text-ink sm:text-3xl lg:text-4xl">
        {service.name}
      </h3>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted lg:text-base">
        {service.description}
      </p>
      <ul className="mt-6 flex flex-wrap gap-2">
        {service.outputs.slice(0, 4).map((output, i) => (
          <li
            key={output}
            className={`rounded-full border border-line px-3 py-1.5 text-xs text-ink-muted ${i > 2 ? "hidden sm:block" : ""}`}
          >
            {output}
          </li>
        ))}
      </ul>
      <Link
        href={`/services/${service.slug}`}
        className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-accent-cyan"
      >
        Learn more
        <span aria-hidden="true">→</span>
      </Link>
    </motion.div>
  );
}

/** Small internal progress — deliberately quieter than the page's section numbers. */
function CapabilityProgress({ position, active }: { position: MotionValue<number>; active: number }) {
  return (
    <div className="flex items-center gap-4" aria-hidden="true">
      <span className="mono text-xs tracking-[0.2em] text-ink-muted">
        <span className="text-accent-cyan">0{active + 1}</span> / 0{services.length}
      </span>
      <div className="flex gap-1.5">
        {services.map((s, i) => (
          <ProgressSegment key={s.slug} index={i} position={position} />
        ))}
      </div>
    </div>
  );
}

function ProgressSegment({ index, position }: { index: number; position: MotionValue<number> }) {
  // Fills as the visitor arrives at this capability.
  const fill = useTransform(position, (p) => Math.min(1, Math.max(0, p - index + 1)));
  return (
    <span className="relative block h-px w-8 bg-white/10 sm:w-10">
      <motion.span className="absolute inset-0 origin-left bg-accent-cyan/80" style={{ scaleX: fill }} />
    </span>
  );
}

function SectionHeading() {
  return (
    <>
      <div className="flex items-center gap-3">
        <span className="mono text-xs text-accent-cyan">06</span>
        <span className="mono text-xs uppercase tracking-[0.2em] text-ink-faint">What We Build</span>
      </div>
      <h2 className="mt-3 max-w-2xl font-display text-3xl font-bold leading-tight text-ink sm:text-4xl md:mt-4 md:text-5xl">
        Three disciplines. One connected build.
      </h2>
      <p className="mt-4 hidden max-w-2xl text-base leading-relaxed text-ink-muted lg:block">
        Every engagement draws on the same connected build approach and architecture.
      </p>
    </>
  );
}

/**
 * Reduced motion / no WebGL / low-power devices: the three capabilities
 * side by side as one calm, unpinned composition.
 */
function StaticWhatWeBuild({ sectionRef }: { sectionRef: React.Ref<HTMLElement> }) {
  return (
    <section ref={sectionRef} id="what-we-build" aria-label="What We Build" className="relative border-t border-line bg-void py-24 md:py-32">
      <AtmosphereLayer tone="cyan" />
      <div className="shell relative z-10">
        <SectionHeading />
        <ol className="mt-12 grid gap-10 md:grid-cols-3 md:gap-8">
          {services.map((service, index) => (
            <li key={service.slug} className="flex flex-col border-t border-line pt-6">
              <span className="mono text-xs tracking-[0.2em] text-ink-muted">
                <span className="text-accent-cyan">0{index + 1}</span> / 0{services.length}
              </span>
              <h3 className="mt-4 font-display text-2xl font-bold leading-tight text-ink">{service.name}</h3>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">{service.description}</p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {service.outputs.slice(0, 3).map((output) => (
                  <li key={output} className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-muted">
                    {output}
                  </li>
                ))}
              </ul>
              <Link
                href={`/services/${service.slug}`}
                className="mt-6 inline-flex w-fit items-center gap-2 text-sm font-semibold text-accent-cyan"
              >
                Learn more
                <span aria-hidden="true">→</span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/**
 * 06 — What We Build. One pinned sequence: the three capabilities slide
 * across in turn while the convergence core reconfigures for each, then
 * gathers into one connected system before handing off to 07.
 */
export function WhatWeBuild() {
  const containerRef = useRef<HTMLElement>(null);
  const tier = usePerformanceTier();
  const documentVisible = useDocumentVisible();
  // Phone landscape is too short for the pinned sequence to breathe.
  const shortLandscape = useMediaQuery("(orientation: landscape) and (max-height: 500px)");
  const inView = useInView(containerRef, { margin: "120px 0px 120px 0px" });
  // The WebGL core is only created once the section is within a screen of the viewport.
  const nearView = useInView(containerRef, { once: true, margin: "100% 0px 100% 0px" });
  const showCanvas = nearView;

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.5, restDelta: 0.0002 });
  const position = useTransform(progress, POSITION_KEYS.input, POSITION_KEYS.output);
  // A gentle lateral lean of the visual while a transition is under way.
  const canvasX = useTransform(position, (p) => `${-Math.sin((p % 1) * Math.PI) * 4}%`);

  const [active, setActive] = useState(0);
  const [converged, setConverged] = useState(false);
  useMotionValueEvent(position, "change", (p) => {
    const next = Math.min(services.length - 1, Math.round(p));
    setActive((prev) => (prev === next ? prev : next));
  });
  useMotionValueEvent(progress, "change", (v) => {
    const next = v >= CONVERGE_FROM;
    setConverged((prev) => (prev === next ? prev : next));
  });

  const coreState: CoreState = converged ? "ecosystem" : SERVICE_CORE_STATE[services[active]!.slug];

  if (tier === "safe" || shortLandscape) return <StaticWhatWeBuild sectionRef={containerRef} />;

  return (
    <section
      ref={containerRef}
      id="what-we-build"
      aria-label="What We Build"
      className="relative h-[210vh] border-t border-line bg-void lg:h-[240vh]"
    >
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        <AtmosphereLayer tone="cyan" />

        <div className="shell relative z-10 pt-24 md:pt-28">
          <SectionHeading />
        </div>

        <div className="shell relative z-10 grid min-h-0 flex-1 grid-rows-[minmax(0,0.8fr)_auto] gap-x-16 pb-8 md:pb-12 lg:grid-cols-2 lg:grid-rows-1">
          <motion.div className="relative min-h-0" style={{ x: canvasX }}>
            {showCanvas && (
              <div className="absolute inset-0">
                <ServicesCanvas state={coreState} frameloop={inView && documentVisible ? "always" : "never"} quality={tier === "high" ? "high" : "balanced"} />
              </div>
            )}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-void via-transparent to-void/70" />
          </motion.div>

          <div className="relative flex flex-col justify-center pt-2 lg:pt-0">
            <CapabilityProgress position={position} active={active} />
            <div className="relative mt-6 h-[17.5rem] overflow-hidden sm:h-[15rem] lg:h-[19rem]">
              {services.map((service, index) => (
                <CapabilitySlide key={service.slug} service={service} index={index} position={position} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
