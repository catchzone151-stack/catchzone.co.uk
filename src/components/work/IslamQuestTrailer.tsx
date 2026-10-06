"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  useInView,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { ISLAMQUEST_SCREENS } from "@/data/islamquestShowcase";
import { ARRIVAL_SHARE, captionAt } from "@/lib/three/iqTrailerTimeline";
import { usePerformanceTier } from "@/lib/performance/usePerformanceTier";
import { useDocumentVisible } from "@/hooks/useDocumentVisible";
import { IslamQuestDevice } from "@/components/work/IslamQuestShowcase";

const TrailerCanvas = dynamic(() => import("@/components/canvas/IslamQuestTrailerCanvas"), { ssr: false });

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * IslamQuest Featured Build trailer (homepage + /work). The page keeps
 * scrolling: the copy moves past normally while the stage rides a short
 * runway with a gentle drift, scrubbing the "impossible phone space"
 * sequence — one phone opens into an app space larger than itself and
 * resolves back into one finished device.
 */
export function IslamQuestTrailer({ copy }: { copy: React.ReactNode }) {
  const runway = useRef<HTMLDivElement>(null);
  const tier = usePerformanceTier();
  const documentVisible = useDocumentVisible();
  const inView = useInView(runway, { margin: "200px 0px 200px 0px" });
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Beat A (the fly-in) plays while the section scrolls into view; the rest
  // of the trailer scrubs while the stage rides its runway.
  const { scrollYProgress: arrive } = useScroll({ target: runway, offset: ["start end", "start start"] });
  const { scrollYProgress: ride } = useScroll({ target: runway, offset: ["start start", "end end"] });
  const timeline = useTransform([arrive, ride] as MotionValue<number>[], ([a = 0, r = 0]: number[]) =>
    a < 1 ? a * ARRIVAL_SHARE : ARRIVAL_SHARE + r * (1 - ARRIVAL_SHARE),
  );
  const progress = useSpring(timeline, { stiffness: 120, damping: 30, mass: 0.5, restDelta: 0.0002 });
  // The stage never sits dead still: it drifts upward through the runway.
  const drift = useTransform(progress, [0, 1], ["5svh", "-5svh"]);

  const [caption, setCaption] = useState(0);
  useMotionValueEvent(progress, "change", (p) => {
    const next = captionAt(p);
    setCaption((prev) => (prev === next ? prev : next));
  });

  if (mounted && tier === "safe") {
    return (
      <div className="grid items-center gap-12 md:grid-cols-[0.9fr_1.1fr] md:gap-8">
        {copy}
        <div className="mx-auto w-full max-w-[16rem]">
          <IslamQuestDevice screen={ISLAMQUEST_SCREENS[0]!} sizes="256px" />
        </div>
      </div>
    );
  }

  const screen = ISLAMQUEST_SCREENS[caption]!;

  return (
    <div data-iq-trailer className="relative">
      <div className="relative z-10 md:landscape:pointer-events-none md:landscape:absolute md:landscape:inset-x-0 md:landscape:top-0 md:landscape:pt-[24svh]">
        <div className="md:landscape:pointer-events-auto md:landscape:w-[44%]">{copy}</div>
      </div>

      <div ref={runway} data-iq-runway className="relative mt-6 h-[160vh] md:landscape:mt-0 md:landscape:h-[205vh]">
        <motion.div className="sticky top-0 h-[100svh]" style={{ y: drift }}>
          <div className="absolute inset-y-0 left-1/2 w-screen -translate-x-1/2">
            {mounted && <TrailerCanvas progress={progress} active={inView && documentVisible} />}
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-[7svh] flex justify-center md:bottom-[6svh] md:landscape:pl-[34%]"
            aria-live="polite"
            data-caption={caption + 1}
          >
            {/* swaps immediately (no exit queue) so it never lags a fast scroll */}
            <motion.p
              key={caption}
              className="flex items-baseline gap-3 text-center"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="mono text-[11px] tracking-[0.25em] text-accent-cyan">{pad(caption + 1)}</span>
              <span className="text-sm font-semibold text-ink">{screen.title}</span>
            </motion.p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
