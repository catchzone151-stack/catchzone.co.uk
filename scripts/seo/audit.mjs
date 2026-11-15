#!/usr/bin/env node
/**
 * SEO / link audit of a running build (no external requests).
 * Crawls internal links from the homepage and sitemap.xml and reports, per
 * page: HTTP status, title, description, canonical, robots, Open Graph,
 * H1s, JSON-LD types (parsed), images without alt, and broken internal links.
 *
 *   npm run build && npm start   # in another terminal
 *   node scripts/seo/audit.mjs [baseUrl] [--json out.json]
 */
import fs from "node:fs";

const BASE = (process.argv[2] && !process.argv[2].startsWith("--") ? process.argv[2] : "http://127.0.0.1:3000").replace(/\/$/, "");
const jsonOut = process.argv.includes("--json") ? process.argv[process.argv.indexOf("--json") + 1] : null;
const SITE = "https://catchzone.co.uk";

const decode = (s) =>
  s.replace(/&amp;/g, "&").replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">");
const meta = (html, attr, name) => {
  const re = new RegExp(`<meta[^>]*${attr}="${name}"[^>]*content="([^"]*)"`, "i");
  const re2 = new RegExp(`<meta[^>]*content="([^"]*)"[^>]*${attr}="${name}"`, "i");
  return decode((html.match(re) || html.match(re2) || [])[1] ?? "");
};
const strip = (s) => decode(s.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim());

const pages = new Map();
const queue = ["/"];
const linkSources = new Map();

// Seed from sitemap
const sm = await (await fetch(`${BASE}/sitemap.xml`)).text();
const sitemapUrls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const sitemapLastmod = [...sm.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)].map((m) => m[1]);
for (const u of sitemapUrls) queue.push(u.replace(SITE, "") || "/");

while (queue.length) {
  const path = queue.shift();
  if (pages.has(path)) continue;
  const res = await fetch(BASE + path, { redirect: "manual" });
  const html = res.headers.get("content-type")?.includes("text/html") ? await res.text() : "";
  const head = html.split("</head>")[0] ?? "";
  const body = html.slice(head.length);
  const info = {
    path,
    status: res.status,
    location: res.headers.get("location"),
    title: strip((head.match(/<title>([\s\S]*?)<\/title>/i) || [])[1] ?? ""),
    description: meta(head, "name", "description"),
    canonical: (head.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/i) || [])[1] ?? "",
    robots: meta(head, "name", "robots"),
    ogTitle: meta(head, "property", "og:title"),
    ogDescription: meta(head, "property", "og:description"),
    ogImage: meta(head, "property", "og:image"),
    ogUrl: meta(head, "property", "og:url"),
    twitterCard: meta(head, "name", "twitter:card"),
    h1: [...body.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)].map((m) => strip(m[1])),
    h2count: (body.match(/<h2[\s>]/gi) || []).length,
    jsonLd: [],
    jsonLdErrors: [],
    imgNoAlt: [...body.matchAll(/<img(?![^>]*\balt=)[^>]*>/gi)].length,
    links: [],
  };
  for (const m of html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      const j = JSON.parse(m[1]);
      for (const node of Array.isArray(j) ? j : j["@graph"] ?? [j]) info.jsonLd.push(node["@type"]);
    } catch (e) {
      info.jsonLdErrors.push(String(e).slice(0, 80));
    }
  }
  for (const m of body.matchAll(/<a[^>]*href="([^"#?]*)(?:[?#][^"]*)?"/gi)) {
    let href = m[1];
    if (!href || href.startsWith("mailto:") || href.startsWith("tel:")) continue;
    if (href.startsWith(SITE)) href = href.slice(SITE.length) || "/";
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    info.links.push(href);
    if (!linkSources.has(href)) linkSources.set(href, new Set());
    linkSources.get(href).add(path);
    if (!pages.has(href) && !queue.includes(href) && !href.startsWith("/api/") && !/\.(png|jpe?g|webp|svg|ico|pdf|xml|txt)$/i.test(href)) queue.push(href);
  }
  pages.set(path, info);
}

const all = [...pages.values()].sort((a, b) => a.path.localeCompare(b.path));
const problems = [];
const dupe = (key) => {
  const seen = new Map();
  for (const p of all.filter((p) => p.status === 200 && p[key])) {
    if (seen.has(p[key])) problems.push(`duplicate ${key}: ${p.path} = ${seen.get(p[key])}`);
    else seen.set(p[key], p.path);
  }
};
dupe("title");
dupe("description");
for (const p of all) {
  if (p.status >= 400) problems.push(`HTTP ${p.status}: ${p.path} (linked from ${[...(linkSources.get(p.path) ?? [])].slice(0, 3).join(", ")})`);
  if (p.status !== 200) continue;
  const noindex = /noindex/i.test(p.robots);
  if (!noindex) {
    if (!p.title) problems.push(`missing title: ${p.path}`);
    if (!p.description) problems.push(`missing description: ${p.path}`);
    if (!p.canonical) problems.push(`missing canonical: ${p.path}`);
    else if (p.canonical !== SITE + (p.path === "/" ? "" : p.path)) problems.push(`canonical mismatch: ${p.path} → ${p.canonical}`);
    if (!p.ogImage) problems.push(`missing og:image: ${p.path}`);
    if (p.h1.length !== 1) problems.push(`H1 count ${p.h1.length}: ${p.path} ${JSON.stringify(p.h1)}`);
    if (!sitemapUrls.includes(SITE + (p.path === "/" ? "" : p.path))) problems.push(`not in sitemap: ${p.path}`);
  }
  if (p.jsonLdErrors.length) problems.push(`invalid JSON-LD: ${p.path} ${p.jsonLdErrors.join("; ")}`);
  if (p.imgNoAlt) problems.push(`${p.imgNoAlt} <img> without alt: ${p.path}`);
}
for (const u of sitemapUrls) {
  const path = u.replace(SITE, "") || "/";
  const p = pages.get(path);
  if (!u.startsWith(SITE)) problems.push(`sitemap URL not on canonical host: ${u}`);
  if (p && p.status !== 200) problems.push(`sitemap URL not 200: ${u} (${p.status})`);
  if (p && /noindex/i.test(p.robots)) problems.push(`sitemap URL is noindex: ${u}`);
}
const orphans = all.filter((p) => p.status === 200 && p.path !== "/" && !linkSources.has(p.path)).map((p) => p.path);

console.log(`Pages crawled: ${all.length} · sitemap URLs: ${sitemapUrls.length} · lastmod values: ${new Set(sitemapLastmod).size} distinct`);
for (const p of all) {
  console.log(`\n${p.status} ${p.path}${p.location ? ` → ${p.location}` : ""}`);
  if (p.status !== 200) continue;
  console.log(`  title (${p.title.length}): ${p.title}`);
  console.log(`  desc  (${p.description.length}): ${p.description}`);
  console.log(`  canonical: ${p.canonical} · robots: ${p.robots || "-"} · og:image: ${p.ogImage ? "yes" : "NO"} · twitter: ${p.twitterCard || "-"}`);
  console.log(`  H1: ${p.h1.join(" | ")} · H2s: ${p.h2count} · JSON-LD: ${p.jsonLd.join(", ") || "-"}`);
}
console.log(`\nOrphan pages (no internal links in): ${orphans.join(", ") || "none"}`);
console.log(`\nPROBLEMS (${problems.length})`);
for (const x of problems) console.log(`  ✗ ${x}`);
if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify({ pages: all, problems, orphans, sitemapUrls }, null, 2));
process.exit(problems.length ? 1 : 0);
