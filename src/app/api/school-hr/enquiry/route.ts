import { NextResponse } from "next/server";
import { buildSchoolHrEnquiryEmail, type SchoolHrEnquiry } from "@/lib/email/schoolHrEnquiryEmail";
import { EMAIL_RE, cleanLine, clientIp, createRateLimiter, deliverToInbox, formRequestGuard } from "@/lib/email/inboxDelivery";
import type { Interest } from "@/data/schoolHr";

/**
 * CatchZone School HR demonstration requests → the CatchZone inbox via Resend,
 * through the shared delivery path in `src/lib/email/inboxDelivery.ts`
 * (fixed recipient info@catchzone.co.uk, visitor Reply-To, Idempotency-Key,
 * success only once Resend accepts the email).
 */

export const dynamic = "force-dynamic";

const MAX_LEN = { name: 120, email: 200, organisation: 160, message: 3000 };
const INTERESTS = new Set<Interest>(["essentials", "standard", "optional", "general"]);
const isRateLimited = createRateLimiter(10 * 60 * 1000, 5);

function fail(reason: string, status: number) {
  return NextResponse.json({ ok: false, reason }, { status });
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

  const enquiry: SchoolHrEnquiry = {
    interest: typeof raw.interest === "string" && INTERESTS.has(raw.interest as Interest) ? (raw.interest as Interest) : "general",
    name: cleanLine(raw.name, MAX_LEN.name),
    email: cleanLine(raw.email, MAX_LEN.email),
    organisation: cleanLine(raw.organisation, MAX_LEN.organisation),
    message: typeof raw.message === "string" ? raw.message.trim().slice(0, MAX_LEN.message) : "",
  };

  if (!enquiry.name || !enquiry.organisation || !EMAIL_RE.test(enquiry.email)) {
    return fail("missing_fields", 400);
  }

  const email = buildSchoolHrEnquiryEmail(enquiry, new Date());
  const result = await deliverToInbox({
    tag: "school-hr-enquiry",
    defaultFrom: "CatchZone School HR <brief@catchzone.co.uk>",
    idempotencyPrefix: "school-hr-enquiry",
    submissionId: raw.submissionId,
    replyTo: enquiry.email,
    ...email,
  });
  return result.ok ? NextResponse.json({ ok: true }) : fail(result.reason, result.status);
}
