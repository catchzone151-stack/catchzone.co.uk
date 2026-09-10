export type ProjectStatus = "live" | "in-development" | "product-lab";

/**
 * Per-project metallic/material accent used to theme the shared device-frame
 * system (ScreenCascade, BannerShowcase, BrandDeviceArt) — restrained
 * product-specific colour while every frame stays inside the same CatchZone
 * chassis system. Never used to imply a real screenshot exists.
 */
export interface AccentTheme {
  /** Chassis bezel gradient, dark end first. */
  chassis: [string, string];
  /** Inset ring / hardware-edge highlight colour (rgba). */
  ring: string;
  /** Ambient glow colour behind the device (rgba, low alpha). */
  glow: string;
  /** Solid, full-opacity accent colour for icon strokes / small details. */
  icon: string;
}

/** Abstract glyph id for BrandDeviceArt — never a literal app screenshot. */
export type BrandGlyph = "cycle" | "shield-check" | "in-progress";

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
  /** Product-specific device-frame accent (see AccentTheme). */
  accent?: AccentTheme;
  /** Abstract brand glyph shown in BrandDeviceArt when no screenshots exist. */
  brandGlyph?: BrandGlyph;
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
    accent: {
      chassis: ["#2b2b2f", "#0d0d0f"],
      ring: "rgba(212,175,55,0.35)",
      glow: "rgba(212,175,55,0.12)",
      icon: "#d4af37",
    },
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
    accent: {
      chassis: ["#3a2a2e", "#1a1214"],
      ring: "rgba(247,202,208,0.4)",
      glow: "rgba(183,110,121,0.16)",
      icon: "#f7cad0",
    },
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
    heroAsset: "/assets/images/cscs/CSCSBanner.png",
    platforms: ["Android — Google Play", "iOS — coming October 2026"],
    capabilities: [
      "520-question CSCS / CITB HS&E practice bank",
      "Timed mock exam mode simulating the real CSCS Operatives Test (50 questions / 45 minutes)",
      "Topic-by-topic practice and mistake review with bookmarking",
      "Exam-readiness tracking — accuracy, questions practised and mock exams passed",
      "CSCS card route reference (CSCS MAP)",
      "Part of CatchZone's Construction & Trades product line",
    ],
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.catchzone.cscs",
    accent: {
      chassis: ["#232a35", "#0a0d12"],
      ring: "rgba(142,202,230,0.4)",
      glow: "rgba(27,42,74,0.2)",
      icon: "#8ecae6",
    },
    brandGlyph: "shield-check",
  },
  {
    slug: "rawdah-cycle",
    title: "Rawdah Cycle",
    shortDescription: "A CatchZone product, live on Google Play.",
    type: "Mobile App",
    status: "live",
    statusLabel: "Live on Google Play · iOS coming October 2026",
    featured: true,
    heroAsset: "/assets/images/rawdah-cycle/RawdahCycleBanner.png",
    platforms: ["Android — Google Play", "iOS — coming October 2026"],
    capabilities: [
      "Cycle and phase tracking — period, ovulation and fertile window",
      "Mood, symptom and energy logging with trend charts",
      "Personalised wellbeing guidance content",
      "Wider wellbeing tracking alongside cycle data (e.g. skin and hair)",
    ],
    playStoreUrl: "https://play.google.com/store/apps/details?id=com.catchzone.rawdahcycle",
    accent: {
      chassis: ["#1f3320", "#0a120a"],
      ring: "rgba(240,226,182,0.4)",
      glow: "rgba(79,122,61,0.18)",
      icon: "#f0e2b6",
    },
    brandGlyph: "cycle",
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
    accent: {
      chassis: ["#23242b", "#0a0a0d"],
      ring: "rgba(110,98,229,0.35)",
      glow: "rgba(110,98,229,0.16)",
      icon: "#8a80ec",
    },
    brandGlyph: "in-progress",
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
