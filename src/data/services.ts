export interface ServiceOutput {
  label: string;
}

export interface Service {
  index: string;
  slug: "apps" | "web" | "systems";
  name: string;
  shortName: string;
  heroTagline: string;
  description: string;
  outputs: string[];
  useCases: string[];
  approach: string[];
  outcome: string;
  technicalDetail: string;
}

export const services: Service[] = [
  {
    index: "01",
    slug: "apps",
    name: "Mobile & Digital Product Engineering",
    shortName: "Mobile & Digital Products",
    heroTagline: "Apps built like products, not prototypes.",
    description:
      "We build customer-facing apps and platforms around the way your product or business actually works — not around a template.",
    outputs: [
      "iOS & Android apps",
      "Progressive Web Apps",
      "Web applications",
      "SaaS platforms",
      "Membership & multi-role platforms",
    ],
    useCases: [
      "A founder with an idea and no technical team yet",
      "An existing app that has outgrown its original build",
      "A membership or learning product that needs accounts, progress and content to stay in sync",
      "A consumer product that needs to feel premium from the first screen",
    ],
    approach: [
      "Map the product around real user journeys, not a generic template",
      "Design the account/data layer first so sync, offline and growth aren't afterthoughts",
      "Build cross-platform where it genuinely saves time, native where it genuinely matters",
      "Ship to real app stores, not just a staging link",
    ],
    outcome:
      "A product your customers use directly, built to hold real accounts, real data and real growth.",
    technicalDetail:
      "Cross-platform engineering with authenticated accounts, cloud data sync and offline-first behaviour where it matters.",
  },
  {
    index: "02",
    slug: "web",
    name: "Premium Web Platforms & Digital Experiences",
    shortName: "Premium Web Platforms",
    heroTagline: "A front door that behaves like the product it represents.",
    description:
      "Bespoke websites and interactive platforms for brands that need to look and feel like the category leader, not another template.",
    outputs: [
      "Bespoke websites",
      "Interactive web platforms",
      "Launch & product microsites",
      "3D / WebGL experiences where they earn their place",
      "Custom portals",
    ],
    useCases: [
      "A brand relaunch that needs to look nothing like a template site",
      "A product launch that needs its own dedicated experience",
      "A company whose current site undersells what they actually do",
      "A platform that needs a public marketing layer connected to real backend data",
    ],
    approach: [
      "Start from the story you need to tell, then choose the composition that tells it",
      "Keep semantic, accessible DOM for everything that matters to people and search engines",
      "Use spatial/WebGL work only where it strengthens the story — never as decoration",
      "Engineer performance and motion as part of the design, not a fix afterwards",
    ],
    outcome:
      "A digital front door that converts serious visitors and holds up under real scrutiny.",
    technicalDetail:
      "Component-driven front ends, considered motion systems, and spatial/WebGL work used only where it strengthens the story.",
  },
  {
    index: "03",
    slug: "systems",
    name: "Custom Business Systems & Digital Infrastructure",
    shortName: "Business Systems",
    heroTagline: "The operational layer nobody outside your team sees.",
    description:
      "The operational software behind the product — admin tools, portals and automation that replace spreadsheets and disconnected tools.",
    outputs: [
      "Admin systems & dashboards",
      "Client & customer portals",
      "Booking & workflow systems",
      "Automation & AI-assisted workflows",
      "API integrations",
    ],
    useCases: [
      "A team still running the business from spreadsheets and group chats",
      "A growing product that needs a real admin/operations layer",
      "A business with several disconnected tools that should be one system",
      "Repetitive manual work that a workflow could handle automatically",
    ],
    approach: [
      "Map the operational reality first — who does what, where data currently lives",
      "Design a database and API layer built to extend, not be replaced in two years",
      "Automate the repetitive parts, keep humans in control of the judgement calls",
      "Connect it to whatever the business already relies on rather than forcing a migration",
    ],
    outcome:
      "Fewer manual processes, systems that talk to each other, and a business that can scale without adding headcount for admin.",
    technicalDetail:
      "Backend architecture, database design and integration work built to extend rather than be replaced in two years.",
  },
];

export const flagshipService = {
  index: "04",
  name: "Complete Digital Ecosystems",
  tagline: "Website. App. Backend. Database. Admin. Automation. Integrations.",
  description:
    "When a business needs everything connected, we design and build it as one system — not a website team, an app team and a backend team who never talk to each other.",
};
