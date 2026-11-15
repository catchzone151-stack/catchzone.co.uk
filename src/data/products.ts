/**
 * CatchZone's own software products (licensed to organisations), as opposed
 * to Services (bespoke builds for clients). Used by the navigation, footer,
 * the Services page Products section and /products.
 *
 * Status wording must stay factual: Voice has been demonstrated in a separate
 * private evaluation app; School HR is in development ahead of a first pilot.
 */
export type ProductSlug = "voice" | "school-hr";

export interface Product {
  slug: ProductSlug;
  name: string;
  href: string;
  /** One line, used in the navigation dropdown. */
  summary: string;
  /** Short status chip. */
  status: string;
}

export const products: Product[] = [
  {
    slug: "voice",
    name: "CatchZone Voice",
    href: "/voice",
    summary: "Real-time AI voice translation for multilingual customer conversations.",
    status: "Private demonstrations",
  },
  {
    slug: "school-hr",
    name: "CatchZone School HR",
    href: "/school-hr",
    summary: "Staff requests, approvals and HR workflows for schools.",
    status: "In development · Pilot stage",
  },
];

/** Routes that belong to the Products section (for active navigation states). */
export function isProductsPath(pathname: string): boolean {
  return (
    pathname === "/products" ||
    products.some((p) => pathname === p.href || pathname.startsWith(`${p.href}/`))
  );
}
