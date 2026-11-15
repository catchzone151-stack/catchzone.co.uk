/**
 * CatchZone School HR — marketing content for /school-hr.
 *
 * Positioning: a professional CatchZone software product, marketed with
 * confident, factual language (see docs/CATCHZONE_SCHOOL_HR.md).
 * Accuracy rules:
 * - Never claim a school uses it, multi-school deployment, or that every
 *   module is operational. Optional modules are "Planned" or "Scoped on request".
 * - Prices: Essentials £1,800 and Standard £3,600 per school / year; final
 *   pricing follows each school's agreed scope and terms (stated once).
 * - No payroll engine, no claimed EPM/IRIS integration, no certifications,
 *   no customer names, no invented metrics.
 * - People, numbers and records shown in the product previews are sample data.
 */

export type PackageId = "essentials" | "standard";
export type Interest = PackageId | "optional" | "general";

export const INTEREST_LABELS: Record<Interest, string> = {
  essentials: "Essentials — £1,800 per school / year",
  standard: "Standard — £3,600 per school / year",
  optional: "Optional modules",
  general: "Not sure yet — a general demonstration",
};

export interface Package {
  id: PackageId;
  name: string;
  price: string;
  period: string;
  positioning: string;
  note: string;
  inherits?: string;
  features: string[];
}

export const PACKAGES: Package[] = [
  {
    id: "essentials",
    name: "Essentials",
    price: "£1,800",
    period: "per school / year",
    positioning: "Everyday staff requests, approvals and essential school HR administration.",
    note: "Recommended start",
    features: [
      "Staff self-service",
      "Additional-hours claims",
      "Leave requests and balances",
      "TOIL requests and balances",
      "Return-to-work forms",
      "Line-manager and headteacher approvals",
      "Notifications and reminders",
      "Role-based access",
      "Basic administration dashboards",
      "Audit history",
      "Finance-ready records and agreed exports",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: "£3,600",
    period: "per school / year",
    positioning: "Everything in Essentials, plus staff records, documents, training, onboarding and enhanced administration.",
    note: "Extended HR features",
    inherits: "Everything in Essentials, plus",
    features: [
      "Staff directory",
      "Employment information",
      "Document storage and management",
      "Policies and acknowledgements",
      "Training and CPD tracking",
      "Training and certificate reminders",
      "Onboarding and leaver checklists",
      "Enhanced staff administration",
      "More detailed reporting",
    ],
  },
];

/** Feature comparison (Essentials vs Standard). */
export const COMPARISON: { group: string; rows: { feature: string; essentials: boolean; standard: boolean }[] }[] = [
  {
    group: "Requests and approvals",
    rows: [
      { feature: "Staff self-service portal", essentials: true, standard: true },
      { feature: "Additional-hours claims", essentials: true, standard: true },
      { feature: "Leave requests and balances", essentials: true, standard: true },
      { feature: "TOIL requests and balances", essentials: true, standard: true },
      { feature: "Return-to-work forms", essentials: true, standard: true },
      { feature: "Line-manager and headteacher approvals", essentials: true, standard: true },
      { feature: "Notifications and reminders", essentials: true, standard: true },
    ],
  },
  {
    group: "Administration and records",
    rows: [
      { feature: "Role-based access", essentials: true, standard: true },
      { feature: "Basic administration dashboards", essentials: true, standard: true },
      { feature: "Audit history", essentials: true, standard: true },
      { feature: "Finance-ready records and agreed exports", essentials: true, standard: true },
      { feature: "Enhanced staff administration", essentials: false, standard: true },
      { feature: "More detailed reporting", essentials: false, standard: true },
    ],
  },
  {
    group: "Staff management",
    rows: [
      { feature: "Staff directory", essentials: false, standard: true },
      { feature: "Employment information", essentials: false, standard: true },
      { feature: "Document storage and management", essentials: false, standard: true },
      { feature: "Policies and acknowledgements", essentials: false, standard: true },
      { feature: "Training and CPD tracking", essentials: false, standard: true },
      { feature: "Training and certificate reminders", essentials: false, standard: true },
      { feature: "Onboarding and leaver checklists", essentials: false, standard: true },
    ],
  },
];

export type ModuleStatus = "Essentials" | "Standard" | "Planned" | "Scoped on request";

export interface Module {
  id: string;
  tier: "essentials" | "standard" | "optional";
  name: string;
  summary: string;
  points: string[];
  status: ModuleStatus;
  /** Short implementation note for sensitive / statutory / integration areas (shown in module details). */
  note?: string;
  preview: { title: string; rows: { label: string; value: string; tag?: string }[] };
}

export const MODULES: Module[] = [
  // Essentials
  {
    id: "self-service",
    tier: "essentials",
    name: "Staff self-service",
    summary: "One place for staff to submit requests, see balances and follow every status.",
    points: ["Requests and forms from a phone or computer", "Live status for every request", "Personal balances at a glance"],
    status: "Essentials",
    preview: {
      title: "My requests",
      rows: [
        { label: "Additional hours · 2.5 hrs", value: "Approved", tag: "ok" },
        { label: "Annual leave · 3 days", value: "With line manager", tag: "wait" },
        { label: "Return-to-work form", value: "Completed", tag: "ok" },
      ],
    },
  },
  {
    id: "additional-hours",
    tier: "essentials",
    name: "Additional hours",
    summary: "Claims routed to the headteacher, then held as finance-ready records for the monthly deadline.",
    points: ["Claim types agreed with the school", "Headteacher approval step", "Monthly cut-off reminders"],
    status: "Essentials",
    preview: {
      title: "Additional hours — November",
      rows: [
        { label: "Parents’ evening · 2.5 hrs", value: "Approved", tag: "ok" },
        { label: "After-school club · 1.0 hr", value: "Awaiting head", tag: "wait" },
        { label: "Cut-off for this month", value: "20 Nov (example)" },
      ],
    },
  },
  {
    id: "leave",
    tier: "essentials",
    name: "Leave and balances",
    summary: "Leave requests checked against the school’s entitlements, with balances that update on approval.",
    points: ["Leave types configured per school", "Line-manager approval", "Balances update automatically"],
    status: "Essentials",
    preview: {
      title: "Leave balance",
      rows: [
        { label: "Entitlement (example)", value: "25 days" },
        { label: "Taken / booked", value: "11 days" },
        { label: "Remaining", value: "14 days", tag: "ok" },
      ],
    },
  },
  {
    id: "toil",
    tier: "essentials",
    name: "TOIL",
    summary: "Time off in lieu requested and approved against a running balance, using the school’s own rules.",
    points: ["Earning and usage rules set per school", "Approval before time is taken", "Running balance and history"],
    status: "Essentials",
    preview: {
      title: "TOIL balance",
      rows: [
        { label: "Earned (approved)", value: "6.0 hrs" },
        { label: "Requested · Fri pm", value: "3.0 hrs", tag: "wait" },
        { label: "Available after approval", value: "3.0 hrs" },
      ],
    },
  },
  {
    id: "rtw",
    tier: "essentials",
    name: "Return to work",
    summary: "A structured return-to-work form and manager review, completed and stored with restricted access.",
    points: ["Form sent automatically after an absence", "Manager review and sign-off", "Restricted, auditable record"],
    status: "Essentials",
    preview: {
      title: "Return-to-work tasks",
      rows: [
        { label: "Form submitted by staff member", value: "Done", tag: "ok" },
        { label: "Manager review", value: "Due today", tag: "wait" },
        { label: "Record access", value: "Restricted" },
      ],
    },
  },
  {
    id: "approvals",
    tier: "essentials",
    name: "Approvals and notifications",
    summary: "Each request reaches the right approver, with reminders so nothing waits unnoticed.",
    points: ["Approval routes per request type", "Email and in-app notifications", "Reminders for overdue approvals"],
    status: "Essentials",
    preview: {
      title: "Approvals waiting",
      rows: [
        { label: "Leave · 3 days", value: "Line manager", tag: "wait" },
        { label: "Additional hours · 1.0 hr", value: "Headteacher", tag: "wait" },
        { label: "Reminder", value: "Sent after 2 days (example)" },
      ],
    },
  },
  {
    id: "records",
    tier: "essentials",
    name: "Audit history and exports",
    summary: "Who did what and when, plus finance-ready records in an export format agreed with the school.",
    points: ["Audit trail on every request", "Basic administration dashboards", "Agreed export format for finance"],
    status: "Essentials",
    preview: {
      title: "Finance export",
      rows: [
        { label: "Approved claims this month", value: "Ready", tag: "ok" },
        { label: "Format", value: "Agreed with school" },
        { label: "Audit entries", value: "Every change logged" },
      ],
    },
  },
  // Standard
  {
    id: "directory",
    tier: "standard",
    name: "Staff directory and employment information",
    summary: "A single, permission-controlled view of staff and their employment details.",
    points: ["Searchable staff directory", "Employment information held once", "Access limited by role"],
    status: "Standard",
    preview: {
      title: "Staff directory",
      rows: [
        { label: "Sam Patel · Year 4 Teacher", value: "Teaching staff" },
        { label: "Alex Brown · Office Administrator", value: "Support staff" },
        { label: "Field-level access", value: "By role" },
      ],
    },
  },
  {
    id: "documents",
    tier: "standard",
    name: "Documents, policies and acknowledgements",
    summary: "Store staff documents and track who has read and acknowledged each policy.",
    points: ["Document storage and management", "Policy publishing", "Acknowledgement tracking"],
    status: "Standard",
    preview: {
      title: "Policy acknowledgements",
      rows: [
        { label: "Staff code of conduct (example)", value: "Acknowledged", tag: "ok" },
        { label: "Updated leave policy (example)", value: "Outstanding", tag: "wait" },
        { label: "Reminders", value: "Automatic" },
      ],
    },
  },
  {
    id: "training",
    tier: "standard",
    name: "Training and CPD",
    summary: "Record training and CPD, with reminders before certificates need renewing.",
    points: ["Training and CPD records", "Certificate expiry reminders", "Overview for leaders"],
    status: "Standard",
    preview: {
      title: "Training",
      rows: [
        { label: "First aid certificate (example)", value: "Renew in 30 days", tag: "wait" },
        { label: "CPD log · this year", value: "4 entries" },
        { label: "Reminder", value: "Before expiry" },
      ],
    },
  },
  {
    id: "onboarding",
    tier: "standard",
    name: "Onboarding and leavers",
    summary: "Checklists that make sure joiners and leavers are handled the same way every time.",
    points: ["Onboarding checklists", "Leaver checklists", "Task owners and due dates"],
    status: "Standard",
    preview: {
      title: "New starter checklist",
      rows: [
        { label: "Contract returned", value: "Done", tag: "ok" },
        { label: "IT account requested", value: "In progress", tag: "wait" },
        { label: "Induction booked", value: "To do" },
      ],
    },
  },
  {
    id: "reporting",
    tier: "standard",
    name: "Enhanced administration and reporting",
    summary: "More detailed reports and administration tools for the school office and leadership.",
    points: ["Broader staff administration", "More detailed reporting", "Filters by team and period"],
    status: "Standard",
    preview: {
      title: "Reports",
      rows: [
        { label: "Leave taken by team", value: "Report" },
        { label: "Additional hours by month", value: "Report" },
        { label: "Outstanding approvals", value: "Report" },
      ],
    },
  },
  // Optional modules (scoped individually)
  {
    id: "appraisal",
    tier: "optional",
    name: "Performance and appraisal",
    summary: "Appraisal cycles, objectives and review meetings, structured around your school’s own process.",
    points: ["Appraisal cycles and objectives", "Review meetings and sign-off", "Shaped to the school’s process"],
    status: "Planned",
    preview: { title: "Appraisal cycle", rows: [{ label: "Objectives set", value: "Autumn term" }, { label: "Mid-year review", value: "Spring term" }] },
  },
  {
    id: "absence",
    tier: "optional",
    name: "Enhanced sickness and absence",
    summary: "Fuller absence administration, building on the return-to-work process in Essentials.",
    points: ["Absence recording and history", "Trigger points set by school policy", "Restricted access throughout"],
    status: "Scoped on request",
    note: "Includes a data-protection assessment as part of scoping.",
    preview: { title: "Absence administration", rows: [{ label: "Trigger points", value: "School policy" }, { label: "Access", value: "Restricted" }] },
  },
  {
    id: "advanced-reporting",
    tier: "optional",
    name: "Advanced reporting",
    summary: "Configurable reports built around the questions your leadership team asks.",
    points: ["Report definitions agreed with you", "Scheduled report delivery", "For a school or a group of schools"],
    status: "Scoped on request",
    preview: { title: "Custom reports", rows: [{ label: "Definitions", value: "Agreed with you" }, { label: "Delivery", value: "Scheduled" }] },
  },
  {
    id: "recruitment",
    tier: "optional",
    name: "Recruitment workflows",
    summary: "Vacancy administration, applications and recruitment tasks, alongside your staff records.",
    points: ["Vacancy approval route", "Applications and recruitment tasks", "Hand-over to onboarding"],
    status: "Planned",
    preview: { title: "Recruitment", rows: [{ label: "Vacancy approval", value: "Route set by school" }, { label: "Next step", value: "Onboarding" }] },
  },
  {
    id: "casework",
    tier: "optional",
    name: "HR case management",
    summary: "Controlled handling of confidential HR cases, with strictly limited access and a full audit history.",
    points: ["Confidential case records", "Strictly limited access", "Full audit history"],
    status: "Scoped on request",
    note: "Scoped with a security and data-protection review.",
    preview: { title: "Case records", rows: [{ label: "Access", value: "Named staff only" }, { label: "Audit", value: "Every change" }] },
  },
  {
    id: "scr",
    tier: "optional",
    name: "Single Central Record support",
    summary: "Administrative support for keeping recruitment-check information organised, with reminders for gaps.",
    points: ["Structured check records", "Reminders and gaps highlighted", "Designed with your safeguarding lead"],
    status: "Scoped on request",
    note: "Safeguarding requirements and validation with your safeguarding lead form part of implementation.",
    preview: { title: "Single Central Record", rows: [{ label: "Check records", value: "Structured" }, { label: "Reminders", value: "Before expiry" }] },
  },
  {
    id: "trust",
    tier: "optional",
    name: "Multi-school trust management",
    summary: "Oversight across a group of schools, with each school’s staff, data and policies kept separate.",
    points: ["Group-level oversight", "School-specific policies", "Separation between schools"],
    status: "Planned",
    preview: { title: "Trust overview", rows: [{ label: "Schools", value: "Kept separate" }, { label: "Policies", value: "Per school" }] },
  },
  {
    id: "integrations",
    tier: "optional",
    name: "Integrations and bespoke workflows",
    summary: "Connections to other systems and workflows specific to your school, assessed and quoted individually.",
    points: ["Assessed against your requirements", "Depends on third-party technical access", "Quoted separately"],
    status: "Scoped on request",
    note: "Each integration is assessed against your requirements and the third party’s technical access.",
    preview: { title: "Integration", rows: [{ label: "Requirements", value: "Assessed first" }, { label: "Quote", value: "Individual" }] },
  },
];

/** One shared explanation for optional modules (used by the catalogue and explorer). */
export const OPTIONAL_MODULES_NOTE =
  "Additional modules are scoped individually. Features involving sensitive information, safeguarding or third-party integrations require appropriate technical and security assessment.";

export const CAPABILITIES: { title: string; body: string }[] = [
  { title: "Staff groups and permissions", body: "Teaching and support staff, office and leadership roles — each sees only what their role allows." },
  { title: "Approval responsibilities", body: "Who approves what is set per request type, so each request reaches the right person." },
  { title: "Leave policies and entitlements", body: "Leave types and entitlements configured to the school’s own policies." },
  { title: "Additional-hours claims", body: "Claim types and approval agreed with the school, ready for the monthly finance process." },
  { title: "TOIL rules and balances", body: "How TOIL is earned and used is configured per school — not fixed rates." },
  { title: "Return-to-work administration", body: "Forms, manager reviews and completion, with restricted access to records." },
  { title: "Notifications and reminders", body: "Timely nudges for approvers and staff, so requests don’t stall." },
  { title: "Monthly finance deadlines", body: "Cut-off dates and reminders aligned to the school’s finance calendar." },
  { title: "Audit history", body: "A clear record of submissions, decisions and changes." },
  { title: "Relevant exports", body: "Finance-ready records in a format agreed during implementation." },
];

export const FAQS: { q: string; a: string }[] = [
  {
    q: "What is CatchZone School HR?",
    a: "A school HR platform from CatchZone Ltd. It brings everyday staff requests — additional hours, leave, TOIL and return-to-work — and their approvals into one straightforward place, with clear statuses and finance-ready records.",
  },
  {
    q: "What is included in Essentials?",
    a: "Staff self-service, additional-hours claims, leave and TOIL requests with balances, return-to-work forms, line-manager and headteacher approvals, notifications and reminders, role-based access, basic administration dashboards, audit history, and finance-ready records with agreed exports.",
  },
  {
    q: "What does Standard add?",
    a: "Staff directory, employment information, document storage, policies and acknowledgements, training and CPD tracking with reminders, onboarding and leaver checklists, enhanced administration and more detailed reporting. Feature availability and timescales are confirmed with your school during scoping, before any commitment.",
  },
  {
    q: "Can we add further modules?",
    a: "Yes — optional modules such as appraisal, recruitment workflows or trust-level oversight are scoped and quoted individually. Modules involving sensitive information, safeguarding or third-party integrations include an appropriate technical and security assessment.",
  },
  {
    q: "Can staff use it from their phone?",
    a: "Yes. It is designed for use in a web browser on phones, tablets and computers, so staff can submit requests and approvers can respond without being at a desk. We confirm device requirements with your school during setup.",
  },
  {
    q: "How do approvals work?",
    a: "Each request type has its own approval route — for example, leave and TOIL to the line manager, and additional hours to the headteacher. Approvers are notified, the requester can see the status, and every decision is recorded in the audit history. Routes are configured to your school’s rules.",
  },
  {
    q: "Can schools configure their own policies?",
    a: "Yes. Leave types, entitlements, TOIL rules, approval routes and deadlines are configured with each school during implementation. We don’t assume one school’s policies apply to every school.",
  },
  {
    q: "Does it replace payroll software?",
    a: "No. CatchZone School HR is not a payroll system. It produces finance-ready records of approved items; how those reach payroll depends on your school’s arrangements and an export format agreed during implementation.",
  },
  {
    q: "Can it work alongside our existing HR and payroll arrangements?",
    a: "Yes — it handles the requests and approvals and provides agreed exports for your existing finance or payroll process. A direct integration with another system is assessed against your requirements and the supplier’s technical access; we don’t claim compatibility with specific payroll products.",
  },
  {
    q: "How is staff information protected?",
    a: "Role-based access so people only see what their role needs, sign-in for every user, restricted access to sensitive records such as return-to-work forms, audit history and regular backups. We walk through the security and data-protection arrangements in detail with your school before any commitment.",
  },
  {
    q: "What happens during implementation?",
    a: "We start by understanding your current processes, roles and approval rules; then configure and test the workflows with you; then run an agreed pilot period before wider use. Timelines are agreed with your school rather than fixed in advance.",
  },
  {
    q: "Is support included?",
    a: "The annual licence includes hosting, routine maintenance, standard software updates, backups and a defined level of support. Significant data migration, bespoke development, additional training or special integration work is quoted separately.",
  },
  {
    q: "How can a school request a demonstration?",
    a: "Use the form below or email info@catchzone.co.uk. We’ll arrange a walkthrough of the workflows and talk through how your school currently handles staff requests.",
  },
];
