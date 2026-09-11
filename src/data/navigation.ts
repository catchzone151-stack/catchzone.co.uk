export interface NavLink {
  label: string;
  href: string;
}

export const primaryNav: NavLink[] = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "About", href: "/about" },
];

export const primaryCta: NavLink = {
  label: "Start a Project",
  href: "/start-a-project",
};

export const footerNav: NavLink[] = [
  { label: "Work", href: "/work" },
  { label: "Services", href: "/services" },
  { label: "Mobile & Digital Products", href: "/services/apps" },
  { label: "Premium Web Platforms", href: "/services/web" },
  { label: "Business Systems", href: "/services/systems" },
  { label: "About", href: "/about" },
  { label: "Start a Project", href: "/start-a-project" },
  { label: "Privacy", href: "/privacy" },
];
