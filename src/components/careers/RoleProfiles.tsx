"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ROLE_PROFILES } from "@/data/careers";

/** Expandable role-profile cards (disclosure buttons; one or both may be open). */
export function RoleProfiles() {
  const [open, setOpen] = useState<Record<string, boolean>>({});

  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:items-start">
      {ROLE_PROFILES.map((r, i) => {
        const isOpen = !!open[r.id];
        const panelId = `role-${r.id}-details`;
        return (
          <article
            key={r.id}
            aria-labelledby={`role-${r.id}-title`}
            className={`relative overflow-hidden rounded-[1.75rem] border bg-surface transition-colors ${
              isOpen ? "border-accent-cyan/35" : "border-white/10 hover:border-white/20"
            }`}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-40"
              style={{
                background: `radial-gradient(70% 100% at ${i === 0 ? "20%" : "80%"} 0%, rgb(var(--accent-${i === 0 ? "cyan" : "iris"}-rgb) / 0.12), transparent 70%)`,
              }}
              aria-hidden="true"
            />
            <div className="relative p-6 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <p className="mono text-[11px] uppercase tracking-[0.2em] text-accent-cyan">
                  {String(i + 1).padStart(2, "0")} · {r.discipline}
                </p>
                <span className="mono rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.14em] text-ink-muted">
                  Role profile
                </span>
              </div>
              <h3 id={`role-${r.id}-title`} className="mt-4 font-display text-2xl font-bold text-ink sm:text-[1.75rem]">
                {r.title}
              </h3>
              <p className="mt-3 text-base leading-relaxed text-ink-muted">{r.focus}</p>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Key technologies and practices">
                {r.tags.map((t) => (
                  <li key={t} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-ink-muted">
                    {t}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen((o) => ({ ...o, [r.id]: !o[r.id] }))}
                className="mt-7 inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 px-5 text-sm font-semibold text-ink transition-colors hover:border-accent-cyan/60 hover:text-accent-cyan"
              >
                {isOpen ? "Hide role details" : "View role details"}
                <svg
                  viewBox="0 0 12 12"
                  className={`h-3 w-3 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                >
                  <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>

            {/* Always in the DOM (readable by search engines); inert and hidden from AT while collapsed. */}
            <motion.div
                  id={panelId}
                  role="region"
                  aria-labelledby={`role-${r.id}-title`}
                  aria-hidden={!isOpen}
                  inert={!isOpen}
                  initial={false}
                  animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="relative overflow-hidden"
                >
                  <div className="space-y-7 border-t border-white/[0.08] p-6 sm:p-8">
                    <p className="text-sm leading-relaxed text-ink">{r.summary}</p>
                    <div>
                      <h4 className="mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">What the role involves</h4>
                      <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                        {r.responsibilities.map((x) => (
                          <li key={x} className="flex items-start gap-2.5 text-sm text-ink">
                            <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-cyan" aria-hidden="true" />
                            {x}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Relevant experience and skills</h4>
                      <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                        {r.skills.map((x) => (
                          <li key={x} className="flex items-start gap-2.5 text-sm text-ink">
                            <span
                              className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent-cyan/15 text-[9px] text-accent-cyan"
                              aria-hidden="true"
                            >
                              ✓
                            </span>
                            {x}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h4 className="mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Also useful — not required</h4>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {r.bonus.map((x) => (
                          <li key={x} className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-ink-muted">
                            {x}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <a
                      href={`?area=${r.id}#careers-interest`}
                      onClick={(e) => {
                        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
                        e.preventDefault();
                        window.dispatchEvent(new CustomEvent("cz-careers-area", { detail: r.id }));
                        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
                        document.getElementById("careers-interest")?.scrollIntoView({ behavior: reduced ? "auto" : "smooth" });
                        history.replaceState(null, "", `?area=${r.id}#careers-interest`);
                      }}
                      className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
                    >
                      Register your interest
                    </a>
                  </div>
                </motion.div>
          </article>
        );
      })}
    </div>
  );
}
