"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  AppWindow,
  Avatar,
  Field,
  StatusPill,
  ROLES,
  ROLE_TONE,
  btnPrimary,
  btnSecondary,
  type RoleId,
} from "@/components/school-hr/ui";

/**
 * Interactive workflow studio — an illustrative, entirely browser-side preview
 * of how CatchZone School HR workflows are intended to work. All people and
 * values are fictional. Nothing typed or chosen here is sent or stored.
 */

type FlowId = "hours" | "leave" | "toil" | "rtw";

interface Step {
  role: RoleId;
  label: string;
  hint: string;
}

const FLOWS: Record<FlowId, { label: string; blurb: string; steps: Step[] }> = {
  hours: {
    label: "Additional hours",
    blurb: "Claim → headteacher approval → finance-ready record",
    steps: [
      { role: "staff", label: "Staff submits a claim", hint: "Review Sam’s claim — adjust the hours if you like — then select Submit claim." },
      { role: "staff", label: "Claim is waiting", hint: "The claim is with the headteacher. Switch to the headteacher’s view." },
      { role: "head", label: "Headteacher approves", hint: "Review the claim in the approval queue, then approve it." },
      { role: "finance", label: "Finance-ready record", hint: "The approved claim is now an export-ready record for this month." },
    ],
  },
  leave: {
    label: "Leave request",
    blurb: "Request → line-manager approval → updated balance",
    steps: [
      { role: "staff", label: "Staff requests leave", hint: "Choose how many days Alex needs, then submit the request." },
      { role: "manager", label: "Line manager decides", hint: "Check the team calendar, then approve the request." },
      { role: "staff", label: "Balance updated", hint: "The request is approved and Alex’s leave balance has updated." },
    ],
  },
  toil: {
    label: "TOIL",
    blurb: "Request → approval against balance → updated balance",
    steps: [
      { role: "staff", label: "Staff requests TOIL", hint: "Choose how much TOIL Sam wants to use, then submit." },
      { role: "manager", label: "Line manager approves", hint: "The request is within the available balance. Approve it." },
      { role: "staff", label: "Balance updated", hint: "The TOIL balance has been reduced and the history updated." },
    ],
  },
  rtw: {
    label: "Return to work",
    blurb: "Staff form → manager review → secure record",
    steps: [
      { role: "staff", label: "Staff completes the form", hint: "Answer the two questions, confirm, then submit the form." },
      { role: "manager", label: "Manager review", hint: "Record that the conversation took place, then mark the review complete." },
      { role: "manager", label: "Completed restricted record", hint: "The completed record is stored with restricted access and a full audit trail." },
    ],
  },
};

const FLOW_ORDER: FlowId[] = ["hours", "leave", "toil", "rtw"];

const LEAVE_DAYS = ["Mon 15 Dec", "Tue 16 Dec", "Wed 17 Dec", "Thu 18 Dec", "Fri 19 Dec"];
const LEAVE_BALANCE = 14;
const TOIL_BALANCE = 6;

interface FlowState {
  step: number;
  hours: number;
  activity: string;
  days: number;
  toil: number;
  fit: boolean;
  support: "no" | "yes";
  confirmed: boolean;
  talked: boolean;
  supportRecorded: boolean;
  exportOpen: boolean;
  /** Leave / TOIL: the line manager declined the request. */
  declined: boolean;
  /** Additional hours: the headteacher returned the claim with a comment. */
  returned: boolean;
}

const INITIAL: FlowState = {
  step: 0,
  hours: 2.5,
  activity: "Parents’ evening",
  days: 3,
  toil: 3,
  fit: true,
  support: "no",
  confirmed: false,
  talked: false,
  supportRecorded: false,
  exportOpen: false,
  declined: false,
  returned: false,
};

/** Outcome-specific labels for the final step when a request is declined. */
const DECLINED_STEP: Record<"leave" | "toil", Step> = {
  leave: { role: "staff", label: "Request declined", hint: "The line manager declined the request with a reason. Alex’s balance is unchanged." },
  toil: { role: "staff", label: "Request declined", hint: "The line manager declined the request with a reason. Sam’s TOIL balance is unchanged." },
};

function fmtHours(h: number) {
  return `${h.toFixed(1)} ${h === 1 ? "hr" : "hrs"}`;
}

function Stepper({
  label,
  value,
  onChange,
  min,
  max,
  step,
  format,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-2.5">
      <p className="text-[10.5px] uppercase tracking-[0.12em] text-ink-faint" id={`stp-${label}`}>
        {label}
      </p>
      <div className="mt-1 flex items-center gap-2" role="group" aria-labelledby={`stp-${label}`}>
        <button
          type="button"
          onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))}
          disabled={value <= min}
          aria-label={`Decrease ${label.toLowerCase()}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-ink transition-colors hover:border-accent-cyan/60 disabled:opacity-40"
        >
          −
        </button>
        <output className="min-w-[4.5rem] text-center font-display text-lg font-bold text-ink" aria-live="polite">
          {format(value)}
        </output>
        <button
          type="button"
          onClick={() => onChange(Math.min(max, +(value + step).toFixed(2)))}
          disabled={value >= max}
          aria-label={`Increase ${label.toLowerCase()}`}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-ink transition-colors hover:border-accent-cyan/60 disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}

function Choice<T extends string>({
  legend,
  value,
  options,
  onChange,
}: {
  legend: string;
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-2.5">
      <legend className="sr-only">{legend}</legend>
      <p className="text-[10.5px] uppercase tracking-[0.12em] text-ink-faint" aria-hidden="true">
        {legend}
      </p>
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map(([v, l]) => (
          <button
            key={v}
            type="button"
            aria-pressed={value === v}
            onClick={() => onChange(v)}
            className={`min-h-[36px] rounded-full border px-3 text-[13px] transition-colors ${
              value === v
                ? "border-accent-cyan/50 bg-accent-cyan/10 font-semibold text-ink"
                : "border-white/10 text-ink-muted hover:border-white/25 hover:text-ink"
            }`}
          >
            {l}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Timeline({ items }: { items: { label: string; meta: string; state: "done" | "now" | "todo" }[] }) {
  return (
    <ol className="space-y-0">
      {items.map((it, i) => (
        <li key={it.label} className="relative flex gap-3 pb-4 last:pb-0">
          {i < items.length - 1 && (
            <span className="absolute left-[9px] top-5 h-[calc(100%-12px)] w-px bg-white/10" aria-hidden="true" />
          )}
          <span
            className={`relative mt-0.5 flex h-[19px] w-[19px] shrink-0 items-center justify-center rounded-full border text-[10px] ${
              it.state === "done"
                ? "border-emerald-400/50 bg-emerald-400/15 text-emerald-300 light:text-emerald-700"
                : it.state === "now"
                  ? "border-amber-400/50 bg-amber-400/10 text-amber-300 light:text-amber-700"
                  : "border-white/15 text-ink-faint"
            }`}
            aria-hidden="true"
          >
            {it.state === "done" ? "✓" : it.state === "now" ? "•" : ""}
          </span>
          <div>
            <p className={`text-sm ${it.state === "todo" ? "text-ink-faint" : "text-ink"}`}>{it.label}</p>
            <p className="text-xs text-ink-faint">{it.meta}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

function Toast({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 rounded-xl border border-emerald-400/25 bg-emerald-400/[0.07] px-3.5 py-2.5 text-sm text-ink">
      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20 text-[11px] text-emerald-300 light:text-emerald-700" aria-hidden="true">
        ✓
      </span>
      {children}
    </div>
  );
}

export function WorkflowStudio() {
  const [flow, setFlow] = useState<FlowId>("hours");
  const [s, setS] = useState<FlowState>(INITIAL);
  const [announce, setAnnounce] = useState("");
  const screenRef = useRef<HTMLDivElement>(null);
  const firstRender = useRef(true);

  const base = FLOWS[flow];
  const steps =
    s.declined && (flow === "leave" || flow === "toil")
      ? [...base.steps.slice(0, -1), DECLINED_STEP[flow]]
      : flow === "hours" && s.returned && s.step === 0
        ? [
            { ...base.steps[0]!, label: "Claim returned to staff", hint: "The headteacher returned the claim with a comment. Adjust it, then resubmit." },
            ...base.steps.slice(1),
          ]
        : base.steps;
  const def = { ...base, steps };
  const step = def.steps[s.step] ?? def.steps[0]!;
  const done = s.step === def.steps.length - 1;

  const patch = (p: Partial<FlowState>) => setS((prev) => ({ ...prev, ...p }));
  const go = (next: number, message: string) => {
    setS((prev) => ({ ...prev, step: next }));
    setAnnounce(message);
  };

  // Move focus to the updated screen after each action (not on first load).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const t = window.setTimeout(() => screenRef.current?.focus({ preventScroll: true }), 260);
    return () => window.clearTimeout(t);
  }, [s.step, flow]);

  function selectFlow(id: FlowId) {
    setFlow(id);
    setS(INITIAL);
    setAnnounce(`${FLOWS[id].label} workflow selected. ${FLOWS[id].steps[0]!.hint}`);
  }

  function restart() {
    setS(INITIAL);
    setAnnounce(`${def.label} workflow restarted.`);
  }

  const person =
    flow === "leave" ? { name: "Alex Brown", title: "Office Administrator" } : { name: ROLES.staff.person, title: ROLES.staff.title };

  /* --------------------------- screens --------------------------- */

  function Screen() {
    // ---------- Additional hours ----------
    if (flow === "hours") {
      if (s.step === 0)
        return (
          <div className="space-y-3 p-4 sm:p-5">
            <Header title="New additional-hours claim" sub={`${person.name} · ${person.title}`} role="staff" />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Date">Thu 6 November</Field>
              <Field label="Approver">Headteacher (set by school)</Field>
            </div>
            <Choice
              legend="Activity"
              value={s.activity}
              options={[
                ["Parents’ evening", "Parents’ evening"],
                ["After-school club", "After-school club"],
                ["Residential trip", "Residential trip"],
              ]}
              onChange={(v) => patch({ activity: v })}
            />
            <Stepper label="Hours" value={s.hours} onChange={(v) => patch({ hours: v })} min={0.5} max={8} step={0.5} format={fmtHours} />
            {s.returned && (
              <Returned by="Dr Erin Morgan">Please confirm the finish time — I have 18:30 in the diary.</Returned>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-xs text-ink-faint">Submitted claims are routed to the headteacher.</p>
              <button
                type="button"
                className={btnPrimary}
                onClick={() => go(1, `Claim for ${fmtHours(s.hours)} ${s.returned ? "resubmitted" : "submitted"}. Status: awaiting headteacher approval.`)}
              >
                {s.returned ? "Resubmit claim" : "Submit claim"}
              </button>
            </div>
          </div>
        );
      if (s.step === 1)
        return (
          <div className="space-y-4 p-4 sm:p-5">
            <Header title="My claims" sub={`${person.name} · ${person.title}`} role="staff" />
            <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    {s.activity} · {fmtHours(s.hours)}
                  </p>
                  <p className="text-xs text-ink-faint">Thu 6 November · submitted just now</p>
                </div>
                <StatusPill tone="wait">Awaiting headteacher</StatusPill>
              </div>
            </div>
            <Timeline
              items={[
                { label: "Submitted by Sam Patel", meta: "Just now", state: "done" },
                { label: "Headteacher approval", meta: "Dr Erin Morgan has been notified", state: "now" },
                { label: "Finance-ready record", meta: "After approval", state: "todo" },
              ]}
            />
            <div className="flex justify-end">
              <button type="button" className={btnPrimary} onClick={() => go(2, "Now viewing as the headteacher. The claim is in the approval queue.")}>
                Switch to headteacher view <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        );
      if (s.step === 2)
        return (
          <div className="space-y-4 p-4 sm:p-5">
            <Header title="Approval queue · Additional hours" sub="Dr Erin Morgan · Headteacher" role="head" />
            <ul className="divide-y divide-white/[0.06] overflow-hidden rounded-xl border border-white/[0.08]">
              <li className="flex items-center gap-3 bg-accent-cyan/[0.06] px-3.5 py-3">
                <Avatar role="staff" size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">
                    Sam Patel · {s.activity}
                  </p>
                  <p className="text-xs text-ink-faint">Thu 6 Nov · {fmtHours(s.hours)}</p>
                </div>
                <StatusPill tone="info">New</StatusPill>
              </li>
              {[
                ["Alex Brown · After-school club", "Tue 4 Nov · 1.0 hr"],
                ["Chris Taylor · Residential trip", "Fri 31 Oct · 3.0 hrs"],
              ].map(([a, b]) => (
                <li key={a} className="flex items-center gap-3 px-3.5 py-3 opacity-70">
                  <span className="h-6 w-6 rounded-full bg-white/[0.08]" aria-hidden="true" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink">{a}</p>
                    <p className="text-xs text-ink-faint">{b}</p>
                  </div>
                  <StatusPill tone="wait">Pending</StatusPill>
                </li>
              ))}
            </ul>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Claim">
                {s.activity} · {fmtHours(s.hours)}
              </Field>
              <Field label="Month cut-off">20 November (example)</Field>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className={btnSecondary}
                onClick={() => {
                  setS((prev) => ({ ...prev, step: 0, returned: true }));
                  setAnnounce("Claim returned to Sam with a comment. Now viewing as staff: adjust the claim and resubmit.");
                }}
              >
                Return with comment
              </button>
              <button
                type="button"
                className={btnPrimary}
                onClick={() => go(3, "Claim approved. Status changed to approved, and a finance-ready record was created.")}
              >
                Approve claim
              </button>
            </div>
          </div>
        );
      return (
        <div className="space-y-4 p-4 sm:p-5">
          <Header title="Finance · Approved claims" sub="Priya Shah · School Business Manager" role="finance" />
          <Toast>Approved by Dr Erin Morgan · Sam has been notified</Toast>
          <div className="overflow-hidden rounded-xl border border-white/[0.08]">
            <table className="w-full text-left text-[13px]">
              <caption className="sr-only">Sample finance-ready record</caption>
              <tbody className="divide-y divide-white/[0.06]">
                {[
                  ["Staff", "Sam Patel (ref. ST-0412)"],
                  ["Claim", `${s.activity} · Thu 6 Nov`],
                  ["Hours", fmtHours(s.hours)],
                  ["Approved by", "Dr Erin Morgan · today"],
                  ["Payroll month", "November (example)"],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <th scope="row" className="w-[38%] px-3.5 py-2 font-normal text-ink-faint">
                      {k}
                    </th>
                    <td className="px-3.5 py-2 text-ink">{v}</td>
                  </tr>
                ))}
                <tr>
                  <th scope="row" className="px-3.5 py-2 font-normal text-ink-faint">
                    Status
                  </th>
                  <td className="px-3.5 py-2">
                    <StatusPill tone="ok">Ready for export</StatusPill>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div>
            <button
              type="button"
              className="text-sm font-semibold text-accent-cyan hover:underline"
              aria-expanded={s.exportOpen}
              onClick={() => patch({ exportOpen: !s.exportOpen })}
            >
              {s.exportOpen ? "Hide" : "Show"} export preview
            </button>
            {s.exportOpen && (
              <pre className="mt-2 overflow-x-auto rounded-xl border border-white/[0.08] bg-void/60 p-3 text-[11.5px] leading-relaxed text-ink-muted light:bg-void">
                {`staff_ref,date,activity,hours,approved_by\nST-0412,2026-11-06,${s.activity.replace("’", "'")},${s.hours.toFixed(1)},E Morgan`}
              </pre>
            )}
            <p className="mt-2 text-xs text-ink-faint">Export format is agreed with each school. Not a payroll calculation.</p>
          </div>
        </div>
      );
    }

    // ---------- Leave ----------
    if (flow === "leave") {
      const remaining = LEAVE_BALANCE - s.days;
      const range = s.days === 1 ? LEAVE_DAYS[0] : `${LEAVE_DAYS[0]} – ${LEAVE_DAYS[s.days - 1]}`;
      if (s.step === 0)
        return (
          <div className="space-y-3 p-4 sm:p-5">
            <Header title="New leave request" sub={`${person.name} · ${person.title}`} role="staff" />
            <div className="grid grid-cols-2 gap-3">
              <Field label="Annual leave left">{LEAVE_BALANCE.toFixed(1)} days</Field>
              <Field label="After this request">
                <span className={remaining < 0 ? "text-rose-300 light:text-rose-700" : ""}>{remaining.toFixed(1)} days</span>
              </Field>
            </div>
            <Stepper label="Days" value={s.days} onChange={(v) => patch({ days: v })} min={1} max={5} step={1} format={(v) => `${v} ${v === 1 ? "day" : "days"}`} />
            <Field label="Dates">{range}</Field>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-xs text-ink-faint">Leave types and entitlements follow the school’s policy.</p>
              <button type="button" className={btnPrimary} onClick={() => go(1, `Leave request for ${s.days} days submitted to the line manager.`)}>
                Submit request
              </button>
            </div>
          </div>
        );
      if (s.step === 1)
        return (
          <div className="space-y-4 p-4 sm:p-5">
            <Header title="Team requests" sub="Jordan Reid · Line Manager" role="manager" />
            <div className="rounded-xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">Alex Brown · Annual leave</p>
                  <p className="text-xs text-ink-faint">
                    {range} · {s.days} {s.days === 1 ? "day" : "days"} · balance after: {remaining.toFixed(1)} days
                  </p>
                </div>
                <StatusPill tone="wait">Needs decision</StatusPill>
              </div>
            </div>
            <div>
              <p className="text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">Team calendar · week of 15 Dec</p>
              <div className="mt-2 grid grid-cols-[88px_repeat(5,1fr)] gap-1 text-center text-[10.5px]">
                <span />
                {["M", "T", "W", "T", "F"].map((d, i) => (
                  <span key={i} className="text-ink-faint">
                    {d}
                  </span>
                ))}
                {[
                  ["Alex B.", (i: number) => i < s.days, "bg-accent-cyan/40"],
                  ["Morgan L.", (i: number) => i === 2, "bg-white/20"],
                  ["Riley K.", () => false, "bg-white/20"],
                ].map(([n, off, c]) => (
                  <Row key={n as string} name={n as string} off={off as (i: number) => boolean} cls={c as string} />
                ))}
              </div>
              <p className="mt-2 text-xs text-ink-faint">Office cover: at least one person in each day ✓</p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className={btnSecondary}
                onClick={() => {
                  setS((prev) => ({ ...prev, step: 2, declined: true }));
                  setAnnounce("Leave request declined with a reason. Alex’s balance is unchanged.");
                }}
              >
                Decline
              </button>
              <button type="button" className={btnPrimary} onClick={() => go(2, `Leave approved. Alex’s balance is now ${remaining.toFixed(1)} days.`)}>
                Approve leave
              </button>
            </div>
          </div>
        );
      if (s.declined)
        return (
          <div className="space-y-4 p-4 sm:p-5">
            <Header title="My leave" sub={`${person.name} · ${person.title}`} role="staff" />
            <Returned by="Jordan Reid" tone="declined">
              Office cover is short that week — could you look at the following week instead?
            </Returned>
            <Balance label="Annual leave remaining" from={LEAVE_BALANCE} to={LEAVE_BALANCE} unit="days" />
            <Timeline
              items={[
                { label: "Requested", meta: `${s.days} ${s.days === 1 ? "day" : "days"} · ${range}`, state: "done" },
                { label: "Declined by line manager", meta: "Reason shared with Alex", state: "done" },
                { label: "Balance unchanged", meta: `${LEAVE_BALANCE.toFixed(1)} days`, state: "done" },
              ]}
            />
          </div>
        );
      return (
        <div className="space-y-4 p-4 sm:p-5">
          <Header title="My leave" sub={`${person.name} · ${person.title}`} role="staff" />
          <Toast>Approved by Jordan Reid · {range}</Toast>
          <Balance label="Annual leave remaining" from={LEAVE_BALANCE} to={remaining} unit="days" />
          <Timeline
            items={[
              { label: "Requested", meta: `${s.days} ${s.days === 1 ? "day" : "days"}`, state: "done" },
              { label: "Approved by line manager", meta: "Just now", state: "done" },
              { label: "Balance updated", meta: `${LEAVE_BALANCE.toFixed(1)} → ${remaining.toFixed(1)} days`, state: "done" },
            ]}
          />
        </div>
      );
    }

    // ---------- TOIL ----------
    if (flow === "toil") {
      const after = TOIL_BALANCE - s.toil;
      if (s.step === 0)
        return (
          <div className="space-y-3 p-4 sm:p-5">
            <Header title="Use TOIL" sub={`${person.name} · ${person.title}`} role="staff" />
            <div className="overflow-hidden rounded-xl border border-white/[0.08]">
              <p className="border-b border-white/[0.06] px-3.5 py-2 text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">
                Approved TOIL
              </p>
              {[
                ["Residential trip (weekend)", "+4.0 hrs"],
                ["Open evening", "+2.0 hrs"],
              ].map(([a, b]) => (
                <div key={a} className="flex justify-between px-3.5 py-2 text-[13px]">
                  <span className="text-ink-muted">{a}</span>
                  <span className="text-ink">{b}</span>
                </div>
              ))}
              <div className="flex justify-between border-t border-white/[0.06] px-3.5 py-2 text-[13px] font-semibold">
                <span className="text-ink">Available</span>
                <span className="text-ink">{fmtHours(TOIL_BALANCE)}</span>
              </div>
            </div>
            <Stepper label="TOIL to use" value={s.toil} onChange={(v) => patch({ toil: v })} min={0.5} max={6} step={0.5} format={fmtHours} />
            <Field label="When">Fri 21 November · afternoon</Field>
            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-xs text-ink-faint">How TOIL is earned and used is set by each school’s policy.</p>
              <button type="button" className={btnPrimary} onClick={() => go(1, `TOIL request for ${fmtHours(s.toil)} submitted to the line manager.`)}>
                Submit request
              </button>
            </div>
          </div>
        );
      if (s.step === 1)
        return (
          <div className="space-y-4 p-4 sm:p-5">
            <Header title="Team requests · TOIL" sub="Jordan Reid · Line Manager" role="manager" />
            <div className="rounded-xl border border-accent-cyan/25 bg-accent-cyan/[0.05] p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">Sam Patel · {fmtHours(s.toil)} TOIL</p>
                  <p className="text-xs text-ink-faint">Fri 21 November · afternoon</p>
                </div>
                <StatusPill tone="wait">Needs decision</StatusPill>
              </div>
            </div>
            <div className="space-y-2">
              <CheckRow ok>Within available balance ({fmtHours(TOIL_BALANCE)})</CheckRow>
              <CheckRow ok>Cover arranged for the afternoon (example)</CheckRow>
              <p className="pl-7 text-xs text-ink-faint">Checks follow your school’s own TOIL rules.</p>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className={btnSecondary}
                onClick={() => {
                  setS((prev) => ({ ...prev, step: 2, declined: true }));
                  setAnnounce("TOIL request declined with a reason. Sam’s balance is unchanged.");
                }}
              >
                Decline
              </button>
              <button type="button" className={btnPrimary} onClick={() => go(2, `TOIL approved. Sam’s balance is now ${fmtHours(after)}.`)}>
                Approve TOIL
              </button>
            </div>
          </div>
        );
      if (s.declined)
        return (
          <div className="space-y-4 p-4 sm:p-5">
            <Header title="My TOIL" sub={`${person.name} · ${person.title}`} role="staff" />
            <Returned by="Jordan Reid" tone="declined">
              Friday afternoon has the Year 4 assembly — could you take it the following week?
            </Returned>
            <Balance label="TOIL available" from={TOIL_BALANCE} to={TOIL_BALANCE} unit="hrs" />
            <Timeline
              items={[
                { label: "Requested", meta: fmtHours(s.toil), state: "done" },
                { label: "Declined by line manager", meta: "Reason shared with Sam", state: "done" },
                { label: "Balance unchanged", meta: fmtHours(TOIL_BALANCE), state: "done" },
              ]}
            />
          </div>
        );
      return (
        <div className="space-y-4 p-4 sm:p-5">
          <Header title="My TOIL" sub={`${person.name} · ${person.title}`} role="staff" />
          <Toast>Approved by Jordan Reid · Fri 21 Nov afternoon</Toast>
          <Balance label="TOIL available" from={TOIL_BALANCE} to={after} unit="hrs" />
          <Timeline
            items={[
              { label: "Requested", meta: fmtHours(s.toil), state: "done" },
              { label: "Approved by line manager", meta: "Just now", state: "done" },
              { label: "Balance and history updated", meta: `${fmtHours(TOIL_BALANCE)} → ${fmtHours(after)}`, state: "done" },
            ]}
          />
        </div>
      );
    }

    // ---------- Return to work ----------
    if (s.step === 0)
      return (
        <div className="space-y-3 p-4 sm:p-5">
          <Header title="Return-to-work form" sub={`${person.name} · ${person.title}`} role="staff" />
          <Field label="Absence">Mon 3 – Tue 4 November (2 days)</Field>
          <Choice
            legend="I am ready to return to work"
            value={s.fit ? "yes" : "no"}
            options={[
              ["yes", "Yes"],
              ["no", "I’d like to talk first"],
            ]}
            onChange={(v) => patch({ fit: v === "yes" })}
          />
          <Choice
            legend="Would you like to discuss any support?"
            value={s.support}
            options={[
              ["no", "No, thank you"],
              ["yes", "Yes, with my line manager"],
            ]}
            onChange={(v) => patch({ support: v })}
          />
          <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={s.confirmed}
              onChange={(e) => patch({ confirmed: e.target.checked })}
              className="h-4 w-4 accent-[#14b8a6]"
            />
            I confirm this information is accurate
          </label>
          <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
            <p className="text-xs text-ink-faint">This preview deliberately contains no health information.</p>
            <button
              type="button"
              className={btnPrimary}
              disabled={!s.confirmed}
              onClick={() => go(1, "Return-to-work form submitted. The line manager has a review task.")}
            >
              Submit form
            </button>
          </div>
        </div>
      );
    if (s.step === 1)
      return (
        <div className="space-y-4 p-4 sm:p-5">
          <Header title="Return-to-work review" sub="Jordan Reid · Line Manager" role="manager" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Staff member">Sam Patel</Field>
            <Field label="Form">Submitted today</Field>
            <Field label="Ready to return">{s.fit ? "Yes" : "Would like to talk first"}</Field>
            <Field label="Support discussion">{s.support === "yes" ? "Requested" : "Not requested"}</Field>
          </div>
          <div className="space-y-2">
            <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-2 text-sm text-ink">
              <input type="checkbox" checked={s.talked} onChange={(e) => patch({ talked: e.target.checked })} className="h-4 w-4 accent-[#14b8a6]" />
              Return-to-work conversation held
            </label>
            <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-2 text-sm text-ink">
              <input
                type="checkbox"
                checked={s.supportRecorded}
                onChange={(e) => patch({ supportRecorded: e.target.checked })}
                className="h-4 w-4 accent-[#14b8a6]"
              />
              Any agreed support noted (optional)
            </label>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className={btnPrimary}
              disabled={!s.talked}
              onClick={() => go(2, "Review complete. The record is stored with restricted access.")}
            >
              Mark review complete
            </button>
          </div>
        </div>
      );
    return (
      <div className="space-y-4 p-4 sm:p-5">
        <Header title="Return to work · Sam Patel" sub="Jordan Reid · Line Manager" role="manager" />
        <Toast>Review completed · record stored</Toast>
        <div className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-white/[0.025] p-3.5">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-cyan/10 text-accent-cyan" aria-hidden="true">
            <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="7" width="10" height="7" rx="1.5" />
              <path d="M5.5 7V5a2.5 2.5 0 0 1 5 0v2" />
            </svg>
          </span>
          <div>
            <p className="text-sm font-semibold text-ink">Restricted record</p>
            <p className="text-xs leading-relaxed text-ink-muted">Visible only to Sam Patel, the line manager and authorised HR administrators.</p>
          </div>
          <span className="ml-auto">
            <StatusPill tone="ok">Completed</StatusPill>
          </span>
        </div>
        <div>
          <p className="text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">Audit trail</p>
          <ul className="mt-2 space-y-1.5 text-[13px]">
            {[
              ["09:02", "Form sent automatically after absence"],
              ["09:15", "Submitted by Sam Patel"],
              ["11:40", "Conversation recorded by Jordan Reid"],
              ["11:42", "Review marked complete"],
            ].map(([t, e]) => (
              <li key={t} className="flex gap-3">
                <span className="mono w-11 shrink-0 text-ink-faint">{t}</span>
                <span className="text-ink-muted">{e}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    // Mobile order: choose → next hint → app → progress. Desktop: controls left, app right.
    <div className="grid grid-cols-[minmax(0,1fr)] gap-5 lg:grid-cols-[300px_1fr] lg:grid-rows-[auto_auto_1fr] lg:gap-x-8">
      <div className="lg:col-start-1 lg:row-start-1">
        <p className="mono text-[11px] uppercase tracking-[0.2em] text-ink-faint" id="studio-choose">
          Choose a workflow
        </p>
        <div
          role="group"
          aria-labelledby="studio-choose"
          className="-mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0"
        >
          {FLOW_ORDER.map((id) => {
            const active = id === flow;
            return (
              <button
                key={id}
                type="button"
                aria-pressed={active}
                onClick={() => selectFlow(id)}
                className={`group shrink-0 rounded-2xl border px-4 py-3 text-left transition-all lg:w-full ${
                  active
                    ? "border-accent-cyan/50 bg-accent-cyan/[0.07] shadow-[0_10px_30px_-18px_rgb(var(--accent-cyan-rgb)/0.8)]"
                    : "border-white/10 bg-white/[0.02] hover:border-white/25"
                }`}
              >
                <span className={`block text-sm font-semibold ${active ? "text-ink" : "text-ink-muted group-hover:text-ink"}`}>
                  {FLOWS[id].label}
                </span>
                <span className="mt-0.5 hidden text-xs text-ink-faint lg:block">{FLOWS[id].blurb}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-accent-cyan/20 bg-accent-cyan/[0.04] p-4 lg:col-start-1 lg:row-start-3 lg:self-start">
        <p className="mono text-[11px] uppercase tracking-[0.2em] text-accent-cyan">{done ? "Complete" : "Next"}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-ink">{step.hint}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {done && (
            <button type="button" onClick={restart} className={btnPrimary}>
              Replay
            </button>
          )}
          {done && (
            <button
              type="button"
              onClick={() => selectFlow(FLOW_ORDER[(FLOW_ORDER.indexOf(flow) + 1) % FLOW_ORDER.length]!)}
              className={btnSecondary}
            >
              Next workflow
            </button>
          )}
          {!done && s.step > 0 && (
            <button type="button" onClick={restart} className="min-h-[36px] text-sm font-semibold text-ink-muted underline-offset-4 hover:text-ink hover:underline">
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Application preview */}
      <div className="relative min-w-0 lg:col-start-2 lg:row-span-3 lg:row-start-1">
        <div
          className="pointer-events-none absolute -inset-6 -z-10 rounded-[2.5rem] opacity-80 blur-2xl"
          style={{ background: "radial-gradient(50% 50% at 50% 40%, rgb(var(--accent-cyan-rgb) / 0.12), transparent 70%)" }}
          aria-hidden="true"
        />
        <AppWindow title={def.label} role={step.role}>
          <div ref={screenRef} tabIndex={-1} aria-label={`${def.label}: ${step.label}`} className="min-h-[430px] focus:outline-none">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={`${flow}-${s.step}`}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -18 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
              >
                {Screen()}
              </motion.div>
            </AnimatePresence>
          </div>
        </AppWindow>
        <p className="sr-only" aria-live="polite">
          {announce}
        </p>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 lg:col-start-1 lg:row-start-2">
        <p className="mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Progress</p>
        <ol className="mt-3 space-y-2.5">
          {def.steps.map((st, i) => {
            const state = i < s.step ? "done" : i === s.step ? "now" : "todo";
            return (
              <li key={st.label} className="flex items-center gap-3" aria-current={state === "now" ? "step" : undefined}>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors ${
                    state === "done"
                      ? "bg-emerald-400/15 text-emerald-300 light:text-emerald-700"
                      : state === "now"
                        ? "bg-accent-cyan text-void"
                        : "border border-white/15 text-ink-faint"
                  }`}
                  aria-hidden="true"
                >
                  {state === "done" ? "✓" : i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={`block text-sm ${state === "todo" ? "text-ink-faint" : "text-ink"}`}>{st.label}</span>
                  <span className={`block text-[11px] ${ROLE_TONE[st.role].text}`}>{ROLES[st.role].label}</span>
                </span>
                <span className="sr-only">{state === "done" ? "(completed)" : state === "now" ? "(current step)" : ""}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

/* --------------------------- helpers --------------------------- */

function Header({ title, sub, role }: { title: string; sub: string; role: RoleId }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar role={role} />
      <div className="min-w-0">
        <p className="truncate font-display text-base font-bold text-ink">{title}</p>
        <p className="truncate text-xs text-ink-faint">{sub}</p>
      </div>
    </div>
  );
}

function Row({ name, off, cls }: { name: string; off: (i: number) => boolean; cls: string }) {
  return (
    <>
      <span className="truncate pr-1 text-left text-ink-muted">{name}</span>
      {[0, 1, 2, 3, 4].map((i) => (
        <span key={i} className={`h-5 rounded ${off(i) ? cls : "bg-white/[0.04]"}`} aria-hidden="true" />
      ))}
    </>
  );
}

function Returned({ by, tone = "returned", children }: { by: string; tone?: "returned" | "declined"; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-rose-400/25 bg-rose-400/[0.06] px-3.5 py-2.5">
      <p className="flex items-center gap-2 text-[12px] font-semibold text-rose-300 light:text-rose-700">
        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
        {tone === "declined" ? `Declined by ${by}` : `Returned by ${by}`}
      </p>
      <p className="mt-1 text-[13px] leading-relaxed text-ink">“{children}”</p>
    </div>
  );
}

function CheckRow({ ok, children }: { ok?: boolean; children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-2.5 text-sm text-ink">
      <span
        className={`flex h-[18px] w-[18px] items-center justify-center rounded-full text-[10px] ${
          ok ? "bg-emerald-400/15 text-emerald-300 light:text-emerald-700" : "bg-white/10 text-ink-faint"
        }`}
        aria-hidden="true"
      >
        ✓
      </span>
      {children}
    </p>
  );
}

function Balance({ label, from, to, unit }: { label: string; from: number; to: number; unit: string }) {
  const [value, setValue] = useState(from);
  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      setValue(to);
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 900);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    const delay = window.setTimeout(() => (raf = requestAnimationFrame(tick)), 350);
    return () => {
      window.clearTimeout(delay);
      cancelAnimationFrame(raf);
    };
  }, [from, to]);
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
      <p className="text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">{label}</p>
      <div className="mt-1 flex items-baseline gap-3">
        <p className="font-display text-4xl font-bold text-ink">
          {value.toFixed(1)}
          <span className="ml-1.5 text-base font-semibold text-ink-muted">{unit}</span>
        </p>
        <p className="text-sm text-ink-faint line-through">
          {from.toFixed(1)} {unit}
        </p>
      </div>
      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
        <div className="h-full rounded-full bg-accent-cyan transition-[width] duration-700" style={{ width: `${Math.max(0, (value / from) * 100)}%` }} />
      </div>
    </div>
  );
}
