"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  buildTypeOptions,
  startingPointOptions,
  priorityOptions,
  budgetOptions,
  type ProjectBrief,
} from "@/data/project-config";

type SubmitState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "unconfigured" }
  | { status: "error" };

const TOTAL_STEPS = 5;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildMailto(brief: ProjectBrief) {
  const subject = `Project brief — ${brief.name}${brief.company ? ` (${brief.company})` : ""}`;
  const body = [
    `Build type: ${brief.buildType}`,
    `Starting point: ${brief.startingPoint}`,
    `Priorities: ${brief.priorities.join(", ")}`,
    `Budget: ${brief.budget}`,
    "",
    `Name: ${brief.name}`,
    `Email: ${brief.email}`,
    `Company: ${brief.company || "—"}`,
    `Phone: ${brief.phone || "—"}`,
    "",
    "Description:",
    brief.description,
  ].join("\n");

  return `mailto:info@catchzone.co.uk?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function OptionGrid({
  options,
  selected,
  onSelect,
  multi = false,
}: {
  options: { id: string; label: string }[];
  selected: string[];
  onSelect: (id: string) => void;
  multi?: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {options.map((option) => {
        const isSelected = selected.includes(option.id);
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(option.id)}
            className={`rounded-xl border px-5 py-4 text-left text-sm font-medium transition-colors ${
              isSelected
                ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan"
                : "border-line bg-surface text-ink-muted hover:border-ink/30 hover:text-ink"
            }`}
          >
            {multi && (
              <span
                aria-hidden="true"
                className={`mr-2 inline-block h-3 w-3 rounded-sm border align-middle ${
                  isSelected ? "border-accent-cyan bg-accent-cyan" : "border-ink/30"
                }`}
              />
            )}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function ProjectConfigurator() {
  const [step, setStep] = useState(0);
  const [buildType, setBuildType] = useState("");
  const [startingPoint, setStartingPoint] = useState("");
  const [priorities, setPriorities] = useState<string[]>([]);
  const [budget, setBudget] = useState("");
  const [contact, setContact] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    description: "",
  });
  const [website, setWebsite] = useState("");
  const [submitState, setSubmitState] = useState<SubmitState>({ status: "idle" });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const headingRef = useRef<HTMLHeadingElement>(null);

  function goTo(nextStep: number) {
    setStep(nextStep);
    requestAnimationFrame(() => headingRef.current?.focus());
  }

  function togglePriority(id: string) {
    setPriorities((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id],
    );
  }

  const canProceed = [
    !!buildType,
    !!startingPoint,
    priorities.length > 0,
    !!budget,
    true,
  ][step];

  const brief: ProjectBrief = {
    buildType,
    startingPoint,
    priorities,
    budget,
    ...contact,
  };

  function validateContact(): Record<string, string> {
    const errors: Record<string, string> = {};
    if (!contact.name.trim()) errors.name = "Please enter your name.";
    if (!contact.email.trim()) {
      errors.email = "Please enter your email.";
    } else if (!EMAIL_RE.test(contact.email.trim())) {
      errors.email = "Please enter a valid email address.";
    }
    if (!contact.description.trim()) {
      errors.description = "Tell us a little about what you're building.";
    }
    return errors;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const errors = validateContact();
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }
    setFieldErrors({});
    setSubmitState({ status: "submitting" });
    try {
      const res = await fetch("/api/start-a-project", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...brief, website }),
      });
      const data = await res.json();
      if (data.ok) {
        setSubmitState({ status: "success" });
      } else if (data.reason === "unconfigured") {
        setSubmitState({ status: "unconfigured" });
      } else {
        setSubmitState({ status: "error" });
      }
    } catch {
      setSubmitState({ status: "error" });
    }
  }

  if (submitState.status === "success") {
    return (
      <div className="rounded-2xl border border-accent-cyan/30 bg-surface p-10 text-center">
        <h2 className="font-display text-2xl font-bold text-ink">
          Brief sent.
        </h2>
        <p className="mt-3 text-base text-ink-muted">
          Thanks, {contact.name.split(" ")[0] || "there"} — we&apos;ll be in
          touch at {contact.email}.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="mb-8 flex items-center gap-3">
        <p className="mono text-xs text-ink-faint">
          Step {step + 1} of {TOTAL_STEPS}
        </p>
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-line">
          <motion.div
            className="h-full bg-accent-cyan"
            animate={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.fieldset
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="border-0 p-0"
        >
          <legend className="sr-only">Step {step + 1}</legend>

          {step === 0 && (
            <div>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="font-display text-2xl font-bold text-ink outline-none"
              >
                What are we building?
              </h2>
              <div className="mt-6">
                <OptionGrid
                  options={buildTypeOptions}
                  selected={buildType ? [buildType] : []}
                  onSelect={setBuildType}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="font-display text-2xl font-bold text-ink outline-none"
              >
                Where are you now?
              </h2>
              <div className="mt-6">
                <OptionGrid
                  options={startingPointOptions}
                  selected={startingPoint ? [startingPoint] : []}
                  onSelect={setStartingPoint}
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="font-display text-2xl font-bold text-ink outline-none"
              >
                What matters most?
              </h2>
              <p className="mt-2 text-sm text-ink-muted">Select all that apply.</p>
              <div className="mt-6">
                <OptionGrid
                  options={priorityOptions}
                  selected={priorities}
                  onSelect={togglePriority}
                  multi
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="font-display text-2xl font-bold text-ink outline-none"
              >
                Project investment
              </h2>
              <div className="mt-6">
                <OptionGrid
                  options={budgetOptions}
                  selected={budget ? [budget] : []}
                  onSelect={setBudget}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2
                ref={headingRef}
                tabIndex={-1}
                className="font-display text-2xl font-bold text-ink outline-none"
              >
                Tell us about the project
              </h2>

              {/* Honeypot — hidden from real visitors, catches basic bots */}
              <div className="absolute left-[-9999px] top-auto h-0 w-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="website">Leave this field empty</label>
                <input
                  id="website"
                  name="website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                />
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <label htmlFor="name" className="mono text-xs uppercase tracking-wider text-ink-faint">
                    Name
                  </label>
                  <input
                    id="name"
                    required
                    aria-invalid={Boolean(fieldErrors.name)}
                    aria-describedby={fieldErrors.name ? "name-error" : undefined}
                    value={contact.name}
                    onChange={(e) => setContact({ ...contact, name: e.target.value })}
                    className={`mt-2 w-full rounded-lg border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-accent-cyan ${fieldErrors.name ? "border-red-400/60" : "border-line"}`}
                  />
                  {fieldErrors.name && (
                    <p id="name-error" role="alert" className="mt-1.5 text-xs text-red-400">
                      {fieldErrors.name}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-1">
                  <label htmlFor="email" className="mono text-xs uppercase tracking-wider text-ink-faint">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    aria-invalid={Boolean(fieldErrors.email)}
                    aria-describedby={fieldErrors.email ? "email-error" : undefined}
                    value={contact.email}
                    onChange={(e) => setContact({ ...contact, email: e.target.value })}
                    className={`mt-2 w-full rounded-lg border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-accent-cyan ${fieldErrors.email ? "border-red-400/60" : "border-line"}`}
                  />
                  {fieldErrors.email && (
                    <p id="email-error" role="alert" className="mt-1.5 text-xs text-red-400">
                      {fieldErrors.email}
                    </p>
                  )}
                </div>
                <div className="sm:col-span-1">
                  <label htmlFor="company" className="mono text-xs uppercase tracking-wider text-ink-faint">
                    Company
                  </label>
                  <input
                    id="company"
                    value={contact.company}
                    onChange={(e) => setContact({ ...contact, company: e.target.value })}
                    className="mt-2 w-full rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-accent-cyan"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label htmlFor="phone" className="mono text-xs uppercase tracking-wider text-ink-faint">
                    Phone <span className="text-ink-faint">(optional)</span>
                  </label>
                  <input
                    id="phone"
                    value={contact.phone}
                    onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    className="mt-2 w-full rounded-lg border border-line bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-accent-cyan"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="description" className="mono text-xs uppercase tracking-wider text-ink-faint">
                    Project description
                  </label>
                  <textarea
                    id="description"
                    required
                    rows={5}
                    aria-invalid={Boolean(fieldErrors.description)}
                    aria-describedby={fieldErrors.description ? "description-error" : undefined}
                    value={contact.description}
                    onChange={(e) => setContact({ ...contact, description: e.target.value })}
                    className={`mt-2 w-full resize-none rounded-lg border bg-surface px-4 py-3 text-sm text-ink outline-none focus:border-accent-cyan ${fieldErrors.description ? "border-red-400/60" : "border-line"}`}
                  />
                  {fieldErrors.description && (
                    <p id="description-error" role="alert" className="mt-1.5 text-xs text-red-400">
                      {fieldErrors.description}
                    </p>
                  )}
                </div>
              </div>

              {submitState.status === "unconfigured" && (
                <div
                  role="alert"
                  className="mt-6 rounded-xl border border-accent-iris/30 bg-accent-iris/5 p-5 text-sm text-ink-muted"
                >
                  <p>
                    Our automated inbox isn&apos;t connected yet, so this
                    couldn&apos;t send itself — nothing has been lost. Click
                    below to send it from your own email client instead.
                  </p>
                  <a
                    href={buildMailto(brief)}
                    className="mt-4 inline-block rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-void"
                  >
                    Send via email
                  </a>
                </div>
              )}

              {submitState.status === "error" && (
                <p role="alert" className="mt-6 text-sm text-red-400">
                  Something went wrong sending this. Please email{" "}
                  <a href="mailto:info@catchzone.co.uk" className="underline">
                    info@catchzone.co.uk
                  </a>{" "}
                  directly.
                </p>
              )}
            </div>
          )}
        </motion.fieldset>
      </AnimatePresence>

      <div className="mt-10 flex items-center justify-between">
        <button
          type="button"
          onClick={() => goTo(Math.max(0, step - 1))}
          className={`text-sm font-semibold text-ink-muted transition-colors hover:text-ink ${step === 0 ? "invisible" : ""}`}
        >
          ← Back
        </button>

        {step < TOTAL_STEPS - 1 ? (
          <button
            key="continue"
            type="button"
            disabled={!canProceed}
            onClick={() => goTo(step + 1)}
            className="rounded-full bg-ink px-7 py-3 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan disabled:cursor-not-allowed disabled:opacity-40"
          >
            Continue →
          </button>
        ) : (
          <button
            key="submit"
            type="submit"
            disabled={submitState.status === "submitting"}
            className="rounded-full bg-ink px-7 py-3 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitState.status === "submitting" ? "Sending…" : "Send Project Brief"}
          </button>
        )}
      </div>
    </form>
  );
}
