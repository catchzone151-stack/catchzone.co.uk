/**
 * The people behind CatchZone — five profiles, each with an approved abstract
 * chrome sculpture and a matching chrome character portrait (dark + light
 * artwork in public/team, mapped by inspecting the supplied artwork).
 *
 * Content rules: describe real CatchZone capability areas only. No invented
 * employment histories, degrees, hometowns, employers, social profiles,
 * headcounts or Person structured data. Daniel Reed, Maya Khan and Oliver
 * Bennett are CatchZone's digital specialist identities (disclosed on the
 * page); the artwork is stylised, not photographic.
 */

export interface TeamProfile {
  slug: "daniel-reed" | "chloe" | "ahsan-hussain" | "maya-khan" | "oliver-bennett";
  name: string;
  role: string;
  /** One or two sentences, shown on the card (clamped) and in the profile. */
  intro: string;
  expertise: string[];
  responsibilities: string[];
  /** Describes the abstract sculpture (alt text). */
  sculpture: string;
  /** Describes the chrome character artwork (alt text). */
  portrait: string;
  cta: { label: string; href: string };
  founder?: boolean;
  specialistIdentity?: boolean;
}

/** Display order: Ahsan (founder) sits in the centre on wide screens. */
export const TEAM: TeamProfile[] = [
  {
    slug: "daniel-reed",
    name: "Daniel Reed",
    role: "Lead Software Engineer",
    intro:
      "Represents CatchZone’s software engineering discipline — application architecture, backend services and systems built to stay reliable as they grow.",
    expertise: ["React and TypeScript", "Application architecture", "APIs and backend systems", "Databases"],
    responsibilities: [
      "Shaping application architecture before the first line of code",
      "Building the APIs, data models and services behind each product",
      "Keeping systems secure, maintainable and ready to scale",
    ],
    sculpture: "Abstract chrome sculpture of interlocking orbital rings on a glowing plinth",
    portrait: "Stylised chrome bust of a man with short hair and glasses",
    cta: { label: "Discuss a build", href: "/start-a-project" },
    specialistIdentity: true,
  },
  {
    slug: "chloe",
    name: "Chloe",
    role: "Operations & Client Coordinator",
    intro:
      "Supports client communication, project coordination and day-to-day operations, helping CatchZone keep projects organised and communication straightforward.",
    expertise: ["Client coordination", "Administration", "Communication", "Operations"],
    responsibilities: [
      "Keeping clients informed at every stage of a project",
      "Coordinating schedules, requests and next steps",
      "Running the day-to-day operations that keep delivery on track",
    ],
    sculpture: "Abstract chrome sculpture of flowing flame-like ribbons on a glowing plinth",
    portrait: "Stylised chrome bust of a woman with swept-up hair and glasses",
    cta: { label: "Get in touch", href: "mailto:info@catchzone.co.uk" },
  },
  {
    slug: "ahsan-hussain",
    name: "Ahsan Hussain",
    role: "Founder, Product Lead & Full-Stack Developer",
    intro:
      "Leads CatchZone’s product direction and works hands-on across software engineering, design and delivery, turning complex business requirements into practical digital solutions.",
    expertise: ["Full-stack development", "Product strategy", "AI integration", "Software architecture"],
    responsibilities: [
      "Setting CatchZone’s product direction, including CatchZone Voice and CatchZone School HR",
      "Turning business requirements into a clear plan and architecture",
      "Building hands-on across frontend, backend and integrations",
    ],
    sculpture: "Abstract chrome sculpture of a central twisting helix on a glowing plinth",
    portrait: "Stylised chrome bust of a man with long curly hair and a full beard",
    cta: { label: "Start a project", href: "/start-a-project" },
    founder: true,
  },
  {
    slug: "maya-khan",
    name: "Maya Khan",
    role: "Product Designer",
    intro:
      "Represents CatchZone’s product design discipline — user experience, visual design and interfaces that stay consistent and intuitive.",
    expertise: ["UX design", "Interface design", "Prototyping", "Design systems"],
    responsibilities: [
      "Mapping user journeys around how people actually work",
      "Designing interfaces and prototypes to test ideas early",
      "Maintaining design systems that keep products consistent",
    ],
    sculpture: "Abstract chrome sculpture of flowing, folded draped forms on a glowing plinth",
    portrait: "Stylised chrome bust of a woman wearing a draped headscarf",
    cta: { label: "Discuss a build", href: "/start-a-project" },
    specialistIdentity: true,
  },
  {
    slug: "oliver-bennett",
    name: "Oliver Bennett",
    role: "QA & Delivery Lead",
    intro:
      "Represents CatchZone’s quality and delivery discipline — testing, automation, reliability and careful release preparation.",
    expertise: ["Quality assurance", "Automated testing", "Security checks", "Release readiness"],
    responsibilities: [
      "Planning and running testing across web and mobile",
      "Automating checks so regressions are caught early",
      "Preparing every release with security and readiness reviews",
    ],
    sculpture: "Abstract chrome sculpture of interconnected glass cubes on a glowing plinth",
    portrait: "Stylised chrome bust of a man in a cap and hooded jacket",
    cta: { label: "Discuss a build", href: "/start-a-project" },
    specialistIdentity: true,
  },
];

export const teamImage = (slug: TeamProfile["slug"], kind: "sculpture" | "portrait", theme: "dark" | "light") =>
  `/team/${slug}-${kind}-${theme}.webp`;

/** Native artwork sizes (no upscaling beyond these). */
export const SCULPTURE_SIZE = { w: 720, h: 720 };
export const PORTRAIT_SIZE = { w: 690, h: 864 };

export const TEAM_DISCLOSURE =
  "Portraits are stylised chrome artwork, not photographs. Daniel Reed, Maya Khan and Oliver Bennett are CatchZone’s digital specialist identities for engineering, design and quality.";
