# CatchZone School HR — website implementation

Website only. The School HR application, its repository, its database, auth
and any pilot deployment are **not** part of this codebase and were not
touched. Nothing on these pages connects to them.

## Site structure (Services vs Products)

- Main navigation: **Services | Products | Work | About** + Start a Project.
  - "Products" links to `/products`; its chevron opens a compact menu
    (`src/components/navigation/ProductsMenu.tsx`) with CatchZone Voice and
    CatchZone School HR. Hover opens it for mouse users only; Escape closes and
    returns focus; it closes on outside click, focus loss and route change.
  - Mobile: Products row with an expand button (`MobileNav.tsx`), opened
    automatically on product pages.
  - Products is active on `/products`, `/voice*` and `/school-hr`.
- Product registry: `src/data/products.ts` (names, summaries, status chips).
- Footer: Services (3 categories + Complete Digital Ecosystems) · Products ·
  Company · Contact (`src/data/navigation.ts`, `Footer.tsx`).
- `/services`: the three numbered services and the separate 04 flagship are
  unchanged; a "CatchZone Products" section follows (`ProductCards.tsx`).
- `/products`: product portfolio (Voice first, School HR second).
- Homepage: unchanged except the shared navigation/footer. No School HR
  homepage feature by design.

## `/school-hr`

`src/app/school-hr/page.tsx`, components in `src/components/school-hr/`,
content in `src/data/schoolHr.ts`.

1. Hero — approved logo (theme variant), headline, status chip, CTAs,
   illustrative staff portal.
2. Workflow Studio (`WorkflowStudio.tsx`) — additional hours, leave, TOIL,
   return to work; state machine in the browser; reset/replay; screen-reader
   announcements; fictional data; **no network requests**.
3. Role perspectives (`RolePerspectives.tsx`) — WAI-ARIA tabs for Staff, Line
   Manager, Headteacher, Finance / Administration.
4. School-specific capabilities (configurable scope, not universal claims).
5. Packages (`SchoolHrPricing.tsx`) — Essentials £1,800 and Standard £3,600
   per school / year, **proposed** pilot/development prices; licence inclusions;
   separately quoted work; Essentials vs Standard comparison; optional-module
   catalogue (Planned / Requirements discussion only).
6. Module explorer (`ModuleExplorer.tsx`) — informational only; never
   activates anything.
7. Adoption (understand → configure and validate → pilot and roll out), no
   fixed timeline.
8. FAQ (native `<details>`).
9. Enquiry form (`SchoolHrEnquiryForm.tsx`) — package carried in from any
   "Discuss …" button (`HrInterestLink`, also via `?interest=`).

### Content rules (enforced in `scripts/school-hr/test-school-hr-api.mjs`)

- In development, pilot stage. Never imply commercial deployment.
- Do not name the pilot school publicly without written permission.
- No payroll engine; no claimed EPM/IRIS or other integration; finance
  exports depend on agreed requirements.
- No certifications, testimonials, customer counts, savings or time metrics.
- Optional modules are planned or for discussion; safeguarding / sensitive
  modules (absence, HR casework, SCR) carry explicit scoping cautions.
- TOIL rules are configured per school — no fixed rates.
- All people and numbers in previews are fictional.

## Enquiries

`POST /api/school-hr/enquiry` → info@catchzone.co.uk via the shared Resend
path `src/lib/email/inboxDelivery.ts` (also used by the Voice route):
`RESEND_API_KEY` only, fixed recipient, `brief@catchzone.co.uk` sender (or
`RESEND_FROM_EMAIL`), visitor Reply-To, Idempotency-Key, `cz_hp` honeypot,
5 requests / 10 min per IP. Subject:
`CatchZone School HR — Demonstration request (<package>) — <name> (<organisation>)`.
Success is only shown after Resend accepts the email; otherwise a mailto
fallback is offered. Real delivery must be verified once on the deployed site.

## Branding

See `docs/THEME_AND_BRANDING.md` → CatchZone School HR.

## Tests

- `npm test` — Voice API tests + School HR route/content tests (mocked fetch,
  no emails).
- `node scripts/school-hr/qa-browser.mjs [baseUrl] [shotsDir]` — navigation,
  all workflows, roles, explorer, pricing hand-off, form outcomes, themes,
  mobile overflow, reduced motion, axe (WCAG 2.1 AA serious/critical).
