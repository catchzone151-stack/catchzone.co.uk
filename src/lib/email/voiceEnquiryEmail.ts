/**
 * Formats a validated CatchZone Voice enquiry as the notification email sent
 * to the CatchZone inbox. Server-only: values are validated by the API route;
 * this file only labels and escapes.
 */

export type VoiceEnquiryIntent = "demonstration" | "requirements";

export interface VoiceEnquiry {
  intent: VoiceEnquiryIntent;
  name: string;
  email: string;
  company: string;
  message: string;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildVoiceEnquiryEmail(enquiry: VoiceEnquiry, submittedAt: Date) {
  const isDemo = enquiry.intent === "demonstration";
  const requestLabel = isDemo ? "Private demonstration request" : "Business enquiry";
  const subject = `${isDemo ? "CatchZone Voice — Private demonstration request" : "CatchZone Voice — Business enquiry"} — ${enquiry.name} (${enquiry.company})`;
  const when = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/London",
  }).format(submittedAt);

  const rows: [string, string][] = [
    ["Request", requestLabel],
    ["Name", enquiry.name],
    ["Business email", enquiry.email],
    ["Company", enquiry.company],
  ];

  const text = [
    `CatchZone Voice — ${requestLabel}`,
    `Submitted ${when}`,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "Message:",
    enquiry.message,
    "",
    "Reply to this email to respond directly to the sender.",
  ].join("\n");

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f6f5f1;font-family:Arial,Helvetica,sans-serif;color:#0e1116">
<table role="presentation" width="100%" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e4e2dc">
<tr><td style="padding:24px 28px">
<p style="margin:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#0d8076">CatchZone Voice</p>
<h1 style="margin:8px 0 4px;font-size:20px">${escapeHtml(requestLabel)}</h1>
<p style="margin:0 0 18px;font-size:13px;color:#5a6270">Submitted ${escapeHtml(when)}</p>
<table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="padding:6px 0;color:#5a6270;width:140px;vertical-align:top">${escapeHtml(k)}</td><td style="padding:6px 0">${escapeHtml(v)}</td></tr>`,
  )
  .join("\n")}
</table>
<p style="margin:18px 0 6px;font-size:13px;color:#5a6270">Message</p>
<div style="white-space:pre-wrap;font-size:14px;line-height:1.55;border-left:3px solid #5eead4;padding-left:12px">${escapeHtml(enquiry.message)}</div>
<p style="margin:22px 0 0;font-size:12px;color:#5a6270">Reply to this email to respond directly to the sender.</p>
</td></tr></table></body></html>`;

  return { subject, text, html };
}
