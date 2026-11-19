/**
 * CatchZone public starting prices — the single source of truth for the
 * Pricing page, the Services page, Chloe and the Start a Project deep links.
 *
 * Rules (owner-approved): every price is shown with "From"; a starting price
 * is never a final quotation; no delivery times, feature counts, discounts or
 * guarantees. Hosting, subscriptions, developer fees and ongoing maintenance
 * are clarified during quotation. Voice and School HR are products with their
 * own pages and are deliberately not priced here.
 *
 * Service ids double as Start a Project build-type ids (see
 * `src/data/project-config.ts`), so a pricing CTA can preselect the service.
 */

export type ServiceId =
  | "premium-website"
  | "web-application"
  | "mobile-app"
  | "business-system"
  | "complete-ecosystem";

export interface PricedService {
  id: ServiceId;
  /** Anchor on /pricing. */
  anchor: string;
  name: string;
  /** Short label for chips, emails and combinations. */
  shortName: string;
  from: number;
  summary: string;
  deliverablesLabel: string;
  deliverables: string[];
  /** Short supporting line shown under the deliverables. */
  note?: string;
  /** Conditions shown in a disclosure (mobile apps, ecosystem). */
  conditions?: { title: string; items: string[] };
  cta: string;
  flagship?: boolean;
}

export const formatFrom = (amount: number) => `From £${amount.toLocaleString("en-GB")}`;

export const pricedServices: PricedService[] = [
  {
    id: "premium-website",
    anchor: "websites",
    name: "Premium Websites",
    shortName: "Premium Website",
    from: 3500,
    summary:
      "Bespoke websites designed to make a strong impression, communicate your value and turn visitors into enquiries.",
    deliverablesLabel: "Typical deliverables",
    deliverables: [
      "Bespoke responsive design",
      "Key business pages and contact functionality",
      "Search-friendly structure",
      "Deployment and launch support",
    ],
    cta: "Discuss Your Website",
  },
  {
    id: "web-application",
    anchor: "web-applications",
    name: "Custom Web Applications",
    shortName: "Web Application",
    from: 4000,
    summary:
      "Purpose-built applications that run securely in the browser — from customer portals and interactive tools to internal applications.",
    deliverablesLabel: "Typical deliverables",
    deliverables: [
      "Responsive application interface",
      "Defined user journeys and features",
      "Authentication or data storage where included in scope",
      "Deployment to an agreed web address",
    ],
    note: "Runs in any modern browser on desktop, tablet and phone — no Apple or Google app store publication needed.",
    cta: "Discuss Your Web App",
  },
  {
    id: "mobile-app",
    anchor: "mobile-apps",
    name: "Android & iOS Mobile Apps",
    shortName: "Android & iOS App",
    from: 4000,
    summary:
      "Custom mobile applications for Android and iPhone, designed around your users and built for both platforms.",
    deliverablesLabel: "Typical deliverables",
    deliverables: [
      "Agreed starter application scope",
      "Android and iOS builds",
      "Testing on both platforms",
      "Standard store submission preparation and assistance",
    ],
    conditions: {
      title: "App store conditions",
      items: [
        "The starting price covers a straightforward, scoped app, normally built from one shared cross-platform codebase.",
        "Complex features, extensive integrations and advanced backends are quoted separately.",
        "You own and maintain your own active Apple Developer and Google Play Console accounts.",
        "Developer account fees and third-party charges are your responsibility.",
        "CatchZone works through invited access to your accounts — we never take ownership of them.",
        "Store review times and approvals are decided by Apple and Google and can’t be guaranteed.",
      ],
    },
    cta: "Discuss Your Mobile App",
  },
  {
    id: "business-system",
    anchor: "business-platforms",
    name: "Business Platforms & Dashboards",
    shortName: "Business Platform",
    from: 6200,
    summary:
      "Custom operational platforms that bring your people, processes and information together — replacing disconnected tools and repetitive manual work.",
    deliverablesLabel: "Typical deliverables",
    deliverables: [
      "Business dashboards",
      "Defined workflows and user roles",
      "Database-backed functionality",
      "Reporting and integrations as agreed",
    ],
    cta: "Discuss Your Platform",
  },
  {
    id: "complete-ecosystem",
    anchor: "complete-digital-ecosystem",
    name: "Complete Digital Ecosystem",
    shortName: "Complete Digital Ecosystem",
    from: 18000,
    summary:
      "Your website, applications, operational systems and data — engineered to work together as one connected digital ecosystem.",
    deliverablesLabel: "Typical components",
    deliverables: [
      "Premium website or public-facing web experience",
      "Customer-facing web or mobile application",
      "Business administration platform",
      "Shared backend and database",
      "Agreed workflows and integrations",
    ],
    note: "The starting price is for an agreed, defined scope. Complex enterprise requirements, extensive automations and additional integrations are quoted individually.",
    cta: "Plan Your Ecosystem",
    flagship: true,
  },
];

export const serviceById = (id: string) => pricedServices.find((s) => s.id === id);

export interface Combination {
  services: [ServiceId, ServiceId];
  from: number;
  /** Shown first; the rest sit behind "Explore other combinations". */
  popular?: boolean;
}

/** Indicative starting examples for connected builds — not automatic fixed-price discounts. */
export const combinations: Combination[] = [
  { services: ["premium-website", "web-application"], from: 7200, popular: true },
  { services: ["premium-website", "mobile-app"], from: 7200, popular: true },
  { services: ["premium-website", "business-system"], from: 9300, popular: true },
  { services: ["web-application", "mobile-app"], from: 7600 },
  { services: ["web-application", "business-system"], from: 9700 },
  { services: ["mobile-app", "business-system"], from: 9700 },
];

export const combinationKey = (pair: readonly string[]) => pair.join("+");

export const combinationName = (c: Combination) =>
  c.services.map((id) => serviceById(id)!.shortName).join(" + ");

/** Finds an approved combination for two service ids, in either order. */
export function findCombination(ids: readonly string[]): Combination | undefined {
  if (ids.length !== 2) return undefined;
  return combinations.find(
    (c) => (c.services[0] === ids[0] && c.services[1] === ids[1]) || (c.services[0] === ids[1] && c.services[1] === ids[0]),
  );
}

/** Start a Project deep link that preselects a service or an approved combination. */
export const enquiryHref = (ids: readonly ServiceId[]) => `/start-a-project?service=${ids.join(",")}`;

export const pricingFaqs: { q: string; a: string }[] = [
  {
    q: "What does “From” mean?",
    a: "It’s where a clearly defined build of that type starts. Your quote depends on the scope we agree together — the features, content, integrations and platforms involved — so a starting price is a guide, not a final quotation.",
  },
  {
    q: "Can services be combined?",
    a: "Yes. Many projects need more than one solution, such as a website with a customer app, or an app with a business platform behind it. Combined builds get a tailored starting price where shared development reduces duplication.",
  },
  {
    q: "Do you build apps for both Android and iOS?",
    a: "Yes. Our mobile apps are built for both Android and iPhone, normally from one shared cross-platform codebase, and tested on both platforms. If you don’t need app store distribution, a custom web application that runs in the browser may suit you better.",
  },
  {
    q: "Do I need my own developer accounts?",
    a: "For Android and iOS apps, yes. You own and maintain your own Apple Developer and Google Play Console accounts and cover their fees. We work through invited access rather than taking ownership of your accounts, and we prepare and help with standard store submissions — though review times and approvals rest with Apple and Google.",
  },
  {
    q: "Is ongoing maintenance included?",
    a: "Not automatically. Hosting, third-party subscriptions, developer account fees and ongoing support or maintenance depend on what you need, so we agree them clearly during quotation rather than silently including them.",
  },
];
