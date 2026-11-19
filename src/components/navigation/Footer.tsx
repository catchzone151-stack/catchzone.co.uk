import { CompanyLogo } from "@/components/brand/CompanyLogo";
import Link from "next/link";
import { footerColumns, primaryCta } from "@/data/navigation";
import { BookCallLink } from "@/components/booking/BookCallLink";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="shell grid gap-10 py-16 sm:grid-cols-2 lg:grid-cols-[1.35fr_1fr_1fr_0.8fr_1fr] lg:gap-8">
        <div className="sm:col-span-2 lg:col-span-1">
          {/* Full logo: the slogan is legible at this size. */}
          <CompanyLogo className="h-auto w-[280px]" />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-muted">
            Apps. Web platforms. Business systems. Connected digital
            ecosystems — designed and built as one.
          </p>
        </div>

        {footerColumns.map((col) => (
          <nav key={col.title} aria-label={`Footer — ${col.title}`}>
            <p className="mono text-xs uppercase tracking-wider text-ink-faint">{col.title}</p>
            <ul className="mt-4 space-y-2.5">
              {col.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-ink-muted transition-colors hover:text-ink">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <p className="mono text-xs uppercase tracking-wider text-ink-faint">Contact</p>
          <p className="mt-4 text-sm text-ink-muted">
            <a href="mailto:info@catchzone.co.uk" className="transition-colors hover:text-ink">
              info@catchzone.co.uk
            </a>
          </p>
          <p className="mt-2 text-sm text-ink-muted">Mon–Fri, 09:00–18:00</p>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            CatchZone Ltd
            <br />
            124-128 City Road
            <br />
            London EC1V 2NX
            <br />
            United Kingdom
          </p>
          <Link
            href={primaryCta.href}
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-accent-cyan"
          >
            {primaryCta.label}
            <span aria-hidden="true">→</span>
          </Link>
          <BookCallLink
            event="intro"
            className="mt-2.5 flex w-fit items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            Book a Call
            <span aria-hidden="true">→</span>
          </BookCallLink>
        </div>
      </div>

      <div className="shell flex flex-col gap-2 border-t border-line py-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
        <p>CatchZone Ltd © {new Date().getFullYear()}</p>
        {/* Right margin keeps this line clear of Chloe's bottom-right launcher. */}
        <p className="sm:mr-14">Company registered in England &amp; Wales</p>
      </div>
    </footer>
  );
}
