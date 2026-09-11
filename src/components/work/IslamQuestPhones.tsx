"use client";

import { motion } from "motion/react";
import { DeviceFrame } from "@/components/showcase/DeviceFrame";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface IslamQuestPhonesProps {
  className?: string;
}

const CENTRE_SRC = "/assets/images/islamquest/fan-phones/centre-home.png";
const LEFT_SRC = "/assets/images/islamquest/fan-phones/left-leaderboard.png";
const RIGHT_SRC = "/assets/images/islamquest/fan-phones/right-quiz.png";

/** Graphite/dark chassis, neutral and CatchZone-native — not IslamQuest's own gold. */
const CHASSIS_ACCENT = {
  chassis: ["#2b2d31", "#08090a"] as [string, string],
  ring: "rgba(94,234,212,0.22)",
  glow: "rgba(94,234,212,0.14)",
};

const SIDE_ROTATE = 10;
const SIDE_TRAVEL = 52;

/**
 * A compact three-phone fan — centre/Home dominant and front-most, the two
 * support screens tucked behind at ~82% scale and rotated slightly inward.
 * Reuses the sitewide `DeviceFrame` chassis (compact, no pointer-tilt) so
 * the phones stay visually native to the rest of CatchZone rather than a
 * bespoke mockup. One simple fan-open entrance: centre rises into place,
 * then the two side phones swing out from behind it — no orbiting, no
 * flying, no continuous idle motion once settled.
 */
export function IslamQuestPhones({ className }: IslamQuestPhonesProps) {
  const reduced = useReducedMotion();

  return (
    <div className={`relative mx-auto w-full max-w-[460px] ${className ?? ""}`}>
      <div
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{ background: "radial-gradient(55% 60% at 50% 45%, rgba(94,234,212,0.16), rgba(124,58,237,0.06) 55%, transparent 75%)" }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute bottom-[4%] left-1/2 h-[8%] w-[62%] -translate-x-1/2 rounded-[50%] blur-xl"
        style={{ background: "radial-gradient(50% 50% at 50% 50%, rgba(0,0,0,0.5), transparent 75%)" }}
        aria-hidden="true"
      />

      <div className="relative flex items-end justify-center">
        <motion.div
          className="relative z-10 -mr-[9%] w-[30%] pb-[4%] sm:w-[32%]"
          initial={reduced ? false : { x: SIDE_TRAVEL, rotate: 0, opacity: 0 }}
          animate={{ x: 0, rotate: SIDE_ROTATE, opacity: 1 }}
          transition={{ type: "spring", stiffness: 170, damping: 20, delay: reduced ? 0 : 0.16 }}
        >
          <DeviceFrame
            kind="phone"
            src={LEFT_SRC}
            alt="IslamQuest leaderboard screen"
            accent={CHASSIS_ACCENT}
            compact
            sizes="220px"
          />
        </motion.div>

        <motion.div
          className="relative z-20 w-[38%] sm:w-[40%]"
          initial={reduced ? false : { y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 170, damping: 20 }}
        >
          <DeviceFrame
            kind="phone"
            src={CENTRE_SRC}
            alt="IslamQuest home screen"
            accent={CHASSIS_ACCENT}
            compact
            priority
            sizes="260px"
          />
        </motion.div>

        <motion.div
          className="relative z-10 -ml-[9%] w-[30%] pb-[4%] sm:w-[32%]"
          initial={reduced ? false : { x: -SIDE_TRAVEL, rotate: 0, opacity: 0 }}
          animate={{ x: 0, rotate: -SIDE_ROTATE, opacity: 1 }}
          transition={{ type: "spring", stiffness: 170, damping: 20, delay: reduced ? 0 : 0.3 }}
        >
          <DeviceFrame
            kind="phone"
            src={RIGHT_SRC}
            alt="IslamQuest quiz screen"
            accent={CHASSIS_ACCENT}
            compact
            sizes="220px"
          />
        </motion.div>
      </div>
    </div>
  );
}
