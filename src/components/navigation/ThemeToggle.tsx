"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";

type Theme = "dark" | "light";
const STORAGE_KEY = "cz-theme";
const PULL_THRESHOLD = 16;
const PULL_MAX = 30;

function currentTheme(): Theme {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function applyTheme(next: Theme) {
  const html = document.documentElement;
  html.classList.add("theme-transition");
  html.setAttribute("data-theme", next);
  try {
    localStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* private mode — the theme still applies for this page view */
  }
  window.setTimeout(() => html.classList.remove("theme-transition"), 520);
}

/**
 * Signature pull-string light switch. A hairline cord hangs from the top of
 * the header with a small bead. Click / tap / Enter / Space toggles the
 * theme; pulling the bead down past a short threshold also toggles it
 * (optional — never required). Dark is the default; the choice persists.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const reduced = useReducedMotion();
  const pull = useMotionValue(0);
  const cordScale = useTransform(pull, [0, PULL_MAX], [1, 1.55]);
  const drag = useRef<{ startY: number; moved: boolean; pointerId: number } | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    setTheme(currentTheme());
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      const next: Theme = e.newValue === "light" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      setTheme(next);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  function toggle() {
    const next: Theme = currentTheme() === "light" ? "dark" : "light";
    applyTheme(next);
    setTheme(next);
    if (!reduced) {
      animate(pull, [pull.get(), 18, -4, 0], { duration: 0.6, ease: [0.22, 1, 0.36, 1] });
    }
  }

  function onPointerDown(e: React.PointerEvent<HTMLButtonElement>) {
    if (e.button !== 0) return;
    drag.current = { startY: e.clientY, moved: false, pointerId: e.pointerId };
  }

  function onPointerMove(e: React.PointerEvent<HTMLButtonElement>) {
    const d = drag.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const dy = Math.max(0, Math.min(PULL_MAX, e.clientY - d.startY));
    if (dy > 3 && !d.moved) {
      d.moved = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    }
    if (d.moved && !reduced) pull.set(dy);
  }

  function onPointerUp(e: React.PointerEvent<HTMLButtonElement>) {
    const d = drag.current;
    drag.current = null;
    if (!d || !d.moved) return;
    // A real pull: decide here and swallow the click that follows.
    suppressClick.current = true;
    const dy = e.clientY - d.startY;
    if (dy >= PULL_THRESHOLD) {
      toggle();
    } else if (!reduced) {
      animate(pull, 0, { type: "spring", stiffness: 420, damping: 18 });
    }
  }

  function onClick() {
    if (suppressClick.current) {
      suppressClick.current = false;
      return;
    }
    toggle();
  }

  const isLight = theme === "light";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label="Light mode"
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      onClick={onClick}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => {
        drag.current = null;
        if (!reduced) animate(pull, 0, { duration: 0.2 });
      }}
      className={`group relative flex w-11 touch-none select-none justify-center rounded-b-full focus-visible:outline-offset-[-2px] ${className}`}
    >
      {/* ceiling fixture */}
      <span className="absolute left-1/2 top-0 h-[3px] w-3 -translate-x-1/2 rounded-b-sm bg-ink/25" aria-hidden="true" />
      <motion.span className="relative flex flex-col items-center" style={{ y: pull }} aria-hidden="true">
        {/* cord */}
        <motion.span
          className="block h-8 w-px origin-top bg-gradient-to-b from-ink/10 via-ink/35 to-ink/55 sm:h-9"
          style={{ scaleY: cordScale, marginTop: 0 }}
        />
        {/* bead */}
        <span
          className={`relative -mt-px block h-[15px] w-[10px] rounded-full transition-[background,box-shadow] duration-500 ${
            isLight
              ? "bg-[linear-gradient(160deg,#3a3f4a,#0e1116)] shadow-[0_2px_6px_rgba(14,17,22,0.35)]"
              : "bg-[linear-gradient(160deg,#c9fff5,#5eead4_55%,#1f9e8f)] shadow-[0_0_12px_rgba(94,234,212,0.55)]"
          } group-hover:scale-110 group-active:scale-95`}
        >
          <span className="absolute left-[2px] top-[2px] h-[4px] w-[3px] rounded-full bg-[rgba(255,255,255,0.6)]" />
        </span>
      </motion.span>
    </button>
  );
}
