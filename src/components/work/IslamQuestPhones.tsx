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

type Role = "centre" | "left" | "right";

interface PhoneSpec {
  role: Role;
  src: string;
  alt: string;
  layoutClassName: string;
  from: { x: string; y: string; scale: number; rotateY: number; rotateZ: number; rotateX?: number };
  to: { x: string; y: string; scale: number; rotateY: number; rotateZ: number; rotateX?: number };
  delay: number;
  duration: number;
  z: number;
}

/**
 * One tight, close-together triangular product cluster — never a wide
 * spread. `compact` (sub-640px) shrinks travel/rotation further so the
 * cluster reads clean on a narrow viewport without overflow.
 */
function buildPhones(reduced: boolean, compact: boolean): PhoneSpec[] {
  if (compact) {
    return [
      {
        role: "left",
        src: LEFT_SRC,
        alt: "IslamQuest Boss Level challenge screen",
        layoutClassName: "left-[30%] top-[52%] w-[34%] -translate-x-1/2 -translate-y-1/2",
        from: reduced
          ? { x: "0%", y: "0%", scale: 0.72, rotateY: -14, rotateZ: -4 }
          : { x: "-36%", y: "-10%", scale: 0.5, rotateY: -34, rotateZ: -10 },
        to: { x: "0%", y: "0%", scale: 0.72, rotateY: -14, rotateZ: -4 },
        delay: 0,
        duration: reduced ? 0.01 : 0.95,
        z: 20,
      },
      {
        role: "right",
        src: RIGHT_SRC,
        alt: "IslamQuest leaderboard screen",
        layoutClassName: "left-[79%] top-[40%] w-[32%] -translate-x-1/2 -translate-y-1/2",
        from: reduced
          ? { x: "0%", y: "0%", scale: 0.66, rotateY: 16, rotateZ: 4, rotateX: -4 }
          : { x: "36%", y: "-14%", scale: 0.46, rotateY: 38, rotateZ: 10, rotateX: -8 },
        to: { x: "0%", y: "0%", scale: 0.66, rotateY: 16, rotateZ: 4, rotateX: -4 },
        delay: reduced ? 0 : 0.18,
        duration: reduced ? 0.01 : 0.95,
        z: 15,
      },
      {
        role: "centre",
        src: CENTRE_SRC,
        alt: "IslamQuest home screen — Learn Islam the fun and authentic way",
        layoutClassName: "left-1/2 top-[28%] w-[48%] -translate-x-1/2 -translate-y-1/2",
        from: reduced
          ? { x: "0%", y: "0%", scale: 1, rotateY: 0, rotateZ: 0 }
          : { x: "0%", y: "18%", scale: 0.76, rotateY: 0, rotateZ: 0, rotateX: 10 },
        to: { x: "0%", y: "0%", scale: 1, rotateY: 0, rotateZ: 0 },
        delay: reduced ? 0 : 0.36,
        duration: reduced ? 0.01 : 0.85,
        z: 30,
      },
    ];
  }

  return [
    {
      role: "left",
      src: LEFT_SRC,
      alt: "IslamQuest Boss Level challenge screen",
      layoutClassName: "left-[26%] top-[56%] w-[32%] -translate-x-1/2 -translate-y-1/2 md:w-[30%]",
      from: reduced
        ? { x: "0%", y: "0%", scale: 0.86, rotateY: -20, rotateZ: -5 }
        : { x: "-58%", y: "-16%", scale: 0.52, rotateY: -52, rotateZ: -14 },
      to: { x: "0%", y: "0%", scale: 0.86, rotateY: -20, rotateZ: -5 },
      delay: 0,
      duration: reduced ? 0.01 : 1.05,
      z: 20,
    },
    {
      role: "right",
      src: RIGHT_SRC,
      alt: "IslamQuest leaderboard screen",
      layoutClassName: "left-[70%] top-[32%] w-[30%] -translate-x-1/2 -translate-y-1/2 md:w-[28%]",
      from: reduced
        ? { x: "0%", y: "0%", scale: 0.8, rotateY: 24, rotateZ: 5, rotateX: -6 }
        : { x: "58%", y: "-20%", scale: 0.46, rotateY: 54, rotateZ: 13, rotateX: -12 },
      to: { x: "0%", y: "0%", scale: 0.8, rotateY: 24, rotateZ: 5, rotateX: -6 },
      delay: reduced ? 0 : 0.2,
      duration: reduced ? 0.01 : 1.05,
      z: 15,
    },
    {
      role: "centre",
      src: CENTRE_SRC,
      alt: "IslamQuest home screen — Learn Islam the fun and authentic way",
      layoutClassName: "left-[46%] top-[44%] w-[40%] -translate-x-1/2 -translate-y-1/2 md:w-[37%]",
      from: reduced
        ? { x: "0%", y: "0%", scale: 1, rotateY: 0, rotateZ: 0 }
        : { x: "0%", y: "26%", scale: 0.7, rotateY: 0, rotateZ: 0, rotateX: 13 },
      to: { x: "0%", y: "0%", scale: 1, rotateY: 0, rotateZ: 0 },
      delay: reduced ? 0 : 0.44,
      duration: reduced ? 0.01 : 0.95,
      z: 30,
    },
  ];
}

/**
 * Premium phone hardware: an offset darker duplicate shape behind the main
 * body reads as a side rail/chassis edge once the phone is rotated in 3D
 * (thickness cue without a full extruded-geometry build); an inset rim
 * light on the same edge sells the glass/bezel/chassis separation; the
 * screen sits inset a couple of px inside the bezel rather than flush.
 */
function PhoneChassis({
  accent,
  src,
  alt,
  priority,
  role,
}: {
  accent: AccentTheme;
  src: string;
  alt: string;
  priority?: boolean;
  role: Role;
}) {
  const railSide = role === "left" ? "right" : role === "right" ? "left" : "right";
  const railOffset = railSide === "right" ? "translate(4px, 3px)" : "translate(-4px, 3px)";
  const rimShadow =
    railSide === "right"
      ? "inset 2px 0 0 0 rgba(255,255,255,0.16), inset -1px 0 0 0 rgba(0,0,0,0.5)"
      : "inset -2px 0 0 0 rgba(255,255,255,0.16), inset 1px 0 0 0 rgba(0,0,0,0.5)";
  const depthDim = role === "centre" ? 0 : role === "left" ? 0.06 : 0.14;

  return (
    <div className="relative">
      {/* side rail — offset darker duplicate, reveals chassis thickness */}
      <div
        className="absolute inset-0 rounded-[1.95rem]"
        style={{
          background: `linear-gradient(160deg, ${accent.chassis[0]} 0%, #030304 100%)`,
          filter: "brightness(0.5)",
          transform: railOffset,
        }}
        aria-hidden="true"
      />
      <div
        className="relative aspect-[9/18.4] w-full overflow-hidden rounded-[1.95rem] p-[5px] shadow-[0_55px_110px_-30px_rgba(0,0,0,0.8)]"
        style={{
          background: `linear-gradient(155deg, ${accent.chassis[0]} 0%, ${accent.chassis[1]} 100%)`,
          boxShadow: `0 55px 110px -30px rgba(0,0,0,0.8), inset 0 0 0 1px ${accent.ring}`,
        }}
      >
        {/* rim light — sells the glass/bezel/chassis edge separation */}
        <div
          className="pointer-events-none absolute inset-[5px] rounded-[1.7rem]"
          style={{ boxShadow: rimShadow }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute left-1/2 top-[9px] z-10 h-[6px] w-10 -translate-x-1/2 rounded-full bg-black/85"
          aria-hidden="true"
        />
        <div className="relative h-full w-full overflow-hidden rounded-[1.6rem] bg-black">
          <Image src={src} alt={alt} fill sizes="360px" className="object-cover" priority={priority} />
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "linear-gradient(120deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.03) 16%, transparent 32%)",
            }}
            aria-hidden="true"
          />
          {depthDim > 0 && (
            <div
              className="pointer-events-none absolute inset-0"
              style={{ background: `rgba(0,0,0,${depthDim})` }}
              aria-hidden="true"
            />
          )}
        </div>
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
  const idleTiltX = useTransform(pointerY, [-1, 1], [2, -2]);
  const idleTiltY = useTransform(pointerX, [-1, 1], [-2.5, 2.5]);
  const springTiltX = useSpring(idleTiltX, { stiffness: 90, damping: 20 });
  const springTiltY = useSpring(idleTiltY, { stiffness: 90, damping: 20 });
  const floatAmount = spec.role === "centre" ? -3 : -4.5;

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
        rotateX: spec.to.rotateX ?? 0,
      }}
      transition={{ duration: spec.duration, delay: spec.delay, ease: ARRIVE_EASE }}
    >
      <motion.div
        style={{
          transformStyle: "preserve-3d",
          rotateX: landed && !reduced ? springTiltX : 0,
          rotateY: landed && !reduced ? springTiltY : 0,
        }}
        animate={landed && !reduced ? { y: [0, floatAmount, 0] } : undefined}
        transition={
          landed && !reduced
            ? { duration: 7, repeat: Infinity, ease: "easeInOut", delay: spec.role === "left" ? 0.3 : spec.role === "right" ? 0.6 : 0 }
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
        <PhoneChassis accent={accent} src={spec.src} alt={spec.alt} priority={spec.role === "centre"} role={spec.role} />
      </motion.div>
    </motion.div>
  );
}

/**
 * The homepage/Work IslamQuest hero — a tight, close-together three-phone
 * product-shot cluster built from the approved reference crops (centre =
 * home screen, left = Boss Level, right = leaderboard). One coordinated
 * staggered curved-arrival entrance (left, then right, then centre with a
 * restrained overshoot), settling into a calm idle float + shallow pointer
 * parallax. `prefers-reduced-motion` collapses the entrance to the same
 * assembled cluster with a near-instant fade, no flying/orbiting.
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
      className={`relative mx-auto aspect-[4/4.4] w-full max-w-[520px] sm:aspect-[4/3.7] md:aspect-[4/3.5] ${className ?? ""}`}
      style={{ perspective: "2200px" }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ background: `radial-gradient(50% 55% at 50% 48%, ${accent.glow}, transparent 72%)` }}
        aria-hidden="true"
      />
      {/* shared grounding shadow — reads as one cluster resting on a surface */}
      <div
        className="pointer-events-none absolute bottom-[10%] left-1/2 h-[9%] w-[58%] -translate-x-1/2 rounded-[50%] blur-xl"
        style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.55), transparent 75%)" }}
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
      <LandTimer onLand={() => setLanded(true)} delay={reduced ? 50 : 1400} />
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
