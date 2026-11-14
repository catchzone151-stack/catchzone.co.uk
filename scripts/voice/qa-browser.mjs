#!/usr/bin/env node
/**
 * Browser QA for the CatchZone Voice pages (requires Playwright + Chromium,
 * not a project dependency). Usage:
 *   npm run build && npm start   # in another terminal
 *   node scripts/voice/qa-browser.mjs [baseUrl] [screenshotDir]
 *
 * TEST-ONLY MOCKS: to exercise the Conversation Studio's live states without
 * calling Soniox (no credits spent), this script intercepts /api/voice/* in
 * the browser and replaces Soniox's WebSockets with a scripted stand-in. The
 * scripted phrases exist only inside this file and are never shipped to the
 * website.
 */
import { createRequire } from "node:module";
import fs from "node:fs/promises";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const BASE = process.argv[2] ?? "http://127.0.0.1:3000";
const SHOTS = process.argv[3] ?? null;
const findings = [];
const passes = [];
const ok = (m) => passes.push(m);
const bad = (m) => findings.push(m);

async function shot(page, name) {
  if (!SHOTS) return;
  await fs.mkdir(SHOTS, { recursive: true });
  await page.screenshot({ path: path.join(SHOTS, `${name}.png`), fullPage: false });
}

async function revealAll(page) {
  await page.evaluate(async () => {
    const wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const max = document.documentElement.scrollHeight;
    for (let y = 0; y <= max; y += 500) {
      window.scrollTo(0, y);
      await wait(60);
    }
    window.scrollTo(0, 0);
    await wait(200);
  });
}

/* ------------------------------------------------------------------ */
/* 1. Responsive / console / overflow / image checks                   */
/* ------------------------------------------------------------------ */

const ROUTES = ["/", "/voice", "/voice/languages", "/voice/business", "/work", "/work/islamquest", "/privacy", "/about", "/services", "/start-a-project"];
const WIDTHS = [1440, 1024, 768, 390, 360];

const browser = await chromium.launch({
  args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream", "--autoplay-policy=no-user-gesture-required"],
});

for (const theme of ["dark", "light"])
for (const width of WIDTHS) {
  const context = await browser.newContext({ viewport: { width, height: width <= 430 ? 860 : 900 } });
  await context.addInitScript((t) => localStorage.setItem("cz-theme", t), theme);
  for (const route of ROUTES) {
    const page = await context.newPage();
    const errors = [];
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(String(e)));
    page.on("requestfailed", (r) => {
      const u = r.url();
      if (!u.includes("_rsc") && !u.startsWith("data:")) errors.push(`requestfailed ${u} ${r.failure()?.errorText}`);
    });
    const res = await page.goto(BASE + route, { waitUntil: "networkidle" });
    if (!res || res.status() !== 200) bad(`${route}@${width}/${theme}: HTTP ${res?.status()}`);
    if ((await page.evaluate(() => document.documentElement.dataset.theme)) !== theme) bad(`${route}@${width}: theme ${theme} not applied`);
    await revealAll(page);
    const metrics = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      brokenImages: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
      h1: document.querySelectorAll("h1").length,
    }));
    if (metrics.overflow > 1) bad(`${route}@${width}: horizontal overflow ${metrics.overflow}px`);
    if (metrics.brokenImages.length) bad(`${route}@${width}: broken images ${metrics.brokenImages.join(", ")}`);
    if (metrics.h1 !== 1) bad(`${route}@${width}: ${metrics.h1} h1 elements`);
    if (errors.length) bad(`${route}@${width}: console/runtime errors: ${errors.slice(0, 3).join(" | ")}`);
    if (SHOTS && (route.startsWith("/voice") || route === "/")) {
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(700);
      await shot(page, `${route === "/" ? "home" : route.slice(1).replaceAll("/", "-")}-${theme}-${width}`);
    }
    await page.close();
  }
  await context.close();
}
ok(`responsive pass: ${ROUTES.length} routes × ${WIDTHS.length} widths × 2 themes`);

/* ------------------------------------------------------------------ */
/* 1b. Theme switch: semantics, persistence, no flash, pull gesture     */
/* ------------------------------------------------------------------ */
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  if ((await page.evaluate(() => document.documentElement.dataset.theme)) === "dark") ok("dark is the default theme");
  else bad("default theme is not dark");
  const sw = page.getByRole("switch", { name: "Light mode" });
  if ((await sw.getAttribute("aria-checked")) === "false") ok("theme switch exposed as role=switch, unchecked in dark");
  else bad("theme switch semantics wrong");
  const box = await sw.boundingBox();
  if (box && box.width >= 44 && box.height >= 44) ok(`theme switch touch target ${Math.round(box.width)}×${Math.round(box.height)}px`);
  else bad(`theme switch target too small ${JSON.stringify(box)}`);
  await sw.focus();
  await page.keyboard.press("Enter");
  if ((await page.evaluate(() => document.documentElement.dataset.theme)) === "light" && (await sw.getAttribute("aria-checked")) === "true") ok("Enter toggles to light");
  else bad("Enter did not toggle");
  await page.keyboard.press("Space");
  if ((await page.evaluate(() => document.documentElement.dataset.theme)) === "dark") ok("Space toggles back to dark");
  else bad("Space did not toggle");
  await sw.click();
  await page.reload({ waitUntil: "networkidle" });
  if ((await page.evaluate(() => document.documentElement.dataset.theme)) === "light") ok("light theme persists after refresh");
  else bad("theme not persisted after refresh");
  await page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Voice" }).click();
  await page.waitForURL("**/voice");
  if ((await page.evaluate(() => document.documentElement.dataset.theme)) === "light") ok("light theme persists across navigation");
  else bad("theme lost on navigation");
  // Light variants of the Voice logo are the ones displayed.
  const visibleLogo = await page.evaluate(() => [...document.querySelectorAll('img[alt="CatchZone Voice"]')].filter((i) => i.offsetParent !== null).map((i) => i.getAttribute("src")).join(" "));
  if (/minimal-light/.test(visibleLogo) && !/minimal-dark/.test(visibleLogo)) ok("light theme shows the Minimal Light Voice logo only");
  else bad(`wrong Voice logo variant visible: ${visibleLogo}`);
  // No flash: theme attribute is already set when the first paint-relevant script runs.
  const pre = await ctx.newPage();
  await pre.addInitScript(() => {
    document.addEventListener("DOMContentLoaded", () => { window.__themeAtDcl = document.documentElement.dataset.theme; });
    new MutationObserver(() => {}).observe(document, { childList: true });
  });
  await pre.goto(BASE + "/about", { waitUntil: "domcontentloaded" });
  const bgAtLoad = await pre.evaluate(() => getComputedStyle(document.body).backgroundColor);
  if ((await pre.evaluate(() => window.__themeAtDcl)) === "light" && bgAtLoad === "rgb(246, 245, 241)") ok("no theme flash: light applied before DOMContentLoaded");
  else bad(`theme flash risk: ${await pre.evaluate(() => window.__themeAtDcl)} / ${bgAtLoad}`);
  // Optional pull gesture (drag the bead down) also toggles.
  const sw2 = pre.getByRole("switch", { name: "Light mode" });
  const b2 = await sw2.boundingBox();
  await pre.mouse.move(b2.x + b2.width / 2, b2.y + 40);
  await pre.mouse.down();
  await pre.mouse.move(b2.x + b2.width / 2, b2.y + 70, { steps: 8 });
  await pre.mouse.up();
  await pre.waitForTimeout(200);
  if ((await pre.evaluate(() => document.documentElement.dataset.theme)) === "dark") ok("pull gesture toggles the theme (exactly once)");
  else bad("pull gesture did not toggle exactly once");
  await ctx.close();

  // Mobile: switch sits beside the menu button without overlapping it.
  const m = await browser.newPage({ viewport: { width: 360, height: 800 } });
  await m.goto(BASE + "/", { waitUntil: "networkidle" });
  const s1 = await m.getByRole("switch", { name: "Light mode" }).boundingBox();
  const s2 = await m.getByRole("button", { name: "Open menu" }).boundingBox();
  if (s1 && s2 && s1.x + s1.width <= s2.x + 1) ok("mobile: theme switch does not overlap the menu button");
  else bad(`mobile overlap: ${JSON.stringify(s1)} ${JSON.stringify(s2)}`);
  await m.close();
}

/* ------------------------------------------------------------------ */
/* 2. Homepage Voice spotlight                                         */
/* ------------------------------------------------------------------ */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  const html = await page.content();
  // Live homepage: the IDEA → DESIGN → BUILD → SHIP CinematicJourney, not the obsolete 3D-panel hero.
  if (html.includes("It starts as a rough idea.")) ok("homepage renders the live CinematicJourney");
  else bad("CinematicJourney missing from homepage");
  // The obsolete Hero/SketchToBuild components were removed from the branch; confirm the
  // journey's own four stages render instead.
  const stages = ["Idea", "Design", "Build", "Ship"].filter((label) => html.includes(`>${label}<`));
  if (stages.length === 4) ok("journey stages Idea → Design → Build → Ship present");
  else bad(`journey stages found: ${stages.join(", ")}`);
  const section = page.locator("section#work");
  await section.scrollIntoViewIfNeeded();
  await page.waitForTimeout(900);
  if (SHOTS) await section.screenshot({ path: path.join(SHOTS, "home-voice-spotlight-1440.png") });
  const text = await section.innerText();
  if (/islamquest/i.test(text)) bad("homepage featured section still mentions IslamQuest");
  else ok("homepage featured section (SelectedWork) no longer shows IslamQuest");
  if (/Conversations without language barriers/.test(text)) ok("SelectedWork now features CatchZone Voice");
  else bad("Voice spotlight missing from SelectedWork");
  const cta = section.getByRole("link", { name: /Explore CatchZone Voice/ });
  if ((await cta.getAttribute("href")) === "/voice") ok("spotlight primary CTA → /voice");
  else bad("spotlight CTA href wrong");
  const navVoice = page.getByRole("navigation", { name: "Primary" }).getByRole("link", { name: "Voice" });
  if ((await navVoice.count()) === 1) ok("primary nav has Voice entry");
  else bad("primary nav missing Voice");
  const footerVoice = page.getByRole("navigation", { name: "Footer" }).getByRole("link", { name: "CatchZone Voice" });
  if ((await footerVoice.count()) === 1) ok("footer has CatchZone Voice link");
  else bad("footer missing Voice link");
  await page.close();

  const mobile = await browser.newPage({ viewport: { width: 390, height: 860 } });
  await mobile.goto(BASE + "/", { waitUntil: "networkidle" });
  await mobile.getByRole("button", { name: "Open menu" }).click();
  const mobileVoice = mobile.getByRole("dialog", { name: "Mobile navigation" }).getByRole("link", { name: "Voice" });
  if ((await mobileVoice.count()) === 1) ok("mobile navigation has Voice entry");
  else bad("mobile navigation missing Voice");
  await shot(mobile, "home-mobile-nav-390");
  await mobile.getByRole("button", { name: "Close menu" }).click();
  const s2 = mobile.locator("section#work");
  await s2.scrollIntoViewIfNeeded();
  await mobile.waitForTimeout(900);
  if (SHOTS) await s2.screenshot({ path: path.join(SHOTS, "home-voice-spotlight-390.png") });
  await mobile.close();

  const wq = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await wq.goto(BASE + "/work", { waitUntil: "networkidle" });
  if ((await wq.locator("text=IslamQuest").count()) > 0) ok("IslamQuest still featured on /work");
  else bad("IslamQuest missing from /work");
  await wq.close();
}

/* ------------------------------------------------------------------ */
/* 3. Studio: unavailable (fail-closed) state from the real server     */
/* ------------------------------------------------------------------ */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + "/voice", { waitUntil: "networkidle" });
  const status = await (await page.request.get(BASE + "/api/voice/status")).json();
  const btn = page.getByRole("button", { name: "Start talking" });
  if (!status.available) {
    if (await btn.isDisabled()) ok("real server: demo unavailable → Start disabled (fail-closed)");
    else bad("unavailable demo but Start button enabled");
    if ((await page.locator("text=The public live demo is not running").count()) === 1) ok("unavailable message shown");
    else bad("unavailable message missing");
    await shot(page, "studio-unavailable-1280");
  }
  await page.close();
}

/* ------------------------------------------------------------------ */
/* 4. Language pickers: defaults, search, keyboard, disallow, swap     */
/* ------------------------------------------------------------------ */
async function mockAvailable(page, sessionBody) {
  await page.route("**/api/voice/status", (r) =>
    r.fulfill({ json: { available: true, trialSeconds: 60 } }),
  );
  if (sessionBody) {
    await page.route("**/api/voice/session", (r) => r.fulfill({ json: sessionBody, status: sessionBody.ok ? 200 : 429 }));
  }
  await page.route("**/api/voice/session/end", (r) => r.fulfill({ status: 204, body: "" }));
}

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await mockAvailable(page);
  await page.goto(BASE + "/voice", { waitUntil: "networkidle" });
  const speakIn = page.getByRole("button", { name: /Speak in/ });
  const translateInto = page.getByRole("button", { name: /Translate into/ });
  const s = await speakIn.innerText();
  const t = await translateInto.innerText();
  if (s.startsWith("English") && t.startsWith("Spanish")) ok("defaults: English → Spanish");
  else bad(`defaults wrong: ${s} / ${t}`);

  // Keyboard: open, search by native name, choose with Enter.
  await translateInto.focus();
  await page.keyboard.press("Enter");
  const combo = page.getByRole("combobox");
  await combo.waitFor();
  const optionCount = await page.getByRole("option").count();
  if (optionCount === 60) ok("picker lists all 60 languages");
  else bad(`picker lists ${optionCount} languages`);
  await combo.fill("deutsch");
  if ((await page.getByRole("option").count()) === 1) ok("search matches native names (Deutsch)");
  else bad("native-name search failed");
  await page.keyboard.press("Enter");
  if ((await translateInto.innerText()).startsWith("German")) ok("keyboard selection works");
  else bad("keyboard selection failed");
  if ((await page.evaluate(() => document.activeElement?.getAttribute("aria-haspopup"))) === "listbox") ok("focus returns to trigger after selection");
  else bad("focus not returned after selection");

  // Disallow same language on both sides.
  await translateInto.click();
  await combo.fill("english");
  const englishOpt = page.getByRole("option", { name: /English/ });
  if ((await englishOpt.getAttribute("aria-disabled")) === "true") ok("same-language pair option disabled");
  else bad("same-language option not disabled");
  await englishOpt.click({ force: true });
  if ((await translateInto.innerText()).startsWith("German")) ok("disabled option cannot be chosen");
  else bad("disabled option was chosen");
  await page.keyboard.press("Escape");

  // Diacritics-insensitive search and RTL rendering.
  await translateInto.click();
  await combo.fill("arab");
  await page.keyboard.press("Enter");
  const nativeDir = await translateInto.locator("[dir]").getAttribute("dir");
  if (nativeDir === "rtl") ok("Arabic native name rendered right-to-left");
  else bad("Arabic not rtl in picker");
  await translateInto.click();
  await combo.fill("francais");
  if ((await page.getByRole("option").count()) === 1) ok("accent-insensitive search (francais → Français)");
  else bad("accent-insensitive search failed");
  await page.keyboard.press("Escape");

  // Swap.
  await page.getByRole("button", { name: /Swap languages/ }).click();
  const s2 = await speakIn.innerText();
  const t2 = await translateInto.innerText();
  if (s2.startsWith("Arabic") && t2.startsWith("English")) ok("swap button swaps the pair");
  else bad(`swap failed: ${s2} / ${t2}`);
  await shot(page, "studio-picker-rtl-1280");
  await page.close();
}

{
  // Deep link from the languages page.
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await mockAvailable(page);
  await page.goto(BASE + "/voice?from=en&to=fr#studio", { waitUntil: "networkidle" });
  if ((await page.getByRole("button", { name: /Translate into/ }).innerText()).startsWith("French")) ok("deep link ?from=en&to=fr preselects pair");
  else bad("deep link ignored");
  await page.goto(BASE + "/voice?from=en&to=en", { waitUntil: "networkidle" });
  if ((await page.getByRole("button", { name: /Translate into/ }).innerText()).startsWith("Spanish")) ok("invalid deep link pair ignored");
  else bad("invalid deep link accepted");
  await page.close();
}

/* ------------------------------------------------------------------ */
/* 5. Languages page: search, filters, RTL, links                      */
/* ------------------------------------------------------------------ */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + "/voice/languages", { waitUntil: "networkidle" });
  const cards = () => page.locator("ul li a[href^='/voice?from=']");
  if ((await cards().count()) === 60) ok("languages page renders 60 languages");
  else bad(`languages page renders ${await cards().count()}`);
  await page.getByRole("button", { name: /Right-to-left scripts/ }).click();
  if ((await cards().count()) === 4) ok("RTL filter shows 4 languages");
  else bad("RTL filter wrong");
  if (SHOTS) {
    await page.locator("#language-results-count").scrollIntoViewIfNeeded();
    await shot(page, "languages-rtl-filter-1280");
  }
  await page.getByRole("button", { name: /^All languages/ }).click();
  await page.getByRole("searchbox").fill("cymraeg");
  if ((await cards().count()) === 1) ok("languages search by native name (Cymraeg)");
  else bad("languages search failed");
  await page.getByRole("searchbox").fill("klingon");
  if ((await page.locator("text=No supported language matches").count()) === 1) ok("no-match message, no invented languages");
  else bad("no-match message missing");
  await page.close();
}

/* ------------------------------------------------------------------ */
/* 6. Studio error states (mocked API)                                 */
/* ------------------------------------------------------------------ */
const STUDIO_ALERT = "#studio [role=alert]";

async function startTrial(page) {
  await page.getByRole("button", { name: "Start talking" }).click();
  await page.getByRole("button", { name: "Agree and start" }).click();
}

{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await mockAvailable(page, { ok: false, reason: "visitor_limit" });
  await page.goto(BASE + "/voice", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Start talking" }).click();
  const consent = page.getByRole("group", { name: /Use your microphone/ });
  if ((await consent.count()) === 1) ok("explicit consent panel before microphone use");
  else bad("consent panel missing");
  if ((await page.evaluate(() => document.activeElement?.textContent)) === "Agree and start") ok("consent panel receives focus");
  else bad("consent focus wrong");
  await shot(page, "studio-consent-1280");
  await page.getByRole("button", { name: "Agree and start" }).click();
  await page.locator(STUDIO_ALERT).waitFor();
  const alertText = await page.locator(STUDIO_ALERT).innerText();
  if (/used today’s free live trials/.test(alertText)) ok("visitor-limit refusal shown accurately");
  else bad(`unexpected alert: ${alertText}`);
  await shot(page, "studio-limit-1280");
  await page.close();
}

for (const mic of [
  { name: "NotAllowedError", expect: /Microphone access was blocked/, label: "mic denied" },
  { name: "NotFoundError", expect: /No usable microphone/, label: "no microphone" },
]) {
  // Simulates the exact DOMException real browsers raise (headless Chromium has no permission prompt).
  const ctx = await browser.newContext({ viewport: { width: 390, height: 860 } });
  await ctx.addInitScript((errName) => {
    navigator.mediaDevices.getUserMedia = () => Promise.reject(new DOMException("simulated", errName));
  }, mic.name);
  const page = await ctx.newPage();
  let sessionRequested = false;
  await page.route("**/api/voice/status", (r) => r.fulfill({ json: { available: true, trialSeconds: 60 } }));
  await page.route("**/api/voice/session", (r) => {
    sessionRequested = true;
    return r.fulfill({ json: { ok: false, reason: "busy" } });
  });
  await page.goto(BASE + "/voice", { waitUntil: "networkidle" });
  await startTrial(page);
  const alert = page.locator(STUDIO_ALERT);
  await alert.waitFor({ timeout: 10000 }).catch(() => undefined);
  const txt = (await alert.count()) ? await alert.innerText() : "";
  if (mic.expect.test(txt)) ok(`${mic.label} → clear guidance`);
  else bad(`${mic.label} message: "${txt}"`);
  if (!sessionRequested) ok(`${mic.label}: no trial or credential requested`);
  else bad(`session requested despite ${mic.label}`);
  if (await page.getByRole("button", { name: "Start talking" }).isEnabled()) ok(`${mic.label}: can retry`);
  else bad(`${mic.label}: Start not re-enabled`);
  await shot(page, `studio-${mic.name}-390`);
  await ctx.close();
}

/* ------------------------------------------------------------------ */
/* 7. Full live flow with a scripted Soniox stand-in (no network)      */
/* ------------------------------------------------------------------ */
const FAKE_SONIOX = ({ originalText, translatedText, srcLang, tgtLang }) => {
  const RealWS = window.WebSocket;
  window.__czTts = 0;
  window.__czSttConfig = null;
  class FakeSoniox extends EventTarget {
    constructor(url, protocols) {
      super();
      this.url = url;
      this.protocol = Array.isArray(protocols) ? protocols[0] : "";
      this.readyState = 0;
      this.binaryType = "blob";
      this.bufferedAmount = 0;
      this.extensions = "";
      this.onopen = this.onmessage = this.onclose = this.onerror = null;
      this.isTts = url.includes("tts");
      setTimeout(() => this._emit("open", new Event("open"), (this.readyState = 1)), 30);
    }
    _emit(type, ev) {
      this.dispatchEvent(ev);
      const h = this["on" + type];
      if (h) h.call(this, ev);
    }
    _msg(obj) {
      if (this.readyState !== 1) return;
      this._emit("message", new MessageEvent("message", { data: JSON.stringify(obj) }));
    }
    send(data) {
      if (typeof data !== "string") return; // audio frames
      let msg;
      try { msg = JSON.parse(data); } catch { msg = null; }
      if (this.isTts) {
        if (msg && msg.stream_id && msg.model) this._sid = msg.stream_id;
        if (msg && msg.text_end) {
          window.__czTts += 1;
          const sid = msg.stream_id ?? this._sid;
          const samples = 24000 * 0.4;
          const bytes = new Uint8Array(samples * 2);
          const view = new DataView(bytes.buffer);
          for (let i = 0; i < samples; i++) view.setInt16(i * 2, Math.sin(i / 8) * 6000, true);
          let bin = "";
          for (const b of bytes) bin += String.fromCharCode(b);
          setTimeout(() => this._msg({ stream_id: sid, audio: btoa(bin), audio_end: true }), 60);
          setTimeout(() => this._msg({ stream_id: sid, terminated: true }), 120);
        }
        return;
      }
      if (msg && msg.model) {
        window.__czSttConfig = msg;
        const words = originalText.split(" ");
        let t = 300;
        words.forEach((w, i) => {
          setTimeout(() => this._msg({ tokens: [{ text: (i ? " " : "") + w, is_final: false, language: srcLang, translation_status: "original", confidence: 0.9 }], final_audio_proc_ms: 0, total_audio_proc_ms: t }), (t += 120));
        });
        setTimeout(() => this._msg({ tokens: [{ text: originalText, is_final: true, language: srcLang, translation_status: "original", confidence: 0.95 }], final_audio_proc_ms: t, total_audio_proc_ms: t }), (t += 150));
        setTimeout(() => this._msg({ tokens: [{ text: translatedText, is_final: true, language: tgtLang, source_language: srcLang, translation_status: "translation", confidence: 0.95 }], final_audio_proc_ms: t, total_audio_proc_ms: t }), (t += 200));
        setTimeout(() => this._msg({ tokens: [{ text: "<end>", is_final: true, confidence: 1 }], final_audio_proc_ms: t, total_audio_proc_ms: t }), (t += 100));
      } else if (data === "" || (msg && msg.type === "finalize")) {
        setTimeout(() => this._msg({ tokens: [], final_audio_proc_ms: 0, total_audio_proc_ms: 0, finished: true }), 50);
        setTimeout(() => this.close(1000), 80);
      }
    }
    close(code = 1000) {
      if (this.readyState >= 2) return;
      this.readyState = 3;
      this._emit("close", new CloseEvent("close", { code, wasClean: true }));
    }
  }
  FakeSoniox.CONNECTING = 0; FakeSoniox.OPEN = 1; FakeSoniox.CLOSING = 2; FakeSoniox.CLOSED = 3;
  window.WebSocket = new Proxy(RealWS, {
    construct(target, args) {
      return String(args[0]).includes("soniox.com") ? new FakeSoniox(...args) : new target(...args);
    },
  });
};

const GRANTED = {
  ok: true,
  sessionId: "00000000-0000-4000-8000-000000000000",
  sessionToken: "test-token",
  expiresAt: Date.now() + 65000,
  trialSeconds: 60,
  stt: { apiKey: "snx_temp_test", model: "stt-rt-v6", maxEndpointDelayMs: 700, context: { general: [], terms: [] } },
  tts: { apiKey: "snx_temp_test_tts", model: "tts-rt-v2", voice: "Adrian" },
};

for (const scenario of [
  { name: "en-es", width: 1280, from: "en", to: "es", originalText: "[QA mock] Hello, I would like to change my booking.", translatedText: "[QA mock] Hola, me gustaría cambiar mi reserva." },
  { name: "en-ar", width: 390, from: "en", to: "ar", originalText: "[QA mock] Where is my booking?", translatedText: "[QA mock] أين حجزي؟" },
]) {
  const ctx = await browser.newContext({ viewport: { width: scenario.width, height: 900 } });
  await ctx.addInitScript(FAKE_SONIOX, { originalText: scenario.originalText, translatedText: scenario.translatedText, srcLang: scenario.from, tgtLang: scenario.to });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  let endCalls = 0;
  await page.route("**/api/voice/status", (r) => r.fulfill({ json: { available: true, trialSeconds: 60 } }));
  await page.route("**/api/voice/session", (r) => r.fulfill({ json: { ...GRANTED, expiresAt: Date.now() + 65000 } }));
  await page.route("**/api/voice/session/end", (r) => {
    endCalls += 1;
    return r.fulfill({ status: 204, body: "" });
  });
  await page.goto(`${BASE}/voice?from=${scenario.from}&to=${scenario.to}`, { waitUntil: "networkidle" });
  await startTrial(page);
  await page.getByRole("button", { name: "Stop talking" }).waitFor({ timeout: 15000 });
  ok(`[${scenario.name}] connected → Stop control available`);
  await page.locator("text=" + scenario.translatedText).waitFor({ timeout: 15000 });
  ok(`[${scenario.name}] original + translated transcript rendered from token stream`);

  const cfg = await page.evaluate(() => window.__czSttConfig);
  if (cfg?.translation?.type === "two_way" && cfg.translation.language_a === scenario.from && cfg.translation.language_b === scenario.to && cfg.model === "stt-rt-v6" && cfg.enable_language_identification === true && !("api_key" in cfg)) {
    ok(`[${scenario.name}] STT config: two-way ${scenario.from}⇄${scenario.to}, language ID, no key in start message`);
  } else bad(`[${scenario.name}] unexpected STT config ${JSON.stringify(cfg)}`);

  await page.waitForFunction(() => window.__czTts >= 1, null, { timeout: 15000 });
  ok(`[${scenario.name}] completed utterance sent to TTS`);
  const dir = await page.locator(`p[lang='${scenario.to}']`).first().getAttribute("dir");
  if (dir === (scenario.to === "ar" ? "rtl" : "ltr")) ok(`[${scenario.name}] translation rendered ${dir}`);
  else bad(`[${scenario.name}] translation dir ${dir}`);
  await page.waitForTimeout(400);
  await shot(page, `studio-live-${scenario.name}-${scenario.width}`);

  await page.getByRole("button", { name: "Stop talking" }).click();
  await page.locator("text=Session ended").waitFor({ timeout: 15000 });
  ok(`[${scenario.name}] Stop → ended state`);
  await page.waitForTimeout(300);
  if (endCalls >= 1) ok(`[${scenario.name}] lease released via /end on stop`);
  else bad(`[${scenario.name}] /end not called`);
  if (errors.length) bad(`[${scenario.name}] page errors: ${errors.join(" | ")}`);
  await shot(page, `studio-ended-${scenario.name}-${scenario.width}`);
  await ctx.close();
}

/* ------------------------------------------------------------------ */
/* 8. Enquiry form honesty (real server, Resend not configured here)   */
/* ------------------------------------------------------------------ */
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(BASE + "/voice/business", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Discuss Your Requirements" }).first().click();
  await page.waitForTimeout(300);
  if ((await page.evaluate(() => document.activeElement?.getAttribute("name"))) === "name") ok("contact CTA focuses the form");
  else bad("contact CTA did not focus form");
  if (await page.getByRole("radio", { name: /Discuss our requirements/ }).isChecked()) ok("CTA preselects intent");
  else bad("intent not preselected");
  await page.getByLabel("Name").fill("QA Test");
  await page.getByLabel("Business email").fill("qa@example.com");
  await page.getByLabel("Company").fill("QA Ltd");
  await page.getByLabel("Message").fill("Browser QA — please ignore.");
  const resp = page.waitForResponse("**/api/voice/enquiry");
  await page.getByRole("button", { name: "Send message" }).click();
  const json = await (await resp).json();
  const alert = await page.locator("#voice-contact [role=alert]").innerText();
  if (json.reason === "unconfigured" && /has not been sent/.test(alert)) ok("unconfigured email → honest 'not sent' + mailto fallback");
  else if (json.ok) ok("enquiry delivered (Resend configured)");
  else bad(`enquiry state: ${JSON.stringify(json)} / ${alert}`);
  await page.locator("#voice-contact").scrollIntoViewIfNeeded();
  await shot(page, "contact-unconfigured-1280");
  await page.close();
}

/* ------------------------------------------------------------------ */
/* 9. Reduced motion                                                   */
/* ------------------------------------------------------------------ */
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  await page.goto(BASE + "/voice", { waitUntil: "networkidle" });
  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await revealAll(page);
  if (!errors.length) ok("reduced-motion: Voice pages and homepage render without errors");
  else bad(`reduced-motion errors: ${errors.join(" | ")}`);
  await ctx.close();
}

await browser.close();

console.log(`\nPASSED (${passes.length})`);
for (const p of passes) console.log(`  ✓ ${p}`);
console.log(`\nFINDINGS (${findings.length})`);
for (const f of findings) console.log(`  ✗ ${f}`);
process.exit(findings.length ? 1 : 0);
