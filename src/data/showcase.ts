import type { DeviceKind } from "@/components/showcase/DeviceFrame";

/**
 * The CatchZone concept showcase — seven fictional private/internal
 * business systems supplied as a final approved asset pack
 * (docs/CATCHZONE_SHOWCASE_DROP.md) to demonstrate CatchZone's range across
 * different industries. These are concept work, not real clients — keep
 * clearly distinct from `projects.ts` (CatchZone's own real products) and
 * `clientWork.ts` (real client engagements like Blossom/FDE).
 *
 * Every image, copy line and feature below is sourced directly from the
 * supplied CLAUDE-HANDOFF.md files — nothing here is invented. Device
 * framing (`frame` / `cardFrame`) is presentation only and is chosen per
 * docs/CATCHZONE_REFINEMENT_BRIEF.md's device-variety requirement — it
 * never implies the underlying screenshot changed.
 */

export interface ShowcaseAccent {
  /** Primary structural/brand colour (hex). */
  primary: string;
  /** Secondary accent colour used for CTAs/highlights (hex). */
  accent: string;
  /** Ambient background glow (rgba, low alpha). */
  glow: string;
  /** Border/highlight ring colour (rgba). */
  ring: string;
}

export type ShowcaseDevice = "desktop" | "tablet" | "mobile";

export interface ShowcaseImage {
  src: string;
  alt: string;
  device: ShowcaseDevice;
  width: number;
  height: number;
}

export type ShowcaseSectionVariant =
  | "hero"
  | "wide"
  | "duo"
  | "device"
  | "split"
  | "closing";

export interface ShowcaseSection {
  variant: ShowcaseSectionVariant;
  eyebrow?: string;
  heading?: string;
  body?: string;
  /** Index into the project's `images` array. */
  images?: number[];
  /** split only — which side the image sits on. */
  imageSide?: "left" | "right";
  /** Physical device the primary image is presented inside. */
  frame?: DeviceKind;
}

export interface ShowcaseProject {
  slug: string;
  order: number;
  name: string;
  category: string;
  tagline: string;
  overview: string;
  features: string[];
  accent: ShowcaseAccent;
  images: ShowcaseImage[];
  sections: ShowcaseSection[];
  /** Card thumbnail device frame on the Work landing page. */
  cardFrame: DeviceKind;
  /** Foundry Lane Events — the opening featured system. */
  featured?: boolean;
}

const IMG = (
  slug: string,
  file: string,
  alt: string,
  device: ShowcaseDevice,
  width: number,
  height: number,
): ShowcaseImage => ({
  src: `/assets/images/showcase/${slug}/${file}`,
  alt,
  device,
  width,
  height,
});

export const showcaseProjects: ShowcaseProject[] = [
  {
    slug: "brookmere-academy",
    order: 1,
    name: "Brookmere Academy",
    category: "Education Platform",
    tagline: "A connected school platform for parents, students and staff.",
    overview:
      "Brookmere Academy is a concept education platform created to demonstrate CatchZone's approach to multi-user digital products. The experience connects parents, students and staff through one consistent system while giving each role the tools and information they need.",
    features: [
      "Parent overview across multiple children",
      "Attendance and behaviour visibility",
      "Homework and event tracking",
      "Student timetable, grades and learning progress",
      "Teacher classes, live register and marking workload",
      "Behaviour, wellbeing and safeguarding summaries",
      "Mobile access for students",
    ],
    accent: {
      primary: "#1b3a5c",
      accent: "#5b9bd5",
      glow: "rgba(59,130,196,0.16)",
      ring: "rgba(91,155,213,0.35)",
    },
    cardFrame: "laptop",
    images: [
      IMG(
        "brookmere-academy",
        "01-parent-portal.png",
        "Parent portal showing attendance, homework, events and school messages for two children",
        "desktop",
        750,
        500,
      ),
      IMG(
        "brookmere-academy",
        "02-student-portal.png",
        "Student portal showing timetable, grades, assignments and learning progress",
        "desktop",
        750,
        500,
      ),
      IMG(
        "brookmere-academy",
        "03-teacher-workspace.png",
        "Teacher workspace showing classes, attendance register, marking and student support information",
        "desktop",
        1025,
        503,
      ),
      IMG(
        "brookmere-academy",
        "04-mobile-student-app.png",
        "Brookmere Academy mobile student app showing next lesson, homework, attendance and messages",
        "mobile",
        300,
        513,
      ),
    ],
    sections: [
      {
        variant: "hero",
        heading: "One school. Every role, connected.",
        body: "Parents can see attendance, homework, upcoming events and school messages across their children without jumping between separate systems.",
        images: [0],
        frame: "laptop",
      },
      {
        variant: "wide",
        eyebrow: "Staff operations",
        heading: "Software with operational depth",
        body: "Teachers can manage classes, registers, marking and day-to-day pastoral information from a single operational workspace.",
        images: [2],
        frame: "desktop",
      },
      {
        variant: "duo",
        eyebrow: "Student experience",
        heading: "The next action is always obvious",
        body: "Students get a clear view of their timetable, assignments, grades and progress — on desktop and on the mobile app.",
        images: [1, 3],
        frame: "laptop",
      },
      {
        variant: "closing",
        heading: "One school. Multiple roles. One connected digital experience.",
      },
    ],
  },
  {
    slug: "westmarch-training-centre",
    order: 2,
    name: "Westmarch Training Centre",
    category: "Training Platform",
    tagline:
      "A custom learning system connecting courses, practical sessions, assessments and certification for learners and training staff.",
    overview:
      "Westmarch Training Centre is a CatchZone concept platform exploring how a modern training provider could manage the full learning journey digitally. The product combines learner-facing course delivery with trainer assessment workflows and mobile access in one consistent system.",
    features: [
      "Learner dashboard and current-course progress",
      "Course catalogue and discovery",
      "Structured course/module learning",
      "Assessment submission and trainer review",
      "Certificates and completion tracking",
      "Upcoming sessions and practical training bookings",
      "Mobile learner access",
    ],
    accent: {
      primary: "#2a2a28",
      accent: "#d9651b",
      glow: "rgba(217,101,27,0.16)",
      ring: "rgba(217,101,27,0.4)",
    },
    cardFrame: "desktop",
    images: [
      IMG(
        "westmarch-training-centre",
        "01-learner-home.png",
        "Westmarch learner dashboard showing active training, upcoming sessions and progress",
        "desktop",
        900,
        555,
      ),
      IMG(
        "westmarch-training-centre",
        "02-course-catalogue.png",
        "Westmarch course catalogue for vocational training programmes",
        "desktop",
        600,
        555,
      ),
      IMG(
        "westmarch-training-centre",
        "03-course-learning.png",
        "Westmarch course learning screen showing modules and learner progress",
        "desktop",
        725,
        450,
      ),
      IMG(
        "westmarch-training-centre",
        "04-trainer-assessments.png",
        "Westmarch trainer assessment queue showing learner submissions",
        "desktop",
        555,
        450,
      ),
      IMG(
        "westmarch-training-centre",
        "05-mobile-learner-app.png",
        "Westmarch mobile learner app showing current learning and upcoming training",
        "mobile",
        233,
        450,
      ),
    ],
    sections: [
      {
        variant: "hero",
        heading: "Build real skills for real opportunities",
        body: "A connected vocational learning platform built around real skills, assessments and learner progress.",
        images: [0],
        frame: "desktop",
      },
      {
        variant: "wide",
        eyebrow: "Course discovery",
        heading: "Every vocational programme, one catalogue",
        body: "A discovery view covering several vocational areas rather than a school timetable-style interface.",
        images: [1],
        frame: "laptop",
      },
      {
        variant: "duo",
        eyebrow: "The learning journey",
        heading: "Structured modules, clear progress",
        body: "A structured course view with modules, progress, assignments and resources — mirrored in the mobile learner app.",
        images: [2, 4],
        frame: "tablet",
      },
      {
        variant: "split",
        eyebrow: "Trainer workflow",
        heading: "A clear queue for every submission",
        body: "Trainer-side assessment queue with learner submissions and review actions — the operational contrast to the learner screens.",
        images: [3],
        imageSide: "right",
        frame: "laptop",
      },
      {
        variant: "closing",
        heading: "One training provider. One connected learning journey.",
      },
    ],
  },
  {
    slug: "the-alder-kitchen",
    order: 3,
    name: "The Alder Kitchen",
    category: "Restaurant Operations",
    tagline:
      "A private restaurant operations system built around live service, tables and stock.",
    overview:
      "CatchZone designed an internal operations platform for The Alder Kitchen to simplify the information staff rely on during service. Kitchen orders, live table status and stock levels sit inside one focused system designed around the way a restaurant actually works.",
    features: [
      "Live kitchen order workflow",
      "Order priority and service status",
      "Floor-plan table management",
      "Selected table/order detail",
      "Stock and ingredient tracking",
      "Low-stock and reorder visibility",
    ],
    accent: {
      primary: "#4a1620",
      accent: "#b8863f",
      glow: "rgba(122,28,45,0.18)",
      ring: "rgba(184,134,63,0.35)",
    },
    cardFrame: "tablet",
    images: [
      IMG(
        "the-alder-kitchen",
        "01-live-kitchen-orders.png",
        "Live kitchen order board with orders arranged by New, In Progress, Almost Ready and Ready to Serve",
        "desktop",
        1536,
        604,
      ),
      IMG(
        "the-alder-kitchen",
        "02-table-floor-plan.png",
        "Live restaurant floor plan showing occupied, available, reserved and cleaning tables",
        "desktop",
        768,
        420,
      ),
      IMG(
        "the-alder-kitchen",
        "03-stock-inventory.png",
        "Internal stock screen with ingredient levels, reorder thresholds and low-stock warnings",
        "desktop",
        768,
        420,
      ),
    ],
    sections: [
      {
        variant: "hero",
        heading: "Live service, from the pass to the pass-through",
        body: "A bespoke internal platform giving the restaurant team a live view of service, table activity and stock from one connected system.",
        images: [0],
        frame: "tablet",
      },
      {
        variant: "wide",
        eyebrow: "Table plan",
        heading: "Every table, at a glance",
        body: "A live floor plan showing occupied, available, reserved and cleaning tables, with selected-table detail and activity.",
        images: [1],
        frame: "desktop",
      },
      {
        variant: "split",
        eyebrow: "Stock & supplies",
        heading: "Reorder before it's a problem",
        body: "Ingredient levels, reorder thresholds, suppliers and low-stock warnings in one clean, data-led screen.",
        images: [2],
        imageSide: "left",
        frame: "laptop",
      },
      {
        variant: "closing",
        heading: "One kitchen. One live system.",
      },
    ],
  },
  {
    slug: "alderwick-house-hotel",
    order: 4,
    name: "Alderwick House Hotel",
    category: "Hospitality Operations",
    tagline:
      "A private hotel operations platform for front desk, housekeeping and guest management.",
    overview:
      "CatchZone designed an internal operations platform for Alderwick House Hotel to bring key daily workflows into one place. Front desk staff can track arrivals and departures, housekeeping can manage room readiness, and management can access guest history and preferences without relying on disconnected tools.",
    features: [
      "Arrivals and departures overview",
      "Occupancy and room-readiness status",
      "Housekeeping workflow",
      "Out-of-service room tracking",
      "Guest profiles and stay history",
      "Staff-facing operational activity feed",
    ],
    accent: {
      primary: "#1f3b2c",
      accent: "#a68a5b",
      glow: "rgba(31,59,44,0.2)",
      ring: "rgba(166,138,91,0.35)",
    },
    cardFrame: "desktop",
    images: [
      IMG(
        "alderwick-house-hotel",
        "01-front-desk-operations.png",
        "Front-desk daily view showing arrivals, departures, occupancy and room readiness",
        "desktop",
        1536,
        542,
      ),
      IMG(
        "alderwick-house-hotel",
        "02-housekeeping-room-status.png",
        "Housekeeping room-status board showing clean, dirty, in-progress and out-of-service rooms",
        "desktop",
        768,
        482,
      ),
      IMG(
        "alderwick-house-hotel",
        "03-guest-crm-profile.png",
        "Private guest record containing stay history, preferences and internal guest information",
        "desktop",
        768,
        482,
      ),
    ],
    sections: [
      {
        variant: "hero",
        heading: "Everything it takes to run the property, smoothly",
        body: "A bespoke internal system giving hotel staff one connected view of arrivals, room readiness, housekeeping and guest history.",
        images: [0],
        frame: "desktop",
      },
      {
        variant: "wide",
        eyebrow: "Housekeeping",
        heading: "Room readiness, in real time",
        body: "A live room-status board used by housekeeping and management to see clean, dirty, in-progress and out-of-service rooms at a glance.",
        images: [1],
        frame: "tablet",
      },
      {
        variant: "split",
        eyebrow: "Guest management",
        heading: "A calmer, detail-focused view",
        body: "A private guest record with stay history, preferences and internal information for staff use.",
        images: [2],
        imageSide: "right",
        frame: "laptop",
      },
      {
        variant: "closing",
        heading: "One property. One operational view.",
      },
    ],
  },
  {
    slug: "bennett-shaw-recruitment",
    order: 5,
    name: "Bennett Shaw Recruitment",
    category: "Recruitment Operations",
    tagline:
      "A private recruitment operations platform built around candidates, vacancies and placements.",
    overview:
      "CatchZone designed an internal recruitment platform for Bennett Shaw Recruitment, bringing day-to-day consultant activity into one focused workspace. The system gives recruiters a clear view of candidates, vacancies, interview progress and placement activity without relying on scattered spreadsheets or disconnected tools.",
    features: [
      "Candidate pipeline management",
      "Vacancy tracking",
      "Interview scheduling",
      "Candidate profiles and notes",
      "Placement tracking",
      "Consultant task management",
      "Recruitment reporting",
    ],
    accent: {
      primary: "#101114",
      accent: "#2856d8",
      glow: "rgba(40,86,216,0.16)",
      ring: "rgba(40,86,216,0.4)",
    },
    cardFrame: "laptop",
    images: [
      IMG(
        "bennett-shaw-recruitment",
        "01-recruitment-overview.png",
        "Consultant dashboard with vacancies, candidate volume, interviews, placements and activity",
        "desktop",
        1536,
        552,
      ),
      IMG(
        "bennett-shaw-recruitment",
        "02-candidate-pipeline.png",
        "Kanban-style recruitment pipeline showing candidates moving through Applied, Screening, Interview and Offer",
        "desktop",
        829,
        472,
      ),
      IMG(
        "bennett-shaw-recruitment",
        "03-candidate-profile.png",
        "Detailed candidate record with availability, salary expectations, right-to-work and notes",
        "desktop",
        707,
        472,
      ),
    ],
    sections: [
      {
        variant: "hero",
        heading: "Every candidate, moving through one pipeline",
        body: "A bespoke internal CRM helping consultants manage candidate pipelines, live vacancies, interviews and placements from one system.",
        images: [1],
        frame: "laptop",
      },
      {
        variant: "wide",
        eyebrow: "Consultant workspace",
        heading: "The wider view, when you need it",
        body: "Vacancies, candidate volume, interviews, placements and daily activity — the full consultant dashboard.",
        images: [0],
        frame: "desktop",
      },
      {
        variant: "split",
        eyebrow: "Candidate profile",
        heading: "Every detail, one record",
        body: "Availability, salary expectations, right-to-work, tags and notes in a single candidate record.",
        images: [2],
        imageSide: "left",
        frame: "tablet",
      },
      {
        variant: "closing",
        heading: "One pipeline. Every placement.",
      },
    ],
  },
  {
    slug: "pennine-freight-services",
    order: 6,
    name: "Pennine Freight Services",
    category: "Logistics Operations",
    tagline:
      "A private logistics control system for jobs, drivers, routes and proof of delivery.",
    overview:
      "CatchZone designed a private operations system for Pennine Freight Services to bring dispatch, vehicle activity and delivery evidence into one place. The platform gives the team a clear live picture of what is moving, what is delayed and what has been completed.",
    features: [
      "Live fleet map",
      "Driver and vehicle status",
      "Dispatch job board",
      "Route and ETA visibility",
      "Delay/exception handling",
      "Proof of delivery",
    ],
    accent: {
      primary: "#15202b",
      accent: "#2f7dd1",
      glow: "rgba(47,125,209,0.16)",
      ring: "rgba(47,125,209,0.35)",
    },
    cardFrame: "desktop",
    images: [
      IMG(
        "pennine-freight-services",
        "01-live-fleet-control.png",
        "Live fleet map with active jobs, delayed jobs, fleet status and driver activity",
        "desktop",
        1536,
        573,
      ),
      IMG(
        "pennine-freight-services",
        "02-dispatch-jobs-board.png",
        "Compact dispatch jobs list showing route, driver, status and ETA across active work",
        "desktop",
        775,
        451,
      ),
      IMG(
        "pennine-freight-services",
        "03-live-job-tracking-pod.png",
        "Single-job operations view with route timeline, delivery details and proof of delivery",
        "desktop",
        761,
        451,
      ),
    ],
    sections: [
      {
        variant: "hero",
        heading: "Everything moving, on one live map",
        body: "A bespoke internal platform giving dispatch teams a live operational view of deliveries, drivers, delays and completed jobs.",
        images: [0],
        frame: "desktop",
      },
      {
        variant: "split",
        eyebrow: "Dispatch",
        heading: "Every job, ready to assign",
        body: "A compact jobs list for dispatch staff showing route, driver, status and ETA across active work.",
        images: [1],
        imageSide: "right",
        frame: "tablet",
      },
      {
        variant: "wide",
        eyebrow: "Job tracking",
        heading: "From pickup to proof of delivery",
        body: "A single-job operations view with route timeline, delivery details, driver information and proof of delivery.",
        images: [2],
        frame: "laptop",
      },
      {
        variant: "closing",
        heading: "One control system. Every mile accounted for.",
      },
    ],
  },
  {
    slug: "foundry-lane-events",
    order: 7,
    name: "Foundry Lane Events",
    category: "Event Operations",
    tagline: "A live event operations system built for the people behind the experience.",
    overview:
      "CatchZone designed a private live-event operations platform for Foundry Lane Events, giving teams a shared view of everything happening before and during an event. Guest arrivals, run-of-show, crew, suppliers, venue status and production notes are coordinated from one live system built for fast-moving environments.",
    features: [
      "Live event control centre",
      "Guest check-in and QR scanning",
      "VIP and accessibility tagging",
      "Seating management",
      "Run-of-show timeline",
      "Production cue stack",
      "Crew and supplier tracking",
      "Live alerts and operational notes",
    ],
    accent: {
      primary: "#241129",
      accent: "#d946c8",
      glow: "rgba(216,70,180,0.22)",
      ring: "rgba(196,120,255,0.4)",
    },
    featured: true,
    cardFrame: "desktop",
    images: [
      IMG(
        "foundry-lane-events",
        "01-desktop-live-event-control.png",
        "Live event control centre showing countdown, guest check-ins, VIP arrivals, staffing, venue map and run-of-show",
        "desktop",
        1448,
        1086,
      ),
      IMG(
        "foundry-lane-events",
        "02-tablet-checkin-seating.png",
        "Tablet guest check-in and seating workflow with QR scanning, VIP status and live attendance",
        "tablet",
        1122,
        1402,
      ),
      IMG(
        "foundry-lane-events",
        "03-desktop-run-of-show.png",
        "Production run-of-show timeline with live cue stack, crew schedule, suppliers and operational notes",
        "desktop",
        1448,
        1086,
      ),
    ],
    sections: [
      {
        variant: "hero",
        heading: "Real-time operations. A flawless experience.",
        body: "A private internal platform bringing live schedules, guest flow, production teams, suppliers and operational decisions into one connected control system.",
        images: [0],
        frame: "desktop",
      },
      {
        variant: "device",
        eyebrow: "Guest arrival",
        heading: "Built for the floor, not the office",
        body: "Front-of-house teams check guests in, scan tickets, manage seating and track VIP and accessibility needs from a tablet built for the room.",
        images: [1],
      },
      {
        variant: "wide",
        eyebrow: "Production control",
        heading: "Every cue, every crew member, one timeline",
        body: "Run-of-show, live cue stack, crew schedule, suppliers and backstage coordination — the operational story behind the event.",
        images: [2],
        frame: "laptop",
      },
      {
        variant: "closing",
        heading: "Extraordinary events. Well orchestrated.",
      },
    ],
  },
];

export const sortedShowcaseProjects = [...showcaseProjects].sort(
  (a, b) => a.order - b.order,
);
