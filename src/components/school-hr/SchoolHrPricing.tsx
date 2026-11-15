import { COMPARISON, MODULES, PACKAGES } from "@/data/schoolHr";
import { HrInterestLink } from "@/components/school-hr/HrInterestLink";
import { btnPrimary, btnSecondary } from "@/components/school-hr/ui";

function Tick({ on, label }: { on: boolean; label: string }) {
  return on ? (
    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-accent-cyan/15 text-[12px] text-accent-cyan">
      <span aria-hidden="true">✓</span>
      <span className="sr-only">Included in {label}</span>
    </span>
  ) : (
    <span className="inline-flex h-6 w-6 items-center justify-center text-ink-faint">
      <span aria-hidden="true">—</span>
      <span className="sr-only">Not included in {label}</span>
    </span>
  );
}

const chevron = (
  <svg viewBox="0 0 12 12" className="h-3.5 w-3.5 transition-transform duration-300 group-open:rotate-180" aria-hidden="true">
    <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** Proposed School HR packages, comparison and optional-module catalogue. */
export function SchoolHrPricing() {
  const optional = MODULES.filter((m) => m.tier === "optional");
  return (
    <div>
      <div className="grid gap-5 lg:grid-cols-2">
        {PACKAGES.map((p) => {
          const highlight = p.id === "essentials";
          return (
            <article
              key={p.id}
              aria-labelledby={`pkg-${p.id}`}
              className={`relative flex flex-col overflow-hidden rounded-[1.75rem] border p-6 sm:p-8 ${
                highlight
                  ? "border-accent-cyan/40 bg-surface-raised shadow-[0_40px_90px_-50px_rgb(var(--accent-cyan-rgb)/0.55)]"
                  : "border-white/10 bg-surface"
              }`}
            >
              {highlight && (
                <div
                  className="pointer-events-none absolute inset-x-0 top-0 h-40"
                  style={{ background: "radial-gradient(70% 100% at 30% 0%, rgb(var(--accent-cyan-rgb) / 0.14), transparent 70%)" }}
                  aria-hidden="true"
                />
              )}
              <div className="relative flex items-center justify-between gap-3">
                <h3 id={`pkg-${p.id}`} className="font-display text-2xl font-bold text-ink">
                  {p.name}
                </h3>
                <span
                  className={`mono rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] ${
                    highlight ? "bg-accent-cyan text-void" : "border border-white/15 text-ink-muted"
                  }`}
                >
                  {p.note}
                </span>
              </div>
              <p className="relative mt-5 flex items-baseline gap-2">
                <span className="font-display text-5xl font-bold tracking-tight text-ink">{p.price}</span>
                <span className="text-sm text-ink-muted">{p.period}</span>
              </p>
              <p className="relative mt-1 text-xs text-ink-faint">Proposed licence price · pilot and development phase</p>
              <p className="relative mt-5 text-sm leading-relaxed text-ink-muted">{p.positioning}</p>
              <div className="relative mt-6 border-t border-white/[0.08] pt-6">
                {p.inherits && <p className="mb-3 text-sm font-semibold text-ink">{p.inherits}</p>}
                <ul className="grid gap-2.5 sm:grid-cols-2">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-sm text-ink">
                      <span className="mt-[3px] flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent-cyan/15 text-[9px] text-accent-cyan" aria-hidden="true">
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                {p.id === "essentials" && (
                  <p className="mt-5 text-xs leading-relaxed text-ink-faint">
                    Sign-in, access controls and basic security are part of delivering the product — not separately
                    charged features.
                  </p>
                )}
                {p.id === "standard" && (
                  <p className="mt-5 text-xs leading-relaxed text-ink-faint">
                    Standard’s additional features are planned and in development; their final scope is confirmed with
                    each school.
                  </p>
                )}
              </div>
              <div className="relative mt-auto flex flex-wrap gap-3 pt-8">
                <HrInterestLink interest={p.id} className={highlight ? btnPrimary : btnSecondary}>
                  Discuss {p.name}
                </HrInterestLink>
                <HrInterestLink interest={p.id} className="inline-flex min-h-[44px] items-center text-sm font-semibold text-accent-cyan hover:text-ink">
                  Request a demonstration <span aria-hidden="true" className="ml-1">→</span>
                </HrInterestLink>
              </div>
            </article>
          );
        })}
      </div>

      {/* What the licence covers */}
      <div className="mt-5 grid gap-5 rounded-[1.75rem] border border-white/10 bg-white/[0.02] p-6 sm:p-8 md:grid-cols-2">
        <div>
          <h3 className="font-display text-lg font-bold text-ink">The annual licence is intended to include</h3>
          <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-ink-muted">
            {["Hosting", "Routine maintenance", "Standard software updates", "Backups", "A defined level of support"].map((x) => (
              <li key={x} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-accent-cyan" aria-hidden="true" />
                {x}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-display text-lg font-bold text-ink">Quoted separately where needed</h3>
          <p className="mt-3 text-sm leading-relaxed text-ink-muted">
            Significant data migration, bespoke development, additional training and special integration work. Prices
            shown are proposed for the pilot and development phase and are subject to final scope and commercial terms.
            There is no online checkout — every school starts with a conversation.
          </p>
        </div>
      </div>

      {/* Comparison */}
      <details className="group mt-5 overflow-hidden rounded-[1.75rem] border border-white/10 bg-surface">
        <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 sm:px-8 [&::-webkit-details-marker]:hidden">
          <span className="font-display text-lg font-bold text-ink">Compare Essentials and Standard</span>
          <span className="flex items-center gap-2 text-sm font-semibold text-accent-cyan">
            <span className="group-open:hidden">Show comparison</span>
            <span className="hidden group-open:inline">Hide comparison</span>
            {chevron}
          </span>
        </summary>
        <div className="overflow-x-auto border-t border-white/[0.08] px-2 pb-4 sm:px-4">
          <table className="w-full min-w-[480px] text-left text-sm">
            <caption className="sr-only">Feature comparison of the proposed Essentials and Standard packages</caption>
            <thead>
              <tr className="text-xs text-ink-faint">
                <th scope="col" className="px-4 py-3 font-medium">Feature</th>
                <th scope="col" className="w-28 px-4 py-3 text-center font-medium">Essentials</th>
                <th scope="col" className="w-28 px-4 py-3 text-center font-medium">Standard</th>
              </tr>
            </thead>
            {COMPARISON.map((g) => (
              <tbody key={g.group}>
                <tr>
                  <th colSpan={3} scope="colgroup" className="mono px-4 pb-2 pt-5 text-[10.5px] font-medium uppercase tracking-[0.18em] text-accent-cyan">
                    {g.group}
                  </th>
                </tr>
                {g.rows.map((r) => (
                  <tr key={r.feature} className="border-t border-white/[0.05]">
                    <th scope="row" className="px-4 py-2.5 font-normal text-ink">
                      {r.feature}
                    </th>
                    <td className="px-4 py-2.5 text-center">
                      <Tick on={r.essentials} label="Essentials" />
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <Tick on={r.standard} label="Standard" />
                    </td>
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>
      </details>

      {/* Optional modules catalogue */}
      <details className="group mt-5 overflow-hidden rounded-[1.75rem] border border-white/10 bg-surface">
        <summary className="flex min-h-[64px] cursor-pointer list-none items-center justify-between gap-4 px-6 py-4 sm:px-8 [&::-webkit-details-marker]:hidden">
          <span>
            <span className="block font-display text-lg font-bold text-ink">Optional modules</span>
            <span className="block text-xs text-ink-faint">Planned, or available for a requirements discussion — none is active today</span>
          </span>
          <span className="flex shrink-0 items-center gap-2 text-sm font-semibold text-accent-cyan">
            <span className="hidden sm:inline">{optional.length} modules</span>
            {chevron}
          </span>
        </summary>
        <ul className="grid gap-px border-t border-white/[0.08] bg-white/[0.06] sm:grid-cols-2">
          {optional.map((m) => (
            <li key={m.id} className="bg-surface px-6 py-4 sm:px-8">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-ink">{m.name}</p>
                <span className="mono shrink-0 rounded-full border border-white/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-ink-muted">
                  {m.status}
                </span>
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">{m.summary}</p>
              {m.caution && <p className="mt-2 text-xs leading-relaxed text-amber-300/90 light:text-amber-800">{m.caution}</p>}
            </li>
          ))}
        </ul>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] px-6 py-4 sm:px-8">
          <p className="text-xs text-ink-faint">Optional modules are scoped and quoted separately. No payroll engine is offered.</p>
          <HrInterestLink interest="optional" className={btnSecondary}>
            Discuss optional modules
          </HrInterestLink>
        </div>
      </details>
    </div>
  );
}
