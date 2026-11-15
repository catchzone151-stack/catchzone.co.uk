"use client";

import { useEffect, useRef, useState } from "react";
import { INTEREST_LABELS, type Interest } from "@/data/schoolHr";
import { HR_INTEREST_EVENT } from "@/components/school-hr/HrInterestLink";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "unconfigured"; mailto: string }
  | { kind: "error"; message: string; mailto: string };

const CONTACT_EMAIL = "info@catchzone.co.uk";
const INTERESTS = Object.keys(INTEREST_LABELS) as Interest[];

function isInterest(v: unknown): v is Interest {
  return typeof v === "string" && (INTERESTS as string[]).includes(v);
}

function buildMailto(fields: Record<string, string>, interest: Interest): string {
  const subject = "CatchZone School HR — demonstration request";
  const body = [
    `Name: ${fields.name ?? ""}`,
    `School / organisation: ${fields.organisation ?? ""}`,
    `Business email: ${fields.email ?? ""}`,
    `Interest: ${INTEREST_LABELS[interest]}`,
    "",
    fields.message ?? "",
  ].join("\n");
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * School HR demonstration request. Never reports success unless the server
 * confirms Resend accepted the email; otherwise offers a pre-filled email.
 * The package/interest is carried in from pricing and module buttons.
 */
export function SchoolHrEnquiryForm() {
  const [interest, setInterest] = useState<Interest>("general");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const inFlight = useRef(false);
  const submissionId = useRef<string | null>(null);

  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get("interest");
    if (isInterest(fromQuery)) setInterest(fromQuery);
    const onInterest = (e: Event) => {
      const next = (e as CustomEvent<Interest>).detail;
      if (isInterest(next)) setInterest(next);
      window.setTimeout(() => formRef.current?.querySelector<HTMLInputElement>("input[name=name]")?.focus({ preventScroll: true }), 450);
    };
    window.addEventListener(HR_INTEREST_EVENT, onInterest);
    return () => window.removeEventListener(HR_INTEREST_EVENT, onInterest);
  }, []);

  useEffect(() => {
    if (status.kind !== "idle" && status.kind !== "sending") statusRef.current?.focus();
  }, [status.kind]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (inFlight.current) return;
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const mailto = buildMailto(data, interest);
    submissionId.current ??=
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    inFlight.current = true;
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/school-hr/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, interest, submissionId: submissionId.current }),
      });
      let json: { ok: boolean; reason?: string };
      try {
        json = (await res.json()) as { ok: boolean; reason?: string };
      } catch {
        json = { ok: false, reason: "send_failed" };
      }
      if (json.ok && res.ok) {
        setStatus({ kind: "sent" });
        submissionId.current = null;
        form.reset();
        return;
      }
      if (json.reason !== "send_failed") submissionId.current = null;
      if (json.reason === "unconfigured") setStatus({ kind: "unconfigured", mailto });
      else if (json.reason === "missing_fields")
        setStatus({ kind: "error", message: "Please add your name, school or organisation, and a valid email address.", mailto });
      else if (json.reason === "rate_limited")
        setStatus({ kind: "error", message: "Too many messages in a short time. Please try again shortly or email us directly.", mailto });
      else setStatus({ kind: "error", message: "Your request couldn’t be sent. Please try again or email us directly.", mailto });
    } catch {
      setStatus({ kind: "error", message: "Your request couldn’t be sent. Please check your connection or email us directly.", mailto });
    } finally {
      inFlight.current = false;
    }
  }

  if (status.kind === "sent") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="rounded-3xl border border-accent-cyan/30 bg-accent-cyan/[0.05] p-6 md:p-8">
        <p className="font-display text-2xl font-bold text-ink">Thank you — request received.</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          We’ll reply to the email address you provided to arrange a demonstration. If it’s urgent, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent-cyan underline decoration-accent-cyan/40 underline-offset-2 hover:decoration-accent-cyan">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="mt-6 min-h-[44px] rounded-full border border-white/15 px-5 text-sm font-semibold text-ink hover:border-white/40"
        >
          Send another request
        </button>
      </div>
    );
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-base text-ink placeholder:text-ink-faint transition-colors focus:border-accent-cyan/60 focus:outline-none";

  return (
    <form
      ref={formRef}
      onSubmit={onSubmit}
      noValidate
      className="rounded-3xl border border-white/10 bg-surface/80 p-5 backdrop-blur sm:p-6 md:p-8"
      aria-describedby="hr-form-note"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-ink">
          Name
          <input name="name" required maxLength={120} autoComplete="name" className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-ink">
          School or organisation
          <input name="organisation" required maxLength={160} autoComplete="organization" className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-ink sm:col-span-2">
          Business email
          <input name="email" type="email" required maxLength={200} autoComplete="email" inputMode="email" className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-ink sm:col-span-2">
          Preferred package or area of interest
          <select
            name="interest-choice"
            value={interest}
            onChange={(e) => isInterest(e.target.value) && setInterest(e.target.value)}
            className={`${inputClass} appearance-none bg-[length:12px] bg-[right_1rem_center] bg-no-repeat pr-10`}
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cpath d='M2.5 4.5 6 8l3.5-3.5' fill='none' stroke='%23888' stroke-width='1.5'/%3E%3C/svg%3E\")",
            }}
          >
            {INTERESTS.map((i) => (
              <option key={i} value={i} className="bg-surface text-ink">
                {INTEREST_LABELS[i]}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-ink sm:col-span-2">
          Brief message <span className="font-normal text-ink-faint">(optional)</span>
          <textarea
            name="message"
            maxLength={3000}
            rows={4}
            placeholder="For example: how your school handles leave and additional-hours claims today."
            className={`${inputClass} resize-y`}
          />
        </label>
        {/* Honeypot — hidden from people and assistive technology. */}
        <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
          <label>
            Leave this field empty
            <input name="cz_hp" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </div>

      {(status.kind === "unconfigured" || status.kind === "error") && (
        <div ref={statusRef} tabIndex={-1} role="alert" className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-ink">
          {status.kind === "unconfigured" ? "Online sending isn’t available right now, so your request has not been sent." : status.message}{" "}
          <a href={status.mailto} className="font-semibold text-accent-cyan hover:underline">
            Email it to {CONTACT_EMAIL} instead
          </a>
          .
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p id="hr-form-note" className="max-w-xs text-xs leading-relaxed text-ink-faint">
          We use these details only to reply to you. See our{" "}
          <a href="/privacy" className="underline underline-offset-2 hover:text-ink">
            privacy policy
          </a>
          .
        </p>
        <button
          type="submit"
          disabled={status.kind === "sending"}
          className="min-h-[48px] rounded-full bg-ink px-7 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan disabled:opacity-60"
        >
          {status.kind === "sending" ? "Sending…" : "Request a demonstration"}
        </button>
      </div>
    </form>
  );
}
