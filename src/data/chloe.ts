/**
 * Chloe — CatchZone's guided website assistant.
 *
 * A deterministic, scripted conversation: selectable answers, prepared FAQ
 * responses and simple keyword recognition. There is no AI model, no external
 * chatbot service and no data storage. Prices come from `src/data/pricing.ts`
 * so Chloe can never quote a different figure from the Pricing page.
 *
 * Chloe's portrait is the existing team artwork (public/team/chloe-portrait-*),
 * cropped to her head and shoulders for the small avatar — never regenerated.
 */

import type { BookingEventId } from "@/data/booking";
import { combinationName, combinations, formatFrom, serviceById, type ServiceId } from "@/data/pricing";

export type ChloeNodeId =
  | "start"
  | "service:premium-website"
  | "service:web-application"
  | "service:mobile-app"
  | "service:business-system"
  | "service:complete-ecosystem"
  | "questions"
  | "book"
  | "fallback"
  | `faq:${FaqId}`;

export type FaqId =
  | "prices"
  | "websites"
  | "web-vs-mobile"
  | "android-ios"
  | "developer-accounts"
  | "platforms"
  | "ecosystem"
  | "combinations"
  | "timescales"
  | "support"
  | "booking"
  | "voice"
  | "school-hr";

/** What an enquiry from Chloe is about — whitelisted again by the API. */
export type LeadTopic = ServiceId | "combination" | "voice" | "school-hr" | "call" | "general";

export type ChloeAction =
  | { kind: "go"; label: string; node: ChloeNodeId }
  | { kind: "link"; label: string; href: string }
  | { kind: "lead"; label: string; topic: LeadTopic }
  | { kind: "book"; label: string; event: BookingEventId };

export interface ChloeNode {
  /** Chloe's reply; each string is one paragraph. */
  say: string[];
  actions: ChloeAction[];
}

export const CHLOE_GREETING = "Hi, I'm Chloe, CatchZone's digital assistant. How can I help you today?";

export const LEAD_TOPIC_LABELS: Record<LeadTopic, string> = {
  "premium-website": "Premium Website",
  "web-application": "Custom Web Application",
  "mobile-app": "Android & iOS Mobile App",
  "business-system": "Business Platform & Dashboards",
  "complete-ecosystem": "Complete Digital Ecosystem",
  combination: "Combined build",
  voice: "CatchZone Voice",
  "school-hr": "CatchZone School HR",
  call: "Call request",
  general: "General question",
};

export const TIMESCALE_OPTIONS = [
  { id: "asap", label: "As soon as possible" },
  { id: "1-3-months", label: "Within 1–3 months" },
  { id: "3-6-months", label: "In 3–6 months" },
  { id: "exploring", label: "Just exploring" },
] as const;

export const BUDGET_OPTIONS = [
  { id: "under-5k", label: "Under £5k" },
  { id: "5k-10k", label: "£5k – £10k" },
  { id: "10k-25k", label: "£10k – £25k" },
  { id: "25k-plus", label: "£25k+" },
  { id: "not-sure", label: "Not sure yet" },
] as const;

const price = (id: ServiceId) => formatFrom(serviceById(id)!.from);

const START_OVER_TOPICS: ChloeAction[] = [
  { kind: "go", label: "Ask another question", node: "questions" },
];

function serviceNode(id: ServiceId, say: string[], extra: ChloeAction[] = []): ChloeNode {
  const s = serviceById(id)!;
  return {
    say: [...say, `${s.name} start ${price(id).replace("From", "from")}. Your quote follows a conversation about the scope you need.`],
    actions: [
      { kind: "lead", label: "Leave my details", topic: id },
      { kind: "link", label: s.cta, href: `/start-a-project?service=${id}` },
      { kind: "book", label: "Book a call", event: "intro" },
      { kind: "link", label: "See pricing", href: `/pricing#${s.anchor}` },
      ...extra,
      ...START_OVER_TOPICS,
    ],
  };
}

const comboLines = combinations.map((c) => `${combinationName(c)}: ${formatFrom(c.from).replace("From", "from")}`);

export const CHLOE_NODES: Record<ChloeNodeId, ChloeNode> = {
  start: {
    say: [CHLOE_GREETING],
    actions: [
      { kind: "go", label: "Build a website", node: "service:premium-website" },
      { kind: "go", label: "Build a web application", node: "service:web-application" },
      { kind: "go", label: "Build an Android & iOS app", node: "service:mobile-app" },
      { kind: "go", label: "Build a business platform", node: "service:business-system" },
      { kind: "go", label: "Complete Digital Ecosystem", node: "service:complete-ecosystem" },
      { kind: "go", label: "Ask a question", node: "questions" },
      { kind: "go", label: "Book a call", node: "book" },
    ],
  },

  "service:premium-website": serviceNode("premium-website", [
    "We design and build bespoke websites that make a strong impression, explain what you do clearly and turn visitors into enquiries — responsive design, key business pages, a search-friendly structure and launch support.",
  ]),
  "service:web-application": serviceNode(
    "web-application",
    [
      "A custom web application runs securely in the browser — customer portals, booking or quoting tools, member areas and internal apps. People use it on desktop, tablet or phone without downloading anything, and it doesn’t need publishing through the Apple or Google app stores.",
    ],
    [{ kind: "go", label: "Web app or mobile app?", node: "faq:web-vs-mobile" }],
  ),
  "service:mobile-app": serviceNode(
    "mobile-app",
    [
      "We build custom apps for Android and iPhone, normally from one shared cross-platform codebase, tested on both platforms, with help preparing standard store submissions.",
      "You’ll need your own Apple Developer and Google Play Console accounts — we work through invited access, never ownership. Complex features, extensive integrations and advanced backends are quoted separately.",
    ],
    [{ kind: "go", label: "Developer accounts", node: "faq:developer-accounts" }],
  ),
  "service:business-system": serviceNode("business-system", [
    "Business platforms bring your people, processes and information together — dashboards, workflows with user roles, database-backed functionality, and reporting and integrations as agreed. They’re ideal for replacing spreadsheets, disconnected tools and repetitive manual work.",
  ]),
  "service:complete-ecosystem": serviceNode("complete-ecosystem", [
    "A Complete Digital Ecosystem is our flagship service: your website, customer-facing app, business administration platform and shared backend engineered together as one connected system.",
    "The starting price covers an agreed, defined scope. Complex enterprise requirements, extensive automations and additional integrations are quoted individually.",
  ]),

  questions: {
    say: ["Of course. Pick a topic below, or type your question and I’ll find the closest answer."],
    actions: [
      { kind: "go", label: "Starting prices", node: "faq:prices" },
      { kind: "go", label: "Web app or mobile app?", node: "faq:web-vs-mobile" },
      { kind: "go", label: "Combining services", node: "faq:combinations" },
      { kind: "go", label: "How long does a project take?", node: "faq:timescales" },
      { kind: "go", label: "Ongoing support", node: "faq:support" },
      { kind: "go", label: "Developer accounts", node: "faq:developer-accounts" },
      { kind: "go", label: "CatchZone Voice", node: "faq:voice" },
      { kind: "go", label: "School HR", node: "faq:school-hr" },
    ],
  },

  book: {
    say: [
      "Happy to arrange a call. Choose the conversation that suits you best — the booking calendar opens right here on the page.",
    ],
    actions: [
      { kind: "book", label: "Introductory call · 15 min", event: "intro" },
      { kind: "book", label: "Project consultation · 30 min", event: "consultation" },
      { kind: "book", label: "CatchZone Voice demo · 20 min", event: "voice-demo" },
      { kind: "book", label: "School HR demo · 20 min", event: "school-hr-demo" },
      { kind: "lead", label: "Ask CatchZone to contact me", topic: "call" },
    ],
  },

  fallback: {
    say: [
      "I’m a guided assistant, so I don’t understand everything yet — sorry about that. Try one of these topics, or leave your details and someone from CatchZone will reply personally.",
    ],
    actions: [
      { kind: "lead", label: "Leave my details", topic: "general" },
      { kind: "go", label: "Browse topics", node: "questions" },
      { kind: "go", label: "Book a call", node: "book" },
    ],
  },

  "faq:prices": {
    say: [
      `Our starting prices: Premium Websites ${price("premium-website").toLowerCase()}, Custom Web Applications ${price("web-application").toLowerCase()}, Android & iOS Mobile Apps ${price("mobile-app").toLowerCase()}, Business Platforms & Dashboards ${price("business-system").toLowerCase()}, and a Complete Digital Ecosystem ${price("complete-ecosystem").toLowerCase()}.`,
      "“From” is where a clearly defined build starts — your quote depends on the scope we agree together.",
    ],
    actions: [
      { kind: "link", label: "View pricing", href: "/pricing" },
      { kind: "go", label: "Combining services", node: "faq:combinations" },
      { kind: "lead", label: "Request a quote", topic: "general" },
      ...START_OVER_TOPICS,
    ],
  },
  "faq:websites": {
    say: [
      `We build bespoke websites rather than templates — company and brand sites, product and launch sites, and sites connected to portals or booking systems. Premium Websites start ${price("premium-website").toLowerCase()}.`,
    ],
    actions: [
      { kind: "go", label: "Tell me more", node: "service:premium-website" },
      { kind: "link", label: "See our work", href: "/work" },
      ...START_OVER_TOPICS,
    ],
  },
  "faq:web-vs-mobile": {
    say: [
      "A web application runs in the browser on any device, updates instantly for everyone and doesn’t need the app stores — great for portals, tools and internal systems.",
      "A mobile app is installed from the App Store and Google Play, and suits products people open often or that need device features. Both start from £4,000, and many projects use both.",
    ],
    actions: [
      { kind: "go", label: "Web applications", node: "service:web-application" },
      { kind: "go", label: "Android & iOS apps", node: "service:mobile-app" },
      { kind: "go", label: "Combining services", node: "faq:combinations" },
    ],
  },
  "faq:android-ios": {
    say: [
      "Yes — our mobile apps are built for both Android and iPhone, normally from one shared cross-platform codebase, and tested on both platforms before store submission.",
    ],
    actions: [
      { kind: "go", label: "Mobile app details", node: "service:mobile-app" },
      { kind: "go", label: "Developer accounts", node: "faq:developer-accounts" },
      ...START_OVER_TOPICS,
    ],
  },
  "faq:developer-accounts": {
    say: [
      "For Android and iOS apps you own and maintain your own Apple Developer and Google Play Console accounts, and the account fees and any third-party charges are yours. We work through invited access rather than taking ownership of your accounts.",
      "We prepare and help with standard store submissions, but review times and approvals are decided by Apple and Google, so they can’t be guaranteed.",
    ],
    actions: [
      { kind: "go", label: "Mobile app details", node: "service:mobile-app" },
      ...START_OVER_TOPICS,
    ],
  },
  "faq:platforms": {
    say: [
      `Business platforms and dashboards replace spreadsheets and disconnected tools with one system built around how your team works — roles, workflows, data, reporting and integrations. They start ${price("business-system").toLowerCase()}.`,
    ],
    actions: [
      { kind: "go", label: "Tell me more", node: "service:business-system" },
      ...START_OVER_TOPICS,
    ],
  },
  "faq:ecosystem": {
    say: [
      `A Complete Digital Ecosystem connects your website, apps, business platform and data as one system, sharing a single backend and database. It starts ${price("complete-ecosystem").toLowerCase()} for an agreed, defined scope.`,
    ],
    actions: [
      { kind: "go", label: "Tell me more", node: "service:complete-ecosystem" },
      ...START_OVER_TOPICS,
    ],
  },
  "faq:combinations": {
    say: [
      "Yes, services can be combined into one connected build, with a tailored starting price where shared development reduces duplication. Some examples:",
      ...comboLines,
      "These are scoped starting examples rather than fixed-price packages.",
    ],
    actions: [
      { kind: "link", label: "Explore combinations", href: "/pricing#better-together" },
      { kind: "lead", label: "Discuss a combined build", topic: "combination" },
      ...START_OVER_TOPICS,
    ],
  },
  "faq:timescales": {
    say: [
      "Timing depends on scope — the features, content, integrations and platforms involved — so we don’t quote fixed delivery times up front. Once we understand what you need, we’ll agree a realistic plan with you before work starts.",
    ],
    actions: [
      { kind: "lead", label: "Discuss my project", topic: "general" },
      { kind: "go", label: "Book a call", node: "book" },
      ...START_OVER_TOPICS,
    ],
  },
  "faq:support": {
    say: [
      "Yes, we can support your product after launch. Ongoing support, maintenance, hosting and third-party subscriptions depend on what you need, so we agree them clearly as part of your quote rather than silently including them.",
    ],
    actions: [
      { kind: "lead", label: "Ask about support", topic: "general" },
      ...START_OVER_TOPICS,
    ],
  },
  "faq:booking": {
    say: ["You can book a short call with CatchZone online — choose an introductory call or a fuller project consultation."],
    actions: [{ kind: "go", label: "Book a call", node: "book" }, ...START_OVER_TOPICS],
  },
  "faq:voice": {
    say: [
      "CatchZone Voice is our real-time voice translation product for businesses that speak with customers in other languages. The Voice pages explain how it works and the languages it supports.",
    ],
    actions: [
      { kind: "link", label: "Explore CatchZone Voice", href: "/voice" },
      { kind: "book", label: "Book a Voice demo", event: "voice-demo" },
      { kind: "lead", label: "Ask about Voice", topic: "voice" },
      ...START_OVER_TOPICS,
    ],
  },
  "faq:school-hr": {
    say: [
      "CatchZone School HR is our HR and staff management software designed for schools. The School HR page covers its modules and plans.",
    ],
    actions: [
      { kind: "link", label: "Explore School HR", href: "/school-hr" },
      { kind: "book", label: "Book a School HR demo", event: "school-hr-demo" },
      { kind: "lead", label: "Ask about School HR", topic: "school-hr" },
      ...START_OVER_TOPICS,
    ],
  },
};

/**
 * Keyword recognition for typed questions. Each phrase scores its node;
 * multi-word phrases score higher than single words. Deliberately simple and
 * predictable — anything unrecognised gets the honest fallback.
 */
const KEYWORDS: [ChloeNodeId, string[]][] = [
  ["faq:prices", ["price", "prices", "pricing", "cost", "costs", "how much", "quote", "budget", "fee", "fees", "rate", "rates", "£", "cheap", "expensive"]],
  ["faq:combinations", ["combine", "combined", "combination", "combinations", "bundle", "package", "packages", "together", "both a", "website and app", "website and an app"]],
  ["faq:web-vs-mobile", ["web app vs", "web or mobile", "web app or", "difference", "pwa", "versus", " vs "]],
  ["faq:developer-accounts", ["developer account", "apple developer", "play console", "google play account", "app store account", "own account"]],
  ["faq:android-ios", ["android", "ios", "iphone", "both platforms", "cross platform", "cross-platform", "app store", "play store"]],
  ["service:mobile-app", ["mobile app", "phone app", "native app", "app", "apps"]],
  ["service:web-application", ["web app", "web application", "portal", "browser", "saas", "booking system", "member area", "members area"]],
  ["faq:websites", ["website", "web site", "site", "landing page", "redesign", "seo"]],
  ["faq:platforms", ["dashboard", "dashboards", "platform", "crm", "internal system", "spreadsheet", "spreadsheets", "workflow", "admin", "back office", "automation"]],
  ["faq:ecosystem", ["ecosystem", "everything connected", "all connected", "full system", "connected system", "end to end", "end-to-end"]],
  ["faq:timescales", ["how long", "timescale", "timescales", "timeline", "deadline", "weeks", "months", "when can", "turnaround", "delivery time", "how quickly", "fast"]],
  ["faq:support", ["support", "maintenance", "maintain", "hosting", "updates", "after launch", "aftercare", "bug fix", "bugs"]],
  ["book", ["book", "booking a call", "call", "meeting", "consultation", "speak to", "talk to", "chat with someone", "appointment", "phone"]],
  ["faq:voice", ["voice", "translation", "translate", "interpreter", "languages", "soniox"]],
  ["faq:school-hr", ["school", "schools", "hr", "staff", "teachers", "academy", "trust"]],
];

export function matchQuestion(input: string): ChloeNodeId {
  const text = ` ${input.toLowerCase().replace(/[^a-z0-9£&+\s-]/g, " ").replace(/\s+/g, " ")} `;
  let best: ChloeNodeId = "fallback";
  let bestScore = 0;
  for (const [node, phrases] of KEYWORDS) {
    let score = 0;
    for (const phrase of phrases) {
      const p = phrase.startsWith(" ") || phrase === "£" ? phrase : ` ${phrase}`;
      if (text.includes(p)) score += phrase.trim().includes(" ") ? 2 : 1;
    }
    if (score > bestScore) {
      best = node;
      bestScore = score;
    }
  }
  return best;
}

/** First-name-friendly label for the user's own bubble when they pick an action. */
export const actionEcho = (action: ChloeAction) => action.label.replace(/ · .*$/, "");

/** Shown on the booking step when no Cal.com event is configured yet — never a dead button. */
export const BOOKING_UNAVAILABLE =
  "Online booking isn’t open just yet. Leave your details and someone from CatchZone will get in touch to arrange a call at a time that suits you.";
