/**
 * Cal.com consultation booking (popup-on-click).
 *
 * Event links are PUBLIC Cal.com booking paths such as "catchzone/intro-call"
 * (no API keys are involved). They are read from build-time environment
 * variables so they can be set in the Replit Secrets/Env pane without a code
 * change. An event with no link is treated as unavailable: every booking
 * button for it is hidden, so the site never publishes a dead booking button.
 *
 *   NEXT_PUBLIC_CAL_INTRO_CALL          CatchZone Introductory Call — 15 minutes
 *   NEXT_PUBLIC_CAL_PROJECT_CONSULTATION CatchZone Project Consultation — 30 minutes
 *   NEXT_PUBLIC_CAL_VOICE_DEMO          CatchZone Voice Demonstration — 20 minutes
 *   NEXT_PUBLIC_CAL_SCHOOL_HR_DEMO      CatchZone School HR Demonstration — 20 minutes
 *
 * NEXT_PUBLIC_* values are inlined at build time: rebuild after changing them.
 * Setup and verification steps: docs/BOOKING_AND_CHLOE.md.
 */

export type BookingEventId = "intro" | "consultation" | "voice-demo" | "school-hr-demo";

export interface BookingEvent {
  id: BookingEventId;
  title: string;
  minutes: number;
  /** Cal.com path, e.g. "catchzone/intro-call"; null when not configured. */
  calLink: string | null;
}

/** "user/event", "team/name/event" — letters, digits, dot, dash, underscore only. */
const CAL_LINK_RE = /^[A-Za-z0-9_.-]+(?:\/[A-Za-z0-9_.-]+){1,2}$/;

/** Accepts "user/event" or a full https://cal.com/user/event URL; anything else → null. */
export function normaliseCalLink(value: string | undefined): string | null {
  if (!value) return null;
  let link = value.trim();
  const url = link.match(/^https:\/\/(?:app\.)?cal\.com\/(.+)$/i);
  if (url) link = url[1]!;
  link = link.replace(/^\/+|\/+$/g, "").split(/[?#]/)[0]!;
  return CAL_LINK_RE.test(link) ? link : null;
}

// Literal process.env access so Next.js inlines the values at build time.
export const bookingEvents: Record<BookingEventId, BookingEvent> = {
  intro: {
    id: "intro",
    title: "CatchZone Introductory Call",
    minutes: 15,
    calLink: normaliseCalLink(process.env.NEXT_PUBLIC_CAL_INTRO_CALL),
  },
  consultation: {
    id: "consultation",
    title: "CatchZone Project Consultation",
    minutes: 30,
    calLink: normaliseCalLink(process.env.NEXT_PUBLIC_CAL_PROJECT_CONSULTATION),
  },
  "voice-demo": {
    id: "voice-demo",
    title: "CatchZone Voice Demonstration",
    minutes: 20,
    calLink: normaliseCalLink(process.env.NEXT_PUBLIC_CAL_VOICE_DEMO),
  },
  "school-hr-demo": {
    id: "school-hr-demo",
    title: "CatchZone School HR Demonstration",
    minutes: 20,
    calLink: normaliseCalLink(process.env.NEXT_PUBLIC_CAL_SCHOOL_HR_DEMO),
  },
};

export const isBookable = (id: BookingEventId) => bookingEvents[id].calLink !== null;

/** Public booking page — the no-JavaScript fallback for every booking button. */
export const CAL_PAGE_ORIGIN = "https://cal.com";
/** Embed origin used by the popup. */
export const CAL_EMBED_ORIGIN = "https://app.cal.com";
export const CAL_EMBED_SCRIPT = "https://app.cal.com/embed/embed.js";
