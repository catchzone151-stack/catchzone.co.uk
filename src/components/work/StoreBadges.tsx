import Image from "next/image";

interface StoreBadgesProps {
  playStoreUrl?: string;
  /** Shown once a real App Store listing exists. Until then the badge is
   * rendered but never a live link — see the iOS caption below it. */
  appStoreUrl?: string;
  iosNote?: string;
  className?: string;
}

/**
 * One shared, universal store-badge component — used everywhere Google
 * Play / App Store badges appear. No page-specific badge sizing.
 *
 * Alignment is the whole point of this component: Google Play and the App
 * Store live in identical `flex-col` columns, each with a fixed `h-11`
 * (44px) badge box as the FIRST child, inside a row using `items-start`.
 * That guarantees both badge rectangles share the same top and bottom edge
 * regardless of whether the "iOS coming October 2026" caption is present
 * underneath — the caption occupies space below the row's alignment point,
 * so it can never push the Apple badge itself out of line. Do not go back
 * to `items-end` here: with a caption-only column taller than the plain
 * Google Play column, `items-end` aligns the *columns'* bottoms (i.e. the
 * caption text), not the two badge images — which is the exact bug this
 * replaced.
 */
export function StoreBadges({
  playStoreUrl,
  appStoreUrl,
  iosNote = "iOS coming October 2026",
  className,
}: StoreBadgesProps) {
  if (!playStoreUrl && !appStoreUrl) return null;

  return (
    <div className={`flex flex-wrap items-start gap-5 ${className ?? ""}`}>
      {playStoreUrl && (
        <div className="flex flex-col gap-1.5">
          <a
            href={playStoreUrl}
            target="_blank"
            rel="noreferrer"
            className="block h-11 w-[148px] shrink-0 overflow-hidden rounded-lg transition-opacity hover:opacity-85"
          >
            <Image
              src="/assets/images/store/google-play-badge.png"
              alt="Get it on Google Play"
              width={148}
              height={44}
              className="h-full w-full object-contain"
            />
          </a>
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        {appStoreUrl ? (
          <a
            href={appStoreUrl}
            target="_blank"
            rel="noreferrer"
            className="block h-11 w-[132px] shrink-0 overflow-hidden rounded-lg transition-opacity hover:opacity-85"
          >
            <Image
              src="/assets/images/store/app-store-badge.svg"
              alt="Download on the App Store"
              width={132}
              height={44}
              className="h-full w-full object-contain"
            />
          </a>
        ) : (
          <span
            aria-hidden="true"
            className="block h-11 w-[132px] shrink-0 opacity-40 grayscale"
          >
            <Image
              src="/assets/images/store/app-store-badge.svg"
              alt=""
              width={132}
              height={44}
              className="h-full w-full object-contain"
            />
          </span>
        )}
        {!appStoreUrl && (
          <span className="mono text-[11px] uppercase tracking-wider text-ink-faint">
            {iosNote}
          </span>
        )}
      </div>
    </div>
  );
}
