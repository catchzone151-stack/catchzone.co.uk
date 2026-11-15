/**
 * CatchZone School HR — marketing content for /school-hr.
 *
 * Accuracy rules (see docs/CATCHZONE_SCHOOL_HR.md):
 * - The product is in development at pilot stage. Nothing here may imply it is
 *   deployed commercially, or that a planned module is available today.
 * - Prices are PROPOSED licence prices for the pilot/development phase.
 * - No payroll engine, no claimed EPM/IRIS integration, no certifications,
 *   no customer names, no invented metrics.
 * - All people, numbers and records shown in previews are fictional.
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
    positioning: "The everyday requests and approvals a school runs on. The intended package for the first school pilot.",
    note: "Intended starting package",
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
    positioning: "Essentials plus the planned broader staff-management features, for schools that want one place for staff administration.",
    note: "Planned broader scope",
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

export type ModuleStatus = "Essentials" | "Standard" | "Planned" | "Requirements discussion";

export interface Module {
  id: string;
  tier: "essentials" | "standard" | "optional";
  name: string;
  summary: string;
  points: string[];
  status: ModuleStatus;
  /** Extra caution for sensitive / statutory areas. */
  caution?: string;
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
  // Optional (future / separately scoped)
  {
    id: "appraisal",
    tier: "optional",
    name: "Performance and appraisal",
    summary: "Structured appraisal cycles and objectives, designed with the school’s own process.",
    points: ["Appraisal cycles and objectives", "Review meetings and sign-off", "Scoped with each school"],
    status: "Planned",
    preview: { title: "Appraisal cycle", rows: [{ label: "Objectives set", value: "Planned module" }, { label: "Mid-year review", value: "Planned module" }] },
  },
  {
    id: "absence",
    tier: "optional",
    name: "Enhanced sickness and absence",
    summary: "Fuller absence administration beyond return-to-work forms.",
    points: ["Absence recording and patterns", "Trigger points set by policy", "Restricted access throughout"],
    status: "Requirements discussion",
    caution: "Handles sensitive personnel information, so it needs detailed scoping, data-protection review and testing before any use.",
    preview: { title: "Absence administration", rows: [{ label: "Scope", value: "To be agreed" }, { label: "Access", value: "Restricted" }] },
  },
  {
    id: "advanced-reporting",
    tier: "optional",
    name: "Advanced reporting",
    summary: "Custom reports and analysis built around the questions your leadership asks.",
    points: ["Bespoke report definitions", "Scheduled report delivery", "Scoped per school or trust"],
    status: "Requirements discussion",
    preview: { title: "Custom reports", rows: [{ label: "Definitions", value: "Agreed with you" }, { label: "Delivery", value: "To be scoped" }] },
  },
  {
    id: "recruitment",
    tier: "optional",
    name: "Recruitment workflows",
    summary: "Vacancy approvals and recruitment steps managed in the same place as staff records.",
    points: ["Vacancy approval route", "Recruitment stages", "Hand-over to onboarding"],
    status: "Planned",
    preview: { title: "Recruitment", rows: [{ label: "Vacancy approval", value: "Planned module" }, { label: "Stages", value: "Planned module" }] },
  },
  {
    id: "casework",
    tier: "optional",
    name: "HR case management",
    summary: "Confidential case records with strict access, scoped carefully with each school.",
    points: ["Confidential case records", "Strictly limited access", "Full audit history"],
    status: "Requirements discussion",
    caution: "Involves confidential personnel matters and legal obligations; it would need detailed requirements, security review and testing — it is not a ready-made add-on.",
    preview: { title: "Case records", rows: [{ label: "Scope", value: "To be agreed" }, { label: "Access", value: "Strictly limited" }] },
  },
  {
    id: "scr",
    tier: "optional",
    name: "Single Central Record support",
    summary: "Support for maintaining recruitment-check information that schools are required to keep.",
    points: ["Structured check records", "Reminders and gaps highlighted", "Designed with safeguarding leads"],
    status: "Requirements discussion",
    caution: "Safeguarding and statutory requirements apply. This would only be built with the school’s safeguarding leads and validated thoroughly before any use.",
    preview: { title: "Single Central Record", rows: [{ label: "Scope", value: "To be agreed" }, { label: "Validation", value: "Required before use" }] },
  },
  {
    id: "trust",
    tier: "optional",
    name: "Multi-school trust management",
    summary: "Trust-level oversight across several schools, each keeping its own policies.",
    points: ["Trust-level dashboards", "School-specific policies", "Central administration"],
    status: "Planned",
    caution: "The product is designed to be reusable across schools; running several schools together has not yet been verified in live use.",
    preview: { title: "Trust overview", rows: [{ label: "Schools", value: "Planned module" }, { label: "Policies", value: "Per school" }] },
  },
  {
    id: "integrations",
    tier: "optional",
    name: "Integrations and bespoke workflows",
    summary: "Additional integrations or workflows specific to your school, quoted separately.",
    points: ["Requirements agreed first", "Technical validation before commitment", "Quoted separately"],
    status: "Requirements discussion",
    caution: "No payroll or HR system integration is claimed as available today; any integration depends on agreed requirements and technical validation.",
    preview: { title: "Integration", rows: [{ label: "Requirements", value: "Discussed first" }, { label: "Validation", value: "Before commitment" }] },
  },
];

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
    a: "A school-focused HR administration product being developed by CatchZone Ltd. It brings everyday staff requests — additional hours, leave, TOIL and return-to-work — and their approvals into one connected place. It is currently in development, at pilot stage.",
  },
  {
    q: "What is included in Essentials?",
    a: "Staff self-service, additional-hours claims, leave and TOIL requests with balances, return-to-work forms, line-manager and headteacher approvals, notifications and reminders, role-based access, basic administration dashboards, audit history, and finance-ready records with agreed exports. Essentials is the intended package for the first school pilot.",
  },
  {
    q: "What does Standard add?",
    a: "The planned broader staff-management features: staff directory, employment information, document storage, policies and acknowledgements, training and CPD tracking with reminders, onboarding and leaver checklists, enhanced administration and more detailed reporting. These features are planned; their final scope is confirmed with each school.",
  },
  {
    q: "Can we purchase additional modules?",
    a: "Optional modules — such as appraisal, recruitment workflows or trust-level management — are planned or available for a requirements discussion. None is presented as ready to switch on today. Each is scoped and quoted separately, and modules involving sensitive or statutory information need careful scoping and validation first.",
  },
  {
    q: "Can staff use it from their phone?",
    a: "That is the intention: it is being designed for use in a web browser on phones, tablets and computers, so staff can submit requests and approvers can respond without being at a desk. Device support is confirmed with each school during the pilot.",
  },
  {
    q: "How do approvals work?",
    a: "Each request type has an agreed approval route — for example, leave and TOIL to the line manager, and additional hours to the headteacher. Approvers are notified, the requester can see the status, and every decision is recorded in the audit history.",
  },
  {
    q: "Can schools configure their own policies?",
    a: "The product is designed around configurable rules — leave types, entitlements, TOIL rules, approval routes and deadlines — agreed with each school during implementation. We don’t assume one school’s policies apply to every school.",
  },
  {
    q: "Does it replace payroll software?",
    a: "No. CatchZone School HR is not a payroll system. It produces finance-ready records of approved items; how those reach payroll depends on the school’s arrangements and an export format agreed during implementation.",
  },
  {
    q: "Can it work alongside our existing HR and payroll arrangements?",
    a: "That is the intention: it handles the requests and approvals, and provides agreed exports for your existing finance or payroll process. Any direct integration with another system would depend on agreed requirements and technical validation — we don’t claim compatibility with specific payroll products.",
  },
  {
    q: "How is staff information protected?",
    a: "The approach is role-based access so people only see what their role needs, sign-in for every user, restricted access to sensitive records such as return-to-work forms, audit history, and regular backups. We will walk through the security and data-protection arrangements in detail with any school before a pilot; we don’t claim certifications we don’t hold.",
  },
  {
    q: "What happens during implementation?",
    a: "We start by understanding your current processes, roles and approval rules; then configure and test the workflows with you; then run an agreed pilot before wider use. Timelines depend on your school and are agreed together rather than promised in advance.",
  },
  {
    q: "Is support included?",
    a: "The annual licence is intended to include hosting, routine maintenance, standard software updates, backups and a defined level of support. Significant data migration, bespoke development, additional training or special integration work may be quoted separately.",
  },
  {
    q: "How can a school request a demonstration?",
    a: "Use the form below or email info@catchzone.co.uk. We’ll arrange a walkthrough of the workflows and talk through how your school currently handles staff requests.",
  },
];
