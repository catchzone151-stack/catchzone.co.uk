"use client";

import Image from "next/image";
import { useRef } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "motion/react";
import type { ShowcaseProject, ShowcaseSection } from "@/data/showcase";
import { viewport as viewportToken } from "@/lib/motion/tokens";

interface BlockProps {
  project: ShowcaseProject;
  section: ShowcaseSection;
}

function img(project: ShowcaseProject, i: number) {
  return project.images[i]!;
}

/** Very wide desktop dashboard crops become illegible if simply scaled down
 * to a phone's width — swipeable horizontal panning at a readable size is
 * the brief's explicit preference over shrinking until unreadable. */
const WIDE_ASPECT_THRESHOLD = 2.2;

/** A masked reveal wipe — clips from 0 to full width once, then stays open. */
function RevealFrame({
  className,
  ring,
  glow,
  children,
  delay = 0,
  scrollOnMobile = false,
}: {
  className?: string;
  ring: string;
  glow: string;
  children: React.ReactNode;
  delay?: number;
  scrollOnMobile?: boolean;
}) {
  return (
    <div className={`relative ${className ?? ""}`}>
      <div
        className="pointer-events-none absolute -inset-6 rounded-[2rem] opacity-70"
        style={{ background: `radial-gradient(60% 70% at 50% 40%, ${glow}, transparent 75%)` }}
        aria-hidden="true"
      />
      <motion.div
        className={`relative overflow-hidden rounded-2xl ${scrollOnMobile ? "overflow-x-auto md:overflow-x-hidden" : ""}`}
        style={{ boxShadow: `0 40px 90px -35px rgba(0,0,0,0.7), inset 0 0 0 1px ${ring}` }}
        initial={{ clipPath: "inset(0 100% 0 0)", opacity: 0.4 }}
        whileInView={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
        viewport={viewportToken}
        transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </div>
  );
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
        <p
          className="mono text-xs uppercase tracking-[0.25em]"
          style={{ color: accent }}
        >
          {eyebrow}
        </p>
      )}
      {heading && (
        <h2 className="mt-3 font-display text-2xl font-bold text-ink md:text-3xl">
          {heading}
        </h2>
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
  const isWide = image.width / image.height > WIDE_ASPECT_THRESHOLD;
  return (
    <div className="shell">
      <SectionCopy
        eyebrow={section.eyebrow}
        heading={section.heading}
        body={section.body}
        accent={project.accent.accent}
      />
      <RevealFrame
        className="mt-10"
        ring={project.accent.ring}
        glow={project.accent.glow}
        scrollOnMobile={isWide}
      >
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="(min-width: 1024px) 1100px, 100vw"
          className={isWide ? "h-auto w-[640px] max-w-none object-cover md:w-full" : "w-full object-cover"}
          priority={false}
        />
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(115deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.01) 20%, transparent 36%)",
          }}
          aria-hidden="true"
        />
      </RevealFrame>
      {isWide && (
        <p className="mono mt-2 text-[10px] uppercase tracking-wider text-ink-faint md:hidden">
          Swipe to see more →
        </p>
      )}
    </div>
  );
}

function WideBlock({ project, section }: BlockProps) {
  const image = img(project, section.images![0]!);
  const isWide = image.width / image.height > WIDE_ASPECT_THRESHOLD;
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
      <RevealFrame
        className="mx-auto mt-10 max-w-[1400px] px-4 md:px-8"
        ring={project.accent.ring}
        glow={project.accent.glow}
        scrollOnMobile={isWide}
      >
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          sizes="100vw"
          className={isWide ? "h-auto w-[640px] max-w-none object-cover md:w-full" : "w-full object-cover"}
        />
      </RevealFrame>
      {isWide && (
        <p className="shell mono mt-2 text-[10px] uppercase tracking-wider text-ink-faint md:hidden">
          Swipe to see more →
        </p>
      )}
    </div>
  );
}

function DuoBlock({ project, section }: BlockProps) {
  const primary = img(project, section.images![0]!);
  const secondary = img(project, section.images![1]!);
  const secondaryIsMobile = secondary.device === "mobile";

  return (
    <div className="shell">
      <SectionCopy
        eyebrow={section.eyebrow}
        heading={section.heading}
        body={section.body}
        accent={project.accent.accent}
      />
      <div className="relative mt-10">
        <RevealFrame ring={project.accent.ring} glow={project.accent.glow} className="mr-[10%] md:mr-[18%]">
          <Image
            src={primary.src}
            alt={primary.alt}
            width={primary.width}
            height={primary.height}
            sizes="(min-width: 1024px) 900px, 100vw"
            className="w-full object-cover"
          />
        </RevealFrame>

        <motion.div
          className={`absolute bottom-[-6%] right-0 z-10 ${secondaryIsMobile ? "w-[34%] max-w-[200px] sm:w-[26%]" : "w-[46%] max-w-[360px]"}`}
          initial={{ opacity: 0, x: 24, y: 20, scale: 0.92 }}
          whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
          viewport={viewportToken}
          transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {secondaryIsMobile ? (
            <div
              className="relative aspect-[9/17.5] w-full overflow-hidden rounded-[1.4rem] p-[3px] shadow-[0_30px_60px_-25px_rgba(0,0,0,0.7)]"
              style={{
                background: `linear-gradient(180deg, ${project.accent.primary} 0%, #0a0a0c 100%)`,
                boxShadow: `0 30px 60px -25px rgba(0,0,0,0.7), inset 0 0 0 1px ${project.accent.ring}`,
              }}
            >
              <div
                className="pointer-events-none absolute left-1/2 top-[6px] z-10 h-[4px] w-6 -translate-x-1/2 rounded-full bg-black/80"
                aria-hidden="true"
              />
              <div className="relative h-full w-full overflow-hidden rounded-[1.15rem] bg-black">
                <Image src={secondary.src} alt={secondary.alt} fill sizes="220px" className="object-cover" />
              </div>
            </div>
          ) : (
            <div
              className="relative overflow-hidden rounded-xl shadow-[0_30px_60px_-25px_rgba(0,0,0,0.7)]"
              style={{ boxShadow: `0 30px 60px -25px rgba(0,0,0,0.7), inset 0 0 0 1px ${project.accent.ring}` }}
            >
              <Image
                src={secondary.src}
                alt={secondary.alt}
                width={secondary.width}
                height={secondary.height}
                sizes="360px"
                className="w-full object-cover"
              />
            </div>
          )}
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
        <RevealFrame ring={project.accent.ring} glow={project.accent.glow}>
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes="(min-width: 768px) 560px, 100vw"
            className="w-full object-cover"
          />
        </RevealFrame>
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
  const isTablet = image.device === "tablet";
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

  return (
    <div className="shell">
      <div className="grid items-center gap-12 md:grid-cols-[0.9fr_1.1fr]">
        <SectionCopy
          eyebrow={section.eyebrow}
          heading={section.heading}
          body={section.body}
          accent={project.accent.accent}
        />
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative flex items-center justify-center py-4"
          style={{ perspective: "1800px" }}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-full"
            style={{ background: `radial-gradient(45% 55% at 50% 50%, ${project.accent.glow}, transparent 70%)` }}
            aria-hidden="true"
          />
          <motion.div
            className={`relative ${isTablet ? "w-[70%] max-w-[340px] aspect-[3/3.75]" : "w-[46%] max-w-[240px] aspect-[9/17.5]"}`}
            style={{ rotateX: springTiltX, rotateY: springTiltY, transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, y: 28, scale: 0.94 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={viewportToken}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className={`relative h-full w-full overflow-hidden ${isTablet ? "rounded-[1.1rem]" : "rounded-[1.6rem]"} p-[3px] shadow-[0_40px_80px_-30px_rgba(0,0,0,0.7)]`}
              style={{
                background: `linear-gradient(180deg, ${project.accent.primary} 0%, #0a0a0c 100%)`,
                boxShadow: `0 40px 80px -30px rgba(0,0,0,0.7), inset 0 0 0 1px ${project.accent.ring}`,
              }}
            >
              {!isTablet && (
                <div
                  className="pointer-events-none absolute left-1/2 top-[7px] z-10 h-[5px] w-8 -translate-x-1/2 rounded-full bg-black/80"
                  aria-hidden="true"
                />
              )}
              {isTablet && (
                <div
                  className="pointer-events-none absolute left-1/2 top-[10px] z-10 h-[6px] w-[6px] -translate-x-1/2 rounded-full bg-black/70"
                  aria-hidden="true"
                />
              )}
              <div className={`relative h-full w-full overflow-hidden ${isTablet ? "rounded-[0.85rem]" : "rounded-[1.35rem]"} bg-black`}>
                <Image src={image.src} alt={image.alt} fill sizes="340px" className="object-cover" />
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(115deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.02) 18%, transparent 32%)",
                  }}
                  aria-hidden="true"
                />
              </div>
            </div>
          </motion.div>
        </div>
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
