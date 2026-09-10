"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { primaryNav, primaryCta } from "@/data/navigation";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

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
        <motion.div
          id="mobile-nav"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
          className="border-b border-line bg-void/95 backdrop-blur-xl md:hidden"
        >
          <nav className="shell flex flex-col gap-1 py-6" aria-label="Mobile">
            {primaryNav.map((link) => {
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
