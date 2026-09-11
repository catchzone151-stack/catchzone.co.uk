import type { Metadata } from "next";
import { Syne, Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { MotionConfig } from "motion/react";
import { IntroProvider } from "@/lib/intro/IntroContext";
import { Nav } from "@/components/navigation/Nav";
import { Footer } from "@/components/navigation/Footer";
import { IntroAwareMain } from "@/components/ui/IntroAwareMain";

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
        url: "/assets/images/CatchZone/CatchZone Wording.png",
        width: 1200,
        height: 630,
        alt: "CatchZone",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CatchZone — Digital Product & Engineering Studio",
    description:
      "CatchZone designs and builds apps, web platforms, business systems and complete connected digital ecosystems.",
  },
  icons: {
    icon: "/assets/images/CatchZone/favicon.png",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "CatchZone",
  url: siteUrl,
  logo: `${siteUrl}/assets/images/CatchZone/CatchZone Logo.png`,
  email: "info@catchzone.co.uk",
  address: {
    "@type": "PostalAddress",
    streetAddress: "124-128 City Road",
    addressLocality: "London",
    postalCode: "EC1V 2NX",
    addressCountry: "GB",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
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
