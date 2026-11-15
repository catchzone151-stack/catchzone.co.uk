/**
 * Formats a validated CatchZone School HR enquiry as the notification email
 * sent to the CatchZone inbox. Server-only: values are validated by the API
 * route; this file only labels and escapes.
 */
import { escapeHtml } from "@/lib/email/inboxDelivery";
import { INTEREST_LABELS, type Interest } from "@/data/schoolHr";

export interface SchoolHrEnquiry {
  interest: Interest;
  name: string;
  email: string;
  organisation: string;
  message: string;
}

export function buildSchoolHrEnquiryEmail(enquiry: SchoolHrEnquiry, submittedAt: Date) {
  const interestLabel = INTEREST_LABELS[enquiry.interest];
  const shortInterest =
    enquiry.interest === "essentials"
      ? "Essentials"
      : enquiry.interest === "standard"
        ? "Standard"
        : enquiry.interest === "optional"
          ? "Optional modules"
          : "General";
  const subject = `CatchZone School HR — Demonstration request (${shortInterest}) — ${enquiry.name} (${enquiry.organisation})`;
  const when = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/London",
  }).format(submittedAt);

  const rows: [string, string][] = [
    ["Request", "School demonstration / enquiry"],
    ["Interest", interestLabel],
    ["Name", enquiry.name],
    ["Business email", enquiry.email],
    ["School / organisation", enquiry.organisation],
  ];
  const message = enquiry.message || "(No message provided)";

  const text = [
    "CatchZone School HR — Demonstration request",
    `Submitted ${when}`,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "Message:",
    message,
    "",
    "Reply to this email to respond directly to the sender.",
  ].join("\n");

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f6f5f1;font-family:Arial,Helvetica,sans-serif;color:#0e1116">
<table role="presentation" width="100%" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e4e2dc">
<tr><td style="padding:24px 28px">
<p style="margin:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#0d8076">CatchZone School HR</p>
<h1 style="margin:8px 0 4px;font-size:20px">Demonstration request</h1>
<p style="margin:0 0 18px;font-size:13px;color:#5a6270">Submitted ${escapeHtml(when)}</p>
<table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="padding:6px 0;color:#5a6270;width:170px;vertical-align:top">${escapeHtml(k)}</td><td style="padding:6px 0">${escapeHtml(v)}</td></tr>`,
  )
  .join("\n")}
</table>
<p style="margin:18px 0 6px;font-size:13px;color:#5a6270">Message</p>
<div style="white-space:pre-wrap;font-size:14px;line-height:1.55;border-left:3px solid #5eead4;padding-left:12px">${escapeHtml(message)}</div>
<p style="margin:22px 0 0;font-size:12px;color:#5a6270">Reply to this email to respond directly to the sender.</p>
</td></tr></table></body></html>`;

  return { subject, text, html };
}
