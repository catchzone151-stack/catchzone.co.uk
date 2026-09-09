# CatchZone — Asset Manifest

This document lists every visual asset the redesign currently runs on
procedurally-generated or placeholder material, and what would need to be
produced to replace it before this is treated as final production art. The
site is fully functional without any of these — nothing here blocks launch.

Status legend: `PLACEHOLDER` (procedural / code-generated, works today) ·
`NEEDS PRODUCTION ASSET` (should be replaced before a serious marketing push).

---

## ASSET-001 — Intro/Hero 3D Device Assembly

- **File name:** n/a (code-generated)
- **Target path:** `src/components/canvas/SceneObjects.tsx`
- **Purpose:** The "phone" and "platform" objects that assemble during the
  cinematic intro and persist as the hero backdrop.
- **Section:** Homepage intro / hero
- **Type:** 3D MODEL (currently CODE-GENERATED primitives)
- **Format:** Three.js `RoundedBox` / `PlaneGeometry` primitives
- **Target dimensions:** N/A (procedural, responsive to viewport)
- **Target file size:** N/A — zero asset weight by design
- **Transparency:** Yes (glass/screen materials use transparency)
- **Duration if video:** N/A
- **Loop requirement:** Continuous idle motion in the hero state
- **Desktop version:** Full particle count, full camera choreography
- **Mobile version:** Reduced particle count, shorter camera travel
- **Production method:** Currently procedural geometry (RoundedBox slabs,
  plane "screens", a wireframe overlay, and a point-cloud particle field).
  This deliberately avoids disguising placeholder geometry as finished art —
  materials are flat and abstract rather than a literal phone render.
- **Generation / modelling brief (for a future upgrade):** A low-poly
  stylised phone chassis (roughly 1000–3000 tris) and a flat "interface
  slab" object, both UV-unwrapped for a simple emissive screen texture,
  exported as compressed `.glb` (Draco or meshopt compression) under
  ~1.5MB combined. Should keep the same silhouette proportions used in
  `phaseTargets.ts` so the intro choreography doesn't need re-tuning.
- **Status:** PLACEHOLDER — functional, intentionally abstract.

---

## ASSET-002 — Hero / Intro Screen Content

- **File name:** n/a
- **Target path:** Texture applied to the "screen" mesh in `PhoneAssembly`
- **Purpose:** Represent "the interface is connected to something bigger"
  during the Activation phase, per the master brief.
- **Section:** Homepage intro
- **Type:** TEXTURE / UI SCREENSHOT
- **Format:** WebP or compressed PNG, ideally with alpha
- **Target dimensions:** 512×1024 (portrait, matches phone screen aspect)
- **Target file size:** Under 150KB
- **Transparency:** Optional
- **Production method:** Currently a flat emissive colour (no texture).
- **Generation brief:** A stylised, non-literal abstraction of a CatchZone
  app screen (e.g. a cropped, blurred composition drawn from real IslamQuest
  screenshots) — real interface, not a fabricated dashboard.
- **Status:** PLACEHOLDER.

---

## ASSET-003 — Open Graph / Social Share Image

- **File name:** `CatchZone Wording.png` (existing asset, reused)
- **Target path:** `/public/assets/images/CatchZone/CatchZone Wording.png`
- **Purpose:** `og:image` / Twitter card image site-wide.
- **Section:** SEO / social sharing
- **Type:** EXISTING CATCHZONE ASSET (reused as-is)
- **Format:** PNG
- **Target dimensions:** Recommended 1200×630 — the existing file has not
  been confirmed at that exact ratio.
- **Production method:** Reused existing brand asset.
- **Status:** NEEDS PRODUCTION ASSET — confirm/crop to 1200×630 for
  correct social-card rendering across platforms.

---

## ASSET-004 — Case Study / Project Hero Video

- **File name:** n/a
- **Target path:** `public/video/`
- **Purpose:** An optional short demo clip for the IslamQuest case study
  (the current page still shows a "demo coming soon" placeholder on the
  legacy `/apps/islamquest/` page).
- **Section:** `/work/islamquest`
- **Type:** VIDEO
- **Format:** MP4 (H.264) + WebM, muted, loop
- **Target dimensions:** 1920×1080 or portrait 1080×1920 depending on the
  final capture
- **Target file size:** Under 4MB for a 10–15s loop
- **Duration if video:** 10–20 seconds
- **Loop requirement:** Yes, seamless
- **Production method:** Real screen capture from the shipped app.
- **Status:** NEEDS PRODUCTION ASSET — not fabricated; simply not yet
  captured. Omitted from the site until it exists.

---

## Notes

- All CatchZone logos, the IslamQuest banner/screenshots, and the Lumi
  banner under `/public/assets/` are real, existing production assets and
  have been reused as-is — see `docs/IMPLEMENTATION_NOTES.md` for the full
  list of what was preserved from the previous site.
- No client logos, testimonials, award badges, or fabricated statistics
  appear anywhere in the new build.
