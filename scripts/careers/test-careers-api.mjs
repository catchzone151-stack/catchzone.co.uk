#!/usr/bin/env node
/**
 * Tests for the Careers expression-of-interest route and Careers content
 * rules. Imports the real route handler and mocks global fetch — NO email is
 * ever sent. Run with: npm run test:careers
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

const route = load("src/app/api/careers/interest/route.ts");
const careers = load("src/data/careers.ts");

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
function setEnv(o = {}) {
  for (const k of ["RESEND_API_KEY", "RESEND_FROM_EMAIL"]) delete process.env[k];
  Object.assign(process.env, o);
}

const results = [];
async function test(name, fn) {
  fetchCalls = [];
  fetchImpl = null;
  try {
    await fn();
    results.push({ ok: true });
    console.log(`  ✓ ${name}`);
  } catch (e) {
    results.push({ ok: false });
    console.log(`  ✗ ${name}\n    ${e?.stack?.split("\n").slice(0, 3).join("\n    ")}`);
  }
}

let ip = 1;
const req = (body) =>
  new Request("https://catchzone.co.uk/api/careers/interest", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": `198.18.0.${ip++}` },
    body: JSON.stringify(body),
  });
const valid = { name: "Test <i>Applicant</i>", email: "dev@example.org", area: "qa", link: "https://example.org/portfolio", message: "Hello <script>x</script>" };

console.log("\nCareers expression-of-interest route");

await test("reports 'unconfigured' (503, never fake success) without RESEND_API_KEY", async () => {
  setEnv();
  const res = await route.POST(req(valid));
  assert.equal(res.status, 503);
  assert.equal((await res.json()).reason, "unconfigured");
  assert.equal(fetchCalls.length, 0);
});

await test("delivers to info@catchzone.co.uk with a Careers subject distinct from sales enquiries", async () => {
  setEnv({ RESEND_API_KEY: "re_test" });
  resendOk();
  assert.equal((await route.POST(req({ ...valid, submissionId: "abc12345-car" }))).status, 200);
  const b = fetchCalls[0].body;
  assert.deepEqual(b.to, ["info@catchzone.co.uk"]);
  assert.equal(b.from, "CatchZone Careers <brief@catchzone.co.uk>");
  assert.equal(b.reply_to, "dev@example.org");
  assert.match(b.subject, /^CatchZone Careers — Expression of interest \(Software Quality Assurance\) — /);
  assert.match(b.text, /not a client enquiry/);
  assert.equal(fetchCalls[0].init.headers["Idempotency-Key"], "careers-interest/abc12345-car");
});

await test("escapes visitor input in the HTML email", async () => {
  setEnv({ RESEND_API_KEY: "re_test" });
  resendOk();
  await route.POST(req(valid));
  const html = fetchCalls[0].body.html;
  assert.ok(!html.includes("<script>x</script>") && !html.includes("<i>Applicant</i>"));
});

await test("validates name, email and message; rejects non-http(s) or credentialed links", async () => {
  setEnv({ RESEND_API_KEY: "re_test" });
  resendOk();
  for (const bad of [{ name: "" }, { email: "nope" }, { message: "" }, { link: "javascript:alert(1)" }, { link: "https://user:pw@example.org" }, { link: "not a url" }]) {
    const res = await route.POST(req({ ...valid, ...bad }));
    assert.equal(res.status, 400, JSON.stringify(bad));
  }
  assert.equal(fetchCalls.length, 0);
});

await test("link is optional; unknown or prototype area names fall back to 'other'", async () => {
  setEnv({ RESEND_API_KEY: "re_test" });
  resendOk();
  assert.equal((await route.POST(req({ ...valid, link: "", area: "toString" }))).status, 200);
  assert.match(fetchCalls[0].body.subject, /Another area of software or product work/);
});

await test("provider failure → 502 send_failed; honeypot never sends", async () => {
  setEnv({ RESEND_API_KEY: "re_test" });
  fetchImpl = async () => new Response("{}", { status: 500 });
  assert.equal((await route.POST(req(valid))).status, 502);
  fetchCalls = [];
  resendOk();
  assert.deepEqual(await (await route.POST(req({ ...valid, cz_hp: "x" }))).json(), { ok: true });
  assert.equal(fetchCalls.length, 0);
});

console.log("\nCross-site form guard (shared by all enquiry routes)");

const guarded = (headers, body = JSON.stringify(valid)) =>
  new Request("https://catchzone.co.uk/api/careers/interest", {
    method: "POST",
    headers: { "x-forwarded-for": `198.18.1.${ip++}`, ...headers },
    body,
  });

await test("non-JSON bodies (e.g. a cross-site text/plain form) are refused with 415", async () => {
  setEnv({ RESEND_API_KEY: "re_test" });
  resendOk();
  const res = await route.POST(guarded({ "content-type": "text/plain" }));
  assert.equal(res.status, 415);
  assert.equal(fetchCalls.length, 0);
});

await test("cross-site browser requests are refused (Sec-Fetch-Site / foreign Origin)", async () => {
  setEnv({ RESEND_API_KEY: "re_test" });
  resendOk();
  assert.equal((await route.POST(guarded({ "content-type": "application/json", "sec-fetch-site": "cross-site", origin: "https://evil.example" }))).status, 403);
  assert.equal((await route.POST(guarded({ "content-type": "application/json", origin: "https://evil.example", host: "catchzone.co.uk" }))).status, 403);
  assert.equal(fetchCalls.length, 0);
});

await test("same-origin and allow-listed origins are accepted", async () => {
  setEnv({ RESEND_API_KEY: "re_test" });
  resendOk();
  assert.equal((await route.POST(guarded({ "content-type": "application/json", "sec-fetch-site": "same-origin", origin: "https://catchzone.co.uk" }))).status, 200);
  assert.equal((await route.POST(guarded({ "content-type": "application/json", origin: "https://www.catchzone.co.uk", host: "internal:3000" }))).status, 200);
  assert.equal((await route.POST(guarded({ "content-type": "application/json", origin: "http://preview.local:3000", host: "preview.local:3000" }))).status, 200);
});

for (const [name, path] of [["start-a-project", "src/app/api/start-a-project/route.ts"], ["voice enquiry", "src/app/api/voice/enquiry/route.ts"], ["school-hr enquiry", "src/app/api/school-hr/enquiry/route.ts"]]) {
  await test(`${name} route applies the same guard`, async () => {
    const r = load(path);
    const res = await r.POST(new Request("https://catchzone.co.uk/x", { method: "POST", headers: { "content-type": "application/json", "sec-fetch-site": "cross-site" }, body: "{}" }));
    assert.equal(res.status, 403);
  });
}

console.log("\nCareers content rules");

await test("two role profiles: Full-Stack Software Engineer and Software QA Engineer", () => {
  assert.deepEqual(careers.ROLE_PROFILES.map((r) => r.title), ["Full-Stack Software Engineer", "Software Quality Assurance Engineer"]);
  for (const r of careers.ROLE_PROFILES) assert.ok(r.responsibilities.length >= 10 && r.skills.length >= 9, r.title);
});

await test("no salaries, vacancy references, closing dates or JobPosting schema", () => {
  const data = JSON.stringify(careers).toLowerCase();
  for (const bad of ["£", "salary", "per annum", "closing date", "ref:", "vacancy ref", "apply by"]) assert.ok(!data.includes(bad), bad);
  const page = fs.readFileSync(path.join(root, "src/app/careers/page.tsx"), "utf8");
  assert.ok(!/"JobPosting"/.test(page), "JobPosting schema found");
  assert.ok(!/<input[^>]*type="file"/.test(fs.readFileSync(path.join(root, "src/components/careers/CareersInterestForm.tsx"), "utf8")), "file upload found");
});

globalThis.fetch = realFetch;
const failed = results.filter((r) => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
