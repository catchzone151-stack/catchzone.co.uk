import Image from "next/image";
import Link from "next/link";

const LINKS = [
  { href: "/voice", label: "Overview" },
  { href: "/voice/languages", label: "Languages" },
  { href: "/voice/business", label: "For Business" },
];

/**
 * Product-level navigation shared by the CatchZone Voice pages, with
 * optional breadcrumbs (also emitted as BreadcrumbList structured data).
 */
export function VoiceSubnav({
  current,
  breadcrumb,
}: {
  current: "/voice" | "/voice/languages" | "/voice/business";
  breadcrumb?: { name: string; href: string }[];
}) {
  const crumbs = breadcrumb ?? [];
  const jsonLd =
    crumbs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: crumbs.map((c, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: c.name,
            item: `https://catchzone.co.uk${c.href === "/" ? "" : c.href}`,
          })),
        }
      : null;

  return (
    <div className="shell pt-24 md:pt-28">
      {jsonLd && (
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <div className="flex flex-col gap-4 border-b border-line pb-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href="/voice" className="flex items-center" aria-label="CatchZone Voice overview">
          {/* Approved CatchZone Voice logo, rendered from the vector master:
              Logo-1 (white lettering) in dark mode, Logo-2 (dark lettering) in light mode. */}
          <Image
            src="/brand/voice/catchzone-voice-logo-dark.webp"
            alt="CatchZone Voice"
            width={1100}
            height={201}
            sizes="200px"
            className="theme-only-dark h-8 w-auto sm:h-9"
          />
          <Image
            src="/brand/voice/catchzone-voice-logo-light.webp"
            alt="CatchZone Voice"
            width={1100}
            height={219}
            sizes="200px"
            className="theme-only-light h-8 w-auto sm:h-9"
          />
        </Link>
        <nav aria-label="CatchZone Voice" className="-mx-1 flex gap-1 overflow-x-auto">
          {LINKS.map((l) => {
            const active = l.href === current;
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-[40px] shrink-0 items-center rounded-full px-4 text-sm transition-colors ${
                  active ? "bg-white/[0.06] text-ink" : "text-ink-muted hover:text-ink"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {crumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mt-4 hidden sm:block">
          <ol className="flex flex-wrap items-center gap-2 text-xs text-ink-faint">
            {crumbs.map((c, i) => (
              <li key={c.href} className="flex items-center gap-2">
                {i < crumbs.length - 1 ? (
                  <>
                    <Link href={c.href} className="hover:text-ink">
                      {c.name}
                    </Link>
                    <span aria-hidden="true">/</span>
                  </>
                ) : (
                  <span aria-current="page" className="text-ink-muted">
                    {c.name}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </nav>
      )}
    </div>
  );
}
