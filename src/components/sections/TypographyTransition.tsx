"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

/**
 * A pure typographic scene beat between two spatial sections — reserved for
 * transitions, not a slogan section. Text-only, decorative, so the visible
 * heading/description copy of neighbouring sections carries the real SEO
 * and accessibility weight.
 */
export function TypographyTransition({ word }: { word: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.82, 1, 1.12]);
  const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);
  const x = useTransform(scrollYProgress, [0, 1], ["-3%", "3%"]);

  return (
    <div
      ref={ref}
      className="relative overflow-hidden border-t border-line bg-void py-16 md:py-24"
      aria-hidden="true"
    >
      <motion.p
        style={{ scale, opacity, x }}
        className="select-none whitespace-nowrap text-center font-display font-bold leading-none text-ink/[0.09]"
      >
        <span className="text-[20vw] md:text-[15vw]">{word}</span>
      </motion.p>
    </div>
  );
}
