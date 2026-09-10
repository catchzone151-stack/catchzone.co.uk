# CatchZone — Asset Manifest

This document lists every visual asset the redesign currently runs on
procedurally-generated or placeholder material, and what would need to be
produced to replace it before this is treated as final production art. The
site is fully functional without any of these — nothing here blocks launch.

Status legend: `PLACEHOLDER` (procedural / code-generated, works today) ·
`NEEDS PRODUCTION ASSET` (should be replaced before a serious marketing push).

**Phase 2 update:** the procedural device/platform geometry was substantially
upgraded (layered chassis/glass/structural-plate/camera-detail/UI-block
screen on the phone; a three-panel cascading interface architecture with a
live data-node cluster on the platform; a new five-piece "ConvergenceCore"
motif reused across the hero and the Services section). All of it is still
code-generated primitives, not modelled art — the briefs below describe
what a real modelling pass would add on top of what code can already do.

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
- **Production method:** Procedural geometry — a layered phone (structural
  plate, physical-material chassis with clearcoat, transmissive glass,
  camera detail, edge-accent lines, and a screen built from individually
  emissive "UI block" planes standing in for a status bar/cards/nav row)
  and a three-panel cascading platform (front web surface with a browser
  top bar, mid system plane, rear data plane carrying a small live node
  cluster). This deliberately avoids disguising placeholder geometry as
  finished art — no baked textures, no literal branding.
- **Generation / modelling brief (for a future upgrade):** A low-poly
  stylised phone chassis (roughly 2000–4000 tris) with real bevels and a
  proper display-cutout/camera notch, UV-unwrapped for an actual emissive
  UI texture (see ASSET-002), plus a matching "interface slab" object with
  bevelled panel edges. Export as compressed `.glb` (Draco or meshopt) under
  ~2MB combined. Keep the silhouette proportions used in `phaseTargets.ts`
  and `coreTargets.ts` so the intro choreography and Services state changes
  don't need re-tuning.
- **Status:** PLACEHOLDER — functional, intentionally abstract, meaningfully
  richer after the Phase 2 pass than a flat rectangle.

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
- **Production method:** Currently individually emissive plane primitives
  arranged as a status bar, content cards and a nav row (`UIBlocks` in
  `SceneObjects.tsx`) — an abstracted interface, not a texture.
- **Generation brief:** A stylised, non-literal abstraction of a CatchZone
  app screen (e.g. a cropped, blurred composition drawn from real IslamQuest
  screenshots) baked into a single emissive texture — real interface, not a
  fabricated dashboard.
- **Status:** PLACEHOLDER — reads as "an interface" today; a real texture
  would make it read as "CatchZone's interface".

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

## ASSET-005 — ConvergenceCore Signature Motif (Services section)

- **File name:** n/a (code-generated)
- **Target path:** `src/components/canvas/ConvergenceCore.tsx`,
  `src/lib/three/coreTargets.ts`
- **Purpose:** The five-piece modular object (phone / web / data / system /
  automation) that reconfigures as the visitor scrolls through Services —
  the site's one original spatial motif, tying the hero's assembled product
  to its deconstructed capabilities.
- **Section:** Homepage `#what-we-build`
- **Type:** 3D MODEL (currently CODE-GENERATED primitives — RoundedBox,
  cylinder stack, icosahedron + torus rings, cone chevrons)
- **Production method:** Procedural, deliberately geometric/abstract rather
  than literal icons, so it reads as one coherent object family.
- **Generation / modelling brief (for a future upgrade):** Five matching
  low-poly pieces (under 500 tris each) sharing one material language
  (the phone/web pieces already established in ASSET-001) so the whole
  cluster reads as fragments of a single manufactured product. This is a
  strong candidate for an eventual CatchZone brand mark if refined further.
- **Status:** PLACEHOLDER — the concept and choreography are real; the
  geometry itself is a first pass.

---

## ASSET-006 — IslamQuest Featured Case Study Screens

- **File name:** existing `1_SS.png`–`8_SS.png` under
  `/public/assets/images/islamquest/`
- **Target path:** `src/components/work/FeaturedProjectCard.tsx`
  (`ScreenStack`)
- **Purpose:** The cascading Z-space screen composition on the homepage and
  `/work` featured card.
- **Section:** Selected Work
- **Type:** EXISTING CATCHZONE ASSET (reused as-is)
- **Production method:** These are already professionally composed
  marketing captures (phone mockup + gradient background + caption), not
  raw device screenshots, which is why they read well stacked directly.
- **Note for future case studies:** products without pre-composed marketing
  shots will need either real device-frame photography/mockups or a
  consistent Figma/Blender device-frame template applied before they'd cascade
  as cleanly as IslamQuest's do here.
- **Status:** EXISTING CATCHZONE ASSET — no action needed for IslamQuest.

---

## ASSET-007 — Lumi / Rawdah Cycle / CSCS Google Play Listing URLs

- **Status:** RESOLVED (V1 launch-polish pass) — the real Google Play URLs
  for Lumi (`com.catchzone.lumi`), Rawdah Cycle (`com.catchzone.rawdahcycle`)
  and IEH: CSCS Test Prep (`com.catchzone.cscs`) were supplied directly in
  `docs/CATCHZONE_LAUNCH_POLISH.md` and are now wired into `projects.ts`
  and rendered as real Google Play store badges (`StoreBadges`) site-wide.
  All four flagship apps now link to their real live listing.

---

## ASSET-008 — Individual screenshots for Lumi, Rawdah Cycle, CSCS

- **Target path:** `src/data/projects.ts` (`screenshots` arrays — currently
  absent for all three)
- **Purpose:** The multi-device `ScreenCascade` treatment (the same
  staggered phone composition used for IslamQuest) needs 3–5 discrete,
  reasonably high-resolution screenshots per app.
- **What was attempted:** Google Play (`play.google.com`) is blocked by this
  environment's network egress policy (`EGRESS_BLOCKED`, confirmed via both
  `WebFetch` and a direct `curl` — gateway returns 403 to the CONNECT
  tunnel), so the real listing screenshots could not be fetched or
  downloaded during this pass.
- **What exists locally:** Only `Lumi/LumiBanner.png` — a single 1024×500px
  pre-composed marketing collage (6 phone mockups + logo tile at low
  resolution). It was considered for cropping into individual cascade tiles,
  but at that source resolution each extracted phone would be well under
  300px tall and visibly soft/pixelated once scaled into the cascade —
  worse than the current honest single-asset presentation, so it was kept
  as one image (see `BannerShowcase`) rather than chopped up. Rawdah Cycle
  and CSCS have **no** local screenshot assets at all — not the banner,
  not individual captures.
- **Current honest treatment (Final launch-polish pass):**
  - Lumi: the existing banner shown via `BannerShowcase` (pointer-tilt +
    settle-in motion instead of a flat static image), now themed with a
    rose-gold/blush device-frame accent.
  - Rawdah Cycle / CSCS: the flat brand-gradient apology panel from the
    previous pass was replaced with `BrandDeviceArt`
    (`src/components/work/BrandDeviceArt.tsx`) — a dimensional phone-chassis
    composition (real bezel/notch/ring hardware detail matching
    `ScreenCascade`, product-specific metallic accent, an abstract monogram
    glyph, and structural "interface bar" elements) plus real capability
    copy and store links. It is deliberately abstract and is never labelled
    or presented as a real screenshot.
- **Status:** NEEDS PRODUCTION ASSET — export 3–5 real screenshots per app
  (ideally 1080×1920 or the actual device resolution used for the Play
  Store listing) directly from the Play Console or the source design files
  and drop them into `public/assets/images/{lumi,rawdah-cycle,cscs}/`. Once
  present, add them to the corresponding `screenshots` array in
  `projects.ts` — the existing `ScreenCascade` device-frame system picks
  them up automatically with no other code changes, exactly as it does for
  IslamQuest.

---

## ASSET-009 — Rawdah Cycle feature/capability copy

- **Target path:** `src/data/projects.ts` (`capabilities` array — currently
  empty for `rawdah-cycle`)
- **Purpose:** Section 14 of the Final Launch Polish spec asks for "real
  feature/capability copy" on the Rawdah Cycle project page.
- **What was checked:** a repo-wide search for any existing factual
  description of what Rawdah Cycle actually does (beyond "a CatchZone
  product, live on Google Play") returned nothing — no legacy page, no prior
  spec, no data file describes its features.
- **Why nothing was added:** inventing plausible-sounding feature bullets
  would violate the standing no-fabrication rule (features are exactly the
  kind of unverifiable product claim that must never be guessed at).
- **Status:** NEEDS INPUT — supply 2–5 real Rawdah Cycle feature bullets
  (the same way Lumi's and CSCS's capability lists were sourced) and they
  can be dropped straight into `projects.ts`; no other code changes needed.

---

## ASSET-010 — The Blossom Group / FDE Fire & Security client-work visuals

- **Target path:** `src/data/clientWork.ts` (`screenshot` field — currently
  absent for both), `src/components/work/ClientWorkCard.tsx`
- **Purpose:** Section 10/11/30 of the Final Launch Polish spec require a
  "high-quality real page view from the live site" for each client-work
  laptop/browser mockup.
- **What was attempted:** the real public sites
  (`https://blossomgroup.co.uk/` and `https://fde.uk.com/`) were identified
  and confirmed with the site owner, but this environment's network egress
  proxy blocks fetching arbitrary third-party domains directly (confirmed
  `EGRESS_BLOCKED` via `WebFetch` for both), so a real screenshot could not
  be captured or downloaded in this session — the same hard constraint
  already documented for the Play Store listings in ASSET-008.
- **Current honest treatment:** `ClientWorkCard` renders a real browser-chrome
  frame (traffic-light dots + an address bar showing the real hostname) with
  an abstract brand-accent placeholder inside labelled "Site preview
  pending" instead of a fabricated screenshot. The company name, real URL,
  "CLIENT WORK" label and mandatory Blossom-before-FDE order are all in
  place; only the visual capture and a fuller factual description of the
  engagement (per section 10's "concise, factual statement about the
  website/brand experience based on the actual site") are outstanding.
- **Status:** NEEDS INPUT — the site owner is supplying a real screenshot
  and short factual description for each site directly. Once received: drop
  the image under `public/assets/images/client-work/` and set
  `screenshot` on the matching entry in `clientWork.ts`; update `summary`
  (and FDE's `secondaryStatus.description` if more detail is supplied).

---

## Notes

- All CatchZone logos, the IslamQuest banner/screenshots, and the Lumi
  banner under `/public/assets/` are real, existing production assets and
  have been reused as-is — see `docs/IMPLEMENTATION_NOTES.md` for the full
  list of what was preserved from the previous site.
- No client logos, testimonials, award badges, or fabricated statistics
  appear anywhere in the new build.
