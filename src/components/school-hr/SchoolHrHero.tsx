import { ProductLogo } from "@/components/brand/ProductLogo";
import { HrInterestLink } from "@/components/school-hr/HrInterestLink";
import { AppWindow, Avatar, StatusPill, btnPrimary, btnSecondary } from "@/components/school-hr/ui";

/** Decorative staff-portal composition (fictional data), hidden from assistive tech. */
function PortalPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[600px] pb-[4.5rem] pt-6 lg:pb-20" aria-hidden="true">
      <div
        className="pointer-events-none absolute -inset-10 -z-10"
        style={{
          background:
            "radial-gradient(45% 45% at 55% 45%, rgb(var(--accent-cyan-rgb) / 0.16), transparent 70%), radial-gradient(35% 40% at 85% 85%, rgb(var(--accent-iris-rgb) / 0.12), transparent 70%)",
        }}
      />
      <AppWindow title="Staff portal" label={null} className="motion-safe:animate-[screen-float_9s_ease-in-out_infinite]">
        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <Avatar role="staff" />
            <div>
              <p className="font-display text-base font-bold text-ink">Good morning, Sam</p>
              <p className="text-xs text-ink-faint">Year 4 Teacher · Example Primary School</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[
              ["TOIL", "6.0 hrs"],
              ["Open requests", "2"],
              ["This month", "2.5 hrs"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-3 py-2.5">
                <p className="text-[10.5px] text-ink-faint">{k}</p>
                <p className="mt-0.5 font-display text-lg font-bold text-ink">{v}</p>
              </div>
            ))}
          </div>
          <div className="overflow-hidden rounded-xl border border-white/[0.08]">
            {[
              ["Additional hours · Parents’ evening", "2.5 hrs · Thu 6 Nov", "wait", "With headteacher"],
              ["TOIL · Friday afternoon", "3.0 hrs · Fri 21 Nov", "wait", "With line manager"],
              ["Return-to-work form", "Mon 3 – Tue 4 Nov", "ok", "Completed"],
            ].map(([a, b, t, p]) => (
              <div key={a} className="flex items-center gap-3 border-b border-white/[0.06] px-3.5 py-2.5 last:border-b-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium text-ink">{a}</p>
                  <p className="text-[11.5px] text-ink-faint">{b}</p>
                </div>
                <StatusPill tone={t as "ok" | "wait"}>{p}</StatusPill>
              </div>
            ))}
          </div>
        </div>
      </AppWindow>

      <p className="absolute bottom-1 right-2 text-[10.5px] text-ink-faint">Illustrative preview · fictional data</p>

      {/* Floating approval + finance cards, connected to the portal */}
      <div className="absolute -left-2 bottom-0 w-[230px] rounded-2xl border border-white/10 bg-surface-raised/95 p-3.5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.75)] backdrop-blur sm:-left-10 lg:-left-14 light:shadow-[0_30px_60px_-35px_rgba(14,17,22,0.4)] motion-safe:animate-[screen-float_8s_ease-in-out_infinite_-2s]">
        <div className="flex items-center gap-2.5">
          <Avatar role="head" size="sm" />
          <p className="text-[12px] font-semibold text-ink">Headteacher approved</p>
        </div>
        <p className="mt-1.5 text-[11.5px] text-ink-muted">Parents’ evening · 2.5 hrs</p>
        <div className="mt-2">
          <StatusPill tone="ok">Approved</StatusPill>
        </div>
      </div>
      <div className="absolute -right-2 -top-2 w-[210px] rounded-2xl border border-white/10 bg-surface-raised/95 p-3.5 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.75)] backdrop-blur sm:-right-8 lg:-right-10 light:shadow-[0_30px_60px_-35px_rgba(14,17,22,0.4)] motion-safe:animate-[screen-float_10s_ease-in-out_infinite_-5s]">
        <div className="flex items-center gap-2.5">
          <Avatar role="finance" size="sm" />
          <p className="text-[12px] font-semibold text-ink">Finance-ready</p>
        </div>
        <p className="mt-1.5 text-[11.5px] text-ink-muted">12 approved claims · November</p>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
          <div className="h-full w-4/5 rounded-full bg-gradient-to-r from-accent-cyan to-accent-iris" />
        </div>
      </div>
    </div>
  );
}

export function SchoolHrHero() {
  return (
    <section aria-labelledby="hr-hero-title" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px]"
        style={{
          background:
            "radial-gradient(40% 55% at 18% 18%, rgb(var(--accent-cyan-rgb) / 0.10), transparent 70%), radial-gradient(40% 55% at 85% 35%, rgb(var(--accent-iris-rgb) / 0.10), transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div className="shell relative grid gap-12 pb-20 pt-8 md:pt-12 lg:grid-cols-[1fr_1.05fr] lg:items-center lg:gap-10 lg:pb-28">
        <div>
          <ProductLogo product="school-hr" className="-ml-3 h-[120px] w-auto sm:h-[140px]" />
          <h1 id="hr-hero-title" className="mt-6 font-display text-4xl font-bold leading-[1.04] text-ink sm:text-5xl md:text-6xl lg:text-[3.6rem]">
            School HR, without the paper chase.
          </h1>
          <p className="mt-6 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
            Bring everyday staff requests, approvals and HR administration into one connected place, designed around
            how schools work.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/[0.07] px-3 py-1.5 font-semibold text-amber-300 light:text-amber-800">
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
              In development · Pilot stage
            </span>
            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-ink-muted">
              Proposed licences from £1,800 per school / year
            </span>
          </div>
          <div className="mt-9 flex flex-wrap gap-3">
            <a href="#workflows" className={btnPrimary}>
              Explore the Workflows
            </a>
            <HrInterestLink interest="general" className={btnSecondary}>
              Request a School Demonstration
            </HrInterestLink>
          </div>
        </div>
        <PortalPreview />
      </div>
    </section>
  );
}
