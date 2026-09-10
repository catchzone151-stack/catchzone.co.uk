export interface ClientWorkAccent {
  /** Laptop chassis gradient, light/metal end first. */
  chrome: [string, string];
  /** Border/hardware-edge highlight colour (rgba). */
  ring: string;
  /** Ambient glow colour behind the scene (rgba, low alpha). */
  glow: string;
  /** Hinge/edge accent trace colour (solid). */
  edge: string;
}

export interface ClientWorkProject {
  slug: string;
  name: string;
  url: string;
  /** Mandatory display order — see docs/CATCHZONE_FINAL_LAUNCH_POLISH.md section 9/30. */
  order: number;
  /** Concise, factual, non-fabricated summary of the engagement. */
  summary: string;
  /** Real homepage screenshot — the primary laptop-screen visual. */
  primaryImage: string;
  /** Real supporting-page screenshot — the smaller companion visual. */
  secondaryImage: string;
  accent: ClientWorkAccent;
  /** FDE-only: an honest, non-dominant "platform in development" note. */
  secondaryStatus?: {
    label: string;
    description: string;
  };
}

/**
 * Real CatchZone client work. Order is mandatory (Blossom before FDE) per
 * the launch-polish spec. Images are the real site owner-supplied captures
 * — see docs/ASSET_MANIFEST.md.
 */
export const clientWork: ClientWorkProject[] = [
  {
    slug: "the-blossom-group",
    name: "The Blossom Group",
    url: "https://blossomgroup.co.uk/",
    order: 1,
    summary: "Website design and development for The Blossom Group.",
    primaryImage: "/assets/images/client-work/blossom-primary.png",
    secondaryImage: "/assets/images/client-work/blossom-secondary.png",
    accent: {
      chrome: ["#8a7245", "#2a2117"],
      ring: "rgba(233,196,106,0.4)",
      glow: "rgba(233,196,106,0.16)",
      edge: "#d9b872",
    },
  },
  {
    slug: "fde-fire-security",
    name: "FDE Fire & Security",
    url: "https://fde.uk.com/",
    order: 2,
    summary: "Website design and development for FDE Fire & Security.",
    primaryImage: "/assets/images/client-work/fde-primary.png",
    secondaryImage: "/assets/images/client-work/fde-secondary.png",
    accent: {
      chrome: ["#2c2f36", "#0b0c0e"],
      ring: "rgba(220,60,60,0.55)",
      glow: "rgba(27,42,74,0.2)",
      edge: "#dc3c3c",
    },
    secondaryStatus: {
      label: "In Development",
      description:
        "An operational / job-management platform for FDE is currently in development, alongside the delivered client website.",
    },
  },
];
