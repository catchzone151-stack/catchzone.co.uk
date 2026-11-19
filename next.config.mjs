import { PHASE_DEVELOPMENT_SERVER } from "next/constants.js";

/**
 * `next dev` gets its own build directory. Dev and production otherwise share
 * `.next`, and starting `next dev` clears it — so on a host where a dev server
 * runs beside `next start` (the Replit workspace runs `npm run dev`), the
 * production build is deleted from under the running server and every route
 * fails with `ENOENT: … .next/server/app/page.js`. Production keeps `.next`.
 *
 * @param {string} phase
 * @returns {import('next').NextConfig}
 */
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  // Cal.com booking popup: embed.js is loaded only when a booking button is clicked.
  "script-src 'self' 'unsafe-inline' https://app.cal.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  // CatchZone Voice demo: Soniox real-time STT/TTS (US and regional endpoints).
  "connect-src 'self' https://*.soniox.com wss://*.soniox.com https://app.cal.com",
  // Cal.com booking popup (iframe).
  "frame-src 'self' https://app.cal.com https://cal.com",
  "media-src 'self' blob: data:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const nextConfig = (phase) => ({
  distDir: phase === PHASE_DEVELOPMENT_SERVER ? ".next-dev" : ".next",
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    // Next 14.2.35 (the latest patched 14.x release) still carries an
    // unpatched AVIF-related RCE in its built-in Image Optimization API
    // (GHSA-2xp9-vwfh-vxw4) — see docs/IMPLEMENTATION_NOTES.md for why a
    // framework upgrade isn't safely available yet. Restricting next/image
    // output to WebP (no AVIF encode/decode path) closes that specific
    // attack surface without needing the framework bump.
    formats: ["image/webp"],
  },
  async redirects() {
    return [
      {
        source: "/index.html",
        destination: "/",
        permanent: true,
      },
      // Legacy static app landing pages superseded by modern /work/* case
      // studies — see docs/IMPLEMENTATION_NOTES.md "Legacy route redirects".
      // Only these three have a modern equivalent; the ~35 other /apps/*
      // exam-prep placeholder pages are left reachable (no /work page exists
      // for them yet) and are not redirected.
      { source: "/apps/islamquest", destination: "/work/islamquest", permanent: true },
      { source: "/apps/islamquest/", destination: "/work/islamquest", permanent: true },
      { source: "/apps/lumi", destination: "/work/lumi", permanent: true },
      { source: "/apps/lumi/", destination: "/work/lumi", permanent: true },
      { source: "/apps/cscs-citb-hse", destination: "/work/cscs", permanent: true },
      { source: "/apps/cscs-citb-hse/", destination: "/work/cscs", permanent: true },
      // The seven showcase systems moved from /work/concept/:slug to
      // /work/:slug. Keep old links working.
      { source: "/work/concept", destination: "/work", permanent: true },
      { source: "/work/concept/:slug", destination: "/work/:slug", permanent: true },
    ];
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Baseline security headers for every route. (HSTS is already sent by
        // the production host.) Microphone stays available to this origin
        // only, for the CatchZone Voice demo.
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Permissions-Policy", value: "camera=(), geolocation=(), payment=(), usb=(), microphone=(self)" },
          // Report-only: observes, never blocks. Violations appear in the browser
          // console; enforce only after a clean observation period (see
          // docs/SECURITY_NOTES.md). 'unsafe-inline' is required by Next's inline
          // bootstrap/RSC scripts, the no-flash theme script and JSON-LD.
          { key: "Content-Security-Policy-Report-Only", value: CSP_REPORT_ONLY },
        ],
      },
      {
        source: "/apps/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
});

export default nextConfig;
