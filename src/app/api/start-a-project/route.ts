import { NextResponse } from "next/server";
import {
  buildTypeOptions,
  startingPointOptions,
  priorityOptions,
  budgetOptions,
  type ProjectBrief,
} from "@/data/project-config";
import { buildProjectBriefEmail } from "@/lib/email/projectBriefEmail";

/**
 * Start a Project submissions → an email to the CatchZone inbox via Resend.
 *
 * Only `RESEND_API_KEY` is required. The recipient is fixed to
 * PROJECT_INBOX; the sender defaults to DEFAULT_FROM and can be overridden
 * with `RESEND_FROM_EMAIL` to match whichever domain is verified in Resend.
 * The route only reports success once Resend has accepted the email; every
 * failure is logged server-side (never the API key) and surfaced to the
 * visitor as a friendly error with a pre-filled email fallback.
 */

const PROJECT_INBOX = "info@catchzone.co.uk";
const DEFAULT_FROM = "CatchZone Project Brief <brief@catchzone.co.uk>";
const RESEND_ENDPOINT = "https://api.resend.com/emails";
const SEND_TIMEOUT_MS = 10_000;

const MAX_LEN = {
  name: 120,
  email: 200,
  company: 160,
  phone: 40,
  description: 4000,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const FROM_RE = /^(?:[^<>\r\n]{1,80} <)?[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+>?$/;
const SUBMISSION_ID_RE = /^[A-Za-z0-9-]{8,64}$/;

const VALID_BUILD_TYPES = new Set(buildTypeOptions.map((o) => o.id));
const VALID_STARTING_POINTS = new Set(startingPointOptions.map((o) => o.id));
const VALID_PRIORITIES = new Set(priorityOptions.map((o) => o.id));
const VALID_BUDGETS = new Set(budgetOptions.map((o) => o.id));

/** Strips control/newline characters that have no business in a header or single-line field. */
function cleanLine(value: unknown, maxLen: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\r\n\t]+/g, " ").trim().slice(0, maxLen);
}

interface RawBody extends Partial<ProjectBrief> {
  /**
   * Honeypot — hidden from people and given a name autofill never targets
   * (a field called "website" can be autofilled, which would silently drop
   * a real enquiry).
   */
  cz_hp?: string;
  /** Client-generated id so a retried request can't send the email twice. */
  submissionId?: string;
}

/**
 * In-memory sliding-window rate limit per Node process — a practical
 * deterrent against casual abuse. It resets on restart and is per instance;
 * a shared store (e.g. Upstash Redis) would be needed for a hard global cap.
 */
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const requestLog = new Map<string, number[]>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) ?? []).filter(
    (t) => now - t < RATE_LIMIT_WINDOW_MS,
  );
  timestamps.push(now);
  requestLog.set(ip, timestamps);

  if (requestLog.size > 5000) {
    for (const [key, times] of requestLog) {
      if (times.every((t) => now - t >= RATE_LIMIT_WINDOW_MS)) requestLog.delete(key);
    }
  }

  return timestamps.length > RATE_LIMIT_MAX;
}

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function fail(reason: string, status: number) {
  return NextResponse.json({ ok: false, reason }, { status });
}

export async function POST(request: Request) {
  if (isRateLimited(getClientIp(request))) return fail("rate_limited", 429);

  let raw: RawBody;
  try {
    raw = await request.json();
  } catch {
    return fail("invalid_body", 400);
  }
  if (!raw || typeof raw !== "object") return fail("invalid_body", 400);

  // Honeypot: report a generic success so bots don't learn to skip it, but never send.
  if (typeof raw.cz_hp === "string" && raw.cz_hp.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const brief: ProjectBrief = {
    buildType: VALID_BUILD_TYPES.has(raw.buildType ?? "") ? raw.buildType! : "",
    startingPoint: VALID_STARTING_POINTS.has(raw.startingPoint ?? "") ? raw.startingPoint! : "",
    priorities: Array.isArray(raw.priorities)
      ? [...new Set(raw.priorities.filter((p): p is string => typeof p === "string" && VALID_PRIORITIES.has(p)))]
      : [],
    budget: VALID_BUDGETS.has(raw.budget ?? "") ? raw.budget! : "",
    name: cleanLine(raw.name, MAX_LEN.name),
    email: cleanLine(raw.email, MAX_LEN.email),
    company: cleanLine(raw.company, MAX_LEN.company),
    phone: cleanLine(raw.phone, MAX_LEN.phone),
    description: typeof raw.description === "string" ? raw.description.trim().slice(0, MAX_LEN.description) : "",
  };

  // Every one of the five steps is required by the form; reject anything that skipped them.
  if (
    !brief.buildType ||
    !brief.startingPoint ||
    brief.priorities.length === 0 ||
    !brief.budget ||
    !brief.name ||
    !brief.description ||
    !EMAIL_RE.test(brief.email)
  ) {
    return fail("missing_fields", 400);
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[start-a-project] RESEND_API_KEY is not set — the brief was not emailed.");
    return fail("unconfigured", 503);
  }

  const configuredFrom = process.env.RESEND_FROM_EMAIL?.trim();
  const from = configuredFrom && FROM_RE.test(configuredFrom) ? configuredFrom : DEFAULT_FROM;
  const email = buildProjectBriefEmail(brief, new Date());

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
  };
  if (typeof raw.submissionId === "string" && SUBMISSION_ID_RE.test(raw.submissionId)) {
    headers["Idempotency-Key"] = `start-a-project/${raw.submissionId}`;
  }

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: "POST",
      headers,
      signal: AbortSignal.timeout(SEND_TIMEOUT_MS),
      body: JSON.stringify({
        from,
        to: [PROJECT_INBOX],
        reply_to: brief.email,
        subject: email.subject,
        text: email.text,
        html: email.html,
      }),
    });

    if (!res.ok) {
      let detail = "";
      try {
        const body = (await res.json()) as { name?: string; message?: string };
        detail = [body.name, body.message].filter(Boolean).join(": ");
      } catch {
        // non-JSON error body — the status code is enough to diagnose
      }
      console.error(`[start-a-project] Resend rejected the email (HTTP ${res.status}) ${detail}`.trim());
      return fail("send_failed", 502);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(
      `[start-a-project] Could not reach Resend: ${error instanceof Error ? error.name : "unknown error"}`,
    );
    return fail("send_failed", 502);
  }
}
