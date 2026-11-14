import { NextResponse } from "next/server";

/**
 * CatchZone Voice enquiry form. Mirrors the established
 * /api/start-a-project delivery path: sends through Resend only when
 * RESEND_API_KEY and RESEND_TO_EMAIL are configured, and otherwise returns
 * { ok:false, reason:"unconfigured" } so the UI offers a mailto fallback
 * instead of claiming the message was sent.
 */

export const dynamic = "force-dynamic";

const MAX_LEN = { name: 120, email: 200, company: 160, message: 3000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const INTENTS = new Set(["demonstration", "requirements"]);

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

export async function POST(request: Request) {
  if (isRateLimited(clientIp(request))) {
    return NextResponse.json({ ok: false, reason: "rate_limited" }, { status: 429 });
  }

  let raw: Record<string, unknown>;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ ok: false, reason: "invalid_body" }, { status: 400 });
  }

  // Honeypot — silently accept, never send.
  if (raw.website) return NextResponse.json({ ok: true });

  const name = cleanLine(raw.name, MAX_LEN.name);
  const email = cleanLine(raw.email, MAX_LEN.email);
  const company = cleanLine(raw.company, MAX_LEN.company);
  const message =
    typeof raw.message === "string" ? raw.message.trim().slice(0, MAX_LEN.message) : "";
  const intent = typeof raw.intent === "string" && INTENTS.has(raw.intent) ? raw.intent : "requirements";

  if (!name || !email || !company || !message || !EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, reason: "missing_fields" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.RESEND_TO_EMAIL;
  if (!apiKey || !toEmail) {
    return NextResponse.json({ ok: false, reason: "unconfigured" }, { status: 200 });
  }

  const subjectPrefix =
    intent === "demonstration" ? "CatchZone Voice — private demonstration request" : "CatchZone Voice enquiry";

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "CatchZone Voice <voice@catchzone.co.uk>",
        to: [toEmail],
        reply_to: email,
        subject: `${subjectPrefix} — ${name} (${company})`,
        text: [
          `Request: ${intent === "demonstration" ? "Private demonstration" : "Discuss requirements"}`,
          `Name: ${name}`,
          `Business email: ${email}`,
          `Company: ${company}`,
          "",
          "Message:",
          message,
        ].join("\n"),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      return NextResponse.json({ ok: false, reason: "send_failed" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false, reason: "send_failed" }, { status: 502 });
  }
}
