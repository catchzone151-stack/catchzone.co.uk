import type { Metadata } from "next";
import { CinematicJourney } from "@/components/sections/CinematicJourney";
import { WhatWeBuild } from "@/components/sections/WhatWeBuild";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { Ecosystem } from "@/components/sections/Ecosystem";
import { Process } from "@/components/sections/Process";
import { ProjectCTA } from "@/components/sections/ProjectCTA";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      {/* IDEA → DESIGN → BUILD → SHIP hands straight off to the work it
          produces, so the featured build follows the journey directly. */}
      {/* Light mode keeps these WebGL sections on their dark cinematic stage;
          .theme-seam adds a soft dusk transition (light mode only). */}
      <div className="theme-dark bg-void">
        <CinematicJourney />
      </div>
      <div className="theme-seam" aria-hidden="true" />
      <SelectedWork />
      <div className="theme-seam" data-direction="up" aria-hidden="true" />
      <div className="theme-dark bg-void">
        <WhatWeBuild />
      </div>
      <div className="theme-seam" aria-hidden="true" />
      <Ecosystem />
      <Process />
      <ProjectCTA />
    </>
  );
}
