# Pricing, Chloe and Cal.com booking

Commercial upgrade added on 19 Nov 2026. Nothing here changes the approved design,
homepage journey, themes, Voice or School HR behaviour.

## 1. Pricing — single source of truth

`src/data/pricing.ts` holds the five services, the six "Better Together" combinations and
the pricing FAQ. It feeds `/pricing`, the Services page price lines, Chloe's answers, the
Start a Project deep links and the enquiry emails, so a price changes in one place only.

Rules (owner-approved): always "From"; never a final quotation; no delivery times,
feature counts, discounts, guarantees or VAT statements; no £15,000 / £495 / £1,950
packages; no £10,000 minimum. Hosting, subscriptions, developer fees and maintenance are
clarified during quotation. Voice and School HR are not part of bespoke pricing.
`npm run test:chloe` fails if an unapproved figure or banned package appears.

### Connected enquiries

| Link | Start a Project result |
| --- | --- |
| `/start-a-project?service=premium-website` | step 1 preselected |
| `/start-a-project?service=premium-website,mobile-app` | both highlighted + "Combined build" note; the brief sends `combination` |

Step-1 ids: `premium-website`, `web-application`, `mobile-app`, `business-system`,
`complete-ecosystem`, `not-sure`. The retired `web-platform` id is still accepted by the API
(`legacyBuildTypeOptions`) so a cached old page can't fail. A combination is only kept if it
is an approved pair that includes the build type; the email subject and step-1 row then
show it. The parameter is read after hydration, so the page remains statically rendered.

## 2. Chloe — guided website assistant

- Files: `src/data/chloe.ts` (script, FAQ, keywords), `src/components/chloe/*`,
  `src/app/api/chloe/enquiry/route.ts`, `src/lib/email/chloeEnquiryEmail.ts`.
- Deterministic: buttons, prepared answers, simple keyword matching, honest fallback,
  Back / Start over. **No AI API, no chatbot platform, no storage, no cookies.** Typed
  questions never leave the browser; only a submitted enquiry is sent.
- Portrait: the existing team artwork. `public/team/chloe-avatar-{dark,light}.webp` are
  128 px head-and-shoulders crops of `chloe-portrait-{dark,light}.webp` (crop + resize only).
- Launcher: 52 px, bottom-right, safe-area aware, no auto-open/animation/badge/sound. Hidden
  on `/start-a-project` so it never covers that form. Minimise keeps the conversation for
  the visit (survives page navigation); Close ends it. Escape minimises; focus returns to
  the launcher. The panel code is downloaded only on first open.
- Phones: compact sheet that rises above the on-screen keyboard (visualViewport).
- Enquiry email → `info@catchzone.co.uk` through the shared Resend path
  (`inboxDelivery.ts`), subject `New CatchZone Enquiry — <service> — Chloe`, Reply-To the
  visitor; includes name, email, phone, service/combination, details, timescale, budget,
  source "Chloe", page and UK timestamp. No acknowledgement email is sent to visitors.
- Security: JSON-only same-origin guard, honeypot `cz_hp`, whitelisted topic / timescale /
  budget, length limits, phone pattern, CR/LF stripping, HTML escaping, Idempotency-Key,
  5 requests / 10 min / IP. Success is shown only after the server confirms Resend accepted
  the email; failures show an error with "Try again" and an email fallback.
- Uses the existing `RESEND_API_KEY` (and optional `RESEND_FROM_EMAIL`). No new secrets.

## 3. Cal.com booking (popup on click)

Booking buttons are **hidden until their event link is configured**, so no dead buttons
are ever published. Configuration is four public booking paths (not secrets), set as
environment variables in Replit and baked in at build time:

| Variable | Event type to create in Cal.com | Used by |
| --- | --- | --- |
| `NEXT_PUBLIC_CAL_INTRO_CALL` | CatchZone Introductory Call — 15 min | header (≥1280 px), mobile menu, footer, homepage final CTA, Services, Pricing hero, Chloe |
| `NEXT_PUBLIC_CAL_PROJECT_CONSULTATION` | CatchZone Project Consultation — 30 min | Start a Project, Pricing closing CTA, Chloe |
| `NEXT_PUBLIC_CAL_VOICE_DEMO` | CatchZone Voice Demonstration — 20 min | `/voice*` contact panel, Chloe |
| `NEXT_PUBLIC_CAL_SCHOOL_HR_DEMO` | CatchZone School HR Demonstration — 20 min | `/school-hr` contact panel, Chloe |

Value format: `username/event-slug` (or the full `https://cal.com/username/event-slug`).
Anything else is ignored. After setting or changing them: **rebuild and redeploy**.

How it works: `src/data/booking.ts` (config), `src/lib/booking/calEmbed.ts` (loader),
`src/components/booking/BookCallLink.tsx` (button). Cal.com's `embed.js` loads only when a
visitor clicks a booking button; the popup follows the site's light/dark theme (also when
toggled while open) with the CatchZone teal as brand colour. Every button is a real link to
the public Cal.com page, so it still works without JavaScript, with ctrl/cmd-click, or if
the embed is blocked (it then opens that page in a new tab). The report-only CSP allows
`app.cal.com` (script/connect/frame) and `cal.com` (frame).

### Owner setup checklist (Ahsan)

1. Create/sign in to the CatchZone Cal.com account **with the CatchZone business Google
   account** — not a personal one.
2. Settings → Calendars: connect that Google Calendar. Enable conflict checking on the
   calendars that should block time; set the **destination calendar** to the CatchZone
   business calendar. Visitors only ever see free/busy slots, never event details.
3. Availability: working hours (the site states Mon–Fri 09:00–18:00), time zone
   **Europe/London** (visitors see their own time zone).
4. Create the four event types above with: video location (e.g. Google Meet), buffer
   before/after (suggest 10 min), minimum notice (suggest 24 h), daily booking limit,
   booking questions (name, email, optional notes), confirmation emails, reminders
   (Workflows, where your plan allows), and rescheduling/cancellation links enabled.
5. Copy each event's path (e.g. `catchzone/intro-call`) into the four Replit variables,
   rebuild and redeploy.
6. Verify on the live site, in both themes and on a phone: slots appear; book a test slot;
   the Google Calendar entry lands in the business calendar; attendee confirmation and host
   notification arrive; reschedule and cancel from the email links; a busy calendar slot is
   not offered.

### Not verified in development

The build sandbox cannot reach cal.com, and no CatchZone event types exist yet, so the live
popup, slots, bookings, calendar entries, emails, rescheduling and cancellation are
**untested** until the checklist above is completed. Verified locally: gating (no buttons
when unconfigured), correct event per button with placeholder paths, theme hand-off code,
lazy loading (no Cal.com request on page load) and the blocked-embed fallback.

## 4. Analytics

The site has no analytics implementation, so no conversion tracking was added (no new
trackers or subscriptions). A booking click is never reported as a booking. If analytics is
added later, the natural hooks are: `BookCallLink` click, Chloe/Start a Project success
states, and Cal.com's `bookingSuccessful` embed event for confirmed bookings.

## 5. Tests

- `npm run test:chloe` — Chloe route (Resend mocked), approved prices, conversation graph,
  internal links, keyword matching, booking-link validation.
- `npm run test:forms` — now also covers the new step-1 ids, the legacy id and combinations.
