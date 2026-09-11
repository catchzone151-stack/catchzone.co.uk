import { NextResponse } from "next/server";
import {
  buildTypeOptions,
  startingPointOptions,
  priorityOptions,
  budgetOptions,
  type ProjectBrief,
} from "@/data/project-config";

/**
 * Integration point for the project configurator. If RESEND_API_KEY and
 * RESEND_TO_EMAIL are set, this sends the brief via Resend. If not, it
 * deliberately does NOT report success — see docs/IMPLEMENTATION_NOTES.md
 * for the exact one-step launch configuration required.
 */

const MAX_LEN = {
  name: 120,
  email: 200,
  company: 160,
  phone: 40,
  description: 4000,
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  /** Honeypot — real visitors never populate this hidden field. */
  website?: string;
}

/**
 * In-memory sliding-window rate limit. Effective per Node process (this app
 * runs as a single `next start` server, not multi-instance edge functions),
 * which is a practical deterrent against casual abuse. It resets on
 * redeploy/restart and would need a shared store (e.g. Upstash Redis) to
 * hold across multiple instances — noted for a future horizontal-scale
 * deployment, not required for launch.
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

export async function POST(request: Request) {
  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { ok: false, reason: "rate_limited" },
      { status: 429 },
    );
  }

  let raw: RawBody;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, reason: "invalid_body" },
      { status: 400 },
    );
  }

  // Honeypot: bots that fill every field trip this hidden one. Report a
  // generic success so the bot doesn't learn to skip it, but never send.
  if (raw.website) {
    return NextResponse.json({ ok: true });
  }

  const brief: ProjectBrief = {
    buildType: VALID_BUILD_TYPES.has(raw.buildType ?? "") ? raw.buildType! : "",
    startingPoint: VALID_STARTING_POINTS.has(raw.startingPoint ?? "") ? raw.startingPoint! : "",
    priorities: Array.isArray(raw.priorities)
      ? raw.priorities.filter((p): p is string => typeof p === "string" && VALID_PRIORITIES.has(p))
      : [],
    budget: VALID_BUDGETS.has(raw.budget ?? "") ? raw.budget! : "",
    name: cleanLine(raw.name, MAX_LEN.name),
    email: cleanLine(raw.email, MAX_LEN.email),
    company: cleanLine(raw.company, MAX_LEN.company),
    phone: cleanLine(raw.phone, MAX_LEN.phone),
    description: typeof raw.description === "string" ? raw.description.trim().slice(0, MAX_LEN.description) : "",
  };

  if (!brief.name || !brief.email || !brief.description || !EMAIL_RE.test(brief.email)) {
    return NextResponse.json(
      { ok: false, reason: "missing_fields" },
      { status: 400 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const toEmail = process.env.RESEND_TO_EMAIL;

  if (!apiKey || !toEmail) {
    return NextResponse.json(
      { ok: false, reason: "unconfigured" },
      { status: 200 },
    );
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "CatchZone Project Brief <brief@catchzone.co.uk>",
        to: [toEmail],
        reply_to: brief.email,
        subject: `New project brief — ${brief.name}${brief.company ? ` (${brief.company})` : ""}`,
        text: [
          `Build type: ${brief.buildType || "—"}`,
          `Starting point: ${brief.startingPoint || "—"}`,
          `Priorities: ${brief.priorities.join(", ") || "—"}`,
          `Budget: ${brief.budget || "—"}`,
          "",
          `Name: ${brief.name}`,
          `Email: ${brief.email}`,
          `Company: ${brief.company || "—"}`,
          `Phone: ${brief.phone || "—"}`,
          "",
          "Description:",
          brief.description,
        ].join("\n"),
      }),
    });

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, reason: "send_failed" },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { ok: false, reason: "send_failed" },
      { status: 502 },
    );
  }
}
