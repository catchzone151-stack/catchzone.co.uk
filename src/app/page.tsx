import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { WhatWeBuild } from "@/components/sections/WhatWeBuild";
import { SketchToBuild } from "@/components/sections/SketchToBuild";
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
      <Hero />
      <WhatWeBuild />
      <SketchToBuild />
      <SelectedWork />
      <Ecosystem />
      <Process />
      <ProjectCTA />
    </>
  );
}
