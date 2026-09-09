"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { primaryNav, primaryCta } from "@/data/navigation";
import { useIntro } from "@/lib/intro/IntroContext";
import { MobileNav } from "@/components/navigation/MobileNav";

export function Nav() {
  const pathname = usePathname();
  const { phase } = useIntro();
  const [mobileOpen, setMobileOpen] = useState(false);
  const hiddenForIntro = phase !== "hero";

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className="fixed inset-x-0 top-0 z-nav transition-opacity duration-700 ease-cinematic"
      style={{
        opacity: hiddenForIntro ? 0 : 1,
        pointerEvents: hiddenForIntro ? "none" : "auto",
      }}
      aria-hidden={hiddenForIntro}
    >
      <div className="shell flex h-20 items-center justify-between border-b border-line bg-void/70 backdrop-blur-md">
        <Link
          href="/"
          className="flex items-center gap-2"
          aria-label="CatchZone home"
        >
          <Image
            src="/assets/images/CatchZone/CatchZone Logo.png"
            alt="CatchZone"
            width={36}
            height={36}
            priority
          />
          <span className="font-display text-lg tracking-tight text-ink">
            CatchZone
          </span>
        </Link>

        <nav
          className="hidden items-center gap-8 md:flex"
          aria-label="Primary"
        >
          {primaryNav.map((link) => {
            const active =
              pathname === link.href || pathname.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group relative text-sm font-medium text-ink-muted transition-colors hover:text-ink"
                aria-current={active ? "page" : undefined}
              >
                {link.label}
                <span
                  className={`absolute -bottom-1.5 left-0 h-px bg-accent-cyan transition-all duration-300 ease-precise ${
                    active ? "w-full" : "w-0 group-hover:w-full"
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href={primaryCta.href}
            className="hidden rounded-full border border-ink/20 px-5 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-accent-cyan hover:text-accent-cyan md:inline-block"
          >
            {primaryCta.label}
          </Link>

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/20 md:hidden"
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
