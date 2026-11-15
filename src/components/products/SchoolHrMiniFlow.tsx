/**
 * Decorative miniature of a School HR workflow (fictional values):
 * staff request → headteacher approval → finance-ready record.
 * The steps light up in sequence (CSS, see `.hr-step` in globals.css);
 * static with reduced motion. Hidden from assistive technology — the
 * surrounding card text describes the product.
 */
const STEPS = [
  { label: "Request", title: "Additional hours", meta: "2.5 hrs · Parents’ evening", tone: "Submitted" },
  { label: "Approval", title: "Headteacher", meta: "Reviewed against policy", tone: "Approved" },
  { label: "Record", title: "Finance-ready", meta: "Included in monthly export", tone: "Recorded" },
];

export function SchoolHrMiniFlow({ className = "" }: { className?: string }) {
  return (
    <div className={`relative ${className}`} aria-hidden="true">
      <div className="relative grid grid-cols-3 gap-2 sm:gap-3">
        {/* connector + travelling pulse */}
        <div className="pointer-events-none absolute inset-x-[16%] top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-accent-cyan/10 via-accent-cyan/40 to-accent-cyan/10">
          <span className="hr-pulse absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent-cyan shadow-[0_0_10px_rgb(var(--accent-cyan-rgb)/0.9)]" />
        </div>
        {STEPS.map((s, i) => (
          <div
            key={s.label}
            className="hr-step relative rounded-xl border border-white/[0.08] bg-surface-raised/90 p-2.5 sm:p-3"
            style={{ animationDelay: `${i * 2}s` }}
          >
            <p className="mono text-[9px] uppercase tracking-[0.18em] text-ink-faint">{s.label}</p>
            <p className="mt-1 text-[12px] font-semibold leading-tight text-ink sm:text-[13px]">{s.title}</p>
            <p className="mt-0.5 hidden text-[10.5px] leading-snug text-ink-muted sm:block">{s.meta}</p>
            <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent-cyan/10 px-1.5 py-0.5 text-[9.5px] font-semibold text-accent-cyan">
              <span className="h-1 w-1 rounded-full bg-accent-cyan" />
              {s.tone}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
