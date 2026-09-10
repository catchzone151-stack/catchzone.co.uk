"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { viewport as viewportToken } from "@/lib/motion/tokens";

interface BannerShowcaseProps {
  src: string;
  alt: string;
  className?: string;
}

/**
 * A premium single-asset presentation for products whose only usable
 * visual is one pre-composed marketing banner (rather than discrete
 * screenshots that fit the multi-device ScreenCascade). Adds depth via
 * pointer tilt and a soft settle-in entrance instead of a flat static
 * image, so it doesn't read as a placeholder rectangle.
 */
export function BannerShowcase({ src, alt, className }: BannerShowcaseProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const tiltX = useTransform(pointerY, [-1, 1], [4, -4]);
  const tiltY = useTransform(pointerX, [-1, 1], [-5, 5]);
  const springTiltX = useSpring(tiltX, { stiffness: 120, damping: 18 });
  const springTiltY = useSpring(tiltY, { stiffness: 120, damping: 18 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
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
      style={{ perspective: "1600px" }}
    >
      <motion.div
        className="relative w-full overflow-hidden rounded-[1.6rem] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)] motion-safe:[animation:screen-float_8s_ease-in-out_infinite]"
        style={{ rotateX: springTiltX, rotateY: springTiltY, transformStyle: "preserve-3d" }}
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={viewportToken}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image src={src} alt={alt} width={1600} height={900} className="w-full object-cover" priority={false} />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 20%, transparent 36%)",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 rounded-[1.6rem] ring-1 ring-inset ring-white/10"
          aria-hidden="true"
        />
      </motion.div>
    </div>
  );
}
