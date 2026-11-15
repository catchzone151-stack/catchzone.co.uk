/**
 * Small shared building blocks for the School HR product previews.
 * Everything shown inside them is sample data. Colours use theme tokens (or a
 * dark/light pair), so every preview reads correctly in both site themes.
 */

export type RoleId = "staff" | "manager" | "head" | "finance";

export const ROLES: Record<RoleId, { label: string; person: string; title: string; initials: string }> = {
  staff: { label: "Staff", person: "Sam Patel", title: "Year 4 Teacher", initials: "SP" },
  manager: { label: "Line Manager", person: "Jordan Reid", title: "Phase Leader", initials: "JR" },
  head: { label: "Headteacher", person: "Dr Erin Morgan", title: "Headteacher", initials: "EM" },
  finance: { label: "Finance / Administration", person: "Priya Shah", title: "School Business Manager", initials: "PS" },
};

export const ROLE_TONE: Record<RoleId, { text: string; chip: string; dot: string; ring: string }> = {
  staff: {
    text: "text-accent-cyan",
    chip: "border-accent-cyan/30 bg-accent-cyan/10 text-accent-cyan",
    dot: "bg-accent-cyan",
    ring: "ring-accent-cyan/40",
  },
  manager: {
    text: "text-violet-300 light:text-violet-700",
    chip: "border-violet-400/30 bg-violet-400/10 text-violet-300 light:text-violet-700",
    dot: "bg-violet-400 light:bg-violet-600",
    ring: "ring-violet-400/40",
  },
  head: {
    text: "text-amber-300 light:text-amber-800",
    chip: "border-amber-400/30 bg-amber-400/10 text-amber-300 light:text-amber-800",
    dot: "bg-amber-400 light:bg-amber-600",
    ring: "ring-amber-400/40",
  },
  finance: {
    text: "text-sky-300 light:text-sky-700",
    chip: "border-sky-400/30 bg-sky-400/10 text-sky-300 light:text-sky-700",
    dot: "bg-sky-400 light:bg-sky-600",
    ring: "ring-sky-400/40",
  },
};

export type Tone = "ok" | "wait" | "info" | "muted" | "warn";

const PILL: Record<Tone, string> = {
  ok: "bg-emerald-400/10 text-emerald-300 light:text-emerald-700",
  wait: "bg-amber-400/10 text-amber-300 light:text-amber-800",
  info: "bg-accent-cyan/10 text-accent-cyan",
  warn: "bg-rose-400/10 text-rose-300 light:text-rose-700",
  muted: "bg-white/[0.06] text-ink-muted",
};

export function StatusPill({ tone = "muted", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${PILL[tone]}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
      {children}
    </span>
  );
}

export function Avatar({ role, size = "md" }: { role: RoleId; size?: "sm" | "md" }) {
  const r = ROLES[role];
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-semibold ring-1 ${ROLE_TONE[role].chip} ${ROLE_TONE[role].ring} ${
        size === "sm" ? "h-6 w-6 text-[9px]" : "h-9 w-9 text-[11px]"
      }`}
      aria-hidden="true"
    >
      {r.initials}
    </span>
  );
}

export function RoleChip({ role }: { role: RoleId }) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${ROLE_TONE[role].chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${ROLE_TONE[role].dot}`} aria-hidden="true" />
      {ROLES[role].label}
    </span>
  );
}

/** Application window chrome for previews. */
export function AppWindow({
  title,
  role,
  children,
  className = "",
  label = "Product preview",
}: {
  title: string;
  role?: RoleId;
  children: React.ReactNode;
  className?: string;
  /** Footer note; null hides it (when the surrounding layout labels the preview). */
  label?: string | null;
}) {
  return (
    <div
      className={`overflow-hidden rounded-[1.4rem] border border-white/10 bg-surface-raised shadow-[0_40px_90px_-40px_rgba(0,0,0,0.8)] light:shadow-[0_40px_90px_-50px_rgba(14,17,22,0.4)] ${className}`}
    >
      <div className="flex items-center gap-3 border-b border-white/[0.07] bg-white/[0.02] px-4 py-2.5">
        <span className="flex gap-1.5" aria-hidden="true">
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
        </span>
        <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-ink-muted">
          <span className="text-ink">School HR</span> · {title}
        </span>
        {role && (
          <span className="hidden items-center gap-2 sm:flex">
            <span className="text-[11px] text-ink-faint">Viewing as</span>
            <RoleChip role={role} />
          </span>
        )}
      </div>
      {role && (
        <div className="flex items-center justify-between gap-2 border-b border-white/[0.05] px-4 py-2 sm:hidden">
          <span className="text-[11px] text-ink-faint">Viewing as</span>
          <RoleChip role={role} />
        </div>
      )}
      <div className="relative">{children}</div>
      {label && <p className="border-t border-white/[0.05] px-4 py-2 text-[10.5px] text-ink-faint">{label}</p>}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-3.5 py-2.5">
      <p className="text-[10.5px] uppercase tracking-[0.12em] text-ink-faint">{label}</p>
      <div className="mt-0.5 text-sm text-ink">{children}</div>
    </div>
  );
}

export const btnPrimary =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan focus-visible:bg-accent-cyan disabled:opacity-50";
export const btnSecondary =
  "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-white/15 px-5 text-sm font-semibold text-ink transition-colors hover:border-accent-cyan/60 hover:text-accent-cyan";
