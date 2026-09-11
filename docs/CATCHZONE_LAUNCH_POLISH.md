# CATCHZONE V1 — FINAL LAUNCH POLISH SPEC

## Purpose

This document is the single source of truth for the final pre-launch polish pass on the current CatchZone redesign branch.

Do **not** redesign the site from scratch. Preserve the current direction, motion language, dark/mint visual system, current routing, SEO foundation, accessibility, performance-tier logic, and working interactions unless a change below explicitly requires adjustment.

The goal is to take the current build from "very good" to a polished, credible, production-ready V1 that can be published immediately after owner review.

Do not skip sections, leave placeholder states, fabricate data, or stop after partial implementation. Complete implementation, validation, QA, and a concise final report.

Do **not** merge to `main`, create a PR, or deploy. Work only on the current Claude branch unless explicitly told otherwise.

---

## 1. Positioning guardrails

CatchZone is a **Digital Product & Engineering Studio**.

Do not add "product design" as a standalone service offering.

Primary services remain:
- Mobile & Digital Product Engineering
- Premium Web Platforms & Digital Experiences
- Custom Business Systems & Digital Infrastructure
- Complete Digital Ecosystems

Avoid language that falsely implies a large staffed agency. Remove or rewrite phrases such as:
- "the same team"
- "our team"
- "the same people"
- any wording that implies multiple departments or a large agency structure

Use calm studio language instead, e.g. "the same connected build approach", "built end-to-end by CatchZone", "one connected delivery process", etc.

Do not fabricate clients, awards, testimonials, metrics, download figures, or capabilities.

---

## 2. Four real live apps must become the core Work portfolio

The current V1 Work area should prominently and truthfully showcase these four live Android apps:

1. **IslamQuest**
   - Live on Google Play
   - iOS coming October 2026

2. **Lumi: Period Tracker**
   - Google Play: `https://play.google.com/store/apps/details?id=com.catchzone.lumi`
   - Live on Google Play
   - iOS coming October 2026

3. **Rawdah Cycle**
   - Google Play: `https://play.google.com/store/apps/details?id=com.catchzone.rawdahcycle`
   - Live on Google Play
   - iOS coming October 2026

4. **IEH: CSCS Test Prep**
   - Google Play: `https://play.google.com/store/apps/details?id=com.catchzone.cscs`
   - Live on Google Play
   - iOS coming October 2026

Use the existing verified IslamQuest Play Store URL already in the repository.

### Required status corrections

Search the entire repository and replace any stale references to:
- "April 2026"
- "coming April 2026"
- equivalent iOS-April wording

with the correct **October 2026** wording where it refers to these CatchZone apps.

Do not blindly change unrelated historical dates.

---

## 3. App screenshot/device visual system — mandatory site-wide rule

This is a major visual requirement and must not be reduced to a small cosmetic tweak.

### Core rule

Wherever real mobile-app screenshots are used as product visuals, do **not** present them as plain floating rectangles, cropped screenshots, or generic flat cards.

Instead, place the **entire screenshot inside a premium smartphone device frame** so it reads immediately as a real shipped mobile product.

This rule applies wherever appropriate across:
- Homepage featured work
- `/work`
- `/work/[slug]`
- Related Work sections
- Mobile-app service pages
- Any other prominent app showcase area using these screenshots

### Device treatment

Use a reusable device-frame component/system rather than manually rebuilding each instance.

Requirements:
- modern premium phone frame
- realistic screen clipping and rounded display corners
- subtle bezel/hardware edge detail
- screenshot remains readable and not excessively cropped
- no fake phone UI over the actual screenshot
- no huge generic black slab around a tiny screenshot
- responsive scaling at desktop/tablet/mobile
- accessible/fallback rendering when motion is reduced

### Motion treatment

The device compositions should feel alive but premium:
- staggered entrance when first entering viewport
- subtle depth/parallax
- slow idle float
- small pointer tilt on capable desktop devices
- layered Z-depth when multiple phones are shown
- settle into stable readable positions after entrance
- avoid constant distracting spinning/bouncing
- respect `prefers-reduced-motion`
- preserve current performance-tier degradation/fallback rules

The visual result should feel closer to a premium interactive studio showcase, not a flat developer portfolio.

---

## 4. Each of the four apps should have a distinct visual composition

Keep one consistent CatchZone design language, but do not copy-paste one identical device arrangement for all four apps.

Recommended direction:

### IslamQuest
- strongest flagship composition
- 4–5 real screens if available
- home screen must be the main/front/centre device
- supporting screens behind/around it
- lively but controlled depth

### Lumi
- softer, cleaner, more elegant arrangement
- use real Google Play screenshots
- 3–5 devices depending on available assets
- preserve the app's pale pink/purple visual identity

### Rawdah Cycle
- calm, refined composition
- use real Google Play screenshots
- 3–5 devices depending on available assets
- preserve the app's green/cream identity

### IEH: CSCS Test Prep
- more structured, crisp and practical composition
- use real Google Play screenshots
- 3–5 devices depending on available assets
- preserve its dark blue/light blue identity

Do not invent screens. Use real screenshots only.

If public Google Play screenshots can be safely downloaded from the supplied listing pages, save local copies in the repository and serve them locally. Do not hotlink Google/CDN image URLs in production.

If store retrieval is blocked, document exactly which local screenshot assets are still required rather than fabricating replacements.

---

## 5. Work pages for Lumi, Rawdah and CSCS

Create/upgrade proper CatchZone work pages so the four live products are treated consistently.

Required routes:
- `/work/islamquest`
- `/work/lumi`
- `/work/rawdah-cycle`
- `/work/cscs`

Each page should feel like a polished product/case-study page, using only truthful known information.

Where data exists, include:
- product name
- concise product description
- live status
- platform availability
- real screenshots in the device system above
- capabilities/features supported by repository/store data
- relevant technical highlights supported by repository data
- direct Google Play CTA
- iOS coming October 2026

Do not fabricate a business "challenge/result" story if one is not genuinely known. It is acceptable to present an internal CatchZone product as a shipped studio product rather than pretending it was external client work.

For Lumi, Rawdah and CSCS, the new `/work/...` page should be the main showcase destination. Do not depend on the old `/apps/...` page for the modern portfolio experience.

---

## 6. Store badges / CTA treatment

Replace weak text-only store links in prominent app showcase areas with proper store-badge treatment similar to a professional app product website.

Use:
- official-style Google Play badge/icon treatment for the live Android destination
- App Store badge treatment for iOS presence

For the current pre-iOS state:
- Google Play badge/button must link to the real live listing
- App Store badge may be visually present but must not imply the app is already downloadable if no live App Store URL exists
- show clear text such as **"iOS coming October 2026"** directly beneath/adjacent to the store badges

Do not create misleading live App Store links.

Use locally hosted brand assets or standards-compliant icon components already available in the project where possible.

---

## 7. Homepage Work section

Keep the homepage relatively focused.

Do not turn the homepage into the full portfolio catalogue.

Recommended hierarchy:
- IslamQuest remains the flagship featured product
- optionally show a compact teaser/strip indicating Lumi, Rawdah and CSCS are also live products
- strong CTA to **View All Work**

The full four-app presentation belongs primarily on `/work`.

Do not restore excessive blank space or giant decorative typography that overwhelms the commercial message.

---

## 8. Product Lab / Roadmap

Do not present dozens of individual "Coming Soon" cards as though they are nearly finished products.

Instead, retain the genuine wider roadmap as a restrained **Product Lab / Roadmap** section on `/work` using grouped themes/categories.

Useful existing categories may include:
- Construction & Trades
- Security Licensing
- Exam & Certification Products
- Education Products
- other genuine existing roadmap groupings found in the legacy `/apps/` content

The aim is to communicate breadth and future pipeline without making CatchZone look like it has many abandoned unfinished apps.

### VillageFront

Include **VillageFront** as a genuine **In Development** product in the Work/Product Lab area.

Use only factual repository/project information. Do not fabricate screenshots or launch dates.

It can be described at a high level as a family organisation / family admin platform if supported by existing project data, with an "In Development" status.

Do not present it as live or publicly downloadable.

---

## 9. Legacy `/apps/` content

Preserve the old `/apps/...` routes and assets so existing URLs do not disappear when the new site is deployed.

However, the new portfolio should not rely on those old pages for Lumi, Rawdah or CSCS.

### IslamQuest legacy page

Update the old IslamQuest page so any iOS "April 2026" wording becomes **October 2026**.

Do not redesign the entire legacy app ecosystem during this pass.

Keep legacy pages available for compatibility, but the modern `/work/...` routes are the primary studio-facing product pages.

---

## 10. Header / general visual system

Preserve the current improved premium capsule navigation and dark/mint direction.

Keep the sticky header.

Keep the Start a Project CTA's restrained mint breathing/glow treatment if it remains performant and accessible.

Do not over-jazz the header or turn it into a neon/sci-fi HUD.

Keep the overall dark theme, but ensure the site does not feel visually dead:
- maintain subtle star/depth atmosphere
- use product imagery/device compositions to introduce life and colour
- preserve tonal variation between sections
- avoid wall-to-wall pure black emptiness

---

## 11. Existing 01 / 02 / 03 service motion must remain and be visually complete

The homepage service sequence 01 / 02 / 03 must render correctly and retain a strong visual on **all three states**.

Do not allow state 02 or 03 artwork to disappear again.

Improve/retain the visual richness so all three feel intentional and sufficiently substantial, not merely thin line drawings.

The style may combine line-work with chunkier spatial forms/panels/device/system imagery, as long as it remains consistent with the current CatchZone visual language.

Validate these states at desktop, tablet and mobile breakpoints.

---

## 12. Existing motion/creative moments to preserve

Preserve and refine, rather than remove:
- current animated hero direction
- atmospheric stars/depth
- 01/02/03 sticky capability sequence
- compact interactive ecosystem visual
- sketch-to-build / draw-to-product transition moment
- animated 4-stage process/staircase treatment
- IslamQuest device movement

Do not reintroduce a blocking intro page. The hero is the entry experience.

---

## 13. Copy corrections

Perform a repository-wide copy audit for obvious launch mistakes.

Specifically fix:
- April 2026 -> October 2026 where it refers to iOS timing
- any remaining "same team" / large-agency implication
- any copy on web-services pages that still refers to an old separate "intro" experience that no longer exists
- stale "Coming Soon" labels on apps that are now genuinely live (Lumi, Rawdah, CSCS)
- defensive copy such as "no client logos to show yet", "not stock mockups", etc. Replace with calm positive language rather than drawing attention to what CatchZone lacks

Do not change accurate legal/company details without evidence.

Primary public contact remains:
- `info@catchzone.co.uk`

---

## 14. Project enquiry form — must be genuinely usable before launch

The website should be ready to send project enquiries automatically through Resend when deployment environment variables are present.

Use server-side environment variables only:
- `RESEND_API_KEY`
- `RESEND_TO_EMAIL=info@catchzone.co.uk`

Preferred sender identity remains a professional CatchZone domain address such as:
- `CatchZone Project Brief <brief@catchzone.co.uk>`

Use the visitor's submitted email as `Reply-To` so replying to the enquiry reaches the prospective client.

Do not expose API keys client-side.

Keep an honest mailto fallback if the backend is unavailable.

### Validation UX

Improve final-step form validation so users receive clear inline errors for required fields instead of only a generic server failure.

Keep server-side validation, sanitisation, honeypot/rate-limit protections already implemented.

---

## 15. Privacy policy update

Update the privacy policy so it accurately covers the new website enquiry/configurator flow.

It should explain, in plain language:
- what enquiry data is collected (e.g. name, email, company, optional phone, project information)
- why it is collected (responding to enquiries / project discussions)
- that the site may use a transactional email provider to deliver enquiries
- appropriate retention/use language consistent with the existing policy

Correct technically inaccurate wording such as describing passwords as "encrypted" if Supabase actually securely hashes/manages them.

Do not invent legal claims. Preserve the existing real company/legal details.

---

## 16. SEO scope for this pass

Do **not** perform a broad SEO redesign or keyword campaign in this pass.

Preserve the existing SEO foundation:
- route metadata
- canonical URLs
- Open Graph
- sitemap
- robots
- organization/schema data

Only update SEO where factual page/product changes require it, especially new live work routes/statuses.

Keep legacy `/apps/` treatment consistent with the existing migration strategy.

---

## 17. Dependency/security launch check

Before declaring launch-ready:

1. Run `npm audit` and inspect the exact vulnerabilities.
2. Do **not** blindly run `npm audit fix --force`.
3. Verify the installed Next.js/React versions and check whether a safe patched upgrade is required.
4. Apply the smallest sensible compatible security upgrade.
5. After any dependency change, rerun the complete validation suite.

Do not perform a risky major-framework migration purely for novelty if a safe patched line is available.

---

## 18. Required QA / acceptance criteria

Before completion, verify all of the following:

### Build quality
- TypeScript/typecheck clean
- lint clean
- production build clean
- no hydration errors
- no console errors on primary routes

### Navigation / routing
- every header/footer/internal button works
- every `/work/...` route resolves
- every live Google Play CTA points to the correct listing
- no dead "View product page" dependency for Lumi/Rawdah/CSCS
- old `/apps/...` URLs remain reachable where intentionally preserved

### Visual QA
Test at minimum:
- 1440 desktop
- 1024 laptop/tablet
- 768 tablet
- 430 mobile
- 390 mobile
- 360 mobile

Check:
- no horizontal overflow
- no clipped phone compositions
- screenshot/device readability
- 01/02/03 states all render
- responsive nav
- reduced-motion fallback
- ecosystem interaction
- process animation/layout
- all four app work pages

### Form QA
Test:
- required-field validation
- step navigation
- successful configured server path where test credentials/environment permit
- graceful fallback path when not configured
- Reply-To behaviour in the API implementation

### Content QA
Search repository/site for:
- `April 2026`
- stale `Coming Soon` on live apps
- `same team`
- obviously stale app statuses
- incorrect contact email
- broken store URLs

---

## 19. Final report required

When all work is complete, provide a concise final report containing:

- files/components materially changed
- the four live product pages and store-link status
- screenshots/assets successfully sourced vs anything still genuinely missing
- all copy/status corrections made
- enquiry form readiness and exact remaining deployment env vars, if any
- dependency/security changes and audit result
- typecheck/lint/build result
- responsive/interaction QA summary
- any genuine blocker that still prevents launch
- final commit SHA pushed to the current Claude branch

Do not say "launch ready" if a genuine blocker remains.

---

# EXECUTION DIRECTIVE

Read this entire specification before modifying code.

Then inspect the current branch and implement **every applicable requirement above** against the existing site.

Do not redesign from scratch.
Do not skip difficult visual work.
Do not replace requested real device compositions with flat placeholders.
Do not fabricate missing screenshots or product facts.
Do not merge, create a PR, or deploy.

Complete the full implementation, run the full QA/validation pass, fix discovered issues, commit and push to the existing Claude branch, and then return the final report.