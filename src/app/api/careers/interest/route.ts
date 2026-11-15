import { NextResponse } from "next/server";
import { buildCareersInterestEmail, type CareersInterest } from "@/lib/email/careersInterestEmail";
import { EMAIL_RE, cleanLine, clientIp, createRateLimiter, deliverToInbox, formRequestGuard } from "@/lib/email/inboxDelivery";
import { CAREER_AREAS, type CareerAreaId } from "@/data/careers";

/**
 * Careers expressions of interest → the CatchZone inbox via the shared Resend
 * path (`src/lib/email/inboxDelivery.ts`). Nothing is stored by the website;
 * no file uploads are accepted. Success is only reported once Resend accepts
 * the email.
 */

export const dynamic = "force-dynamic";

const MAX_LEN = { name: 120, email: 200, link: 300, message: 2000 };
const isRateLimited = createRateLimiter(10 * 60 * 1000, 5);

function fail(reason: string, status: number) {
  return NextResponse.json({ ok: false, reason }, { status });
}

/** Optional profile/portfolio link: http(s) only, no credentials in the URL. */
function cleanLink(value: unknown): string | null {
  const raw = cleanLine(value, MAX_LEN.link);
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if ((url.protocol !== "https:" && url.protocol !== "http:") || url.username || url.password) return null;
    return url.toString();
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const blocked = formRequestGuard(request);
  if (blocked) return blocked;
  if (isRateLimited(clientIp(request))) return fail("rate_limited", 429);

  let raw: Record<string, unknown>;
  try {
    raw = await request.json();
  } catch {
    return fail("invalid_body", 400);
  }
  if (!raw || typeof raw !== "object") return fail("invalid_body", 400);

  // Honeypot (same autofill-safe name as the other site forms): accept silently, never send.
  if (raw.cz_hp) return NextResponse.json({ ok: true });

  const link = cleanLink(raw.link);
  const interest: CareersInterest = {
    area: typeof raw.area === "string" && Object.hasOwn(CAREER_AREAS, raw.area) ? (raw.area as CareerAreaId) : "other",
    name: cleanLine(raw.name, MAX_LEN.name),
    email: cleanLine(raw.email, MAX_LEN.email),
    link: link ?? "",
    message: typeof raw.message === "string" ? raw.message.trim().slice(0, MAX_LEN.message) : "",
  };

  if (!interest.name || !interest.message || !EMAIL_RE.test(interest.email) || link === null) {
    return fail("missing_fields", 400);
  }

  const email = buildCareersInterestEmail(interest, new Date());
  const result = await deliverToInbox({
    tag: "careers-interest",
    defaultFrom: "CatchZone Careers <brief@catchzone.co.uk>",
    idempotencyPrefix: "careers-interest",
    submissionId: raw.submissionId,
    replyTo: interest.email,
    ...email,
  });
  return result.ok ? NextResponse.json({ ok: true }) : fail(result.reason, result.status);
}
