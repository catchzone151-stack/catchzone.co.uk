import type { Metadata } from "next";
import { CinematicJourney } from "@/components/sections/CinematicJourney";
import { WhatWeBuild } from "@/components/sections/WhatWeBuild";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { Ecosystem } from "@/components/sections/Ecosystem";
import { Process } from "@/components/sections/Process";
import { ProjectCTA } from "@/components/sections/ProjectCTA";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "CatchZone — Bespoke Software Development & Digital Products",
  description: "CatchZone Ltd is a UK software development company building bespoke apps, web platforms and business systems — and the team behind CatchZone Voice and CatchZone School HR.",
  path: "/",
});

export default function HomePage() {
  return (
    <>
      {/* IDEA → DESIGN → BUILD → SHIP hands straight off to the work it
          produces, so the featured build follows the journey directly. */}
      {/* The journey has art-directed dark and light versions of the same scene. */}
      <CinematicJourney />
      <SelectedWork />
      <WhatWeBuild />
      <Ecosystem />
      <Process />
      <ProjectCTA />
    </>
  );
}
