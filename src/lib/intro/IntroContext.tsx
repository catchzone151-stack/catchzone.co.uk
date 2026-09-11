"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { usePerformanceTier } from "@/lib/performance/usePerformanceTier";

export type IntroPhase =
  | "void"
  | "assembly"
  | "connection"
  | "transition"
  | "hero";

interface IntroContextValue {
  phase: IntroPhase;
  setPhase: (phase: IntroPhase) => void;
  skip: () => void;
  shouldPlayIntro: boolean;
  reducedMotion: boolean;
  tier: ReturnType<typeof usePerformanceTier>;
}

const IntroStateContext = createContext<IntroContextValue | null>(null);

/**
 * The site previously gated the homepage behind a several-second blocking
 * intro sequence (void -> assembly -> connection -> transition -> hero)
 * with a "Skip Intro" button. That's been removed: the hero IS the entry
 * experience now. `phase` stays "hero" from first paint and
 * `shouldPlayIntro` stays false, so nothing renders the old overlay — the
 * type is kept (and a couple of consumers still read it) purely so the
 * hero's own DOM/3D entrance easing (which keys off `phase === "hero"`)
 * continues to work unchanged.
 */
export function IntroProvider({ children }: { children: React.ReactNode }) {
  const reducedMotion = useReducedMotion();
  const tier = usePerformanceTier();

  const shouldPlayIntro = false;
  const [phase, setPhase] = useState<IntroPhase>("hero");

  const skip = useCallback(() => {
    setPhase("hero");
  }, []);

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.dataset.introActive = "false";
    }
  }, []);

  const value = useMemo(
    () => ({ phase, setPhase, skip, shouldPlayIntro, reducedMotion, tier }),
    [phase, skip, shouldPlayIntro, reducedMotion, tier],
  );

  return (
    <IntroStateContext.Provider value={value}>
      {children}
    </IntroStateContext.Provider>
  );
}

export function useIntro() {
  const ctx = useContext(IntroStateContext);
  if (!ctx) throw new Error("useIntro must be used within IntroProvider");
  return ctx;
}
