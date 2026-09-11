"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { AccentTheme } from "@/data/projects";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useMediaQuery } from "@/hooks/useMediaQuery";

interface IslamQuestPhonesProps {
  accent: AccentTheme;
  className?: string;
}

const CENTRE_SRC = "/assets/images/islamquest/hero-phones/centre-home.png";
const LEFT_SRC = "/assets/images/islamquest/hero-phones/left-boss-level.png";
const RIGHT_SRC = "/assets/images/islamquest/hero-phones/right-leaderboard.png";

/** Back-ease-out — a restrained spring/overshoot feel without a physics sim. */
const ARRIVE_EASE = [0.3, 1.4, 0.5, 1] as const;

interface PhoneSpec {
  src: string;
  alt: string;
  layoutClassName: string;
  from: { x: string; y: string; scale: number; rotateY: number; rotateZ: number; rotateX?: number };
  to: { x: string; y: string; scale: number; rotateY: number; rotateZ: number };
  delay: number;
  duration: number;
  z: number;
}

/**
 * `compact` (sub-640px) tucks the supporting phones in close behind a
 * dominant, centred hero phone — "controlled partial peeks" per the brief,
 * rather than forcing the wide desktop spread into a narrow viewport where
 * the section's overflow-hidden would clip the supporting phones almost
 * entirely.
 */
function buildPhones(reduced: boolean, compact: boolean): PhoneSpec[] {
  if (compact) {
    return [
      {
        src: LEFT_SRC,
        alt: "IslamQuest Boss Level challenge screen",
        layoutClassName: "left-[4%] top-[24%] w-[30%]",
        from: reduced
          ? { x: "-16%", y: "8%", scale: 0.6, rotateY: 12, rotateZ: -3 }
          : { x: "-42%", y: "-6%", scale: 0.46, rotateY: -32, rotateZ: -10 },
        to: { x: "-16%", y: "8%", scale: 0.6, rotateY: 12, rotateZ: -3 },
        delay: 0,
        duration: reduced ? 0.01 : 1,
        z: 20,
      },
      {
        src: RIGHT_SRC,
        alt: "IslamQuest leaderboard screen",
        layoutClassName: "right-[4%] top-[24%] w-[30%]",
        from: reduced
          ? { x: "16%", y: "8%", scale: 0.6, rotateY: -12, rotateZ: 3 }
          : { x: "42%", y: "-6%", scale: 0.46, rotateY: 32, rotateZ: 10 },
        to: { x: "16%", y: "8%", scale: 0.6, rotateY: -12, rotateZ: 3 },
        delay: reduced ? 0 : 0.2,
        duration: reduced ? 0.01 : 1,
        z: 20,
      },
      {
        src: CENTRE_SRC,
        alt: "IslamQuest home screen — Learn Islam the fun and authentic way",
        layoutClassName: "left-1/2 top-1/2 w-[54%] -translate-x-1/2 -translate-y-1/2",
        from: reduced
          ? { x: "0%", y: "0%", scale: 1, rotateY: 0, rotateZ: 0 }
          : { x: "0%", y: "20%", scale: 0.78, rotateY: 0, rotateZ: 0, rotateX: 8 },
        to: { x: "0%", y: "0%", scale: 1, rotateY: 0, rotateZ: 0 },
        delay: reduced ? 0 : 0.42,
        duration: reduced ? 0.01 : 0.9,
        z: 30,
      },
    ];
  }

  return [
    {
      src: LEFT_SRC,
      alt: "IslamQuest Boss Level challenge screen",
      layoutClassName: "left-[6%] top-[18%] w-[32%] md:w-[30%]",
      from: reduced
        ? { x: "-34%", y: "6%", scale: 0.82, rotateY: 18, rotateZ: -4 }
        : { x: "-70%", y: "-10%", scale: 0.55, rotateY: -55, rotateZ: -16 },
      to: { x: "-34%", y: "6%", scale: 0.82, rotateY: 18, rotateZ: -4 },
      delay: 0,
      duration: reduced ? 0.01 : 1.15,
      z: 20,
    },
    {
      src: RIGHT_SRC,
      alt: "IslamQuest leaderboard screen",
      layoutClassName: "right-[6%] top-[18%] w-[32%] md:w-[30%]",
      from: reduced
        ? { x: "34%", y: "6%", scale: 0.82, rotateY: -18, rotateZ: 4 }
        : { x: "70%", y: "-10%", scale: 0.55, rotateY: 55, rotateZ: 16 },
      to: { x: "34%", y: "6%", scale: 0.82, rotateY: -18, rotateZ: 4 },
      delay: reduced ? 0 : 0.22,
      duration: reduced ? 0.01 : 1.15,
      z: 20,
    },
    {
      src: CENTRE_SRC,
      alt: "IslamQuest home screen — Learn Islam the fun and authentic way",
      layoutClassName: "left-1/2 top-1/2 w-[42%] -translate-x-1/2 -translate-y-1/2 md:w-[38%]",
      from: reduced
        ? { x: "0%", y: "0%", scale: 1, rotateY: 0, rotateZ: 0 }
        : { x: "0%", y: "30%", scale: 0.7, rotateY: 0, rotateZ: 0, rotateX: 12 },
      to: { x: "0%", y: "0%", scale: 1, rotateY: 0, rotateZ: 0 },
      delay: reduced ? 0 : 0.48,
      duration: reduced ? 0.01 : 1,
      z: 30,
    },
  ];
}

function PhoneChassis({
  accent,
  src,
  alt,
  priority,
}: {
  accent: AccentTheme;
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div
      className="relative aspect-[9/18.6] w-full overflow-hidden rounded-[1.9rem] p-[3.5px] shadow-[0_50px_100px_-30px_rgba(0,0,0,0.75)]"
      style={{
        background: `linear-gradient(155deg, ${accent.chassis[0]} 0%, ${accent.chassis[1]} 100%)`,
        boxShadow: `0 50px 100px -30px rgba(0,0,0,0.75), inset 0 0 0 1px ${accent.ring}`,
      }}
    >
      <div
        className="pointer-events-none absolute left-1/2 top-[9px] z-10 h-[6px] w-10 -translate-x-1/2 rounded-full bg-black/85"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-[1.5px] top-[24%] h-[10%] w-[2.5px] rounded-l-sm"
        style={{ background: accent.chassis[1] }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-[1.5px] top-[17%] h-[7%] w-[2.5px] rounded-r-sm"
        style={{ background: accent.chassis[1] }}
        aria-hidden="true"
      />
      <div className="relative h-full w-full overflow-hidden rounded-[1.65rem] bg-black">
        <Image src={src} alt={alt} fill sizes="360px" className="object-cover" priority={priority} />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(120deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.03) 16%, transparent 30%)",
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

function Phone({
  spec,
  accent,
  landed,
  reduced,
  containerRef,
}: {
  spec: PhoneSpec;
  accent: AccentTheme;
  landed: boolean;
  reduced: boolean;
  containerRef: React.RefObject<HTMLDivElement>;
}) {
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const idleTiltX = useTransform(pointerY, [-1, 1], [2.5, -2.5]);
  const idleTiltY = useTransform(pointerX, [-1, 1], [-3.5, 3.5]);
  const springTiltX = useSpring(idleTiltX, { stiffness: 90, damping: 20 });
  const springTiltY = useSpring(idleTiltY, { stiffness: 90, damping: 20 });

  return (
    <motion.div
      className={`absolute ${spec.layoutClassName}`}
      style={{ zIndex: spec.z }}
      initial={{
        opacity: 0,
        x: spec.from.x,
        y: spec.from.y,
        scale: spec.from.scale,
        rotateY: spec.from.rotateY,
        rotateZ: spec.from.rotateZ,
        rotateX: spec.from.rotateX ?? 0,
      }}
      animate={{
        opacity: 1,
        x: spec.to.x,
        y: spec.to.y,
        scale: spec.to.scale,
        rotateY: spec.to.rotateY,
        rotateZ: spec.to.rotateZ,
        rotateX: 0,
      }}
      transition={{ duration: spec.duration, delay: spec.delay, ease: ARRIVE_EASE }}
    >
      <motion.div
        style={{
          transformStyle: "preserve-3d",
          rotateX: landed && !reduced ? springTiltX : 0,
          rotateY: landed && !reduced ? springTiltY : 0,
        }}
        animate={landed && !reduced ? { y: [0, -7, 0] } : undefined}
        transition={
          landed && !reduced
            ? { duration: 6.5, repeat: Infinity, ease: "easeInOut" }
            : undefined
        }
        onMouseMove={(e) => {
          if (!landed || reduced) return;
          const el = containerRef.current;
          if (!el) return;
          const rect = el.getBoundingClientRect();
          pointerX.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
          pointerY.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
        }}
      >
        <PhoneChassis accent={accent} src={spec.src} alt={spec.alt} priority={spec.z === 30} />
      </motion.div>
    </motion.div>
  );
}

/**
 * The homepage/Work IslamQuest hero — exactly three premium phone devices
 * (centre = home screen, left = Boss Level, right = leaderboard) built from
 * the approved reference crops. Staggered curved-arrival entrance (left,
 * then right, then centre with a restrained overshoot), settling into a
 * calm idle float + pointer parallax. `prefers-reduced-motion` collapses
 * the entrance to an instant, already-assembled fade-in via MotionConfig
 * (see app/layout.tsx's `reducedMotion="user"`).
 */
export function IslamQuestPhones({ accent, className }: IslamQuestPhonesProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [landed, setLanded] = useState(false);
  const reduced = useReducedMotion();
  const compact = useMediaQuery("(max-width: 639px)");
  const phones = buildPhones(reduced, compact);

  return (
    <div
      ref={containerRef}
      className={`relative mx-auto aspect-[4/3.4] w-full max-w-[560px] sm:aspect-[5/4] md:aspect-[4/3.2] ${className ?? ""}`}
      style={{ perspective: "2200px" }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(50% 55% at 50% 45%, ${accent.glow}, transparent 72%)` }}
        aria-hidden="true"
      />
      {phones.map((spec) => (
        <Phone
          key={spec.alt}
          spec={spec}
          accent={accent}
          landed={landed}
          reduced={reduced}
          containerRef={containerRef}
        />
      ))}
      {/* Flip to idle state once the slowest (centre) phone has landed. */}
      <LandTimer onLand={() => setLanded(true)} delay={reduced ? 50 : 1550} />
    </div>
  );
}

function LandTimer({ onLand, delay }: { onLand: () => void; delay: number }) {
  const fired = useRef(false);
  if (!fired.current) {
    fired.current = true;
    if (typeof window !== "undefined") {
      window.setTimeout(onLand, delay);
    }
  }
  return null;
}
