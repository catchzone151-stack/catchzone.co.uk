import { NextResponse } from "next/server";
import { buildVoiceEnquiryEmail, type VoiceEnquiry, type VoiceEnquiryIntent } from "@/lib/email/voiceEnquiryEmail";

/**
 * CatchZone Voice enquiries → the CatchZone inbox via Resend.
 *
 * Mirrors the proven /api/start-a-project delivery path exactly:
 *   - only `RESEND_API_KEY` is required;
 *   - the recipient is fixed to info@catchzone.co.uk;
 *   - the sender defaults to the verified brief@catchzone.co.uk address and
 *     can be overridden with `RESEND_FROM_EMAIL`;
 *   - Reply-To is the visitor's validated email;
 *   - a client submission id becomes a Resend Idempotency-Key, so a retried
 *     request can never send the email twice.
 * Success is only reported once Resend has accepted the email. Failures are
 * logged server-side (never the API key) and the UI offers a mailto fallback.
 */

export const dynamic = "force-dynamic";

const INBOX = "info@catchzone.co.uk";
const DEFAULT_FROM = "CatchZone Voice <brief@catchzone.co.uk>";
const RESEND_ENDPOINT = "https://api.resend.com/emails";
const SEND_TIMEOUT_MS = 10_000;

const MAX_LEN = { name: 120, email: 200, company: 160, message: 3000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FROM_RE = /^(?:[^<>\r\n]{1,80} <)?[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>?$/;
const SUBMISSION_ID_RE = /^[A-Za-z0-9-]{8,64}$/;
const INTENTS = new Set<VoiceEnquiryIntent>(["demonstration", "requirements"]);

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (requestLog.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS);
  recent.push(now);
  requestLog.set(ip, recent);
  if (requestLog.size > 5000) {
    for (const [key, times] of requestLog) {
      if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) requestLog.delete(key);
    }
  }
  return recent.length > RATE_LIMIT_MAX;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",").pop()!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function cleanLine(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\r\n\t]+/g, " ").trim().slice(0, maxLen);
}

function fail(reason: string, status: number) {
  return NextResponse.json({ ok: false, reason }, { status });
}

export async function POST(request: Request) {
  if (isRateLimited(clientIp(request))) return fail("rate_limited", 429);

  let raw: Record<string, unknown>;
  try {
    raw = await request.json();
  } catch {
    return fail("invalid_body", 400);
  }
  if (!raw || typeof raw !== "object") return fail("invalid_body", 400);

  // Honeypot (same autofill-safe name as the Start a Project form): accept silently, never send.
  if (raw.cz_hp) return NextResponse.json({ ok: true });

  const enquiry: VoiceEnquiry = {
    intent: typeof raw.intent === "string" && INTENTS.has(raw.intent as VoiceEnquiryIntent)
      ? (raw.intent as VoiceEnquiryIntent)
      : "requirements",
    name: cleanLine(raw.name, MAX_LEN.name),
    email: cleanLine(raw.email, MAX_LEN.email),
    company: cleanLine(raw.company, MAX_LEN.company),
    message: typeof raw.message === "string" ? raw.message.trim().slice(0, MAX_LEN.message) : "",
  };

  if (!enquiry.name || !enquiry.company || !enquiry.message || !EMAIL_RE.test(enquiry.email)) {
    return fail("missing_fields", 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[voice-enquiry] RESEND_API_KEY is not set — the enquiry was not emailed.");
    return fail("unconfigured", 503);
  }

  const configuredFrom = process.env.RESEND_FROM_EMAIL?.trim();
  const from = configuredFrom && FROM_RE.test(configuredFrom) ? configuredFrom : DEFAULT_FROM;
  const email = buildVoiceEnquiryEmail(enquiry, new Date());

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  if (typeof raw.submissionId === "string" && SUBMISSION_ID_RE.test(raw.submissionId)) {
    headers["Idempotency-Key"] = `voice-enquiry/${raw.submissionId}`;
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      body: JSON.stringify({
        from,
        to: [INBOX],
        reply_to: enquiry.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
    });
    if (!res.ok) {
      console.error(`[voice-enquiry] Resend rejected the email (HTTP ${res.status})`);
      return fail("send_failed", 502);
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(`[voice-enquiry] Could not reach Resend: ${error instanceof Error ? error.name : "unknown error"}`);
    return fail("send_failed", 502);
  }
}
