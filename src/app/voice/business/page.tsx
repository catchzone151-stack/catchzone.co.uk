import type { Metadata } from "next";
import Link from "next/link";
import { VoiceContact } from "@/components/voice/VoiceContact";
import { VoiceSubnav } from "@/components/voice/VoiceSubnav";
import { VoiceIntentButton } from "@/components/voice/VoiceIntentButton";
import { Reveal } from "@/components/ui/Reveal";
import { LANGUAGE_COUNT } from "@/data/voice/languages";
import { jsonLd, pageMetadata } from "@/lib/seo";
import { VoiceDemoCta } from "@/components/voice/VoiceDemoCta";

const title = "Voice Translation for Contact Centres | CatchZone Voice";
const description =
  "Real-time voice translation for contact centres, travel, booking and hospitality teams. Help advisers support customers in their preferred language.";

export const metadata: Metadata = pageMetadata({
  title,
  description,
  path: "/voice/business",
  image: { url: "/og/catchzone-voice.png", width: 1200, height: 630, alt: "CatchZone Voice" },
});

const AUDIENCES = [
  {
    title: "Contact centres",
    body: "Let advisers handle calls in languages they don’t speak, instead of transferring, queuing for an interpreter or calling back.",
  },
  {
    title: "International travel support",
    body: "Help travellers with itineraries, changes and disruption in their own language, wherever they are calling from.",
  },
  {
    title: "Booking & reservations",
    body: "Take and amend bookings with names, dates and reference numbers captured in captions on both sides.",
  },
  {
    title: "Hospitality support",
    body: "Give guests a clear answer before and during their stay, without relying on whoever happens to share their language.",
  },
  {
    title: "Other multilingual voice enquiries",
    body: "Any team that regularly takes spoken enquiries from people who prefer, or need, a different language.",
  },
];

const BENEFITS = [
  "Communicate across language barriers in live conversation.",
  "Support customers in their preferred supported language.",
  "Help advisers understand requests through translated speech and captions.",
  "Use business-specific terminology where it has been configured.",
  "Fit translation around existing customer-service workflows through assessed integration options.",
];

const FAQS = [
  {
    q: "How does real-time voice translation work?",
    a: "Each person speaks normally in their own language. Their speech is recognised as it is spoken, translated into the other person’s language, and then read aloud and shown as a caption. Recognition, translation and speech synthesis are separate stages, so the overall delay depends on the phrase, the languages and network conditions.",
  },
  {
    q: "Which languages are supported?",
    a: `CatchZone Voice supports ${LANGUAGE_COUNT} languages for speech recognition, translation and spoken output, and can translate between any two of them. The full, searchable list is on our languages page. Accuracy varies with language, accent, audio quality and subject matter, so we recommend testing your key languages in a private demonstration.`,
  },
  {
    q: "Do advisers need special headsets?",
    a: "No specialist hardware is required, but a good-quality headset with a microphone is strongly recommended. It keeps the translated audio out of the microphone and gives clearer recognition than laptop speakers and microphones.",
  },
  {
    q: "What happens to conversation data?",
    a: "In the public demo on this site, CatchZone does not record or store audio, transcripts or translations — audio is streamed from the browser to our speech technology provider, Soniox, for processing. For a business deployment, data handling, retention and processing region are agreed with you during the technical assessment and documented before go-live.",
  },
  {
    q: "Can CatchZone Voice integrate with our phone or contact-centre system?",
    a: "Possibly — it depends on your platform. Integration is planned case by case and may involve approved APIs, embedded interfaces or supported audio-routing arrangements. Every integration is subject to a technical assessment and implementation work; we don’t offer a universal plug-in for all telephony systems.",
  },
  {
    q: "Is the live demo the full product?",
    a: "No. The public demo is a short, single-person trial of live translation in your browser. A guided demonstration shows CatchZone Voice in a realistic two-person adviser and customer conversation, using your languages and scenarios.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

export default function VoiceBusinessPage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLd(faqJsonLd) }}
      />
      <VoiceSubnav
        current="/voice/business"
        breadcrumb={[
          { name: "Home", href: "/" },
          { name: "CatchZone Voice", href: "/voice" },
          { name: "For Business", href: "/voice/business" },
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-[480px]"
          style={{
            background:
              "radial-gradient(40% 60% at 80% 0%, rgba(139,92,246,0.13), transparent 70%), radial-gradient(35% 55% at 10% 30%, rgba(94,234,212,0.08), transparent 70%)",
          }}
          aria-hidden="true"
        />
        <div className="shell relative grid gap-12 pt-10 pb-16 md:pt-14 md:pb-24 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">
              CatchZone Voice · For customer service teams
            </p>
            <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.04] text-ink sm:text-5xl md:text-6xl">
              Built for multilingual customer service.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-ink-muted md:text-lg">
              Real-time voice translation that helps your advisers understand callers and be understood — so
              customers can be supported in their preferred language, even when nobody on shift speaks it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <VoiceIntentButton
                intent="demonstration"
                className="min-h-[48px] rounded-full bg-ink px-6 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
              >
                Book a Demonstration
              </VoiceIntentButton>
              <VoiceDemoCta
                bookLabel="Explore the Conversation Studio"
                bookHref="/voice#studio"
                className="group inline-flex min-h-[48px] items-center gap-2 rounded-full border border-white/15 px-6 text-sm font-semibold text-ink transition-colors hover:border-accent-cyan/60 hover:text-accent-cyan"
              />
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
            {[
              { k: "Languages", v: String(LANGUAGE_COUNT) },
              { k: "Direction", v: "Two-way" },
              { k: "Output", v: "Voice + captions" },
              { k: "Integration", v: "Assessed per client" },
            ].map((s) => (
              <div key={s.k} className="bg-surface px-5 py-5">
                <dt className="mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">{s.k}</dt>
                <dd className="mt-1 font-display text-lg font-bold text-ink sm:text-xl">{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Audiences */}
      <section aria-labelledby="audiences-title" className="border-t border-line py-20 md:py-28">
        <div className="shell">
          <Reveal className="max-w-2xl">
            <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">Where it helps</p>
            <h2 id="audiences-title" className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
              For teams that answer the phone in more than one language.
            </h2>
          </Reveal>
          <ul className="mt-12 grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
            {AUDIENCES.map((a, i) => (
              <li key={a.title} className="border-t border-line pt-5">
                <span className="mono text-xs text-accent-cyan">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-3 font-display text-xl font-bold text-ink">{a.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{a.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Benefits */}
      <section aria-labelledby="benefits-title" className="border-t border-line py-20 md:py-28">
        <div className="shell grid gap-12 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">What changes</p>
            <h2 id="benefits-title" className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Multilingual customer support without a shared language.
            </h2>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-muted">
              Your advisers keep their own language. Customers keep theirs. CatchZone Voice carries the conversation
              in between.
            </p>
          </Reveal>
          <ul className="space-y-4">
            {BENEFITS.map((b) => (
              <li key={b} className="flex gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
                <svg viewBox="0 0 20 20" className="mt-0.5 h-5 w-5 shrink-0 text-accent-cyan" aria-hidden="true">
                  <path d="M4 10.5l4 4 8-9" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-base leading-relaxed text-ink">{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Integration */}
      <section aria-labelledby="integration-title" className="border-t border-line py-20 md:py-28">
        <div className="shell">
          <Reveal className="max-w-2xl">
            <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">Integration</p>
            <h2 id="integration-title" className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Designed to fit your workflow.
            </h2>
            <p className="mt-5 text-base leading-relaxed text-ink-muted">
              There are two broad ways to bring CatchZone Voice into your operation. Which one fits depends on your
              systems, call flows and requirements — and we confirm it with you before anything is built.
            </p>
          </Reveal>
          <div className="mt-12 grid gap-4 md:grid-cols-2">
            {[
              {
                n: "Route 1",
                title: "Browser-based voice conversations",
                body: "Advisers and customers use CatchZone Voice in a web browser. It is the most direct route, suited to evaluation and to teams that can run conversations through a browser session.",
              },
              {
                n: "Route 2",
                title: "Integration with your communication systems",
                body: "A customer-specific integration with the systems your advisers already use. Planning may involve approved APIs, embedded interfaces and supported audio-routing arrangements, and is always subject to technical assessment and implementation.",
              },
            ].map((r) => (
              <article key={r.n} className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(18,20,26,0.8),rgba(10,11,14,0.8))] light:bg-[linear-gradient(180deg,#ffffff,#f3f2ee)] p-7 md:p-9">
                <p className="mono text-[11px] uppercase tracking-[0.2em] text-accent-cyan">{r.n}</p>
                <h3 className="mt-4 font-display text-2xl font-bold text-ink">{r.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">{r.body}</p>
              </article>
            ))}
          </div>
          <ol className="mt-12 grid gap-6 border-t border-line pt-10 md:grid-cols-3">
            {[
              { t: "Demonstration", d: "See it working with your languages and typical calls." },
              { t: "Technical assessment", d: "We review your systems, audio routing, data and security requirements." },
              { t: "Implementation", d: "An agreed integration scope, tested with your team before go-live." },
            ].map((s, i) => (
              <li key={s.t} className="flex gap-4">
                <span className="mono flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-xs text-ink">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-semibold text-ink">{s.t}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section aria-labelledby="faq-title" className="border-t border-line py-20 md:py-28">
        <div className="shell grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
          <div>
            <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">FAQ</p>
            <h2 id="faq-title" className="mt-4 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-5 text-sm leading-relaxed text-ink-muted">
              Can’t find your answer?{" "}
              <a href="mailto:info@catchzone.co.uk" className="text-accent-cyan underline decoration-accent-cyan/40 underline-offset-2 hover:decoration-accent-cyan">
                info@catchzone.co.uk
              </a>
            </p>
          </div>
          <div className="divide-y divide-line border-y border-line">
            {FAQS.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex min-h-[44px] cursor-pointer list-none items-center justify-between gap-6 text-left [&::-webkit-details-marker]:hidden">
                  <h3 className="font-display text-lg font-bold text-ink">{f.q}</h3>
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-ink-muted transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-ink-muted">
                  {f.a}
                  {f.q.startsWith("Which languages") && (
                    <>
                      {" "}
                      <Link href="/voice/languages" className="text-accent-cyan underline decoration-accent-cyan/40 underline-offset-2 hover:decoration-accent-cyan">
                        See all supported languages
                      </Link>
                      .
                    </>
                  )}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <VoiceContact />
    </>
  );
}
