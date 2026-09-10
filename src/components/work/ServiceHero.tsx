"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useDocumentVisible } from "@/hooks/useDocumentVisible";
import { usePerformanceTier } from "@/lib/performance/usePerformanceTier";
import type { Service } from "@/data/services";
import type { CoreState } from "@/lib/three/coreTargets";

const ServicesCanvas = dynamic(() => import("@/components/canvas/ServicesCanvas"), {
  ssr: false,
});

interface ServiceHeroProps {
  service: Service;
  coreState: CoreState;
}

export function ServiceHero({ service, coreState }: ServiceHeroProps) {
  const tier = usePerformanceTier();
  const documentVisible = useDocumentVisible();
  const showCanvas = tier !== "safe";

  return (
    <section className="relative overflow-hidden border-b border-line bg-void pb-16 pt-32">
      <div className="absolute inset-0 z-0">
        {showCanvas ? (
          <ServicesCanvas state={coreState} frameloop={documentVisible ? "always" : "never"} />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                "radial-gradient(50% 45% at 70% 40%, rgba(94,234,212,0.10), transparent 65%), #040406",
            }}
          />
        )}
      </div>
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(100deg, #040406 0%, rgba(4,4,6,0.85) 30%, rgba(4,4,6,0.45) 50%, transparent 68%)",
        }}
        aria-hidden="true"
      />

      <div className="shell relative z-10">
        <p className="mono text-xs">
          <Link href="/services" className="text-ink-muted hover:text-ink">
            Services
          </Link>
          <span className="text-ink-faint"> / </span>
          <span className="text-ink-muted">{service.shortName}</span>
        </p>
        <p className="mono mt-6 text-xs uppercase tracking-[0.25em] text-accent-cyan">
          {service.index}
        </p>
        <h1 className="mt-4 max-w-2xl font-display text-4xl font-bold text-ink md:text-5xl">
          {service.name}
        </h1>
        <p className="mt-5 max-w-lg font-display text-lg text-ink md:text-xl">
          {service.heroTagline}
        </p>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">
          {service.description}
        </p>
      </div>
    </section>
  );
}
