# CatchZone website — security notes (16 Nov 2026 finalisation pass)

## Headers (next.config.mjs)

`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
`X-Frame-Options: SAMEORIGIN`, `Permissions-Policy` (camera, geolocation, payment,
usb off; microphone same-origin only for the Voice demo), `poweredByHeader: false`.
HSTS (`max-age=63072000; includeSubDomains`) is sent by the production host.

### Content-Security-Policy — report-only

`Content-Security-Policy-Report-Only` observes and never blocks. It was verified with
zero violations across every sitemap route, the noindex Product Lab pages and the 404,
in both themes, at 1440 px and 390 px, including the WebGL journey and the Team
dialog (a deliberate test violation was detected, so the check is live).

Policy: `default-src 'self'`; scripts and styles `'self' 'unsafe-inline'` (Next's
inline bootstrap/RSC payload, the no-flash theme script and JSON-LD need it — a
nonce-based policy would require dynamic rendering of every page and is not worth
losing static prerendering); images `'self' data: blob:`; fonts `'self' data:`;
`connect-src 'self' https://*.soniox.com wss://*.soniox.com` (Voice demo only);
media/worker `'self' blob:`; `object-src 'none'`; `base-uri`, `form-action`,
`frame-ancestors 'self'`.

There is deliberately no reporting endpoint (no new public endpoint to abuse or
log). To observe in production: open DevTools → Console on the live site and look
for `[Report Only]` messages while using the site (and, once enabled, the Voice
demo). **To enforce** after a clean observation period, rename the header key to
`Content-Security-Policy` in `next.config.mjs`, rebuild and re-run
`node scripts/site/qa-site.mjs` plus a manual Voice demo check. Do not enforce
before the Voice demo has been exercised against the policy.

## Dependencies (`npm audit`, 16 Nov 2026)

| Finding | Severity | Status |
| --- | --- | --- |
| `postcss` < 8.5.23 nested in `next@15.5.29` (pinned 8.4.31): GHSA-qx2v-qp2m-jg93, GHSA-6g55-p6wh-862q, GHSA-fxqj-rqcc-2cmp, GHSA-r28c-9q8g-f849 | High | **Fixed** via `overrides.next.postcss = ^8.5.33` (now 8.5.33). Compiled CSS byte-identical before/after. Exploitation also required attacker-controlled CSS at build time. `npm audit fix --force` (Next 16 major) was **not** used. |
| `minimatch` 7–11.0.0 via `@typescript-eslint/*` (from `eslint-config-next`) | Moderate ×6 | **Deferred** — development/lint tooling only, never shipped to the server bundle or browser; the latest typescript-eslint 8.x still depends on minimatch 10, and `npm audit fix` makes no change. Clears when the lint toolchain moves to a release using minimatch ≥ 11.0.1. |

Re-check with `npm audit` after every dependency change. When Next is upgraded,
remove the `overrides` block if the new Next already ships PostCSS ≥ 8.5.23.

## Node runtime (recommendation — production configuration, needs owner approval)

`.replit` declares `modules = ["nodejs-20"]`. Node.js 20 reached end-of-life on
30 April 2026 (no further security releases). `camera-controls@3.1.2` (via
`@react-three/drei`) declares `engines.node >= 22`; it works today but that
combination is unsupported. Local builds and all tests in this pass ran on
Node 22.23.4.

Recommended change, in the Replit workspace (not made in this branch because it
alters the production runtime): set `modules = ["nodejs-22"]` in `.replit` (or
Node 24 if offered), run `npm ci && npm run build && npm start` in the workspace,
smoke-test, then redeploy. Rollback: revert the one line and redeploy.

## Forms

All four enquiry routes (Start a Project, Voice, School HR, Careers) share:
JSON-only + same-origin guard (`formRequestGuard`), hidden honeypot `cz_hp`,
strict field whitelisting/length limits, CR/LF stripping for header-bound values,
HTML escaping in email bodies, a fixed recipient (`info@catchzone.co.uk`),
`Reply-To` set to the enquirer, an optional validated `RESEND_FROM_EMAIL`
override, `Idempotency-Key` from a client submission id, a 10 s Resend timeout,
generic error reasons (no key or provider detail returned), and a per-IP
sliding-window rate limit using the right-most `X-Forwarded-For` entry.

Limitation: rate limits are in-memory per instance, so on Replit Autoscale each
instance counts separately and limits reset on scale-down. Adequate for current
volume; a shared store (e.g. Upstash Redis) would be needed for a hard global cap.

Mocked tests (no email is sent): `npm test` — Voice 38, School HR 16, Careers 14,
Team/content 7, Start a Project 9.
