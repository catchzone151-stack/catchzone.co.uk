import {
  budgetOptions,
  buildTypeOptions,
  priorityOptions,
  startingPointOptions,
  type ConfigOption,
  type ProjectBrief,
} from "@/data/project-config";

/**
 * Formats a validated Start a Project brief as the notification email sent
 * to CatchZone. Server-only: every value has already been validated by the
 * API route; this file only labels and escapes.
 */

const labelFor = (options: ConfigOption[], id: string) =>
  options.find((o) => o.id === id)?.label ?? "Not provided";

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface Row {
  label: string;
  value: string;
}

function sections(brief: ProjectBrief) {
  const project: Row[] = [
    { label: "1. What are we building?", value: labelFor(buildTypeOptions, brief.buildType) },
    { label: "2. Where are you now?", value: labelFor(startingPointOptions, brief.startingPoint) },
    {
      label: "3. What matters most?",
      value: brief.priorities.length
        ? brief.priorities.map((id) => labelFor(priorityOptions, id)).join(", ")
        : "Not provided",
    },
    { label: "4. Project investment", value: labelFor(budgetOptions, brief.budget) },
  ];
  const contact: Row[] = [
    { label: "Name", value: brief.name },
    { label: "Email", value: brief.email },
    { label: "Company", value: brief.company || "Not provided" },
    { label: "Phone", value: brief.phone || "Not provided" },
  ];
  return { project, contact };
}

export function buildProjectBriefEmail(brief: ProjectBrief, submittedAt: Date) {
  const { project, contact } = sections(brief);
  const when = new Intl.DateTimeFormat("en-GB", {
    dateStyle: "full",
    timeStyle: "short",
    timeZone: "Europe/London",
  }).format(submittedAt);

  const subject = `New project brief: ${brief.name}${brief.company ? ` (${brief.company})` : ""}`;

  const text = [
    "New Start a Project submission from catchzone.co.uk",
    `Submitted: ${when} (UK time)`,
    "",
    "PROJECT",
    ...project.map((r) => `${r.label}: ${r.value}`),
    "",
    "5. ABOUT THE PROJECT",
    ...contact.map((r) => `${r.label}: ${r.value}`),
    "",
    "Project description:",
    brief.description,
    "",
    "Reply to this email to respond directly to the enquirer.",
  ].join("\n");

  const rows = (items: Row[]) =>
    items
      .map(
        (r) =>
          `<tr><td style="padding:6px 16px 6px 0;color:#6b7280;vertical-align:top;white-space:nowrap">${escapeHtml(r.label)}</td><td style="padding:6px 0;color:#111827;font-weight:600">${escapeHtml(r.value)}</td></tr>`,
      )
      .join("");

  const html = `<!doctype html><html><body style="margin:0;padding:24px;background:#f4f5f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:1.5">
<div style="max-width:640px;margin:0 auto;background:#ffffff;border-radius:12px;padding:28px">
<p style="margin:0;color:#0f766e;font-size:12px;letter-spacing:.12em;text-transform:uppercase;font-weight:700">New project brief</p>
<h1 style="margin:8px 0 4px;font-size:20px;color:#111827">${escapeHtml(brief.name)}${brief.company ? ` <span style="color:#6b7280;font-weight:400">(${escapeHtml(brief.company)})</span>` : ""}</h1>
<p style="margin:0 0 20px;color:#6b7280">Submitted ${escapeHtml(when)} (UK time) via catchzone.co.uk/start-a-project</p>
<h2 style="margin:0 0 6px;font-size:13px;color:#111827;text-transform:uppercase;letter-spacing:.08em">Project</h2>
<table style="border-collapse:collapse;margin-bottom:20px">${rows(project)}</table>
<h2 style="margin:0 0 6px;font-size:13px;color:#111827;text-transform:uppercase;letter-spacing:.08em">5. About the project</h2>
<table style="border-collapse:collapse;margin-bottom:16px">${rows(contact)}</table>
<p style="margin:0 0 6px;color:#6b7280">Project description</p>
<div style="white-space:pre-wrap;padding:14px 16px;background:#f9fafb;border-radius:8px;color:#111827">${escapeHtml(brief.description)}</div>
<p style="margin:20px 0 0;color:#6b7280;font-size:12px">Reply to this email to respond directly to ${escapeHtml(brief.name)}.</p>
</div></body></html>`;

  return { subject, text, html };
}
