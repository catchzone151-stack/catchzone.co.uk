export interface ClientWorkAccent {
  /** Browser-chrome gradient, dark end first. */
  chrome: [string, string];
  /** Border/hardware-edge highlight colour (rgba). */
  ring: string;
  /** Ambient glow colour behind the mockup (rgba, low alpha). */
  glow: string;
}

export interface ClientWorkProject {
  slug: string;
  name: string;
  url: string;
  /** Mandatory display order — see docs/CATCHZONE_FINAL_LAUNCH_POLISH.md section 9/30. */
  order: number;
  /** Concise, factual, non-fabricated summary of the engagement. */
  summary: string;
  /** Local screenshot of the real live site, once supplied — see ASSET_MANIFEST.md. */
  screenshot?: string;
  accent: ClientWorkAccent;
  /** FDE-only: an honest, non-dominant "platform in development" note. */
  secondaryStatus?: {
    label: string;
    description: string;
  };
}

/**
 * Real CatchZone client work. Order is mandatory (Blossom before FDE) per
 * the launch-polish spec. Screenshots are added once supplied by the site
 * owner — see docs/ASSET_MANIFEST.md for the current gap; until then each
 * card shows an honest browser-chrome mockup rather than a fabricated
 * screenshot.
 */
export const clientWork: ClientWorkProject[] = [
  {
    slug: "the-blossom-group",
    name: "The Blossom Group",
    url: "https://blossomgroup.co.uk/",
    order: 1,
    summary: "Website design and development for The Blossom Group.",
    accent: {
      chrome: ["#2a2320", "#0d0a08"],
      ring: "rgba(233,196,106,0.35)",
      glow: "rgba(233,196,106,0.14)",
    },
  },
  {
    slug: "fde-fire-security",
    name: "FDE Fire & Security",
    url: "https://fde.uk.com/",
    order: 2,
    summary: "Website design and development for FDE Fire & Security.",
    accent: {
      chrome: ["#2a1416", "#0d0708"],
      ring: "rgba(220,60,60,0.35)",
      glow: "rgba(220,60,60,0.14)",
    },
    secondaryStatus: {
      label: "In Development",
      description:
        "An operational / job-management platform for FDE is currently in development, alongside the delivered client website.",
    },
  },
];
