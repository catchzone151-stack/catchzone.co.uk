#!/usr/bin/env node
/**
 * Team + app-availability content tests (no network, no browser).
 * Run with: npm run test:team
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(import.meta.url);
const jiti = require("jiti")(import.meta.url, { alias: { "@": path.join(root, "src") }, interopDefault: true, cache: false });
const load = (p) => jiti(path.join(root, p));
const team = load("src/data/team.ts");
const { projects } = load("src/data/projects.ts");

const results = [];
async function test(name, fn) {
  try {
    await fn();
    results.push(true);
    console.log(`  ✓ ${name}`);
  } catch (e) {
    results.push(false);
    console.log(`  ✗ ${name}\n    ${e?.message}`);
  }
}

console.log("\nTeam profiles");

const EXPECTED = [
  ["daniel-reed", "Daniel Reed", "Lead Software Engineer", "orbital rings"],
  ["chloe", "Chloe", "Operations & Client Coordinator", "flame-like ribbons"],
  ["ahsan-hussain", "Ahsan Hussain", "Founder, Product Lead & Full-Stack Developer", "twisting helix"],
  ["maya-khan", "Maya Khan", "Product Designer", "draped forms"],
  ["oliver-bennett", "Oliver Bennett", "QA & Delivery Lead", "glass cubes"],
];

await test("exactly five profiles with the agreed names, titles and sculptures (Ahsan in the centre)", () => {
  assert.equal(team.TEAM.length, 5);
  team.TEAM.forEach((p, i) => {
    const [slug, name, role, sculpture] = EXPECTED[i];
    assert.equal(p.slug, slug);
    assert.equal(p.name, name);
    assert.equal(p.role, role);
    assert.ok(p.sculpture.includes(sculpture), `${name}: ${p.sculpture}`);
  });
  assert.equal(team.TEAM[2].founder, true);
  assert.equal(team.TEAM.filter((p) => p.founder).length, 1);
});

await test("agreed introductions for Ahsan and Chloe; four expertise areas each", () => {
  assert.match(team.TEAM[2].intro, /^Leads CatchZone’s product direction and works hands-on across software engineering, design and delivery/);
  assert.match(team.TEAM[1].intro, /^Supports client communication, project coordination and day-to-day operations/);
  for (const p of team.TEAM) assert.equal(p.expertise.length, 4, p.name);
});

await test("all 20 artwork files exist (sculpture + portrait × dark + light) at their declared sizes", () => {
  const sizeOf = (f) => {
    const b = fs.readFileSync(f);
    // WebP VP8X / VP8L / VP8 header parsing for width/height
    const fourcc = b.toString("ascii", 12, 16);
    if (fourcc === "VP8X") return [1 + b.readUIntLE(24, 3), 1 + b.readUIntLE(27, 3)];
    if (fourcc === "VP8L") {
      const v = b.readUInt32LE(21);
      return [1 + (v & 0x3fff), 1 + ((v >> 14) & 0x3fff)];
    }
    return [b.readUInt16LE(26) & 0x3fff, b.readUInt16LE(28) & 0x3fff];
  };
  let n = 0;
  for (const p of team.TEAM) for (const kind of ["sculpture", "portrait"]) for (const theme of ["dark", "light"]) {
    const f = path.join(root, "public", team.teamImage(p.slug, kind, theme));
    assert.ok(fs.existsSync(f), f);
    const [w, h] = sizeOf(f);
    const want = kind === "sculpture" ? team.SCULPTURE_SIZE : team.PORTRAIT_SIZE;
    assert.deepEqual([w, h], [want.w, want.h], `${f} is ${w}×${h}`);
    n++;
  }
  assert.equal(n, 20);
});

await test("no invented personal details (locations, employers, degrees, social links) or Person schema", () => {
  const text = JSON.stringify(team.TEAM).toLowerCase();
  for (const bad of ["east london", "linkedin", "twitter", "university", "degree", "years of experience", "formerly", "previously at"]) {
    assert.ok(!text.includes(bad), bad);
  }
  for (const f of ["src/components/team/TeamExperience.tsx", "src/components/team/TeamSection.tsx", "src/components/team/TeamPreview.tsx", "src/app/about/page.tsx"]) {
    assert.ok(!fs.readFileSync(path.join(root, f), "utf8").includes('"Person"'), f);
  }
  assert.match(team.TEAM_DISCLOSURE, /stylised chrome artwork, not photographs/);
});

console.log("\nApp availability");

const bySlug = Object.fromEntries(projects.map((p) => [p.slug, p]));
await test("IslamQuest and Rawdah Cycle: live on Google Play AND the App Store (owner-supplied URLs)", () => {
  assert.equal(bySlug.islamquest.playStoreUrl, "https://play.google.com/store/apps/details?id=com.islamquest.app");
  assert.equal(bySlug.islamquest.appStoreUrl, "https://apps.apple.com/gb/app/islamquest/id6786728172");
  assert.equal(bySlug["rawdah-cycle"].playStoreUrl, "https://play.google.com/store/apps/details?id=com.catchzone.rawdahcycle");
  assert.equal(bySlug["rawdah-cycle"].appStoreUrl, "https://apps.apple.com/us/app/rawdah-islamic-period-tracker/id6816722339");
  for (const s of ["islamquest", "rawdah-cycle"]) assert.equal(bySlug[s].statusLabel, "Live on Google Play and the App Store");
});

await test("Lumi and CSCS: Google Play only, iOS planned for December 2026, no App Store URL", () => {
  for (const s of ["lumi", "cscs"]) {
    assert.ok(bySlug[s].playStoreUrl?.startsWith("https://play.google.com/store/apps/details?id="));
    assert.equal(bySlug[s].appStoreUrl, undefined);
    assert.match(bySlug[s].statusLabel, /iOS planned for December 2026/);
  }
});

await test("no outdated 'October 2026' / 'iOS coming' wording anywhere in src", () => {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(d, e.name)) : [path.join(d, e.name)]));
  for (const f of walk(path.join(root, "src")).filter((f) => /\.(tsx?|mdx?)$/.test(f))) {
    const t = fs.readFileSync(f, "utf8");
    assert.ok(!/October 2026|iOS coming/i.test(t), path.relative(root, f));
  }
});

const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
