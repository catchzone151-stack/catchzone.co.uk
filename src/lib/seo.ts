import type { Metadata } from "next";

/**
 * Per-page metadata with consistent canonical, Open Graph and Twitter tags.
 *
 * Next.js replaces (does not merge) a parent's `openGraph`/`twitter` objects
 * when a page sets its own, and a page that sets neither inherits the
 * homepage's og:title/og:url. This helper gives every page its own complete
 * set. Keyword intent per page: docs/SEO_REPORT.md.
 */
export const SITE_URL = "https://catchzone.co.uk";
export const DEFAULT_OG_IMAGE = { url: "/og/catchzone.png", width: 1200, height: 630, alt: "CatchZone — Built for what's next" };

export function pageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  noindex = false,
}: {
  /** Full title as it should appear in search and social (no template applied). */
  title: string;
  description: string;
  /** Canonical path, e.g. "/services". */
  path: string;
  image?: { url: string; width: number; height: number; alt: string };
  noindex?: boolean;
}): Metadata {
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: "CatchZone",
      locale: "en_GB",
      url: path,
      title,
      description,
      images: [image],
    },
    twitter: { card: "summary_large_image", title, description, images: [image.url] },
    ...(noindex ? { robots: { index: false, follow: true } } : {}),
  };
}

/** Safe JSON-LD serialisation (prevents `</script>` breakout from any string value). */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** schema.org Service for a CatchZone service page (no prices, areas or ratings). */
export function serviceJsonLd({ name, description, path, outputs }: { name: string; description: string; path: string; outputs: string[] }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    serviceType: name,
    description,
    url: `${SITE_URL}${path}`,
    provider: { "@type": "Organization", "@id": `${SITE_URL}/#organization`, name: "CatchZone Ltd", url: SITE_URL },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name,
      itemListElement: outputs.map((o) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: o } })),
    },
  };
}
