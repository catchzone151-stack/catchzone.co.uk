"use client";

import { useEffect, useState } from "react";

export type PerformanceTier = "high" | "balanced" | "safe";

interface NavigatorWithDeviceHints extends Navigator {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
}

function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl")
    );
  } catch {
    return false;
  }
}

function computeTier(): PerformanceTier {
  if (typeof window === "undefined") return "balanced";

  const reducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  if (reducedMotion) return "safe";

  if (!detectWebGL()) return "safe";

  const nav = window.navigator as NavigatorWithDeviceHints;
  const cores = nav.hardwareConcurrency ?? 4;
  const memory = nav.deviceMemory ?? 4;
  const saveData = nav.connection?.saveData ?? false;
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const dpr = window.devicePixelRatio || 1;
  const width = window.innerWidth;

  if (saveData) return "safe";

  if (cores <= 2 || memory <= 2) return "safe";

  const highEndDesktop =
    !isTouch && cores >= 8 && memory >= 8 && width >= 1280 && dpr <= 2.5;

  if (highEndDesktop) return "high";

  const capableDevice = cores >= 4 && memory >= 4;
  if (capableDevice) return "balanced";

  return "safe";
}

/**
 * Classifies the current device into a rendering budget. Re-evaluated once on
 * mount (hardware signals don't change mid-session) plus whenever reduced
 * motion is toggled at the OS level.
 */
export function usePerformanceTier(): PerformanceTier {
  const [tier, setTier] = useState<PerformanceTier>("balanced");

  useEffect(() => {
    setTier(computeTier());

    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setTier(computeTier());
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);

  return tier;
}

/**
 * Runtime frame-timing watchdog. Downgrades the tier once if sustained frame
 * times are poor, using a cooldown so it never flaps between states.
 */
export function useAdaptivePerformanceTier(baseTier: PerformanceTier): PerformanceTier {
  const [tier, setTier] = useState(baseTier);

  useEffect(() => {
    setTier(baseTier);
  }, [baseTier]);

  useEffect(() => {
    if (tier === "safe") return;

    let frame = 0;
    let last = performance.now();
    let slowFrames = 0;
    let downgraded = false;
    let rafId: number;

    const tick = (now: number) => {
      const delta = now - last;
      last = now;
      frame += 1;

      if (frame > 10) {
        if (delta > 42) {
          slowFrames += 1;
        } else {
          slowFrames = Math.max(0, slowFrames - 1);
        }
      }

      if (slowFrames > 40 && !downgraded) {
        downgraded = true;
        setTier((current) => (current === "high" ? "balanced" : "safe"));
        return;
      }

      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [tier]);

  return tier;
}
