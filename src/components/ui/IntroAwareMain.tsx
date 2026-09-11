"use client";

import { useEffect, useRef } from "react";
import { useIntro } from "@/lib/intro/IntroContext";

export function IntroAwareMain({ children }: { children: React.ReactNode }) {
  const { phase } = useIntro();
  const ref = useRef<HTMLDivElement>(null);
  const introActive = phase !== "hero";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (introActive) {
      el.setAttribute("inert", "");
    } else {
      el.removeAttribute("inert");
    }
  }, [introActive]);

  return (
    <div ref={ref}>
      <main id="main-content">{children}</main>
    </div>
  );
}
