"use client";

import { useId, useRef } from "react";
import Image from "next/image";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ISLAMQUEST_SCREENS, type IslamQuestScreen } from "@/data/islamquestShowcase";
import { useReducedMotion } from "@/hooks/useReducedMotion";

const COUNT = ISLAMQUEST_SCREENS.length;
const MINT = "94,234,212";

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
const smooth = (t: number) => t * t * (3 - 2 * t);
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Scroll progress → screen position (0 … 7). Every screen holds, then
 * hands over to the next, so each one settles instead of streaming past.
 */
function positionKeys(start: number, end: number, hold = 1, change = 0.7) {
  const unit = (end - start) / (COUNT * hold + (COUNT - 1) * change);
  const input = [start];
  const output = [0];
  let t = start;
  for (let i = 0; i < COUNT; i += 1) {
    t += hold * unit;
    input.push(t);
    output.push(i);
    if (i < COUNT - 1) {
      t += change * unit;
      input.push(t);
      output.push(i + 1);
    }
  }
  return { input, output };
}

/* ------------------------------------------------------------------ */
/* Device                                                               */
/* ------------------------------------------------------------------ */

/** Screen corner radius — larger than the source screens' own rounding. */
const SCREEN_RADIUS = "11% / 5.2%";

/**
 * One screen in the hero phone's stack. Moving forward, the outgoing
 * screen pushes past the viewer (scales up, softens, fades) while the
 * next rises into place from just behind — "going deeper into the app".
 */
function StackedScreen({
  screen,
  index,
  position,
  reduced,
  priority,
}: {
  screen: IslamQuestScreen;
  index: number;
  position: MotionValue<number>;
  reduced: boolean;
  priority: boolean;
}) {
  const opacity = useTransform(position, (p) => {
    const d = index - p;
    if (d >= 1 || d <= -1) return 0;
    return d >= 0 ? smooth(1 - d) : smooth(1 - clamp01(-d * 1.6));
  });
  const scale = useTransform(position, (p) => {
    if (reduced) return 1;
    const d = index - p;
    return d >= 0 ? 1 - 0.06 * clamp01(d) : 1 + 0.1 * clamp01(-d);
  });
  const y = useTransform(position, (p) => (reduced ? "0%" : `${clamp01(index - p) * 4}%`));
  const filter = useTransform(position, (p) => {
    const d = index - p;
    return reduced || d >= 0 ? "none" : `blur(${(clamp01(-d) * 6).toFixed(2)}px)`;
  });
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? "hidden" : "visible"));

  return (
    <motion.div className="absolute inset-0" style={{ opacity, scale, y, filter, visibility, zIndex: COUNT - index }}>
      <Image src={screen.src} alt={screen.alt} fill sizes="(min-width: 768px) 360px, 60vw" priority={priority} className="object-cover" />
    </motion.div>
  );
}

function Chassis({
  children,
  rim,
  className = "",
}: {
  children: React.ReactNode;
  rim?: MotionValue<string>;
  className?: string;
}) {
  return (
    <motion.div
      className={`relative rounded-[15%/7%] p-[3.2%] ${className}`}
      style={{
        background: "linear-gradient(150deg, #2b2e34 0%, #0c0d10 38%, #15171b 70%, #08090b 100%)",
        boxShadow:
          rim ??
          `inset 0 0 0 1px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 1px rgba(${MINT},0.18), 0 30px 60px -30px rgba(0,0,0,0.9)`,
      }}
    >
      {/* side keys */}
      <span className="absolute -left-[1.6%] top-[18%] h-[5%] w-[1.6%] rounded-l-sm bg-[#1a1c20]" aria-hidden="true" />
      <span className="absolute -left-[1.6%] top-[26%] h-[8%] w-[1.6%] rounded-l-sm bg-[#1a1c20]" aria-hidden="true" />
      <span className="absolute -right-[1.6%] top-[22%] h-[11%] w-[1.6%] rounded-r-sm bg-[#1a1c20]" aria-hidden="true" />
      {children}
    </motion.div>
  );
}

function Screen({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative aspect-[696/1480] overflow-hidden bg-[#0e2340]" style={{ borderRadius: SCREEN_RADIUS }}>
      {children}
      {/* glass: soft static reflection (no camera island — it would cover app UI) */}
      <div
        className="pointer-events-none absolute inset-0 z-20"
        style={{ background: "linear-gradient(125deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0) 28%, rgba(255,255,255,0) 72%, rgba(255,255,255,0.04) 100%)" }}
        aria-hidden="true"
      />
    </div>
  );
}

/** A plain dark device holding one screen — used by the All Screens grid. */
export function IslamQuestDevice({ screen, priority = false, sizes = "220px" }: { screen: IslamQuestScreen; priority?: boolean; sizes?: string }) {
  return (
    <Chassis>
      <Screen>
        <Image src={screen.src} alt={screen.alt} fill sizes={sizes} priority={priority} className="object-cover" />
      </Screen>
    </Chassis>
  );
}

/**
 * The outgoing screen detaches as a smaller device and drifts back into
 * depth to one side — a brief supporting layer, never a permanent fan.
 */
function DepthEcho({ screen, index, position }: { screen: IslamQuestScreen; index: number; position: MotionValue<number> }) {
  const side = index % 2 === 0 ? 1 : -1;
  const opacity = useTransform(position, (p) => {
    const d = p - index; // 0 → 1 while this screen is leaving
    return d > 0 && d < 1.3 ? Math.sin(Math.min(1, d / 1.3) * Math.PI) * 0.5 : 0;
  });
  const x = useTransform(position, (p) => `${side * clamp01((p - index) / 1.3) * 78}%`);
  const scale = useTransform(position, (p) => 0.74 - clamp01((p - index) / 1.3) * 0.12);
  const rotateY = useTransform(position, (p) => side * -22 * clamp01((p - index) / 1.3));
  const visibility = useTransform(opacity, (o) => (o < 0.01 ? "hidden" : "visible"));

  return (
    <motion.div
      className="pointer-events-none absolute inset-0"
      style={{ opacity, x, scale, rotateY, visibility, filter: "brightness(0.7) saturate(0.85)" }}
      aria-hidden="true"
    >
      <Chassis>
        <Screen>
          <Image src={screen.src} alt="" fill sizes="220px" className="object-cover" />
        </Screen>
      </Chassis>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Stage                                                                */
/* ------------------------------------------------------------------ */

interface StageProps {
  position: MotionValue<number>;
  progress: MotionValue<number>;
  reveal: MotionValue<number>;
}

/**
 * The case-study product stage: a dark graphite device with a thin mint
 * rim light (no halo or ring), a light sweep across the glass on every
 * screen change and a soft contact shadow.
 */
function IslamQuestStage({ position, progress, reveal }: StageProps) {
  const reduced = useReducedMotion();

  // 0 → 1 → 0 across each hand-over: drives the sweep and rim flare.
  const pulse = useTransform(position, (p) => Math.sin((p % 1) * Math.PI));
  const sweepX = useTransform(position, (p) => `${-130 + (p % 1) * 260}%`);
  const sweepOpacity = useTransform(pulse, (v) => (reduced ? 0 : v * 0.55));
  const rim = useTransform([reveal, pulse] as MotionValue<number>[], ([r = 0, v = 0]: number[]) => {
    const a = 0.16 + r * 0.14 + v * 0.3;
    return `inset 0 0 0 1px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 1px rgba(${MINT},${a.toFixed(3)}), 0 40px 80px -36px rgba(0,0,0,0.95)`;
  });
  const stageScale = useTransform([reveal, progress] as MotionValue<number>[], ([r = 0, p = 0]: number[]) =>
    reduced ? 1 : 0.9 + r * 0.1 + p * 0.04,
  );
  const stageY = useTransform(reveal, (r) => (reduced ? 0 : (1 - r) * 40));
  const stageOpacity = useTransform(reveal, (r) => 0.35 + r * 0.65);

  return (
    <div className="relative flex flex-col items-center">
      <motion.div
        className="relative w-[min(17rem,56vw,24svh)] md:w-[17.5rem] lg:w-[19rem] [@media(max-height:820px)]:md:w-[16rem]" style={{ scale: stageScale, y: stageY, opacity: stageOpacity }}>
        {/* contact shadow (no halo, no circular glow) */}
        <div
          className="pointer-events-none absolute -bottom-[4%] left-1/2 h-[6%] w-[80%] -translate-x-1/2 rounded-[50%] blur-md"
          style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.7), transparent 75%)" }}
          aria-hidden="true"
        />

        <div className="absolute inset-0 z-[5]" style={{ perspective: 1200 }}>
          {!reduced &&
            ISLAMQUEST_SCREENS.slice(0, COUNT - 1).map((screen, i) => (
              <DepthEcho key={screen.src} screen={screen} index={i} position={position} />
            ))}
        </div>

        <div className="relative z-10">
          <Chassis rim={rim}>
            <Screen>
              {ISLAMQUEST_SCREENS.map((screen, i) => (
                <StackedScreen key={screen.src} screen={screen} index={i} position={position} reduced={reduced} priority={i === 0} />
              ))}
              <motion.div
                className="pointer-events-none absolute inset-y-0 z-10 w-[55%]"
                style={{
                  x: sweepX,
                  opacity: sweepOpacity,
                  background: `linear-gradient(100deg, transparent 0%, rgba(${MINT},0.0) 30%, rgba(${MINT},0.35) 50%, rgba(255,255,255,0.25) 52%, rgba(${MINT},0.0) 70%, transparent 100%)`,
                  mixBlendMode: "screen",
                }}
                aria-hidden="true"
              />
            </Screen>
          </Chassis>
        </div>

      </motion.div>

    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Expanded: case study                                                 */
/* ------------------------------------------------------------------ */

const CINEMA_SCREENS = positionKeys(0.1, 0.94, 1, 0.8);

function CinemaCaption({ screen, index, position }: { screen: IslamQuestScreen; index: number; position: MotionValue<number> }) {
  const opacity = useTransform(position, (p) => smooth(Math.max(0, 1 - Math.abs(index - p) * 2.4)));
  const x = useTransform(position, (p) => `${(index - p) * 18}%`);
  const visibility = useTransform(opacity, (o) => (o < 0.02 ? "hidden" : "visible"));
  return (
    <motion.div className="absolute inset-x-0 top-0" style={{ opacity, x, visibility }}>
      <p className="mono text-xs tracking-[0.25em] text-ink-faint">
        <span className="text-accent-cyan">{pad(index + 1)}</span> / {pad(COUNT)}
      </p>
      <h3 className="mt-4 font-display text-3xl font-bold leading-[1.05] text-ink md:text-4xl lg:text-5xl [@media(max-height:700px)]:mt-2 [@media(max-height:700px)]:text-2xl">
        {screen.title}
      </h3>
      <p className="mt-4 max-w-sm text-base leading-relaxed text-ink-muted [@media(max-height:700px)]:mt-2 [@media(max-height:700px)]:text-sm">
        {screen.subtitle}
      </p>
    </motion.div>
  );
}

function CinemaRail({ position }: { position: MotionValue<number> }) {
  return (
    <div className="flex gap-1.5" aria-hidden="true">
      {ISLAMQUEST_SCREENS.map((s, i) => (
        <RailTick key={s.src} index={i} position={position} />
      ))}
    </div>
  );
}

function RailTick({ index, position }: { index: number; position: MotionValue<number> }) {
  const fill = useTransform(position, (p) => clamp01(p - index + 1));
  return (
    <span className="relative block h-px w-6 bg-white/10 md:w-8">
      <motion.span className="absolute inset-0 origin-left bg-accent-cyan/80" style={{ scaleX: fill }} />
    </span>
  );
}

/**
 * Case-study "director's cut": a pinned sequence with the same device and
 * orbit language, larger, with each screen's caption given room to read.
 */
export function IslamQuestCinema() {
  const reduced = useReducedMotion();
  if (reduced) return <StaticCinema />;
  return <PinnedCinema />;
}

/** Reduced motion: one still device beside the full, numbered feature list. */
function StaticCinema() {
  return (
    <section data-iq-cinema aria-labelledby="iq-cinema-static" className="py-16 md:py-24">
      <div className="shell grid items-center gap-12 md:grid-cols-[1.15fr_0.85fr]">
        <div>
          <h2 id="iq-cinema-static" className="font-display text-3xl font-bold leading-[1.05] text-ink md:text-4xl">
            Inside IslamQuest
          </h2>
          <ol className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2">
            {ISLAMQUEST_SCREENS.map((s, i) => (
              <li key={s.src} className="border-t border-line pt-4">
                <p className="mono text-[11px] tracking-[0.25em] text-accent-cyan">{pad(i + 1)}</p>
                <p className="mt-2 text-sm font-semibold text-ink">{s.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">{s.subtitle}</p>
              </li>
            ))}
          </ol>
        </div>
        <div className="mx-auto w-full max-w-[17rem]">
          <IslamQuestDevice screen={ISLAMQUEST_SCREENS[0]!} sizes="272px" />
        </div>
      </div>
    </section>
  );
}

function PinnedCinema() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.5, restDelta: 0.0002 });
  const reveal = useTransform(progress, [0, 0.06], [0.6, 1], { clamp: true });
  const position = useTransform(progress, CINEMA_SCREENS.input, CINEMA_SCREENS.output);
  const listId = useId();
  const items = ISLAMQUEST_SCREENS;

  return (
    <section ref={ref} data-iq-cinema aria-labelledby={listId} className="relative h-[300vh] md:h-[340vh]">
      <h2 id={listId} className="visually-hidden">
        Inside IslamQuest
      </h2>
      <ol className="visually-hidden">
        {items.map((s) => (
          <li key={s.src}>
            {s.title} — {s.subtitle}
          </li>
        ))}
      </ol>
      <div className="sticky top-0 flex h-[100svh] items-center overflow-hidden">
        <div className="shell relative grid w-full items-center gap-8 pt-16 md:grid-cols-[0.85fr_1.15fr] md:pt-12">
          <div className="order-2 md:order-1">
            <div className="relative h-[11.5rem] md:h-[15rem] [@media(max-height:700px)]:h-[9rem]" aria-hidden="true">
              {items.map((screen, i) => (
                <CinemaCaption key={screen.src} screen={screen} index={i} position={position} />
              ))}
            </div>
            <div className="mt-4 md:mt-8">
              <CinemaRail position={position} />
            </div>
          </div>
          <div className="order-1 md:order-2">
            <IslamQuestStage position={position} progress={progress} reveal={reveal} />
          </div>
        </div>
      </div>
    </section>
  );
}

/** All Screens: the eight approved screens, in order, in the same device. */
export function IslamQuestScreenGrid() {
  return (
    <ol className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-4">
      {ISLAMQUEST_SCREENS.map((screen, i) => (
        <li key={screen.src} className="flex flex-col items-center">
          <div className="w-full max-w-[13rem]">
            <IslamQuestDevice screen={screen} sizes="(min-width: 1024px) 208px, 45vw" />
          </div>
          <p className="mono mt-5 text-[11px] tracking-[0.2em] text-accent-cyan">{pad(i + 1)}</p>
          <p className="mt-2 max-w-[13rem] text-center text-sm font-semibold text-ink">{screen.title}</p>
          <p className="mt-1 max-w-[13rem] text-center text-xs leading-relaxed text-ink-muted">{screen.subtitle}</p>
        </li>
      ))}
    </ol>
  );
}
