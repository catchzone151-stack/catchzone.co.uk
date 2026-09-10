"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import { viewport as viewportToken } from "@/lib/motion/tokens";

interface ScreenCascadeProps {
  images: string[];
  alt: string;
  className?: string;
}

const TRAJECTORIES = [
  { from: { x: -220, y: 120, rotateZ: -18, rotateY: 26 }, settle: { x: -172, y: 58, rotateZ: -9, rotateY: 13 } },
  { from: { x: 0, y: -90, rotateZ: 0, rotateY: 0 }, settle: { x: 0, y: -6, rotateZ: 0, rotateY: 0 } },
  { from: { x: 230, y: 150, rotateZ: 17, rotateY: -24 }, settle: { x: 178, y: -50, rotateZ: 9, rotateY: -12 } },
  { from: { x: -80, y: -170, rotateZ: 7, rotateY: -9 }, settle: { x: 62, y: 122, rotateZ: 5, rotateY: 7 } },
  { from: { x: 90, y: -190, rotateZ: -8, rotateY: 14 }, settle: { x: -70, y: -128, rotateZ: -5, rotateY: 9 } },
];

const DEPTH = [0, 60, 24, 40, 12];
const SCALE = [0.86, 1, 0.82, 0.7, 0.62];
const OPACITY = [0.72, 1, 0.74, 0.55, 0.42];

function Card({
  src,
  alt,
  index,
  pointerX,
  pointerY,
}: {
  src: string;
  alt: string;
  index: number;
  pointerX: ReturnType<typeof useMotionValue<number>>;
  pointerY: ReturnType<typeof useMotionValue<number>>;
}) {
  const t = TRAJECTORIES[index % TRAJECTORIES.length]!;
  const depth = DEPTH[index % DEPTH.length]!;
  const scale = SCALE[index % SCALE.length]!;
  const opacity = OPACITY[index % OPACITY.length]!;

  const tiltX = useTransform(pointerY, [-1, 1], [3, -3]);
  const tiltY = useTransform(pointerX, [-1, 1], [-4, 4]);
  const springTiltX = useSpring(tiltX, { stiffness: 120, damping: 18 });
  const springTiltY = useSpring(tiltY, { stiffness: 120, damping: 18 });

  return (
    <motion.div
      className="absolute aspect-[9/17.5] w-[38%] sm:w-[36%] md:w-[34%]"
      style={{ zIndex: 10 + depth, transformStyle: "preserve-3d" }}
      initial={{
        opacity: 0,
        x: t.from.x,
        y: t.from.y,
        rotateZ: t.from.rotateZ,
        rotateY: t.from.rotateY,
        scale: scale * 0.85,
      }}
      whileInView={{
        opacity,
        x: t.settle.x,
        y: t.settle.y,
        rotateZ: t.settle.rotateZ,
        rotateY: t.settle.rotateY,
        scale,
      }}
      viewport={viewportToken}
      transition={{
        duration: 1.1,
        delay: index * 0.14,
        ease: [0.16, 1, 0.3, 1],
      }}
    >
      <motion.div
        className={`relative h-full w-full overflow-hidden rounded-[1.4rem] border border-white/10 shadow-[0_40px_70px_-25px_rgba(0,0,0,0.65)] motion-safe:[animation:screen-float_7s_ease-in-out_infinite]`}
        style={{
          rotateX: springTiltX,
          rotateY: springTiltY,
          animationDelay: `${index * 0.6}s`,
        }}
      >
        <Image src={src} alt={alt} fill sizes="320px" className="object-cover" />
        {/* glass reflection sweep */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.02) 18%, transparent 32%)",
          }}
          aria-hidden="true"
        />
        {/* subtle metal edge highlight */}
        <div
          className="pointer-events-none absolute inset-0 rounded-[1.4rem] ring-1 ring-inset ring-white/10"
          aria-hidden="true"
        />
      </motion.div>
    </motion.div>
  );
}

export function ScreenCascade({ images, alt, className }: ScreenCascadeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

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
      style={{ perspective: "1800px" }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-full opacity-70"
        style={{
          background:
            "radial-gradient(45% 55% at 50% 50%, rgba(94,234,212,0.10), transparent 70%)",
        }}
        aria-hidden="true"
      />
      {images.map((src, i) => (
        <Card key={src} src={src} alt={`${alt} screen ${i + 1}`} index={i} pointerX={pointerX} pointerY={pointerY} />
      ))}
    </div>
  );
}
