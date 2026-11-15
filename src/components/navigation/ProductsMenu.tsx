"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { products } from "@/data/products";
import { ProductLogo } from "@/components/brand/ProductLogo";

/**
 * Desktop "Products" navigation item (disclosure pattern):
 * - the "Products" link opens /products;
 * - the chevron button toggles a compact menu with both products;
 * - a mouse hover opens it too (touch never relies on hover);
 * - Escape closes it and returns focus to the button; it also closes when
 *   focus or the pointer leaves, and on route change.
 */
export function ProductsMenu({ active, pathname }: { active: boolean; pathname: string }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const hoverTimer = useRef<number | undefined>(undefined);

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
    };
    const onDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) close();
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onDown);
    };
  }, [open, close]);

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  const hover = (next: boolean) => (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setOpen(next), next ? 90 : 180);
  };

  return (
    <div
      ref={wrapRef}
      className="relative"
      onPointerEnter={hover(true)}
      onPointerLeave={hover(false)}
      onBlur={(e) => {
        if (!wrapRef.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <div className="relative flex items-center rounded-full">
        {active && (
          <span
            className="absolute inset-0 rounded-full border border-accent-cyan/25 bg-accent-cyan/10"
            aria-hidden="true"
          />
        )}
        <Link
          href="/products"
          aria-current={pathname === "/products" ? "page" : undefined}
          className={`relative rounded-full py-2 pl-4 pr-1 text-sm font-medium transition-colors duration-300 ${
            active || open ? "text-ink" : "text-ink-muted hover:text-ink"
          }`}
        >
          Products
        </Link>
        <button
          ref={buttonRef}
          type="button"
          aria-expanded={open}
          aria-controls="products-menu"
          aria-label="Show products"
          onClick={() => setOpen((v) => !v)}
          className={`relative mr-1 flex h-8 w-7 items-center justify-center rounded-full transition-colors ${
            active || open ? "text-ink" : "text-ink-muted hover:text-ink"
          }`}
        >
          <svg
            viewBox="0 0 12 12"
            className={`h-3 w-3 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
            aria-hidden="true"
          >
            <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>

      <AnimatePresence>
        {open && (
          // Positioning wrapper (CSS transform) + animated panel (motion transform).
          <div id="products-menu" className="absolute left-1/2 top-full z-10 w-[460px] -translate-x-1/2 pt-3">
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="product-contrast overflow-hidden rounded-2xl border border-white/10 bg-surface/95 p-2 shadow-[0_30px_60px_-25px_rgba(0,0,0,0.7)] backdrop-blur-xl light:bg-surface-raised/95 light:shadow-[0_30px_60px_-30px_rgba(14,17,22,0.35)]">
              <div className="flex items-center justify-between px-3 pb-1 pt-2">
                <p className="mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">CatchZone Products</p>
                <Link
                  href="/products"
                  className="rounded-full px-2 py-1 text-xs font-semibold text-accent-cyan transition-colors hover:text-ink"
                >
                  All products <span aria-hidden="true">→</span>
                </Link>
              </div>
              <ul className="mt-1 space-y-1">
                {products.map((p) => {
                  const current = pathname === p.href || pathname.startsWith(`${p.href}/`);
                  return (
                    <li key={p.slug}>
                      <Link
                        href={p.href}
                        aria-current={current ? "page" : undefined}
                        className={`group grid grid-cols-[132px_1fr] items-center gap-4 rounded-xl border p-3 transition-colors ${
                          current
                            ? "border-accent-cyan/25 bg-accent-cyan/[0.06]"
                            : "border-transparent hover:border-white/10 hover:bg-white/[0.04]"
                        }`}
                      >
                        <span className="flex h-14 items-center justify-center rounded-lg bg-void/60 px-2 ring-1 ring-white/5 light:bg-void">
                          <ProductLogo
                            product={p.slug}
                            size="small"
                            decorative
                            className={p.slug === "voice" ? "h-auto w-[112px]" : "h-12 w-auto"}
                          />
                        </span>
                        <span>
                          <span className="block text-sm font-semibold text-ink">{p.name}</span>
                          <span className="mt-0.5 block text-[13px] leading-snug text-ink-muted">{p.summary}</span>
                          <span className="mono mt-1.5 block text-[10px] uppercase tracking-[0.16em] text-accent-cyan/90">
                            {p.status}
                          </span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
