"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { AccentTheme, BrandGlyph } from "@/data/projects";
import { viewport as viewportToken } from "@/lib/motion/tokens";

interface BrandDeviceArtProps {
  title: string;
  statusLabel: string;
  accent: AccentTheme;
  glyph: BrandGlyph;
  /** "hero" = full project-page presentation with pointer tilt + idle float.
   * "card" = compact static thumbnail for a grid card. */
  variant?: "hero" | "card";
  className?: string;
}

function Glyph({ id, stroke }: { id: BrandGlyph; stroke: string }) {
  if (id === "in-progress") {
    return (
      <svg viewBox="0 0 64 64" className="h-[46%] w-[46%]" fill="none" aria-hidden="true">
        <circle cx="14" cy="16" r="5" stroke={stroke} strokeWidth="2.5" />
        <circle cx="50" cy="16" r="5" stroke={stroke} strokeWidth="2.5" />
        <circle cx="32" cy="48" r="5" stroke={stroke} strokeWidth="2.5" fill={stroke} />
        <path
          d="M18 18 L46 18 M16 20 L30 44 M48 20 L34 44"
          stroke={stroke}
          strokeWidth="2"
          strokeDasharray="4 4"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (id === "cycle") {
    return (
      <svg viewBox="0 0 64 64" className="h-[46%] w-[46%]" fill="none" aria-hidden="true">
        <circle cx="16" cy="44" r="12" stroke={stroke} strokeWidth="2.5" />
        <circle cx="48" cy="44" r="12" stroke={stroke} strokeWidth="2.5" />
        <path
          d="M16 44 L28 20 L40 20 M28 20 L48 44 M28 20 L20 32"
          stroke={stroke}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="28" cy="20" r="2.4" fill={stroke} />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className="h-[46%] w-[46%]" fill="none" aria-hidden="true">
      <path
        d="M32 6 L54 14 V30 C54 44 44 54 32 58 C20 54 10 44 10 30 V14 Z"
        stroke={stroke}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <path
        d="M23 31 L29 38 L42 24"
        stroke={stroke}
        strokeWidth="2.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * An honest, dimensional brand-device composition for live products that
 * have no locally available screenshots and none fetchable from the Play
 * Store in this environment (see docs/ASSET_MANIFEST.md). It is deliberately
 * abstract — a chassis, brand-accent gradient, monogram glyph and structural
 * interface bars — and is never presented or labelled as a real screenshot.
 */
export function BrandDeviceArt({
  title,
  statusLabel,
  accent,
  glyph,
  variant = "hero",
  className,
}: BrandDeviceArtProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const tiltX = useTransform(pointerY, [-1, 1], [4, -4]);
  const tiltY = useTransform(pointerX, [-1, 1], [-5, 5]);
  const springTiltX = useSpring(tiltX, { stiffness: 120, damping: 18 });
  const springTiltY = useSpring(tiltY, { stiffness: 120, damping: 18 });

  const isHero = variant === "hero";

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!isHero) return;
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    pointerX.set(((e.clientX - rect.left) / rect.width) * 2 - 1);
    pointerY.set(((e.clientY - rect.top) / rect.height) * 2 - 1);
  }

  function handleMouseLeave() {
    pointerX.set(0);
    pointerY.set(0);
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`relative flex items-center justify-center ${className ?? ""}`}
      style={{ perspective: isHero ? "1800px" : undefined }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(45% 55% at 50% 50%, ${accent.glow}, transparent 70%)`,
        }}
        aria-hidden="true"
      />
      <motion.div
        className={`relative aspect-[9/17.5] ${isHero ? "w-[62%] max-w-[300px] sm:w-[46%] md:w-[38%]" : "h-[82%]"}`}
        style={isHero ? { transformStyle: "preserve-3d" } : undefined}
        initial={{ opacity: 0, y: 28, scale: 0.94 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={viewportToken}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <motion.div
          className="relative h-full w-full rounded-[1.7rem] p-[3px] shadow-[0_40px_70px_-25px_rgba(0,0,0,0.65)]"
          style={{
            background: `linear-gradient(180deg, ${accent.chassis[0]} 0%, ${accent.chassis[1]} 100%)`,
            rotateX: isHero ? springTiltX : undefined,
            rotateY: isHero ? springTiltY : undefined,
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-[1.7rem]"
            style={{ boxShadow: `inset 0 0 0 1px ${accent.ring}` }}
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute left-1/2 top-[7px] z-10 h-[5px] w-8 -translate-x-1/2 rounded-full bg-black/80"
            aria-hidden="true"
          />

          <div
            className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-[1.45rem]"
            style={{
              background: `linear-gradient(155deg, ${accent.chassis[0]} 0%, #050506 60%, ${accent.chassis[1]} 130%)`,
            }}
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.14]"
              style={{
                backgroundImage: `radial-gradient(${accent.ring} 1px, transparent 1px)`,
                backgroundSize: "14px 14px",
              }}
              aria-hidden="true"
            />

            <div
              className="relative flex h-[46%] w-[46%] items-center justify-center rounded-full"
              style={{ boxShadow: `0 0 0 1px ${accent.ring}, 0 0 32px ${accent.glow}` }}
            >
              <Glyph id={glyph} stroke={accent.icon} />
            </div>

            <p className="relative mt-6 max-w-[80%] text-center font-display text-sm font-bold leading-tight tracking-tight text-white/90">
              {title}
            </p>

            <div className="relative mt-4 flex w-[70%] flex-col gap-1.5">
              <div className="h-1 w-full rounded-full bg-white/10" />
              <div className="h-1 w-[70%] rounded-full bg-white/10" />
              <div className="h-1 w-[85%] rounded-full bg-white/10" />
            </div>

            <p className="relative mt-6 mono text-[9px] uppercase tracking-[0.2em] text-white/50">
              {statusLabel}
            </p>

            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(115deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 18%, transparent 32%)",
              }}
              aria-hidden="true"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
