import type { Service } from "@/data/services";
import { Reveal } from "@/components/ui/Reveal";
import { MagneticLink } from "@/components/ui/MagneticLink";

export function ServiceBody({ service, accent = "cyan" }: { service: Service; accent?: "cyan" | "iris" }) {
  const accentClass = accent === "iris" ? "text-accent-iris" : "text-accent-cyan";
  const dotClass = accent === "iris" ? "bg-accent-iris" : "bg-accent-cyan";

  return (
    <section className="py-16 md:py-20">
      <div className="shell grid gap-10 md:grid-cols-2">
        <Reveal className="rounded-2xl border border-line bg-surface p-8">
          <h2 className="mono text-xs uppercase tracking-wider text-ink-faint">
            Typical Outputs
          </h2>
          <ul className="mt-5 space-y-3">
            {service.outputs.map((output) => (
              <li key={output} className="flex items-start gap-3 text-sm text-ink-muted">
                <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${dotClass}`} />
                {output}
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.06} className="rounded-2xl border border-line bg-surface p-8">
          <h2 className="mono text-xs uppercase tracking-wider text-ink-faint">
            Common Use Cases
          </h2>
          <ul className="mt-5 space-y-3">
            {service.useCases.map((useCase) => (
              <li key={useCase} className="flex items-start gap-3 text-sm text-ink-muted">
                <span className={`mt-1.5 h-1 w-1 shrink-0 rounded-full ${dotClass}`} />
                {useCase}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <div className="shell mt-8 grid gap-10 md:grid-cols-2">
        <Reveal className="rounded-2xl border border-line bg-surface-raised p-8">
          <h2 className={`mono text-xs uppercase tracking-wider ${accentClass}`}>
            How CatchZone Approaches It
          </h2>
          <ol className="mt-5 space-y-4">
            {service.approach.map((step, i) => (
              <li key={step} className="flex gap-4 text-sm text-ink-muted">
                <span className={`mono shrink-0 text-xs ${accentClass}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={0.06} className="rounded-2xl border border-line bg-surface-raised p-8">
          <h2 className="mono text-xs uppercase tracking-wider text-ink-faint">
            Business Outcome
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink">
            {service.outcome}
          </p>
          <h2 className="mono mt-8 text-xs uppercase tracking-wider text-ink-faint">
            Under The Hood
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-ink-muted">
            {service.technicalDetail}
          </p>
        </Reveal>
      </div>

      <Reveal className="shell mt-10">
        <div className="rounded-2xl border border-line bg-surface p-8 text-center md:p-10">
          <h2 className="font-display text-xl font-bold text-ink md:text-2xl">
            Have a project in this area?
          </h2>
          <div className="mt-6 flex justify-center">
            <MagneticLink
              href="/start-a-project"
              className="rounded-full bg-ink px-7 py-3.5 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
            >
              Start a Project
            </MagneticLink>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
