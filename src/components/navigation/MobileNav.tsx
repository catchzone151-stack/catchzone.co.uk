"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { primaryNav, primaryCta } from "@/data/navigation";
import { products, isProductsPath } from "@/data/products";
import { ProductLogo } from "@/components/brand/ProductLogo";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const inProducts = isProductsPath(pathname);
  const [productsOpen, setProductsOpen] = useState(inProducts);
  useEffect(() => {
    if (open) setProductsOpen(inProducts);
  }, [open, inProducts]);

  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";

    const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
      "a, button",
    );
    focusable?.[0]?.focus();

    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        // dims the page under the panel; tapping it closes the menu
        <motion.div
          key="scrim"
          className="fixed inset-x-0 bottom-0 top-20 -z-10 bg-void/70 md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      {open && (
        <motion.div
          key="panel"
          id="mobile-nav"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
          className="max-h-[calc(100svh-5rem)] overflow-y-auto border-b border-line bg-void/95 backdrop-blur-xl md:hidden"
        >
          <nav className="shell flex flex-col gap-1 py-6" aria-label="Mobile">
            {primaryNav.map((link) => {
              if (link.menu === "products") {
                return (
                  <div key={link.href}>
                    <div className="flex items-center gap-1">
                      <Link
                        href={link.href}
                        onClick={onClose}
                        aria-current={pathname === link.href ? "page" : undefined}
                        className={`flex flex-1 items-center gap-3 rounded-lg px-3 py-4 text-lg font-medium transition-colors ${
                          inProducts ? "text-accent-cyan" : "text-ink hover:bg-white/5"
                        }`}
                      >
                        {inProducts && (
                          <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" aria-hidden="true" />
                        )}
                        {link.label}
                      </Link>
                      <button
                        type="button"
                        aria-expanded={productsOpen}
                        aria-controls="mobile-products"
                        aria-label={productsOpen ? "Hide products" : "Show products"}
                        onClick={() => setProductsOpen((v) => !v)}
                        className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 text-ink"
                      >
                        <svg
                          viewBox="0 0 12 12"
                          className={`h-3.5 w-3.5 transition-transform duration-300 ${productsOpen ? "rotate-180" : ""}`}
                          aria-hidden="true"
                        >
                          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </button>
                    </div>
                    <AnimatePresence initial={false}>
                      {productsOpen && (
                        <motion.ul
                          id="mobile-products"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
                          className="product-contrast overflow-hidden"
                        >
                          {products.map((p) => {
                            const current = pathname === p.href || pathname.startsWith(`${p.href}/`);
                            return (
                              <li key={p.slug} className="py-1 pl-3">
                                <Link
                                  href={p.href}
                                  onClick={onClose}
                                  aria-current={current ? "page" : undefined}
                                  className={`flex items-center gap-4 rounded-xl border px-3 py-3 transition-colors ${
                                    current ? "border-accent-cyan/30 bg-accent-cyan/[0.06]" : "border-white/10 hover:bg-white/5"
                                  }`}
                                >
                                  <span className="flex h-12 w-[104px] shrink-0 items-center justify-center rounded-lg bg-void/60 px-1.5 ring-1 ring-white/5">
                                    <ProductLogo
                                      product={p.slug}
                                      size="small"
                                      decorative
                                      className={p.slug === "voice" ? "h-auto w-[92px]" : "h-10 w-auto"}
                                    />
                                  </span>
                                  <span className="min-w-0">
                                    <span className="block text-base font-semibold text-ink">{p.name}</span>
                                    <span className="mt-0.5 block text-[13px] leading-snug text-ink-muted">{p.summary}</span>
                                  </span>
                                </Link>
                              </li>
                            );
                          })}
                          <li className="py-1 pl-3">
                            <Link
                              href="/products"
                              onClick={onClose}
                              className="block rounded-lg px-3 py-3 text-sm font-semibold text-accent-cyan"
                            >
                              All products <span aria-hidden="true">→</span>
                            </Link>
                          </li>
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </div>
                );
              }
              const active =
                pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-4 text-lg font-medium transition-colors ${
                    active ? "text-accent-cyan" : "text-ink hover:bg-white/5"
                  }`}
                >
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" aria-hidden="true" />
                  )}
                  {link.label}
                </Link>
              );
            })}
            <Link
              href={primaryCta.href}
              onClick={onClose}
              className="mt-3 rounded-full bg-ink px-5 py-4 text-center text-lg font-semibold text-void"
            >
              {primaryCta.label}
            </Link>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
