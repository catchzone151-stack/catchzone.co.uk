#!/usr/bin/env node
/**
 * Browser QA for the Products navigation, /products, /services Products
 * section and /school-hr (requires Playwright + Chromium, not a project
 * dependency). Usage:
 *   npm run build && npm start   # in another terminal
 *   node scripts/school-hr/qa-browser.mjs [baseUrl] [screenshotDir]
 *
 * The enquiry form is tested against the real server (which must have no
 * RESEND_API_KEY, so nothing is sent) and with in-browser mocked responses.
 * No email is ever sent by this script.
 */
import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");
const axeSource = await fs.readFile(require.resolve("axe-core/axe.min.js"), "utf8");

const BASE = process.argv[2] ?? "http://127.0.0.1:3000";
const SHOTS = process.argv[3] ?? null;
const findings = [];
const passes = [];
const ok = (m) => passes.push(m);
const bad = (m) => findings.push(m);
const check = (cond, m) => (cond ? ok(m) : bad(m));

async function shot(page, name, opts = {}) {
  if (!SHOTS) return;
  await fs.mkdir(SHOTS, { recursive: true });
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`), ...opts });
}

async function revealAll(page) {
  await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    for (let y = 0; y <= document.documentElement.scrollHeight; y += 500) {
      window.scrollTo({ top: y, behavior: "instant" });
      await wait(60);
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  });
}

async function axe(page, label) {
  await page.addScriptTag({ content: axeSource });
  const res = await page.evaluate(async () =>
    // eslint-disable-next-line no-undef
    axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21aa"] } }),
  );
  // Known, pre-existing and intentionally unchanged: the approved /services
  // flagship card's violet label/link (accent-iris on dark, ~4.2:1). Reported as a note.
  const known = (v, n) => v.id === "color-contrast" && label.endsWith("/services") && n.html.includes("text-accent-iris");
  const notes = [];
  for (const v of res.violations) for (const n of v.nodes) if (known(v, n)) notes.push(n);
  if (notes.length) ok(`${label}: NOTE pre-existing flagship (accent-iris) contrast × ${notes.length} — unchanged approved design`);
  const serious = res.violations
    .map((v) => ({ ...v, nodes: v.nodes.filter((n) => !known(v, n)) }))
    .filter((v) => v.nodes.length && (v.impact === "serious" || v.impact === "critical"));
  if (serious.length === 0) ok(`${label}: no serious/critical axe violations`);
  for (const v of serious) bad(`${label}: axe ${v.id} (${v.impact}) × ${v.nodes.length} — ${v.nodes[0]?.target?.join(" ")}`);
}

const browser = await chromium.launch();

async function ctxFor(theme, viewport = { width: 1440, height: 900 }, extra = {}) {
  const ctx = await browser.newContext({ viewport, ...extra });
  await ctx.addInitScript((t) => {
    try {
      if (!sessionStorage.getItem("cz-qa-seeded")) {
        localStorage.setItem("cz-theme", t);
        sessionStorage.setItem("cz-qa-seeded", "1");
      }
    } catch {}
  }, theme);
  return ctx;
}

for (const theme of ["dark", "light"]) {
  /* ---------------- Desktop navigation ---------------- */
  {
    const ctx = await ctxFor(theme);
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    const labels = await page.$$eval('nav[aria-label="Primary"] > a, nav[aria-label="Primary"] > div > div > a', (els) =>
      els.map((e) => e.textContent.trim()),
    );
    check(JSON.stringify(labels) === JSON.stringify(["Services", "Products", "Work", "About"]), `${theme}: main nav order is Services | Products | Work | About (${labels.join(" | ")})`);
    check((await page.getAttribute('nav[aria-label="Primary"] a:text-is("Products")', "href")) === "/products", `${theme}: Products link opens /products`);
    const btn = page.getByRole("button", { name: "Show products" });
    check((await btn.getAttribute("aria-expanded")) === "false", `${theme}: products menu starts closed`);
    await btn.click();
    await page.waitForTimeout(250);
    check((await btn.getAttribute("aria-expanded")) === "true", `${theme}: chevron opens the products menu`);
    const items = await page.$$eval("#products-menu a", (els) => els.map((e) => e.getAttribute("href")));
    check(items.includes("/voice") && items.includes("/school-hr") && items.includes("/products"), `${theme}: menu links Voice, School HR and all products`);
    await shot(page, `nav-products-menu-${theme}`, { clip: { x: 300, y: 0, width: 840, height: 330 } });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(250);
    check((await btn.getAttribute("aria-expanded")) === "false", `${theme}: Escape closes the menu`);
    check(await btn.evaluate((el) => el === document.activeElement), `${theme}: focus returns to the menu button after Escape`);
    await page.mouse.move(700, 700);
    await page.waitForTimeout(300);
    await page.hover('nav[aria-label="Primary"] a:text-is("Products")');
    await page.waitForTimeout(350);
    check((await btn.getAttribute("aria-expanded")) === "true", `${theme}: mouse hover opens the menu`);
    await page.mouse.move(700, 700);
    await page.waitForTimeout(450);
    check((await btn.getAttribute("aria-expanded")) === "false", `${theme}: menu closes when the pointer leaves`);
    // keyboard: Tab into the menu
    await btn.focus();
    await page.keyboard.press("Enter");
    await page.waitForTimeout(200);
    await page.keyboard.press("Tab");
    const focused = await page.evaluate(() => document.activeElement?.closest("#products-menu") !== null);
    check(focused, `${theme}: keyboard focus moves into the open menu`);
    await page.click('#products-menu a[href="/school-hr"]');
    await page.waitForURL("**/school-hr");
    check(true, `${theme}: menu link navigates to /school-hr`);
    check((await page.getAttribute("html", "data-theme")) === theme, `${theme}: theme persists across client navigation`);
    check(
      await page.$eval('nav[aria-label="Primary"] .relative.flex span[aria-hidden="true"]', () => true).catch(() => false),
      `${theme}: Products shows the active state on /school-hr`,
    );
    await page.reload({ waitUntil: "networkidle" });
    check((await page.getAttribute("html", "data-theme")) === theme, `${theme}: theme persists after refresh`);
    check(errors.length === 0, `${theme}: no page errors in navigation tests ${errors.join(" | ")}`);
    await ctx.close();
  }

  /* ---------------- Mobile navigation ---------------- */
  {
    const ctx = await ctxFor(theme, { width: 390, height: 844 }, { hasTouch: true, isMobile: true, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Open menu" }).tap();
    await page.waitForTimeout(350);
    const expand = page.getByRole("button", { name: "Show products" });
    check((await expand.count()) === 1, `${theme}/mobile: Products row has an expand button`);
    await expand.tap();
    await page.waitForTimeout(400);
    const links = await page.$$eval("#mobile-products a", (els) => els.map((e) => e.getAttribute("href")));
    check(links.join(",") === "/voice,/school-hr,/products", `${theme}/mobile: expanded menu lists Voice, School HR, all products`);
    await shot(page, `mobile-products-menu-${theme}`);
    await page.locator('#mobile-products a[href="/school-hr"]').tap();
    await page.waitForURL("**/school-hr");
    check(true, `${theme}/mobile: tapping School HR opens the page`);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    check(overflow <= 0, `${theme}/mobile: /school-hr has no horizontal overflow (${overflow}px)`);
    await revealAll(page);
    await shot(page, `school-hr-mobile-hero-${theme}`);
    await page.locator("#workflows").scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await shot(page, `school-hr-mobile-workflow-${theme}`);
    for (const r of ["/products", "/services", "/"]) {
      await page.goto(`${BASE}${r}`, { waitUntil: "networkidle" });
      const o = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      check(o <= 0, `${theme}/mobile: ${r} has no horizontal overflow (${o}px)`);
    }
    await ctx.close();
  }

  /* ---------------- /school-hr interactions ---------------- */
  {
    const ctx = await ctxFor(theme);
    const page = await ctx.newPage();
    const errors = [];
    const requests = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(`${BASE}/school-hr`, { waitUntil: "networkidle" });
    check((await page.locator("h1").textContent()).includes("School HR, without the paper chase."), `${theme}: School HR hero headline`);
    const logoSrc = await page.$$eval("main img[alt='CatchZone School HR']", (els) =>
      els.filter((e) => getComputedStyle(e).display !== "none").map((e) => e.getAttribute("src")),
    );
    check(logoSrc[0]?.endsWith(`catchzone-school-hr-logo-${theme}.svg`), `${theme}: visible School HR logo is the ${theme} variant (${logoSrc[0]})`);
    await revealAll(page);
    await shot(page, `school-hr-hero-${theme}`);
    page.on("request", (r) => requests.push(r.url()));

    const studio = page.locator("#workflows");
    await studio.scrollIntoViewIfNeeded();
    // Additional hours
    await studio.getByRole("button", { name: "Increase hours" }).click();
    await studio.getByRole("button", { name: "Submit claim" }).click();
    await page.waitForTimeout(400);
    check(await studio.getByText("Awaiting headteacher").first().isVisible(), `${theme}: hours claim moves to 'Awaiting headteacher'`);
    await studio.getByRole("button", { name: /Switch to headteacher view/ }).click();
    await page.waitForTimeout(400);
    await studio.getByRole("button", { name: "Return with comment" }).click();
    check(await studio.getByText(/approve the claim to continue/).first().isVisible(), `${theme}: 'Return with comment' explains the preview`);
    await studio.getByRole("button", { name: "Approve claim" }).click();
    await page.waitForTimeout(500);
    check(await studio.getByText("Ready for export").first().isVisible(), `${theme}: approved claim becomes a finance-ready record`);
    check(await studio.getByRole("cell", { name: "3.0 hrs" }).isVisible(), `${theme}: adjusted hours carry through to the record`);
    await studio.getByRole("button", { name: "Show export preview" }).click();
    check(await studio.locator("pre").isVisible(), `${theme}: export preview opens`);
    await shot(page, `school-hr-workflow-${theme}`, { fullPage: false });
    await studio.getByRole("button", { name: "Replay" }).click();
    await page.waitForTimeout(400);
    check(await studio.getByRole("button", { name: "Submit claim" }).isVisible(), `${theme}: Replay resets the workflow`);

    // Leave
    await studio.getByRole("button", { name: /^Leave request/ }).click();
    await page.waitForTimeout(350);
    await studio.getByRole("button", { name: "Submit request" }).click();
    await page.waitForTimeout(350);
    await studio.getByRole("button", { name: "Approve leave" }).click();
    await page.waitForTimeout(1600);
    check(await studio.getByText(/Approved by Jordan Reid/).first().isVisible(), `${theme}: leave approved by the line manager`);
    check((await studio.textContent()).includes("11.0"), `${theme}: leave balance updates 14.0 → 11.0`);

    // TOIL
    await studio.getByRole("button", { name: /^TOIL/ }).click();
    await page.waitForTimeout(350);
    await studio.getByRole("button", { name: "Submit request" }).click();
    await page.waitForTimeout(350);
    check(await studio.getByText(/Within available balance/).first().isVisible(), `${theme}: TOIL approval shows a balance check`);
    await studio.getByRole("button", { name: "Approve TOIL" }).click();
    await page.waitForTimeout(1600);
    check((await studio.textContent()).includes("3.0hrs") || (await studio.textContent()).includes("3.0 hrs"), `${theme}: TOIL balance updates`);

    // Return to work
    await studio.getByRole("button", { name: /^Return to work/ }).click();
    await page.waitForTimeout(350);
    const submit = studio.getByRole("button", { name: "Submit form" });
    check(await submit.isDisabled(), `${theme}: RTW submit waits for confirmation`);
    await studio.getByLabel("I confirm this information is accurate").check();
    await submit.click();
    await page.waitForTimeout(350);
    const complete = studio.getByRole("button", { name: "Mark review complete" });
    check(await complete.isDisabled(), `${theme}: review completion waits for the conversation checkbox`);
    await studio.getByLabel("Return-to-work conversation held").check();
    await complete.click();
    await page.waitForTimeout(400);
    check(await studio.getByText("Restricted record").first().isVisible(), `${theme}: RTW ends as a restricted record with audit trail`);
    check(requests.filter((u) => !u.includes("/_next/")).length === 0, `${theme}: workflow studio made no network requests (${requests.length})`);

    // Roles
    const roles = page.locator("#roles");
    await roles.scrollIntoViewIfNeeded();
    for (const [name, text] of [
      ["Line Manager", "Pending team requests"],
      ["Headteacher", "Additional-hours approval queue"],
      ["Finance / Administration", "does not run payroll"],
      ["Staff", "My requests"],
    ]) {
      await roles.getByRole("tab", { name: new RegExp(name) }).click();
      await page.waitForTimeout(400);
      check(await roles.getByText(text).first().isVisible(), `${theme}: role tab '${name}' shows its dashboard`);
    }
    await roles.getByRole("tab", { name: /Staff/ }).focus();
    await page.keyboard.press("ArrowRight");
    await page.waitForTimeout(350);
    check((await roles.getByRole("tab", { name: /Line Manager/ }).getAttribute("aria-selected")) === "true", `${theme}: arrow keys move between role tabs`);
    await shot(page, `school-hr-roles-${theme}`);

    // Module explorer
    const mods = page.locator("#modules");
    await mods.scrollIntoViewIfNeeded();
    await mods.getByRole("tab", { name: /Standard/ }).click();
    await mods.getByRole("button", { name: "Training and CPD" }).click();
    await page.waitForTimeout(350);
    check(await mods.getByRole("heading", { name: "Training and CPD" }).isVisible(), `${theme}: module explorer shows the selected module`);
    await mods.getByRole("tab", { name: /Optional modules/ }).click();
    await mods.getByRole("button", { name: "Single Central Record support" }).click();
    await page.waitForTimeout(350);
    check(await mods.getByText("Requirements discussion").first().isVisible(), `${theme}: optional modules are labelled as not available`);
    check(await mods.getByText(/Safeguarding and statutory requirements apply/).first().isVisible(), `${theme}: sensitive module shows its caution`);
    await shot(page, `school-hr-modules-${theme}`);

    // Pricing + package hand-off
    const pkgs = page.locator("#packages");
    await pkgs.scrollIntoViewIfNeeded();
    const pkgText = await pkgs.textContent();
    check(pkgText.includes("£1,800") && pkgText.includes("£3,600") && pkgText.includes("per school / year"), `${theme}: prices £1,800 and £3,600 per school / year`);
    check(pkgText.includes("Proposed licence price"), `${theme}: prices are marked as proposed`);
    await pkgs.getByText("Compare Essentials and Standard").click();
    check(await pkgs.getByRole("table").isVisible(), `${theme}: comparison table expands`);
    await page.waitForTimeout(300);
    await shot(page, `school-hr-packages-${theme}`);
    await pkgs.getByRole("link", { name: "Discuss Standard" }).click();
    await page.waitForTimeout(900);
    check((await page.locator("select[name='interest-choice']").inputValue()) === "standard", `${theme}: 'Discuss Standard' pre-selects Standard in the form`);
    check(page.url().includes("interest=standard"), `${theme}: selected package is reflected in the URL`);

    // FAQ
    const faq = page.locator("#faq details").nth(7);
    await faq.locator("summary").click();
    check(await faq.evaluate((d) => d.open), `${theme}: FAQ item opens`);

    // Form: validation, real (unconfigured) server, mocked success and failure
    const form = page.locator("#school-hr-contact form");
    await form.getByRole("button", { name: "Request a demonstration" }).click();
    check(!(await page.getByText("Thank you — request received.").first().isVisible()), `${theme}: empty form is not submitted`);
    await form.getByLabel("Name").fill("QA Tester");
    await form.getByLabel("School or organisation").fill("Example School");
    await form.getByLabel("Business email").fill("qa@example.org");
    await form.getByRole("button", { name: "Request a demonstration" }).click();
    await page.waitForTimeout(800);
    const unconf = await page.getByText(/Online sending isn’t available right now|couldn’t be sent/).first().isVisible();
    check(unconf, `${theme}: real server without RESEND_API_KEY reports 'not sent' honestly (mailto fallback)`);
    await page.route("**/api/school-hr/enquiry", (r) => r.fulfill({ status: 502, contentType: "application/json", body: '{"ok":false,"reason":"send_failed"}' }));
    await form.getByRole("button", { name: "Request a demonstration" }).click();
    await page.waitForTimeout(500);
    check(await page.getByText(/couldn’t be sent/).first().isVisible(), `${theme}: provider failure shows an error, not success`);
    let posted = null;
    await page.unroute("**/api/school-hr/enquiry");
    await page.route("**/api/school-hr/enquiry", (r) => {
      posted = JSON.parse(r.request().postData() ?? "{}");
      return r.fulfill({ status: 200, contentType: "application/json", body: '{"ok":true}' });
    });
    await form.getByRole("button", { name: "Request a demonstration" }).click();
    await page.waitForTimeout(500);
    check(await page.getByText("Thank you — request received.").first().isVisible(), `${theme}: success shown only after the server confirms`);
    check(posted?.interest === "standard" && posted?.organisation === "Example School", `${theme}: request carries package and organisation`);
    check(errors.length === 0, `${theme}: no page errors on /school-hr ${errors.join(" | ")}`);
    await page.unroute("**/api/school-hr/enquiry");
    await page.goto(`${BASE}/school-hr`, { waitUntil: "networkidle" });
    await revealAll(page);
    await axe(page, `${theme} /school-hr`);
    await ctx.close();
  }

  /* ---------------- /products, /services, homepage protection ---------------- */
  {
    const ctx = await ctxFor(theme);
    const page = await ctx.newPage();
    const errors = [];
    page.on("pageerror", (e) => errors.push(String(e)));
    await page.goto(`${BASE}/products`, { waitUntil: "networkidle" });
    check((await page.locator("h1").textContent()).includes("Software built for real-world challenges."), `${theme}: /products headline`);
    const prodLinks = await page.$$eval("main a", (els) => els.map((e) => e.getAttribute("href")));
    check(prodLinks.includes("/voice") && prodLinks.includes("/school-hr"), `${theme}: /products links both product pages`);
    await revealAll(page);
    await shot(page, `products-${theme}`);
    await axe(page, `${theme} /products`);

    await page.goto(`${BASE}/services`, { waitUntil: "networkidle" });
    const h2s = await page.$$eval("main h2", (els) => els.map((e) => e.textContent.trim()));
    check(
      h2s.slice(0, 4).join("|") ===
        "Mobile & Digital Product Engineering|Premium Web Platforms & Digital Experiences|Custom Business Systems & Digital Infrastructure|Complete Digital Ecosystems",
      `${theme}: /services keeps 01–03 and the separate 04 flagship in order`,
    );
    check((await page.locator("text=04 · Flagship Service").count()) === 1, `${theme}: flagship keeps its own label`);
    check(h2s.includes("CatchZone Products"), `${theme}: /services has the CatchZone Products section`);
    const svcLinks = await page.$$eval("#products-title ~ * a, section[aria-labelledby='products-title'] a", (els) => els.map((e) => e.getAttribute("href")));
    check(svcLinks.includes("/voice") && svcLinks.includes("/school-hr"), `${theme}: product cards link to /voice and /school-hr`);
    for (const slug of ["apps", "web", "systems"]) {
      check((await page.locator(`main a[href="/services/${slug}"]`).count()) >= 1, `${theme}: service detail link /services/${slug} kept`);
    }
    await page.locator("#products-title").scrollIntoViewIfNeeded();
    await page.waitForTimeout(700);
    await shot(page, `services-products-${theme}`);
    await axe(page, `${theme} /services`);

    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    // The site footer sits inside <main>; it legitimately links to School HR.
    const mainText = await page.locator("main").evaluate((m) => {
      const c = m.cloneNode(true);
      c.querySelectorAll("footer").forEach((f) => f.remove());
      return c.textContent;
    });
    check(!mainText.includes("School HR"), `${theme}: homepage main content has no School HR feature`);
    check(mainText.includes("Conversations without language barriers."), `${theme}: homepage Voice spotlight unchanged`);
    check((await page.locator("canvas").count()) >= 1, `${theme}: homepage WebGL journey canvas present`);
    const footerCols = await page.$$eval("footer nav", (els) => els.map((e) => e.getAttribute("aria-label")));
    check(footerCols.join("|") === "Footer — Services|Footer — Products|Footer — Company", `${theme}: footer columns Services | Products | Company (+ Contact)`);
    check((await page.locator('footer a[href="/start-a-project"]').count()) === 1, `${theme}: footer keeps Start a Project`);
    check((await page.locator('header a[href="/start-a-project"]').count()) >= 1, `${theme}: header Start a Project kept`);
    check(errors.length === 0, `${theme}: no page errors on /products, /services, / ${errors.join(" | ")}`);
    await ctx.close();
  }
}

/* ---------------- Reduced motion ---------------- */
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  for (const r of ["/school-hr", "/products", "/services"]) await page.goto(`${BASE}${r}`, { waitUntil: "networkidle" });
  const anim = await page.evaluate(() => getComputedStyle(document.querySelector(".hr-step") ?? document.body).animationName);
  check(anim === "none", `reduced-motion: School HR mini-flow animation is off (${anim})`);
  check(errors.length === 0, `reduced-motion: pages render without errors`);
  await ctx.close();
}

await browser.close();
console.log(passes.map((p) => `  ✓ ${p}`).join("\n"));
console.log(`\nFINDINGS (${findings.length})`);
for (const f of findings) console.log(`  ✗ ${f}`);
process.exit(findings.length ? 1 : 0);
