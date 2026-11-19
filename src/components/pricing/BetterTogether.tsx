"use client";

import Link from "next/link";
import { useId, useState } from "react";
import { combinations, combinationKey, enquiryHref, formatFrom, serviceById, type Combination } from "@/data/pricing";

function Row({ combo }: { combo: Combination }) {
  const [a, b] = combo.services.map((id) => serviceById(id)!.shortName);
  return (
    <li className="grid grid-cols-[1fr_auto] items-center gap-x-6 gap-y-2 px-5 py-5 sm:grid-cols-[1fr_auto_auto] md:px-7">
      <p className="col-span-2 font-display text-base font-bold text-ink sm:col-span-1 md:text-lg">
        {a} <span className="text-accent-cyan" aria-hidden="true">+</span>
        <span className="sr-only">plus</span> {b}
      </p>
      <p className="text-sm text-ink">
        <span className="mono text-[11px] uppercase tracking-wider text-ink-faint">From</span>{" "}
        <span className="font-semibold">{formatFrom(combo.from).replace("From ", "")}</span>
      </p>
      <Link
        href={enquiryHref(combo.services)}
        className="inline-flex items-center gap-2 justify-self-end rounded-full border border-line px-4 py-2 text-sm font-semibold text-ink transition-colors hover:border-accent-cyan hover:text-accent-cyan"
      >
        Enquire
        <span className="sr-only"> about {a} plus {b}</span>
        <span aria-hidden="true">→</span>
      </Link>
    </li>
  );
}

/**
 * "Better Together": three popular combinations, with the rest one click away.
 * Each enquiry passes both services to Start a Project.
 */
export function BetterTogether() {
  const [expanded, setExpanded] = useState(false);
  const listId = useId();
  const popular = combinations.filter((c) => c.popular);
  const others = combinations.filter((c) => !c.popular);

  return (
    <div>
      <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
        {popular.map((c) => (
          <Row key={combinationKey(c.services)} combo={c} />
        ))}
      </ul>
      <ul id={listId} hidden={!expanded} className="mt-3 divide-y divide-line rounded-2xl border border-line bg-surface">
        {others.map((c) => (
          <Row key={combinationKey(c.services)} combo={c} />
        ))}
      </ul>
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={listId}
        onClick={() => setExpanded((v) => !v)}
        className="mt-5 inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-accent-cyan"
      >
        {expanded ? "Show fewer combinations" : "Explore other combinations"}
        <svg
          viewBox="0 0 12 12"
          className={`h-3 w-3 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  );
}
