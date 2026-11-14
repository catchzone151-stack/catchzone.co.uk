import "server-only";

/**
 * Public CatchZone Voice demo — server configuration.
 *
 * FAIL-CLOSED: paid Soniox processing is only reachable when EVERY
 * prerequisite below is present. Anything missing → the demo reports
 * itself unavailable and no temporary key is ever minted. See
 * docs/VOICE_DEMO_OPERATIONS.md for the full runbook.
 *
 * Environment variables (none have public NEXT_PUBLIC_ prefixes, so none
 * reach the browser bundle):
 *
 *   VOICE_DEMO_ENABLED                 "true" to enable. Anything else = off (emergency kill switch).
 *   VOICE_DEMO_SPEND_CONTROLS_CONFIRMED "true" once an operator has set a Soniox project cost limit,
 *                                      a low project concurrency quota and a minimally-scoped key.
 *   SONIOX_DEMO_API_KEY                Long-lived key of the DEDICATED public-demo Soniox project.
 *                                      Never reused for the private client-evaluation environment.
 *   SONIOX_DEMO_REGION                 Optional Soniox region of that project ("eu", "jp", "in"; empty = US).
 *   VOICE_DEMO_HASH_SECRET             ≥32 random characters; HMAC secret for visitor/IP hashing and session tokens.
 *   VOICE_DEMO_STORE                   "supabase" (durable, required in production) or "memory" (local dev only).
 *   VOICE_DEMO_SUPABASE_URL            Supabase project URL (store = supabase).
 *   VOICE_DEMO_SUPABASE_SERVICE_ROLE_KEY Supabase service-role key (server only).
 *
 * Tunable limits (conservative defaults, clamped to safe ranges):
 *   VOICE_DEMO_TRIAL_SECONDS (60), VOICE_DEMO_ATTEMPTS_PER_VISITOR (2),
 *   VOICE_DEMO_ATTEMPTS_PER_IP (4), VOICE_DEMO_DAILY_SECONDS (1800),
 *   VOICE_DEMO_MAX_CONCURRENT (2), VOICE_DEMO_TTS_VOICE ("Adrian"),
 *   VOICE_DEMO_TRUSTED_PROXY_HOPS (1), VOICE_DEMO_ALLOWED_ORIGINS (comma list).
 */

export const STT_MODEL = "stt-rt-v6";
export const TTS_MODEL = "tts-rt-v2";

/** Seconds a single-use STT key stays valid for OPENING the stream. */
export const STT_KEY_OPEN_WINDOW_SECONDS = 30;
/** Hard grace added on top of the trial to the Soniox-enforced session cap. */
export const SESSION_GRACE_SECONDS = 5;
/** Per-utterance cap for each spoken (TTS) stream. */
export const TTS_STREAM_MAX_SECONDS = 30;

export type StoreKind = "supabase" | "memory";

export type UnavailableReason = "disabled" | "not_configured";

export interface VoiceDemoConfig {
  trialSeconds: number;
  attemptsPerVisitor: number;
  attemptsPerIp: number;
  dailySeconds: number;
  maxConcurrent: number;
  ttsVoice: string;
  trustedProxyHops: number;
  allowedOrigins: string[];
  region: string | undefined;
  store: StoreKind;
  sonioxApiKey: string;
  hashSecret: string;
  supabaseUrl: string;
  supabaseServiceKey: string;
}

export type ConfigResult =
  | { ok: true; config: VoiceDemoConfig }
  | { ok: false; reason: UnavailableReason; missing: string[] };

function intEnv(name: string, fallback: number, min: number, max: number): number {
  const raw = process.env[name];
  const parsed = raw === undefined || raw.trim() === "" ? fallback : Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

const isProduction = () => process.env.NODE_ENV === "production";

/** Reads configuration on every call so the kill switch never needs a code change. */
export function getVoiceDemoConfig(): ConfigResult {
  if (process.env.VOICE_DEMO_ENABLED !== "true") {
    return { ok: false, reason: "disabled", missing: ["VOICE_DEMO_ENABLED"] };
  }

  const missing: string[] = [];
  const sonioxApiKey = process.env.SONIOX_DEMO_API_KEY?.trim() ?? "";
  const hashSecret = process.env.VOICE_DEMO_HASH_SECRET ?? "";
  const storeRaw = process.env.VOICE_DEMO_STORE?.trim();
  const supabaseUrl = process.env.VOICE_DEMO_SUPABASE_URL?.trim() ?? "";
  const supabaseServiceKey = process.env.VOICE_DEMO_SUPABASE_SERVICE_ROLE_KEY?.trim() ?? "";

  if (process.env.VOICE_DEMO_SPEND_CONTROLS_CONFIRMED !== "true") {
    missing.push("VOICE_DEMO_SPEND_CONTROLS_CONFIRMED");
  }
  if (!sonioxApiKey) missing.push("SONIOX_DEMO_API_KEY");
  if (hashSecret.length < 32) missing.push("VOICE_DEMO_HASH_SECRET (min 32 chars)");

  let store: StoreKind | null = null;
  if (storeRaw === "supabase") {
    store = "supabase";
    if (!/^https:\/\/[a-z0-9.-]+$/i.test(supabaseUrl.replace(/\/$/, ""))) missing.push("VOICE_DEMO_SUPABASE_URL");
    if (!supabaseServiceKey) missing.push("VOICE_DEMO_SUPABASE_SERVICE_ROLE_KEY");
  } else if (storeRaw === "memory" && !isProduction()) {
    // In-memory limits do not survive restarts or span multiple instances,
    // so they are refused outright in production builds.
    store = "memory";
  } else {
    missing.push("VOICE_DEMO_STORE (durable store required)");
  }

  const regionRaw = process.env.SONIOX_DEMO_REGION?.trim().toLowerCase();
  const region = regionRaw && ["eu", "jp", "in"].includes(regionRaw) ? regionRaw : undefined;
  if (regionRaw && !region && regionRaw !== "us") missing.push("SONIOX_DEMO_REGION (eu, jp, in or empty)");

  if (missing.length > 0 || !store) {
    return { ok: false, reason: "not_configured", missing };
  }

  const allowedOrigins = (process.env.VOICE_DEMO_ALLOWED_ORIGINS ??
    "https://catchzone.co.uk,https://www.catchzone.co.uk")
    .split(",")
    .map((o) => o.trim().replace(/\/$/, ""))
    .filter(Boolean);

  const voice = process.env.VOICE_DEMO_TTS_VOICE?.trim() || "Adrian";

  return {
    ok: true,
    config: {
      trialSeconds: intEnv("VOICE_DEMO_TRIAL_SECONDS", 60, 15, 120),
      attemptsPerVisitor: intEnv("VOICE_DEMO_ATTEMPTS_PER_VISITOR", 2, 1, 10),
      attemptsPerIp: intEnv("VOICE_DEMO_ATTEMPTS_PER_IP", 4, 1, 20),
      dailySeconds: intEnv("VOICE_DEMO_DAILY_SECONDS", 1800, 60, 36000),
      maxConcurrent: intEnv("VOICE_DEMO_MAX_CONCURRENT", 2, 1, 10),
      ttsVoice: /^[A-Za-z0-9_-]{1,64}$/.test(voice) ? voice : "Adrian",
      trustedProxyHops: intEnv("VOICE_DEMO_TRUSTED_PROXY_HOPS", 1, 0, 5),
      allowedOrigins,
      region,
      store,
      sonioxApiKey,
      hashSecret,
      supabaseUrl: supabaseUrl.replace(/\/$/, ""),
      supabaseServiceKey,
    },
  };
}

/** Public trial length shown before a visitor starts (falls back to the default). */
export function publicTrialSeconds(): number {
  return intEnv("VOICE_DEMO_TRIAL_SECONDS", 60, 15, 120);
}

export function sonioxApiBase(region: string | undefined): string {
  return region ? `https://api.${region}.soniox.com` : "https://api.soniox.com";
}
