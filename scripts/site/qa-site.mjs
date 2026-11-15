#!/usr/bin/env node
/**
 * Site-wide browser QA (Playwright + Chromium, not a project dependency).
 *   npm run build && npm start   # in another terminal (no RESEND_API_KEY, so nothing is emailed)
 *   node scripts/site/qa-site.mjs [baseUrl] [screenshotDir]
 *
 * - every indexable route (from sitemap.xml) + /careers + a 404, both themes,
 *   6 widths: HTTP 200, no horizontal overflow, no page errors, correct theme,
 *   correct company-logo variant, no theme flash before hydration;
 * - axe WCAG 2.x A/AA serious+critical on every route in both themes;
 * - Careers role accordions + interest form states (real server = honest
 *   "not sent"; mocked success / failure);
 * - real browser POSTs to every form endpoint are NOT blocked by the
 *   cross-site guard (they reach validation / delivery);
 * - screenshots for the owner review.
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
const WIDTHS = [360, 390, 768, 1024, 1440, 1920];

const notVerified = [];
const knownIssues = [];
async function shot(page, name, opts = {}) {
  if (!SHOTS) return;
  await fs.mkdir(SHOTS, { recursive: true });
  try {
    await page.screenshot({ path: path.join(SHOTS, `${name}.png`), timeout: 60000, ...opts });
  } catch (e) {
    // A slow software-rendered capture must not discard the test results.
    notVerified.push(`screenshot ${name}: ${String(e).split("\n")[0].slice(0, 80)}`);
  }
}
async function revealAll(page) {
  await page.evaluate(async () => {
    const w = (ms) => new Promise((r) => setTimeout(r, ms));
    for (let y = 0; y <= document.documentElement.scrollHeight; y += 600) {
      window.scrollTo({ top: y, behavior: "instant" });
      await w(250);
    }
  });
  // Let scroll-reveal fades finish, so contrast is measured on final colours.
  await page.waitForTimeout(1500);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
}

const sm = await (await fetch(`${BASE}/sitemap.xml`)).text();
const routes = [...new Set([...sm.matchAll(/<loc>https:\/\/catchzone\.co\.uk([^<]*)<\/loc>/g)].map((m) => m[1] || "/"))];
check(routes.includes("/careers"), `sitemap lists ${routes.length} routes incl. /careers`);

const browser = await chromium.launch({ args: ["--use-gl=angle", "--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });

async function ctx(theme, viewport, extra = {}) {
  const c = await browser.newContext({ viewport, ...extra });
  await c.addInitScript((t) => {
    try {
      localStorage.setItem("cz-theme", t);
    } catch {}
  }, theme);
  return c;
}

/* ---- Layout / theme sweep ---- */
for (const theme of ["dark", "light"]) {
  for (const width of WIDTHS) {
    const c = await ctx(theme, { width, height: width < 800 ? 844 : 900 });
    const page = await c.newPage();
    const errs = [];
    page.on("pageerror", (e) => errs.push(String(e).slice(0, 120)));
    const bad = [];
    for (const r of [...routes, "/this-page-does-not-exist"]) {
      const res = await page.goto(BASE + r, { waitUntil: "domcontentloaded" });
      const expected = r === "/this-page-does-not-exist" ? 404 : 200;
      if (res.status() !== expected) bad.push(`${r} HTTP ${res.status()}`);
      await page.waitForTimeout(r === "/" ? 900 : 250);
      const info = await page.evaluate(() => {
        const vis = [...document.querySelectorAll("header img")].filter((i) => getComputedStyle(i).display !== "none");
        return {
          overflow: document.documentElement.scrollWidth - window.innerWidth,
          theme: document.documentElement.dataset.theme,
          logo: vis.map((i) => i.getAttribute("src")).join(" "),
        };
      });
      if (info.overflow > 1) bad.push(`${r} overflows by ${info.overflow}px`);
      if (info.theme !== theme) bad.push(`${r} theme=${info.theme}`);
      if (!info.logo.includes(`-${theme}.svg`)) bad.push(`${r} header logo ${info.logo}`);
    }
    check(bad.length === 0, `${theme} @${width}px: ${routes.length + 1} routes — status, no overflow, theme and logo correct ${bad.join("; ")}`);
    check(errs.length === 0, `${theme} @${width}px: no page errors ${errs.slice(0, 2).join(" | ")}`);
    await c.close();
  }
}

/* ---- No theme flash: data-theme is set before any rendering ---- */
{
  const c = await ctx("light", { width: 1280, height: 800 });
  const page = await c.newPage();
  await page.route("**/*.js", (r) => r.abort()); // no hydration at all
  await page.goto(BASE + "/services", { waitUntil: "domcontentloaded" });
  const t = await page.evaluate(() => [document.documentElement.dataset.theme, getComputedStyle(document.body).backgroundColor]);
  check(t[0] === "light" && t[1] === "rgb(247, 248, 246)", `no theme flash: light applied before hydration (${t.join(", ")})`);
  await c.close();
}

/* ---- axe on every route, both themes ---- */
for (const theme of ["dark", "light"]) {
  const c = await ctx(theme, { width: 1280, height: 900 }, { reducedMotion: "reduce" });
  const page = await c.newPage();
  for (const r of routes) {
    await page.goto(BASE + r, { waitUntil: "networkidle" });
    await revealAll(page);
    await page.addScriptTag({ content: axeSource });
    const v = await page.evaluate(async () =>
      // eslint-disable-next-line no-undef
      (await axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"] } })).violations
        .filter((x) => x.impact === "serious" || x.impact === "critical")
        .map((x) => ({ id: x.id, nodes: x.nodes.map((n) => n.html.slice(0, 90)) })),
    );
    // No exemptions: every serious/critical violation is a finding.
    const isKnown = () => false;
    const real = v.map((x) => ({ ...x, nodes: x.nodes.filter((h) => !isKnown(x.id, h)) })).filter((x) => x.nodes.length);
    const known = v.reduce((n, x) => n + x.nodes.length, 0) - real.reduce((n, x) => n + x.nodes.length, 0);
    if (known) knownIssues.push(`${theme} ${r}: ${known} node(s) — ${[...new Set(v.map((x) => x.id))].join(", ")}`);
    check(real.length === 0, `axe ${theme} ${r}: no new serious/critical violations ${JSON.stringify(real).slice(0, 300)}`);
  }
  await c.close();
}

/* ---- Careers ---- */
for (const theme of ["dark", "light"]) {
  const c = await ctx(theme, { width: 1440, height: 900 });
  const page = await c.newPage();
  await page.goto(BASE + "/careers", { waitUntil: "networkidle" });
  await revealAll(page);
  await shot(page, `careers-hero-${theme}`);
  const ld = await page.$$eval('script[type="application/ld+json"]', (s) => s.map((x) => x.textContent).join(" "));
  check(!ld.includes("JobPosting"), `${theme}: Careers has no JobPosting structured data`);
  const text = await page.locator("main").textContent();
  check(!/£\s?\d|salary|closing date/i.test(text), `${theme}: Careers shows no salaries or closing dates`);
  const roles = page.locator("#roles");
  await roles.scrollIntoViewIfNeeded();
  const btn = roles.getByRole("button", { name: "View role details" }).first();
  check((await btn.getAttribute("aria-expanded")) === "false", `${theme}: role details start collapsed`);
  check((await roles.getByText("Write maintainable, testable code").count()) === 1, `${theme}: collapsed role content is still in the HTML (crawlable)`);
  await btn.click();
  await page.waitForTimeout(500);
  check((await roles.getByRole("button", { name: "Hide role details" }).first().getAttribute("aria-expanded")) === "true", `${theme}: role accordion expands`);
  check(await roles.getByText("Write maintainable, testable code").isVisible(), `${theme}: expanded role shows responsibilities`);
  await shot(page, `careers-role-expanded-${theme}`);
  await roles.getByRole("button", { name: "View role details" }).first().click();
  await page.waitForTimeout(500);
  await roles.getByRole("link", { name: "Register your interest" }).nth(1).click();
  await page.waitForTimeout(900);
  check(await page.getByRole("radio", { name: "Software Quality Assurance" }).isChecked(), `${theme}: QA role's 'Register your interest' pre-selects that area`);
  const form = page.locator("#careers-interest form");
  await form.getByRole("button", { name: "Register your interest" }).click();
  check(!(await page.getByText("we’ve received your message").isVisible()), `${theme}: empty careers form is not submitted`);
  await form.getByLabel("Name", { exact: true }).fill("QA Tester");
  await form.getByLabel("Email", { exact: true }).fill("qa@example.org");
  await form.getByLabel("Brief message").fill("Browser QA — please ignore.");
  await form.getByRole("button", { name: "Register your interest" }).click();
  await page.waitForTimeout(900);
  check(await page.getByText(/Online sending isn’t available right now/).isVisible(), `${theme}: careers form reports 'not sent' honestly without RESEND_API_KEY (real server, guard passed)`);
  await shot(page, `careers-form-unconfigured-${theme}`, { fullPage: false });
  await page.route("**/api/careers/interest", (r) => r.fulfill({ status: 502, contentType: "application/json", body: '{"ok":false,"reason":"send_failed"}' }));
  await form.getByRole("button", { name: "Register your interest" }).click();
  await page.waitForTimeout(500);
  check(await page.getByText(/couldn’t be sent/).isVisible(), `${theme}: careers provider failure shows an error`);
  await page.unroute("**/api/careers/interest");
  await page.route("**/api/careers/interest", (r) => r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' }));
  await form.getByRole("button", { name: "Register your interest" }).click();
  await page.waitForTimeout(500);
  check(await page.getByText("Thank you — we’ve received your message.").isVisible(), `${theme}: careers success only after server confirmation`);
  await shot(page, `careers-form-success-${theme}`, { fullPage: false });
  await c.close();
}

/* ---- Real browser POSTs pass the cross-site guard ---- */
{
  const c = await ctx("dark", { width: 1280, height: 800 });
  const page = await c.newPage();
  await page.goto(BASE + "/", { waitUntil: "domcontentloaded" });
  const results = await page.evaluate(async () => {
    const out = {};
    for (const ep of ["/api/start-a-project", "/api/voice/enquiry", "/api/school-hr/enquiry", "/api/careers/interest"]) {
      const res = await fetch(ep, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
      out[ep] = [res.status, (await res.json()).reason];
    }
    return out;
  });
  for (const [ep, [status, reason]] of Object.entries(results)) {
    check(status === 400 && reason === "missing_fields", `same-origin browser POST to ${ep} passes the guard and reaches validation (${status} ${reason})`);
  }
  await c.close();
}

/* ---- Screenshots for owner review (failures here never discard results) ---- */
if (SHOTS) try {
  for (const theme of ["dark", "light"]) {
    const c = await ctx(theme, { width: 1440, height: 900 });
    const page = await c.newPage();
    for (const [r, name] of [["/", "home"], ["/services", "services"], ["/products", "products"], ["/voice", "voice"], ["/school-hr", "school-hr-hero"], ["/careers", "careers"], ["/start-a-project", "start-a-project"], ["/this-page-does-not-exist", "404"]]) {
      await page.goto(BASE + r, { waitUntil: "networkidle" });
      await page.waitForTimeout(r === "/" ? 2500 : 600);
      await shot(page, `${name}-${theme}`);
    }
    await page.goto(BASE + "/school-hr", { waitUntil: "networkidle" });
    await revealAll(page);
    for (const id of ["workflows", "packages", "modules"]) {
      await page.locator(`#${id}`).scrollIntoViewIfNeeded();
      await page.evaluate((i) => document.getElementById(i).scrollIntoView({ block: "start", behavior: "instant" }), id);
      await page.waitForTimeout(700);
      await shot(page, `school-hr-${id}-${theme}`);
    }
    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Show products" }).click();
    await page.waitForTimeout(400);
    await shot(page, `products-dropdown-${theme}`, { clip: { x: 300, y: 0, width: 840, height: 340 } });
    await c.close();
    for (const width of [390, 768]) {
      const m = await ctx(theme, { width, height: width === 390 ? 844 : 1024 }, { isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
      const mp = await m.newPage();
      await mp.goto(BASE + "/", { waitUntil: "networkidle" });
      // < 768px: mobile menu; from 768px (tablet) the desktop navigation is shown.
      if (width < 768) {
        await mp.getByRole("button", { name: "Open menu" }).tap();
        await mp.getByRole("button", { name: "Show products" }).tap();
      } else {
        await mp.getByRole("button", { name: "Show products" }).tap();
      }
      await mp.waitForTimeout(500);
      await shot(mp, `nav-${width}-${theme}`);
      for (const [r, name] of [["/school-hr", "school-hr"], ["/careers", "careers"], ["/services", "services"]]) {
        await mp.goto(BASE + r, { waitUntil: "networkidle" });
        await mp.waitForTimeout(600);
        await shot(mp, `${name}-${width}-${theme}`);
      }
      await m.close();
    }
  }
}

catch (e) {
  notVerified.push(`screenshot phase stopped: ${String(e).split("\n")[0].slice(0, 120)}`);
}

await browser.close();
console.log(passes.map((p) => `  ✓ ${p}`).join("\n"));
if (knownIssues.length) console.log(`\nKNOWN PRE-EXISTING (needs owner approval to change) (${knownIssues.length})\n${knownIssues.map((n) => `  ! ${n}`).join("\n")}`);
if (notVerified.length) console.log(`\nNOT VERIFIED (${notVerified.length})\n${notVerified.map((n) => `  ? ${n}`).join("\n")}`);
console.log(`\nFINDINGS (${findings.length})`);
for (const f of findings) console.log(`  ✗ ${f}`);
process.exit(findings.length ? 1 : 0);
