"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { ClientWorkProject } from "@/data/clientWork";
import { viewport as viewportToken } from "@/lib/motion/tokens";
import { Reveal } from "@/components/ui/Reveal";

/**
 * A premium laptop/browser mockup for real client work. Shows the real
 * live-site screenshot once one is supplied (see docs/ASSET_MANIFEST.md);
 * until then it renders an honest browser-chrome frame with the real
 * hostname in the address bar rather than a fabricated screenshot.
 */
export function ClientWorkCard({ project }: { project: ClientWorkProject }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const tiltX = useTransform(pointerY, [-1, 1], [3, -3]);
  const tiltY = useTransform(pointerX, [-1, 1], [-4, 4]);
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

  const hostname = project.url.replace(/^https?:\/\//, "").replace(/\/$/, "");

  return (
    <Reveal className="grid gap-8 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-10">
      <div>
        <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">
          Client Work
        </p>
        <h3 className="mt-4 font-display text-2xl font-bold text-ink md:text-3xl">
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
        className="relative flex items-center justify-center"
        style={{ perspective: "1800px" }}
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(50% 60% at 50% 50%, ${project.accent.glow}, transparent 70%)`,
          }}
          aria-hidden="true"
        />
        <motion.div
          className="relative w-full max-w-[560px]"
          style={{ rotateX: springTiltX, rotateY: springTiltY, transformStyle: "preserve-3d" }}
          initial={{ opacity: 0, y: 32, scale: 0.94 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={viewportToken}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="relative overflow-hidden rounded-t-xl p-[2px] shadow-[0_50px_90px_-30px_rgba(0,0,0,0.7)]"
            style={{
              background: `linear-gradient(180deg, ${project.accent.chrome[0]} 0%, ${project.accent.chrome[1]} 100%)`,
            }}
          >
            <div
              className="rounded-t-[calc(0.75rem-2px)]"
              style={{ boxShadow: `inset 0 0 0 1px ${project.accent.ring}` }}
            >
              {/* browser chrome bar */}
              <div className="flex items-center gap-3 rounded-t-[calc(0.75rem-2px)] bg-black/40 px-4 py-3">
                <div className="flex gap-1.5" aria-hidden="true">
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                  <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
                </div>
                <div className="flex-1 truncate rounded-full bg-white/[0.06] px-3 py-1 text-center font-mono text-[11px] text-white/50">
                  {hostname}
                </div>
              </div>

              <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
                {project.screenshot ? (
                  <Image
                    src={project.screenshot}
                    alt={`${project.name} website`}
                    fill
                    sizes="560px"
                    className="object-cover object-top"
                  />
                ) : (
                  <div
                    className="flex h-full w-full flex-col items-center justify-center gap-3"
                    style={{
                      background: `linear-gradient(155deg, ${project.accent.chrome[0]} 0%, #050506 55%, ${project.accent.chrome[1]} 130%)`,
                    }}
                  >
                    <div
                      className="pointer-events-none absolute inset-0 opacity-[0.12]"
                      style={{
                        backgroundImage: `radial-gradient(${project.accent.ring} 1px, transparent 1px)`,
                        backgroundSize: "16px 16px",
                      }}
                      aria-hidden="true"
                    />
                    <p className="relative font-display text-lg font-bold text-white/85">
                      {project.name}
                    </p>
                    <p className="relative mono text-[10px] uppercase tracking-[0.2em] text-white/40">
                      Site preview pending
                    </p>
                  </div>
                )}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(115deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.02) 18%, transparent 32%)",
                  }}
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
          {/* laptop base */}
          <div
            className="mx-auto h-3 w-[92%] rounded-b-2xl"
            style={{ background: `linear-gradient(180deg, ${project.accent.chrome[1]} 0%, #050506 100%)` }}
            aria-hidden="true"
          />
        </motion.div>
      </div>
    </Reveal>
  );
}
