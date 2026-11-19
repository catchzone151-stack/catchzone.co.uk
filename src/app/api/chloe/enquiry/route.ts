import { NextResponse } from "next/server";
import { BUDGET_OPTIONS, LEAD_TOPIC_LABELS, TIMESCALE_OPTIONS, type LeadTopic } from "@/data/chloe";
import { combinationName, findCombination } from "@/data/pricing";
import { buildChloeEnquiryEmail, type ChloeEnquiry } from "@/lib/email/chloeEnquiryEmail";
import { EMAIL_RE, cleanLine, clientIp, createRateLimiter, deliverToInbox, formRequestGuard } from "@/lib/email/inboxDelivery";

/**
 * Chloe (website assistant) enquiries → the CatchZone inbox via Resend,
 * through the shared, proven delivery path in `src/lib/email/inboxDelivery.ts`:
 * fixed recipient info@catchzone.co.uk, visitor Reply-To, Idempotency-Key,
 * success reported only once Resend accepts the email. Nothing is stored.
 */

export const dynamic = "force-dynamic";

const MAX_LEN = { name: 120, email: 200, phone: 40, message: 3000, page: 200 };
const PHONE_RE = /^[+()\d\s.-]{6,40}$/;
const PAGE_RE = /^\/[A-Za-z0-9/_-]{0,199}$/;
const TOPICS = new Set(Object.keys(LEAD_TOPIC_LABELS) as LeadTopic[]);
const TIMESCALES = new Map<string, string>(TIMESCALE_OPTIONS.map((o) => [o.id, o.label]));
const BUDGETS = new Map<string, string>(BUDGET_OPTIONS.map((o) => [o.id, o.label]));
const isRateLimited = createRateLimiter(10 * 60 * 1000, 5);

function fail(reason: string, status: number) {
  return NextResponse.json({ ok: false, reason }, { status });
}

/** Whitelisted label for the enquiry's subject; a combination must be an approved pair. */
function serviceLabel(topic: unknown, combination: unknown): string | null {
  if (typeof topic !== "string" || !TOPICS.has(topic as LeadTopic)) return null;
  if (topic === "combination" && Array.isArray(combination)) {
    const combo = findCombination(combination.filter((id): id is string => typeof id === "string"));
    if (combo) return `${combinationName(combo)} (combined build)`;
  }
  return LEAD_TOPIC_LABELS[topic as LeadTopic];
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
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return fail("invalid_body", 400);

  // Honeypot (same autofill-safe name as the other forms): accept silently, never send.
  if (raw.cz_hp) return NextResponse.json({ ok: true });

  const service = serviceLabel(raw.topic, raw.combination);
  const phone = cleanLine(raw.phone, MAX_LEN.phone);
  const page = cleanLine(raw.page, MAX_LEN.page);
  const enquiry: ChloeEnquiry = {
    service: service ?? "",
    name: cleanLine(raw.name, MAX_LEN.name),
    email: cleanLine(raw.email, MAX_LEN.email),
    phone,
    message: typeof raw.message === "string" ? raw.message.trim().slice(0, MAX_LEN.message) : "",
    timescale: typeof raw.timescale === "string" ? (TIMESCALES.get(raw.timescale) ?? "") : "",
    budget: typeof raw.budget === "string" ? (BUDGETS.get(raw.budget) ?? "") : "",
    page: PAGE_RE.test(page) ? page : "",
  };

  if (!service || !enquiry.name || !enquiry.message || !EMAIL_RE.test(enquiry.email)) {
    return fail("missing_fields", 400);
  }
  if (phone && !PHONE_RE.test(phone)) return fail("invalid_phone", 400);

  const email = buildChloeEnquiryEmail(enquiry, new Date());
  const result = await deliverToInbox({
    tag: "chloe-enquiry",
    defaultFrom: "CatchZone Website <brief@catchzone.co.uk>",
    idempotencyPrefix: "chloe-enquiry",
    submissionId: raw.submissionId,
    replyTo: enquiry.email,
    ...email,
  });
  return result.ok ? NextResponse.json({ ok: true }) : fail(result.reason, result.status);
}
