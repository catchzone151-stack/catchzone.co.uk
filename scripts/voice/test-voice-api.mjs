#!/usr/bin/env node
/**
 * Automated tests for the CatchZone Voice server routes and language data.
 *
 * Imports the real route handlers and mocks global fetch, so NO request ever
 * reaches Soniox, Supabase or Resend — no credits are spent and no emails are
 * sent. Run with: npm run test:voice
 */
import assert from "node:assert/strict";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(import.meta.url);
const jiti = require("jiti")(import.meta.url, {
  alias: {
    "@": path.join(root, "src"),
    "server-only": path.join(root, "scripts/voice/server-only-stub.cjs"),
  },
  interopDefault: true,
  cache: false,
});
const load = (p) => jiti(path.join(root, p));

const statusRoute = load("src/app/api/voice/status/route.ts");
const sessionRoute = load("src/app/api/voice/session/route.ts");
const endRoute = load("src/app/api/voice/session/end/route.ts");
const enquiryRoute = load("src/app/api/voice/enquiry/route.ts");
const languages = load("src/data/voice/languages.ts");

/* ------------------------------------------------------------------ */

const SERVER_KEY = "test-long-lived-key-NEVER-SENT-TO-BROWSER";
const BASE_ENV = {
  VOICE_DEMO_ENABLED: "true",
  VOICE_DEMO_SPEND_CONTROLS_CONFIRMED: "true",
  SONIOX_DEMO_API_KEY: SERVER_KEY,
  VOICE_DEMO_HASH_SECRET: "x".repeat(40),
  VOICE_DEMO_STORE: "memory",
};
const ENV_KEYS = [
  ...Object.keys(BASE_ENV),
  "NODE_ENV",
  "VOICE_DEMO_SUPABASE_URL",
  "VOICE_DEMO_SUPABASE_SERVICE_ROLE_KEY",
  "VOICE_DEMO_MAX_CONCURRENT",
  "VOICE_DEMO_ATTEMPTS_PER_VISITOR",
  "VOICE_DEMO_ATTEMPTS_PER_IP",
  "VOICE_DEMO_DAILY_SECONDS",
  "VOICE_DEMO_TRIAL_SECONDS",
  "SONIOX_DEMO_REGION",
  "RESEND_API_KEY",
  "RESEND_TO_EMAIL",
];

function setEnv(overrides = {}) {
  for (const k of ENV_KEYS) delete process.env[k];
  process.env.NODE_ENV = "development";
  Object.assign(process.env, BASE_ENV, overrides);
  for (const [k, v] of Object.entries(overrides)) if (v === undefined) delete process.env[k];
  // Fresh in-memory store for every scenario.
  delete globalThis.__czVoiceMemoryStore;
}

let fetchCalls = [];
let fetchImpl = null;
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init = {}) => {
  fetchCalls.push({ url: String(url), init, body: init.body ? JSON.parse(init.body) : undefined });
  if (!fetchImpl) throw new Error(`Unexpected network call to ${url}`);
  return fetchImpl(String(url), init);
};

function sonioxOk() {
  let n = 0;
  fetchImpl = async (url) => {
    assert.match(url, /^https:\/\/api(\.eu)?\.soniox\.com\/v1\/auth\/temporary-api-key$/);
    n += 1;
    return new Response(JSON.stringify({ api_key: `snx_temp_${n}`, expires_at: "2026-01-01T00:00:00Z" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
}

let ipCounter = 1;
function sessionRequest({ body, origin = "https://catchzone.co.uk", contentType = "application/json", cookie, ip } = {}) {
  const headers = new Headers({ "x-forwarded-for": ip ?? `203.0.113.${ipCounter++}`, host: "catchzone.co.uk" });
  if (origin) headers.set("origin", origin);
  if (contentType) headers.set("content-type", contentType);
  if (cookie) headers.set("cookie", cookie);
  return new Request("https://catchzone.co.uk/api/voice/session", {
    method: "POST",
    headers,
    body: JSON.stringify(body ?? { source: "en", target: "es", consent: true }),
  });
}

function cookieFrom(res) {
  const raw = res.headers.get("set-cookie");
  return raw ? raw.split(";")[0] : undefined;
}

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

/* ------------------------------------------------------------------ */
console.log("\nLanguage catalogue");

await test("60 languages, unique codes, all documented by Soniox", () => {
  const codes = languages.VOICE_LANGUAGES.map((l) => l.code);
  assert.equal(codes.length, 60);
  assert.equal(new Set(codes).size, 60);
  assert.equal(languages.LANGUAGE_COUNT, 60);
});

await test("right-to-left languages are exactly Arabic, Hebrew, Persian, Urdu", () => {
  const rtl = languages.VOICE_LANGUAGES.filter((l) => l.dir === "rtl").map((l) => l.code).sort();
  assert.deepEqual(rtl, ["ar", "fa", "he", "ur"]);
});

await test("default pair is English → Spanish and pair validation rejects bad combinations", () => {
  assert.equal(languages.DEFAULT_SOURCE, "en");
  assert.equal(languages.DEFAULT_TARGET, "es");
  assert.equal(languages.isValidPair("en", "es"), true);
  assert.equal(languages.isValidPair("ar", "ja"), true);
  assert.equal(languages.isValidPair("en", "en"), false);
  assert.equal(languages.isValidPair("en", "xx"), false);
  assert.equal(languages.isValidPair("en", undefined), false);
  assert.equal(languages.isValidPair({}, "es"), false);
});

await test("every language belongs to exactly one display group", () => {
  const grouped = languages.LANGUAGE_GROUPS.flatMap((g) => g.codes);
  assert.equal(grouped.length, 60);
  assert.equal(new Set(grouped).size, 60);
});

/* ------------------------------------------------------------------ */
console.log("\nFail-closed configuration");

await test("status: disabled when VOICE_DEMO_ENABLED is not 'true' (kill switch)", async () => {
  setEnv({ VOICE_DEMO_ENABLED: "false" });
  const body = await (await statusRoute.GET()).json();
  assert.deepEqual(body, { available: false, reason: "disabled", trialSeconds: 60 });
});

await test("status: not_configured when the spend-controls confirmation is missing", async () => {
  setEnv({ VOICE_DEMO_SPEND_CONTROLS_CONFIRMED: undefined });
  const body = await (await statusRoute.GET()).json();
  assert.equal(body.available, false);
  assert.equal(body.reason, "not_configured");
});

await test("status: not_configured when Soniox key or hash secret missing/short", async () => {
  setEnv({ SONIOX_DEMO_API_KEY: undefined });
  assert.equal((await (await statusRoute.GET()).json()).reason, "not_configured");
  setEnv({ VOICE_DEMO_HASH_SECRET: "short" });
  assert.equal((await (await statusRoute.GET()).json()).reason, "not_configured");
});

await test("in-memory limits are refused in production (durable store required)", async () => {
  setEnv({ NODE_ENV: "production" });
  const body = await (await statusRoute.GET()).json();
  assert.equal(body.available, false);
  assert.equal(body.reason, "not_configured");
});

await test("session: refused with 503 and no Soniox call when disabled", async () => {
  setEnv({ VOICE_DEMO_ENABLED: undefined });
  const res = await sessionRoute.POST(sessionRequest());
  assert.equal(res.status, 503);
  assert.equal((await res.json()).reason, "disabled");
  assert.equal(fetchCalls.length, 0);
});

await test("status: available with all prerequisites; never reveals secrets", async () => {
  setEnv();
  const res = await statusRoute.GET();
  const text = await res.text();
  assert.deepEqual(JSON.parse(text), { available: true, trialSeconds: 60 });
  assert.ok(!text.includes(SERVER_KEY));
  assert.equal(res.headers.get("cache-control"), "no-store");
});

/* ------------------------------------------------------------------ */
console.log("\nRequest validation");

await test("foreign origin is rejected (403) before any limit or Soniox call", async () => {
  setEnv();
  const res = await sessionRoute.POST(sessionRequest({ origin: "https://evil.example" }));
  assert.equal(res.status, 403);
  assert.equal(fetchCalls.length, 0);
});

await test("missing origin is rejected", async () => {
  setEnv();
  assert.equal((await sessionRoute.POST(sessionRequest({ origin: null }))).status, 403);
});

await test("non-JSON content type is rejected (415)", async () => {
  setEnv();
  assert.equal((await sessionRoute.POST(sessionRequest({ contentType: "text/plain" }))).status, 415);
});

await test("consent is required", async () => {
  setEnv();
  const res = await sessionRoute.POST(sessionRequest({ body: { source: "en", target: "es" } }));
  assert.equal(res.status, 400);
  assert.equal((await res.json()).reason, "consent_required");
});

await test("unsupported or identical language pairs are refused", async () => {
  setEnv();
  for (const body of [
    { source: "en", target: "en", consent: true },
    { source: "en", target: "xx", consent: true },
    { source: "<script>", target: "es", consent: true },
  ]) {
    const res = await sessionRoute.POST(sessionRequest({ body }));
    assert.equal(res.status, 400);
    assert.equal((await res.json()).reason, "unsupported_pair");
  }
  assert.equal(fetchCalls.length, 0);
});

/* ------------------------------------------------------------------ */
console.log("\nTemporary credentials");

await test("grants restricted Soniox keys; long-lived key never reaches the client", async () => {
  setEnv();
  sonioxOk();
  const res = await sessionRoute.POST(sessionRequest());
  const text = await res.text();
  assert.equal(res.status, 200);
  assert.ok(!text.includes(SERVER_KEY), "server key leaked into response");
  const body = JSON.parse(text);
  assert.equal(body.ok, true);
  assert.equal(body.stt.apiKey.startsWith("snx_temp_"), true);
  assert.equal(body.tts.apiKey.startsWith("snx_temp_"), true);
  assert.equal(body.stt.model, "stt-rt-v6");
  assert.equal(body.tts.model, "tts-rt-v2");
  assert.equal(body.trialSeconds, 60);

  assert.equal(fetchCalls.length, 2);
  for (const call of fetchCalls) {
    assert.equal(call.init.headers.Authorization, `Bearer ${SERVER_KEY}`);
  }
  const stt = fetchCalls.find((c) => c.body.usage_type === "transcribe_websocket").body;
  const tts = fetchCalls.find((c) => c.body.usage_type === "tts_rt").body;
  assert.equal(stt.single_use, true);
  assert.equal(stt.expires_in_seconds, 30);
  assert.equal(stt.max_session_duration_seconds, 65);
  assert.match(stt.client_reference_id, /^cz-voice-demo:[0-9a-f-]{36}$/);
  assert.equal(tts.max_session_duration_seconds, 30);
  assert.equal(tts.expires_in_seconds, 90);
  assert.equal(res.headers.get("cache-control"), "no-store");
  const setCookie = res.headers.get("set-cookie");
  assert.match(setCookie, /cz_voice_vid=[0-9a-f-]{36}; Path=\/api\/voice; Max-Age=172800; HttpOnly; SameSite=Strict/);
});

await test("regional Soniox project uses the regional API domain", async () => {
  setEnv({ SONIOX_DEMO_REGION: "eu" });
  sonioxOk();
  const body = await (await sessionRoute.POST(sessionRequest())).json();
  assert.equal(body.region, "eu");
  assert.ok(fetchCalls.every((c) => c.url.startsWith("https://api.eu.soniox.com/")));
});

await test("trial length is configurable but clamped to a safe range", async () => {
  setEnv({ VOICE_DEMO_TRIAL_SECONDS: "9999" });
  sonioxOk();
  const body = await (await sessionRoute.POST(sessionRequest())).json();
  assert.equal(body.trialSeconds, 120);
  assert.equal(fetchCalls.find((c) => c.body.usage_type === "transcribe_websocket").body.max_session_duration_seconds, 125);
});

await test("provider failure → 503 provider_unavailable and the attempt is refunded", async () => {
  setEnv({ VOICE_DEMO_ATTEMPTS_PER_VISITOR: "1" });
  fetchImpl = async () => new Response("{}", { status: 401 });
  const first = await sessionRoute.POST(sessionRequest({ ip: "198.51.100.7" }));
  assert.equal(first.status, 503);
  assert.equal((await first.json()).reason, "provider_unavailable");
  const cookie = cookieFrom(first);
  sonioxOk();
  const second = await sessionRoute.POST(sessionRequest({ ip: "198.51.100.7", cookie }));
  assert.equal(second.status, 200, "refunded attempt should not count against the visitor");
});

/* ------------------------------------------------------------------ */
console.log("\nServer-enforced limits");

await test("per-visitor limit (default 2/day) via cookie, even from new IPs", async () => {
  setEnv({ VOICE_DEMO_MAX_CONCURRENT: "10" });
  sonioxOk();
  const first = await sessionRoute.POST(sessionRequest());
  const cookie = cookieFrom(first);
  assert.equal(first.status, 200);
  assert.equal((await sessionRoute.POST(sessionRequest({ cookie }))).status, 200);
  const third = await sessionRoute.POST(sessionRequest({ cookie }));
  assert.equal(third.status, 429);
  assert.equal((await third.json()).reason, "visitor_limit");
});

await test("per-IP limit applies when cookies are cleared", async () => {
  setEnv({ VOICE_DEMO_MAX_CONCURRENT: "10", VOICE_DEMO_ATTEMPTS_PER_IP: "2" });
  sonioxOk();
  const ip = "192.0.2.50";
  assert.equal((await sessionRoute.POST(sessionRequest({ ip }))).status, 200);
  assert.equal((await sessionRoute.POST(sessionRequest({ ip }))).status, 200);
  const third = await sessionRoute.POST(sessionRequest({ ip }));
  assert.equal((await third.json()).reason, "visitor_limit");
});

await test("global concurrency ceiling, released early by /end with a valid token", async () => {
  setEnv({ VOICE_DEMO_MAX_CONCURRENT: "1" });
  sonioxOk();
  const a = await (await sessionRoute.POST(sessionRequest())).json();
  const busy = await sessionRoute.POST(sessionRequest());
  assert.equal(busy.status, 503);
  assert.equal((await busy.json()).reason, "busy");

  const endReq = (payload, origin = "https://catchzone.co.uk") =>
    new Request("https://catchzone.co.uk/api/voice/session/end", {
      method: "POST",
      headers: { origin, host: "catchzone.co.uk", "content-type": "application/json", "x-forwarded-for": "203.0.113.200" },
      body: JSON.stringify(payload),
    });

  // Forged token is rejected and does not release the lease.
  const forged = await endRoute.POST(endReq({ sessionId: a.sessionId, sessionToken: "forged", expiresAt: a.expiresAt }));
  assert.equal(forged.status, 400);
  assert.equal((await sessionRoute.POST(sessionRequest())).status, 503);

  const ended = await endRoute.POST(endReq({ sessionId: a.sessionId, sessionToken: a.sessionToken, expiresAt: a.expiresAt }));
  assert.equal(ended.status, 204);
  assert.equal((await sessionRoute.POST(sessionRequest())).status, 200);
});

await test("global daily allowance is enforced and not refunded by /end", async () => {
  setEnv({ VOICE_DEMO_DAILY_SECONDS: "120", VOICE_DEMO_MAX_CONCURRENT: "10" });
  sonioxOk();
  assert.equal((await sessionRoute.POST(sessionRequest())).status, 200);
  assert.equal((await sessionRoute.POST(sessionRequest())).status, 200);
  const third = await sessionRoute.POST(sessionRequest());
  assert.equal(third.status, 429);
  assert.equal((await third.json()).reason, "daily_limit");
});

await test("burst filter rejects floods from one address before the store", async () => {
  setEnv({ VOICE_DEMO_MAX_CONCURRENT: "10", VOICE_DEMO_ATTEMPTS_PER_IP: "20", VOICE_DEMO_ATTEMPTS_PER_VISITOR: "10" });
  sonioxOk();
  const ip = "192.0.2.99";
  const statuses = [];
  for (let i = 0; i < 8; i++) statuses.push((await sessionRoute.POST(sessionRequest({ ip }))).status);
  assert.ok(statuses.includes(429), `expected a 429 in ${statuses}`);
});

/* ------------------------------------------------------------------ */
console.log("\nDurable store (Supabase RPC)");

await test("claims through voice_demo_claim RPC with hashed identifiers only", async () => {
  setEnv({
    NODE_ENV: "production",
    VOICE_DEMO_STORE: "supabase",
    VOICE_DEMO_SUPABASE_URL: "https://example-project.supabase.co",
    VOICE_DEMO_SUPABASE_SERVICE_ROLE_KEY: "service-role-test",
  });
  let n = 0;
  fetchImpl = async (url) => {
    if (url.includes("/rest/v1/rpc/voice_demo_claim")) return new Response(JSON.stringify("ok"), { status: 200 });
    n += 1;
    return new Response(JSON.stringify({ api_key: `snx_temp_${n}` }), { status: 200 });
  };
  const ip = "203.0.113.77";
  const res = await sessionRoute.POST(sessionRequest({ ip }));
  assert.equal(res.status, 200);
  const rpc = fetchCalls.find((c) => c.url.endsWith("/rpc/voice_demo_claim"));
  assert.ok(rpc);
  assert.equal(rpc.init.headers.apikey, "service-role-test");
  assert.ok(!JSON.stringify(rpc.body).includes(ip), "raw IP must never be stored");
  assert.equal(rpc.body.p_max_per_visitor, 2);
  assert.equal(rpc.body.p_max_concurrent, 2);
  assert.equal(rpc.body.p_reserved_seconds, 60);
});

await test("store outage fails closed (503 store_unavailable, no Soniox call)", async () => {
  setEnv({
    NODE_ENV: "production",
    VOICE_DEMO_STORE: "supabase",
    VOICE_DEMO_SUPABASE_URL: "https://example-project.supabase.co",
    VOICE_DEMO_SUPABASE_SERVICE_ROLE_KEY: "service-role-test",
  });
  fetchImpl = async () => new Response("boom", { status: 500 });
  const res = await sessionRoute.POST(sessionRequest());
  assert.equal(res.status, 503);
  assert.equal((await res.json()).reason, "store_unavailable");
  assert.ok(!fetchCalls.some((c) => c.url.includes("soniox")));
});

await test("store limit outcomes are passed through (visitor_limit → 429)", async () => {
  setEnv({
    NODE_ENV: "production",
    VOICE_DEMO_STORE: "supabase",
    VOICE_DEMO_SUPABASE_URL: "https://example-project.supabase.co",
    VOICE_DEMO_SUPABASE_SERVICE_ROLE_KEY: "service-role-test",
  });
  fetchImpl = async () => new Response(JSON.stringify("visitor_limit"), { status: 200 });
  const res = await sessionRoute.POST(sessionRequest());
  assert.equal(res.status, 429);
  assert.ok(!fetchCalls.some((c) => c.url.includes("soniox")));
});

/* ------------------------------------------------------------------ */
console.log("\nVoice enquiry form");

function enquiry(body) {
  return new Request("https://catchzone.co.uk/api/voice/enquiry", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": `198.51.100.${ipCounter++}` },
    body: JSON.stringify(body),
  });
}
const validEnquiry = { name: "Test", email: "test@example.com", company: "Example Ltd", message: "Hello", intent: "demonstration" };

await test("reports 'unconfigured' (never fake success) without Resend env", async () => {
  setEnv();
  const body = await (await enquiryRoute.POST(enquiry(validEnquiry))).json();
  assert.deepEqual(body, { ok: false, reason: "unconfigured" });
  assert.equal(fetchCalls.length, 0);
});

await test("validates required fields and email", async () => {
  setEnv();
  const res = await enquiryRoute.POST(enquiry({ ...validEnquiry, email: "not-an-email" }));
  assert.equal(res.status, 400);
  assert.equal((await enquiryRoute.POST(enquiry({ ...validEnquiry, company: "" }))).status, 400);
});

await test("sends via Resend (mocked) with reply-to and reports delivery failures", async () => {
  setEnv({ RESEND_API_KEY: "re_test", RESEND_TO_EMAIL: "inbox@example.com" });
  fetchImpl = async () => new Response("{}", { status: 200 });
  assert.deepEqual(await (await enquiryRoute.POST(enquiry(validEnquiry))).json(), { ok: true });
  const sent = fetchCalls[0];
  assert.equal(sent.url, "https://api.resend.com/emails");
  assert.equal(sent.body.reply_to, "test@example.com");
  assert.match(sent.body.subject, /private demonstration/);

  fetchImpl = async () => new Response("{}", { status: 500 });
  const failed = await enquiryRoute.POST(enquiry(validEnquiry));
  assert.equal(failed.status, 502);
  assert.equal((await failed.json()).reason, "send_failed");
});

await test("honeypot submissions are accepted silently and never sent", async () => {
  setEnv({ RESEND_API_KEY: "re_test", RESEND_TO_EMAIL: "inbox@example.com" });
  fetchImpl = async () => new Response("{}", { status: 200 });
  assert.deepEqual(await (await enquiryRoute.POST(enquiry({ ...validEnquiry, website: "spam" }))).json(), { ok: true });
  assert.equal(fetchCalls.length, 0);
});

/* ------------------------------------------------------------------ */
globalThis.fetch = realFetch;
const failed = results.filter((r) => !r.ok);
console.log(`\n${results.length - failed.length}/${results.length} passed`);
process.exit(failed.length ? 1 : 0);
