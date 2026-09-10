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
capability, DPR and viewport width. `useAdaptivePerformanceTier` layers a
runtime frame-timing watchdog on top that downgrades (never upgrades)
the tier once, with a cooldown, if sustained frame times are poor.

The intro/hero canvas is not mounted at all on the `safe` tier. `frameloop`
is switched to `never` while the tab is hidden (`useDocumentVisible`), and
a `webglcontextlost` listener prevents an unhandled context loss from
breaking the page.

## Project configurator / form backend

`src/components/forms/ProjectConfigurator.tsx` implements the full 5-step
flow from the brief. It posts to `POST /api/start-a-project`
(`src/app/api/start-a-project/route.ts`).

**No email/CRM backend is currently configured.** The API route checks for
`RESEND_API_KEY` and `RESEND_TO_EMAIL` environment variables:

- If both are set, it sends the brief via the Resend API and returns
  `{ ok: true }`.
- If not set, it returns `{ ok: false, reason: "unconfigured" }` — the UI
  does **not** show a fake success state. Instead it offers a working
  `mailto:` fallback pre-filled with the full brief, so the form is
  genuinely usable today without a backend.

**To enable automatic sending before launch:** create a Resend account (or
swap in an equivalent provider), set `RESEND_API_KEY` and
`RESEND_TO_EMAIL` (default/documented destination: `info@catchzone.co.uk`)
in the deployment environment, and redeploy — no code changes required.
This is the exact one remaining step to make the configurator send
automatically; the API key is never exposed client-side (it's read from
`process.env` inside the server-only route handler).

**Hardening already in place (Phase 3):**
- Server-side validation of every field (email format, option ids checked
  against the real `project-config.ts` lists, length caps on all text
  fields) — the client-side selection UI is not trusted.
- A hidden honeypot field (`website`); a filled value is treated as a bot
  and silently reports success without sending or logging anything real.
- A practical in-memory per-IP rate limit (5 submissions / 10 minutes).
  This resets on redeploy and is scoped to a single Node process — correct
  for the current single-instance `next start` deployment. If CatchZone
  ever moves to a multi-instance/edge deployment, swap this for a shared
  store (e.g. Upstash Redis) rather than assuming it still holds.
- Reply-To is set to the enquirer's own (validated) email so replying in
  an inbox goes straight back to them.

## Analytics

No analytics provider is currently installed (none existed in the
previous site). Event names to wire up once a provider is chosen:
`hero_start_project`, `service_view`, `ecosystem_node_interaction`,
`project_view`, `project_live_link`, `configurator_start`,
`configurator_step_complete`, `configurator_submit`, `contact_error`.

## Known launch prerequisites (not blocking, but real)

1. Configure `RESEND_API_KEY` / `RESEND_TO_EMAIL` (or chosen alternative)
   so the project configurator sends automatically.
2. Review `docs/ASSET_MANIFEST.md` — none of it blocks launch, but the OG
   share image should be confirmed at 1200×630 before heavy social sharing.
3. Legal review of the privacy policy was out of scope here — the text was
   preserved as-is from the previous site, not re-drafted or re-verified.
