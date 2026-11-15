import Link from "next/link";
import { ProductLogo } from "@/components/brand/ProductLogo";
import { VoiceWaveform } from "@/components/voice/VoiceWaveform";
import { SchoolHrMiniFlow } from "@/components/products/SchoolHrMiniFlow";
import { Reveal } from "@/components/ui/Reveal";

/** Compact two-product summary used on the Services page. */
export function ProductCards({ headingLevel = 3 }: { headingLevel?: 2 | 3 }) {
  const H = headingLevel === 2 ? "h2" : "h3";
  return (
    <div className="product-contrast grid gap-5 lg:grid-cols-2">
      <Reveal className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-surface p-6 transition-colors hover:border-accent-cyan/30 sm:p-8">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ background: "radial-gradient(60% 50% at 85% 0%, rgb(var(--accent-iris-rgb) / 0.12), transparent 70%)" }}
          aria-hidden="true"
        />
        <div className="relative flex items-start justify-between gap-4">
          <ProductLogo product="voice" size="small" className="h-auto w-[200px] sm:w-[230px]" />
          <span className="mono shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-ink-muted">
            Private demos
          </span>
        </div>
        <div className="relative mt-6 h-16 overflow-hidden rounded-2xl border border-white/[0.06] bg-void/60">
          <VoiceWaveform idleAmplitude={0.16} className="h-full w-full" />
        </div>
        <H className="relative mt-6 font-display text-xl font-bold text-ink">Live two-way voice translation</H>
        <p className="relative mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
          Two people speak their own languages; each side is recognised, translated and spoken back with live
          captions while the conversation flows.
        </p>
        <Link
          href="/voice"
          className="relative mt-6 inline-flex items-center gap-2 self-start text-sm font-semibold text-accent-cyan transition-colors hover:text-ink"
        >
          Explore CatchZone Voice <span aria-hidden="true">→</span>
        </Link>
      </Reveal>

      <Reveal
        delay={0.06}
        className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-surface p-6 transition-colors hover:border-accent-cyan/30 sm:p-8"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{ background: "radial-gradient(60% 50% at 85% 0%, rgb(var(--accent-cyan-rgb) / 0.12), transparent 70%)" }}
          aria-hidden="true"
        />
        <div className="relative flex items-start justify-between gap-4">
          <ProductLogo product="school-hr" className="-my-2 h-[84px] w-auto sm:h-[92px]" />
          <span className="mono shrink-0 rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.16em] text-ink-muted">
            In development
          </span>
        </div>
        <SchoolHrMiniFlow className="relative mt-4" />
        <H className="relative mt-6 font-display text-xl font-bold text-ink">Staff self-service and HR workflows for schools</H>
        <p className="relative mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
          Additional hours, leave, TOIL and return-to-work forms, routed to the right approver and kept on record —
          currently in development ahead of a first school pilot.
        </p>
        <Link
          href="/school-hr"
          className="relative mt-6 inline-flex items-center gap-2 self-start text-sm font-semibold text-accent-cyan transition-colors hover:text-ink"
        >
          Explore CatchZone School HR <span aria-hidden="true">→</span>
        </Link>
      </Reveal>
    </div>
  );
}
