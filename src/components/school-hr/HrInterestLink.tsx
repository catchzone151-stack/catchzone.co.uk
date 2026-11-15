"use client";

import type { Interest } from "@/data/schoolHr";

export const HR_INTEREST_EVENT = "cz-hr-interest";

/**
 * Link to the School HR enquiry form that carries the chosen package or area
 * of interest. With JavaScript it pre-selects the form field in place and
 * scrolls to it; without JavaScript the `?interest=` query does the same on load.
 */
export function HrInterestLink({
  interest,
  className,
  children,
}: {
  interest: Interest;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={`/school-hr?interest=${interest}#school-hr-contact`}
      className={className}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        window.dispatchEvent(new CustomEvent<Interest>(HR_INTEREST_EVENT, { detail: interest }));
        const target = document.getElementById("school-hr-contact");
        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        target?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
        history.replaceState(null, "", `?interest=${interest}#school-hr-contact`);
      }}
    >
      {children}
    </a>
  );
}
