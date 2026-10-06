"use client";

import { useId, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  motion,
  useMotionValueEvent,
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

function useActiveScreen(position: MotionValue<number>) {
  const [active, setActive] = useState(0);
  useMotionValueEvent(position, "change", (p) => {
    const next = Math.min(COUNT - 1, Math.max(0, Math.round(p)));
    setActive((prev) => (prev === next ? prev : next));
  });
  return active;
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
/* Orbit                                                                */
/* ------------------------------------------------------------------ */

const ORBIT = { cx: 50, cy: 54, rx: 47, ry: 12.5, rotate: -13 };
const ORBIT_LENGTH = 2 * Math.PI * Math.sqrt((ORBIT.rx ** 2 + ORBIT.ry ** 2) / 2);

/**
 * The CatchZone orbit wrapping the phone, as in the logo: its far half
 * passes behind the device, its near half in front. A bright arc and the
 * orbit's node travel with scroll and flare on each screen change.
 */
function Orbit({ layer, progress, pulse }: { layer: "back" | "front"; progress: MotionValue<number>; pulse: MotionValue<number> }) {
  const clipId = useId();
  const dashOffset = useTransform(progress, (p) => -p * ORBIT_LENGTH * 1.6);
  const arcOpacity = useTransform(pulse, (v) => 0.55 + v * 0.45);
  const nodeX = useTransform(progress, (p) => ORBIT.cx + ORBIT.rx * Math.cos(-0.6 + p * Math.PI * 3.2));
  const nodeY = useTransform(progress, (p) => ORBIT.cy + ORBIT.ry * Math.sin(-0.6 + p * Math.PI * 3.2));
  const nodeR = useTransform(pulse, (v) => 0.7 + v * 0.5);

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute inset-[-8%_-14%] ${layer === "front" ? "z-30" : "z-0"}`}
      aria-hidden="true"
    >
      {layer === "front" && (
        <defs>
          <clipPath id={clipId}>
            <rect x="0" y={ORBIT.cy} width="100" height={100 - ORBIT.cy} />
          </clipPath>
        </defs>
      )}
      <g clipPath={layer === "front" ? `url(#${clipId})` : undefined}>
        <g transform={`rotate(${ORBIT.rotate} ${ORBIT.cx} ${ORBIT.cy})`}>
          <ellipse
            cx={ORBIT.cx}
            cy={ORBIT.cy}
            rx={ORBIT.rx}
            ry={ORBIT.ry}
            fill="none"
            stroke={`rgba(${MINT},${layer === "front" ? 0.38 : 0.2})`}
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
          <motion.ellipse
            cx={ORBIT.cx}
            cy={ORBIT.cy}
            rx={ORBIT.rx}
            ry={ORBIT.ry}
            fill="none"
            stroke={`rgb(${MINT})`}
            strokeWidth="2.2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            strokeDasharray={`${ORBIT_LENGTH * 0.14} ${ORBIT_LENGTH}`}
            style={{ strokeDashoffset: dashOffset, opacity: arcOpacity }}
          />
          <motion.circle cx={nodeX} cy={nodeY} r={nodeR} fill="#e9fffb" />
        </g>
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Stage                                                                */
/* ------------------------------------------------------------------ */

interface StageProps {
  position: MotionValue<number>;
  progress: MotionValue<number>;
  reveal: MotionValue<number>;
  size?: "teaser" | "expanded";
  showCaption?: boolean;
}

/**
 * The shared IslamQuest product stage: a dark graphite device with a thin
 * mint rim light, the CatchZone orbit, a light sweep across the glass on
 * every screen change and a soft floor glow.
 */
export function IslamQuestStage({ position, progress, reveal, size = "teaser", showCaption = true }: StageProps) {
  const reduced = useReducedMotion();
  const active = useActiveScreen(position);

  // 0 → 1 → 0 across each hand-over: drives the sweep and rim flare.
  const pulse = useTransform(position, (p) => Math.sin((p % 1) * Math.PI));
  const sweepX = useTransform(position, (p) => `${-130 + (p % 1) * 260}%`);
  const sweepOpacity = useTransform(pulse, (v) => (reduced ? 0 : v * 0.55));
  const rim = useTransform([reveal, pulse] as MotionValue<number>[], ([r = 0, v = 0]: number[]) => {
    const a = 0.16 + r * 0.14 + v * 0.3;
    const g = 0.08 + r * 0.1 + v * 0.18;
    return `inset 0 0 0 1px rgba(255,255,255,0.07), inset 0 1px 0 rgba(255,255,255,0.12), 0 0 0 1px rgba(${MINT},${a.toFixed(3)}), 0 0 ${Math.round(40 + v * 30)}px rgba(${MINT},${g.toFixed(3)}), 0 40px 80px -36px rgba(0,0,0,0.95)`;
  });
  const stageScale = useTransform([reveal, progress] as MotionValue<number>[], ([r = 0, p = 0]: number[]) =>
    reduced ? 1 : 0.9 + r * 0.1 + p * 0.04,
  );
  const stageY = useTransform(reveal, (r) => (reduced ? 0 : (1 - r) * 40));
  const stageOpacity = useTransform(reveal, (r) => 0.35 + r * 0.65);
  const floorOpacity = useTransform([reveal, pulse] as MotionValue<number>[], ([r = 0, v = 0]: number[]) => r * (0.7 + v * 0.3));

  const width = size === "expanded" ? "w-[min(17rem,56vw)] md:w-[17.5rem] lg:w-[19rem] [@media(max-height:820px)]:md:w-[16rem]" : "w-[min(16.5rem,62vw)] md:w-[17rem] lg:w-[18.5rem]";

  return (
    <div className="relative flex flex-col items-center">
      <motion.div className={`relative ${width}`} style={{ scale: stageScale, y: stageY, opacity: stageOpacity }}>
        {/* ambient + floor light */}
        <div
          className="pointer-events-none absolute inset-[-30%_-60%]"
          style={{ background: `radial-gradient(42% 36% at 50% 46%, rgba(${MINT},0.10), transparent 70%)` }}
          aria-hidden="true"
        />
        <motion.div
          className="pointer-events-none absolute -bottom-[7%] left-1/2 h-[9%] w-[120%] -translate-x-1/2 rounded-[50%]"
          style={{ opacity: floorOpacity, background: `radial-gradient(50% 50% at 50% 50%, rgba(${MINT},0.22), rgba(${MINT},0.04) 55%, transparent 75%)` }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-[4%] left-1/2 h-[6%] w-[80%] -translate-x-1/2 rounded-[50%] blur-md"
          style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.7), transparent 75%)" }}
          aria-hidden="true"
        />

        {!reduced && <Orbit layer="back" progress={progress} pulse={pulse} />}

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

        {!reduced && <Orbit layer="front" progress={progress} pulse={pulse} />}
      </motion.div>

      {showCaption && (
        <div className="relative z-10 mt-10 flex min-h-[3.5rem] flex-col items-center text-center" aria-live="polite">
          <span className="mono text-[11px] tracking-[0.25em] text-ink-faint">
            <span className="text-accent-cyan">{pad(active + 1)}</span> / {pad(COUNT)}
          </span>
          <span className={`mt-2 text-sm font-semibold text-ink ${size === "teaser" ? "md:hidden" : ""}`}>
            {ISLAMQUEST_SCREENS[active]!.title}
          </span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Teaser: homepage + /work Featured Build                              */
/* ------------------------------------------------------------------ */

/**
 * Feature index shown under the Featured Build copy on wide screens. It
 * scrolls normally with the page while the phone stays in view beside it,
 * and the active entry tracks the screen on the device.
 */
function FeatureIndex({ active, onSelect }: { active: number; onSelect: (i: number) => void }) {
  return (
    <ol className="mt-12 hidden space-y-1 border-l border-line md:block">
      {ISLAMQUEST_SCREENS.map((screen, i) => {
        const isActive = i === active;
        return (
          <li key={screen.src}>
            <button
              type="button"
              onClick={() => onSelect(i)}
              aria-current={isActive ? "step" : undefined}
              className="group relative flex w-full items-baseline gap-4 py-2.5 pl-6 text-left"
            >
              <span
                className={`absolute -left-px top-0 h-full w-px transition-colors duration-300 ${isActive ? "bg-accent-cyan" : "bg-transparent"}`}
                aria-hidden="true"
              />
              <span className={`mono text-[11px] tracking-[0.2em] transition-colors duration-300 ${isActive ? "text-accent-cyan" : "text-ink-faint"}`}>
                {pad(i + 1)}
              </span>
              <span>
                <span className={`block text-sm font-semibold transition-colors duration-300 ${isActive ? "text-ink" : "text-ink-muted group-hover:text-ink"}`}>
                  {screen.title}
                </span>
                <span
                  className={`block overflow-hidden text-xs text-ink-muted transition-all duration-300 ${isActive ? "mt-1 max-h-6 opacity-100" : "max-h-0 opacity-0"}`}
                >
                  {screen.subtitle}
                </span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

const TEASER_SCREENS = positionKeys(0, 1, 1, 0.75);

/**
 * Homepage / /work Featured Build: the copy block scrolls normally while
 * the hero phone (and, on wide screens, the feature index) stay in view
 * for a short stretch, travelling through screens 01 → 08 before the page
 * carries on — no full-section freeze.
 */
export function IslamQuestTeaser({ copy }: { copy: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const stageCol = useRef<HTMLDivElement>(null);

  const { scrollYProgress: arrive } = useScroll({ target: stageCol, offset: ["start end", "start 0.2"] });
  const { scrollYProgress: travel } = useScroll({ target: stageCol, offset: ["start 0.12", "end 0.92"] });
  const reveal = useSpring(arrive, { stiffness: 140, damping: 32, mass: 0.5, restDelta: 0.0005 });
  const progress = useSpring(travel, { stiffness: 140, damping: 32, mass: 0.5, restDelta: 0.0002 });
  const position = useTransform(progress, TEASER_SCREENS.input, TEASER_SCREENS.output);
  const active = useActiveScreen(position);

  const select = (i: number) => {
    const el = stageCol.current;
    if (!el) return;
    // middle of screen i's hold window, mapped back onto the travel range
    const p = (TEASER_SCREENS.input[i * 2]! + TEASER_SCREENS.input[i * 2 + 1]!) / 2;
    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const startY = window.scrollY + rect.top - vh * 0.12;
    const endY = window.scrollY + rect.bottom - vh * 0.92;
    window.scrollTo({ top: startY + p * (endY - startY), behavior: "smooth" });
  };

  return (
    <div ref={ref} data-iq-teaser className="relative grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-8">
      <div className="relative z-10 flex flex-col">
        {copy}
        <div className="md:sticky md:top-[calc(50svh-10rem)]">
          <FeatureIndex active={active} onSelect={select} />
        </div>
      </div>
      <div ref={stageCol} className="relative min-h-[150vh] md:min-h-[175vh]">
        <div className="sticky top-[max(6.5rem,calc(50svh-20rem))] pb-4">
          <IslamQuestStage position={position} progress={progress} reveal={reveal} />
        </div>
      </div>
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
      <h3 className="mt-4 font-display text-3xl font-bold leading-[1.05] text-ink md:text-4xl lg:text-5xl">{screen.title}</h3>
      <p className="mt-4 max-w-sm text-base leading-relaxed text-ink-muted">{screen.subtitle}</p>
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
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.5, restDelta: 0.0002 });
  const reveal = useTransform(progress, [0, 0.06], [0.6, 1], { clamp: true });
  const position = useTransform(progress, CINEMA_SCREENS.input, CINEMA_SCREENS.output);
  const listId = useId();
  const items = useMemo(() => ISLAMQUEST_SCREENS, []);

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
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: `radial-gradient(45% 50% at 68% 52%, rgba(${MINT},0.07), transparent 70%)` }}
          aria-hidden="true"
        />
        <div className="shell relative grid w-full items-center gap-8 pt-16 md:grid-cols-[0.85fr_1.15fr] md:pt-12">
          <div className="order-2 md:order-1">
            <div className="relative h-[11.5rem] md:h-[15rem]" aria-hidden="true">
              {items.map((screen, i) => (
                <CinemaCaption key={screen.src} screen={screen} index={i} position={position} />
              ))}
            </div>
            <div className="mt-4 md:mt-8">
              <CinemaRail position={position} />
            </div>
          </div>
          <div className="order-1 md:order-2">
            <IslamQuestStage position={position} progress={progress} reveal={reveal} size="expanded" showCaption={false} />
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
