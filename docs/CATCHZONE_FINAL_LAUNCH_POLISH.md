# CatchZone — FINAL V1 Visual Completion Pass

## Authority

This file is the authoritative brief for the final visual/content completion pass before launch review.

The current CatchZone direction is approved: premium dark theme, mint/cyan accents, atmospheric depth, stars/particles, sticky capsule navigation, motion-led hero, rich 01/02/03 service visuals, and the current overall information architecture.

**Do not redesign the site again. Do not remove good existing work. This pass is targeted completion and polish.**

The goal is that after this pass the owner can review the site and, if happy, move directly to technical launch tasks rather than another visual rebuild.

---

# P0 — NON-NEGOTIABLE: STORE BADGES MUST FINALLY ALIGN

This has been raised repeatedly and is still visibly wrong.

The Google Play badge and Apple App Store badge are currently not aligned cleanly on the homepage/featured work, Work page and project pages. **Do not mark this task complete unless the badges are visibly level in screenshots.**

Create/fix ONE shared store-badge component and use it everywhere. No page-specific badge sizing.

Required behaviour:

- Google Play and App Store badges sit in one clean badge row.
- Their **rendered badge rectangles must have the same visual height**.
- Their top and bottom edges must line up.
- Use fixed/equal badge containers (for example one shared 40–44px visual height) with `object-fit: contain`; do not let intrinsic asset dimensions create different heights.
- Use a consistent horizontal gap.
- The badges must not be vertically displaced by the iOS availability copy.
- Put `iOS coming October 2026` on a second line associated with the Apple badge, while reserving layout space so it does not push the Apple badge itself out of alignment.
- On narrow mobile widths the pair may wrap/stack deliberately, but it must still look designed rather than accidental.
- `View Case Study` is a separate CTA and must not be allowed to disturb the alignment of the store-badge pair.
- Where Google Play is live, its badge is a real link to the correct listing.
- Apple remains visually present but not falsely linked if the App Store listing is not live yet.

Apply this shared system with **no exceptions** to:

1. homepage IslamQuest featured build
2. `/work`
3. `/work/islamquest`
4. `/work/lumi`
5. `/work/cscs`
6. `/work/rawdah-cycle`
7. related-work/project components that show store badges
8. any other modern CatchZone route/component where these badges appear

QA requirement: provide desktop + mobile screenshots proving the badge pair is level on at least the homepage and two project pages. Do not rely on CSS inspection only.

---

# 1. Attached asset package — USE IT

The owner will attach **six real visual assets** with the Claude Code prompt that references this file.

Client-work mapping is exact:

- `1.png` = **FDE Fire & Security homepage** — PRIMARY FDE website screen
- `2.png` = **FDE Fire & Security supporting page/section** — SECONDARY FDE visual
- `3.png` = **The Blossom Group homepage** — PRIMARY Blossom website screen
- `4.png` = **The Blossom Group supporting About/content screen** — SECONDARY Blossom visual
- supplied purple/blue image clearly labelled **IEH: CSCS TEST PREP** = real IEH showcase artwork
- supplied green image clearly labelled **Rawdah Cycle** = real Rawdah showcase artwork

Do not ask to fetch those pages again if the six attachments are present. Ingest/copy the supplied assets into sensible `public/assets/...` locations and reference the local files.

Do not leave `SITE PREVIEW PENDING`, generic fake screens, apology panels or abstract placeholders where one of these supplied assets should now be used.

---

# 2. Universal app/device visual language

Keep the current premium device direction, but use real supplied/real local artwork wherever available.

Phone/device treatment should feel like manufactured hardware, not a thin 1px rounded border:

- visible chassis thickness
- believable bezel/glass separation
- restrained metallic highlight
- subtle depth/shadow/reflection
- notch/dynamic-island/camera detail where appropriate
- product-specific accent without turning devices into colourful toys

Approved accent family:

- IslamQuest: graphite + muted warm gold
- Lumi: graphite + restrained rose-gold/blush
- IEH: graphite/steel + cool navy/electric blue
- Rawdah Cycle: graphite/deep green + subdued champagne/warm-metal
- VillageFront: dark neutral + restrained iris/mint accent

**Do not double-frame a marketing banner that already contains device mockups.** Composite banner artwork may be presented as a premium hero panel with depth. Individual raw screenshots should use the premium phone chassis.

Use the system consistently across homepage, Work, project pages, service-related work, related work and future gallery components.

---

# 3. Scroll-entry motion — apps and client work

Add purposeful one-time entrance choreography. This is wanted.

Desired sequence:

`enters viewport -> 1–2 second premium reveal/assembly -> settles -> only tiny hover/pointer response afterwards`

Do not create endless spinning/bobbing sections.

For app/device compositions:

- screens/devices can arrive from subtly different depth/angle/offset positions
- stagger by a few hundred milliseconds
- settle into the approved final composition
- short light sweep/reflection may pass once
- desktop hover may add tiny perspective/parallax response

Product character:

- IslamQuest: slightly stronger layered device assembly, warm-gold edge response
- Lumi: softer blush/rose-gold reveal
- IEH: cool steel/blue reveal with short controlled illumination
- Rawdah: calmer green/champagne reveal

For client-work compositions:

- screen/device scene assembles once as the user reaches it
- primary screen arrives first, secondary visual follows
- optional subtle brand-colour light sweep, then stop

Mobile/tablet:

- simplify choreography substantially
- no excessive 3D rotation
- no off-screen overflow
- maintain readability/performance
- `prefers-reduced-motion` must get an immediate/static or very reduced transition

---

# 4. IEH: CSCS Test Prep — replace generic phone art

The supplied **IEH: CSCS TEST PREP** artwork must now be used as the real visual source.

Do not leave the current generic outline/monogram `BrandDeviceArt` as the main IEH image.

Use the supplied artwork:

- in the `/work` Live card
- on `/work/cscs`
- anywhere else the IEH project needs a main visual

It can be presented in a premium panel/device composition with subtle depth and one-time entrance motion, but **do not fabricate extra UI screens**.

Keep its real Google Play link and aligned App Store treatment.

The page must contain useful truthful capabilities/description content already supported by the repo/project data. Do not leave apology copy about screenshots not being published.

---

# 5. Rawdah Cycle — replace generic phone art

The supplied green **Rawdah Cycle** artwork must now be used as the real visual source.

Do not leave the current generic outline/monogram `BrandDeviceArt` as the main Rawdah image.

Use it:

- in the `/work` Live card
- on `/work/rawdah-cycle`
- anywhere else the Rawdah project needs a main visual

Premium depth and one-time entrance motion are welcome. Do not invent additional app screens.

Keep the real Google Play link and the universal aligned Apple treatment.

Use truthful Rawdah capabilities from existing project knowledge/repository content where available. If copy is genuinely absent, use only conservative verified product facts; do not invent metrics or claims.

---

# 6. Lumi

Lumi remains LIVE on Google Play.

Keep/use its real existing visual asset. Improve its presentation through restrained depth/lighting/entrance if useful.

Do not bring back `View product page` on the modern Lumi case-study page.

Keep:

- direct Google Play badge/link
- aligned App Store badge
- `iOS coming October 2026`
- useful capabilities/features
- clean CTA to Start a Project where appropriate

Do not wrap the whole existing composite Lumi marketing banner inside another fake phone.

---

# 7. IslamQuest

Keep IslamQuest as the flagship CatchZone product and keep the current overall composition.

The existing real screenshots/device composition is strong; polish rather than redesign it.

Requirements:

- individual screen presentations should feel like real premium phones, not boards
- one-time staggered entrance/assembly is desired
- subtle graphite/gold chassis/reflection
- keep screenshots truthful
- keep `View Case Study`
- Google Play + Apple pair MUST use the P0 universal aligned badge system
- all iOS wording is `October 2026`

Do not reintroduce the stale legacy product-page experience.

---

# 8. Work page — Live products

Keep the four live products clearly represented:

1. IslamQuest
2. Lumi
3. IEH: CSCS Test Prep
4. Rawdah Cycle

The three secondary Live cards must not feel dead.

- Lumi uses its real asset.
- IEH uses the supplied IEH artwork.
- Rawdah uses the supplied Rawdah artwork.
- use premium entry motion but keep the page scannable
- no fake screenshots
- do not return to flat text-only placeholders

---

# 9. Client Work — real assets, premium scenes

Keep the Work-page order exactly:

1. **The Blossom Group**
2. **FDE Fire & Security**

Both are CLIENT WORK. Do not describe either as a CatchZone-owned product.

Remove repeated `CLIENT WORK` labels within each individual card if the section heading already establishes the category; avoid visual repetition.

## Blossom composition

Use `3.png` as the PRIMARY/homepage screen.
Use `4.png` as the SECONDARY support screen.

Preferred visual direction:

- elegant premium laptop as the hero hardware
- warm, sophisticated champagne/gold/cream reflections taken from the Blossom brand
- primary laptop display shows `3.png`
- secondary `4.png` appears as a smaller companion browser/display surface beside or behind it
- do **not** force a desktop screenshot into a fake portrait phone if that makes the page unreadable/untruthful
- subtle grounded shadow/desk-light impression is fine, but do not turn it into cheesy stock-product photography
- 1–2 second entrance: laptop/device settles in, secondary view glides into place, soft warm light/reflection passes once, then stops
- tiny pointer depth on desktop after settlement is fine

Use concise factual copy only.
`View project` may open `https://blossomgroup.co.uk`.

## FDE composition

Use `1.png` as the PRIMARY/homepage screen.
Use `2.png` as the SECONDARY support screen.

Preferred visual direction:

- darker graphite/technical workstation or premium laptop treatment, visually distinct from Blossom
- restrained FDE red accent/edge trace and dark navy/graphite materials
- primary display shows `1.png`
- secondary screen/browser layer uses `2.png`
- short one-time assembly + red edge/light trace, then settle
- tiny pointer depth after settlement is fine

Use concise factual copy only.
`View project` may open `https://fde.uk.com`.

Do not show the screenshots as raw rectangles floating on black. The hardware/environment should frame them as finished client work.

---

# 10. FDE operations/job-management platform

Do not forget this continuation of the FDE client relationship.

It is **in development**, not delivered.

Best placement:

- a compact secondary module attached to the FDE Work/project story and/or In Development section
- **not** a major homepage showcase

Use truthful wording such as an operational/job-management platform currently in development.

Do not fabricate app screens. If no real UI screenshots are available, use an abstract premium workflow/system visual only.

---

# 11. VillageFront

Keep VillageFront under In Development.

- no fake store availability
- no invented launch date
- no fake screenshots
- premium intentional visual treatment
- should not look like an abandoned placeholder

---

# 12. Homepage scope

Do not add Blossom/FDE as large new homepage case studies in this pass. The homepage already has enough content.

Homepage proof remains:

- one strong IslamQuest flagship
- compact secondary proof/links where already present
- route visitors to Work for deeper portfolio/client proof

Keep the existing hero, service 01/02/03 visuals, sketch-to-build idea, ecosystem, stages/process and overall dark/mint direction unless fixing a genuine bug.

Do not add `Product Design` as a CatchZone service.

---

# 13. Avoid dead space / preserve rhythm

Review large viewport-height gaps throughout the modern site.

Keep premium breathing room, but remove accidental dead vertical territory.

Desired rhythm:

`message -> visual moment -> breathing room -> next story`

not

`message -> huge black gap -> next section`

Do not compress everything into a cramped grid; just remove obviously unintentional emptiness.

---

# 14. Accuracy / dates / links

Site-wide:

- IslamQuest = live on Google Play
- Lumi = live on Google Play
- IEH: CSCS Test Prep = live on Google Play
- Rawdah Cycle = live on Google Play
- all four: iOS coming **October 2026**
- remove any remaining `April 2026` references
- preserve direct real Google Play URLs already in project data
- preserve legacy redirects already implemented
- no dead buttons / `#` links / localhost links

---

# 15. Responsive QA is mandatory

Preserve and re-test:

- 1440
- 1280
- 1024
- 768
- 430
- 390
- 360

No horizontal overflow.
No sticky nav overlap.
No device art clipped accidentally.
No text hidden behind the header.
No store-badge misalignment.
No client screenshot cropped beyond usefulness.

Test desktop and mobile interactions, not just static render.

---

# 16. Scope guard: do NOT do technical migration in this pass

Do not perform the separate Next.js/dependency/security migration work in this visual pass.

Specifically:

- do not run `npm audit fix --force`
- do not force a major Next.js/React migration
- do not merge/deploy/publish

That is a separate final technical-launch step after visual approval.

---

# 17. Definition of DONE

Do **not** say complete until all of the following are true:

- [ ] Google Play + Apple badges are visibly level everywhere, proven by screenshots
- [ ] supplied IEH artwork is actually used; generic IEH placeholder art is gone from main presentation
- [ ] supplied Rawdah artwork is actually used; generic Rawdah placeholder art is gone from main presentation
- [ ] Lumi remains real/polished with no modern `View product page` button
- [ ] IslamQuest remains strong and uses premium device treatment
- [ ] 3.png is the primary Blossom homepage screen; 4.png is secondary
- [ ] 1.png is the primary FDE homepage screen; 2.png is secondary
- [ ] Blossom comes before FDE
- [ ] both client projects are presented in finished dimensional hardware/browser scenes, not `SITE PREVIEW PENDING`
- [ ] one-time entrance motion exists for major app/client visuals and settles after entry
- [ ] FDE platform is honestly represented as in development without fake screenshots
- [ ] VillageFront remains intentional and in development
- [ ] April 2026 is gone; October 2026 is consistent
- [ ] no dead/placeholder/apology panels remain where supplied assets solve them
- [ ] desktop/tablet/mobile responsive QA passes
- [ ] typecheck, lint and production build pass
- [ ] link/button audit passes

After implementation, give a concise final report containing:

1. exact files changed
2. asset paths created and which attachment maps to each path
3. exact shared component used for store badges and confirmation of rendered equal height
4. where each of the six supplied images is used
5. motion/entry changes
6. responsive QA results
7. typecheck/lint/build results
8. remaining blockers, if any
9. final commit SHA

Commit and push only to `claude/catchzone-redesign-uht3tr` unless explicitly told otherwise. Do not create a PR, merge or deploy.
