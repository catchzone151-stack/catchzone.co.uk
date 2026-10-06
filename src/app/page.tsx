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
      <CinematicJourney />
      <SelectedWork />
      <WhatWeBuild />
      <Ecosystem />
      <Process />
      <ProjectCTA />
    </>
  );
}
