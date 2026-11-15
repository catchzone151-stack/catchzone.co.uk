# CatchZone — Careers page

`/careers` (`src/app/careers/page.tsx`, `src/components/careers/*`, content in
`src/data/careers.ts`). Linked discreetly from the footer (Company), not the
main navigation.

- Two **role profiles** — Full-Stack Software Engineer and Software Quality
  Assurance Engineer — describing the disciplines behind CatchZone's work.
  They are **not** live vacancies: no salaries, vacancy references, start or
  closing dates, job counts, `JobPosting` structured data or job-board feeds.
- Role details are expandable (button + `aria-expanded`); collapsed content
  stays in the HTML (inert while closed) so it remains crawlable.
- "Register your interest" form → `POST /api/careers/interest` → the shared
  Resend path (`src/lib/email/inboxDelivery.ts`) → info@catchzone.co.uk with
  subject `CatchZone Careers — Expression of interest (<area>) — <name>`,
  visitor Reply-To, honeypot, rate limit and cross-site guard. Fields: area,
  name, email, optional http(s) profile link, message. **No CV uploads**;
  nothing is stored by the website. The page and privacy policy state that
  registering interest doesn't mean a vacancy exists.
- Tests: `npm run test:careers`; browser checks in `scripts/site/qa-site.mjs`.
