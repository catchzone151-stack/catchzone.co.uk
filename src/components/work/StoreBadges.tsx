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
 * Official-style store badges rather than plain text/icon links. The App
 * Store badge is always shown for parity with the Google Play badge, but is
 * dimmed and non-interactive until `appStoreUrl` is real — it must never
 * imply the app is already downloadable on iOS.
 */
export function StoreBadges({
  playStoreUrl,
  appStoreUrl,
  iosNote = "iOS coming October 2026",
  className,
}: StoreBadgesProps) {
  if (!playStoreUrl && !appStoreUrl) return null;

  return (
    <div className={`flex flex-wrap items-end gap-5 ${className ?? ""}`}>
      {playStoreUrl && (
        <a
          href={playStoreUrl}
          target="_blank"
          rel="noreferrer"
          className="block h-[44px] w-[148px] shrink-0 overflow-hidden rounded-lg transition-opacity hover:opacity-85"
        >
          <Image
            src="/assets/images/store/google-play-badge.png"
            alt="Get it on Google Play"
            width={148}
            height={44}
            className="h-full w-full object-contain"
          />
        </a>
      )}

      {!appStoreUrl && (
        <div className="flex flex-col gap-1.5">
          <span
            aria-hidden="true"
            className="block h-[44px] w-[132px] shrink-0 opacity-40 grayscale"
          >
            <Image
              src="/assets/images/store/app-store-badge.svg"
              alt=""
              width={132}
              height={44}
              className="h-full w-full object-contain"
            />
          </span>
          <span className="mono text-[11px] uppercase tracking-wider text-ink-faint">
            {iosNote}
          </span>
        </div>
      )}

      {appStoreUrl && (
        <a
          href={appStoreUrl}
          target="_blank"
          rel="noreferrer"
          className="block h-[44px] w-[132px] shrink-0 overflow-hidden rounded-lg transition-opacity hover:opacity-85"
        >
          <Image
            src="/assets/images/store/app-store-badge.svg"
            alt="Download on the App Store"
            width={132}
            height={44}
            className="h-full w-full object-contain"
          />
        </a>
      )}
    </div>
  );
}
