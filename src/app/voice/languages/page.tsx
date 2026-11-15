import type { Metadata } from "next";
import Link from "next/link";
import { LanguageExplorer } from "@/components/voice/LanguageExplorer";
import { VoiceContact } from "@/components/voice/VoiceContact";
import { VoiceSubnav } from "@/components/voice/VoiceSubnav";
import { CATALOGUE_META, LANGUAGE_COUNT, LANGUAGE_GROUPS } from "@/data/voice/languages";
import { pageMetadata } from "@/lib/seo";

const title = `Live Voice Translation Languages (${LANGUAGE_COUNT}) | CatchZone Voice`;
const description = `See all ${LANGUAGE_COUNT} languages CatchZone Voice can recognise, translate and speak — including ${
  LANGUAGE_GROUPS.find((g) => g.id === "europe")!.codes.length
} European languages plus Arabic, Hebrew, Persian and Urdu.`;

export const metadata: Metadata = pageMetadata({
  title,
  description,
  path: "/voice/languages",
  image: { url: "/og/catchzone-voice.png", width: 1200, height: 630, alt: "CatchZone Voice" },
});

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default function VoiceLanguagesPage() {
  return (
    <>
      <VoiceSubnav
        current="/voice/languages"
        breadcrumb={[
          { name: "Home", href: "/" },
          { name: "CatchZone Voice", href: "/voice" },
          { name: "Languages", href: "/voice/languages" },
        ]}
      />

      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[420px]"
          style={{
            background:
              "radial-gradient(40% 60% at 15% 0%, rgba(94,234,212,0.09), transparent 70%), radial-gradient(35% 55% at 85% 20%, rgba(139,92,246,0.1), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div className="shell relative pt-10 pb-12 md:pt-14 md:pb-16">
          <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">CatchZone Voice · Languages</p>
          <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.04] text-ink sm:text-5xl md:text-6xl">
            More languages. Fewer barriers.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted md:text-lg">
            CatchZone Voice recognises, translates and speaks {LANGUAGE_COUNT} languages, and can translate between
            any two of them — from Spanish, Polish and Romanian to Arabic, Hindi, Japanese and Swahili.
          </p>
          <dl className="mt-10 grid max-w-4xl grid-cols-1 gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-3">
            {[
              { k: "Languages", v: String(LANGUAGE_COUNT) },
              { k: "Translation", v: "Any supported pair" },
              { k: "Each language", v: "Speech · text · voice" },
            ].map((s) => (
              <div key={s.k} className="bg-surface px-5 py-4">
                <dt className="mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">{s.k}</dt>
                <dd className="mt-1 font-display text-xl font-bold text-ink">{s.v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/voice#studio"
              className="inline-flex min-h-[48px] items-center rounded-full bg-ink px-6 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
            >
              Try the Conversation Studio
            </Link>
            <Link
              href="/voice/business"
              className="inline-flex min-h-[48px] items-center rounded-full border border-white/15 px-6 text-sm font-semibold text-ink transition-colors hover:border-accent-cyan/60 hover:text-accent-cyan"
            >
              Voice Translation for Business
            </Link>
          </div>
        </div>
      </section>

      <section aria-label="Supported languages" className="border-t border-line py-14 md:py-20">
        <div className="shell">
          <LanguageExplorer />
        </div>
      </section>

      <section aria-labelledby="performance-title" className="border-t border-line py-16 md:py-24">
        <div className="shell grid gap-10 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 id="performance-title" className="font-display text-3xl font-bold leading-tight text-ink">
              What “supported” means
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-muted">
              Every language on this page can be recognised from speech, translated to or from any other listed
              language, and spoken aloud. How well a conversation goes still depends on the language pair, the
              speaker’s accent and pace, audio quality, background noise and the subject being discussed.
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink-muted">
              We don’t list regional dialects or accents separately, and we don’t claim support for languages that
              aren’t shown here. If your customers speak a particular variety, we’ll test it with you during a private
              demonstration.
            </p>
          </div>
          <div>
            <h2 className="font-display text-xl font-bold text-ink">Writing systems</h2>
            <ul className="mt-4 space-y-3 text-sm leading-relaxed text-ink-muted">
              <li>
                Arabic, Hebrew, Persian and Urdu are written right to left and are displayed that way in captions.
              </li>
              <li>
                Spoken output has documented script limits: Serbian and Bosnian use Latin script, Kazakh uses Cyrillic,
                and Chinese uses Simplified characters.
              </li>
            </ul>
            <p className="mt-8 border-t border-line pt-5 text-xs leading-relaxed text-ink-faint">
              Source: the supported-language lists published by {CATALOGUE_META.provider}, our speech technology
              provider, for speech recognition, translation and text-to-speech (retrieved{" "}
              {formatDate(CATALOGUE_META.retrievedAt)}). Native language names follow the Unicode CLDR.
            </p>
          </div>
        </div>
      </section>

      <VoiceContact />
    </>
  );
}
