import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { VoiceWaveform } from "@/components/voice/VoiceWaveform";

const CAPABILITIES = [
  "Spoken translation in both directions",
  "A broad multilingual language catalogue",
  "Live translated captions",
  "Automatic language detection and manual selection",
  "Business-focused language terminology",
];

/**
 * Homepage featured product: CatchZone Voice. Rendered inside the live
 * site's `SelectedWork` section (which keeps its own wrapper, hand-off from
 * the CinematicJourney, heading and "Also live on Google Play" row). It
 * replaces the IslamQuest homepage feature only — IslamQuest's /work
 * presentation, case study and project data are unchanged.
 */
export function VoiceSpotlight() {
  return (
    <div>
      {/* Product stage: cinematic artwork + two connected language streams */}
      <Reveal className="relative overflow-hidden rounded-[32px] border border-white/[0.08] bg-[radial-gradient(70%_90%_at_50%_0%,rgba(56,189,248,0.10),transparent_70%),linear-gradient(180deg,#0b0c11,#060609)] light:bg-[radial-gradient(70%_90%_at_50%_0%,rgba(56,189,248,0.10),transparent_70%),linear-gradient(180deg,#ffffff,#f0efea)] light:shadow-[0_40px_90px_-50px_rgba(14,17,22,0.35)] px-5 pb-10 pt-12 sm:px-10 md:pb-14 md:pt-16">
        <div
          className="pointer-events-none absolute inset-x-[15%] top-[30%] h-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(139,92,246,0.16),transparent)] blur-2xl"
          aria-hidden="true"
        />
        {/* Approved Cinematic logo: Dark variant on the dark stage, Light variant on the light stage. */}
        <Image
          src="/brand/voice/catchzone-voice-cinematic-dark.webp"
          alt="CatchZone Voice"
          width={1862}
          height={383}
          sizes="(min-width: 1024px) 760px, 90vw"
          className="theme-only-dark relative mx-auto h-auto w-full max-w-[760px]"
        />
        <Image
          src="/brand/voice/catchzone-voice-cinematic-light.webp"
          alt="CatchZone Voice"
          width={1862}
          height={383}
          sizes="(min-width: 1024px) 760px, 90vw"
          className="theme-only-light relative mx-auto h-auto w-full max-w-[760px]"
        />

        <div className="relative mx-auto mt-10 flex max-w-4xl items-center gap-3 sm:gap-6 md:mt-12" aria-hidden="true">
          <SpeakerNode code="EN" name="English" lang="en" side="left" />
          <div className="relative h-20 flex-1 sm:h-28">
            <VoiceWaveform className="absolute inset-0 h-full w-full" idleAmplitude={0.4} />
            <div className="mono absolute inset-x-0 -bottom-5 flex justify-between text-[10px] uppercase tracking-[0.2em] text-ink-faint">
              <span>Speech</span>
              <span className="hidden sm:inline">Translation</span>
              <span>Speech</span>
            </div>
          </div>
          <SpeakerNode code="ES" name="Español" lang="es" side="right" />
        </div>
      </Reveal>

      <div className="mt-14 grid gap-12 md:mt-16 md:grid-cols-[1.1fr_0.9fr] md:gap-16">
        <Reveal>
          <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">CatchZone Voice</p>
          <h3 className="mt-4 font-display text-2xl font-bold leading-tight text-ink sm:text-3xl">
            Real-time, two-way AI voice translation.
          </h3>
          <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
            Designed to help customer-service teams communicate naturally with people speaking different
            languages.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Link
              href="/voice"
              className="inline-flex min-h-[48px] items-center gap-2 rounded-full bg-ink px-7 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
            >
              Explore CatchZone Voice
              <span aria-hidden="true">→</span>
            </Link>
            <Link
              href="/voice#studio"
              className="group inline-flex min-h-[44px] items-center gap-2 text-sm font-semibold text-ink transition-colors hover:text-accent-cyan"
            >
              Try the live demo
              <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Capabilities</p>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {CAPABILITIES.map((c) => (
              <li key={c} className="flex items-center gap-3 py-3.5 text-sm text-ink md:text-base">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gradient-to-r from-accent-cyan to-[#8b5cf6]" aria-hidden="true" />
                {c}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </div>
  );
}

function SpeakerNode({ code, name, lang, side }: { code: string; name: string; lang: string; side: "left" | "right" }) {
  const ring = side === "left" ? "from-accent-cyan/70 to-[#38bdf8]/30" : "from-[#38bdf8]/30 to-[#8b5cf6]/80";
  return (
    <div className="flex shrink-0 flex-col items-center gap-2">
      <div className={`relative h-14 w-14 rounded-full bg-gradient-to-br p-px sm:h-20 sm:w-20 ${ring}`}>
        <div className="flex h-full w-full items-center justify-center rounded-full bg-[#07080b] light:bg-surface-raised">
          <svg viewBox="0 0 24 24" className="h-5 w-5 text-ink sm:h-7 sm:w-7">
            <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <path d="M5 19.5c1.2-3.4 4-5 7-5s5.8 1.6 7 5" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </div>
        <span
          className={`absolute -top-1 ${side === "left" ? "-right-1" : "-left-1"} h-2.5 w-2.5 rounded-full ${
            side === "left" ? "bg-accent-cyan" : "bg-[#8b5cf6]"
          } shadow-[0_0_12px_currentColor]`}
        />
      </div>
      <span className="mono text-[10px] uppercase tracking-[0.18em] text-ink-muted sm:text-xs">{code}</span>
      <span lang={lang} className="hidden text-xs text-ink-faint sm:block">
        {name}
      </span>
    </div>
  );
}
