# CatchZone — "The people behind CatchZone" team experience

- Data: `src/data/team.ts` (five profiles, alt text, CTAs, disclosure).
- Components: `src/components/team/` — `TeamExperience` (interactive cards +
  profile dialog), `TeamSection` (About page `#team`), `TeamPreview`
  (homepage, sculptures only + "Meet the Team" → `/about#team`), `TeamImage`
  (theme-matched artwork).
- Artwork: `public/team/{slug}-{sculpture|portrait}-{dark|light}.webp`.

## Artwork mapping (verified by inspecting the supplied images)

| Profile | Sculpture (supplied file → dark / light) | Portrait (supplied) |
| --- | --- | --- |
| Daniel Reed — Lead Software Engineer | interlocking orbital rings (`…PM-1` / `…PM-6`) | `Daniel_Reed_Dark/Light.png` |
| Chloe — Operations & Client Coordinator | flowing flame-like ribbons (`…PM-2` / `…PM-7`) | `Chloe_Dark/Light.png` |
| Ahsan Hussain — Founder, Product Lead & Full-Stack Developer | central twisting helix (`…PM-3` / `…PM-8`) | `Ahsan_Hussain_Dark/Light.png` |
| Maya Khan — Product Designer | folded, draped forms (`…PM-4` / `…PM-9`) | `Maya_Khan_Dark/Light.png` |
| Oliver Bennett — QA & Delivery Lead | interconnected glass cubes (`…PM-5` / `…PM-10`) | `Oliver_Bennett_Dark/Light.png` |

Processing (no regeneration): sculptures 1254² transparent PNG → 720² WebP
(alpha kept); portraits ~702×880 → centre-cropped to 690×864 WebP (removes a
3–4 px white strip on the left edge of the dark Maya artwork; all crops
identical), never upscaled. Portraits are shown at most ~420 CSS px wide, so
they stay sharp on 2× screens; larger presentation would need higher-resolution
source artwork.

## Interaction

Card select → lift, light sweep, others fade (≈220 ms) → shared-layout
expansion into the profile dialog (Motion `layoutId`, 500 ms) → sculpture
crossfades into the character with a light sweep (550 ms) → staggered profile
text. Previous / Next (and ← →), Close / "All profiles" / Escape; focus moves
into the dialog, is trapped there and returns to the originating card. Prev /
Next crossfade in place; closing on the opening profile morphs back to its card.
Theme images swap via `.theme-only-*` (instant, no flicker). Reduced motion:
layout morphs and sweeps are skipped; content simply fades.

## Content rules

No invented histories, degrees, employers, locations, social profiles,
headcounts or `Person` structured data. Daniel Reed, Maya Khan and Oliver
Bennett are disclosed on the page as CatchZone's digital specialist identities;
artwork is labelled as stylised, not photographic.

Chloe's guided-assistant avatar (`public/team/chloe-avatar-{dark,light}.webp`, 128 px) is a
head-and-shoulders crop of her approved portrait files — cropped and resized only, never
regenerated. See `docs/BOOKING_AND_CHLOE.md`.

Tests: `npm run test:team`; `node scripts/team/qa-browser.mjs`.
