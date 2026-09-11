import Image from "next/image";
import Link from "next/link";
import { footerNav } from "@/data/navigation";

export function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="shell grid gap-10 py-16 md:grid-cols-[1.2fr_1fr_1fr]">
        <div>
          <Image
            src="/brand/catchzone-logo-full.png"
            alt="CatchZone — Built for what's next"
            width={2000}
            height={667}
            className="h-auto w-[240px]"
          />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-ink-muted">
            Apps. Web platforms. Business systems. Connected digital
            ecosystems — designed and built as one.
          </p>
        </div>

        <nav aria-label="Footer">
          <p className="mono text-xs uppercase tracking-wider text-ink-faint">
            Site
          </p>
          <ul className="mt-4 space-y-2.5">
            {footerNav.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-ink-muted transition-colors hover:text-ink"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <p className="mono text-xs uppercase tracking-wider text-ink-faint">
            Contact
          </p>
          <p className="mt-4 text-sm text-ink-muted">
            <a
              href="mailto:info@catchzone.co.uk"
              className="transition-colors hover:text-ink"
            >
              info@catchzone.co.uk
            </a>
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-muted">
            CatchZone Ltd
            <br />
            124-128 City Road
            <br />
            London EC1V 2NX
            <br />
            United Kingdom
          </p>
        </div>
      </div>

      <div className="shell flex flex-col gap-2 border-t border-line py-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
        <p>CatchZone Ltd © {new Date().getFullYear()}</p>
        <p>Company registered in England &amp; Wales</p>
      </div>
    </footer>
  );
}
