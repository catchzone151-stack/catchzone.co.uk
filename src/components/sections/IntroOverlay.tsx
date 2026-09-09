"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import type { IntroPhase } from "@/lib/intro/IntroContext";

const PHASE_COPY: Partial<Record<IntroPhase, string>> = {
  assembly: "IDEA → INTERFACE",
  connection: "INTERFACE → SYSTEM",
  transition: "SYSTEM → PRODUCT",
};

interface IntroOverlayProps {
  phase: IntroPhase;
  onSkip: () => void;
}

export function IntroOverlay({ phase, onSkip }: IntroOverlayProps) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (typeof document === "undefined") return null;

  const copy = PHASE_COPY[phase];

  return createPortal(
    <div
      className="fixed inset-0 z-intro flex flex-col items-center justify-center bg-void"
      role="presentation"
    >
      <div className="flex flex-col items-center gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: phase === "void" ? 0.5 : 1, scale: 1 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Image
            src="/assets/images/CatchZone/favicon.png"
            alt=""
            width={40}
            height={40}
            aria-hidden="true"
          />
        </motion.div>

        <div className="h-6">
          <AnimatePresence mode="wait">
            {copy && (
              <motion.p
                key={copy}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="mono text-xs uppercase tracking-[0.35em] text-ink-muted"
              >
                {copy}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <button
        type="button"
        onClick={onSkip}
        className="absolute bottom-8 right-8 rounded-full border border-ink/15 px-4 py-2 text-xs font-medium text-ink-muted transition-colors hover:border-ink/40 hover:text-ink md:bottom-10 md:right-10"
      >
        Skip Intro
      </button>

      <p className="visually-hidden" role="status">
        CatchZone intro sequence playing. Press Skip Intro to continue to the
        homepage immediately.
      </p>
    </div>,
    document.body,
  );
}
