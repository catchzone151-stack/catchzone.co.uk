export type ProjectStatus = "live" | "in-development" | "product-lab";

export interface Project {
  slug: string;
  title: string;
  shortDescription: string;
  type: string;
  status: ProjectStatus;
  statusLabel: string;
  featured?: boolean;
  heroAsset?: string;
  screenshots?: string[];
  platforms?: string[];
  capabilities: string[];
  challenge?: string;
  build?: string;
  technicalHighlights?: string[];
  liveUrl?: string;
  appStoreUrl?: string;
  playStoreUrl?: string;
  internalUrl?: string;
  /** Brand colour pair used for an honest gradient composition when no
   * screenshot assets are available yet — never presented as a screenshot. */
  brandGradient?: [string, string];
}

const STATUS_LABEL: Record<ProjectStatus, string> = {
  live: "Live",
  "in-development": "In Development",
  "product-lab": "Product Lab",
};

export { STATUS_LABEL };

/**
 * The principal builds CatchZone shows as proof. Every field here is either
 * verified project fact or omitted — nothing is invented to fill a gap.
 * Status taxonomy: live / in-development / product-lab (named but not yet
 * publicly detailed) — see STATUS_LABEL.
 */
export const projects: Project[] = [
  {
    slug: "islamquest",
    title: "IslamQuest",
    shortDescription:
      "Structured Islamic learning through quests, quizzes and global challenges.",
    type: "Mobile App",
    status: "live",
    statusLabel: "Live on Google Play · iOS coming October 2026",
    featured: true,
    heroAsset: "/assets/images/islamquest/IslamQuestBanner.png",
    screenshots: [
      "/assets/images/islamquest/1_SS.png",
      "/assets/images/islamquest/2_SS.png",
      "/assets/images/islamquest/3_SS.png",
      "/assets/images/islamquest/4_SS.png",
      "/assets/images/islamquest/5_SS.png",
      "/assets/images/islamquest/6_SS.png",
      "/assets/images/islamquest/7_SS.png",
      "/assets/images/islamquest/8_SS.png",
    ],
    platforms: ["Android — Google Play", "iOS — coming October 2026"],
    capabilities: [
      "Cross-platform mobile engineering",
      "Supabase-backed accounts, sync and premium entitlements",
      "Gamified learning system (XP, streaks, leaderboards)",
      "Offline-first lesson & quiz content",
      "Social features — friends, 1v1 challenges, global events",
    ],
    challenge:
      "Islamic learning content is widely available but rarely structured for consistent, motivating daily study — especially for a mobile-first, global audience spanning children through adults.",
    build:
      "A full mobile learning product: structured lesson pathways, an offline-capable quiz engine, a social layer (friends, streaks, leaderboards, 1v1 and global challenges), and a premium tier with cross-device progress sync — all backed by a secure account and data layer.",
    technicalHighlights: [
      "Supabase for authentication and encrypted data storage",
      "Offline-first content so lessons and quizzes work without a connection",
      "No ads, no tracking, no third-party ad networks",
    ],
    playStoreUrl:
      "https://play.google.com/store/apps/details?id=com.islamquest.app&hl=en_GB",
    internalUrl: "/apps/islamquest/",
  },
  {
    slug: "lumi",
    title: "Lumi",
    shortDescription:
      "A privacy-safe period tracker designed for teenagers.",
    type: "Mobile App",
    status: "live",
    statusLabel: "Live on Google Play · iOS coming October 2026",
    featured: true,
    heroAsset: "/assets/images/Lumi/LumiBanner.png",
    platforms: ["Android — Google Play", "iOS — coming October 2026"],
    capabilities: [
      "Privacy-first data model — no unnecessary personal data collected",
      "Supabase-backed account and data layer",
      "Interface designed specifically for a teenage audience",
      "No ads, no tracking, no third-party data sharing",
    ],
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.catchzone.lumi",
    internalUrl: "/apps/lumi/",
  },
  {
    slug: "cscs",
    title: "IEH: CSCS Test Prep",
    shortDescription:
      "Exam preparation for the CSCS / CITB Health, Safety & Environment test and CSCS card routes.",
    type: "Mobile App",
    status: "live",
    statusLabel: "Live on Google Play · iOS coming October 2026",
    featured: true,
    platforms: ["Android — Google Play", "iOS — coming October 2026"],
    capabilities: [
      "CSCS / CITB HS&E test question practice",
      "CSCS card route reference (CSCS MAP)",
      "Part of CatchZone's Construction & Trades product line",
    ],
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.catchzone.cscs",
    internalUrl: "/apps/cscs-citb-hse/",
    brandGradient: ["#0b3d91", "#8ecae6"],
  },
  {
    slug: "rawdah-cycle",
    title: "Rawdah Cycle",
    shortDescription: "A CatchZone product, live on Google Play.",
    type: "Mobile App",
    status: "live",
    statusLabel: "Live on Google Play · iOS coming October 2026",
    featured: true,
    platforms: ["Android — Google Play", "iOS — coming October 2026"],
    capabilities: [],
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.catchzone.rawdahcycle",
    brandGradient: ["#4c7a3d", "#f4ecd8"],
  },
  {
    slug: "villagefront",
    title: "VillageFront",
    shortDescription: "A family organisation / family admin platform.",
    type: "Mobile App",
    status: "in-development",
    statusLabel: "In Development",
    featured: true,
    capabilities: [],
  },
];

export const featuredProjects = projects.filter((p) => p.featured);
export const featuredProject = featuredProjects[0] ?? projects[0]!;

export interface RoadmapCategory {
  name: string;
  description: string;
  href: string;
}

/**
 * Real placeholder categories that already exist in production, honestly
 * labelled as roadmap items rather than finished work.
 */
export const roadmapCategories: RoadmapCategory[] = [
  {
    name: "Construction & Trades",
    description: "Exam prep and business tools for construction, safety and trades — including TradesFlow, CSCS/CITB HS&E and CSCS MAP.",
    href: "/apps/construction-trades/",
  },
  {
    name: "Security Licensing",
    description: "Licensing and exam prep for private security roles, including SIA Door Supervisor.",
    href: "/apps/security-licensing/",
  },
  {
    name: "Global Certifications",
    description: "Career-focused prep for globally recognised certifications.",
    href: "/apps/global-certifications/",
  },
  {
    name: "India Exam Prep",
    description: "Entrance and public exam prep for Indian learners.",
    href: "/apps/india-exam-prep/",
  },
  {
    name: "Philippines Exam Prep",
    description: "Professional and civil service prep for the Philippines.",
    href: "/apps/philippines-exam-prep/",
  },
  {
    name: "West Africa Exam Prep",
    description: "Study tools for major school and public exams in West Africa.",
    href: "/apps/west-africa-exam-prep/",
  },
  {
    name: "Brazil Exam Prep",
    description: "Exam prep for major Brazilian academic and professional paths.",
    href: "/apps/brazil-exam-prep/",
  },
  {
    name: "Middle East Exam Prep",
    description: "Language and licensing prep tailored to Middle East audiences.",
    href: "/apps/middle-east-exam-prep/",
  },
];
