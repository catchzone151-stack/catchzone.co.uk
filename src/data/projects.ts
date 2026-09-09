export type ProjectStatus = "live" | "in-development";

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
  internalUrl: string;
}

/**
 * Only verified CatchZone products with real, shippable substance live here.
 * Placeholder roadmap pages are represented separately in roadmapCategories —
 * they are not dressed up as case studies.
 */
export const projects: Project[] = [
  {
    slug: "islamquest",
    title: "IslamQuest",
    shortDescription:
      "Structured Islamic learning through quests, quizzes and global challenges.",
    type: "Mobile App",
    status: "live",
    statusLabel: "Live on Google Play · iOS coming April 2026",
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
    platforms: ["Android — Google Play", "iOS — coming April 2026"],
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
    status: "in-development",
    statusLabel: "In development",
    heroAsset: "/assets/images/Lumi/LumiBanner.png",
    capabilities: [
      "Privacy-first data model — no unnecessary personal data collected",
      "Supabase-backed account and data layer",
      "Interface designed specifically for a teenage audience",
    ],
    internalUrl: "/apps/lumi/",
  },
];

export const featuredProject = projects.find((p) => p.featured) ?? projects[0]!;

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
