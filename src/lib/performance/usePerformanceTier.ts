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
