import Image from "next/image";
import { teamImage, SCULPTURE_SIZE, PORTRAIT_SIZE, type TeamProfile } from "@/data/team";

/**
 * Theme-matched team artwork: the dark file in dark mode, the light file in
 * light mode, swapped by CSS (`.theme-only-*`) so theme changes are instant
 * and there is no hydration flicker. Hidden variants are lazy display:none
 * images and are not downloaded.
 */
export function TeamImage({
  slug,
  kind,
  alt,
  sizes,
  className = "",
  priority = false,
}: {
  slug: TeamProfile["slug"];
  kind: "sculpture" | "portrait";
  alt: string;
  sizes: string;
  className?: string;
  /** Eager-load the default-theme (dark) variant. */
  priority?: boolean;
}) {
  const size = kind === "sculpture" ? SCULPTURE_SIZE : PORTRAIT_SIZE;
  return (
    <>
      <Image
        src={teamImage(slug, kind, "dark")}
        alt={alt}
        width={size.w}
        height={size.h}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        className={`theme-only-dark ${className}`}
        draggable={false}
      />
      <Image
        src={teamImage(slug, kind, "light")}
        alt={alt}
        width={size.w}
        height={size.h}
        sizes={sizes}
        loading="lazy"
        className={`theme-only-light ${className}`}
        draggable={false}
      />
    </>
  );
}
