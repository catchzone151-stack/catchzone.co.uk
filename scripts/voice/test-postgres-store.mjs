#!/usr/bin/env node
/**
 * REAL development PostgreSQL integration tests; no Soniox/Resend calls.
 * Refuses production; requires the Voice-only schema already applied to dev.
 * Test rows are removed in finally. No DDL, no production connection option.
 */
import assert from "node:assert/strict";
import { randomUUID, createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import { Pool } from "pg";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const require = createRequire(import.meta.url);
if (process.env.NODE_ENV === "production" || process.env.REPLIT_DEPLOYMENT === "1") {
  throw new Error("Integration tests are development-only");
}
if (!process.env.DATABASE_URL) throw new Error("Development DATABASE_URL is required");
const jiti = require("jiti")(import.meta.url, {
  alias: { "@": path.join(root, "src"), "server-only": path.join(root, "scripts/voice/server-only-stub.cjs") },
  interopDefault: true, cache: false,
});
const { PostgresStore, createVoicePool } = jiti(path.join(root, "src/lib/voice/server/postgresStore.ts"));
const { getVoiceDemoConfig } = jiti(path.join(root, "src/lib/voice/server/config.ts"));
const sessionRoute = jiti(path.join(root, "src/app/api/voice/session/route.ts"));
const endRoute = jiti(path.join(root, "src/app/api/voice/session/end/route.ts"));
const maintenanceRoute = jiti(path.join(root, "src/app/api/voice/maintenance/route.ts"));
const realUrl = process.env.DATABASE_URL;
const pool = new Pool({ connectionString: realUrl, max: 8, connectionTimeoutMillis: 2000 });
const secondPool = createVoicePool(realUrl);
const store = new PostgresStore(pool);
const otherStore = new PostgresStore(secondPool);
const owned = new Set();
const hash = (v) => createHash("sha256").update(v).digest("base64url");
const input = (overrides = {}) => {
  const sessionId = randomUUID();
  owned.add(sessionId);
  return {
    sessionId, ipHash: hash(randomUUID()), visitorHash: hash(randomUUID()),
    reservedSeconds: 60, leaseSeconds: 80, maxPerVisitor: 2, maxPerIp: 4,
    dailySeconds: 1800, maxConcurrent: 2, ...overrides,
  };
};
const clear = async () => {
  if (owned.size) await pool.query("DELETE FROM public.voice_demo_pg_sessions WHERE session_id = ANY($1::uuid[])", [[...owned]]);
  owned.clear();
};
let passed = 0;
let total = 0;
async function test(name, fn) {
  total++;
  await clear();
  try { await fn(); passed++; console.log(`  ✓ ${name}`); }
  catch (e) {
    // Assertions use safe booleans/numbers, but never dump driver errors or URLs.
    console.error(`  ✗ ${name} (${e?.name || "Error"})`);
    process.exitCode = 1;
  }
}

const originalFetch = globalThis.fetch;
let fetchCount = 0;
let rejectProvider = false;
globalThis.fetch = async (url) => {
  assert.match(String(url), /^https:\/\/api\.soniox\.com\/v1\/auth\/temporary-api-key$/);
  fetchCount++;
  return new Response(JSON.stringify(rejectProvider ? {} : {
    api_key: "mock-temporary-key", expires_at: "2099-01-01T00:00:00Z",
  }), { status: rejectProvider ? 401 : 200 });
};
function configure(overrides = {}) {
  Object.assign(process.env, {
    NODE_ENV: "development", VOICE_DEMO_ENABLED: "true",
    VOICE_DEMO_STORE: "postgres", DATABASE_URL: realUrl,
    VOICE_DEMO_SPEND_CONTROLS_CONFIRMED: "true",
    SONIOX_DEMO_API_KEY: "mock-only-not-a-provider-key",
    VOICE_DEMO_HASH_SECRET: "test-only-".repeat(5),
  }, overrides);
  delete process.env.SONIOX_DEMO_REGION;
}
let requestId = 0;
function request(body) {
  return new Request("https://catchzone.co.uk/api/voice/session", {
    method: "POST",
    headers: { origin: "https://catchzone.co.uk", host: "catchzone.co.uk",
      "content-type": "application/json", "x-forwarded-for": `198.18.1.${++requestId}` },
    body: JSON.stringify(body),
  });
}

try {
  const { rows: [initial] } = await pool.query("SELECT count(*)::int AS n FROM public.voice_demo_pg_sessions");
  assert.equal(initial.n, 0, "Integration tests require an empty development Voice table");
  console.log("\nReal PostgreSQL usage-store integration");
  await test("true parallel claims across independent pools admit exactly two", async () => {
    const clients = await Promise.all([pool.connect(), secondPool.connect()]);
    try {
      const ids = await Promise.all(clients.map(c => c.query("SELECT pg_backend_pid() AS id")));
      assert.notEqual(ids[0].rows[0].id, ids[1].rows[0].id);
    } finally { clients.forEach(c => c.release()); }
    const results = await Promise.all(Array.from({ length: 12 }, (_, i) =>
      (i % 2 ? store : otherStore).claim(input())));
    assert.equal(results.filter(x => x === "ok").length, 2);
    assert.equal(results.filter(x => x === "busy").length, 10);
  });
  await test("parallel per-visitor claims cannot exceed two daily attempts", async () => {
    const visitorHash = hash("same visitor");
    const results = await Promise.all(Array.from({ length: 10 }, (_, i) =>
      (i % 2 ? store : otherStore).claim(input({ visitorHash, maxConcurrent: 20 }))));
    assert.equal(results.filter(x => x === "ok").length, 2);
    assert.equal(results.filter(x => x === "visitor_limit").length, 8);
  });
  await test("parallel per-IP claims cannot exceed four daily attempts", async () => {
    const ipHash = hash("same IP");
    const results = await Promise.all(Array.from({ length: 10 }, (_, i) =>
      (i % 2 ? store : otherStore).claim(input({ ipHash, maxConcurrent: 20 }))));
    assert.equal(results.filter(x => x === "ok").length, 4);
    assert.equal(results.filter(x => x === "visitor_limit").length, 6);
  });
  await test("parallel global seconds reservations never exceed the cap", async () => {
    const results = await Promise.all(Array.from({ length: 10 }, (_, i) =>
      (i % 2 ? store : otherStore).claim(input({ dailySeconds: 180, maxConcurrent: 20 }))));
    assert.equal(results.filter(x => x === "ok").length, 3);
    assert.equal(results.filter(x => x === "daily_limit").length, 7);
  });
  await test("natural lease expiry frees concurrency, not daily budget", async () => {
    assert.equal(await store.claim(input({ leaseSeconds: 1, maxConcurrent: 1, dailySeconds: 60 })), "ok");
    assert.equal(await store.claim(input({ maxConcurrent: 1 })), "busy");
    await new Promise(r => setTimeout(r, 1150));
    assert.equal(await otherStore.claim(input({ dailySeconds: 60, maxConcurrent: 1 })), "daily_limit");
    assert.equal(await otherStore.claim(input({ maxConcurrent: 1 })), "ok");
  });
  await test("release is idempotent, ends lease but preserves consumed seconds", async () => {
    const a = input({ maxConcurrent: 1 });
    assert.equal(await store.claim(a), "ok");
    await otherStore.release(a.sessionId, false);
    await store.release(a.sessionId, false);
    assert.equal(await store.claim(input({ dailySeconds: 60, maxConcurrent: 1 })), "daily_limit");
    assert.equal(await store.claim(input({ maxConcurrent: 1 })), "ok");
  });
  await test("pre-issuance refund removes attempts and reservations atomically", async () => {
    const a = input();
    assert.equal(await store.claim(a), "ok");
    await otherStore.release(a.sessionId, true);
    await store.release(a.sessionId, true);
    assert.equal(await store.claim({ ...a, sessionId: input().sessionId, dailySeconds: 60 }), "ok");
  });
  await test("UTC rollover resets daily attempts without dropping yesterday's live lease", async () => {
    const a = input({ maxPerVisitor: 1, maxConcurrent: 1 });
    assert.equal(await store.claim(a), "ok");
    await pool.query("UPDATE public.voice_demo_pg_sessions SET day = (clock_timestamp() AT TIME ZONE 'UTC')::date - 1 WHERE session_id=$1", [a.sessionId]);
    const b = input({ visitorHash: a.visitorHash, maxPerVisitor: 1, maxConcurrent: 1 });
    assert.equal(await otherStore.claim(b), "busy");
    await store.release(a.sessionId, false);
    assert.equal(await otherStore.claim(b), "ok");
  });
  await test("retention removes only expired old rows; recent reservations remain", async () => {
    const a = input();
    const b = input();
    await store.claim(a); await store.claim(b);
    await pool.query(`UPDATE public.voice_demo_pg_sessions SET day = (clock_timestamp() AT TIME ZONE 'UTC')::date - 3,
      created_at = clock_timestamp()-interval '3 days',
      lease_expires_at=clock_timestamp()-interval '1 second' WHERE session_id=$1`, [a.sessionId]);
    await store.cleanup();
    const r = await pool.query("SELECT session_id FROM public.voice_demo_pg_sessions");
    assert.deepEqual(r.rows.map(r => r.session_id), [b.sessionId]);
  });
  await test("duplicate session IDs roll back and cannot bypass the budget", async () => {
    const a = input();
    assert.equal(await store.claim(a), "ok");
    await assert.rejects(store.claim(a), { message: "voice PostgreSQL store unavailable" });
    assert.equal((await pool.query("SELECT count(*)::int AS n FROM public.voice_demo_pg_sessions")).rows[0].n, 1);
  });
  await test("lock contention times out safely and releases pooled connection", async () => {
    const blocker = await pool.connect();
    try {
      await blocker.query("BEGIN");
      await blocker.query("SELECT pg_advisory_xact_lock(112999, 1)");
      await assert.rejects(otherStore.claim(input()), { message: "voice PostgreSQL store unavailable" });
    } finally { await blocker.query("ROLLBACK"); blocker.release(); }
    assert.equal(await otherStore.claim(input()), "ok");
  });
  await test("unreachable database fails closed with sanitized errors", async () => {
    const brokenPool = createVoicePool("postgresql://test:never-log-this@127.0.0.1:1/missing");
    try {
      await assert.rejects(new PostgresStore(brokenPool).claim(input()), { message: "voice PostgreSQL store unavailable" });
    } finally { await brokenPool.end(); }
  });
  await test("production config accepts postgres, requires DATABASE_URL and retains defaults", async () => {
    configure({ NODE_ENV: "production" });
    const r = getVoiceDemoConfig();
    assert.equal(r.ok, true);
    assert.deepEqual([r.config.trialSeconds, r.config.attemptsPerVisitor, r.config.attemptsPerIp,
      r.config.dailySeconds, r.config.maxConcurrent], [60, 2, 4, 1800, 2]);
    delete process.env.DATABASE_URL;
    const missing = getVoiceDemoConfig();
    assert.equal(missing.ok, false);
    assert.ok(missing.missing.includes("DATABASE_URL"));
    configure();
  });
  await test("real session + signed end flow uses DB hashes and conserves budget", async () => {
    configure();
    fetchCount = 0;
    const res = await sessionRoute.POST(request({ source: "en", target: "es", consent: true }));
    const body = await res.json();
    assert.equal(res.status, 200);
    owned.add(body.sessionId);
    assert.equal(fetchCount, 2);
    assert.equal(body.trialSeconds, 60);
    assert.equal(body.stt.apiKey, "mock-temporary-key");
    assert.ok(!JSON.stringify(body).includes("mock-only-not-a-provider-key"));
    const row = (await pool.query("SELECT * FROM public.voice_demo_pg_sessions WHERE session_id=$1", [body.sessionId])).rows[0];
    assert.match(row.ip_hash, /^[A-Za-z0-9_-]{43}$/);
    assert.match(row.visitor_hash, /^[A-Za-z0-9_-]{43}$/);
    assert.equal(row.reserved_seconds, 60);
    const invalid = new Request("https://catchzone.co.uk/api/voice/session/end", {
      method: "POST", headers: request({}).headers,
      body: JSON.stringify({ ...body, sessionToken: "invalid" }),
    });
    assert.equal((await endRoute.POST(invalid)).status, 400);
    const end = new Request("https://catchzone.co.uk/api/voice/session/end", {
      method: "POST", headers: request({}).headers,
      body: JSON.stringify({ sessionId: body.sessionId, sessionToken: body.sessionToken, expiresAt: body.expiresAt }),
    });
    assert.equal((await endRoute.POST(end)).status, 204);
    const ended = (await pool.query("SELECT reserved_seconds, lease_expires_at <= clock_timestamp() AS expired FROM public.voice_demo_pg_sessions WHERE session_id=$1", [body.sessionId])).rows[0];
    assert.equal(ended.expired, true);
    assert.equal(ended.reserved_seconds, 60);
  });
  await test("consent, origin and kill switch refuse before provider/DB work", async () => {
    configure();
    fetchCount = 0;
    assert.equal((await sessionRoute.POST(request({ source: "en", target: "es" }))).status, 400);
    const foreign = request({ source: "en", target: "es", consent: true });
    foreign.headers.set("origin", "https://foreign.example");
    assert.equal((await sessionRoute.POST(foreign)).status, 403);
    process.env.VOICE_DEMO_ENABLED = "false";
    assert.equal((await sessionRoute.POST(request({ source: "en", target: "es", consent: true }))).status, 503);
    assert.equal(fetchCount, 0);
  });
  await test("provider rejection refunds the DB reservation without real network", async () => {
    configure();
    rejectProvider = true;
    try {
      const res = await sessionRoute.POST(request({ source: "en", target: "es", consent: true }));
      assert.equal((await res.json()).reason, "provider_unavailable");
      assert.equal((await pool.query("SELECT count(*)::int AS n FROM public.voice_demo_pg_sessions")).rows[0].n, 0);
    } finally { rejectProvider = false; }
  });
  await test("route denies unavailable PostgreSQL without minting any keys", async () => {
    configure({ DATABASE_URL: "postgresql://test:never-log-this@127.0.0.1:1/missing" });
    fetchCount = 0;
    const res = await sessionRoute.POST(request({ source: "en", target: "es", consent: true }));
    assert.equal(res.status, 503);
    assert.equal((await res.json()).reason, "store_unavailable");
    assert.equal(fetchCount, 0);
  });
  await test("maintenance requires a separate secret and purges while demo is disabled", async () => {
    configure({ VOICE_DEMO_ENABLED: "false" });
    delete process.env.VOICE_DEMO_CLEANUP_SECRET;
    const req = (authorization) => new Request("https://catchzone.co.uk/api/voice/maintenance", {
      method: "POST", headers: authorization ? { authorization } : {},
    });
    assert.equal((await maintenanceRoute.POST(req())).status, 503);
    process.env.VOICE_DEMO_CLEANUP_SECRET = "test-maintenance-".repeat(3);
    assert.equal((await maintenanceRoute.POST(req("Bearer wrong"))).status, 401);
    const a = input();
    await store.claim(a);
    await pool.query(`UPDATE public.voice_demo_pg_sessions SET day = (clock_timestamp() AT TIME ZONE 'UTC')::date - 3,
      created_at = clock_timestamp()-interval '3 days',
      lease_expires_at=clock_timestamp()-interval '1 second' WHERE session_id=$1`, [a.sessionId]);
    assert.equal((await maintenanceRoute.POST(req(`Bearer ${process.env.VOICE_DEMO_CLEANUP_SECRET}`))).status, 204);
    assert.equal((await pool.query("SELECT count(*)::int AS n FROM public.voice_demo_pg_sessions")).rows[0].n, 0);
  });
} finally {
  globalThis.fetch = originalFetch;
  await clear();
  await pool.end();
  await secondPool.end();
}
console.log(`\n${passed}/${total} PostgreSQL integration tests passed`);
