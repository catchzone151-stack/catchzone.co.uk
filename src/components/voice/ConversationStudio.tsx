"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { LanguagePicker } from "@/components/voice/LanguagePicker";
import { VoiceWaveform } from "@/components/voice/VoiceWaveform";
import {
  DEFAULT_SOURCE,
  DEFAULT_TARGET,
  getLanguage,
  isValidPair,
} from "@/data/voice/languages";
import {
  TranslationEngine,
  type EngineError,
  type EngineSnapshot,
  type TranscriptLine,
} from "@/lib/voice/client/engine";
import type { DemoStatusResponse } from "@/lib/voice/types";

type Availability =
  | { state: "checking" }
  | { state: "available"; trialSeconds: number }
  | { state: "unavailable"; trialSeconds: number };

const IDLE_SNAPSHOT: EngineSnapshot = {
  phase: "idle",
  error: null,
  lines: [],
  remaining: null,
  trialSeconds: null,
  endedBecause: null,
};

function errorMessage(error: EngineError): string {
  switch (error.kind) {
    case "mic_denied":
      return "Microphone access was blocked. Allow microphone access for this site in your browser settings, then try again.";
    case "mic_missing":
      return "No usable microphone was found. Check it is connected and not in use by another app.";
    case "mic_unsupported":
      return "This browser can’t capture microphone audio here. Please try a current version of Chrome, Edge, Safari or Firefox.";
    case "connection":
      return "The connection to the translation service was interrupted. Please try again.";
    case "provider":
      return "The translation service reported a problem, so the session was stopped. Please try again shortly.";
    case "playback":
      return "Spoken playback failed for one phrase. Its written translation is still shown.";
    case "refused":
      switch (error.reason) {
        case "visitor_limit":
          return "You’ve used today’s free live trials. Request a private demonstration to explore CatchZone Voice in depth.";
        case "busy":
          return "The live demo is at capacity right now. Please try again in a minute.";
        case "daily_limit":
          return "Today’s public demo allowance has been used. Please try again tomorrow, or request a private demonstration.";
        case "rate_limited":
          return "Too many attempts in a short time. Please wait a minute and try again.";
        case "disabled":
        case "not_configured":
          return "The live demo is currently unavailable.";
        case "store_unavailable":
        case "provider_unavailable":
          return "The live demo couldn’t start just now. Please try again shortly.";
        default:
          return "The demo request couldn’t be accepted. Please refresh the page and try again.";
      }
  }
}

function formatTime(seconds: number): string {
  const s = Math.max(0, seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function langName(code: string | null): string {
  return (code && getLanguage(code)?.name) || "";
}

export function ConversationStudio() {
  const [source, setSource] = useState(DEFAULT_SOURCE);
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [availability, setAvailability] = useState<Availability>({ state: "checking" });
  const [consentOpen, setConsentOpen] = useState(false);
  // One engine per Studio instance; its constructor touches no browser APIs (SSR-safe).
  const [engine] = useState(() => new TranslationEngine());
  const consentRef = useRef<HTMLDivElement>(null);
  const startButtonRef = useRef<HTMLButtonElement>(null);

  const subscribe = useCallback((cb: () => void) => engine.subscribe(() => cb()), [engine]);
  const snapshot = useSyncExternalStore(
    subscribe,
    () => engine.getSnapshot(),
    () => IDLE_SNAPSHOT,
  );

  // Deep links from /voice/languages, e.g. /voice?from=en&to=fr#studio. Invalid pairs are ignored.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const from = params.get("from") ?? DEFAULT_SOURCE;
    const to = params.get("to") ?? DEFAULT_TARGET;
    if ((params.has("from") || params.has("to")) && isValidPair(from, to)) {
      setSource(from);
      setTarget(to);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/voice/status", { cache: "no-store" })
      .then((r) => r.json() as Promise<DemoStatusResponse>)
      .then((s) => {
        if (cancelled) return;
        setAvailability(
          s.available
            ? { state: "available", trialSeconds: s.trialSeconds }
            : { state: "unavailable", trialSeconds: s.trialSeconds },
        );
      })
      .catch(() => !cancelled && setAvailability({ state: "unavailable", trialSeconds: 60 }));
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const onHide = () => engine.dispose();
    window.addEventListener("pagehide", onHide);
    return () => {
      window.removeEventListener("pagehide", onHide);
      engine.dispose();
    };
  }, [engine]);

  useEffect(() => {
    if (consentOpen) consentRef.current?.querySelector<HTMLElement>("button")?.focus();
  }, [consentOpen]);

  const { phase } = snapshot;
  const busy = ["requesting-mic", "requesting-session", "connecting", "listening", "speaking", "stopping"].includes(phase);
  const live = phase === "listening" || phase === "speaking";
  const sourceLang = getLanguage(source);
  const targetLang = getLanguage(target);
  const trialSeconds =
    snapshot.trialSeconds ?? (availability.state === "checking" ? 60 : availability.trialSeconds);
  const unavailable = availability.state === "unavailable";

  function onPrimary() {
    if (live || phase === "connecting") {
      void engine.stop("user");
      return;
    }
    if (busy || unavailable || !isValidPair(source, target)) return;
    engine.reset();
    setConsentOpen(true);
  }

  function onConsent() {
    setConsentOpen(false);
    void engine.start(source, target);
    requestAnimationFrame(() => startButtonRef.current?.focus());
  }

  function swap() {
    setSource(target);
    setTarget(source);
  }

  const statusText = (() => {
    if (unavailable && !busy) return "Public trials are paused right now";
    switch (phase) {
      case "requesting-mic":
        return "Waiting for microphone permission…";
      case "requesting-session":
        return "Starting a secure session…";
      case "connecting":
        return "Connecting…";
      case "listening":
        return `Listening — speak ${sourceLang?.name ?? ""} or ${targetLang?.name ?? ""}`;
      case "speaking":
        return "Speaking the translation · microphone paused";
      case "stopping":
        return "Finishing the last phrase…";
      case "ended":
        return snapshot.endedBecause === "time" ? "Trial time reached" : "Session ended";
      case "error":
        return "Session stopped";
      default:
        return availability.state === "checking" ? "Checking availability…" : "Ready when you are";
    }
  })();

  const lines = snapshot.lines.filter(
    (l) => l.original || l.originalPartial || l.translation || l.translationPartial,
  );

  return (
    <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,20,26,0.92),rgba(10,11,14,0.96))] light:bg-[linear-gradient(180deg,#ffffff,#f3f2ee)] light:shadow-[0_40px_100px_-50px_rgba(14,17,22,0.3)] shadow-[0_40px_120px_-40px_rgba(56,189,248,0.25)]">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 40% at 20% 0%, rgba(94,234,212,0.08), transparent 70%), radial-gradient(50% 40% at 90% 100%, rgba(139,92,246,0.1), transparent 70%)",
        }}
        aria-hidden="true"
      />

      <div className="relative p-4 sm:p-6 md:p-8">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">Conversation Studio</p>
          <p className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-ink-muted">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                live ? "bg-accent-cyan shadow-[0_0_10px_rgba(94,234,212,0.9)]" : unavailable ? "bg-ink-faint" : "bg-accent-cyan/60"
              }`}
              aria-hidden="true"
            />
            {unavailable ? "Live demo paused" : `Live demo · ${trialSeconds}-second trial`}
          </p>
        </div>

        {/* Language pair */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
          <LanguagePicker label="Speak in" value={source} disallow={target} disabled={busy} onChange={setSource} />
          <button
            type="button"
            onClick={swap}
            disabled={busy}
            aria-label={`Swap languages: speak in ${targetLang?.name}, translate into ${sourceLang?.name}`}
            className="mx-auto flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-ink transition-colors hover:border-accent-cyan/50 hover:text-accent-cyan disabled:cursor-not-allowed disabled:opacity-50 sm:mx-0 sm:mb-2"
          >
            {/* Vertical arrows when the pickers are stacked, horizontal when side by side. */}
            <svg viewBox="0 0 24 24" className="h-5 w-5 sm:hidden" aria-hidden="true">
              <path d="M8 19V5M8 5L4.5 8.5M8 5l3.5 3.5M16 5v14M16 19l-3.5-3.5M16 19l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <svg viewBox="0 0 24 24" className="hidden h-5 w-5 sm:block" aria-hidden="true">
              <path d="M5 8h14M19 8l-3.5-3.5M19 8l-3.5 3.5M19 16H5M5 16l3.5-3.5M5 16l3.5 3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <LanguagePicker label="Translate into" value={target} disallow={source} disabled={busy} onChange={setTarget} />
        </div>
        <p className="mt-3 text-sm text-ink-muted">
          Two-way: speak either language and CatchZone Voice detects which one you used, then translates into the other.
        </p>

        {/* Stage */}
        <div className="relative mt-6 rounded-3xl border border-white/[0.06] bg-void/60 px-4 py-6 sm:py-8">
          <VoiceWaveform
            className="pointer-events-none absolute inset-x-0 top-1/2 h-28 w-full -translate-y-1/2 sm:h-36"
            active={live}
            idleAmplitude={live ? 0.06 : 0.1}
            getLevel={() => engine.getLevel()}
          />

          {consentOpen ? (
            <div
              ref={consentRef}
              role="group"
              aria-labelledby="voice-consent-title"
              className="relative mx-auto max-w-lg rounded-2xl border border-white/10 bg-surface-raised/95 p-5 text-left backdrop-blur"
            >
              <p id="voice-consent-title" className="font-display text-lg font-bold text-ink">
                Use your microphone for a {trialSeconds}-second live trial?
              </p>
              <ul className="mt-3 space-y-1.5 text-sm leading-relaxed text-ink-muted">
                <li>Your browser streams microphone audio directly to Soniox, our speech-technology provider, for live recognition, translation and spoken output.</li>
                <li>CatchZone does not record or store your audio, transcript or translation. They are shown on this page only.</li>
                <li>The trial stops automatically after {trialSeconds} seconds. Free trials are limited per visitor each day.</li>
              </ul>
              <p className="mt-3 text-xs text-ink-faint">
                Headphones give the cleanest result. See our{" "}
                <Link href="/privacy#voice-demo" className="underline underline-offset-2 hover:text-ink">
                  privacy policy
                </Link>
                .
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={onConsent}
                  className="min-h-[44px] rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
                >
                  Agree and start
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setConsentOpen(false);
                    requestAnimationFrame(() => startButtonRef.current?.focus());
                  }}
                  className="min-h-[44px] rounded-full border border-white/15 px-6 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-white/40"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="relative flex flex-col items-center text-center">
              <button
                ref={startButtonRef}
                type="button"
                onClick={onPrimary}
                disabled={
                  availability.state === "checking" ||
                  phase === "stopping" ||
                  phase === "requesting-mic" ||
                  phase === "requesting-session" ||
                  (unavailable && !busy)
                }
                aria-label={live || phase === "connecting" ? "Stop talking" : "Start talking"}
                className="group relative flex h-24 w-24 items-center justify-center rounded-full transition-transform duration-300 enabled:hover:scale-[1.04] disabled:cursor-not-allowed sm:h-28 sm:w-28"
              >
                <span
                  className={`absolute inset-0 rounded-full bg-[conic-gradient(from_200deg,#5eead4,#38bdf8,#8b5cf6,#5eead4)] ${
                    unavailable && !busy ? "opacity-30" : "opacity-90"
                  }`}
                  aria-hidden="true"
                />
                {live && (
                  <span className="absolute -inset-2 rounded-full border border-accent-cyan/30 motion-safe:animate-ping" aria-hidden="true" />
                )}
                <span className="absolute inset-[3px] rounded-full bg-void" aria-hidden="true" />
                <span className="relative text-ink" aria-hidden="true">
                  {live || phase === "connecting" ? (
                    <span className="block h-6 w-6 rounded-[6px] bg-ink" />
                  ) : busy ? (
                    <span className="block h-7 w-7 rounded-full border-2 border-ink/25 border-t-accent-cyan motion-safe:animate-spin" />
                  ) : (
                    <svg viewBox="0 0 24 24" className="h-8 w-8">
                      <rect x="9" y="3" width="6" height="11" rx="3" fill="currentColor" />
                      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  )}
                </span>
              </button>
              <p className="mt-4 text-sm font-semibold text-ink">
                {live || phase === "connecting" ? "Stop" : unavailable && !busy ? "Live demo unavailable" : "Start talking"}
              </p>
              <p className="mt-1 min-h-[1.25rem] text-sm text-ink-muted" role="status" aria-live="polite">
                {statusText}
                {live && snapshot.remaining !== null && (
                  <span className="mono ml-2 text-accent-cyan">{formatTime(snapshot.remaining)}</span>
                )}
              </p>
            </div>
          )}
        </div>

        {/* Errors and unavailable state */}
        {snapshot.error && (
          <div
            role="alert"
            className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
              snapshot.error.kind === "playback"
                ? "border-white/10 bg-white/[0.03] text-ink-muted"
                : "border-[rgba(248,113,113,0.35)] bg-[rgba(248,113,113,0.06)] text-ink"
            }`}
          >
            {errorMessage(snapshot.error)}
            {snapshot.error.kind === "refused" && (
              <Link href="#voice-contact" className="ml-1 font-semibold text-accent-cyan hover:underline">
                Request a private demonstration
              </Link>
            )}
          </div>
        )}
        {unavailable && !snapshot.error && (
          <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-ink-muted">
            The public live demo is not running at the moment. You can still explore the supported languages, or{" "}
            <Link href="#voice-contact" className="font-semibold text-accent-cyan hover:underline">
              request a private demonstration
            </Link>
            .
          </div>
        )}

        {/* Transcripts */}
        <div className="mt-6">
          <div className="hidden grid-cols-2 gap-6 px-1 md:grid">
            <p className="mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">What was said</p>
            <p className="mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Translation</p>
          </div>
          <div className="mt-2 min-h-[160px] rounded-2xl border border-white/[0.06] bg-void/40 p-4">
            {lines.length === 0 ? (
              <p className="py-10 text-center text-sm text-ink-faint">
                {phase === "listening"
                  ? "Start speaking — your words and their translation will appear here."
                  : "Your words and their live translation will appear here."}
              </p>
            ) : (
              <ol className="space-y-4" aria-label="Live transcript">
                {lines.map((line) => (
                  <TranscriptRow key={line.id} line={line} />
                ))}
              </ol>
            )}
          </div>
          {phase === "ended" && lines.length > 0 && (
            <p className="mt-3 text-xs text-ink-faint">
              This transcript exists only in your browser and disappears when you leave the page.
            </p>
          )}
        </div>

        <p className="mt-6 border-t border-line pt-4 text-xs leading-relaxed text-ink-faint">
          Live demonstration powered by Soniox speech recognition, translation and text-to-speech. Results vary with
          language, accent, microphone and background noise. Please don’t share sensitive personal information.
        </p>
      </div>
    </div>
  );
}

function TranscriptRow({ line }: { line: TranscriptLine }) {
  const original = getLanguage(line.originalLang ?? "");
  const translated = getLanguage(line.translationLang ?? "");
  return (
    <li className="grid gap-2 md:grid-cols-2 md:gap-6">
      <div>
        <p className="mono text-[10px] uppercase tracking-[0.2em] text-ink-faint md:hidden">
          Said{original ? ` · ${original.name}` : ""}
        </p>
        {original && (
          <p className="mono hidden text-[10px] uppercase tracking-[0.2em] text-ink-faint md:block">{original.name}</p>
        )}
        <p lang={original?.code} dir={original?.dir ?? "auto"} className="mt-1 text-base leading-relaxed text-ink">
          {line.original}
          <span className="text-ink-muted">{line.originalPartial}</span>
        </p>
      </div>
      <div className="border-l-2 border-accent-cyan/30 pl-3 md:border-l-0 md:pl-0">
        <p className="mono text-[10px] uppercase tracking-[0.2em] text-accent-cyan/80">
          {translated ? langName(translated.code) : line.translation || line.translationPartial ? "Translation" : ""}
        </p>
        <p lang={translated?.code} dir={translated?.dir ?? "auto"} className="mt-1 text-base leading-relaxed text-accent-cyan">
          {line.translation}
          <span className="opacity-60">{line.translationPartial}</span>
        </p>
      </div>
    </li>
  );
}
