"use client";

import { motion } from "motion/react";
import type { ShowcaseProject, ShowcaseSection } from "@/data/showcase";
import type { DeviceKind } from "@/components/showcase/DeviceFrame";
import { DeviceFrame } from "@/components/showcase/DeviceFrame";
import { viewport as viewportToken } from "@/lib/motion/tokens";

interface BlockProps {
  project: ShowcaseProject;
  section: ShowcaseSection;
}

function img(project: ShowcaseProject, i: number) {
  return project.images[i]!;
}

function deviceAccent(project: ShowcaseProject) {
  return {
    chassis: [project.accent.primary, "#050506"] as [string, string],
    ring: project.accent.ring,
    glow: project.accent.glow,
  };
}

/** Infers a sensible companion-device kind for a duo section's secondary image. */
function inferSecondaryKind(deviceHint: ShowcaseProject["images"][number]["device"]): DeviceKind {
  if (deviceHint === "mobile") return "phone";
  if (deviceHint === "tablet") return "tablet";
  return "tablet";
}

function SectionCopy({
  eyebrow,
  heading,
  body,
  accent,
  align = "left",
}: {
  eyebrow?: string;
  heading?: string;
  body?: string;
  accent: string;
  align?: "left" | "center";
}) {
  if (!eyebrow && !heading && !body) return null;
  return (
    <div className={align === "center" ? "text-center" : ""}>
      {eyebrow && (
        <p className="mono text-xs uppercase tracking-[0.25em]" style={{ color: accent }}>
          {eyebrow}
        </p>
      )}
      {heading && (
        <h2 className="mt-3 font-display text-2xl font-bold text-ink md:text-3xl">{heading}</h2>
      )}
      {body && (
        <p
          className={`mt-4 text-sm leading-relaxed text-ink-muted md:text-base ${align === "center" ? "mx-auto max-w-xl" : "max-w-lg"}`}
        >
          {body}
        </p>
      )}
    </div>
  );
}

function HeroBlock({ project, section }: BlockProps) {
  const image = img(project, section.images![0]!);
  return (
    <div className="shell">
      <SectionCopy
        eyebrow={section.eyebrow}
        heading={section.heading}
        body={section.body}
        accent={project.accent.accent}
      />
      <DeviceFrame
        kind={section.frame ?? "laptop"}
        src={image.src}
        alt={image.alt}
        accent={deviceAccent(project)}
        className="mx-auto mt-12 max-w-[820px]"
        sizes="(min-width: 1024px) 820px, 100vw"
        priority
      />
    </div>
  );
}

function WideBlock({ project, section }: BlockProps) {
  const image = img(project, section.images![0]!);
  return (
    <div>
      <div className="shell">
        <SectionCopy
          eyebrow={section.eyebrow}
          heading={section.heading}
          body={section.body}
          accent={project.accent.accent}
        />
      </div>
      <DeviceFrame
        kind={section.frame ?? "desktop"}
        src={image.src}
        alt={image.alt}
        accent={deviceAccent(project)}
        className="mx-auto mt-12 max-w-[960px] px-4 md:px-8"
        sizes="(min-width: 1024px) 900px, 100vw"
      />
    </div>
  );
}

function DuoBlock({ project, section }: BlockProps) {
  const primary = img(project, section.images![0]!);
  const secondary = img(project, section.images![1]!);
  const secondaryKind = inferSecondaryKind(secondary.device);
  const accent = deviceAccent(project);

  return (
    <div className="shell">
      <SectionCopy
        eyebrow={section.eyebrow}
        heading={section.heading}
        body={section.body}
        accent={project.accent.accent}
      />
      <div className="relative mt-12">
        <DeviceFrame
          kind={section.frame ?? "laptop"}
          src={primary.src}
          alt={primary.alt}
          accent={accent}
          className="mr-[8%] max-w-[720px] md:mr-[16%]"
          sizes="(min-width: 1024px) 700px, 100vw"
        />
        <motion.div
          className={`absolute bottom-[-4%] right-0 z-10 ${secondaryKind === "phone" ? "w-[30%] max-w-[170px]" : "w-[36%] max-w-[220px]"}`}
          initial={{ opacity: 0, x: 20, y: 16, scale: 0.92 }}
          whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          viewport={viewportToken}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <DeviceFrame
            kind={secondaryKind}
            src={secondary.src}
            alt={secondary.alt}
            accent={accent}
            compact
            sizes="240px"
          />
        </motion.div>
      </div>
    </div>
  );
}

function SplitBlock({ project, section }: BlockProps) {
  const image = img(project, section.images![0]!);
  const imageFirst = section.imageSide !== "left";
  return (
    <div className="shell">
      <div
        className={`grid items-center gap-10 md:grid-cols-2 md:gap-14 ${imageFirst ? "" : "md:[&>*:first-child]:order-2"}`}
      >
        <DeviceFrame
          kind={section.frame ?? "tablet"}
          src={image.src}
          alt={image.alt}
          accent={deviceAccent(project)}
          sizes="(min-width: 768px) 500px, 100vw"
        />
        <SectionCopy
          eyebrow={section.eyebrow}
          heading={section.heading}
          body={section.body}
          accent={project.accent.accent}
        />
      </div>
    </div>
  );
}

function DeviceBlock({ project, section }: BlockProps) {
  const image = img(project, section.images![0]!);
  const kind: DeviceKind = image.device === "tablet" ? "tablet" : "phone";
  return (
    <div className="shell">
      <div className="grid items-center gap-12 md:grid-cols-[0.9fr_1.1fr]">
        <SectionCopy
          eyebrow={section.eyebrow}
          heading={section.heading}
          body={section.body}
          accent={project.accent.accent}
        />
        <DeviceFrame
          kind={kind}
          src={image.src}
          alt={image.alt}
          accent={deviceAccent(project)}
          className="py-4"
          sizes="340px"
        />
      </div>
    </div>
  );
}

function ClosingBlock({ project, section }: BlockProps) {
  return (
    <div className="shell text-center">
      <div
        className="pointer-events-none absolute inset-x-0 -top-10 mx-auto h-40 max-w-2xl rounded-full opacity-60"
        style={{ background: `radial-gradient(50% 100% at 50% 50%, ${project.accent.glow}, transparent 75%)` }}
        aria-hidden="true"
      />
      <motion.p
        className="relative font-display text-xl font-bold text-ink md:text-2xl"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={viewportToken}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {section.heading}
      </motion.p>
    </div>
  );
}

export function ShowcaseSectionBlock({ project, section }: BlockProps) {
  switch (section.variant) {
    case "hero":
      return <HeroBlock project={project} section={section} />;
    case "wide":
      return <WideBlock project={project} section={section} />;
    case "duo":
      return <DuoBlock project={project} section={section} />;
    case "split":
      return <SplitBlock project={project} section={section} />;
    case "device":
      return <DeviceBlock project={project} section={section} />;
    case "closing":
      return <ClosingBlock project={project} section={section} />;
    default:
      return null;
  }
}
