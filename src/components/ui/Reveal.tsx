"use client";

import { motion } from "motion/react";
import { fadeUp, viewport as viewportToken } from "@/lib/motion/tokens";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "li";
}

export function Reveal({ children, className, delay = 0, as = "div" }: RevealProps) {
  const MotionTag = as === "li" ? motion.li : motion.div;
  return (
    <MotionTag
      className={className}
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
