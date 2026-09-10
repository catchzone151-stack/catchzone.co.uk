"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { ClientWorkProject } from "@/data/clientWork";
import { viewport as viewportToken } from "@/lib/motion/tokens";
import { Reveal } from "@/components/ui/Reveal";

/**
 * A premium laptop scene for real client work, built from the site owner's
 * own supplied screenshots (never a placeholder or fabricated screen). The
 * primary (homepage) capture already contains its own browser chrome, so it
 * is shown as-is inside the laptop screen rather than double-framed; the
 * secondary (supporting-page) capture gets a small decorative browser strip
 * since it's a scrolled/content-only crop. Entrance is one-time: the laptop
 * settles in, the secondary panel glides in slightly after, a light sweep
 * passes once — then everything is static but for a tiny pointer-tilt
 * response on desktop.
 */
export function ClientWorkCard({ project }: { project: ClientWorkProject }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const tiltX = useTransform(pointerY, [-1, 1], [2.5, -2.5]);
  const tiltY = useTransform(pointerX, [-1, 1], [-3.5, 3.5]);
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

  const sharpChassis = project.slug === "fde-fire-security";
  const screenRadius = sharpChassis ? "rounded-lg" : "rounded-xl";
  const deckRadius = sharpChassis ? "rounded-b-lg" : "rounded-b-xl";

  return (
    <Reveal className="grid gap-8 md:grid-cols-[0.85fr_1.15fr] md:items-center md:gap-10">
      <div>
        <h3 className="font-display text-2xl font-bold text-ink md:text-3xl">
          {project.name}
        </h3>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-muted">
          {project.summary}
        </p>

        {project.secondaryStatus && (
          <div className="mt-6 max-w-md rounded-xl border border-line bg-surface p-4">
            <p className="mono text-[10px] uppercase tracking-[0.2em] text-accent-iris">
              {project.secondaryStatus.label}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              {project.secondaryStatus.description}
            </p>
          </div>
        )}

        <a
          href={project.url}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-accent-cyan"
        >
          View project
          <span aria-hidden="true">→</span>
        </a>
      </div>

      <div
        ref={containerRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex items-center justify-center py-6"
        style={{ perspective: "2000px" }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(50% 60% at 50% 50%, ${project.accent.glow}, transparent 70%)`,
          }}
          aria-hidden="true"
        />

        <div className="relative w-full max-w-[600px]">
          {/* secondary companion screen — arrives just after the primary */}
          <motion.div
            className="absolute -left-[4%] top-[2%] z-0 w-[42%] overflow-hidden rounded-lg shadow-[0_30px_60px_-25px_rgba(0,0,0,0.65)] sm:-left-[6%] sm:top-[6%]"
            style={{ boxShadow: `0 30px 60px -25px rgba(0,0,0,0.65), inset 0 0 0 1px ${project.accent.ring}` }}
            initial={{ opacity: 0, x: 24, y: -16, rotate: 5, scale: 0.92 }}
            whileInView={{ opacity: 1, x: 0, y: 0, rotate: 3, scale: 1 }}
            viewport={viewportToken}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-1 bg-black/70 px-2 py-1.5" aria-hidden="true">
              <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/25" />
            </div>
            <div className="relative aspect-[16/9]">
              <Image
                src={project.secondaryImage}
                alt={`${project.name} — supporting page`}
                fill
                sizes="260px"
                className="object-cover object-top"
              />
            </div>
          </motion.div>

          {/* primary laptop */}
          <motion.div
            className="relative z-10 ml-[12%] w-[84%] sm:ml-[14%] sm:w-[82%]"
            style={{ rotateX: springTiltX, rotateY: springTiltY, transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, y: 30, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={viewportToken}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className={`relative overflow-hidden ${screenRadius} p-2`}
              style={{
                background: `linear-gradient(155deg, ${project.accent.chrome[0]} 0%, ${project.accent.chrome[1]} 100%)`,
                boxShadow: `inset 0 0 0 1px ${project.accent.ring}`,
              }}
            >
              <div className={`relative aspect-[16/9.6] w-full overflow-hidden ${sharpChassis ? "rounded-sm" : "rounded-md"} bg-black`}>
                <Image
                  src={project.primaryImage}
                  alt={`${project.name} homepage`}
                  fill
                  sizes="500px"
                  className="object-cover object-top"
                  priority={false}
                />
                {/* one-time light sweep */}
                <motion.div
                  className="pointer-events-none absolute inset-y-0 w-1/3"
                  style={{
                    background:
                      "linear-gradient(115deg, transparent 0%, rgba(255,255,255,0.16) 45%, transparent 100%)",
                  }}
                  initial={{ x: "-140%" }}
                  whileInView={{ x: "340%" }}
                  viewport={viewportToken}
                  transition={{ duration: 1.1, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* hinge */}
            <div
              className={`mx-auto ${sharpChassis ? "h-[4px]" : "h-[3px]"} w-[80%]`}
              style={{ background: project.accent.edge, opacity: sharpChassis ? 0.85 : 0.55 }}
              aria-hidden="true"
            />

            {/* keyboard deck */}
            <div
              className={`mx-auto h-4 w-[94%] ${deckRadius}`}
              style={{
                background: `linear-gradient(180deg, ${project.accent.chrome[1]} 0%, #050506 100%)`,
                clipPath: "polygon(3% 0%, 97% 0%, 100% 100%, 0% 100%)",
              }}
              aria-hidden="true"
            />
          </motion.div>
        </div>
      </div>
    </Reveal>
  );
}
