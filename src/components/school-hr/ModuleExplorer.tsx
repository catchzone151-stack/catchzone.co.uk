"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MODULES, type Module } from "@/data/schoolHr";
import { AppWindow, StatusPill, btnSecondary } from "@/components/school-hr/ui";
import { HrInterestLink } from "@/components/school-hr/HrInterestLink";

/**
 * Module explorer: browse what Essentials, Standard and the optional modules
 * cover. Purely informational — choosing a module here never activates
 * anything; each preview is illustrative with fictional data.
 */

type Tier = Module["tier"];
const TIERS: { id: Tier; label: string; sub: string }[] = [
  { id: "essentials", label: "Essentials", sub: "Pilot package" },
  { id: "standard", label: "Standard", sub: "Adds staff management" },
  { id: "optional", label: "Optional modules", sub: "Planned / scoped" },
];

const STATUS_TONE: Record<Module["status"], "info" | "muted" | "wait"> = {
  Essentials: "info",
  Standard: "info",
  Planned: "muted",
  "Requirements discussion": "wait",
};

export function ModuleExplorer() {
  const [tier, setTier] = useState<Tier>("essentials");
  const [moduleId, setModuleId] = useState<string>(MODULES.find((m) => m.tier === "essentials")!.id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const list = MODULES.filter((m) => m.tier === tier);
  const current = list.find((m) => m.id === moduleId) ?? list[0]!;

  function chooseTier(t: Tier) {
    setTier(t);
    setModuleId(MODULES.find((m) => m.tier === t)!.id);
  }

  function onTabKey(e: React.KeyboardEvent, i: number) {
    const n = TIERS.length;
    let next = -1;
    if (e.key === "ArrowRight") next = (i + 1) % n;
    else if (e.key === "ArrowLeft") next = (i - 1 + n) % n;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = n - 1;
    if (next < 0) return;
    e.preventDefault();
    chooseTier(TIERS[next]!.id);
    tabRefs.current[next]?.focus();
  }

  const interest = tier === "optional" ? "optional" : tier;

  return (
    <div className="rounded-[2rem] border border-white/10 bg-surface p-3 sm:p-4">
      <div role="tablist" aria-label="Package" className="grid grid-cols-3 gap-1 rounded-2xl bg-white/[0.03] p-1">
        {TIERS.map((t, i) => {
          const active = t.id === tier;
          return (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              id={`tier-tab-${t.id}`}
              aria-selected={active}
              aria-controls="tier-panel"
              tabIndex={active ? 0 : -1}
              onClick={() => chooseTier(t.id)}
              onKeyDown={(e) => onTabKey(e, i)}
              className={`min-h-[52px] rounded-xl px-2 py-2 text-center transition-colors ${
                active ? "bg-surface-raised shadow-[0_8px_24px_-16px_rgba(0,0,0,0.6)]" : "hover:bg-white/[0.04]"
              }`}
            >
              <span className={`block text-sm font-semibold ${active ? "text-ink" : "text-ink-muted"}`}>{t.label}</span>
              <span className="hidden text-[11px] text-ink-faint sm:block">{t.sub}</span>
            </button>
          );
        })}
      </div>

      <div
        id="tier-panel"
        role="tabpanel"
        aria-labelledby={`tier-tab-${tier}`}
        className="mt-3 grid gap-4 p-1 sm:p-2 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-6"
      >
        <div>
          <p className="sr-only" id="module-list-label">
            Modules in {TIERS.find((t) => t.id === tier)!.label}
          </p>
          <ul aria-labelledby="module-list-label" className="space-y-1.5">
            {list.map((m) => {
              const active = m.id === current.id;
              return (
                <li key={m.id}>
                  <button
                    type="button"
                    aria-pressed={active}
                    aria-controls="module-detail"
                    onClick={() => setModuleId(m.id)}
                    className={`flex w-full min-h-[48px] items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-left transition-colors ${
                      active ? "border-accent-cyan/45 bg-accent-cyan/[0.06]" : "border-transparent hover:border-white/10 hover:bg-white/[0.03]"
                    }`}
                  >
                    <span className={`text-sm ${active ? "font-semibold text-ink" : "text-ink-muted"}`}>{m.name}</span>
                    <span aria-hidden="true" className={`text-xs ${active ? "text-accent-cyan" : "text-ink-faint"}`}>
                      →
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div id="module-detail" className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="font-display text-xl font-bold text-ink">{current.name}</h3>
                <StatusPill tone={STATUS_TONE[current.status]}>
                  {current.status === "Essentials" || current.status === "Standard" ? `In ${current.status}` : current.status}
                </StatusPill>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-ink-muted">{current.summary}</p>
              <ul className="mt-4 space-y-2">
                {current.points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-ink">
                    <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-cyan" aria-hidden="true" />
                    {p}
                  </li>
                ))}
              </ul>
              {current.caution && (
                <p className="mt-4 rounded-xl border border-amber-400/25 bg-amber-400/[0.06] px-3.5 py-2.5 text-[13px] leading-relaxed text-ink">
                  {current.caution}
                </p>
              )}
              <div className="mt-5" aria-hidden="true">
                <AppWindow title={current.preview.title} label={tier === "optional" ? "Concept only · not available today" : "Illustrative preview · fictional data"}>
                  <ul className="divide-y divide-white/[0.06]">
                    {current.preview.rows.map((r) => (
                      <li key={r.label} className="flex items-center justify-between gap-3 px-4 py-2.5 text-[13px]">
                        <span className="min-w-0 truncate text-ink-muted">{r.label}</span>
                        {r.tag ? (
                          <StatusPill tone={r.tag === "ok" ? "ok" : "wait"}>{r.value}</StatusPill>
                        ) : (
                          <span className="shrink-0 text-ink">{r.value}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </AppWindow>
              </div>
              <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-ink-faint">Exploring a module here doesn’t switch anything on.</p>
                <HrInterestLink interest={interest} className={btnSecondary}>
                  Discuss this {tier === "optional" ? "module" : "package"}
                </HrInterestLink>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
