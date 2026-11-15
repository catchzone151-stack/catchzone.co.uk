# CatchZone — SEO, Performance & Release-Readiness Report (final review pass)

Branch: `claude/catchzone-final-release-review` (from `claude/catchzone-products-school-hr` @ `c0318b7`).
Evidence: a local production build (`next build && next start`), crawled and tested with
`scripts/seo/audit.mjs`, `scripts/site/qa-site.mjs`, the School HR / Voice browser suites and
Lighthouse 12.6.1. Labels: **Verified** = tested here · **Inferred** = reasoned from code/docs ·
**Production** = needs the deployed site or Google Search Console.

## A. Initial findings (before this pass)

Already correct (Verified): unique titles on the Voice/School HR/Products pages; canonical on
every page; robots.txt (`/apps/`, `/api/` disallowed + sitemap); `/apps/*` sends
`X-Robots-Tag: noindex`; legacy redirects (`/index.html`, `/apps/islamquest|lumi|cscs…`,
`/work/concept/*`) are 308; trailing slashes 308 to the slash-less URL; 404s return HTTP 404;
one H1 per page; no `<img>` without `alt`; Organization JSON-LD; no broken internal links; no
orphan pages; CLS 0.

Broken / needed improvement:
- **Social metadata bug (Verified):** every page that didn't define its own `openGraph`
  (Services, service pages, About, Work, all case studies, Start a Project, Privacy) inherited the
  homepage's `og:title`, `og:url` and Twitter title — shares showed the homepage title/link.
- **Sitemap `lastmod`** was the build time for every URL (all identical, changing every deploy).
- Generic titles ("Services", "Work", "About") with little search intent; `/services` H1
  "Capabilities".
- 8 thin Product Lab concept pages (`/work/product-lab/*`) indexable but absent from the sitemap.
- `/voice` description promised a public live demo (the demo is fail-closed until activated);
  `/school-hr` description said "In development".
- No structured data for School HR or the three service pages; no WebSite node.
- No branded 404 page (Next's default).

## B. Implemented improvements

- `src/lib/seo.ts` `pageMetadata()` — every page now has its own title, description,
  canonical, `og:title/description/url/image`, `og:locale en_GB` and Twitter card.
- Titles/descriptions rewritten per the keyword map (section C) — unique, no stuffing, no
  availability/certification claims.
- `/services` H1 → "Software development services" (same typography).
- Sitemap: per-route `lastmod` from the git history of each page's content (5 distinct dates);
  `/careers` added; Product Lab pages excluded and set to `noindex, follow` (still reachable).
- Structured data: `WebSite` (site name) + `Organization` (`legalName`, `@id`) site-wide;
  `Service` on `/services/apps|web|systems`; `SoftwareApplication` for CatchZone School HR
  (two `Offer`s matching the visible £1,800 / £3,600 prices; **no ratings or reviews**);
  BreadcrumbList on `/careers`. **No `JobPosting`** anywhere. All JSON-LD is serialised via
  `jsonLd()` (escapes `<`) and parses cleanly (Verified by the crawler).
- Internal links: About → Voice, School HR, Careers; `/services/systems` → School HR; footer
  Company → Careers; Careers → Work/Services/Products.
- Branded `src/app/not-found.tsx` (still HTTP 404; Next adds `noindex`).
- Social: existing `/og/catchzone.png` and `/og/catchzone-voice.png` reused (no new graphics).

## C. Keyword-to-page map (primary intent · supporting terms)

| Page | Primary search intent | Supporting terms |
| --- | --- | --- |
| `/` | bespoke software development company (brand) | digital products, apps, business systems |
| `/services` | software development services | apps, web platforms, business systems, digital ecosystems |
| `/services/apps` | mobile app development | iOS/Android, PWA, SaaS platforms, digital product development |
| `/services/web` | website & web platform development | bespoke websites, custom web application development |
| `/services/systems` | custom business systems / workflow automation | bespoke business software, client portals, admin systems |
| `/products` | CatchZone software products | voice translation, school HR software |
| `/voice` | real-time AI voice translation | two-way speech translation, live captions |
| `/voice/business` | real-time translation for contact centres | multilingual customer service software, AI call translation |
| `/voice/languages` | supported translation languages | language list |
| `/school-hr` | school HR software | staff self-service for schools, leave, TOIL, overtime/additional-hours claims, staff approval workflows |
| `/work` | software case studies (portfolio) | business systems, platforms, apps |
| `/careers` | careers at CatchZone (brand) | software engineering, QA |

Research basis: live UK SERPs for "school HR software … leave absence TOIL" (incumbents:
IRIS Every HR, Access Education HR, WhosOff, Activ People HR, Ciphr), "real-time voice
translation for call centres" (Zendesk, 8×8, Avaya, Sanas, DeepL…) and "bespoke software
development company UK" (Goodcore, Codevate, Magora, Teamseven…). These confirm buyer intent and
vocabulary; **no search-volume or difficulty data was available, and none is claimed**. The broad
head terms are dominated by established vendors, so the realistic opportunities are the specific
intents above (e.g. TOIL / additional-hours approvals for schools; translation for contact
centres) rather than "HR software" or "software development".

To avoid cannibalisation: `/voice` targets the product, `/voice/business` the contact-centre use
case; `/services` targets the category, each service page its discipline; School HR lives only on
`/school-hr` (not on `/services/systems`, which links to it).

## D. Technical SEO status

| Area | Status |
| --- | --- |
| Canonicals | Verified — every indexable page self-canonical on `https://catchzone.co.uk` |
| Sitemap | Verified — 27 canonical URLs, all 200, none noindex, accurate lastmod |
| Robots | Verified — allow `/`, disallow `/apps/`, `/api/`; sitemap declared |
| Metadata | Verified — unique titles/descriptions on all 27 indexable pages; correct og:url |
| Structured data | Verified — parses; types listed above; rich-result eligibility **Production** (Rich Results Test needs the public URL) |
| Redirects | Verified — legacy + trailing-slash 308s; HTTP→HTTPS is handled by the host (**Production**) |
| Indexing | Product Lab + `/apps/*` noindex; everything else indexable — live index status **Production** (Search Console) |
| Internal links / broken links | Verified — 0 broken, 0 orphans (crawler) |
| **www host** | **Verified broken on production:** `https://www.catchzone.co.uk` returns **HTTP 525** from Cloudflare (TLS handshake to origin fails). The apex works and sends HSTS with `includeSubDomains`. See F. |

Google guidance applied (Search Central documentation; the pages could not be re-fetched from
this environment): unique, descriptive `<title>`s and meta descriptions; `lastmod` only when
consistently accurate (Google ignores `priority`/`changefreq`); structured data must match
visible content and does not guarantee rich results.

## E. Performance (measured — no fabricated comparisons)

- Real-browser (Playwright, 390 px, 4× CPU + ~9 Mbps / 150 ms network), production build:
  LCP 0.53–0.97 s, CLS 0 on `/`, `/services`, `/products`, `/voice`, `/careers`, `/school-hr`.
  Long tasks under 4× CPU throttling: ~120–220 ms total per page.
- Lighthouse 12.6.1 mobile (simulated throttling) in this sandbox: Accessibility 100,
  Best Practices 100, SEO 100 on `/`, `/services`, `/school-hr`, `/careers`; Performance 55–64
  with TBT 3–8 s. The TBT figures were **not reproducible** with real throttling (above) and
  varied widely between runs because of CPU contention in this container, so they are reported
  but not relied on. Use PageSpeed Insights / CrUX after deployment for real numbers.
- First-load JS 103–176 KB per route; three.js is code-split to the homepage scene only.
- Fix applied: `/school-hr`'s LCP element (the hero product logo) was lazy-loaded → the
  default-theme (dark) variant now loads eagerly with `fetchpriority="high"`; the hidden light
  variant stays lazy. No other proven bottleneck was found; the cinematic homepage was not
  altered.

## E2. Accessibility (WCAG 2.2 AA practical target)

Verified with axe-core (wcag2a/aa, 21aa, 22aa; serious + critical) on all 27 indexable
routes in both themes, after scroll-reveal fades complete: **0 violations**. Owner-approved
minimal fixes: dark faint grey `#747d8c → #7e8694`; violet text variant `#8076e8` on dark
(decorative violet unchanged); showcase case-study accent text adjusted per theme only where
it failed (e.g. light `#5b9bd5 → #416e97`, dark `#2856d8 → #5f81e2`; decorative uses
unchanged); light-mode teal `#0d8076 → #0b7067`; breadcrumb/inline links subtly underlined
(WCAG 1.4.1). Lighthouse Accessibility 100 on the pages measured. Keyboard, focus, reduced
motion, no horizontal overflow at 360–1920 px and no theme flash are covered by
`scripts/site/qa-site.mjs` (106/106).

## F. Outstanding external actions (need deployment or account access)

1. **Fix `www.catchzone.co.uk` (HTTP 525).** In Cloudflare either add a Redirect Rule
   `www.catchzone.co.uk/*` → `https://catchzone.co.uk/$1` (301, proxied record), or set the
   `www` record to DNS-only and add `www` as a custom domain on the Replit deployment so it gets a
   certificate. Not changed here (no DNS/hosting changes without approval).
2. Verify the domain property in Google Search Console; submit `https://catchzone.co.uk/sitemap.xml`.
3. Inspect key URLs live (URL Inspection) after deployment; run the Rich Results Test on
   `/school-hr`, `/voice`, `/services/*`.
4. Send one approved real test through each form (Start a Project, Voice, School HR, Careers) and
   confirm inbox receipt at info@catchzone.co.uk (provider acceptance ≠ inbox delivery).
5. Monitor Core Web Vitals (CrUX / Search Console) for 28 days after release.
6. Optional: a Content-Security-Policy (needs nonce/hash work for Next's inline scripts) and a
   dedicated social image for `/school-hr`.
