import { VoiceEnquiryForm } from "@/components/voice/VoiceEnquiryForm";
import { VoiceIntentButton } from "@/components/voice/VoiceIntentButton";

/** Consistent bottom contact section for every CatchZone Voice page. */
export function VoiceContact() {
  return (
    <section
      id="voice-contact"
      aria-labelledby="voice-contact-title"
      className="relative isolate scroll-mt-24 overflow-hidden border-t border-line bg-void py-20 md:py-28"
    >
      <div
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(40% 50% at 10% 20%, rgba(94,234,212,0.08), transparent 70%), radial-gradient(45% 55% at 95% 90%, rgba(139,92,246,0.12), transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div className="shell grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
        <div>
          <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">Talk to CatchZone</p>
          <h2 id="voice-contact-title" className="mt-5 font-display text-3xl font-bold leading-tight text-ink sm:text-4xl md:text-5xl">
            Let’s make every conversation count.
          </h2>
          <p className="mt-5 max-w-md text-base leading-relaxed text-ink-muted md:text-lg">
            See CatchZone Voice working with your languages and scenarios, or tell us how your team handles
            multilingual calls today.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <VoiceIntentButton
              intent="demonstration"
              className="min-h-[48px] rounded-full bg-ink px-6 text-sm font-semibold text-void transition-colors hover:bg-accent-cyan"
            >
              Book a Demonstration
            </VoiceIntentButton>
            <VoiceIntentButton
              intent="requirements"
              className="min-h-[48px] rounded-full border border-white/15 px-6 text-sm font-semibold text-ink transition-colors hover:border-accent-cyan/60 hover:text-accent-cyan"
            >
              Discuss Your Requirements
            </VoiceIntentButton>
          </div>
          <dl className="mt-10 space-y-4 border-t border-line pt-8 text-sm">
            <div>
              <dt className="mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Email</dt>
              <dd className="mt-1">
                <a href="mailto:info@catchzone.co.uk" className="text-ink transition-colors hover:text-accent-cyan">
                  info@catchzone.co.uk
                </a>
              </dd>
            </div>
            <div>
              <dt className="mono text-[11px] uppercase tracking-[0.2em] text-ink-faint">Company</dt>
              <dd className="mt-1 text-ink-muted">CatchZone Voice — a product by CatchZone Ltd.</dd>
            </div>
          </dl>
        </div>
        <VoiceEnquiryForm />
      </div>
    </section>
  );
}
