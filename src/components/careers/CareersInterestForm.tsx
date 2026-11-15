"use client";

import { useEffect, useRef, useState } from "react";
import { CAREER_AREAS, CAREERS_NOTE, type CareerAreaId } from "@/data/careers";

type Status =
  | { kind: "idle" }
  | { kind: "sending" }
  | { kind: "sent" }
  | { kind: "unconfigured"; mailto: string }
  | { kind: "error"; message: string; mailto: string };

const CONTACT_EMAIL = "info@catchzone.co.uk";
const AREAS = Object.keys(CAREER_AREAS) as CareerAreaId[];
const isArea = (v: unknown): v is CareerAreaId => typeof v === "string" && (AREAS as string[]).includes(v);

function buildMailto(fields: Record<string, string>, area: CareerAreaId): string {
  const subject = `CatchZone Careers — expression of interest (${CAREER_AREAS[area]})`;
  const body = [`Name: ${fields.name ?? ""}`, `Email: ${fields.email ?? ""}`, `Profile / portfolio: ${fields.link ?? ""}`, "", fields.message ?? ""].join("\n");
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * Careers "Register your interest" form. No file uploads; nothing is stored by
 * the website. Never reports success unless the server confirms delivery.
 */
export function CareersInterestForm() {
  const [area, setArea] = useState<CareerAreaId>("full-stack");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const inFlight = useRef(false);
  const submissionId = useRef<string | null>(null);

  useEffect(() => {
    const fromQuery = new URLSearchParams(window.location.search).get("area");
    if (isArea(fromQuery)) setArea(fromQuery);
    const onArea = (e: Event) => {
      const next = (e as CustomEvent<string>).detail;
      if (isArea(next)) setArea(next);
      window.setTimeout(() => formRef.current?.querySelector<HTMLInputElement>("input[name=name]")?.focus({ preventScroll: true }), 450);
    };
    window.addEventListener("cz-careers-area", onArea);
    return () => window.removeEventListener("cz-careers-area", onArea);
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
    const mailto = buildMailto(data, area);
    submissionId.current ??=
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    inFlight.current = true;
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("/api/careers/interest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, area, submissionId: submissionId.current }),
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
        setStatus({ kind: "error", message: "Please add your name, a valid email address and a short message. Links must start with https://.", mailto });
      else if (json.reason === "rate_limited")
        setStatus({ kind: "error", message: "Too many messages in a short time. Please try again shortly or email us directly.", mailto });
      else setStatus({ kind: "error", message: "Your message couldn’t be sent. Please try again or email us directly.", mailto });
    } catch {
      setStatus({ kind: "error", message: "Your message couldn’t be sent. Please check your connection or email us directly.", mailto });
    } finally {
      inFlight.current = false;
    }
  }

  if (status.kind === "sent") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="rounded-3xl border border-accent-cyan/30 bg-accent-cyan/[0.05] p-6 md:p-8">
        <p className="font-display text-2xl font-bold text-ink">Thank you — we’ve received your message.</p>
        <p className="mt-3 text-sm leading-relaxed text-ink-muted">
          We read every message and will be in touch if a suitable opportunity arises. Registering interest doesn’t mean
          a vacancy is open.
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
      aria-describedby="careers-form-note"
    >
      <fieldset>
        <legend className="mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Area of interest</legend>
        <div className="mt-3 grid gap-2">
          {AREAS.map((value) => (
            <label
              key={value}
              className={`flex min-h-[48px] cursor-pointer items-center gap-3 rounded-xl border px-4 py-2 text-sm transition-colors ${
                area === value ? "border-accent-cyan/50 bg-accent-cyan/[0.06] text-ink" : "border-white/10 text-ink-muted hover:border-white/25"
              }`}
            >
              <input
                type="radio"
                name="area-choice"
                value={value}
                checked={area === value}
                onChange={() => setArea(value)}
                className="h-4 w-4 accent-[#14b8a6]"
              />
              {CAREER_AREAS[value]}
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
          Email
          <input name="email" type="email" required maxLength={200} autoComplete="email" inputMode="email" className={inputClass} />
        </label>
        <label className="block text-sm font-medium text-ink sm:col-span-2">
          Profile or portfolio link <span className="font-normal text-ink-faint">(optional)</span>
          <input
            name="link"
            type="url"
            maxLength={300}
            inputMode="url"
            placeholder="https://"
            className={inputClass}
          />
        </label>
        <label className="block text-sm font-medium text-ink sm:col-span-2">
          Brief message
          <textarea
            name="message"
            required
            maxLength={2000}
            rows={4}
            placeholder="A few lines about your experience and the work you’d like to do."
            className={`${inputClass} resize-y`}
          />
        </label>
        <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
          <label>
            Leave this field empty
            <input name="cz_hp" tabIndex={-1} autoComplete="off" />
          </label>
        </div>
      </div>

      {(status.kind === "unconfigured" || status.kind === "error") && (
        <div ref={statusRef} tabIndex={-1} role="alert" className="mt-5 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-ink">
          {status.kind === "unconfigured" ? "Online sending isn’t available right now, so your message has not been sent." : status.message}{" "}
          <a href={status.mailto} className="font-semibold text-accent-cyan hover:underline">
            Email it to {CONTACT_EMAIL} instead
          </a>
          .
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <p id="careers-form-note" className="max-w-sm text-xs leading-relaxed text-ink-faint">
          {CAREERS_NOTE} Please don’t include sensitive personal information. See our{" "}
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
          {status.kind === "sending" ? "Sending…" : "Register your interest"}
        </button>
      </div>
    </form>
  );
}
