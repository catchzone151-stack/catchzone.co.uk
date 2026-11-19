"use client";

import dynamic from "next/dynamic";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { ChloeAvatar } from "@/components/chloe/ChloeAvatar";

// The conversation panel is only downloaded when a visitor first opens Chloe.
const loadPanel = () => import("@/components/chloe/ChloePanel");
const ChloePanel = dynamic(() => loadPanel().then((m) => m.ChloePanel), { ssr: false, loading: () => null });

/**
 * Chloe's bottom-right launcher. Quiet by design: no auto-open, no badges,
 * no sounds, no repeating animation, no fake "online" status.
 *
 * - Minimise hides the panel and keeps the conversation for this visit
 *   (the layout persists across page navigation).
 * - Close ends the conversation; reopening starts fresh.
 */
export function ChloeAssistant() {
  const pathname = usePathname();
  // The Start a Project form is the full enquiry path; keep its controls clear.
  const hideLauncher = pathname === "/start-a-project";
  const [open, setOpen] = useState(false);
  // Mounted once opened; stays mounted while minimised so nothing is lost.
  const [started, setStarted] = useState(false);
  const [session, setSession] = useState(0);
  const launcherRef = useRef<HTMLButtonElement>(null);
  // Focus returns to the launcher after it re-renders visible (minimise / close / Escape).
  const returnFocus = useRef(false);
  useEffect(() => {
    if (!open && returnFocus.current) {
      returnFocus.current = false;
      launcherRef.current?.focus();
    }
  }, [open, started]);

  const openChloe = () => {
    setStarted(true);
    setOpen(true);
  };

  const minimise = useCallback(() => {
    returnFocus.current = true;
    setOpen(false);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setStarted(false);
    setSession((s) => s + 1);
    returnFocus.current = true;
  }, []);

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        onClick={openChloe}
        onPointerEnter={() => void loadPanel()}
        onFocus={() => void loadPanel()}
        aria-label="Ask Chloe, CatchZone’s digital assistant"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={started ? "chloe-panel" : undefined}
        className={`chloe-launcher fixed z-[90] ${open || hideLauncher ? "hidden" : "flex"} h-[52px] w-[52px] items-center justify-center rounded-full border border-white/15 bg-void/80 p-[3px] shadow-[0_10px_30px_-8px_rgba(0,0,0,0.55)] backdrop-blur-md transition-colors duration-300 hover:border-accent-cyan/60 light:shadow-[0_10px_26px_-10px_rgba(14,17,22,0.3)]`}
      >
        <ChloeAvatar size={44} />
      </button>

      {started && <ChloePanel key={session} open={open} onMinimise={minimise} onClose={close} />}
    </>
  );
}
