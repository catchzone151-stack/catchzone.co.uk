"use client";

import { useRef } from "react";
import { motion, useMotionValue, useTransform } from "motion/react";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticLink } from "@/components/ui/MagneticLink";

const LINES = [
  { x1: "6%", y1: "10%", color: "#5eead4", delay: 0 },
  { x1: "94%", y1: "8%", color: "#6e62e5", delay: 0.5 },
  { x1: "4%", y1: "92%", color: "#6e62e5", delay: 1 },
  { x1: "96%", y1: "88%", color: "#5eead4", delay: 1.5 },
];

export function ProjectCTA() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0.5);
  const pointerY = useMotionValue(0.5);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = sectionRef.current?.getBoundingClientRect();
    if (!rect) return;
    pointerX.set((e.clientX - rect.left) / rect.width);
    pointerY.set((e.clientY - rect.top) / rect.height);
  }

  function handleMouseLeave() {
    pointerX.set(0.5);
    pointerY.set(0.5);
  }

  const glowBackground = useTransform([pointerX, pointerY], (latest) => {
    const [px, py] = latest as [number, number];
    return `radial-gradient(36% 46% at ${px * 100}% ${py * 100}%, rgba(94,234,212,0.16), transparent 65%), radial-gradient(60% 55% at 50% 100%, rgba(110,98,229,0.16), transparent 70%)`;
  });

  return (
    <section
      ref={sectionRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative isolate flex min-h-[70vh] items-center justify-center overflow-hidden border-t border-line bg-void py-24"
    >
      <motion.div
        className="pointer-events-none absolute inset-0"
        style={{ background: glowBackground }}
        aria-hidden="true"
      />

      <svg
        className="pointer-events-none absolute inset-0 hidden h-full w-full opacity-50 motion-safe:block"
        aria-hidden="true"
      >
        {LINES.map((line, i) => (
          <motion.line
            key={i}
            x1={line.x1}
            y1={line.y1}
            x2="50%"
            y2="50%"
            stroke={line.color}
            strokeWidth="1"
            strokeDasharray="2 9"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.6 }}
            viewport={{ once: true, margin: "-10%" }}
            animate={{ strokeDashoffset: [0, -22] }}
            transition={{
              opacity: { duration: 1, delay: line.delay },
              strokeDashoffset: { duration: 4.5, repeat: Infinity, ease: "linear", delay: line.delay },
            }}
          />
        ))}
      </svg>

      <Reveal className="relative z-10 mx-auto max-w-2xl text-center">
        <motion.span
          className="mx-auto mb-8 block h-2.5 w-2.5 rounded-full bg-accent-cyan"
          animate={{
            boxShadow: [
              "0 0 18px rgba(94,234,212,0.35)",
              "0 0 56px rgba(94,234,212,0.75)",
              "0 0 18px rgba(94,234,212,0.35)",
            ],
          }}
          transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          aria-hidden="true"
        />
        <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">
          Start a Build
        </p>
        <h2 className="mt-5 font-display text-3xl font-bold text-ink sm:text-4xl md:text-5xl">
          Bring us the problem. We&apos;ll help you build the product.
        </h2>
        <p className="mt-5 text-base leading-relaxed text-ink-muted md:text-lg">
          No technical specification required. Tell us what you&apos;re
          trying to build and we&apos;ll help shape it from there.
        </p>
        <div className="mt-9 flex justify-center">
          <MagneticLink
            href="/start-a-project"
            className="rounded-full bg-ink px-8 py-4 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
          >
            Start a Project
          </MagneticLink>
        </div>
      </Reveal>
    </section>
  );
}
