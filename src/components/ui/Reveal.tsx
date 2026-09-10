"use client";

import { motion } from "motion/react";
import { fadeUp, viewport as viewportToken } from "@/lib/motion/tokens";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li";
  style?: React.CSSProperties;
}

export function Reveal({ children, className, delay = 0, as = "div", style }: RevealProps) {
  const MotionTag = as === "li" ? motion.li : motion.div;
  return (
    <MotionTag
      className={className}
      style={style}
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={viewportToken}
      transition={{ delay }}
    >
      {children}
    </MotionTag>
  );
}
