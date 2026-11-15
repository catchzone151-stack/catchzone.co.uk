/**
 * Shared server-side delivery for product enquiry forms (CatchZone Voice,
 * CatchZone School HR) → the CatchZone inbox via Resend.
 *
 * This is the proven /api/start-a-project delivery path:
 *   - only `RESEND_API_KEY` is required (server-side; never sent to the browser);
 *   - the recipient is fixed to info@catchzone.co.uk;
 *   - the sender defaults to the verified brief@catchzone.co.uk address and
 *     can be overridden with `RESEND_FROM_EMAIL`;
 *   - Reply-To is the visitor's validated email;
 *   - a client submission id becomes a Resend Idempotency-Key, so a retried
 *     request can never send the email twice.
 * Success is only reported once Resend has accepted the email. Failures are
 * logged server-side (never the API key).
 */

export const INBOX = "info@catchzone.co.uk";
const RESEND_ENDPOINT = "https://api.resend.com/emails";
const SEND_TIMEOUT_MS = 10_000;

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FROM_RE = /^(?:[^<>\r\n]{1,80} <)?[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>?$/;
const SUBMISSION_ID_RE = /^[A-Za-z0-9-]{8,64}$/;

/** Simple per-instance sliding-window limiter keyed by client IP. */
export function createRateLimiter(windowMs: number, max: number) {
  const log = new Map<string, number[]>();
  return function isRateLimited(ip: string): boolean {
    const now = Date.now();
    const recent = (log.get(ip) ?? []).filter((t) => now - t < windowMs);
    recent.push(now);
    log.set(ip, recent);
    if (log.size > 5000) {
      for (const [key, times] of log) {
        if (times.every((t) => now - t >= windowMs)) log.delete(key);
      }
    }
    return recent.length > max;
  };
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",").pop()!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Single-line field: control characters collapsed, trimmed, length-capped. */
export function cleanLine(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\r\n\t]+/g, " ").trim().slice(0, maxLen);
}

export function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type DeliveryResult =
  | { ok: true }
  | { ok: false; reason: "unconfigured" | "send_failed"; status: number };

export async function deliverToInbox(options: {
  /** Log prefix, e.g. "voice-enquiry". */
  tag: string;
  /** Display-name sender used when RESEND_FROM_EMAIL is not set. */
  defaultFrom: string;
  /** Prefix for the Idempotency-Key, e.g. "voice-enquiry". */
  idempotencyPrefix: string;
  submissionId: unknown;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
}): Promise<DeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error(`[${options.tag}] RESEND_API_KEY is not set — the enquiry was not emailed.`);
    return { ok: false, reason: "unconfigured", status: 503 };
  }

  const configuredFrom = process.env.RESEND_FROM_EMAIL?.trim();
  const from = configuredFrom && FROM_RE.test(configuredFrom) ? configuredFrom : options.defaultFrom;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  if (typeof options.submissionId === "string" && SUBMISSION_ID_RE.test(options.submissionId)) {
    headers["Idempotency-Key"] = `${options.idempotencyPrefix}/${options.submissionId}`;
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      body: JSON.stringify({
        from,
        to: [INBOX],
        reply_to: options.replyTo,
        subject: options.subject,
        text: options.text,
        html: options.html,
      }),
    });
    if (!res.ok) {
      console.error(`[${options.tag}] Resend rejected the email (HTTP ${res.status})`);
      return { ok: false, reason: "send_failed", status: 502 };
    }
    return { ok: true };
  } catch (error) {
    console.error(`[${options.tag}] Could not reach Resend: ${error instanceof Error ? error.name : "unknown error"}`);
    return { ok: false, reason: "send_failed", status: 502 };
  }
}
