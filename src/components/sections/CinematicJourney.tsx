"use client";

import { useEffect, useRef, useState } from "react";
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
import { useIntro } from "@/lib/intro/IntroContext";
import { useDocumentVisible } from "@/hooks/useDocumentVisible";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { MagneticLink } from "@/components/ui/MagneticLink";
import { beats } from "@/lib/three/journeyBeats";

const JourneyCanvas = dynamic(() => import("@/components/canvas/JourneyCanvas"), {
  ssr: false,
});

type Beat = readonly [number, number, number, number];

interface Stage {
  label: string;
  heading: string;
  body: string;
  beat: Beat;
  link?: { href: string; label: string };
}

const STAGES: Stage[] = [
  {
    label: "Idea",
    heading: "It starts as a rough idea.",
    body: "We map who it's for, what it needs to do and how the pieces fit together, before anything is built.",
    beat: beats.idea,
  },
  {
    label: "Design",
    heading: "The structure becomes an interface.",
    body: "Wireframes turn into a clear, considered interface, designed for every screen it will live on.",
    beat: beats.design,
  },
  {
    label: "Build",
    heading: "The interface becomes working software.",
    body: "Engineered for phone, tablet and web, with the backend and data that run it.",
    beat: beats.build,
  },
  {
    label: "Ship",
    heading: "Then it ships, connected and live.",
    body: "Launched, monitored and ready to grow. Shown here: Brookmere Academy.",
    beat: beats.ship,
    link: { href: "/work/brookmere-academy", label: "View the project" },
  },
];

function HeroCopy() {
  return (
    <>
      <p className="mono text-xs uppercase tracking-[0.3em] text-accent-cyan">
        Digital Product &amp; Engineering Studio
      </p>
      <h1 className="mt-6 max-w-4xl font-display text-4xl font-bold leading-[1.02] text-ink sm:text-6xl md:text-7xl lg:text-[5.25rem] lg:leading-[0.98]">
        We build digital products that move your business forward.
      </h1>
      <div className="mt-8 flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between lg:max-w-4xl">
        <p className="max-w-md text-base leading-relaxed text-ink-muted md:text-lg">
          Apps. Web platforms. Business systems. Complete digital ecosystems —
          designed and engineered as one connected build.
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
            <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>
        </div>
      </div>
    </>
  );
}

function StageLabel({ index, label }: { index: number; label: string }) {
  return (
    <p className="mono flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-accent-cyan">
      <span className="text-ink-faint">0{index + 1}</span>
      <span aria-hidden="true" className="h-px w-8 bg-accent-cyan/40" />
      {label}
    </p>
  );
}

function StageCaption({ stage, index, progress }: { stage: Stage; index: number; progress: MotionValue<number> }) {
  const [a, b, c, d] = stage.beat;
  const opacity = useTransform(progress, [a, b, c, d], [0, 1, 1, 0]);
  const y = useTransform(progress, [a, b, c, d], [30, 0, 0, -30]);
  const visibility = useTransform(opacity, (o) => (o < 0.02 ? "hidden" : "visible"));

  return (
    <div className="absolute inset-x-0 bottom-0 pb-10 sm:pb-14 md:landscape:bottom-auto md:landscape:top-1/2 md:landscape:-translate-y-1/2 md:landscape:pb-0">
      <motion.div className="shell" style={{ opacity, y, visibility }}>
        <div className="max-w-sm md:max-w-md md:landscape:max-w-[22rem] lg:landscape:max-w-md">
          <StageLabel index={index} label={stage.label} />
          <h2 className="mt-5 font-display text-3xl font-bold leading-[1.05] text-ink md:text-4xl lg:text-5xl">
            {stage.heading}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-muted">{stage.body}</p>
          {stage.link && (
            <Link
              href={stage.link.href}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-cyan"
            >
              {stage.link.label}
              <span aria-hidden="true">→</span>
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function StageRail({ progress }: { progress: MotionValue<number> }) {
  const [active, setActive] = useState(-1);
  const opacity = useTransform(progress, [0.11, 0.16, 0.9, 0.95], [0, 1, 1, 0]);
  const fill = useTransform(progress, [0.15, 0.9], [0, 1]);

  useMotionValueEvent(progress, "change", (v) => {
    const next = STAGES.reduce((acc, s, i) => (v >= s.beat[0] ? i : acc), -1);
    setActive((prev) => (prev === next ? prev : next));
  });

  return (
    <motion.div
      className="pointer-events-none absolute inset-x-0 bottom-8 hidden md:landscape:block"
      style={{ opacity }}
      aria-hidden="true"
    >
      <div className="shell">
        <div className="inline-flex flex-col gap-3">
          <div className="flex gap-9">
            {STAGES.map((s, i) => (
              <span
                key={s.label}
                className={`mono text-[11px] uppercase tracking-[0.28em] transition-colors duration-500 ${
                  i === active ? "text-ink" : i < active ? "text-ink-muted" : "text-ink-faint"
                }`}
              >
                {s.label}
              </span>
            ))}
          </div>
          <div className="relative h-px w-full bg-white/10">
            <motion.span className="absolute inset-0 origin-left bg-accent-cyan/70" style={{ scaleX: fill }} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/** Static presentation for reduced motion / no WebGL / low-power devices. */
function StaticJourney() {
  return (
    <>
      <section
        id="hero"
        className="relative flex min-h-[100svh] flex-col justify-end overflow-hidden bg-void pb-20 pt-32 sm:justify-center sm:pb-0"
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 45% at 72% 38%, rgba(94,234,212,0.09), transparent 65%), radial-gradient(60% 50% at 20% 80%, rgba(110,98,229,0.08), transparent 70%), #040406",
          }}
          aria-hidden="true"
        />
        <div className="shell relative z-10">
          <HeroCopy />
        </div>
      </section>
      <section className="bg-void pb-8 pt-4 md:pb-12">
        <ol className="shell grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((stage, i) => (
            <li key={stage.label} className="border-t border-line pt-6">
              <StageLabel index={i} label={stage.label} />
              <h2 className="mt-4 font-display text-xl font-bold text-ink">{stage.heading}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{stage.body}</p>
              {stage.link && (
                <Link href={stage.link.href} className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-accent-cyan">
                  {stage.link.label}
                  <span aria-hidden="true">→</span>
                </Link>
              )}
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

/**
 * The homepage opening: one continuous, scroll-driven scene in which an
 * idea is designed, built and shipped — IDEA → DESIGN → BUILD → SHIP —
 * before the page settles into CatchZone's work. The WebGL stage is pinned
 * while semantic DOM carries every heading, caption and link.
 */
export function CinematicJourney() {
  const { tier } = useIntro();
  const documentVisible = useDocumentVisible();
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const inView = useInView(containerRef, { margin: "120px 0px 120px 0px" });

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  // One smoothed timeline shared by the WebGL scene and the DOM captions,
  // so wheel steps glide instead of snapping between states.
  const progress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    mass: 0.5,
    restDelta: 0.0002,
  });

  const heroOpacity = useTransform(progress, [beats.heroOut[0], beats.heroOut[1]], [1, 0]);
  const heroY = useTransform(progress, [beats.heroOut[0], beats.heroOut[1]], [0, -48]);
  const heroVisibility = useTransform(heroOpacity, (o) => (o < 0.02 ? "hidden" : "visible"));
  const cueOpacity = useTransform(progress, [0, 0.025], [1, 0]);
  const scrimOpacity = useTransform(progress, [0.12, 0.17, 0.9, 0.95], [0, 1, 1, 0]);
  const handoff = useTransform(progress, [0.9, 1], [0, 1]);

  useEffect(() => setMounted(true), []);

  if (mounted && tier === "safe") return <StaticJourney />;

  const showCanvas = mounted;

  return (
    <section
      ref={containerRef}
      id="hero"
      aria-label="From idea to working software"
      className="relative h-[440vh] bg-void md:h-[520vh]"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(50% 45% at 72% 38%, rgba(94,234,212,0.07), transparent 65%), #040406",
          }}
          aria-hidden="true"
        />
        {showCanvas && (
          <div className="absolute inset-0">
            <JourneyCanvas
              progress={progress}
              active={inView && documentVisible}
              quality={tier === "high" ? "high" : "balanced"}
              parallax={finePointer}
            />
          </div>
        )}

        {/* legibility: left column on desktop, lower band on mobile */}
        <motion.div
          className="pointer-events-none absolute inset-0 hidden md:landscape:block"
          style={{
            opacity: scrimOpacity,
            background: "linear-gradient(90deg, rgba(4,4,6,0.82) 0%, rgba(4,4,6,0.5) 26%, rgba(4,4,6,0) 50%)",
          }}
          aria-hidden="true"
        />
        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] md:landscape:hidden"
          style={{
            opacity: scrimOpacity,
            background: "linear-gradient(0deg, rgba(4,4,6,0.94) 0%, rgba(4,4,6,0.7) 45%, rgba(4,4,6,0) 100%)",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(0deg, rgba(4,4,6,0.85) 0%, rgba(4,4,6,0) 32%), linear-gradient(100deg, rgba(4,4,6,0.55) 0%, rgba(4,4,6,0) 45%)",
          }}
          aria-hidden="true"
        />

        <motion.div
          className="absolute inset-0 flex flex-col justify-end pb-24 pt-32 sm:justify-center sm:pb-0"
          style={{ opacity: heroOpacity, y: heroY, visibility: heroVisibility }}
        >
          <div className="shell relative z-10">
            <HeroCopy />
          </div>
        </motion.div>

        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-7 hidden justify-center sm:flex [@media(max-height:820px)]:hidden"
          style={{ opacity: cueOpacity }}
          aria-hidden="true"
        >
          <div className="flex flex-col items-center gap-3">
            <span className="mono text-[11px] uppercase tracking-[0.3em] text-ink-faint">
              Idea · Design · Build · Ship
            </span>
            <span className="scroll-cue block h-9 w-px bg-gradient-to-b from-accent-cyan/70 to-transparent" />
          </div>
        </motion.div>

        {STAGES.map((stage, i) => (
          <StageCaption key={stage.label} stage={stage} index={i} progress={progress} />
        ))}

        <StageRail progress={progress} />

        <motion.div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2"
          style={{
            opacity: handoff,
            background: "linear-gradient(0deg, #040406 0%, rgba(4,4,6,0.6) 45%, rgba(4,4,6,0) 100%)",
          }}
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
