import { NextResponse } from "next/server";
import {
  SESSION_GRACE_SECONDS,
  STT_MODEL,
  TTS_MODEL,
  getVoiceDemoConfig,
} from "@/lib/voice/server/config";
import {
  burstLimited,
  getClientIp,
  hashIdentifier,
  isAllowedOrigin,
  newId,
  noStoreHeaders,
  readSmallJson,
  readVisitorId,
  signSession,
  visitorCookie,
} from "@/lib/voice/server/security";
import { StoreUnavailableError, getStore } from "@/lib/voice/server/store";
import { SonioxKeyError, mintTrialKeys } from "@/lib/voice/server/soniox";
import { isValidPair } from "@/data/voice/languages";
import type { DemoRefusalReason, DemoSessionGranted } from "@/lib/voice/types";

export const dynamic = "force-dynamic";

/** Seconds a lease stays held if the tab is abandoned without calling /end. */
const LEASE_PADDING_SECONDS = 15;

/**
 * Business-context hints sent with the recognition session. These are
 * Soniox "context" fields (https://docs.soniox.com/stt/concepts/context):
 * they bias recognition/translation toward customer-service and travel
 * vocabulary. They do not change what the visitor said.
 */
const DEMO_CONTEXT = {
  general: [
    { key: "domain", value: "Customer service and travel support" },
    { key: "topic", value: "Bookings, reservations, travel arrangements and customer enquiries" },
  ],
  terms: [
    "booking reference",
    "reservation",
    "check-in",
    "check-out",
    "boarding pass",
    "itinerary",
    "transfer",
    "refund",
    "cancellation",
    "luggage allowance",
    "customer service",
  ],
};

function refuse(reason: DemoRefusalReason, status: number) {
  return NextResponse.json({ ok: false, reason }, { status, headers: noStoreHeaders });
}

export async function POST(request: Request) {
  // 1. Kill switch + prerequisites (fail closed, before any work).
  const configResult = getVoiceDemoConfig();
  if (!configResult.ok) {
    if (configResult.reason === "not_configured") {
      console.warn(`[voice-demo] session refused — missing: ${configResult.missing.join(", ")}`);
    }
    return refuse(configResult.reason, 503);
  }
  const config = configResult.config;

  // 2. Browser-origin and request-shape checks.
  if (!isAllowedOrigin(request, config)) return refuse("forbidden_origin", 403);
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return refuse("invalid_request", 415);
  }

  const ip = getClientIp(request, config.trustedProxyHops);
  if (burstLimited(`session:${ip}`, 6, 60_000)) return refuse("rate_limited", 429);

  const body = (await readSmallJson(request)) as
    | { source?: unknown; target?: unknown; consent?: unknown }
    | null;
  if (!body) return refuse("invalid_request", 400);
  if (body.consent !== true) return refuse("consent_required", 400);
  if (!isValidPair(body.source, body.target)) return refuse("unsupported_pair", 400);

  // 3. Durable limits (concurrency, per-visitor, per-IP, global daily allowance).
  const existingVisitor = readVisitorId(request);
  const visitorId = existingVisitor ?? newId();
  const sessionId = newId();
  const store = getStore(config);

  let outcome;
  try {
    outcome = await store.claim({
      sessionId,
      ipHash: hashIdentifier(config.hashSecret, "ip", ip),
      visitorHash: hashIdentifier(config.hashSecret, "visitor", visitorId),
      reservedSeconds: config.trialSeconds,
      leaseSeconds: config.trialSeconds + SESSION_GRACE_SECONDS + LEASE_PADDING_SECONDS,
      maxPerVisitor: config.attemptsPerVisitor,
      maxPerIp: config.attemptsPerIp,
      dailySeconds: config.dailySeconds,
      maxConcurrent: config.maxConcurrent,
    });
  } catch (error) {
    console.error(`[voice-demo] ${error instanceof StoreUnavailableError ? error.message : "store error"}`);
    return refuse("store_unavailable", 503);
  }

  const withCookie = (res: NextResponse) => {
    if (!existingVisitor) res.headers.append("Set-Cookie", visitorCookie(visitorId));
    return res;
  };

  if (outcome !== "ok") {
    const status = outcome === "busy" ? 503 : 429;
    return withCookie(refuse(outcome, status));
  }

  // 4. Short-lived, restricted Soniox credentials.
  let keys;
  try {
    keys = await mintTrialKeys(config, sessionId);
  } catch (error) {
    const status = error instanceof SonioxKeyError ? error.status : null;
    console.error(`[voice-demo] temporary key minting failed (status ${status ?? "network"})`);
    // Keys were not issued: refund the attempt so the visitor is not penalised.
    await store.release(sessionId, true).catch(() => undefined);
    return withCookie(refuse("provider_unavailable", 503));
  }

  const expiresAt = Date.now() + (config.trialSeconds + SESSION_GRACE_SECONDS) * 1000;
  const granted: DemoSessionGranted = {
    ok: true,
    sessionId,
    sessionToken: signSession(config.hashSecret, sessionId, expiresAt),
    expiresAt,
    trialSeconds: config.trialSeconds,
    ...(config.region ? { region: config.region } : {}),
    stt: {
      apiKey: keys.stt.apiKey,
      model: STT_MODEL,
      maxEndpointDelayMs: 700,
      context: DEMO_CONTEXT,
    },
    tts: {
      apiKey: keys.tts.apiKey,
      model: TTS_MODEL,
      voice: config.ttsVoice,
    },
  };

  return withCookie(NextResponse.json(granted, { headers: noStoreHeaders }));
}
