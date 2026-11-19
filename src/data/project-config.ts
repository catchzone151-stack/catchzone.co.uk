export interface ConfigOption {
  id: string;
  label: string;
  description?: string;
}

/**
 * Step 1. Ids match the service ids in `src/data/pricing.ts`, so Pricing CTAs
 * can preselect them (`/start-a-project?service=premium-website`, or two ids
 * for a combination). `mobile-app`, `business-system`, `complete-ecosystem`
 * and `not-sure` are unchanged from the original form.
 */
export const buildTypeOptions: ConfigOption[] = [
  { id: "premium-website", label: "Premium Website" },
  { id: "web-application", label: "Web Application" },
  { id: "mobile-app", label: "Android & iOS Mobile App" },
  { id: "business-system", label: "Business Platform" },
  { id: "complete-ecosystem", label: "Complete Digital Ecosystem" },
  { id: "not-sure", label: "Not Sure Yet" },
];

/**
 * Retired step-1 values, still accepted by the API (and labelled in the email)
 * so a brief started on a cached older page is never rejected.
 */
export const legacyBuildTypeOptions: ConfigOption[] = [{ id: "web-platform", label: "Web Platform" }];

export const startingPointOptions: ConfigOption[] = [
  { id: "idea", label: "I Have An Idea" },
  { id: "existing-product", label: "Existing Product" },
  { id: "spec-ready", label: "Designs / Specification Ready" },
  { id: "replacing-system", label: "Existing System Needs Replacing" },
  { id: "not-sure", label: "Not Sure Yet" },
];

export const priorityOptions: ConfigOption[] = [
  { id: "premium-design", label: "Premium design" },
  { id: "customer-experience", label: "Customer experience" },
  { id: "launch-speed", label: "Launch speed" },
  { id: "automation", label: "Automation" },
  { id: "internal-efficiency", label: "Internal efficiency" },
  { id: "scalability", label: "Scalability" },
  { id: "connected-systems", label: "Connected systems" },
  { id: "not-sure", label: "Not sure yet" },
];

/**
 * Centralised so commercial strategy can change without touching component code.
 */
export const budgetOptions: ConfigOption[] = [
  { id: "under-10k", label: "Under £10k" },
  { id: "10k-25k", label: "£10k – £25k" },
  { id: "25k-50k", label: "£25k – £50k" },
  { id: "50k-plus", label: "£50k+" },
  { id: "not-sure", label: "Not Sure Yet" },
];

export interface ProjectBrief {
  buildType: string;
  startingPoint: string;
  priorities: string[];
  budget: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  description: string;
  /**
   * Optional: two service ids when the visitor chose a "Better Together"
   * combination on /pricing. Must be an approved combination (validated server-side).
   */
  combination?: string[];
}
