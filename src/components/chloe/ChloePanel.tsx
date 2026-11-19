"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { ChloeAvatar } from "@/components/chloe/ChloeAvatar";
import { BookCallLink } from "@/components/booking/BookCallLink";
import { isBookable } from "@/data/booking";
import {
  BOOKING_UNAVAILABLE,
  BUDGET_OPTIONS,
  CHLOE_NODES,
  LEAD_TOPIC_LABELS,
  TIMESCALE_OPTIONS,
  actionEcho,
  matchQuestion,
  type ChloeAction,
  type ChloeNodeId,
  type LeadTopic,
} from "@/data/chloe";

interface Message {
  id: number;
  from: "chloe" | "visitor";
  paras: string[];
}

interface Snapshot {
  messages: Message[];
  node: ChloeNodeId | null;
  lead: LeadTopic | null;
}

const SUCCESS_MESSAGE = "Thank you! We've received your enquiry. Someone from CatchZone will be in touch.";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[+()\d\s.-]{6,40}$/;

let messageId = 0;
const chloeSays = (paras: string[]): Message => ({ id: ++messageId, from: "chloe", paras });
const visitorSays = (text: string): Message => ({ id: ++messageId, from: "visitor", paras: [text] });

/** Actions whose booking event isn't configured are removed — no dead buttons. */
function availableActions(node: ChloeNodeId): ChloeAction[] {
  return CHLOE_NODES[node].actions.filter((a) => a.kind !== "book" || isBookable(a.event));
}

function nodeSays(node: ChloeNodeId): string[] {
  if (node === "book" && !availableActions("book").some((a) => a.kind === "book")) return [BOOKING_UNAVAILABLE];
  return CHLOE_NODES[node].say;
}

function newSubmissionId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const chipClass =
  "inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-white/15 px-3.5 py-2 text-left text-[13px] font-medium leading-snug text-ink transition-colors hover:border-accent-cyan/60 hover:text-accent-cyan sm:min-h-[36px]";
const fieldClass =
  "mt-1 w-full rounded-lg border border-line bg-surface px-3 py-2 text-base text-ink outline-none transition-colors focus:border-accent-cyan focus-visible:ring-2 focus-visible:ring-accent-cyan/30 sm:text-sm";
const labelClass = "mono text-[11px] uppercase tracking-wider text-ink-faint";

export function ChloePanel({
  open,
  onMinimise,
  onClose,
}: {
  open: boolean;
  onMinimise: () => void;
  onClose: () => void;
}) {
  const pathname = usePathname();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const focusTarget = useRef<"actions" | "lead" | "input" | null>(null);

  const [messages, setMessages] = useState<Message[]>(() => [chloeSays(CHLOE_NODES.start.say)]);
  const [node, setNode] = useState<ChloeNodeId | null>("start");
  const [lead, setLead] = useState<LeadTopic | null>(null);
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [question, setQuestion] = useState("");

  // ---- Positioning: keep the panel above the on-screen keyboard on phones. ----
  useEffect(() => {
    if (!open) return;
    const vv = window.visualViewport;
    const panel = panelRef.current;
    if (!vv || !panel) return;
    const update = () => {
      if (window.innerWidth >= 640) {
        panel.style.removeProperty("--chloe-kb");
        panel.style.removeProperty("--chloe-vh");
        return;
      }
      const keyboard = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      panel.style.setProperty("--chloe-kb", `${keyboard}px`);
      panel.style.setProperty("--chloe-vh", `${vv.height}px`);
    };
    update();
    vv.addEventListener("resize", update);
    vv.addEventListener("scroll", update);
    return () => {
      vv.removeEventListener("resize", update);
      vv.removeEventListener("scroll", update);
    };
  }, [open]);

  // ---- Focus: into the panel on open (it is visible in this same commit). ----
  useLayoutEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const first = panel?.querySelector<HTMLElement>("[data-chloe-action], [data-chloe-first]");
    (first ?? panel)?.focus();
  }, [open]);

  // ---- Escape minimises. ----
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    function onKey(e: KeyboardEvent) {
      const active = document.activeElement;
      // Focus inside the panel, or lost to <body> (e.g. after clicking panel text).
      if (e.key === "Escape" && (panel?.contains(active) || active === document.body || active === null)) {
        e.stopPropagation();
        onMinimise();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onMinimise]);

  // ---- After each step: scroll to the newest message and move focus sensibly. ----
  useLayoutEffect(() => {
    const log = logRef.current;
    if (!log) return;
    const latest = log.querySelector<HTMLElement>("[data-chloe-latest]");
    if (latest) log.scrollTop = Math.max(0, latest.offsetTop - 12);
    const target = focusTarget.current;
    focusTarget.current = null;
    if (!target || !open) return;
    if (target === "lead") log.querySelector<HTMLElement>("#chloe-name")?.focus();
    else if (target === "actions") (log.querySelector<HTMLElement>("[data-chloe-action]") ?? panelRef.current)?.focus();
  }, [messages, lead, open]);

  const snapshot = useCallback((): Snapshot => ({ messages, node, lead }), [messages, node, lead]);

  function goToNode(next: ChloeNodeId, echo?: string) {
    setHistory((h) => [...h, snapshot()]);
    setMessages((m) => [...m, ...(echo ? [visitorSays(echo)] : []), chloeSays(nodeSays(next))]);
    setNode(next);
    setLead(null);
    focusTarget.current = "actions";
  }

  function startLead(topic: LeadTopic, echo: string) {
    setHistory((h) => [...h, snapshot()]);
    setMessages((m) => [
      ...m,
      visitorSays(echo),
      chloeSays([
        `Of course — a few quick details and someone from CatchZone will be in touch about ${
          topic === "general" || topic === "call" ? "your enquiry" : LEAD_TOPIC_LABELS[topic]
        }.`,
      ]),
    ]);
    setNode(null);
    setLead(topic);
    focusTarget.current = "lead";
  }

  function back() {
    const previous = history[history.length - 1];
    if (!previous) return;
    setHistory((h) => h.slice(0, -1));
    setMessages(previous.messages);
    setNode(previous.node);
    setLead(previous.lead);
    focusTarget.current = previous.lead ? "lead" : "actions";
  }

  function startOver() {
    setHistory([]);
    setMessages([chloeSays(CHLOE_NODES.start.say)]);
    setNode("start");
    setLead(null);
    focusTarget.current = "actions";
  }

  function ask(e: React.FormEvent) {
    e.preventDefault();
    const text = question.trim().slice(0, 300);
    if (!text) return;
    setQuestion("");
    goToNode(matchQuestion(text), text);
  }

  const onPhone = () => typeof window !== "undefined" && window.innerWidth < 640;

  function renderAction(action: ChloeAction) {
    const key = `${action.kind}-${action.label}`;
    switch (action.kind) {
      case "go":
        return (
          <button key={key} type="button" data-chloe-action className={chipClass} onClick={() => goToNode(action.node, actionEcho(action))}>
            {action.label}
          </button>
        );
      case "lead":
        return (
          <button key={key} type="button" data-chloe-action className={chipClass} onClick={() => startLead(action.topic, actionEcho(action))}>
            {action.label}
          </button>
        );
      case "link":
        return (
          <Link
            key={key}
            href={action.href}
            data-chloe-action
            className={chipClass}
            onClick={() => {
              // On phones the panel covers the page, so step aside after navigating.
              if (onPhone()) onMinimise();
            }}
          >
            {action.label}
            <span aria-hidden="true">→</span>
          </Link>
        );
      case "book":
        return (
          <BookCallLink key={key} event={action.event} className={`${chipClass} border-accent-cyan/35`} onOpen={onMinimise}>
            {action.label}
            <span className="sr-only"> (opens booking calendar)</span>
          </BookCallLink>
        );
    }
  }

  const actions = node ? availableActions(node) : [];

  return (
    <div
      ref={panelRef}
      id="chloe-panel"
      role="dialog"
      aria-modal="false"
      aria-labelledby={titleId}
      tabIndex={-1}
      className={`chloe-panel fixed z-[95] ${open ? "flex" : "hidden"} flex-col overflow-hidden rounded-2xl border border-white/10 bg-void/95 shadow-[0_28px_80px_-24px_rgba(0,0,0,0.75)] outline-none backdrop-blur-xl light:shadow-[0_24px_64px_-28px_rgba(14,17,22,0.35)]`}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-line px-4 py-3">
        <ChloeAvatar size={36} />
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="font-display text-[15px] font-bold leading-tight text-ink">
            Chloe
          </h2>
          <p className="text-xs text-ink-muted">CatchZone digital assistant</p>
        </div>
        <button
          type="button"
          onClick={onMinimise}
          aria-label="Minimise Chloe (keeps the conversation)"
          title="Minimise"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-white/5 hover:text-ink"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
            <path d="M3.5 8h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Chloe and end the conversation"
          title="Close"
          className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-white/5 hover:text-ink"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
            <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {/* Conversation */}
      <div ref={logRef} className="relative min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        <div role="log" aria-live="polite" aria-label="Conversation with Chloe" className="space-y-3">
          {messages.map((m, i) => (
            <div
              key={m.id}
              data-chloe-latest={i === messages.length - 1 ? "" : undefined}
              className={m.from === "chloe" ? "flex items-end gap-2 pr-6" : "flex justify-end pl-10"}
            >
              <div
                className={
                  m.from === "chloe"
                    ? "space-y-2 rounded-2xl rounded-bl-md border border-line bg-surface px-3.5 py-2.5 text-[13.5px] leading-relaxed text-ink"
                    : "rounded-2xl rounded-br-md border border-accent-cyan/25 bg-accent-cyan/10 px-3.5 py-2 text-[13.5px] leading-relaxed text-ink"
                }
              >
                {m.from === "chloe" && <span className="sr-only">Chloe: </span>}
                {m.from === "visitor" && <span className="sr-only">You: </span>}
                {m.paras.map((p, j) => (
                  <p key={j}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {actions.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Choose an option" role="group">
            {actions.map(renderAction)}
          </div>
        )}

        {lead && <LeadForm topic={lead} page={pathname} onSent={() => setHistory([])} />}

        {history.length > 0 && (
          <div className="mt-4 flex items-center gap-4 text-xs font-semibold text-ink-muted">
            <button type="button" onClick={back} className="rounded transition-colors hover:text-ink">
              ← Back
            </button>
            <button type="button" onClick={startOver} className="rounded transition-colors hover:text-ink">
              Start over
            </button>
          </div>
        )}
      </div>

      {/* Typed questions — matched against prepared answers, never sent anywhere. */}
      <form onSubmit={ask} className="flex items-center gap-2 border-t border-line px-3 py-3">
        <label htmlFor="chloe-question" className="sr-only">
          Type a question for Chloe
        </label>
        <input
          id="chloe-question"
          data-chloe-first
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={300}
          autoComplete="off"
          enterKeyHint="send"
          placeholder="Type a question…"
          className="min-w-0 flex-1 rounded-full border border-line bg-surface px-4 py-2 text-base text-ink outline-none placeholder:text-ink-faint focus:border-accent-cyan focus-visible:ring-2 focus-visible:ring-accent-cyan/30 sm:text-sm"
        />
        <button
          type="submit"
          aria-label="Ask"
          disabled={!question.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-void transition-colors hover:bg-accent-cyan disabled:opacity-40"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
            <path d="M3 8h9M8.5 4.5 12 8l-3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </form>
    </div>
  );
}

type SendState = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };

/**
 * Short enquiry form inside the conversation. Success is shown only after the
 * server confirms Resend accepted the email; failures offer a retry.
 */
function LeadForm({ topic, page, onSent }: { topic: LeadTopic; page: string; onSent: () => void }) {
  const [fields, setFields] = useState({ name: "", email: "", message: "", phone: "", timescale: "", budget: "" });
  const [moreOpen, setMoreOpen] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [state, setState] = useState<SendState>({ kind: "idle" });
  const submissionId = useRef("");
  const successRef = useRef<HTMLDivElement>(null);
  const formId = useId();

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (state.kind === "sent") successRef.current?.focus();
  }, [state.kind]);

  function validate() {
    const next: Record<string, string> = {};
    if (!fields.name.trim()) next.name = "Please enter your name.";
    if (!fields.email.trim()) next.email = "Please enter your email address.";
    else if (!EMAIL_RE.test(fields.email.trim())) next.email = "Please enter a valid email address.";
    if (!fields.message.trim()) next.message = "Please tell us a little about what you need.";
    if (fields.phone.trim() && !PHONE_RE.test(fields.phone.trim())) next.phone = "Please check the phone number.";
    return next;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (state.kind === "sending") return;
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length) {
      if (found.phone) setMoreOpen(true);
      document.getElementById(`chloe-${Object.keys(found)[0]}`)?.focus();
      return;
    }
    if (!submissionId.current) submissionId.current = newSubmissionId();
    setState({ kind: "sending" });
    try {
      const res = await fetch("/api/chloe/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic,
          name: fields.name.trim(),
          email: fields.email.trim(),
          message: fields.message.trim(),
          phone: fields.phone.trim(),
          timescale: fields.timescale,
          budget: fields.budget,
          page,
          cz_hp: honeypot,
          submissionId: submissionId.current,
        }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; reason?: string } | null;
      if (res.ok && data?.ok === true) {
        setState({ kind: "sent" });
        onSent();
        return;
      }
      setState({
        kind: "error",
        message:
          data?.reason === "rate_limited"
            ? "We’ve received several messages from this connection recently. Please wait a few minutes and try again."
            : data?.reason === "missing_fields" || data?.reason === "invalid_phone"
              ? "Some details didn’t come through correctly. Please check them and try again."
              : "Sorry — your enquiry couldn’t be sent just now, so nothing has been delivered yet. Please try again.",
      });
    } catch {
      setState({
        kind: "error",
        message: "Sorry — your enquiry couldn’t be sent just now, so nothing has been delivered yet. Please try again.",
      });
    }
  }

  if (state.kind === "sent") {
    return (
      <div ref={successRef} tabIndex={-1} className="mt-3 flex items-end gap-2 pr-6 outline-none" role="status">
        <div className="rounded-2xl rounded-bl-md border border-accent-cyan/30 bg-surface px-3.5 py-2.5 text-[13.5px] leading-relaxed text-ink">
          <span className="sr-only">Chloe: </span>
          {SUCCESS_MESSAGE}
        </div>
      </div>
    );
  }

  const mailto = `mailto:info@catchzone.co.uk?subject=${encodeURIComponent(`Enquiry — ${LEAD_TOPIC_LABELS[topic]}`)}&body=${encodeURIComponent(
    `${fields.message}\n\n${fields.name}${fields.phone ? `\n${fields.phone}` : ""}`,
  )}`;

  const errorText = (k: string) =>
    errors[k] ? (
      <p id={`chloe-${k}-error`} className="mt-1 text-xs text-red-400 light:text-red-700">
        {errors[k]}
      </p>
    ) : null;
  const describedBy = (k: string) => (errors[k] ? `chloe-${k}-error` : undefined);

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-labelledby={`${formId}-title`}
      className="mt-3 space-y-3 rounded-2xl border border-line bg-surface-raised p-3.5"
    >
      <p id={`${formId}-title`} className="text-xs font-semibold text-ink">
        Your details <span className="font-normal text-ink-muted">· * required</span>
      </p>

      {/* Honeypot — hidden from people; the name is one autofill never targets. */}
      <div className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="chloe-cz-hp">Leave this field empty</label>
        <input id="chloe-cz-hp" name="cz_hp" tabIndex={-1} autoComplete="off" value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
      </div>

      <div>
        <label htmlFor="chloe-name" className={labelClass}>Name *</label>
        <input id="chloe-name" autoComplete="name" maxLength={120} value={fields.name} onChange={set("name")} aria-invalid={Boolean(errors.name)} aria-describedby={describedBy("name")} className={fieldClass} />
        {errorText("name")}
      </div>
      <div>
        <label htmlFor="chloe-email" className={labelClass}>Email *</label>
        <input id="chloe-email" type="email" inputMode="email" autoComplete="email" maxLength={200} value={fields.email} onChange={set("email")} aria-invalid={Boolean(errors.email)} aria-describedby={describedBy("email")} className={fieldClass} />
        {errorText("email")}
      </div>
      <div>
        <label htmlFor="chloe-message" className={labelClass}>What do you need help with? *</label>
        <textarea id="chloe-message" rows={3} maxLength={3000} value={fields.message} onChange={set("message")} aria-invalid={Boolean(errors.message)} aria-describedby={describedBy("message")} className={`${fieldClass} resize-none`} />
        {errorText("message")}
      </div>

      <button
        type="button"
        aria-expanded={moreOpen}
        aria-controls={`${formId}-more`}
        onClick={() => setMoreOpen((v) => !v)}
        className="text-xs font-semibold text-ink-muted transition-colors hover:text-ink"
      >
        {moreOpen ? "−" : "+"} Phone, timescale or budget <span className="font-normal">(optional)</span>
      </button>
      <div id={`${formId}-more`} hidden={!moreOpen} className="space-y-3">
        <div>
          <label htmlFor="chloe-phone" className={labelClass}>Phone</label>
          <input id="chloe-phone" type="tel" inputMode="tel" autoComplete="tel" maxLength={40} value={fields.phone} onChange={set("phone")} aria-invalid={Boolean(errors.phone)} aria-describedby={describedBy("phone")} className={fieldClass} />
          {errorText("phone")}
        </div>
        <div className="grid gap-3">
          <div>
            <label htmlFor="chloe-timescale" className={labelClass}>Timescale</label>
            <select id="chloe-timescale" value={fields.timescale} onChange={set("timescale")} className={fieldClass}>
              <option value="">—</option>
              {TIMESCALE_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="chloe-budget" className={labelClass}>Budget</label>
            <select id="chloe-budget" value={fields.budget} onChange={set("budget")} className={fieldClass}>
              <option value="">—</option>
              {BUDGET_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <p className="text-[11.5px] leading-relaxed text-ink-muted">
        We’ll use these details only to reply to your enquiry. See our{" "}
        <Link href="/privacy" className="underline underline-offset-2 hover:text-ink">
          privacy policy
        </Link>
        .
      </p>

      {state.kind === "error" && (
        <div role="alert" className="rounded-xl border border-red-400/30 bg-red-400/5 p-3 text-xs leading-relaxed text-ink-muted">
          <p>{state.message}</p>
          <p className="mt-1.5">
            Or email{" "}
            <a href={mailto} className="font-semibold text-ink underline underline-offset-2">
              info@catchzone.co.uk
            </a>
            .
          </p>
        </div>
      )}

      <button
        type="submit"
        disabled={state.kind === "sending"}
        className="w-full rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state.kind === "sending" ? "Sending…" : state.kind === "error" ? "Try again" : "Send enquiry"}
      </button>
    </form>
  );
}
