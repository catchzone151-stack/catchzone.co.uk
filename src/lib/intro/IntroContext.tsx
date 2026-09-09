"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
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

const STORAGE_KEY = "cz_intro_seen";

export function IntroProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  const tier = usePerformanceTier();
  const isHome = pathname === "/";

  const [shouldPlayIntro, setShouldPlayIntro] = useState(false);
  const [phase, setPhase] = useState<IntroPhase>("hero");

  useEffect(() => {
    if (!isHome) {
      setPhase("hero");
      setShouldPlayIntro(false);
      return;
    }

    let seen = false;
    try {
      seen = window.sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      seen = false;
    }

    if (seen || reducedMotion) {
      setPhase("hero");
      setShouldPlayIntro(false);
    } else {
      setPhase("void");
      setShouldPlayIntro(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHome]);

  const skip = useCallback(() => {
    setPhase("hero");
    setShouldPlayIntro(false);
    try {
      window.sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* sessionStorage unavailable — non-fatal */
    }
  }, []);

  useEffect(() => {
    if (phase === "hero") {
      try {
        window.sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
    }
    if (typeof document !== "undefined") {
      document.documentElement.dataset.introActive = String(
        phase !== "hero",
      );
    }
  }, [phase]);

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
