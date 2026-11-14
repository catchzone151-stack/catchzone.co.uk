"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useScroll, useMotionValueEvent } from "motion/react";
import { primaryNav, primaryCta } from "@/data/navigation";
import { MobileNav } from "@/components/navigation/MobileNav";
import { ThemeToggle } from "@/components/navigation/ThemeToggle";

export function Nav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (latest) => {
    setScrolled(latest > 12);
  });

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header className="fixed inset-x-0 top-0 z-nav">
      <div
        className={`site-header-bar shell flex h-20 items-center justify-between transition-[background-color,border-color,backdrop-filter] duration-500 ${
          scrolled
            ? "border-b border-line bg-void/75 backdrop-blur-md"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        {/* Not `priority`: only the variant visible at this breakpoint is fetched
            (the hidden one is a lazy, display:none image). */}
        {/* Approved CatchZone Neon Orbital logo. In light mode the white lettering
            sits on a dark brand plate (.logo-plate) — the artwork itself is unchanged. */}
        <Link href="/" className="logo-plate -ml-2 flex items-center rounded-2xl px-2 py-1" aria-label="CatchZone home">
          <Image
            src="/brand/catchzone-logo.webp"
            alt="CatchZone — Built for what's next"
            width={1512}
            height={785}
            sizes="(min-width: 1024px) 132px, 116px"
            className="hidden h-[60px] w-auto sm:block lg:h-[68px]"
          />
          <Image
            src="/brand/catchzone-wordmark.webp"
            alt="CatchZone"
            width={1476}
            height={278}
            sizes="160px"
            className="h-[30px] w-auto sm:hidden"
          />
        </Link>

        <nav
          className="pointer-events-auto absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-1.5 py-1.5 backdrop-blur-md md:flex"
          aria-label="Primary"
        >
          {primaryNav.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`relative rounded-full px-4 py-2 text-sm font-medium transition-colors duration-300 ${
                  active
                    ? "text-ink"
                    : "text-ink-muted hover:text-ink"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {active && (
                  <span
                    className="absolute inset-0 rounded-full border border-accent-cyan/25 bg-accent-cyan/10"
                    aria-hidden="true"
                  />
                )}
                <span className="relative">{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2 self-stretch md:gap-3">
          <Link
            href={primaryCta.href}
            className="cta-breathe hidden rounded-full border border-accent-cyan/30 bg-white/[0.02] px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent-cyan hover:text-accent-cyan md:inline-block"
          >
            {primaryCta.label}
          </Link>

          <ThemeToggle className="self-stretch" />

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 bg-white/[0.02] md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-nav"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span className="relative block h-3 w-4">
              <span
                className={`absolute left-0 top-0 h-px w-4 bg-ink transition-transform duration-300 ${mobileOpen ? "translate-y-1.5 rotate-45" : ""}`}
              />
              <span
                className={`absolute left-0 bottom-0 h-px w-4 bg-ink transition-transform duration-300 ${mobileOpen ? "-translate-y-1.5 -rotate-45" : ""}`}
              />
            </span>
          </button>
        </div>
      </div>

      <MobileNav open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
}
