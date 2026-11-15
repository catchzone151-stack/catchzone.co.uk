import { TeamExperience } from "@/components/team/TeamExperience";
import { TEAM_DISCLOSURE } from "@/data/team";

/** About page: the full interactive "people behind CatchZone" experience. */
export function TeamSection() {
  return (
    <section id="team" aria-labelledby="team-title" className="relative scroll-mt-24 overflow-x-clip border-t border-line py-16 md:py-24">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
        style={{
          background:
            "radial-gradient(40% 55% at 50% 0%, rgb(var(--accent-cyan-rgb) / 0.10), transparent 70%), radial-gradient(35% 45% at 85% 30%, rgb(var(--accent-iris-rgb) / 0.08), transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div className="shell relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">Inside CatchZone</p>
          <h2 id="team-title" className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl md:text-[2.75rem]">
            The people behind CatchZone
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-muted md:text-lg">
            Product thinking, engineering, design and delivery — working together to build digital systems that solve
            real problems. Select a sculpture to meet the person behind it.
          </p>
        </div>
        <div className="mt-12 md:mt-14">
          <TeamExperience />
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-ink-faint">{TEAM_DISCLOSURE}</p>
      </div>
    </section>
  );
}
