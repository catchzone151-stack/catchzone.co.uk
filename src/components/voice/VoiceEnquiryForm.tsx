"use client";

import { useEffect, useRef, useState } from "react";

type Intent = "demonstration" | "requirements";
type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "unconfigured"; mailto: string }
  | { kind: "error"; message: string; mailto: string };

const CONTACT_EMAIL = "info@catchzone.co.uk";

function buildMailto(intent: Intent, fields: Record<string, string>): string {
  const subject =
    intent === "demonstration"
      ? "CatchZone Voice — private demonstration request"
      : "CatchZone Voice — requirements";
  const body = [
    `Name: ${fields.name ?? ""}`,
    `Business email: ${fields.email ?? ""}`,
    `Company: ${fields.company ?? ""}`,
    "",
    fields.message ?? "",
  ].join("\n");
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Short Voice enquiry form. Never reports success unless the server
 * confirms delivery; when email delivery isn't configured it offers a
 * pre-filled email instead.
 */
export function VoiceEnquiryForm() {
  const [intent, setIntent] = useState<Intent>("demonstration");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  // The section's two call-to-action buttons set the intent and focus the form.
  useEffect(() => {
    const onIntent = (e: Event) => {
      const next = (e as CustomEvent<Intent>).detail;
      if (next === "demonstration" || next === "requirements") setIntent(next);
      formRef.current?.querySelector<HTMLInputElement>("input[name=name]")?.focus();
    };
    window.addEventListener("cz-voice-intent", onIntent);
    return () => window.removeEventListener("cz-voice-intent", onIntent);
  }, []);

  useEffect(() => {
    if (status.kind !== "idle" && status.kind !== "sending") statusRef.current?.focus();
  }, [status.kind]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const mailto = buildMailto(intent, data);
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/voice/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, intent }),
      });
      const json = (await res.json()) as { ok: boolean; reason?: string };
      if (json.ok) {
        setStatus({ kind: "sent" });
        form.reset();
      } else if (json.reason === "unconfigured") {
        setStatus({ kind: "unconfigured", mailto });
      } else if (json.reason === "missing_fields") {
        setStatus({ kind: "error", message: "Please complete every field with a valid business email.", mailto });
      } else if (json.reason === "rate_limited") {
        setStatus({ kind: "error", message: "Too many messages in a short time. Please try again shortly or email us directly.", mailto });
      } else {
        setStatus({ kind: "error", message: "Your message couldn’t be sent. Please try again or email us directly.", mailto });
      }
    } catch {
      setStatus({ kind: "error", message: "Your message couldn’t be sent. Please check your connection or email us directly.", mailto });
    }
  }

  if (status.kind === "sent") {
    return (
      <div
        ref={statusRef}
        tabIndex={-1}
        role="status"
        className="rounded-3xl border border-accent-cyan/30 bg-accent-cyan/[0.05] p-6 md:p-8"
      >
        <p className="font-display text-2xl font-bold text-ink">Thank you — message received.</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          We’ll reply to the business email you provided. If it’s urgent, email{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="text-accent-cyan hover:underline">
            {CONTACT_EMAIL}
          </a>
          .
        </p>
        <button
          type="button"
          onClick={() => setStatus({ kind: "idle" })}
          className="mt-6 min-h-[44px] rounded-full border border-white/15 px-5 text-sm font-semibold text-ink hover:border-white/40"
        >
          Send another message
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
      aria-describedby="voice-form-note"
    >
      <fieldset>
        <legend className="mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">I’d like to</legend>
        <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
          {(
            [
              ["demonstration", "Request a private demonstration"],
              ["requirements", "Discuss our requirements"],
            ] as const
          ).map(([value, label]) => (
            <label
              key={value}
              className={`flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border px-4 py-2 text-sm transition-colors ${
                intent === value ? "border-accent-cyan/50 bg-accent-cyan/[0.06] text-ink" : "border-white/10 text-ink-muted hover:border-white/25"
              }`}
            >
              <input
                type="radio"
                name="intent-choice"
                value={value}
                checked={intent === value}
                onChange={() => setIntent(value)}
                className="h-4 w-4 accent-[#5eead4]"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-ink">
          Name
          <input name="name" required maxLength={120} autoComplete="name" className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-ink">
          Business email
          <input
            name="email"
            type="email"
            required
            maxLength={200}
            autoComplete="email"
            inputMode="email"
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium text-ink sm:col-span-2">
          Company
          <input name="company" required maxLength={160} autoComplete="organization" className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-ink sm:col-span-2">
          Message
          <textarea
            name="message"
            required
            maxLength={3000}
            rows={4}
            placeholder="For example: languages you support, call volumes, or the systems your advisers use."
            className={`${inputClass} resize-y`}
          />
        </label>
        {/* Honeypot — hidden from people and assistive technology. */}
        <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
          <label>
            Website
            <input name="website" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </div>

      {(status.kind === "unconfigured" || status.kind === "error") && (
        <div
          ref={statusRef}
          tabIndex={-1}
          role="alert"
          className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-ink"
        >
          {status.kind === "unconfigured"
            ? "Online sending isn’t available right now, so your message has not been sent."
            : status.message}{" "}
          <a href={status.mailto} className="font-semibold text-accent-cyan hover:underline">
            Email it to {CONTACT_EMAIL} instead
          </a>
          .
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p id="voice-form-note" className="max-w-xs text-xs leading-relaxed text-ink-faint">
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
          {status.kind === "sending" ? "Sending…" : intent === "demonstration" ? "Request demonstration" : "Send message"}
        </button>
      </div>
    </form>
  );
}
