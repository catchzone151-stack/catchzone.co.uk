import Link from "next/link";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { EcosystemDiagram } from "@/components/sections/EcosystemDiagram";
import { AtmosphereLayer } from "@/components/ui/AtmosphereLayer";
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

export function Ecosystem() {
  return (
    <section
      id="ecosystem"
      className="relative overflow-hidden border-t border-line bg-surface py-20 md:py-24"
    >
      <AtmosphereLayer tone="iris" />
      <div className="shell relative z-10">
        <SectionHeading
          index={flagshipService.index}
          eyebrow="Flagship Service"
          title="Complete Digital Ecosystems"
        />

        <div className="mt-12 grid items-center gap-12 md:grid-cols-[0.42fr_0.58fr] md:gap-8 lg:grid-cols-[0.38fr_0.62fr]">
          <EcosystemDiagram compact />

          <div>
            <p className="font-display text-lg text-ink md:text-xl">
              {flagshipService.tagline}
            </p>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-ink-muted">
              {flagshipService.description}
            </p>
            <ul className="mt-6 flex flex-wrap gap-2">
              {PIECES.map((piece) => (
                <li
                  key={piece}
                  className="rounded-full border border-line px-3 py-1.5 text-xs text-ink-muted"
                >
                  {piece}
                </li>
              ))}
            </ul>
            <Link
              href="/services"
              className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-accent-iris"
            >
              Explore this capability
              <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
