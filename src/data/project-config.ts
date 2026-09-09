export interface ConfigOption {
  id: string;
  label: string;
  description?: string;
}

export const buildTypeOptions: ConfigOption[] = [
  { id: "mobile-app", label: "Mobile App" },
  { id: "web-platform", label: "Web Platform" },
  { id: "business-system", label: "Business System" },
  { id: "complete-ecosystem", label: "Complete Digital Ecosystem" },
  { id: "not-sure", label: "Not Sure Yet" },
];

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
}
