import Image from "next/image";

/**
 * The approved CatchZone company logo, as clean SVG masters rebuilt from the
 * owner-approved artwork (see docs/THEME_AND_BRANDING.md).
 *
 * - `full`: wordmark + slogan "BUILT FOR WHAT'S NEXT" + orbit (header ≥640px, footer).
 * - `compact`: wordmark only, for small mobile headers where the slogan can't be read.
 *
 * The dark-theme file (white "Catch" and slogan) and the light-theme file (dark
 * lettering) are swapped by CSS. Both are lazy images and the hidden one is
 * display:none, so only the visible variant is downloaded. SVG renders sharply
 * at every size and pixel density.
 */
const VARIANTS = {
  full: { file: "catchzone-logo", width: 1597, height: 652, alt: "CatchZone — Built for what's next" },
  compact: { file: "catchzone-wordmark", width: 1557, height: 248, alt: "CatchZone" },
} as const;

export function CompanyLogo({
  variant = "full",
  className = "",
}: {
  variant?: keyof typeof VARIANTS;
  className?: string;
}) {
  const v = VARIANTS[variant];
  return (
    <>
      <Image
        src={`/brand/${v.file}-dark.svg`}
        alt={v.alt}
        width={v.width}
        height={v.height}
        unoptimized
        className={`theme-only-dark ${className}`}
      />
      <Image
        src={`/brand/${v.file}-light.svg`}
        alt={v.alt}
        width={v.width}
        height={v.height}
        unoptimized
        className={`theme-only-light ${className}`}
      />
    </>
  );
}
