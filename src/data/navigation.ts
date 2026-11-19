import { services, flagshipService } from "@/data/services";
import { products } from "@/data/products";

export interface NavLink {
  label: string;
  href: string;
}

/**
 * Main navigation: Services | Products | Work | Pricing | About. Products also
 * opens a menu. `wideOnly` links join the desktop pill from 1024px, where there
 * is room beside the logo and Start a Project; they're always in the mobile menu.
 */
export const primaryNav: (NavLink & { menu?: "products"; wideOnly?: boolean })[] = [
  { label: "Services", href: "/services" },
  { label: "Products", href: "/products", menu: "products" },
  { label: "Work", href: "/work" },
  { label: "Pricing", href: "/pricing", wideOnly: true },
  { label: "About", href: "/about" },
];

export const primaryCta: NavLink = {
  label: "Start a Project",
  href: "/start-a-project",
};

export const footerColumns: { title: string; links: NavLink[] }[] = [
  {
    title: "Services",
    links: [
      ...services.map((s) => ({ label: s.shortName, href: `/services/${s.slug}` })),
      { label: flagshipService.name, href: "/services#flagship" },
    ],
  },
  {
    title: "Products",
    links: [
      ...products.map((p) => ({ label: p.name, href: p.href })),
      { label: "All Products", href: "/products" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Work", href: "/work" },
      { label: "Pricing", href: "/pricing" },
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Privacy", href: "/privacy" },
    ],
  },
];
