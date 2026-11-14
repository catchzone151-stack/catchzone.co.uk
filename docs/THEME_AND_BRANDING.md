# CatchZone — Themes and Branding

## Themes

- **Dark is the default** and is the original site design. Dark token values
  are identical to the pre-theme palette, so dark mode renders as before.
- **Light mode** is opt-in via the pull-string switch in the header
  (`src/components/navigation/ThemeToggle.tsx`). The choice is stored in
  `localStorage` under `cz-theme` and synced across open tabs.
- **No flash:** a tiny inline script in `<head>` (`src/app/layout.tsx`) sets
  `data-theme` on `<html>` before first paint. Dark is used whenever the stored
  value isn't `"light"` (including when storage is unavailable).

### How it works

- Colour tokens are CSS variables in `src/app/globals.css`
  (`--void-rgb`, `--surface-rgb`, `--ink-rgb`, `--tint-rgb`, `--accent-*-rgb`, …).
  `[data-theme="light"]` swaps them; Tailwind colours (`void`, `surface`,
  `ink`, `line`, `accent`, and `white` — used for hairlines/frosted fills)
  read the variables, so existing classes adapt automatically.
- `light:` Tailwind variant (`[data-theme="light"] &`) for the few light-only
  adjustments. Dark classes are never changed.
- `.theme-dark` re-declares the dark tokens for a subtree. Used for the
  WebGL/cinematic sections, which are art-directed for a dark stage:
  - homepage `CinematicJourney` (orbit hero + Idea → Design → Build → Ship) — unchanged;
  - homepage `WhatWeBuild` (pinned WebGL capability core);
  - Services heroes (`ServiceHero`, WebGL core);
  - device-screen artwork (`BrandDeviceArt`, `ClientWorkCard`).
  In light mode a `.theme-seam` adds a soft dusk gradient between those dark
  stages and the light page (it renders nothing in dark mode).
- In light mode the header is always a frosted off-white bar so the nav is
  legible over the dark hero.
- `.theme-only-dark` / `.theme-only-light` swap theme-specific images. Hidden
  variants are lazy `display:none` images, so they are not downloaded.
- Theme changes animate colours for ~0.45 s (skipped with reduced motion).

### Pull-string switch

`role="switch"` named "Light mode" (`aria-checked` = light on). Click, tap,
Enter or Space toggles it; pulling the bead down ≥16 px also toggles it
(optional, never required). 44 px wide × full header height touch target,
visible focus ring, no cord motion under `prefers-reduced-motion`.

## Company logo

Approved file: *CatchZone Neon Orbital Logo* (white lettering, neon orbit,
slogan **BUILT FOR WHAT'S NEXT**). Never regenerate, recolour, invert or
re-typeset it.

| Placement | Asset | Notes |
| --- | --- | --- |
| Desktop/tablet header (≥640 px) | `/brand/catchzone-logo.webp` | 60–68 px tall |
| Mobile header (<640 px) | `/brand/catchzone-wordmark.webp` | lettering crop; slogan too small to read at this size |
| Footer | `/brand/catchzone-logo.webp` | 280 px wide; slogan legible |
| Light mode (all of the above) | same artwork on `.logo-plate` | dark brand plate behind the unchanged logo |
| Favicon / app icons | `/brand/favicon.ico`, `icon-*.png`, `apple-touch-icon.png` | approved "Z" glyph on near-black |
| Social / schema | `/og/catchzone.png`, `/brand/catchzone-logo-schema.png` | logo on dark |

## CatchZone Voice logos

| Use | Dark theme | Light theme |
| --- | --- | --- |
| Large showcase (homepage spotlight) | Cinematic Dark | Cinematic Light |
| Voice sub-navigation | Minimal Dark | Minimal Light |

Files: `public/brand/voice/catchzone-voice-{cinematic,minimal}-{dark,light}.webp`.
