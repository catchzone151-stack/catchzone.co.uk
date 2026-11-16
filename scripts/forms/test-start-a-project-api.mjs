#!/usr/bin/env node
/**
 * Tests for the Start a Project route (/api/start-a-project). Imports the real
 * route handler and mocks global fetch — NO email is ever sent.
 * Run with: npm run test:forms
 */
import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(import.meta.url);
const jiti = require("jiti")(import.meta.url, { alias: { "@": path.join(root, "src") }, interopDefault: true, cache: false });
const route = jiti(path.join(root, "src/app/api/start-a-project/route.ts"));

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

// Silence the route's expected server-side error logs, but keep them for assertions.
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
  new Request("https://catchzone.co.uk/api/start-a-project", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": `198.18.1.${ip++}`, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });
const valid = {
  buildType: "business-system",
  startingPoint: "idea",
  priorities: ["automation", "automation", "bogus"],
  budget: "10k-25k",
  name: "Test\r\nBcc: victim@example.org",
  email: "client@example.org",
  company: "Example <b>Ltd</b>",
  phone: "",
  description: "We need a portal <script>alert(1)</script>",
  submissionId: "test-submission-0001",
};

console.log("\nStart a Project route (Resend mocked — no email is sent)");

await test("valid brief → one Resend call to the fixed inbox, Reply-To the client, default sender", async () => {
  setEnv({ RESEND_API_KEY: "re_test_key" });
  resendOk();
  const res = await route.POST(req(valid));
  assert.equal(res.status, 200);
  assert.deepEqual(await res.json(), { ok: true });
  assert.equal(fetchCalls.length, 1);
  const { url, init, body } = fetchCalls[0];
  assert.equal(url, "https://api.resend.com/emails");
  assert.deepEqual(body.to, ["info@catchzone.co.uk"]);
  assert.equal(body.reply_to, "client@example.org");
  assert.equal(body.from, "CatchZone Project Brief <brief@catchzone.co.uk>");
  assert.equal(init.headers["Idempotency-Key"], "start-a-project/test-submission-0001");
});

await test("header injection: CR/LF stripped from name/subject; HTML escaped; priorities de-duplicated and whitelisted", async () => {
  setEnv({ RESEND_API_KEY: "re_test_key" });
  resendOk();
  await route.POST(req(valid));
  const { body } = fetchCalls[0];
  assert.ok(!/[\r\n]/.test(body.subject), body.subject);
  assert.ok(!body.html.includes("<script>"), "script tag must be escaped");
  assert.ok(body.html.includes("&lt;script&gt;"));
  assert.ok(!body.html.includes("<b>Ltd</b>"));
  assert.equal((body.text.match(/Automation/g) || []).length, 1);
  assert.ok(!/bogus/i.test(body.text));
});

await test("RESEND_FROM_EMAIL override is used when well-formed, ignored when it contains a newline", async () => {
  setEnv({ RESEND_API_KEY: "re_test_key", RESEND_FROM_EMAIL: "CatchZone <hello@catchzone.co.uk>" });
  resendOk();
  await route.POST(req(valid));
  assert.equal(fetchCalls[0].body.from, "CatchZone <hello@catchzone.co.uk>");
  setEnv({ RESEND_API_KEY: "re_test_key", RESEND_FROM_EMAIL: "x@catchzone.co.uk\r\nBcc: a@b.c" });
  fetchCalls = [];
  await route.POST(req(valid));
  assert.equal(fetchCalls[0].body.from, "CatchZone Project Brief <brief@catchzone.co.uk>");
});

await test("honeypot filled → generic success, nothing sent", async () => {
  setEnv({ RESEND_API_KEY: "re_test_key" });
  const res = await route.POST(req({ ...valid, cz_hp: "https://spam.example" }));
  assert.equal(res.status, 200);
  assert.equal(fetchCalls.length, 0);
});

await test("missing / invalid fields → 400 missing_fields, nothing sent", async () => {
  setEnv({ RESEND_API_KEY: "re_test_key" });
  for (const bad of [
    { ...valid, email: "not-an-email" },
    { ...valid, name: "   " },
    { ...valid, description: "" },
    { ...valid, buildType: "rocket" },
    { ...valid, priorities: ["bogus"] },
    { ...valid, budget: undefined },
  ]) {
    const res = await route.POST(req(bad));
    assert.equal(res.status, 400);
    assert.equal((await res.json()).reason, "missing_fields");
  }
  assert.equal(fetchCalls.length, 0);
});

await test("non-JSON content type → 415; malformed JSON → 400; cross-site request → 403", async () => {
  setEnv({ RESEND_API_KEY: "re_test_key" });
  assert.equal((await route.POST(req(valid, { "content-type": "text/plain" }))).status, 415);
  assert.equal((await route.POST(req("{not json"))).status, 400);
  assert.equal((await route.POST(req(valid, { "sec-fetch-site": "cross-site" }))).status, 403);
  assert.equal((await route.POST(req(valid, { origin: "https://evil.example" }))).status, 403);
  assert.equal(fetchCalls.length, 0);
});

await test("no RESEND_API_KEY → 503 unconfigured, no network call", async () => {
  setEnv({});
  const res = await route.POST(req(valid));
  assert.equal(res.status, 503);
  assert.equal((await res.json()).reason, "unconfigured");
  assert.equal(fetchCalls.length, 0);
});

await test("Resend rejection / network failure → 502 send_failed; the API key is never logged or returned", async () => {
  setEnv({ RESEND_API_KEY: "re_secret_should_not_leak" });
  fetchImpl = async () => new Response(JSON.stringify({ name: "validation_error", message: "bad from" }), { status: 422 });
  let res = await route.POST(req(valid));
  assert.equal(res.status, 502);
  const text = JSON.stringify(await res.json());
  fetchImpl = async () => {
    throw new TypeError("fetch failed");
  };
  res = await route.POST(req(valid));
  assert.equal(res.status, 502);
  assert.ok(!(text + logged.join(" ")).includes("re_secret_should_not_leak"));
});

await test("rate limit: sixth request from one IP within the window → 429", async () => {
  setEnv({ RESEND_API_KEY: "re_test_key" });
  resendOk();
  const fixed = { "x-forwarded-for": "203.0.113.9" };
  const codes = [];
  for (let i = 0; i < 6; i++) codes.push((await route.POST(req(valid, fixed))).status);
  assert.deepEqual(codes, [200, 200, 200, 200, 200, 429]);
  // a spoofed left-most XFF entry does not reset the limit
  assert.equal((await route.POST(req(valid, { "x-forwarded-for": "1.2.3.4, 203.0.113.9" }))).status, 429);
});

const failed = results.filter((r) => !r).length;
console.log(`\n${results.length - failed}/${results.length} passed`);
process.exit(failed ? 1 : 0);
