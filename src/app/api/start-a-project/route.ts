import { NextResponse } from "next/server";
import type { ProjectBrief } from "@/data/project-config";

/**
 * Integration point for the project configurator. No email/CRM backend is
 * provisioned yet, so this deliberately does NOT report success unless a
 * real send actually happens — see docs/IMPLEMENTATION_NOTES.md for what
 * needs configuring (RESEND_API_KEY + RESEND_TO_EMAIL, or an equivalent
 * provider) before this can send automatically.
 */
export async function POST(request: Request) {
  let brief: ProjectBrief;
  try {
    brief = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, reason: "invalid_body" },
      { status: 400 },
    );
  }

  if (!brief.email || !brief.name || !brief.description) {
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
          `Build type: ${brief.buildType}`,
          `Starting point: ${brief.startingPoint}`,
          `Priorities: ${brief.priorities.join(", ")}`,
          `Budget: ${brief.budget}`,
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
