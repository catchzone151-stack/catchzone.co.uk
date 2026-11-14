import "server-only";
import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import type { VoiceDemoConfig } from "./config";

export const VISITOR_COOKIE = "cz_voice_vid";

const NO_STORE = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" } as const;
export const noStoreHeaders = NO_STORE;

/**
 * Browser-origin check. Not authentication — non-browser clients can forge
 * headers — but it stops other sites from driving the demo from their own
 * pages. Real cost control comes from the durable limits and Soniox-side
 * key restrictions.
 */
export function isAllowedOrigin(request: Request, config: VoiceDemoConfig): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return false;

  const normalised = origin.replace(/\/$/, "");
  if (config.allowedOrigins.includes(normalised)) return true;

  // Same host as the request (covers preview deployments without extra config).
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  try {
    const originHost = new URL(normalised).host;
    if (host && originHost === host.split(",")[0]!.trim()) return true;
  } catch {
    return false;
  }
  return false;
}

/**
 * Client IP using the right-most X-Forwarded-For entries added by trusted
 * proxies (the left-most entries can be supplied by the client and are
 * therefore not trusted).
 */
export function getClientIp(request: Request, trustedHops: number): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff && trustedHops > 0) {
    const parts = xff.split(",").map((p) => p.trim()).filter(Boolean);
    const candidate = parts[Math.max(0, parts.length - trustedHops)];
    if (candidate) return candidate;
  }
  return request.headers.get("x-real-ip")?.trim() || "unknown";
}

export function utcDay(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/** HMAC with a per-day salt: identifiers cannot be correlated across days or reversed to an IP. */
export function hashIdentifier(secret: string, kind: string, value: string, day = utcDay()): string {
  return createHmac("sha256", secret).update(`${kind}:${day}:${value}`).digest("base64url");
}

export function signSession(secret: string, sessionId: string, expiresAt: number): string {
  return createHmac("sha256", secret).update(`session:${sessionId}:${expiresAt}`).digest("base64url");
}

export function verifySession(
  secret: string,
  sessionId: string,
  expiresAt: number,
  token: string,
): boolean {
  const expected = Buffer.from(signSession(secret, sessionId, expiresAt));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value);
}

export function readVisitorId(request: Request): string | null {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${VISITOR_COOKIE}=([^;]+)`));
  const value = match?.[1];
  return isUuid(value) ? value : null;
}

export function newId(): string {
  return randomUUID();
}

/**
 * Strictly-necessary abuse-prevention cookie, set only after the visitor
 * explicitly starts a trial. Scoped to the demo API, HttpOnly, 2-day life.
 */
export function visitorCookie(visitorId: string): string {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${VISITOR_COOKIE}=${visitorId}; Path=/api/voice; Max-Age=172800; HttpOnly; SameSite=Strict${secure}`;
}

/**
 * Cheap per-instance burst filter applied BEFORE the durable store, so a
 * flood of requests from one address cannot hammer the database. It is not
 * relied on for limits — the durable store is.
 */
const burst = new Map<string, number[]>();
export function burstLimited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (burst.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  burst.set(key, recent);
  if (burst.size > 5000) {
    for (const [k, times] of burst) if (times.every((t) => now - t >= windowMs)) burst.delete(k);
  }
  return recent.length > max;
}

/** Reads a small JSON body (sendBeacon posts text/plain). Rejects oversized payloads. */
export async function readSmallJson(request: Request, maxBytes = 2048): Promise<unknown> {
  const length = Number(request.headers.get("content-length") ?? "0");
  if (length > maxBytes) return null;
  const text = await request.text();
  if (text.length > maxBytes) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}
