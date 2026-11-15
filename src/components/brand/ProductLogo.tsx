import Image from "next/image";
import type { ProductSlug } from "@/data/products";

/**
 * Approved product logos, swapped by theme (dark file on dark backgrounds,
 * light file on light backgrounds). Hidden variants are lazy display:none
 * images, so only the visible one downloads.
 *
 * - School HR: SVG masters from `scripts/brand/vectorise_logo.py`.
 * - Voice: the SVG master for large placements; the lighter WebP export for
 *   small ones (navigation, cards), where the embedded waveform raster in the
 *   SVG would be wasted bytes.
 */
const FILES = {
  voice: {
    large: {
      dark: { src: "/brand/voice/catchzone-voice-logo-dark.svg", w: 1889, h: 346 },
      light: { src: "/brand/voice/catchzone-voice-logo-light.svg", w: 1878, h: 374 },
    },
    small: {
      dark: { src: "/brand/voice/catchzone-voice-logo-dark.webp", w: 1100, h: 201 },
      light: { src: "/brand/voice/catchzone-voice-logo-light.webp", w: 1100, h: 219 },
    },
    alt: "CatchZone Voice",
  },
  "school-hr": {
    large: {
      dark: { src: "/brand/school-hr/catchzone-school-hr-logo-dark.svg", w: 1492, h: 668 },
      light: { src: "/brand/school-hr/catchzone-school-hr-logo-light.svg", w: 1551, h: 652 },
    },
    small: {
      dark: { src: "/brand/school-hr/catchzone-school-hr-logo-dark.svg", w: 1492, h: 668 },
      light: { src: "/brand/school-hr/catchzone-school-hr-logo-light.svg", w: 1551, h: 652 },
    },
    alt: "CatchZone School HR",
  },
} as const;

export function ProductLogo({
  product,
  size = "large",
  className = "",
  decorative = false,
}: {
  product: ProductSlug;
  size?: "large" | "small";
  className?: string;
  /** When the product name is already given as text next to the logo. */
  decorative?: boolean;
}) {
  const f = FILES[product];
  const set = f[size];
  const alt = decorative ? "" : f.alt;
  return (
    <>
      <Image
        src={set.dark.src}
        width={set.dark.w}
        height={set.dark.h}
        alt={alt}
        unoptimized
        className={`theme-only-dark ${className}`}
      />
      <Image
        src={set.light.src}
        width={set.light.w}
        height={set.light.h}
        alt={alt}
        unoptimized
        className={`theme-only-light ${className}`}
      />
    </>
  );
}
