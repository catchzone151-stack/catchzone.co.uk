#!/usr/bin/env node
/**
 * Browser QA: team experience + final finishing touches (Voice CTA, product
 * logos, /work Live grid, app-store availability). Playwright + Chromium.
 *   npm run build && npm start
 *   node scripts/team/qa-browser.mjs [baseUrl] [screenshotDir]
 * External store pages are NOT fetched; links are checked for exact URLs.
 */
import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const axeSource = await fs.readFile(require.resolve("axe-core/axe.min.js"), "utf8");
const BASE = process.argv[2] ?? "http://127.0.0.1:3000";
const SHOTS = process.argv[3] ?? null;
const passes = [];
const findings = [];
const check = (c, m) => (c ? passes.push(m) : findings.push(m));
const shot = async (page, name, opts = {}) => {
  if (!SHOTS) return;
  await fs.mkdir(SHOTS, { recursive: true });
  try {
    await page.screenshot({ path: path.join(SHOTS, `${name}.png`), timeout: 60000, ...opts });
  } catch {}
};

const TEAM = [
  ["daniel-reed", "Daniel Reed", "Lead Software Engineer"],
  ["chloe", "Chloe", "Operations & Client Coordinator"],
  ["ahsan-hussain", "Ahsan Hussain", "Founder, Product Lead & Full-Stack Developer"],
  ["maya-khan", "Maya Khan", "Product Designer"],
  ["oliver-bennett", "Oliver Bennett", "QA & Delivery Lead"],
];

const browser = await chromium.launch();
const ctx = async (theme, viewport, extra = {}) => {
  const c = await browser.newContext({ viewport, ...extra });
  await c.addInitScript((t) => {
    try {
      if (!sessionStorage.getItem("cz-seeded")) {
        localStorage.setItem("cz-theme", t);
        sessionStorage.setItem("cz-seeded", "1");
      }
    } catch {}
  }, theme);
  return c;
};
const visibleSrc = (loc) => loc.evaluateAll((imgs) => imgs.filter((i) => getComputedStyle(i).display !== "none").map((i) => decodeURIComponent(i.currentSrc || i.src)));

for (const theme of ["dark", "light"]) {
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const tag = `${theme} @${w}`;
    const c = await ctx(theme, { width: w, height: h }, w < 600 ? { isMobile: true, hasTouch: true } : {});
    const page = await c.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e).slice(0, 120)));
    await page.addInitScript(() => {
      window.__cls = 0;
      new PerformanceObserver((l) => {
        for (const e of l.getEntries()) if (!e.hadRecentInput) window.__cls += e.value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto(`${BASE}/about#team`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1200);
    const team = page.locator("#team");
    const cards = team.locator("button[aria-haspopup=dialog]");
    check((await cards.count()) === 5, `${tag}: five profile cards`);
    const labels = await cards.evaluateAll((b) => b.map((x) => x.getAttribute("aria-label")));
    check(TEAM.every(([, n, r], i) => labels[i] === `${n}, ${r}. Open profile`), `${tag}: names and titles in order`);
    for (const [slug, name] of TEAM) {
      const src = await visibleSrc(team.getByRole("button", { name: new RegExp(`^${name},`) }).locator("img"));
      check(src.length === 1 && src[0].includes(`/team/${slug}-sculpture-${theme}.webp`), `${tag}: ${name} card shows the ${theme} sculpture`);
    }
    const geo = await page.evaluate(() => {
      const bs = [...document.querySelectorAll("#team button[aria-haspopup=dialog]")].map((b) => b.getBoundingClientRect());
      const ul = document.querySelector("#team ul").getBoundingClientRect();
      return { a: bs[2], ul, first: bs.map((r) => [r.top, r.left]) };
    });
    if (w >= 1280) check(Math.abs(geo.a.x + geo.a.width / 2 - (geo.ul.x + geo.ul.width / 2)) < 4, `${tag}: Ahsan is the centre card`);
    else check(geo.first[2][0] <= Math.min(...geo.first.map((f) => f[0])) + 1, `${tag}: Ahsan's card comes first on small screens`);
    await shot(page, `team-overview-${w}-${theme}`);

    // Open every profile and check the matching character
    for (const [slug, name, role] of TEAM) {
      await team.getByRole("button", { name: new RegExp(`^${name},`) }).click();
      const dialog = page.getByRole("dialog");
      await dialog.waitFor();
      await page.waitForTimeout(1300);
      check((await dialog.locator("h3").textContent()) === name, `${tag}: ${name} card opens ${name}'s profile`);
      check((await dialog.textContent()).includes(role), `${tag}: ${name} profile shows the title`);
      check((await dialog.locator("ul li.rounded-full").count()) === 4, `${tag}: ${name} profile shows four expertise tags`);
      const portrait = await dialog.locator("img").evaluateAll((imgs) =>
        imgs.filter((i) => getComputedStyle(i).display !== "none" && i.src.includes("portrait")).map((i) => [decodeURIComponent(i.currentSrc), i.naturalWidth, getComputedStyle(i.parentElement).opacity]),
      );
      check(portrait.length === 1 && portrait[0][0].includes(`/team/${slug}-portrait-${theme}.webp`) && portrait[0][1] > 0 && +portrait[0][2] > 0.95, `${tag}: ${name} reveals the matching ${theme} chrome character ${JSON.stringify(portrait)}`);
      if (slug === "ahsan-hussain" || slug === "maya-khan") await shot(page, `team-${slug}-${w}-${theme}`);
      check(await page.evaluate(() => !!document.activeElement?.closest("[role=dialog]")), `${tag}: focus moves into ${name}'s profile`);
      await dialog.getByRole("button", { name: "Close profile" }).click();
      await page.waitForTimeout(600);
      check((await page.getByRole("dialog").count()) === 0, `${tag}: ${name} profile closes`);
      check((await page.evaluate(() => document.activeElement?.getAttribute("aria-label"))) === `${name}, ${role}. Open profile`, `${tag}: focus returns to ${name}'s card`);
    }

    // Previous / Next / keyboard / Escape / focus trap
    await team.getByRole("button", { name: /^Ahsan Hussain,/ }).click();
    const dialog = page.getByRole("dialog");
    await dialog.waitFor();
    await page.waitForTimeout(900);
    const title = async () => (await dialog.locator("h3").textContent()) ?? "";
    await dialog.getByRole("button", { name: "Next" }).click();
    await page.waitForTimeout(500);
    const t1 = await title();
    await dialog.getByRole("button", { name: "Next" }).click();
    await page.waitForTimeout(500);
    const t2 = await title();
    await dialog.getByRole("button", { name: "Next" }).click();
    await page.waitForTimeout(500);
    const t3 = await title();
    await dialog.getByRole("button", { name: "Previous" }).click();
    await page.waitForTimeout(500);
    const t4 = await title();
    check([t1, t2, t3, t4].join("|") === "Maya Khan|Oliver Bennett|Daniel Reed|Oliver Bennett", `${tag}: Next/Previous cycle and wrap (${[t1, t2, t3, t4].join(" → ")})`);
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(500);
    check((await title()) === "Daniel Reed", `${tag}: ArrowRight moves to the next profile`);
    const portraitAfterNav = await dialog.locator("img").evaluateAll((imgs) => imgs.filter((i) => getComputedStyle(i).display !== "none" && i.src.includes("portrait")).map((i) => i.getBoundingClientRect().width));
    check(portraitAfterNav[0] > 150, `${tag}: portrait stays in the panel after navigating (${portraitAfterNav[0]}px)`);
    for (let i = 0; i < 14; i++) await page.keyboard.press("Tab");
    check(await page.evaluate(() => !!document.activeElement?.closest("[role=dialog]")), `${tag}: Tab focus is trapped in the profile`);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);
    check((await page.getByRole("dialog").count()) === 0, `${tag}: Escape closes the profile`);
    check((await page.evaluate(() => document.body.style.overflow)) === "", `${tag}: page scroll unlocked after closing`);

    // Keyboard-only open
    await team.getByRole("button", { name: /^Chloe,/ }).focus();
    await page.keyboard.press("Enter");
    await page.getByRole("dialog").waitFor();
    check((await page.getByRole("dialog").locator("h3").textContent()) === "Chloe", `${tag}: keyboard Enter opens a profile`);
    await page.waitForTimeout(900);
    await page.addScriptTag({ content: axeSource });
    const v = await page.evaluate(async () =>
      // eslint-disable-next-line no-undef
      (await axe.run(document.querySelector("[role=dialog]"), { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } })).violations
        .filter((x) => x.impact === "serious" || x.impact === "critical")
        .map((x) => `${x.id}: ${x.nodes[0]?.html.slice(0, 80)}`),
    );
    check(v.length === 0, `${tag}: open profile has no serious/critical axe violations ${v.join(" | ")}`);
    await page.keyboard.press("Escape");
    await page.waitForTimeout(500);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(overflow <= 0, `${tag}: /about has no horizontal overflow (${overflow}px)`);
    const cls = await page.evaluate(() => window.__cls);
    check(cls < 0.1, `${tag}: /about cumulative layout shift ${cls.toFixed(3)} (< 0.1)`);
    check(errors.length === 0, `${tag}: no page errors on /about ${errors.join(" | ")}`);

    // Homepage preview + Voice CTA
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    const preview = page.locator("section[aria-labelledby=team-preview-title]");
    await preview.scrollIntoViewIfNeeded();
    await page.waitForTimeout(1200);
    const prevSrc = await visibleSrc(preview.locator("img"));
    check(prevSrc.length === 5 && TEAM.every(([slug], i) => prevSrc[i].includes(`/team/${slug}-sculpture-${theme}.webp`)), `${tag}: homepage preview shows the five ${theme} sculptures`);
    check((await page.locator('img[src*="-portrait-"]').count()) === 0, `${tag}: no character portraits on the homepage`);
    check((await preview.getByRole("heading").textContent()) === "The People Behind CatchZone", `${tag}: homepage preview headline`);
    await shot(page, `home-team-preview-${w}-${theme}`);
    const cta = page.locator("section#work a[data-demo-state]");
    check((await cta.textContent()).includes("Book a Demonstration") && (await cta.getAttribute("href")) === "/voice#voice-contact", `${tag}: homepage Voice CTA is 'Book a Demonstration' → /voice#voice-contact while the demo is paused`);
    await preview.getByRole("link", { name: /Meet the Team/ }).click();
    await page.waitForURL("**/about#team");
    await page.waitForTimeout(800);
    const teamTop = await page.evaluate(() => document.getElementById("team").getBoundingClientRect().top);
    check(teamTop < 200, `${tag}: 'Meet the Team' lands on the About team section (top ${Math.round(teamTop)}px)`);
    await c.close();
  }
}

/* Reduced motion: profile opens immediately, character visible */
{
  const c = await browser.newContext({ viewport: { width: 1280, height: 860 }, reducedMotion: "reduce" });
  const page = await c.newPage();
  await page.goto(`${BASE}/about#team`, { waitUntil: "networkidle" });
  await page.locator("#team").getByRole("button", { name: /^Maya Khan,/ }).click();
  await page.getByRole("dialog").waitFor({ timeout: 400 });
  await page.waitForTimeout(450);
  const op = await page.getByRole("dialog").locator('img[src*="portrait"]').first().evaluate((i) => getComputedStyle(i.parentElement).opacity);
  check(+op > 0.9, `reduced motion: profile opens immediately and shows the character (opacity ${op})`);
  check((await page.evaluate(() => getComputedStyle(document.querySelector(".team-orbit"), "::before").animationName)) === "none", "reduced motion: orbital animation is off");
  await c.close();
}

/* Theme switch swaps the artwork immediately */
{
  const c = await ctx("dark", { width: 1440, height: 900 });
  const page = await c.newPage();
  await page.goto(`${BASE}/about#team`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.getByRole("switch", { name: /light mode/i }).first().click();
  await page.waitForTimeout(200);
  const src = await visibleSrc(page.locator("#team").getByRole("button", { name: /^Oliver Bennett,/ }).locator("img"));
  check(src[0]?.includes("oliver-bennett-sculpture-light"), `theme switch: sculptures change to the light artwork immediately (${src[0]})`);
  await page.reload({ waitUntil: "networkidle" });
  const src2 = await visibleSrc(page.locator("#team").getByRole("button", { name: /^Oliver Bennett,/ }).locator("img"));
  check(src2[0]?.includes("oliver-bennett-sculpture-light"), "theme switch: light artwork persists after refresh");
  await c.close();
}

/* Voice CTA switches only when the SERVER reports the demo ready */
{
  const c = await browser.newContext({ viewport: { width: 1280, height: 860 } });
  const page = await c.newPage();
  await page.route("**/api/voice/status", (r) => r.fulfill({ status: 200, contentType: "application/json", body: '{"available":true,"trialSeconds":60}' }));
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  const cta = page.locator("section#work a[data-demo-state]");
  await page.waitForTimeout(600);
  check((await cta.textContent()).includes("Try the live demo") && (await cta.getAttribute("href")) === "/voice#studio", "Voice CTA: switches to live wording only when /api/voice/status reports available");
  await page.unroute("**/api/voice/status");
  await page.goto(`${BASE}/voice#voice-contact`, { waitUntil: "networkidle" });
  check(await page.locator("#voice-contact form").isVisible(), "Voice CTA destination: the Voice enquiry form exists at /voice#voice-contact");
  check(await page.getByText("Live demo paused").first().isVisible(), "Voice demo stays in its paused state (real server)");
  // logos
  const voiceLogo = await page.locator("main section img[alt='CatchZone Voice']").evaluateAll((imgs) => imgs.filter((i) => getComputedStyle(i).display !== "none").map((i) => i.getBoundingClientRect().width));
  check(voiceLogo.length === 1 && voiceLogo[0] >= 180 && voiceLogo[0] <= 230, `Voice wordmark sits in the hero at ${Math.round(voiceLogo[0])}px wide`);
  check((await page.locator("nav[aria-label='CatchZone Voice'] img").count()) === 0 && (await page.getByRole("link", { name: "CatchZone Voice" }).first().isVisible()), "Voice sub-navigation has no competing logo; links kept");
  await page.goto(`${BASE}/school-hr`, { waitUntil: "networkidle" });
  const hrLogo = await page.locator("section[aria-labelledby=hr-hero-title] img[alt='CatchZone School HR']").evaluateAll((imgs) => imgs.filter((i) => getComputedStyle(i).display !== "none").map((i) => i.getBoundingClientRect().width));
  check(hrLogo.length === 1 && hrLogo[0] >= 160 && hrLogo[0] <= 210, `School HR hero logo reduced to ${Math.round(hrLogo[0])}px wide`);
  await c.close();
}

/* /work Live grid, store links and case studies */
for (const theme of ["dark", "light"]) {
  for (const w of [1440, 390]) {
    const c = await ctx(theme, { width: w, height: 900 });
    const page = await c.newPage();
    await page.goto(`${BASE}/work`, { waitUntil: "networkidle" });
    const grid = page.locator("h2:text-is('Live') + div");
    const titles = await grid.locator("h3").allTextContents();
    check(titles.join("|") === "Lumi|IEH: CSCS Test Prep|Rawdah Cycle|IslamQuest", `${theme} @${w}: Live order ${titles.join(", ")}`);
    check(!(await page.locator("main").textContent()).includes("Featured Build"), `${theme} @${w}: no IslamQuest featured hero on /work`);
    check((await page.getByRole("heading", { name: "VillageFront" }).count()) === 1, `${theme} @${w}: VillageFront card kept`);
    const ext = await grid.locator("a[target=_blank]").evaluateAll((as) => as.map((a) => [a.getAttribute("aria-label"), a.href, a.rel]));
    const want = [
      ["Get Lumi on Google Play (opens in a new tab)", "https://play.google.com/store/apps/details?id=com.catchzone.lumi"],
      ["Get IEH: CSCS Test Prep on Google Play (opens in a new tab)", "https://play.google.com/store/apps/details?id=com.catchzone.cscs"],
      ["Get Rawdah Cycle on Google Play (opens in a new tab)", "https://play.google.com/store/apps/details?id=com.catchzone.rawdahcycle"],
      ["Get Rawdah Cycle on the App Store (opens in a new tab)", "https://apps.apple.com/us/app/rawdah-islamic-period-tracker/id6816722339"],
      ["Get IslamQuest on Google Play (opens in a new tab)", "https://play.google.com/store/apps/details?id=com.islamquest.app"],
      ["Get IslamQuest on the App Store (opens in a new tab)", "https://apps.apple.com/gb/app/islamquest/id6786728172"],
    ];
    check(JSON.stringify(ext.map(([l, h]) => [l, h])) === JSON.stringify(want) && ext.every(([, , r]) => r.includes("noreferrer")), `${theme} @${w}: Work card store links exact (Lumi/CSCS Play only)`);
    await grid.getByRole("link", { name: /IslamQuest/ }).first().click();
    await page.waitForURL("**/work/islamquest");
    check(true, `${theme} @${w}: IslamQuest card opens /work/islamquest`);
    const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
    check(ov <= 0, `${theme} @${w}: IslamQuest case study has no horizontal overflow`);
    for (const [slug, both] of [["islamquest", true], ["rawdah-cycle", true], ["lumi", false], ["cscs", false]]) {
      await page.goto(`${BASE}/work/${slug}`, { waitUntil: "networkidle" });
      const links = await page.locator("main a[target=_blank]").evaluateAll((as) => as.map((a) => a.href).filter((h) => /play\.google|apps\.apple/.test(h)));
      const text = await page.locator("main").textContent();
      check(
        both ? links.some((h) => h.includes("apps.apple.com")) && links.some((h) => h.includes("play.google.com")) : links.every((h) => h.includes("play.google.com")) && /iOS planned for December 2026/i.test(text),
        `${theme} @${w}: /work/${slug} availability (${both ? "Google Play + App Store" : "Google Play, iOS planned for December 2026"})`,
      );
    }
    if (w === 1440) {
      await page.goto(`${BASE}/work`, { waitUntil: "networkidle" });
      await grid.scrollIntoViewIfNeeded();
      await page.waitForTimeout(900);
      await grid.screenshot({ path: SHOTS ? path.join(SHOTS, `work-live-${theme}.png`) : "/dev/null" }).catch(() => {});
    }
    await c.close();
  }
}

await browser.close();
console.log(passes.map((p) => `  ✓ ${p}`).join("\n"));
console.log(`\nFINDINGS (${findings.length})`);
for (const f of findings) console.log(`  ✗ ${f}`);
process.exit(findings.length ? 1 : 0);
