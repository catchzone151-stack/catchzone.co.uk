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
  async headers() {
    return [
      {
        source: "/apps/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex" }],
      },
    ];
  },
});

export default nextConfig;
