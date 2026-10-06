import Link from "next/link";
import { EcosystemDiagram } from "@/components/sections/EcosystemDiagram";
import { AtmosphereLayer } from "@/components/ui/AtmosphereLayer";
import { Reveal } from "@/components/ui/Reveal";
import { flagshipService } from "@/data/services";

const PIECES = [
  "Website",
  "App",
  "Admin",
  "Backend",
  "Database",
  "Automation",
  "Integrations",
];

/**
 * 07 — the conclusion to 06: each discipline stands alone, and CatchZone
 * can also connect them into one system. Compact by design; the three
 * capabilities visibly fly into the ecosystem hub on arrival.
 */
export function Ecosystem() {
  return (
    <section
      id="ecosystem"
      className="relative overflow-hidden border-t border-line bg-surface py-14 md:py-16"
    >
      <AtmosphereLayer tone="iris" />
      <div className="shell relative z-10 grid items-center gap-10 md:grid-cols-[0.55fr_0.45fr] md:gap-12">
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="mono text-xs text-accent-cyan">07</span>
            <span className="mono text-xs uppercase tracking-[0.2em] text-ink-faint">Flagship Service</span>
          </div>
          <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl md:text-5xl">
            Complete Digital Ecosystems
          </h2>
          <p className="mt-4 text-base font-semibold text-accent-iris">
            Apps, web platforms and business systems each stand on their own. Connected, they become one.
          </p>
          <p className="mt-4 font-display text-lg text-ink">{flagshipService.tagline}</p>
          <p className="mt-3 max-w-lg text-base leading-relaxed text-ink-muted">
            {flagshipService.description}
          </p>
          <ul className="mt-5 hidden flex-wrap gap-2 sm:flex">
            {PIECES.map((piece) => (
              <li key={piece} className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-muted">
                {piece}
              </li>
            ))}
          </ul>
          <Link
            href="/services"
            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent-iris"
          >
            Explore this capability
            <span aria-hidden="true">→</span>
          </Link>
        </Reveal>

        <EcosystemDiagram compact converge={["Apps", "Web", "Systems"]} />
      </div>
    </section>
  );
}
