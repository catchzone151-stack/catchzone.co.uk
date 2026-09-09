import { SectionHeading } from "@/components/ui/SectionHeading";
import { EcosystemDiagram } from "@/components/sections/EcosystemDiagram";
import { flagshipService } from "@/data/services";

export function Ecosystem() {
  return (
    <section
      id="ecosystem"
      className="border-t border-line bg-surface py-24 md:py-32"
    >
      <div className="shell">
        <SectionHeading
          index={flagshipService.index}
          eyebrow="Flagship Service"
          title="Complete Digital Ecosystems"
          description={flagshipService.description}
        />

        <p className="mt-4 max-w-2xl font-display text-lg text-ink md:text-xl">
          {flagshipService.tagline}
        </p>

        <div className="mt-16">
          <EcosystemDiagram />
        </div>
      </div>
    </section>
  );
}
