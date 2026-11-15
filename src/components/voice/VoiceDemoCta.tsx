"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { DemoStatusResponse } from "@/lib/voice/types";

/**
 * Voice demonstration CTA driven by the SERVER's readiness check
 * (`GET /api/voice/status` → `getVoiceDemoConfig()`: kill switch, credentials,
 * durable limits and spend-control confirmation). It is not a client flag:
 * while the public demo is paused — or the status can't be confirmed — it
 * offers "Book a Demonstration" (the default, also server-rendered); once the
 * owner activates the demo and every prerequisite passes, it switches to the
 * live-trial wording automatically, with no code change.
 */
export function VoiceDemoCta({
  className,
  liveLabel = "Try the live demo",
  bookLabel = "Book a Demonstration",
  bookHref = "/voice#voice-contact",
  liveHref = "/voice#studio",
}: {
  className?: string;
  liveLabel?: string;
  bookLabel?: string;
  bookHref?: string;
  liveHref?: string;
}) {
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/voice/status", { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<DemoStatusResponse>) : null))
      .then((s) => {
        if (!cancelled && s && s.available === true) setLive(true);
      })
      .catch(() => {
        /* unknown status → keep "Book a Demonstration" */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Link href={live ? liveHref : bookHref} className={className} data-demo-state={live ? "live" : "book"}>
      {live ? liveLabel : bookLabel}
      <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}
