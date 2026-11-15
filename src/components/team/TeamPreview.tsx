import Link from "next/link";
import { TEAM } from "@/data/team";
import { TeamImage } from "@/components/team/TeamImage";
import { Reveal } from "@/components/ui/Reveal";

/**
 * Homepage: compact "people behind CatchZone" preview — the five abstract
 * sculptures (no character portraits, no biographies) and one CTA to the full
 * interactive experience on /about#team.
 */
export function TeamPreview() {
  return (
    <section aria-labelledby="team-preview-title" className="relative overflow-x-clip border-t border-line py-20 md:py-28">
      <div
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(45% 60% at 50% 55%, rgb(var(--accent-cyan-rgb) / 0.08), transparent 70%)" }}
        aria-hidden="true"
      />
      <div className="shell relative">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">Inside CatchZone</p>
          <h2 id="team-preview-title" className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl md:text-[2.75rem]">
            The People Behind CatchZone
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-muted md:text-lg">
            Product thinking, engineering, design and delivery — working together to build digital systems that solve
            real problems.
          </p>
        </div>

        <ul className="mx-auto mt-12 grid max-w-5xl grid-cols-5 items-end gap-2 sm:gap-4 md:mt-14">
          {TEAM.map((p, i) => (
            <Reveal as="li" key={p.slug} delay={i * 0.05} className={`text-center ${p.founder ? "" : "pb-2 sm:pb-4"}`}>
              <div className={`relative mx-auto ${p.founder ? "w-full" : "w-[86%]"}`}>
                <span
                  className="pointer-events-none absolute inset-[20%] rounded-full bg-accent-cyan/15 blur-2xl light:bg-accent-cyan/10"
                  aria-hidden="true"
                />
                <TeamImage
                  slug={p.slug}
                  kind="sculpture"
                  alt=""
                  sizes="(min-width: 1024px) 200px, 19vw"
                  className="relative aspect-square h-auto w-full object-contain"
                />
              </div>
              <p className={`mt-2 font-display font-bold leading-tight text-ink ${p.founder ? "text-[13px] sm:text-base" : "text-[11px] sm:text-sm"}`}>
                {p.name}
              </p>
              <p className="mt-0.5 hidden text-xs leading-snug text-ink-muted md:block">{p.role.split(",")[0]}</p>
            </Reveal>
          ))}
        </ul>

        <div className="mt-10 flex justify-center md:mt-12">
          <Link
            href="/about#team"
            className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-ink px-7 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
          >
            Meet the Team <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
