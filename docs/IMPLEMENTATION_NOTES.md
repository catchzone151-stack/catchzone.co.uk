# CatchZone Redesign — Implementation Notes

## Architecture

The site was rebuilt from a flat static HTML site into Next.js 14
(App Router, TypeScript, Tailwind CSS). All previously existing static
content — `apps/`, `assets/`, `css/` — was moved into `public/` unchanged,
so every existing URL (e.g. `/apps/islamquest/`, `/apps/lumi/`, the ~35
placeholder exam-prep/category pages) continues to resolve exactly as
before. Nothing under `public/apps/` was rewritten; it is out of scope for
this redesign and remains reachable for continuity and existing inbound
links/App Store metadata.

New commercial site: `src/app/**`, driven by data in `src/data/**`
(`projects.ts`, `services.ts`, `project-config.ts`, `navigation.ts`) so
copy, budget ranges and roadmap categories can change without touching
component code.

## What was reused vs. rebuilt

**Reused verbatim (real CatchZone content):**
- Company details, contact email, and full Privacy Policy text
  (`src/app/privacy/page.tsx`) — carried over from the previous
  `/privacy` page with no changes to legal substance.
- IslamQuest and Lumi product descriptions, screenshots, banners, Google
  Play link and store badges.
- CatchZone logo, favicon and wordmark assets.

**Rebuilt:**
- Full information architecture, navigation, and all page copy for the new
  studio positioning (homepage, `/work`, `/services*`, `/about`,
  `/start-a-project`).
- Cinematic intro/hero (procedural Three.js — see `docs/ASSET_MANIFEST.md`
  for what's still placeholder).

## Hero (no blocking intro)

- **Final Production Pass update:** the site previously gated the homepage
  behind a several-second blocking intro sequence (`void → assembly →
  connection → transition → hero`) with a "Skip Intro" button. That has
  been removed — the hero is the entry experience now. `IntroContext.tsx`
  keeps the `IntroPhase` type and a `phase` value (always `"hero"` from
  first paint) purely because the hero's own DOM/3D entrance easing keys
  off `phase === "hero"`; nothing schedules a phase transition anymore and
  `IntroOverlay.tsx` was deleted.
- Bypassed entirely (no WebGL canvas mounted at all) when
  `prefers-reduced-motion` is set, or when the performance tier resolves
  to `safe` (see below) — the hero renders a static CSS gradient backdrop
  instead.

## Performance tiers

`src/lib/performance/usePerformanceTier.ts` classifies the device into
`high` / `balanced` / `safe` using WebGL availability, reduced-motion,
`hardwareConcurrency`, `deviceMemory`, `connection.saveData`, touch
capability, DPR and viewport width. The tier is decided once on mount (and
again if the reduced-motion preference changes) — it is deliberately not
downgraded mid-scroll, because swapping a pinned WebGL section for its
static layout would jump the page under the visitor.

- `safe` (reduced motion, no WebGL, Save-Data, ≤2 cores/≤2 GB): no canvas is
  mounted anywhere. The journey (01–04), the IslamQuest trailer (05), What
  We Build (06) and the case-study cinema each render an intentional static
  composition instead of a pinned sequence.
- `balanced`: every canvas renders at DPR ≤ 1.35; the trailer drops its
  motion echoes and ghost silhouette; the journey drops the reflective floor.
- `high`: DPR ≤ 1.75 and the full effect set.

All three homepage canvases are lazy chunks (`next/dynamic`, `ssr: false`).
The trailer and 06 canvases are only created once their section is within
one screen of the viewport. Every canvas switches `frameloop` to `never`
when its section is off-screen or the tab is hidden (`useDocumentVisible`),
and a `webglcontextlost` listener prevents an unhandled context loss from
breaking the page. Geometries, materials and cloned textures created in
code are disposed on unmount.

## Project configurator / form backend

`src/components/forms/ProjectConfigurator.tsx` implements the full 5-step
flow from the brief. It posts to `POST /api/start-a-project`
(`src/app/api/start-a-project/route.ts`).

Every genuinely accepted submission is emailed to **info@catchzone.co.uk**
through the Resend REST API (plain `fetch`, no SDK). The email is built by
`src/lib/email/projectBriefEmail.ts`: all five steps with human-readable
labels, the contact details, the description and a UK-time timestamp, as
both plain text and HTML (every value HTML-escaped).

Environment (server-only — never exposed to the client bundle):

- `RESEND_API_KEY` — **required**. If it is missing the route logs
  `[start-a-project] RESEND_API_KEY is not set …` and returns
  `503 { ok: false, reason: "unconfigured" }`.
- `RESEND_FROM_EMAIL` — optional sender, e.g.
  `CatchZone Project Brief <brief@catchzone.co.uk>` (the default). It must
  be on a domain verified in Resend, otherwise Resend rejects the send.
- The recipient is fixed in code (`PROJECT_INBOX`); `RESEND_TO_EMAIL` is no
  longer read.

Reply-To is the enquirer's validated email, so replying in the inbox goes
straight back to them. The client sends a per-attempt `submissionId`,
forwarded as Resend's `Idempotency-Key`, so a retried request can't send
the same brief twice.

The UI only shows "Brief sent" when the server answers `200 { ok: true }`,
which happens only after Resend accepts the email. Any other outcome
(not configured, Resend rejection, network/timeout, rate limit, invalid
data) shows a friendly error with a pre-filled `mailto:` fallback to
info@catchzone.co.uk. Every failure is logged server-side with a
`[start-a-project]` prefix (status and Resend error name/message, never
the API key).

**Launch checklist:** verify `catchzone.co.uk` (or the sender's
subdomain) in Resend, set `RESEND_API_KEY` (and `RESEND_FROM_EMAIL` if the
default sender isn't on the verified domain) in the deployment secrets,
redeploy, send one test brief and check the server logs for
`[start-a-project]` lines if it doesn't arrive.

**Hardening:**
- Server-side validation of every field: all five steps are required,
  option ids are checked against the real `project-config.ts` lists,
  email format is validated, single-line fields are stripped of control
  characters and every text field is length-capped — the client-side
  selection UI is not trusted.
- A hidden honeypot field (`cz_hp`, a name autofill never targets); a
  filled value is treated as a bot and reports success without sending.
- A practical in-memory per-IP rate limit (5 submissions / 10 minutes).
  This resets on redeploy and is scoped to a single Node process — correct
  for the current single-instance `next start` deployment. If CatchZone
  ever moves to a multi-instance/edge deployment, swap this for a shared
  store (e.g. Upstash Redis) rather than assuming it still holds.
- The Resend call has a 10 s timeout.

## Analytics

No analytics provider is currently installed (none existed in the
previous site). Event names to wire up once a provider is chosen:
`hero_start_project`, `service_view`, `ecosystem_node_interaction`,
`project_view`, `project_live_link`, `configurator_start`,
`configurator_step_complete`, `configurator_submit`, `contact_error`.

## Store-badge alignment fix (Final V1 visual completion pass)

`StoreBadges.tsx` previously used `items-end` on its flex row. Since the
Apple badge's column is taller than Google Play's when it carries the "iOS
coming October 2026" caption (badge + gap + caption text vs. just the badge
alone), `items-end` aligned the *columns'* bottom edges — i.e. the caption
baseline — not the two badge images, visibly misaligning the pair. Fixed by
wrapping both badges in identical `flex-col` columns with a fixed `h-11`
(44px) badge box as the first child, and switching the row to
`items-start`: both badge boxes now start at the same y position and share
the same height regardless of what (if anything) sits below, so their top
and bottom edges are pixel-identical by construction. Verified via
Playwright bounding-box measurement (both badges report the same `y` and
`height` on every route/breakpoint checked) and via screenshots.

## Legacy route redirects (Final launch-polish pass)

Three legacy static `/apps/*` landing pages now have a modern, fully-built
`/work/*` case-study page that supersedes them, so leaving both live would
create a confusing duplicate public experience (stale April-2026-era copy
sitting alongside the current site). `next.config.mjs` now issues a
permanent (308) redirect for each:

- `/apps/islamquest` (and the trailing-slash form) → `/work/islamquest`
- `/apps/lumi` (and the trailing-slash form) → `/work/lumi`
- `/apps/cscs-citb-hse` (and the trailing-slash form) → `/work/cscs`

These are checked by Next.js before `middleware.ts`'s directory-index
rewrite for `/apps/**`, so the redirect wins and the stale HTML is never
served for these three paths — no code in `public/apps/{islamquest,lumi,
cscs-citb-hse}/` needed to change. A permanent redirect (rather than
deleting the old files) preserves any inbound-link/SEO value those URLs
already had.

The other ~35 `/apps/*` exam-prep placeholder pages (asbestos-awareness,
aws-cloud-practitioner, etc.) have no `/work/*` equivalent yet and are
intentionally left untouched and reachable via `middleware.ts` as before.

The `internalUrl` "View product page" link was removed from the IslamQuest
and CSCS project data (in addition to Lumi, per the spec) because it would
now just redirect back to the very `/work/*` page the visitor is already
on — a dead, self-referential control once the legacy pages redirect away.

## Known launch prerequisites (not blocking, but real)

1. Configure `RESEND_API_KEY` / `RESEND_TO_EMAIL` (or chosen alternative)
   so the project configurator sends automatically.
2. Review `docs/ASSET_MANIFEST.md` — none of it blocks launch, but the OG
   share image should be confirmed at 1200×630 before heavy social sharing.
3. The privacy policy was updated during the V1 launch-polish pass to cover
   the website enquiry form (what's collected, why, and the Resend
   transactional email provider used to deliver it) and to correct the
   password-storage wording (Supabase hashes passwords; it does not
   "encrypt" them, a real technical distinction). It has not had a formal
   legal review.

## Dependency/security check (V1 launch-polish pass)

`npm audit` on the pre-existing lockfile showed 7 vulnerabilities (6 high,
1 critical), the critical one being in `next` itself (multiple CVEs,
including two RCE advisories). `next-14` (the npm dist-tag for the latest
14.x release) resolves to `14.2.35` — the exact version already installed
— confirming there is no newer patched 14.x release available.

**An upgrade to Next 15.5.25 was attempted** (kept React at 18.3.1
throughout — both Next 15 and Next 16's `peerDependencies` accept
`^18.2.0`, so this did not require the React 19 / `@react-three/fiber` v9
migration flagged as a risk in earlier phases). It typechecked, linted and
built cleanly, and resolved the `next`, `postcss` (Next's bundled copy) and
`sharp`/`glob` advisories. **It was reverted after live browser testing
surfaced a real, reproducible runtime error**: every route mounting an
`@react-three/fiber` canvas (the homepage hero, the 01/02/03 capability
section, every `/services/*` hero) threw an uncaught
`TypeError: Cannot read properties of undefined (reading
'ReactCurrentBatchConfig')` at `react-reconciler@0.27.0` (the exact version
`@react-three/fiber@8.18.0` pins via `react-reconciler: "^0.27.0"`) — a
bundling incompatibility between that reconciler version and Next 15's
webpack chunk-splitting, not a React-version mismatch (confirmed via
`npm ls react react-dom`: a single deduped `18.3.1` throughout the tree).
Disabling React Strict Mode did not change the result. This is a genuine
blocker specific to this codebase's R3F 8.x dependency, not evidence that
Next 15 is broadly unsafe.

**What was kept from the attempt:**
- `sharp` bumped to `^0.35.4` (resolves the sharp/libvips CVEs
  independently of the Next version).
- `next.config.mjs` now restricts `next/image` output to WebP only
  (`images.formats: ["image/webp"]`) as a targeted mitigation for the
  still-unpatched AVIF-related RCE in Next 14's Image Optimization API
  (`GHSA-2xp9-vwfh-vxw4`) — this closes that specific attack surface
  without needing the framework upgrade.
- The `work/[slug]/page.tsx` route was migrated to Next 15's async
  `params: Promise<{ slug: string }>` convention. This is harmless on
  Next 14 (`await` on a non-Promise value resolves immediately per JS
  semantics) and means one less file to touch on a future upgrade attempt.
- `npm audit fix` (non-force) applied for the `brace-expansion` DoS
  advisories.

**Residual, unresolved (genuine, not blocking site function):**
- `next@14.2.35` itself still carries its full CVE list, including two
  RCE-class advisories — one Windows-host-specific (this deployment target
  is Linux-hosted, based on the existing Node/`next start` setup, so that
  one's applicability is low) and the AVIF Image Optimization one (now
  mitigated above by disabling AVIF output).
- `eslint-config-next@14.2.35`'s own `glob`/`@next/eslint-plugin-next`
  chain carries a `glob` CLI command-injection advisory. This is a dev/lint
  tool, not shipped to production, and the vulnerable code path (`glob`'s
  own `-c/--cmd` CLI flag) is never invoked by this project's `npm run
  lint` script — real-world exploitability here is effectively nil, but the
  advisory can only be fully cleared by the same Next-major upgrade that
  breaks R3F.
- **Recommendation:** revisit the Next 15/16 upgrade once
  `@react-three/fiber` ships a v9 release built on a newer
  `react-reconciler`, or if the reconciler/bundling incompatibility is
  independently root-caused and fixed. Do not attempt it again without
  re-testing every WebGL route in a real browser (not just `tsc`/`next
  build`, which both passed cleanly despite the runtime break).

## Homepage cinematic journey (IDEA → DESIGN → BUILD → SHIP)

The homepage opens with one pinned, scroll-driven scene
(`src/components/sections/CinematicJourney.tsx`) that replaced the old
`Hero` / `SceneCanvas` / `SceneObjects` / `phaseTargets` hero and the
`SketchToBuild` section.

- **One timeline.** Motion's `useScroll` + `useSpring` produce a single
  smoothed progress value shared by the DOM captions and the R3F scene.
  Everything in the scene is a pure function of that value
  (`src/lib/three/journeyTimeline.ts`), so scrubbing backwards replays the
  build in reverse. GSAP is installed but deliberately not used, to avoid a
  second animation system.
- **Real work, not fake UI.** The screens are Brookmere Academy's
  showcase screenshots, cropped and re-encoded as WebP in
  `public/assets/images/journey/` (~120 KB total). The IDEA wireframes are
  drawn procedurally to trace those exact layouts
  (`src/lib/three/journeyScreens.ts`), and a single shader wipes each
  wireframe into its real interface during DESIGN.
- **DOM vs WebGL.** Every heading, caption and link is semantic DOM and is
  server-rendered; the canvas is `aria-hidden` and lazy-loaded, so three.js
  stays out of the homepage's first-load bundle. Keep `journeyBeats.ts`
  free of three.js imports for that reason.
- **Budget.** One WebGL context; the frame loop runs only while the section
  is on screen and the tab is visible. The reflective floor is used on the
  `high` tier only. `safe` tier (reduced motion, no WebGL, low-power
  devices) renders a static hero plus a four-stage summary instead.
- **Hand-off.** The Featured Build section ("Taken from idea to working
  software.") now follows the journey directly so SHIP settles into
  CatchZone's work.

### 06 / 07 compression

- **06 What We Build** is one pinned, scroll-driven sequence
  (`src/components/sections/WhatWeBuild.tsx`): the three capabilities hand
  over laterally while the existing `ServicesCanvas` core reconfigures for
  each, then converges into the new `ecosystem` core state
  (`src/lib/three/coreTargets.ts`) before releasing into 07. Internal
  progress reads `01 / 03` so it never competes with the page numbering.
- **07 Complete Digital Ecosystems** is a single compact row; the compact
  `EcosystemDiagram` is used at every size (no mobile accordion) and the
  three capabilities fly into its hub on first view (`converge` prop).

### IslamQuest showcase

- The eight approved screens live in `public/assets/images/islamquest/showcase/`
  (01–08). Each is the app screen extracted 1:1 from the approved Play Store
  frame (696×1480, no scaling); the frames' captions are rendered as text
  from `src/data/islamquestShowcase.ts`, which also defines the order.
- **Homepage + /work Featured Build** use `IslamQuestTrailer`
  (`src/components/work/IslamQuestTrailer.tsx`) with the R3F scene in
  `src/components/canvas/IslamQuestTrailerCanvas.tsx` and its scroll
  timeline in `src/lib/three/iqTrailerTimeline.ts`. The phone's screen
  opening is a stencil mask (drei `Mask`/`useMask`): screen planes placed
  "inside" the phone at impossible depths are only visible through the
  glass, then cross the glass plane and unmask to float larger than the
  device, and 08 flies back to lock onto the reformed phone. Beat A (fly-in)
  plays while the section scrolls into view; the rest scrubs over a short
  runway (205vh desktop, 160vh phone) with the stage drifting — the copy
  keeps scrolling, so the page never freezes.
- **Case study** keeps the detailed DOM sequence (`IslamQuestCinema`) and the
  All Screens grid in `src/components/work/IslamQuestShowcase.tsx`; no ring
  or halo, thin rim light only.
- The legacy `public/apps/islamquest/index.html` still references the old
  `*_SS.png` files, so those are kept.
