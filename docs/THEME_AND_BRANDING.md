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
- `.theme-dark` re-declares the dark tokens for a subtree. It is now only
  used for device-screen artwork (`BrandDeviceArt`, `ClientWorkCard`), which
  stays dark like a real screen.
- In light mode the header is a frosted off-white bar.
- `.theme-only-dark` / `.theme-only-light` swap theme-specific images. Hidden
  variants are lazy `display:none` images, so they are not downloaded.
- Theme changes animate colours for ~0.45 s (skipped with reduced motion).
- `ThemeToggle` re-syncs `data-theme` from storage on mount, as a fallback for
  client-rendered error shells (e.g. `notFound()` in a dynamic route) where the
  inline script does not run.

### WebGL scenes (art-directed light versions)

The 3D scenes have a light version of the **same** scene: same geometry,
camera, timeline, scroll mapping and UI screenshots. Only materials, lines,
fog, floor and lighting change. There are no CSS filters or colour inversion.

- **Homepage journey** (orbit hero → Idea → Design → Build → Ship):
  `src/lib/three/journeyPalette.ts`. `JOURNEY_DARK` holds the original values
  verbatim, so dark mode renders exactly as before. `JOURNEY_LIGHT` is a pearl
  / blue-grey studio (`#ebf1f2` stage and fog, light reflection environment)
  with satin floor, brushed-steel gates, silver devices, a white ceramic
  plinth, charcoal wireframes and deeper teal lines.
- **Capability core** (homepage "What we build" and Services heroes):
  `src/lib/three/corePalette.ts` (`CORE_DARK` = original values,
  `CORE_LIGHT` = silver/satin bodies). Emissive screens and panels keep their colours.
- `useSiteTheme()` (`src/lib/theme/useSiteTheme.ts`) follows `<html data-theme>`
  with a MutationObserver, so switching theme updates the live scene without a
  reload. Materials whose blending changes are re-keyed; imperative materials
  are updated in place; wireframe textures are regenerated per palette.
- The page overlays/scrims around the journey use `rgb(var(--void-rgb) / x)`,
  so they follow the theme automatically.
- Reduced motion and no-WebGL fallbacks (`StaticJourney`, `StaticWhatWeBuild`)
  are DOM-only and use the theme tokens.

### Pull-string switch

`role="switch"` named "Light mode" (`aria-checked` = light on). Click, tap,
Enter or Space toggles it; pulling the bead down ≥16 px also toggles it
(optional, never required). 44 px wide × full header height touch target,
visible focus ring, no cord motion under `prefers-reduced-motion`.

## Company logo

Approved artwork: `Catchzone logo Dark.png` (white "Catch", for dark
backgrounds) and `Catchzone logo light.png` (dark lettering, for light
backgrounds), both with the slogan **BUILT FOR WHAT'S NEXT**. Never
regenerate, recolour, invert or re-typeset them.

The site uses **SVG masters** traced from the approved PNGs by
`scripts/brand/vectorise_logo.py` (potrace on 4× upsampled masks; each
colour element traced separately; gradient stops sampled from the artwork).
They render sharply at every size and pixel density. Re-run the script if
the source artwork is ever re-supplied:

```
python3 scripts/brand/vectorise_logo.py <folder with the approved PNGs> public/brand all
```

| Placement | Dark theme | Light theme | Notes |
| --- | --- | --- | --- |
| Desktop/tablet header (≥640 px) | `/brand/catchzone-logo-dark.svg` | `/brand/catchzone-logo-light.svg` | 58–64 px tall, no plate/tile |
| Mobile header (<640 px) | `/brand/catchzone-wordmark-dark.svg` | `/brand/catchzone-wordmark-light.svg` | compact wordmark; slogan unreadable at this size |
| Footer | `/brand/catchzone-logo-dark.svg` | `/brand/catchzone-logo-light.svg` | 280 px wide; slogan legible |
| Favicon / app icons | `/brand/catchzone-icon.svg`, `favicon.ico`, `icon-*.png`, `apple-touch-icon.png` | — | approved "Z" glyph |
| Social / schema | `/og/catchzone.png`, `/brand/catchzone-logo-schema.png` | — | rendered from the vectors |

Component: `src/components/brand/CompanyLogo.tsx` (`variant="full" | "compact"`).

## CatchZone Voice logos

Approved artwork: `CatchZone Voice Neon Wave Logo-1.png` (dark) and
`CatchZone Voice Waveform Logo-2.png` (light).

| Use | Dark theme | Light theme |
| --- | --- | --- |
| Homepage spotlight (large) | `voice/catchzone-voice-logo-dark.svg` | `voice/catchzone-voice-logo-light.svg` |
| Voice sub-navigation on `/voice`, `/voice/languages`, `/voice/business` | `voice/catchzone-voice-logo-dark.webp` | `voice/catchzone-voice-logo-light.webp` |

The "CatchZone Voice" lettering is fully vector. The neon waveform is a
photographic glow (thousands of soft, blended strands) that can't be traced
faithfully, so it is kept as a cleaned, transparent raster embedded in the SVG.
The small sub-navigation uses lighter WebP exports of the same files.
The earlier `BrandMatched` cinematic/minimal Voice files are retired.
