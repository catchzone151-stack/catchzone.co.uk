"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AppWindow, Avatar, StatusPill, ROLES, ROLE_TONE, type RoleId, type Tone } from "@/components/school-hr/ui";

/**
 * Role-based perspectives: the same school, seen by Staff, Line Manager,
 * Headteacher and Finance / Administration. Tabs follow the WAI-ARIA tabs
 * pattern (arrow keys, Home/End). All content is fictional and illustrative.
 */

const ORDER: RoleId[] = ["staff", "manager", "head", "finance"];
const GREETING: Record<RoleId, string> = { staff: "Sam", manager: "Jordan", head: "Dr Morgan", finance: "Priya" };

const INTRO: Record<RoleId, { focus: string; hands: string }> = {
  staff: { focus: "Submit requests and forms, see balances and follow every status.", hands: "Sends requests to their line manager or headteacher." },
  manager: { focus: "Decide team leave and TOIL, and complete return-to-work reviews.", hands: "Receives from staff · passes approved records on." },
  head: { focus: "Approve additional-hours claims and keep school-level oversight.", hands: "Receives claims · releases approved claims to finance." },
  finance: { focus: "Work from approved, export-ready records for the monthly deadline.", hands: "Receives approved claims · exports in an agreed format." },
};

function List({ title, items }: { title: string; items: { a: string; b: string; tone: Tone; pill: string }[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-white/[0.08]">
      <p className="border-b border-white/[0.06] bg-white/[0.02] px-3.5 py-2 text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">{title}</p>
      <ul className="divide-y divide-white/[0.06]">
        {items.map((it) => (
          <li key={it.a} className="flex items-center gap-3 px-3.5 py-2.5">
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px] font-medium text-ink">{it.a}</p>
              <p className="truncate text-[11.5px] text-ink-faint">{it.b}</p>
            </div>
            <StatusPill tone={it.tone}>{it.pill}</StatusPill>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Stat({ k, v, sub }: { k: string; v: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2.5">
      <p className="text-[10.5px] text-ink-faint">{k}</p>
      <p className="mt-0.5 font-display text-lg font-bold text-ink">{v}</p>
      {sub && <p className="text-[10.5px] text-ink-faint">{sub}</p>}
    </div>
  );
}

function Dashboard({ role }: { role: RoleId }) {
  const r = ROLES[role];
  const head = (
    <div className="flex items-center gap-3">
      <Avatar role={role} />
      <div className="min-w-0">
        <p className="truncate font-display text-base font-bold text-ink">Good morning, {GREETING[role]}</p>
        <p className="truncate text-xs text-ink-faint">
          {r.person} · {r.title}
        </p>
      </div>
    </div>
  );
  if (role === "staff")
    return (
      <div className="space-y-4 p-4 sm:p-5">
        {head}
        <div className="grid grid-cols-3 gap-2">
          <Stat k="TOIL" v="6.0 hrs" sub="Available" />
          <Stat k="Open" v="2" sub="Requests" />
          <Stat k="Forms" v="0" sub="To complete" />
        </div>
        <List
          title="My requests"
          items={[
            { a: "Additional hours · Parents’ evening", b: "2.5 hrs · Thu 6 Nov", tone: "wait", pill: "With head" },
            { a: "TOIL · Fri 21 Nov afternoon", b: "3.0 hrs", tone: "wait", pill: "With manager" },
            { a: "Return-to-work form", b: "Mon 3 – Tue 4 Nov", tone: "ok", pill: "Completed" },
          ]}
        />
        <div className="flex flex-wrap gap-2">
          {["New claim", "Request TOIL", "Request leave"].map((a) => (
            <span key={a} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-ink-muted">
              + {a}
            </span>
          ))}
        </div>
      </div>
    );
  if (role === "manager")
    return (
      <div className="space-y-4 p-4 sm:p-5">
        {head}
        <div className="grid grid-cols-3 gap-2">
          <Stat k="To decide" v="3" />
          <Stat k="RTW reviews" v="1" sub="Due today" />
          <Stat k="Team off" v="2" sub="This week" />
        </div>
        <List
          title="Pending team requests"
          items={[
            { a: "Alex Brown · Annual leave", b: "15–17 Dec · 3 days", tone: "wait", pill: "Decide" },
            { a: "Sam Patel · TOIL", b: "Fri 21 Nov · 3.0 hrs", tone: "wait", pill: "Decide" },
            { a: "Riley King · Leave of absence", b: "Wed 26 Nov · 1 day", tone: "wait", pill: "Decide" },
          ]}
        />
        <List title="Return-to-work tasks" items={[{ a: "Sam Patel · review", b: "Form submitted today", tone: "info", pill: "Review" }]} />
      </div>
    );
  if (role === "head")
    return (
      <div className="space-y-4 p-4 sm:p-5">
        {head}
        <div className="grid grid-cols-3 gap-2">
          <Stat k="Claims to approve" v="3" />
          <Stat k="Approved" v="12" sub="This month" />
          <Stat k="Cut-off" v="20 Nov" sub="Example" />
        </div>
        <List
          title="Additional-hours approval queue"
          items={[
            { a: "Sam Patel · Parents’ evening", b: "2.5 hrs · Thu 6 Nov", tone: "info", pill: "New" },
            { a: "Alex Brown · After-school club", b: "1.0 hr · Tue 4 Nov", tone: "wait", pill: "Pending" },
            { a: "Chris Taylor · Residential trip", b: "3.0 hrs · Fri 31 Oct", tone: "wait", pill: "Pending" },
          ]}
        />
        <p className="text-[11.5px] text-ink-faint">Oversight views are scoped to what the headteacher role is allowed to see.</p>
      </div>
    );
  return (
    <div className="space-y-4 p-4 sm:p-5">
      {head}
      <div className="grid grid-cols-3 gap-2">
        <Stat k="Ready to export" v="12" sub="Approved claims" />
        <Stat k="Awaiting approval" v="3" />
        <Stat k="Batch" v="November" sub="Example" />
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/[0.08]">
        <table className="w-full min-w-[420px] text-left text-[12.5px]">
          <caption className="sr-only">Sample approved claims ready for export</caption>
          <thead className="bg-white/[0.02] text-[10.5px] uppercase tracking-[0.1em] text-ink-faint">
            <tr>
              <th scope="col" className="px-3 py-2 font-medium">Staff ref</th>
              <th scope="col" className="px-3 py-2 font-medium">Activity</th>
              <th scope="col" className="px-3 py-2 font-medium">Hours</th>
              <th scope="col" className="px-3 py-2 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.06]">
            {[
              ["ST-0412", "Parents’ evening", "2.5"],
              ["ST-0388", "After-school club", "1.0"],
              ["ST-0275", "Residential trip", "3.0"],
            ].map(([a, b, c]) => (
              <tr key={a}>
                <td className="mono px-3 py-2 text-ink-muted">{a}</td>
                <td className="px-3 py-2 text-ink">{b}</td>
                <td className="px-3 py-2 text-ink">{c}</td>
                <td className="px-3 py-2">
                  <StatusPill tone="ok">Approved</StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-[11.5px] text-ink-faint">Exports use a format agreed with the school. CatchZone School HR does not run payroll.</p>
    </div>
  );
}

export function RolePerspectives() {
  const [role, setRole] = useState<RoleId>("staff");
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKey(e: React.KeyboardEvent, i: number) {
    let next = -1;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = (i + 1) % ORDER.length;
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = (i - 1 + ORDER.length) % ORDER.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = ORDER.length - 1;
    if (next < 0) return;
    e.preventDefault();
    setRole(ORDER[next]!);
    tabs.current[next]?.focus();
  }

  const idx = ORDER.indexOf(role);

  return (
    <div>
      {/* Relationship strip: who hands work to whom */}
      <div
        role="tablist"
        aria-label="Choose a role"
        className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-0 sm:rounded-2xl sm:border sm:border-white/10 sm:bg-white/[0.02] sm:p-1.5"
      >
        {ORDER.map((id, i) => {
          const active = id === role;
          return (
            <button
              key={id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              role="tab"
              id={`role-tab-${id}`}
              aria-selected={active}
              aria-controls="role-panel"
              tabIndex={active ? 0 : -1}
              onClick={() => setRole(id)}
              onKeyDown={(e) => onKey(e, i)}
              className={`relative flex min-h-[56px] items-center gap-2.5 rounded-xl border px-3 py-2 text-left transition-colors sm:border-transparent ${
                active ? "border-white/15 bg-surface-raised shadow-[0_10px_30px_-20px_rgba(0,0,0,0.6)] sm:border-white/10" : "border-white/10 hover:bg-white/[0.03]"
              }`}
            >
              <Avatar role={id} size="sm" />
              <span className="min-w-0">
                <span className={`block truncate text-sm font-semibold ${active ? "text-ink" : "text-ink-muted"}`}>{ROLES[id].label}</span>
                <span className={`hidden text-[11px] sm:block ${active ? ROLE_TONE[id].text : "text-ink-faint"}`}>Step {i + 1} of the chain</span>
              </span>
              {i < ORDER.length - 1 && (
                <span className="pointer-events-none absolute -right-2 top-1/2 z-10 hidden -translate-y-1/2 text-ink-faint sm:block" aria-hidden="true">
                  ›
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Flow indicator */}
      <div className="mt-3 hidden h-1 overflow-hidden rounded-full bg-white/[0.05] sm:block" aria-hidden="true">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-accent-cyan to-accent-iris"
          animate={{ width: `${((idx + 1) / ORDER.length) * 100}%` }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div
        id="role-panel"
        role="tabpanel"
        aria-labelledby={`role-tab-${role}`}
        tabIndex={0}
        className="mt-6 grid grid-cols-[minmax(0,1fr)] gap-6 focus:outline-none lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-10"
      >
        <div className="lg:pt-4">
          <p className={`mono text-[11px] uppercase tracking-[0.2em] ${ROLE_TONE[role].text}`}>{ROLES[role].label}</p>
          <p className="mt-3 font-display text-2xl font-bold leading-snug text-ink">{INTRO[role].focus}</p>
          <p className="mt-4 flex items-start gap-2 text-sm text-ink-muted">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent-cyan" aria-hidden="true" />
            {INTRO[role].hands}
          </p>
        </div>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={role}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <AppWindow title="Dashboard" role={role}>
              <Dashboard role={role} />
            </AppWindow>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
