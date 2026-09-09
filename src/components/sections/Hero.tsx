"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "motion/react";
import { useIntro } from "@/lib/intro/IntroContext";
import { useDocumentVisible } from "@/hooks/useDocumentVisible";
import { IntroOverlay } from "@/components/sections/IntroOverlay";
import { MagneticLink } from "@/components/ui/MagneticLink";

const SceneCanvas = dynamic(() => import("@/components/canvas/SceneCanvas"), {
  ssr: false,
});

const PHASE_DURATIONS_MS = {
  desktop: { void: 1100, assembly: 2100, connection: 1900, transition: 1000 },
  mobile: { void: 650, assembly: 1250, connection: 1150, transition: 600 },
};

export function Hero() {
  const { phase, setPhase, skip, shouldPlayIntro, tier } = useIntro();
  const documentVisible = useDocumentVisible();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!shouldPlayIntro) return;

    const isMobile = window.innerWidth < 768;
    const durations = isMobile
      ? PHASE_DURATIONS_MS.mobile
      : PHASE_DURATIONS_MS.desktop;

    let elapsed = 0;
    const schedule = (phaseName: typeof phase, delay: number) => {
      elapsed += delay;
      timers.current.push(setTimeout(() => setPhase(phaseName), elapsed));
    };

    schedule("assembly", durations.void);
    schedule("connection", durations.assembly);
    schedule("transition", durations.connection);
    schedule("hero", durations.transition);

    return () => {
      timers.current.forEach(clearTimeout);
      timers.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldPlayIntro]);

  const showCanvas = mounted && tier !== "safe";
  const frameloop = documentVisible ? "always" : "never";

  return (
    <section
      id="hero"
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-void pb-20 pt-32 sm:justify-center sm:pb-0"
    >
      <div className="absolute inset-0 z-0">
        {showCanvas ? (
          <SceneCanvas
            phase={phase}
            particleCount={tier === "high" ? 1800 : 900}
            allowParallax={tier === "high"}
            frameloop={frameloop}
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background:
                "radial-gradient(60% 50% at 30% 30%, rgba(110,98,229,0.16), transparent 60%), radial-gradient(50% 40% at 75% 65%, rgba(94,234,212,0.10), transparent 65%), #040406",
            }}
          />
        )}
      </div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-void via-void/40 to-transparent" />
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(100deg, #040406 0%, rgba(4,4,6,0.92) 32%, rgba(4,4,6,0.55) 52%, transparent 72%)",
        }}
        aria-hidden="true"
      />

      {shouldPlayIntro && phase !== "hero" && (
        <IntroOverlay phase={phase} onSkip={skip} />
      )}

      <div className="shell relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={phase === "hero" ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          <p className="mono text-xs uppercase tracking-[0.3em] text-accent-cyan">
            Digital Product &amp; Engineering Studio
          </p>
          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] text-ink sm:text-5xl md:text-6xl lg:text-7xl">
            We build digital products that move your business forward.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
            Apps. Web platforms. Business systems. Complete digital
            ecosystems — designed and engineered as one connected build.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <MagneticLink
              href="/start-a-project"
              className="rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
            >
              Start a Project
            </MagneticLink>
            <Link
              href="/services"
              className="group flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-accent-cyan"
            >
              Explore Capabilities
              <span
                aria-hidden="true"
                className="transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
