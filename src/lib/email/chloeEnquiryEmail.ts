/**
 * Formats a validated Chloe enquiry as the notification email sent to the
 * CatchZone inbox. Server-only: the API route has already validated and
 * whitelisted every value; this file only labels and escapes.
 */
import { escapeHtml } from "@/lib/email/inboxDelivery";

export interface ChloeEnquiry {
  /** Human label of the service / combination / product, from a whitelist. */
  service: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  timescale: string;
  budget: string;
  /** Path of the page the visitor was on, e.g. "/pricing". */
  page: string;
}

export function buildChloeEnquiryEmail(enquiry: ChloeEnquiry, submittedAt: Date) {
  const when = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/London",
  }).format(submittedAt);

  const subject = `New CatchZone Enquiry — ${enquiry.service} — Chloe`;

  const rows: [string, string][] = [
    ["Name", enquiry.name],
    ["Email", enquiry.email],
    ["Phone", enquiry.phone || "Not provided"],
    ["Selected service", enquiry.service],
    ["Preferred timescale", enquiry.timescale || "Not provided"],
    ["Indicative budget", enquiry.budget || "Not provided"],
    ["Enquiry source", "Chloe (website assistant)"],
    ["Page", enquiry.page ? `catchzone.co.uk${enquiry.page}` : "Not recorded"],
    ["Submitted", `${when} (UK time)`],
  ];

  const text = [
    "New CatchZone enquiry from Chloe, the website assistant",
    "",
    ...rows.map(([k, v]) => `${k}: ${v}`),
    "",
    "Project details:",
    enquiry.message,
    "",
    "Reply to this email to respond directly to the enquirer.",
  ].join("\n");

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5">
<div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px">
<p style="margin:0;color:#0f766e;font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:700">New enquiry · Chloe</p>
<h1 style="margin:8px 0 4px;font-size:20px;color:#111827">${escapeHtml(enquiry.service)}</h1>
<p style="margin:0 0 20px;color:#6b7280">From ${escapeHtml(enquiry.name)} via the CatchZone website assistant</p>
<table role="presentation" style="border-collapse:collapse;margin-bottom:16px">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 16px 6px 0;color:#6b7280;vertical-align:top;white-space:nowrap">${escapeHtml(k)}</td><td style="padding:6px 0;color:#111827;font-weight:600">${escapeHtml(v)}</td></tr>`,
    )
    .join("")}</table>
<p style="margin:0 0 6px;color:#6b7280">Project details</p>
<div style="white-space:pre-wrap;padding:14px 16px;background:#f9fafb;border-radius:8px;color:#111827">${escapeHtml(enquiry.message)}</div>
<p style="margin:20px 0 0;color:#6b7280;font-size:12px">Reply to this email to respond directly to ${escapeHtml(enquiry.name)}.</p>
</div></body></html>`;

  return { subject, text, html };
}
