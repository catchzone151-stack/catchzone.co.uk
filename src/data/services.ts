export interface ServiceOutput {
  label: string;
}

export interface Service {
  index: string;
  slug: "apps" | "web" | "systems";
  name: string;
  shortName: string;
  description: string;
  outputs: string[];
  outcome: string;
  technicalDetail: string;
}

export const services: Service[] = [
  {
    index: "01",
    slug: "apps",
    name: "Mobile & Digital Product Engineering",
    shortName: "Mobile & Digital Products",
    description:
      "We build customer-facing apps and platforms around the way your product or business actually works — not around a template.",
    outputs: [
      "iOS & Android apps",
      "Progressive Web Apps",
      "Web applications",
      "SaaS platforms",
      "Membership & multi-role platforms",
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
    description:
      "Bespoke websites and interactive platforms for brands that need to look and feel like the category leader, not another template.",
    outputs: [
      "Bespoke websites",
      "Interactive web platforms",
      "Launch & product microsites",
      "3D / WebGL experiences where they earn their place",
      "Custom portals",
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
    description:
      "The operational software behind the product — admin tools, portals and automation that replace spreadsheets and disconnected tools.",
    outputs: [
      "Admin systems & dashboards",
      "Client & customer portals",
      "Booking & workflow systems",
      "Automation & AI-assisted workflows",
      "API integrations",
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
