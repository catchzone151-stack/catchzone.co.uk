"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { viewport as viewportToken } from "@/lib/motion/tokens";

export type DeviceKind = "laptop" | "desktop" | "tablet" | "phone";

export interface DeviceAccent {
  chassis: [string, string];
  ring: string;
  glow: string;
}

interface DeviceFrameProps {
  kind: DeviceKind;
  src: string;
  alt: string;
  accent: DeviceAccent;
  className?: string;
  /** Card-thumbnail mode: lighter entrance, CSS-only hover (no JS pointer tracking). */
  compact?: boolean;
  sizes?: string;
  priority?: boolean;
}

const SCREEN_ASPECT: Record<DeviceKind, string> = {
  laptop: "aspect-[16/10]",
  desktop: "aspect-[16/9.5]",
  tablet: "aspect-[3/4]",
  phone: "aspect-[9/18.5]",
};

/**
 * One shared device-hardware presentation used across the Work landing
 * thumbnails and every showcase detail page. Real bezel/screen-recess/edge
 * highlight/shadow treatment per device kind — never a flat screenshot
 * rectangle, never a literal stock-mockup or third-party brand clone.
 */
export function DeviceFrame({
  kind,
  src,
  alt,
  accent,
  className,
  compact = false,
  sizes,
  priority = false,
}: DeviceFrameProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const tiltX = useTransform(pointerY, [-1, 1], [3, -3]);
  const tiltY = useTransform(pointerX, [-1, 1], [-4, 4]);
  const springTiltX = useSpring(tiltX, { stiffness: 130, damping: 20 });
  const springTiltY = useSpring(tiltY, { stiffness: 130, damping: 20 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (compact) return;
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

  const bezelPad = kind === "phone" ? "p-[3px]" : kind === "tablet" ? "p-[7px]" : "p-2.5";
  const screenRadius =
    kind === "phone" ? "rounded-[1.5rem]" : kind === "tablet" ? "rounded-[0.8rem]" : "rounded-md";
  const chassisRadius =
    kind === "phone" ? "rounded-[1.75rem]" : kind === "tablet" ? "rounded-[1.05rem]" : "rounded-xl";

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`group/device relative flex items-center justify-center ${className ?? ""}`}
      style={{ perspective: compact ? undefined : "1800px" }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-full opacity-80"
        style={{ background: `radial-gradient(55% 65% at 50% 45%, ${accent.glow}, transparent 72%)` }}
        aria-hidden="true"
      />

      <motion.div
        className={`relative w-full ${kind === "phone" || kind === "tablet" ? "mx-auto max-w-[70%]" : ""}`}
        style={
          compact
            ? undefined
            : { rotateX: springTiltX, rotateY: springTiltY, transformStyle: "preserve-3d" }
        }
        initial={{ opacity: 0, y: 24, scale: 0.94 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={viewportToken}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* device body */}
        <div
          className={`relative ${bezelPad} ${chassisRadius} ${kind === "laptop" ? "rounded-b-none" : ""} shadow-[0_45px_90px_-30px_rgba(0,0,0,0.7)] transition-transform duration-500 group-hover/device:-translate-y-1`}
          style={{
            background: `linear-gradient(155deg, ${accent.chassis[0]} 0%, ${accent.chassis[1]} 100%)`,
            boxShadow: `0 45px 90px -30px rgba(0,0,0,0.7), inset 0 0 0 1px ${accent.ring}`,
          }}
        >
          {kind === "phone" && (
            <div
              className="pointer-events-none absolute left-1/2 top-[7px] z-10 h-[5px] w-8 -translate-x-1/2 rounded-full bg-black/80"
              aria-hidden="true"
            />
          )}
          {kind === "tablet" && (
            <div
              className="pointer-events-none absolute left-1/2 top-[9px] z-10 h-[5px] w-[5px] -translate-x-1/2 rounded-full bg-black/60"
              aria-hidden="true"
            />
          )}
          {kind === "desktop" && (
            <div
              className="pointer-events-none absolute left-1/2 top-[6px] z-10 h-[4px] w-[4px] -translate-x-1/2 rounded-full bg-black/50"
              aria-hidden="true"
            />
          )}

          <div className={`relative w-full overflow-hidden ${SCREEN_ASPECT[kind]} ${screenRadius} bg-black`}>
            <Image
              src={src}
              alt={alt}
              fill
              sizes={sizes ?? "(min-width: 1024px) 600px, 100vw"}
              className="object-cover object-top"
              priority={priority}
            />
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background:
                  "linear-gradient(115deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 18%, transparent 34%)",
              }}
              aria-hidden="true"
            />
          </div>
        </div>

        {/* laptop-only: hinge + keyboard deck */}
        {kind === "laptop" && (
          <>
            <div
              className="mx-auto h-[3px] w-[88%] opacity-50"
              style={{ background: accent.ring }}
              aria-hidden="true"
            />
            <div
              className="mx-auto h-4 w-[96%] rounded-b-lg"
              style={{
                background: `linear-gradient(180deg, ${accent.chassis[1]} 0%, #050506 100%)`,
                clipPath: "polygon(2% 0%, 98% 0%, 100% 100%, 0% 100%)",
              }}
              aria-hidden="true"
            />
          </>
        )}

        {/* desktop-only: monitor stand */}
        {kind === "desktop" && (
          <div className="mx-auto flex flex-col items-center" aria-hidden="true">
            <div
              className="h-6 w-2 opacity-90"
              style={{ background: `linear-gradient(180deg, ${accent.chassis[0]}, ${accent.chassis[1]})` }}
            />
            <div
              className="h-1.5 w-24 rounded-full opacity-80"
              style={{ background: accent.chassis[1] }}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
}
