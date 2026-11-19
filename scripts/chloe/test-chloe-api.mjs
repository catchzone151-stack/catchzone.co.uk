#!/usr/bin/env node
/**
 * Tests for Chloe: the enquiry route (/api/chloe/enquiry) with Resend mocked —
 * NO email is ever sent — plus the conversation data (prices match the
 * pricing source, every node is reachable, keyword matching, no dead links).
 * Run with: npm run test:chloe
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(import.meta.url);
const jiti = require("jiti")(import.meta.url, { alias: { "@": path.join(root, "src") }, interopDefault: true, cache: false });
const route = jiti(path.join(root, "src/app/api/chloe/enquiry/route.ts"));
const chloe = jiti(path.join(root, "src/data/chloe.ts"));
const pricing = jiti(path.join(root, "src/data/pricing.ts"));
const booking = jiti(path.join(root, "src/data/booking.ts"));

let fetchCalls = [];
let fetchImpl = null;
globalThis.fetch = async (url, init = {}) => {
  fetchCalls.push({ url: String(url), init, body: init.body ? JSON.parse(init.body) : undefined });
  if (!fetchImpl) throw new Error(`Unexpected network call to ${url}`);
  return fetchImpl(String(url), init);
};
const resendOk = () => {
  fetchImpl = async () => new Response(JSON.stringify({ id: "mock" }), { status: 200 });
};
function setEnv(o = {}) {
  for (const k of ["RESEND_API_KEY", "RESEND_FROM_EMAIL"]) delete process.env[k];
  Object.assign(process.env, o);
}
const logged = [];
console.error = (...a) => logged.push(a.join(" "));

const results = [];
async function test(name, fn) {
  fetchCalls = [];
  fetchImpl = null;
  logged.length = 0;
  try {
    await fn();
    results.push(true);
    console.log(`  ✓ ${name}`);
  } catch (e) {
    results.push(false);
    console.log(`  ✗ ${name}\n    ${e?.stack?.split("\n").slice(0, 3).join("\n    ")}`);
  }
}

let ip = 1;
const req = (body, headers = {}) =>
  new Request("https://catchzone.co.uk/api/chloe/enquiry", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": `198.18.7.${ip++}`, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
const valid = {
  topic: "mobile-app",
  name: "Sam\r\nBcc: victim@example.org",
  email: "sam@example.org",
  phone: "+44 7700 900123",
  message: "An app for our members <script>alert(1)</script>",
  timescale: "1-3-months",
  budget: "5k-10k",
  page: "/pricing",
  submissionId: "chloe-submission-0001",
};

console.log("\nChloe enquiry route (Resend mocked — no email is sent)");

await test("valid enquiry → one Resend call: fixed inbox, Reply-To visitor, approved subject, all fields + source + timestamp", async () => {
  setEnv({ RESEND_API_KEY: "re_test_key" });
  resendOk();
  const res = await route.POST(req(valid));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(fetchCalls.length, 1);
  const { url, init, body } = fetchCalls[0];
  assert.equal(url, "https://api.resend.com/emails");
  assert.deepEqual(body.to, ["info@catchzone.co.uk"]);
  assert.equal(body.reply_to, "sam@example.org");
  assert.equal(body.from, "CatchZone Website <brief@catchzone.co.uk>");
  assert.equal(body.subject, "New CatchZone Enquiry — Android & iOS Mobile App — Chloe");
  assert.equal(init.headers["Idempotency-Key"], "chloe-enquiry/chloe-submission-0001");
  for (const s of ["Name: Sam Bcc: victim@example.org", "Email: sam@example.org", "Phone: +44 7700 900123", "Selected service: Android & iOS Mobile App", "Preferred timescale: Within 1–3 months", "Indicative budget: £5k – £10k", "Enquiry source: Chloe", "Page: catchzone.co.uk/pricing", "Submitted: "]) {
    assert.ok(body.text.includes(s), `missing "${s}"`);
  }
});

await test("escaping: HTML escaped, CR/LF stripped, subject never contains visitor text", async () => {
  setEnv({ RESEND_API_KEY: "re_test_key" });
  resendOk();
  await route.POST(req(valid));
  const { body } = fetchCalls[0];
  assert.ok(!/[\r\n]/.test(body.subject));
  assert.ok(!body.html.includes("<script>"));
  assert.ok(body.html.includes("&lt;script&gt;"));
  assert.ok(!body.subject.includes("Sam"));
});

await test("optional fields may be omitted; unknown timescale/budget/page values are dropped, not echoed", async () => {
  setEnv({ RESEND_API_KEY: "re_test_key" });
  resendOk();
  const res = await route.POST(req({ ...valid, phone: "", timescale: "<b>now</b>", budget: "1m", page: "https://evil.example/x" }));
  assert.equal(res.status, 200);
  const { body } = fetchCalls[0];
  assert.ok(body.text.includes("Phone: Not provided"));
  assert.ok(body.text.includes("Preferred timescale: Not provided"));
  assert.ok(body.text.includes("Indicative budget: Not provided"));
  assert.ok(body.text.includes("Page: Not recorded"));
  assert.ok(!body.html.includes("evil.example"));
});

await test("topics: products and combinations labelled from the whitelist; unapproved combination falls back to 'Combined build'", async () => {
  setEnv({ RESEND_API_KEY: "re_test_key" });
  resendOk();
  const cases = [
    [{ topic: "voice" }, "CatchZone Voice"],
    [{ topic: "school-hr" }, "CatchZone School HR"],
    [{ topic: "call" }, "Call request"],
    [{ topic: "combination", combination: ["web-application", "business-system"] }, "Web Application + Business Platform (combined build)"],
    [{ topic: "combination", combination: ["premium-website", "complete-ecosystem"] }, "Combined build"],
  ];
  for (const [extra, label] of cases) {
    fetchCalls = [];
    await route.POST(req({ ...valid, ...extra }));
    assert.equal(fetchCalls[0].body.subject, `New CatchZone Enquiry — ${label} — Chloe`);
  }
});

await test("validation: missing name/email/message, bad email, unknown topic, bad phone → 400, nothing sent", async () => {
  setEnv({ RESEND_API_KEY: "re_test_key" });
  for (const [bad, reason] of [
    [{ ...valid, name: " " }, "missing_fields"],
    [{ ...valid, email: "nope" }, "missing_fields"],
    [{ ...valid, message: "" }, "missing_fields"],
    [{ ...valid, topic: "crypto" }, "missing_fields"],
    [{ ...valid, topic: undefined }, "missing_fields"],
    [{ ...valid, phone: "call me maybe" }, "invalid_phone"],
  ]) {
    const res = await route.POST(req(bad));
    assert.equal(res.status, 400);
    assert.equal((await res.json()).reason, reason);
  }
  assert.equal(fetchCalls.length, 0);
});

await test("length limits: long message truncated to 3000 chars", async () => {
  setEnv({ RESEND_API_KEY: "re_test_key" });
  resendOk();
  await route.POST(req({ ...valid, message: "x".repeat(10000) }));
  assert.ok(fetchCalls[0].body.text.includes("x".repeat(3000)));
  assert.ok(!fetchCalls[0].body.text.includes("x".repeat(3001)));
});

await test("honeypot → generic success, nothing sent; JSON-only, same-origin guard", async () => {
  setEnv({ RESEND_API_KEY: "re_test_key" });
  assert.equal((await route.POST(req({ ...valid, cz_hp: "spam" }))).status, 200);
  assert.equal((await route.POST(req(valid, { "content-type": "text/plain" }))).status, 415);
  assert.equal((await route.POST(req("{bad"))).status, 400);
  assert.equal((await route.POST(req("[1,2]"))).status, 400);
  assert.equal((await route.POST(req(valid, { "sec-fetch-site": "cross-site" }))).status, 403);
  assert.equal(fetchCalls.length, 0);
});

await test("never false success: no key → 503 unconfigured; Resend failure/outage → 502; key never logged", async () => {
  setEnv({});
  let res = await route.POST(req(valid));
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { ok: false, reason: "unconfigured" });
  setEnv({ RESEND_API_KEY: "re_secret_value" });
  fetchImpl = async () => new Response(JSON.stringify({ message: "nope" }), { status: 422 });
  res = await route.POST(req(valid));
  assert.equal(res.status, 502);
  fetchImpl = async () => {
    throw new TypeError("network");
  };
  res = await route.POST(req(valid));
  assert.equal(res.status, 502);
  assert.ok(!logged.join(" ").includes("re_secret_value"));
});

await test("rate limit: sixth request from one IP within 10 minutes → 429", async () => {
  setEnv({ RESEND_API_KEY: "re_test_key" });
  resendOk();
  const statuses = [];
  for (let i = 0; i < 6; i++) statuses.push((await route.POST(req(valid, { "x-forwarded-for": "203.0.113.77" }))).status);
  assert.deepEqual(statuses, [200, 200, 200, 200, 200, 429]);
});

console.log("\nChloe conversation and pricing data");

await test("approved prices: five services and six combinations exactly as specified", async () => {
  const prices = Object.fromEntries(pricing.pricedServices.map((s) => [s.id, s.from]));
  assert.deepEqual(prices, { "premium-website": 3500, "web-application": 4000, "mobile-app": 4000, "business-system": 6200, "complete-ecosystem": 18000 });
  const combos = Object.fromEntries(pricing.combinations.map((c) => [pricing.combinationKey(c.services), c.from]));
  assert.deepEqual(combos, {
    "premium-website+web-application": 7200,
    "premium-website+mobile-app": 7200,
    "premium-website+business-system": 9300,
    "web-application+mobile-app": 7600,
    "web-application+business-system": 9700,
    "mobile-app+business-system": 9700,
  });
  assert.equal(pricing.combinations.filter((c) => c.popular).length, 3);
});

await test("Chloe only quotes approved figures; no banned packages or invented promises", async () => {
  const allowed = new Set(["3,500", "4,000", "6,200", "18,000", "7,200", "9,300", "7,600", "9,700", "5k", "10k", "25k"]);
  const text = JSON.stringify(chloe.CHLOE_NODES) + JSON.stringify(pricing.pricedServices) + JSON.stringify(pricing.pricingFaqs);
  for (const m of text.matchAll(/£\s?(\d{1,3}(?:,\d{3})*k?)/g)) assert.ok(allowed.has(m[1]), `unexpected price £${m[1]}`);
  for (const banned of ["15,000", "£495", "1,950", "10,000 minimum", "VAT", "unlimited", "testimonial"]) {
    assert.ok(!text.includes(banned), `found "${banned}"`);
  }
  // "guarantee" may only appear as an honest limitation ("can’t be guaranteed").
  for (const m of text.matchAll(/guarantee/gi)) {
    assert.match(text.slice(Math.max(0, m.index - 10), m.index), /can’t be $|cannot be $/, "unqualified guarantee");
  }
  assert.equal(chloe.CHLOE_GREETING, "Hi, I'm Chloe, CatchZone's digital assistant. How can I help you today?");
});

await test("conversation graph: start offers the seven options; every 'go' target exists and every node is reachable", async () => {
  const labels = chloe.CHLOE_NODES.start.actions.map((a) => a.label);
  assert.deepEqual(labels, ["Build a website", "Build a web application", "Build an Android & iOS app", "Build a business platform", "Complete Digital Ecosystem", "Ask a question", "Book a call"]);
  const ids = Object.keys(chloe.CHLOE_NODES);
  const seen = new Set(["start"]);
  const queue = ["start"];
  while (queue.length) {
    for (const a of chloe.CHLOE_NODES[queue.shift()].actions) {
      if (a.kind !== "go") continue;
      assert.ok(ids.includes(a.node), `missing node ${a.node}`);
      if (!seen.has(a.node)) seen.add(a.node) && queue.push(a.node);
    }
  }
  // fallback / android-ios / websites / platforms / ecosystem / booking are reached by typed questions.
  const typedOnly = ["fallback", "faq:android-ios", "faq:websites", "faq:platforms", "faq:ecosystem", "faq:booking"];
  for (const id of ids) assert.ok(seen.has(id) || typedOnly.includes(id), `unreachable node ${id}`);
});

await test("every internal link Chloe offers points at a real route", async () => {
  for (const node of Object.values(chloe.CHLOE_NODES)) {
    for (const a of node.actions) {
      if (a.kind !== "link") continue;
      const p = a.href.split(/[?#]/)[0];
      const file = p === "/" ? "src/app/page.tsx" : `src/app${p}/page.tsx`;
      assert.ok(fs.existsSync(path.join(root, file)), `${a.href} → ${file}`);
    }
  }
});

await test("keyword recognition: typical questions reach the right answer; nonsense gets the honest fallback", async () => {
  const cases = [
    ["How much does a website cost?", "faq:prices"],
    ["what are your prices", "faq:prices"],
    ["Can I get a website and an app together?", "faq:combinations"],
    ["Do you build for iPhone and Android?", "faq:android-ios"],
    ["Do I need an Apple developer account?", "faq:developer-accounts"],
    ["I need a customer portal", "service:web-application"],
    ["we run everything on spreadsheets", "faq:platforms"],
    ["How long will it take?", "faq:timescales"],
    ["Do you offer maintenance after launch?", "faq:support"],
    ["Can I book a call?", "book"],
    ["Tell me about Voice translation", "faq:voice"],
    ["HR software for schools", "faq:school-hr"],
    ["I want an app", "service:mobile-app"],
    ["purple elephants", "fallback"],
    ["", "fallback"],
  ];
  for (const [q, expected] of cases) assert.equal(chloe.matchQuestion(q), expected, q);
});

await test("booking config: only well-formed Cal.com paths are accepted; nothing is configured by default", async () => {
  const n = booking.normaliseCalLink;
  assert.equal(n("catchzone/intro-call"), "catchzone/intro-call");
  assert.equal(n("https://cal.com/catchzone/intro-call?x=1"), "catchzone/intro-call");
  assert.equal(n("team/catchzone/consultation"), "team/catchzone/consultation");
  for (const bad of ["", undefined, "javascript:alert(1)", "https://evil.example/a/b", "a", "a/b/c/d", "a/<b>"]) assert.equal(n(bad), null, String(bad));
  for (const ev of Object.values(booking.bookingEvents)) {
    const env = { intro: "NEXT_PUBLIC_CAL_INTRO_CALL", consultation: "NEXT_PUBLIC_CAL_PROJECT_CONSULTATION", "voice-demo": "NEXT_PUBLIC_CAL_VOICE_DEMO", "school-hr-demo": "NEXT_PUBLIC_CAL_SCHOOL_HR_DEMO" }[ev.id];
    if (!process.env[env]) assert.equal(ev.calLink, null, ev.id);
  }
});

const passed = results.filter(Boolean).length;
console.log(`\n${passed}/${results.length} passed`);
process.exit(passed === results.length ? 0 : 1);
