"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion, useScroll, useTransform } from "motion/react";
import { useIntro } from "@/lib/intro/IntroContext";
import { useDocumentVisible } from "@/hooks/useDocumentVisible";
import { MagneticLink } from "@/components/ui/MagneticLink";

const SceneCanvas = dynamic(() => import("@/components/canvas/SceneCanvas"), {
  ssr: false,
});

export function Hero() {
  const { phase, tier } = useIntro();
  const documentVisible = useDocumentVisible();
  const [mounted, setMounted] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const canvasOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.25]);
  const canvasScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const contentY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  useEffect(() => setMounted(true), []);

  const showCanvas = mounted && tier !== "safe";
  const frameloop = documentVisible ? "always" : "never";

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-void pb-20 pt-32 sm:justify-center sm:pb-0"
    >
      <motion.div
        className="absolute inset-0 z-0"
        style={tier !== "safe" ? { opacity: canvasOpacity, scale: canvasScale } : undefined}
      >
        {showCanvas ? (
          <SceneCanvas
            phase={phase}
            particleCount={tier === "high" ? 1800 : 900}
            allowParallax
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
      </motion.div>

      <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-void via-void/30 to-transparent" />
      <div
        className="pointer-events-none absolute inset-0 z-[1]"
        style={{
          background:
            "linear-gradient(100deg, rgba(4,4,6,0.7) 0%, rgba(4,4,6,0.34) 22%, transparent 46%)",
        }}
        aria-hidden="true"
      />

      {phase === "hero" && <HeroStructuralAccent />}

      <motion.div
        className="shell relative z-10"
        style={tier !== "safe" ? { y: contentY, opacity: contentOpacity } : undefined}
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={phase === "hero" ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="mono text-xs uppercase tracking-[0.3em] text-accent-cyan">
            Digital Product &amp; Engineering Studio
          </p>
          <h1 className="relative z-10 mt-6 max-w-5xl font-display text-4xl font-bold leading-[1.02] text-ink sm:text-6xl md:text-7xl lg:text-[5.5rem] lg:leading-[0.98]">
            We build digital products that move your business forward.
          </h1>
          <div className="mt-8 flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
            <p className="max-w-md text-base leading-relaxed text-ink-muted md:text-lg">
              Apps. Web platforms. Business systems. Complete digital
              ecosystems — designed and engineered as one connected build.
            </p>
            <div className="flex flex-wrap items-center gap-4">
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
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/**
 * A single restrained structural line connecting the typography block to
 * the assembled product — the one piece of foreground "in front of type"
 * layering, kept to a light/line rather than another floating label.
 */
function HeroStructuralAccent() {
  return (
    <svg
      className="pointer-events-none absolute inset-0 z-20 hidden h-full w-full lg:block"
      aria-hidden="true"
    >
      <motion.line
        x1="42%"
        y1="72%"
        x2="63%"
        y2="58%"
        stroke="rgba(94,234,212,0.35)"
        strokeWidth="1"
        strokeDasharray="2 6"
        initial={{ opacity: 0, pathLength: 0 }}
        animate={{ opacity: 1, pathLength: 1, strokeDashoffset: [0, -16] }}
        transition={{
          opacity: { duration: 1.2, delay: 0.6 },
          pathLength: { duration: 1.2, delay: 0.6 },
          strokeDashoffset: { duration: 3, repeat: Infinity, ease: "linear" },
        }}
      />
      <motion.circle
        cx="63%"
        cy="58%"
        r="2.5"
        fill="#5eead4"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.9, 0] }}
        transition={{ duration: 3, repeat: Infinity, delay: 1 }}
      />
    </svg>
  );
}
