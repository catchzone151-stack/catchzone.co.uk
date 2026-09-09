"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "motion/react";
import type { Project } from "@/data/projects";
import { Reveal } from "@/components/ui/Reveal";
import { viewport as viewportToken } from "@/lib/motion/tokens";

function ScreenStack({ project }: { project: Project }) {
  const shots = project.screenshots ?? [];
  const stack = [shots[0], shots[2], shots[4]].filter(Boolean) as string[];

  if (stack.length < 2 && project.heroAsset) {
    return (
      <div className="relative overflow-hidden rounded-2xl border border-line">
        <Image
          src={project.heroAsset}
          alt={`${project.title} banner`}
          width={900}
          height={600}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  const layout = [
    { x: -130, y: 55, z: 0, rot: -8, scale: 0.86, opacity: 0.55 },
    { x: 0, y: 0, z: 60, rot: 0, scale: 1, opacity: 1 },
    { x: 130, y: -45, z: 24, rot: 8, scale: 0.82, opacity: 0.6 },
  ];

  return (
    <div
      className="relative flex h-full min-h-[480px] items-center justify-center"
      style={{ perspective: "1400px" }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-full opacity-60"
        style={{
          background:
            "radial-gradient(45% 55% at 50% 50%, rgba(94,234,212,0.10), transparent 70%)",
        }}
        aria-hidden="true"
      />
      {stack.map((src, idx) => {
        const l = layout[idx] ?? layout[1]!;
        return (
          <motion.div
            key={src}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{
              opacity: l.opacity,
              x: l.x,
              y: l.y,
              rotate: l.rot,
              scale: l.scale,
            }}
            viewport={viewportToken}
            transition={{ duration: 0.8, delay: idx * 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="absolute aspect-[9/16] w-[46%] overflow-hidden rounded-[1.6rem] border border-line shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]"
            style={{ zIndex: 10 + l.z, transformStyle: "preserve-3d" }}
          >
            <Image
              src={src}
              alt={`${project.title} screen`}
              fill
              className="object-cover"
            />
          </motion.div>
        );
      })}
    </div>
  );
}

export function FeaturedProjectCard({ project }: { project: Project }) {
  return (
    <Reveal className="grid gap-10 overflow-hidden rounded-3xl border border-line bg-surface-raised p-8 md:grid-cols-2 md:p-12">
      <div className="flex flex-col justify-center">
        <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">
          Featured Build
        </p>
        <h3 className="mt-4 font-display text-3xl font-bold text-ink md:text-4xl">
          {project.title}
        </h3>
        <p className="mt-4 text-sm font-medium text-ink-muted">
          {project.statusLabel}
        </p>
        <p className="mt-5 max-w-md text-base leading-relaxed text-ink-muted">
          {project.shortDescription}
        </p>

        <ul className="mt-6 flex flex-wrap gap-2">
          {project.capabilities.slice(0, 4).map((cap) => (
            <li
              key={cap}
              className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-muted"
            >
              {cap}
            </li>
          ))}
        </ul>

        <div className="mt-8 flex flex-wrap items-center gap-5">
          <Link
            href={`/work/${project.slug}`}
            className="rounded-full bg-ink px-6 py-3 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
          >
            View Case Study
          </Link>
          {project.playStoreUrl && (
            <a
              href={project.playStoreUrl}
              target="_blank"
              rel="noreferrer"
              className="text-sm font-semibold text-ink transition-colors hover:text-accent-cyan"
            >
              Open on Google Play →
            </a>
          )}
        </div>
      </div>

      <ScreenStack project={project} />
    </Reveal>
  );
}
