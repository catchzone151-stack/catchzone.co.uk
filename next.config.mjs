/** @type {import('next').NextConfig} */
const nextConfig = {
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
};

export default nextConfig;
