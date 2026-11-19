"use client";

import { useState } from "react";
import { bookingEvents, CAL_PAGE_ORIGIN, type BookingEventId } from "@/data/booking";
import { openCalPopup } from "@/lib/booking/calEmbed";

/**
 * A booking link that opens the Cal.com popup for one event type. It is a
 * real link to the public Cal.com booking page, so it still works without
 * JavaScript, with a modifier-click, or if the embed script is blocked.
 *
 * Renders nothing when that event's Cal.com link isn't configured
 * (src/data/booking.ts) — the site never shows a dead booking button.
 */
export function BookCallLink({
  event = "intro",
  className = "",
  children,
  onOpen,
}: {
  event?: BookingEventId;
  className?: string;
  children: React.ReactNode;
  /** Called after the popup (or fallback page) opens — e.g. to minimise Chloe. */
  onOpen?: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const calLink = bookingEvents[event].calLink;
  if (!calLink) return null;
  const href = `${CAL_PAGE_ORIGIN}/${calLink}`;

  async function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    try {
      await openCalPopup(calLink!);
    } catch {
      // Embed blocked or offline: open the public booking page instead.
      window.open(href, "_blank", "noopener,noreferrer");
    } finally {
      setBusy(false);
      onOpen?.();
    }
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      aria-busy={busy || undefined}
      data-booking-event={event}
      className={className}
    >
      {children}
    </a>
  );
}
