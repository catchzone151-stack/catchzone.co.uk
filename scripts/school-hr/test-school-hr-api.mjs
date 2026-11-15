#!/usr/bin/env node
/**
 * Automated tests for the CatchZone School HR enquiry route and its content
 * rules. Imports the real route handler and mocks global fetch, so NO request
 * ever reaches Resend — no emails are sent. Run with: npm run test:school-hr
 */
import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(import.meta.url);
const jiti = require("jiti")(import.meta.url, {
  alias: { "@": path.join(root, "src") },
  interopDefault: true,
  cache: false,
});
const load = (p) => jiti(path.join(root, p));

const route = load("src/app/api/school-hr/enquiry/route.ts");
const data = load("src/data/schoolHr.ts");
const products = load("src/data/products.ts");
const nav = load("src/data/navigation.ts");

const ENV_KEYS = ["RESEND_API_KEY", "RESEND_FROM_EMAIL", "RESEND_TO_EMAIL"];
function setEnv(overrides = {}) {
  for (const k of ENV_KEYS) delete process.env[k];
  Object.assign(process.env, overrides);
}

let fetchCalls = [];
let fetchImpl = null;
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init = {}) => {
  fetchCalls.push({ url: String(url), init, body: init.body ? JSON.parse(init.body) : undefined });
  if (!fetchImpl) throw new Error(`Unexpected network call to ${url}`);
  return fetchImpl(String(url), init);
};
const resendOk = () => {
  fetchImpl = async () => new Response(JSON.stringify({ id: "mock" }), { status: 200 });
};

const results = [];
async function test(name, fn) {
  fetchCalls = [];
  fetchImpl = null;
  try {
    await fn();
    results.push({ name, ok: true });
    console.log(`  ✓ ${name}`);
  } catch (error) {
    results.push({ name, ok: false });
    console.log(`  ✗ ${name}\n    ${error?.stack?.split("\n").slice(0, 3).join("\n    ")}`);
  }
}

let ip = 1;
function req(body) {
  return new Request("https://catchzone.co.uk/api/school-hr/enquiry", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": `203.0.113.${ip++}` },
    body: JSON.stringify(body),
  });
}
const valid = {
  name: "Test <b>Person</b>",
  organisation: "Example Primary School",
  email: "head@example.org",
  interest: "standard",
  message: "Hello <script>x</script>",
};

console.log("\nSchool HR enquiry route");

await test("reports 'unconfigured' (503, never fake success) without RESEND_API_KEY", async () => {
  setEnv();
  const res = await route.POST(req(valid));
  assert.equal(res.status, 503);
  assert.deepEqual(await res.json(), { ok: false, reason: "unconfigured" });
  assert.equal(fetchCalls.length, 0);
});

await test("delivers to info@catchzone.co.uk with School HR subject, package and visitor Reply-To", async () => {
  setEnv({ RESEND_API_KEY: "re_test", RESEND_TO_EMAIL: "elsewhere@example.com" });
  resendOk();
  assert.deepEqual(await (await route.POST(req({ ...valid, submissionId: "abc12345-xyz" }))).json(), { ok: true });
  const sent = fetchCalls[0];
  assert.equal(sent.url, "https://api.resend.com/emails");
  assert.deepEqual(sent.body.to, ["info@catchzone.co.uk"]);
  assert.equal(sent.body.from, "CatchZone School HR <brief@catchzone.co.uk>");
  assert.equal(sent.body.reply_to, "head@example.org");
  assert.match(sent.body.subject, /^CatchZone School HR — Demonstration request \(Standard\) — /);
  assert.match(sent.body.text, /Standard — £3,600 per school \/ year/);
  assert.equal(sent.init.headers["Idempotency-Key"], "school-hr-enquiry/abc12345-xyz");
});

await test("RESEND_FROM_EMAIL overrides the sender (same as the other site forms)", async () => {
  setEnv({ RESEND_API_KEY: "re_test", RESEND_FROM_EMAIL: "CatchZone <hello@catchzone.co.uk>" });
  resendOk();
  await route.POST(req(valid));
  assert.equal(fetchCalls[0].body.from, "CatchZone <hello@catchzone.co.uk>");
});

await test("HTML email escapes visitor input", async () => {
  setEnv({ RESEND_API_KEY: "re_test" });
  resendOk();
  await route.POST(req(valid));
  const html = fetchCalls[0].body.html;
  assert.ok(!html.includes("<script>x</script>") && html.includes("&lt;script&gt;"));
  assert.ok(!html.includes("<b>Person</b>"));
});

await test("unknown interest falls back to a general demonstration; message is optional", async () => {
  setEnv({ RESEND_API_KEY: "re_test" });
  resendOk();
  const { message, ...noMessage } = valid;
  void message;
  assert.equal((await route.POST(req({ ...noMessage, interest: "payroll-engine" }))).status, 200);
  assert.match(fetchCalls[0].body.subject, /\(General\)/);
});

await test("validates name, organisation and email", async () => {
  setEnv({ RESEND_API_KEY: "re_test" });
  resendOk();
  for (const bad of [{ name: "" }, { organisation: "" }, { email: "not-an-email" }]) {
    const res = await route.POST(req({ ...valid, ...bad }));
    assert.equal(res.status, 400);
    assert.equal((await res.json()).reason, "missing_fields");
  }
  assert.equal(fetchCalls.length, 0);
});

await test("provider rejection or outage → 502 send_failed (never success)", async () => {
  setEnv({ RESEND_API_KEY: "re_test" });
  fetchImpl = async () => new Response("{}", { status: 422 });
  assert.equal((await route.POST(req(valid))).status, 502);
  fetchImpl = async () => {
    throw new Error("network down");
  };
  const res = await route.POST(req(valid));
  assert.equal(res.status, 502);
  assert.equal((await res.json()).reason, "send_failed");
});

await test("honeypot (cz_hp) submissions are accepted silently and never sent", async () => {
  setEnv({ RESEND_API_KEY: "re_test" });
  resendOk();
  const res = await route.POST(req({ ...valid, cz_hp: "bot" }));
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(fetchCalls.length, 0);
});

await test("rate limit: more than 5 requests from one address in 10 minutes → 429", async () => {
  setEnv();
  const one = () =>
    route.POST(
      new Request("https://catchzone.co.uk/api/school-hr/enquiry", {
        method: "POST",
        headers: { "content-type": "application/json", "x-forwarded-for": "192.0.2.77" },
        body: JSON.stringify(valid),
      }),
    );
  for (let i = 0; i < 5; i++) assert.notEqual((await one()).status, 429);
  assert.equal((await one()).status, 429);
});

console.log("\nContent and navigation rules");

await test("proposed prices are exactly £1,800 and £3,600 per school / year", () => {
  const [e, s] = data.PACKAGES;
  assert.equal(e.id, "essentials");
  assert.equal(e.price, "£1,800");
  assert.equal(s.id, "standard");
  assert.equal(s.price, "£3,600");
  for (const p of data.PACKAGES) assert.equal(p.period, "per school / year");
});

await test("optional modules are never labelled as included or available", () => {
  const optional = data.MODULES.filter((m) => m.tier === "optional");
  assert.ok(optional.length >= 8);
  for (const m of optional) assert.ok(["Planned", "Requirements discussion"].includes(m.status), m.name);
});

await test("sensitive modules (absence, casework, SCR) carry a scoping caution", () => {
  for (const id of ["absence", "casework", "scr"]) assert.ok(data.MODULES.find((m) => m.id === id)?.caution, id);
});

await test("no forbidden claims in School HR content (payroll engine, EPM/IRIS, certification, client names)", () => {
  const text = JSON.stringify([data.PACKAGES, data.MODULES, data.CAPABILITIES, data.FAQS]).toLowerCase();
  for (const bad of ["bangabandhu", "iso 27001", "cyber essentials", "certified", "gdpr compliant", "epm", "iris", "testimonial"]) {
    assert.ok(!text.includes(bad), `found "${bad}"`);
  }
  assert.ok(text.includes("not a payroll system"));
});

await test("main navigation is Services | Products | Work | About, with both products", () => {
  assert.deepEqual(nav.primaryNav.map((l) => l.label), ["Services", "Products", "Work", "About"]);
  assert.deepEqual(products.products.map((p) => p.href), ["/voice", "/school-hr"]);
  assert.ok(products.isProductsPath("/voice/languages") && products.isProductsPath("/school-hr") && products.isProductsPath("/products"));
  assert.ok(!products.isProductsPath("/services"));
});

await test("footer columns: Services (3 + flagship), Products, Company", () => {
  const [svc, prod, company] = nav.footerColumns;
  assert.equal(svc.title, "Services");
  assert.equal(svc.links.length, 4);
  assert.equal(svc.links[3].label, "Complete Digital Ecosystems");
  assert.equal(prod.title, "Products");
  assert.deepEqual(prod.links.slice(0, 2).map((l) => l.href), ["/voice", "/school-hr"]);
  assert.deepEqual(company.links.map((l) => l.href), ["/work", "/about", "/privacy"]);
});

globalThis.fetch = realFetch;
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
