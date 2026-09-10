"use client";

import { motion } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { viewport as viewportToken } from "@/lib/motion/tokens";

const CYAN = "#5eead4";
const IRIS = "#6e62e5";

function drawProps(delay: number, reducedMotion: boolean) {
  if (reducedMotion) return { pathLength: 1, opacity: 1 };
  return {
    initial: { pathLength: 0, opacity: 1 },
    whileInView: { pathLength: 1 },
    viewport: viewportToken,
    transition: { duration: 0.7, delay, ease: [0.65, 0, 0.35, 1] as const },
  };
}

function materializeProps(delay: number, reducedMotion: boolean) {
  if (reducedMotion) return { opacity: 1 };
  return {
    initial: { opacity: 0 },
    whileInView: { opacity: 1 },
    viewport: viewportToken,
    transition: { duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] as const },
  };
}

/**
 * The one signature "sketch-to-build" moment: a line sketches the phone,
 * then a browser/web surface, then a backend/system cluster in sequence —
 * then the line drawing gains material (solid fills, screen glow), and a
 * single mint pulse sweeps across the finished composition. Reserved for
 * this one transition, not repeated as a general-purpose effect.
 */
export function SketchToBuild() {
  const reducedMotion = useReducedMotion();
  const draw = (delay: number) => drawProps(delay, reducedMotion);
  const materialize = (delay: number) => materializeProps(delay, reducedMotion);

  return (
    <section className="relative overflow-hidden border-t border-line bg-void py-20 md:py-28">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 50% at 50% 40%, rgba(94,234,212,0.05), transparent 70%)",
        }}
        aria-hidden="true"
      />
      <div className="shell relative">
        <p className="mono text-center text-xs uppercase tracking-[0.3em] text-ink-faint">
          Idea → Structure → Product → Connected System
        </p>

        <svg
          viewBox="0 0 900 320"
          className="mx-auto mt-10 h-auto w-full max-w-4xl"
          aria-hidden="true"
        >
          {/* connectors */}
          <motion.line x1="160" y1="150" x2="330" y2="150" stroke={IRIS} strokeWidth="1" strokeOpacity="0.5" {...draw(0.55)} />
          <motion.line x1="560" y1="150" x2="700" y2="150" stroke={IRIS} strokeWidth="1" strokeOpacity="0.5" {...draw(1.35)} />

          {/* phone sketch */}
          <motion.rect x="70" y="70" width="90" height="170" rx="14" fill="none" stroke={CYAN} strokeWidth="1.4" {...draw(0)} />
          <motion.line x1="95" y1="225" x2="135" y2="225" stroke={CYAN} strokeWidth="1.4" {...draw(0.35)} />
          {/* phone materialises */}
          <motion.rect x="78" y="86" width="74" height="122" rx="6" fill={CYAN} fillOpacity="0.08" stroke="none" {...materialize(2.1)} />
          <motion.rect x="86" y="98" width="58" height="10" rx="2" fill={CYAN} fillOpacity="0.55" stroke="none" {...materialize(2.3)} />
          <motion.rect x="86" y="116" width="40" height="8" rx="2" fill="#e6ebf0" fillOpacity="0.35" stroke="none" {...materialize(2.4)} />

          {/* browser sketch */}
          <motion.rect x="330" y="90" width="230" height="140" rx="8" fill="none" stroke={CYAN} strokeWidth="1.4" {...draw(0.75)} />
          <motion.line x1="330" y1="112" x2="560" y2="112" stroke={CYAN} strokeWidth="1.2" {...draw(1)} />
          <motion.circle cx="345" cy="101" r="2.6" fill="none" stroke={CYAN} strokeWidth="1" {...draw(1.05)} />
          <motion.circle cx="356" cy="101" r="2.6" fill="none" stroke={IRIS} strokeWidth="1" {...draw(1.1)} />
          {/* browser materialises */}
          <motion.rect x="345" y="128" width="90" height="46" rx="4" fill={CYAN} fillOpacity="0.14" stroke="none" {...materialize(2.5)} />
          <motion.rect x="445" y="128" width="95" height="46" rx="4" fill={IRIS} fillOpacity="0.12" stroke="none" {...materialize(2.6)} />
          <motion.rect x="345" y="184" width="195" height="18" rx="3" fill="#e6ebf0" fillOpacity="0.12" stroke="none" {...materialize(2.7)} />

          {/* backend / system sketch */}
          {[80, 140, 200].map((y, i) => (
            <motion.rect
              key={y}
              x="700"
              y={y}
              width="140"
              height="44"
              rx="6"
              fill="none"
              stroke={IRIS}
              strokeWidth="1.4"
              {...draw(1.55 + i * 0.15)}
             
            />
          ))}
          <motion.line x1="770" y1="80" x2="770" y2="244" stroke={IRIS} strokeWidth="1" strokeOpacity="0.4" {...draw(2)} />
          {/* backend materialises — small lit ports on each rack unit */}
          {[102, 162, 222].map((y, i) => (
            <motion.circle
              key={y}
              cx="716"
              cy={y}
              r="3.2"
              fill={i === 1 ? CYAN : IRIS}
              stroke="none"
              {...materialize(2.8 + i * 0.1)}
            />
          ))}

          {/* final mint pulse sweeping across the whole composition */}
          {!reducedMotion && (
            <motion.rect
              x="-80"
              y="0"
              width="80"
              height="320"
              fill="url(#sketchPulse)"
              initial={{ x: -80, opacity: 0 }}
              whileInView={{ x: 900, opacity: [0, 0.9, 0] }}
              viewport={viewportToken}
              transition={{ duration: 1.3, delay: 3.1, ease: [0.65, 0, 0.35, 1] }}
            />
          )}
          <defs>
            <linearGradient id="sketchPulse" x1="0" x2="1" y1="0" y2="0">
              <stop offset="0%" stopColor={CYAN} stopOpacity="0" />
              <stop offset="50%" stopColor={CYAN} stopOpacity="0.5" />
              <stop offset="100%" stopColor={CYAN} stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </section>
  );
}
