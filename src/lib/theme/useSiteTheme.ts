"use client";

import { useEffect, useState } from "react";

export type SiteTheme = "dark" | "light";

function read(): SiteTheme {
  if (typeof document === "undefined") return "dark";
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

/**
 * Current site theme, kept in sync with `<html data-theme>` (set before first
 * paint by the inline script in layout.tsx, then by the pull-string switch).
 * Used by WebGL scenes, which can't read CSS variables.
 */
export function useSiteTheme(): SiteTheme {
  const [theme, setTheme] = useState<SiteTheme>(read);
  useEffect(() => {
    setTheme(read());
    const observer = new MutationObserver(() => setTheme(read()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  return theme;
}
