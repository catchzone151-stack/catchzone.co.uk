import type { Metadata } from "next";
import Link from "next/link";
import { ConversationStudio } from "@/components/voice/ConversationStudio";
import { VoiceContact } from "@/components/voice/VoiceContact";
import { VoiceSubnav } from "@/components/voice/VoiceSubnav";
import { Reveal } from "@/components/ui/Reveal";
import { LANGUAGE_COUNT } from "@/data/voice/languages";

const title = "CatchZone Voice — Real-Time AI Voice Translation";
const description = `Two-way, real-time AI voice translation with live captions and spoken output in ${LANGUAGE_COUNT} languages. Try the live English–Spanish demo of CatchZone Voice.`;

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: "/voice" },
  openGraph: {
    type: "website",
    url: "/voice",
    title,
    description,
    images: [{ url: "/og/catchzone-voice.png", width: 1200, height: 630, alt: "CatchZone Voice" }],
  },
  twitter: { card: "summary_large_image", title, description, images: ["/og/catchzone-voice.png"] },
};

const FEATURES = [
  {
    title: "Two-way, real-time translation",
    body: "Both people speak their own language. Each side is recognised, translated and returned while the conversation is still flowing.",
  },
  {
    title: "Live captions in both languages",
    body: "What was said and its translation appear as text as they are recognised, so nothing relies on audio alone.",
  },
  {
    title: "Spoken translated audio",
    body: "Translations are read aloud in the listener’s language with natural-sounding synthetic speech.",
  },
  {
    title: "Automatic detection, manual control",
    body: "Choose the language pair yourself, and the speaker’s language is identified automatically within it.",
  },
  {
    title: "Business and travel terminology",
    body: "Sessions can be primed with domain context and key terms — bookings, reservations, itineraries, refunds — for more accurate results.",
  },
  {
    title: "Simple adviser–customer flow",
    body: "Designed around how a support adviser and a caller actually talk, not around a technical console.",
  },
];

const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "CatchZone Voice",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web browser",
  url: "https://catchzone.co.uk/voice",
  image: "https://catchzone.co.uk/og/catchzone-voice.png",
  description,
  featureList: [
    "Two-way real-time speech translation",
    "Live transcription and translated captions",
    "Spoken translated audio",
    "Automatic language identification",
    `${LANGUAGE_COUNT} supported languages`,
  ],
  publisher: {
    "@type": "Organization",
    name: "CatchZone Ltd",
    url: "https://catchzone.co.uk",
  },
};

export default function VoicePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareJsonLd) }}
      />
      <VoiceSubnav
        current="/voice"
        breadcrumb={[
          { name: "Home", href: "/" },
          { name: "CatchZone Voice", href: "/voice" },
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[520px]"
          style={{
            background:
              "radial-gradient(45% 60% at 30% 10%, rgba(94,234,212,0.10), transparent 70%), radial-gradient(40% 55% at 80% 30%, rgba(139,92,246,0.12), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div className="shell relative pt-8 md:pt-12">
          <div className="grid gap-10 xl:grid-cols-[0.8fr_1.2fr] xl:items-start xl:gap-14">
            <div className="mx-auto max-w-4xl text-center xl:sticky xl:top-28 xl:mx-0 xl:pt-8 xl:text-left">
              <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">
                CatchZone Voice · Real-time AI voice translation
              </p>
              <h1 className="mt-5 font-display text-4xl font-bold leading-[1.04] text-ink sm:text-5xl md:text-6xl xl:text-[3.4rem]">
                <span className="block">Speak naturally.</span>
                <span className="block">Understand in real time.</span>
              </h1>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-relaxed text-ink-muted md:text-lg xl:mx-0">
                CatchZone Voice enables spoken communication across languages, helping businesses support
                international customers without relying on a shared language.
              </p>
              <ul className="mt-7 hidden flex-wrap justify-center gap-2 text-xs text-ink-muted sm:flex xl:justify-start">
                {[`${LANGUAGE_COUNT} languages`, "Two-way translation", "Live captions", "Spoken output"].map((f) => (
                  <li key={f} className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5">
                    {f}
                  </li>
                ))}
              </ul>
              <p className="mt-7 hidden text-sm text-ink-muted sm:block">
                Starts in English ⇄ Spanish. Choose any two of{" "}
                <Link href="/voice/languages" className="text-accent-cyan hover:underline">
                  {LANGUAGE_COUNT} supported languages
                </Link>
                .
              </p>
            </div>

            {/* Conversation Studio — the main attraction */}
            <section id="studio" aria-labelledby="studio-title" className="mx-auto w-full max-w-5xl scroll-mt-24 pb-16 md:pb-24">
              <h2 id="studio-title" className="sr-only">
                Try live English to Spanish voice translation
              </h2>
              <ConversationStudio />
            </section>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section aria-labelledby="how-title" className="border-t border-line py-20 md:py-28">
        <div className="shell">
          <Reveal className="max-w-2xl">
            <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">How it works</p>
            <h2 id="how-title" className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Live speech-to-speech translation, in three stages.
            </h2>
          </Reveal>
          <ol className="mt-12 grid gap-px overflow-hidden rounded-3xl border border-line bg-line md:grid-cols-3">
            {[
              {
                step: "01",
                title: "Recognise",
                body: "Speech is streamed and transcribed as it is spoken, with the speaker’s language identified automatically.",
              },
              {
                step: "02",
                title: "Translate",
                body: "Each phrase is translated into the other language of the pair while the speaker is still talking.",
              },
              {
                step: "03",
                title: "Speak",
                body: "When a phrase is complete, the translation is read aloud and shown as a caption for the listener.",
              },
            ].map((s) => (
              <li key={s.step} className="bg-surface p-7 md:p-9">
                <span className="mono text-xs text-accent-cyan">{s.step}</span>
                <h3 className="mt-4 font-display text-xl font-bold text-ink">{s.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Capabilities */}
      <section aria-labelledby="features-title" className="border-t border-line py-20 md:py-28">
        <div className="shell grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <Reveal>
            <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">Capabilities</p>
            <h2 id="features-title" className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Real-time voice translation built for conversations.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-muted">
              CatchZone Voice is focused on one job: helping two people who don’t share a language understand each
              other while they talk.
            </p>
          </Reveal>
          <ul className="grid gap-x-10 gap-y-9 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <li key={f.title} className="border-t border-line pt-5">
                <h3 className="font-display text-lg font-bold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Technology & trust */}
      <section aria-labelledby="tech-title" className="border-t border-line py-20 md:py-28">
        <div className="shell grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">Technology</p>
            <h2 id="tech-title" className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Built on proven speech technology.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-muted">
              CatchZone Voice is designed and built by CatchZone. Speech recognition, translation and text-to-speech
              are provided by{" "}
              <a
                href="https://soniox.com"
                className="text-ink underline decoration-white/20 underline-offset-4 hover:decoration-accent-cyan"
                rel="noopener"
              >
                Soniox
              </a>
              , a specialist speech AI provider.
            </p>
          </Reveal>
          <dl className="space-y-6 text-sm leading-relaxed">
            {[
              {
                term: "Three distinct stages",
                detail:
                  "Speech recognition, translation and speech synthesis are separate stages. The speed of any one of them is not the end-to-end speed of a spoken translation.",
              },
              {
                term: "Real-world performance varies",
                detail:
                  "End-to-end timing and accuracy depend on the languages, accents, microphone quality, background noise, network conditions and how the conversation flows.",
              },
              {
                term: "No recording in the public demo",
                detail:
                  "CatchZone does not record or store demo audio, transcripts or translations. Audio is streamed directly from your browser to Soniox for processing.",
              },
            ].map((item) => (
              <div key={item.term} className="border-l border-accent-cyan/30 pl-5">
                <dt className="font-semibold text-ink">{item.term}</dt>
                <dd className="mt-1 text-ink-muted">{item.detail}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Explore further */}
      <section aria-labelledby="explore-title" className="border-t border-line py-16 md:py-20">
        <div className="shell">
          <h2 id="explore-title" className="sr-only">
            Explore CatchZone Voice
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                href: "/voice/languages",
                eyebrow: "Languages",
                title: `See all ${LANGUAGE_COUNT} supported languages`,
                body: "Search the full catalogue, including European languages and right-to-left scripts.",
              },
              {
                href: "/voice/business",
                eyebrow: "For business",
                title: "Voice translation for customer service",
                body: "How CatchZone Voice fits contact centres, travel support, bookings and hospitality teams.",
              },
            ].map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="group rounded-3xl border border-white/10 bg-white/[0.02] p-7 transition-colors hover:border-accent-cyan/40 md:p-9"
              >
                <p className="mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">{card.eyebrow}</p>
                <p className="mt-3 font-display text-2xl font-bold text-ink">
                  {card.title}
                  <span aria-hidden="true" className="ml-2 inline-block text-accent-cyan transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </p>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{card.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <VoiceContact />
    </>
  );
}
