import type { Metadata, Viewport } from "next";
import { Syne, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { MotionConfig } from "motion/react";
import { IntroProvider } from "@/lib/intro/IntroContext";
import { Nav } from "@/components/navigation/Nav";
import { Footer } from "@/components/navigation/Footer";
import { IntroAwareMain } from "@/components/ui/IntroAwareMain";
import { jsonLd } from "@/lib/seo";

const display = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["600", "700", "800"],
  display: "swap",
});

const body = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

const siteUrl = "https://catchzone.co.uk";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CatchZone — Digital Product & Engineering Studio",
    template: "%s | CatchZone",
  },
  description:
    "CatchZone designs and builds apps, web platforms, business systems and complete connected digital ecosystems.",
  openGraph: {
    type: "website",
    siteName: "CatchZone",
    title: "CatchZone — Digital Product & Engineering Studio",
    description:
      "CatchZone designs and builds apps, web platforms, business systems and complete connected digital ecosystems.",
    url: siteUrl,
    images: [
      {
        url: "/og/catchzone.png",
        width: 1200,
        height: 630,
        alt: "CatchZone — Built for what's next",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CatchZone — Digital Product & Engineering Studio",
    description:
      "CatchZone designs and builds apps, web platforms, business systems and complete connected digital ecosystems.",
    images: ["/og/catchzone.png"],
  },
  icons: {
    icon: [
      { url: "/brand/favicon.ico", sizes: "any" },
      { url: "/brand/catchzone-icon.svg", type: "image/svg+xml" },
      { url: "/brand/favicon-32.png", type: "image/png", sizes: "32x32" },
      { url: "/brand/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: "/brand/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#040406",
};

/**
 * Applies the saved theme before first paint so there is no flash of the
 * wrong theme. Dark is the default; only "light" or "dark" are accepted.
 */
const themeInitScript = `(function(){try{var t=localStorage.getItem("cz-theme");if(t!=="light")t="dark";var d=document.documentElement;d.setAttribute("data-theme",t);}catch(e){}})();`;

// Organization + WebSite (site name) — matches the visible footer details.
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: "CatchZone",
  legalName: "CatchZone Ltd",
  url: siteUrl,
  logo: `${siteUrl}/brand/catchzone-logo-schema.png`,
  slogan: "Built for what's next",
  email: "info@catchzone.co.uk",
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer enquiries",
    email: "info@catchzone.co.uk",
    areaServed: "GB",
    availableLanguage: "en-GB",
    hoursAvailable: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "09:00",
      closes: "18:00",
    },
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "124-128 City Road",
    addressLocality: "London",
    postalCode: "EC1V 2NX",
    addressCountry: "GB",
  },
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${siteUrl}/#website`,
  name: "CatchZone",
  url: siteUrl,
  publisher: { "@id": `${siteUrl}/#organization` },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-theme="dark"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} ${mono.variable}`}
    >
      <head>
        {/* eslint-disable-next-line react/no-danger */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: jsonLd(organizationJsonLd) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: jsonLd(websiteJsonLd) }}
        />
        <a href="#main-content" className="skip-link">
          Skip to content
        </a>
        <MotionConfig reducedMotion="user">
          <IntroProvider>
            <Nav />
            <IntroAwareMain>
              {children}
              <Footer />
            </IntroAwareMain>
          </IntroProvider>
        </MotionConfig>
        <div className="grain-overlay" aria-hidden="true" />
      </body>
    </html>
  );
}
