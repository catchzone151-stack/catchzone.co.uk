import type { Metadata } from "next";
import { Hero } from "@/components/sections/Hero";
import { WhatWeBuild } from "@/components/sections/WhatWeBuild";
import { Ecosystem } from "@/components/sections/Ecosystem";
import { SelectedWork } from "@/components/sections/SelectedWork";
import { Process } from "@/components/sections/Process";
import { WhyCatchZone } from "@/components/sections/WhyCatchZone";
import { ProjectCTA } from "@/components/sections/ProjectCTA";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <WhatWeBuild />
      <Ecosystem />
      <SelectedWork />
      <Process />
      <WhyCatchZone />
      <ProjectCTA />
    </>
  );
}
