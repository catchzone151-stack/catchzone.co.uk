"use client";

import { CAL_EMBED_ORIGIN, CAL_EMBED_SCRIPT } from "@/data/booking";

/**
 * Cal.com "popup on click", loaded lazily: nothing from Cal.com is fetched
 * until a visitor actually clicks a booking button, so ordinary page views
 * carry no third-party script. The popup follows the site's light/dark theme,
 * including theme changes while it is open.
 *
 * The stub below is Cal.com's documented embed loader (it queues calls until
 * embed.js arrives); script load/error is tracked so a blocked script falls
 * back to opening the public booking page instead of failing silently.
 */

type CalQueue = { (...args: unknown[]): void; loaded?: boolean; q?: unknown[]; ns?: Record<string, unknown> };

declare global {
  interface Window {
    Cal?: CalQueue;
  }
}

const BRAND = { dark: "#5eead4", light: "#0b7067" } as const;

let loader: Promise<void> | null = null;
let themeObserver: MutationObserver | null = null;

const siteTheme = (): "dark" | "light" =>
  document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";

function installStub() {
  if (window.Cal) return;
  const cal: CalQueue = function (...args: unknown[]) {
    (cal.q ||= []).push(args);
  };
  cal.ns = {};
  cal.q = [];
  window.Cal = cal;
}

function applyTheme() {
  window.Cal?.("ui", {
    theme: siteTheme(),
    hideEventTypeDetails: false,
    layout: "month_view",
    cssVarsPerTheme: { light: { "cal-brand": BRAND.light }, dark: { "cal-brand": BRAND.dark } },
  });
}

/** Loads embed.js once; resolves when it has loaded, rejects if it can't (blocked, offline). */
export function loadCal(): Promise<void> {
  if (loader) return loader;
  loader = new Promise<void>((resolve, reject) => {
    installStub();
    const script = document.createElement("script");
    script.src = CAL_EMBED_SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      loader = null;
      script.remove();
      delete window.Cal;
      reject(new Error("cal_embed_unavailable"));
    };
    window.Cal!("init", { origin: CAL_EMBED_ORIGIN });
    applyTheme();
    document.head.appendChild(script);

    if (!themeObserver) {
      themeObserver = new MutationObserver(applyTheme);
      themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    }
  });
  return loader;
}

/** Opens the Cal.com booking popup for an event path, e.g. "catchzone/intro-call". */
export async function openCalPopup(calLink: string): Promise<void> {
  await loadCal();
  applyTheme();
  window.Cal!("modal", {
    calLink,
    calOrigin: CAL_EMBED_ORIGIN,
    config: { layout: "month_view", theme: siteTheme() },
  });
}
