/**
 * Formats a validated Careers expression of interest as the notification
 * email sent to the CatchZone inbox. Server-only; values are validated by the
 * API route. Clearly separated from client sales enquiries by its subject.
 */
import { escapeHtml } from "@/lib/email/inboxDelivery";
import { CAREER_AREAS, type CareerAreaId } from "@/data/careers";

export interface CareersInterest {
  area: CareerAreaId;
  name: string;
  email: string;
  link: string;
  message: string;
}

export function buildCareersInterestEmail(interest: CareersInterest, submittedAt: Date) {
  const areaLabel = CAREER_AREAS[interest.area];
  const subject = `CatchZone Careers — Expression of interest (${areaLabel}) — ${interest.name}`;
  const when = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/London",
  }).format(submittedAt);

  const rows: [string, string][] = [
    ["Type", "Careers — expression of interest (not a client enquiry)"],
    ["Area of interest", areaLabel],
    ["Name", interest.name],
    ["Email", interest.email],
    ["Profile / portfolio", interest.link || "(not provided)"],
  ];

  const text = [
    "CatchZone Careers — Expression of interest",
    `Submitted ${when}`,
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "Message:",
    interest.message,
    "",
    "Reply to this email to respond directly to the sender.",
  ].join("\n");

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f6f5f1;font-family:Arial,Helvetica,sans-serif;color:#0e1116">
<table role="presentation" width="100%" style="max-width:620px;margin:0 auto;background:#ffffff;border-radius:12px;border:1px solid #e4e2dc">
<tr><td style="padding:24px 28px">
<p style="margin:0;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#6254d6">CatchZone Careers</p>
<h1 style="margin:8px 0 4px;font-size:20px">Expression of interest</h1>
<p style="margin:0 0 18px;font-size:13px;color:#5a6270">Submitted ${escapeHtml(when)}</p>
<table role="presentation" style="width:100%;border-collapse:collapse;font-size:14px">
${rows
  .map(
    ([k, v]) =>
      `<tr><td style="padding:6px 0;color:#5a6270;width:160px;vertical-align:top">${escapeHtml(k)}</td><td style="padding:6px 0">${escapeHtml(v)}</td></tr>`,
  )
  .join("\n")}
</table>
<p style="margin:18px 0 6px;font-size:13px;color:#5a6270">Message</p>
<div style="white-space:pre-wrap;font-size:14px;line-height:1.55;border-left:3px solid #8b7cf6;padding-left:12px">${escapeHtml(interest.message)}</div>
<p style="margin:22px 0 0;font-size:12px;color:#5a6270">Reply to this email to respond directly to the sender.</p>
</td></tr></table></body></html>`;

  return { subject, text, html };
}
