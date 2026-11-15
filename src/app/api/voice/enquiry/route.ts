import { NextResponse } from "next/server";
import { buildVoiceEnquiryEmail, type VoiceEnquiry, type VoiceEnquiryIntent } from "@/lib/email/voiceEnquiryEmail";
import { EMAIL_RE, cleanLine, clientIp, createRateLimiter, deliverToInbox } from "@/lib/email/inboxDelivery";

/**
 * CatchZone Voice enquiries → the CatchZone inbox via Resend, through the
 * shared delivery path in `src/lib/email/inboxDelivery.ts` (fixed recipient
 * info@catchzone.co.uk, visitor Reply-To, Idempotency-Key, success only once
 * Resend accepts the email). The UI offers a mailto fallback on failure.
 */

export const dynamic = "force-dynamic";

const MAX_LEN = { name: 120, email: 200, company: 160, message: 3000 };
const INTENTS = new Set<VoiceEnquiryIntent>(["demonstration", "requirements"]);
const isRateLimited = createRateLimiter(10 * 60 * 1000, 5);

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

  const email = buildVoiceEnquiryEmail(enquiry, new Date());
  const result = await deliverToInbox({
    tag: "voice-enquiry",
    defaultFrom: "CatchZone Voice <brief@catchzone.co.uk>",
    idempotencyPrefix: "voice-enquiry",
    submissionId: raw.submissionId,
    replyTo: enquiry.email,
    ...email,
  });
  return result.ok ? NextResponse.json({ ok: true }) : fail(result.reason, result.status);
}
