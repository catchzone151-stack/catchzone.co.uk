"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { TEAM, teamImage, type TeamProfile } from "@/data/team";
import { TeamImage } from "@/components/team/TeamImage";

/**
 * The people behind CatchZone — five abstract chrome sculptures. Selecting
 * one lifts and lights the card, expands it into a profile (shared-layout
 * transition), then crossfades the sculpture into the matching chrome
 * character while the profile text staggers in. Previous / Next / Close,
 * arrow keys and Escape; focus is trapped in the open profile and returned to
 * the originating card on close. Reduced motion: layout and sweep animations
 * are skipped (MotionConfig reducedMotion="user" + motion-safe CSS).
 */

const EASE = [0.16, 1, 0.3, 1] as const;
const SELECT_MS = 220;

function currentTheme(): "dark" | "light" {
  return document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark";
}

function preloadPortrait(slug: TeamProfile["slug"]) {
  const src = teamImage(slug, "portrait", currentTheme());
  const url = `/_next/image?url=${encodeURIComponent(src)}&w=828&q=75`;
  const img = new window.Image();
  img.src = url;
}

/* ------------------------------ Card ------------------------------ */

function TeamCard({
  profile,
  index,
  dimmed,
  selecting,
  hidden,
  onOpen,
  cardRef,
}: {
  profile: TeamProfile;
  index: number;
  dimmed: boolean;
  selecting: boolean;
  hidden: boolean;
  onOpen: (i: number) => void;
  cardRef: (el: HTMLButtonElement | null) => void;
}) {
  return (
    <li
      className={
        profile.founder
          ? // founder: full width first on phones, centre (and raised) on wide screens
            "order-first w-full sm:w-[calc(33.333%-0.7rem)] xl:order-none xl:-mt-6 xl:w-[calc(20%-0.8rem)]"
          : "w-[calc(50%-0.5rem)] sm:w-[calc(33.333%-0.7rem)] xl:w-[calc(20%-0.8rem)]"
      }
    >
      <button
        ref={cardRef}
        type="button"
        onClick={() => onOpen(index)}
        onPointerEnter={() => preloadPortrait(profile.slug)}
        onFocus={() => preloadPortrait(profile.slug)}
        aria-haspopup="dialog"
        aria-label={`${profile.name}, ${profile.role}. Open profile`}
        className={`team-card group relative flex h-full w-full flex-col overflow-hidden rounded-[1.6rem] border text-left transition-[transform,opacity,border-color,box-shadow] duration-500 ease-cinematic focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-cyan ${
          selecting
            ? "team-card--active -translate-y-2 border-accent-cyan/50 shadow-[0_30px_70px_-30px_rgb(var(--accent-cyan-rgb)/0.55)]"
            : "border-white/10 hover:-translate-y-1.5 hover:border-accent-cyan/35 focus-visible:-translate-y-1.5"
        } ${dimmed ? "opacity-40" : "opacity-100"} ${
          profile.founder ? "bg-surface-raised xl:shadow-[0_40px_90px_-50px_rgb(var(--accent-cyan-rgb)/0.5)]" : "bg-surface"
        }`}
      >
        {/* glass + light sweep */}
        <span className="team-glass pointer-events-none absolute inset-0" aria-hidden="true" />
        <span className="team-sweep pointer-events-none absolute inset-0" aria-hidden="true" />

        <span className={`relative mx-auto block w-full ${profile.founder ? "max-w-[300px] sm:max-w-none" : ""}`}>
          {hidden ? (
            <span className="block aspect-square w-full" aria-hidden="true" />
          ) : (
            <motion.span layoutId={`team-media-${profile.slug}`} className="relative block aspect-square w-full" transition={{ duration: 0.5, ease: EASE }}>
              <span
                className="pointer-events-none absolute inset-[18%] rounded-full bg-accent-cyan/20 blur-3xl transition-opacity duration-500 group-hover:opacity-100 light:bg-accent-cyan/10"
                style={{ opacity: selecting ? 1 : 0.55 }}
                aria-hidden="true"
              />
              <TeamImage
                slug={profile.slug}
                kind="sculpture"
                alt={profile.sculpture}
                sizes="(min-width: 1280px) 240px, (min-width: 640px) 30vw, 46vw"
                className={`relative h-full w-full object-contain transition-[filter,transform] duration-500 group-hover:scale-[1.03] ${
                  selecting ? "scale-[1.04] brightness-110" : ""
                }`}
              />
            </motion.span>
          )}
        </span>

        <span className="relative flex flex-1 flex-col px-4 pb-5 pt-1 sm:px-5">
          {profile.founder && (
            <span className="mono mb-1.5 text-[10px] uppercase tracking-[0.2em] text-accent-cyan">Founder</span>
          )}
          <span className="font-display text-base font-bold leading-tight text-ink sm:text-lg">{profile.name}</span>
          <span className="mt-1 text-[12.5px] leading-snug text-ink-muted">{profile.role}</span>
          <span className="mt-2 hidden text-[12.5px] leading-relaxed text-ink-faint sm:line-clamp-2">
            {profile.intro}
          </span>
          <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-[12.5px] font-semibold text-accent-cyan">
            Explore profile
            <span aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5">
              →
            </span>
          </span>
        </span>
      </button>
    </li>
  );
}

/* ----------------------------- Profile ---------------------------- */

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.28 } },
};
const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE } },
};

function TeamProfilePanel({
  profile,
  index,
  revealed,
  instant,
  morph,
  onClose,
  onPrev,
  onNext,
}: {
  profile: TeamProfile;
  index: number;
  revealed: boolean;
  instant: boolean;
  /** Shared-layout morph from/to the card that opened the panel (only while showing that profile). */
  morph: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      } else if (e.key === "ArrowRight" && !(e.target instanceof HTMLAnchorElement)) {
        onNext();
      } else if (e.key === "ArrowLeft" && !(e.target instanceof HTMLAnchorElement)) {
        onPrev();
      } else if (e.key === "Tab" && panelRef.current) {
        const f = panelRef.current.querySelectorAll<HTMLElement>("button, a[href]");
        const first = f[0];
        const last = f[f.length - 1];
        if (!first || !last) return;
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, onNext, onPrev]);

  const titleId = `team-profile-${profile.slug}`;

  return (
    <motion.div
      className="fixed inset-0 z-overlay flex items-end justify-center sm:items-center sm:p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <button
        type="button"
        tabIndex={-1}
        aria-hidden="true"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-void/80 backdrop-blur-md"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="team-panel relative max-h-[100svh] w-full max-w-5xl overflow-y-auto rounded-t-[2rem] border border-white/10 bg-surface/95 shadow-[0_60px_140px_-40px_rgba(0,0,0,0.85)] backdrop-blur-xl sm:max-h-[92svh] sm:rounded-[2rem] light:bg-surface-raised/95 light:shadow-[0_60px_140px_-60px_rgba(14,17,22,0.45)]"
      >
        <div className="relative grid gap-6 p-5 sm:p-8 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-10 md:p-10">
          {/* Character */}
          <div className="relative mx-auto w-full max-w-[300px] sm:max-w-[360px] md:max-w-[420px]">
            {/* orbital light */}
            <span className="team-orbit pointer-events-none absolute -inset-[8%]" aria-hidden="true" />
            <motion.div
              layoutId={morph ? `team-media-${profile.slug}` : undefined}
              transition={{ duration: 0.5, ease: EASE }}
              className="relative aspect-[690/864] w-full overflow-hidden rounded-[1.5rem] border border-white/10 bg-void shadow-[0_30px_80px_-30px_rgb(var(--accent-cyan-rgb)/0.45)]"
            >
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={profile.slug}
                  className="absolute inset-0"
                  initial={{ opacity: instant ? 0 : 1 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {/* sculpture first, then the character fades in over it */}
                  <div className="absolute inset-0 flex items-center justify-center bg-void p-[10%]" aria-hidden="true">
                    <TeamImage slug={profile.slug} kind="sculpture" alt="" sizes="420px" priority className="h-full w-full object-contain" />
                  </div>
                  <motion.div
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.04 }}
                    animate={revealed ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 1.04 }}
                    transition={{ duration: 0.55, ease: EASE }}
                  >
                    <TeamImage
                      slug={profile.slug}
                      kind="portrait"
                      alt={`${profile.portrait} — ${profile.name}`}
                      sizes="(min-width: 768px) 420px, 360px"
                      priority
                      className="h-full w-full object-cover"
                    />
                  </motion.div>
                  {/* light sweep accompanying the reveal */}
                  {revealed && !instant && <span className="team-reveal-sweep pointer-events-none absolute inset-0" aria-hidden="true" />}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Profile */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={profile.slug} variants={stagger} initial="hidden" animate="show" exit={{ opacity: 0, transition: { duration: 0.15 } }} className="min-w-0 md:pt-2">
              <motion.p variants={item} className="mono text-[11px] uppercase tracking-[0.22em] text-accent-cyan">
                {profile.founder ? "Founder · " : ""}
                {String(index + 1).padStart(2, "0")} / {String(TEAM.length).padStart(2, "0")}
              </motion.p>
              <motion.h3 variants={item} id={titleId} className="mt-3 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
                {profile.name}
              </motion.h3>
              <motion.p variants={item} className="mt-2 text-base font-medium text-ink-muted">
                {profile.role}
              </motion.p>
              <motion.p variants={item} className="mt-5 max-w-prose text-[15px] leading-relaxed text-ink">
                {profile.intro}
              </motion.p>
              <motion.div variants={item} className="mt-6">
                <p className="mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Expertise</p>
                <ul className="mt-2.5 flex flex-wrap gap-2">
                  {profile.expertise.map((x) => (
                    <li key={x} className="rounded-full border border-accent-cyan/25 bg-accent-cyan/[0.07] px-3 py-1 text-[13px] text-ink">
                      {x}
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div variants={item} className="mt-6">
                <p className="mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">At CatchZone</p>
                <ul className="mt-2.5 space-y-2">
                  {profile.responsibilities.map((x) => (
                    <li key={x} className="flex items-start gap-2.5 text-sm text-ink-muted">
                      <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-cyan" aria-hidden="true" />
                      {x}
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div variants={item} className="mt-7">
                <a
                  href={profile.cta.href}
                  className="inline-flex min-h-[44px] items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
                >
                  {profile.cta.label} <span aria-hidden="true">→</span>
                </a>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* controls */}
        <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-white/[0.08] bg-surface/95 px-5 py-3 backdrop-blur sm:px-8 light:bg-surface-raised/95">
          <button
            type="button"
            onClick={onPrev}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-semibold text-ink transition-colors hover:border-accent-cyan/60 hover:text-accent-cyan"
          >
            <span aria-hidden="true">←</span> Previous
          </button>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] items-center rounded-full px-4 text-sm font-semibold text-ink-muted transition-colors hover:text-ink"
          >
            All profiles
          </button>
          <button
            type="button"
            onClick={onNext}
            className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-white/15 px-4 text-sm font-semibold text-ink transition-colors hover:border-accent-cyan/60 hover:text-accent-cyan"
          >
            Next <span aria-hidden="true">→</span>
          </button>
        </div>

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close profile"
          className="absolute right-3 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-void/70 text-ink backdrop-blur transition-colors hover:border-accent-cyan/60 hover:text-accent-cyan sm:right-4 sm:top-4"
        >
          <svg viewBox="0 0 16 16" className="h-4 w-4" aria-hidden="true">
            <path d="M3.5 3.5l9 9m0-9-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" fill="none" />
          </svg>
        </button>
      </div>
    </motion.div>
  );
}

/* ------------------------------ Root ------------------------------ */

export function TeamExperience() {
  const [selecting, setSelecting] = useState<number | null>(null);
  const [open, setOpen] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [instant, setInstant] = useState(false);
  const [announce, setAnnounce] = useState("");
  const cards = useRef<(HTMLButtonElement | null)[]>([]);
  const returnTo = useRef<number | null>(null);
  /** Card that opened the panel: it stays a placeholder while the panel is open. */
  const [origin, setOrigin] = useState<number | null>(null);
  const timers = useRef<number[]>([]);

  const clearTimers = () => {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
  };
  useEffect(() => clearTimers, []);

  // Lock page scroll while a profile is open.
  useEffect(() => {
    if (open === null) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const openProfile = useCallback((i: number) => {
    clearTimers();
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    returnTo.current = i;
    setOrigin(i);
    preloadPortrait(TEAM[i]!.slug);
    setInstant(false);
    setRevealed(false);
    setSelecting(i);
    timers.current.push(
      window.setTimeout(() => {
        setOpen(i);
        setAnnounce(`${TEAM[i]!.name}, ${TEAM[i]!.role}. Profile opened.`);
        timers.current.push(window.setTimeout(() => setRevealed(true), reduced ? 0 : 420));
      }, reduced ? 0 : SELECT_MS),
    );
  }, []);

  const close = useCallback(() => {
    clearTimers();
    const i = open;
    setInstant(false);
    setRevealed(false);
    setOpen(null);
    setSelecting(null);
    setOrigin(null);
    setAnnounce("Profile closed.");
    const target = i ?? returnTo.current;
    if (target !== null) window.setTimeout(() => cards.current[target]?.focus({ preventScroll: true }), 60);
  }, [open]);

  const step = useCallback(
    (dir: 1 | -1) => {
      if (open === null) return;
      const next = (open + dir + TEAM.length) % TEAM.length;
      preloadPortrait(TEAM[next]!.slug);
      setInstant(true);
      setRevealed(true);
      setOpen(next);
      setSelecting(next);
      setAnnounce(`${TEAM[next]!.name}, ${TEAM[next]!.role}.`);
    },
    [open],
  );

  const current = open !== null ? TEAM[open]! : null;

  return (
    <LayoutGroup id="team">
      <ul className="flex flex-wrap items-stretch justify-center gap-4 xl:pt-6">
        {TEAM.map((p, i) => (
          <TeamCard
            key={p.slug}
            profile={p}
            index={i}
            selecting={selecting === i}
            dimmed={selecting !== null && selecting !== i}
            hidden={open !== null && origin === i}
            onOpen={openProfile}
            cardRef={(el) => {
              cards.current[i] = el;
            }}
          />
        ))}
      </ul>

      <AnimatePresence>
        {current && open !== null && (
          <TeamProfilePanel
            key="team-profile"
            profile={current}
            index={open}
            revealed={revealed}
            instant={instant}
            morph={origin === open}
            onClose={close}
            onPrev={() => step(-1)}
            onNext={() => step(1)}
          />
        )}
      </AnimatePresence>

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </LayoutGroup>
  );
}
