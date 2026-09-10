"use client";

import { useId, useMemo, useState } from "react";
import { motion } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

interface EcosystemNode {
  id: string;
  label: string;
  angle: number;
  description: string;
  accent: string;
}

const CYAN = "#5eead4";
const IRIS = "#6e62e5";

const nodes: EcosystemNode[] = [
  { id: "website", label: "Website", angle: -90, accent: CYAN, description: "The customer-facing front door — marketing, conversion and the first impression of the product." },
  { id: "app", label: "App", angle: -38.5, accent: CYAN, description: "The mobile or web product your customers use directly, sharing accounts and data with everything else." },
  { id: "backend", label: "Backend", angle: 12.85, accent: IRIS, description: "The application logic and APIs that connect every surface to the same source of truth." },
  { id: "database", label: "Database", angle: 64.3, accent: IRIS, description: "Structured, secure storage for accounts, content and activity — designed to scale with the business." },
  { id: "admin", label: "Admin System", angle: 115.7, accent: IRIS, description: "The operational dashboard your team uses to run the business day to day." },
  { id: "automation", label: "Automation", angle: 167.14, accent: CYAN, description: "Workflows that move data and trigger actions automatically, removing repetitive manual work." },
  { id: "apis", label: "External APIs", angle: 218.57, accent: IRIS, description: "Connections to the payment providers, comms tools and third-party services the business already relies on." },
];

const RADIUS = 40;

function nodePosition(angle: number) {
  const rad = (angle * Math.PI) / 180;
  return { x: 50 + RADIUS * Math.cos(rad), y: 50 + RADIUS * Math.sin(rad) };
}

/** A slight outward bow gives the spokes an engineered, circuit-like curve instead of dead-straight lines. */
function spokePath(pos: { x: number; y: number }) {
  const mx = (50 + pos.x) / 2 + (pos.y - 50) * 0.06;
  const my = (50 + pos.y) / 2 - (pos.x - 50) * 0.06;
  return `M 50 50 Q ${mx} ${my} ${pos.x} ${pos.y}`;
}

function NodeGlyph({ id }: { id: string }) {
  const common = { viewBox: "0 0 32 32", className: "h-5 w-5", "aria-hidden": true } as const;
  switch (id) {
    case "website":
      return (
        <svg {...common}>
          <rect x="4" y="7" width="24" height="18" rx="1.5" stroke="currentColor" strokeWidth="1.3" fill="none" />
          <line x1="4" y1="12" x2="28" y2="12" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "app":
      return (
        <svg {...common}>
          <rect x="10" y="4" width="12" height="24" rx="2" stroke="currentColor" strokeWidth="1.3" fill="none" />
          <line x1="13" y1="24" x2="19" y2="24" stroke="currentColor" strokeWidth="1.1" />
        </svg>
      );
    case "backend":
      return (
        <svg {...common}>
          <circle cx="16" cy="16" r="3.2" stroke="currentColor" strokeWidth="1.3" fill="none" />
          <circle cx="6" cy="8" r="1.6" fill="currentColor" />
          <circle cx="26" cy="8" r="1.6" fill="currentColor" />
          <circle cx="16" cy="26" r="1.6" fill="currentColor" />
          <line x1="13.4" y1="14" x2="7" y2="9" stroke="currentColor" strokeWidth="1" opacity="0.6" />
          <line x1="18.6" y1="14" x2="25" y2="9" stroke="currentColor" strokeWidth="1" opacity="0.6" />
          <line x1="16" y1="19.2" x2="16" y2="24.4" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        </svg>
      );
    case "database":
      return (
        <svg {...common}>
          {[6, 12.5, 19, 25.5].map((y) => (
            <ellipse key={y} cx="16" cy={y} rx="9" ry="2.6" stroke="currentColor" strokeWidth="1.1" fill="none" />
          ))}
        </svg>
      );
    case "admin":
      return (
        <svg {...common}>
          <rect x="4" y="5" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <rect x="18" y="5" width="10" height="5" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <rect x="18" y="13" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
          <rect x="4" y="17" width="10" height="9" rx="1" stroke="currentColor" strokeWidth="1.2" fill="none" />
        </svg>
      );
    case "automation":
      return (
        <svg {...common}>
          <path d="M6 16 L14 16 M11 12 L15 16 L11 20" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M18 16 L26 16 M23 12 L27 16 L23 20" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" strokeLinejoin="round" opacity="0.55" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M9 16h5M18 16h5M12 10l4 3-4 3M20 10l-4 3 4 3" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

export function EcosystemDiagram() {
  const [activeId, setActiveId] = useState<string>(nodes[0]!.id);
  const active = nodes.find((n) => n.id === activeId) ?? nodes[0]!;
  const headingId = useId();
  const reducedMotion = useReducedMotion();

  const paths = useMemo(
    () => nodes.map((n) => ({ id: n.id, d: spokePath(nodePosition(n.angle)) })),
    [],
  );

  return (
    <div>
      {/* Desktop / tablet: dimensional radial system diagram */}
      <div className="hidden md:block">
        <div className="relative mx-auto aspect-square w-full max-w-2xl lg:max-w-4xl">
          {/* atmospheric depth backdrop — reframes toward the active node */}
          <div
            className="pointer-events-none absolute inset-[-30%] rounded-full opacity-90 transition-[background] duration-700 ease-out"
            style={{
              background: `radial-gradient(32% 32% at ${nodePosition(active.angle).x}% ${nodePosition(active.angle).y}%, ${active.accent}26, transparent 62%), radial-gradient(circle, rgba(110,98,229,0.10) 0%, rgba(94,234,212,0.05) 45%, transparent 72%)`,
            }}
            aria-hidden="true"
          />
          {!reducedMotion && (
            <div
              className="pointer-events-none absolute inset-[-8%] rounded-full border border-line/60"
              style={{ animation: "ecosystem-spin 140s linear infinite" }}
              aria-hidden="true"
            />
          )}
          <div
            className="pointer-events-none absolute inset-0 rounded-full border border-line"
            aria-hidden="true"
          />

          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
            {/* outer cyclical customer-journey ring */}
            <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="0.3" />
            {!reducedMotion && (
              <circle
                cx="50"
                cy="50"
                r={RADIUS}
                fill="none"
                stroke={CYAN}
                strokeWidth="0.6"
                strokeLinecap="round"
                strokeDasharray="14 240"
                opacity="0.55"
              >
                <animate attributeName="stroke-dashoffset" from="0" to="-254" dur="7s" repeatCount="indefinite" />
              </circle>
            )}

            {paths.map(({ id, d }) => {
              const node = nodes.find((n) => n.id === id)!;
              const isActive = id === activeId;
              return (
                <g key={id}>
                  <path
                    id={`spoke-${id}`}
                    d={d}
                    fill="none"
                    stroke={isActive ? node.accent : "rgba(255,255,255,0.12)"}
                    strokeWidth={isActive ? 0.55 : 0.3}
                    className="transition-all duration-500 ease-out"
                  />
                  {!reducedMotion && (
                    <circle r={isActive ? 0.9 : 0.55} fill={node.accent} opacity={isActive ? 0.95 : 0.45}>
                      <animateMotion dur={`${3.2 + (node.angle % 5) * 0.3}s`} repeatCount="indefinite">
                        <mpath href={`#spoke-${id}`} />
                      </animateMotion>
                    </circle>
                  )}
                </g>
              );
            })}
          </svg>

          <motion.div
            className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-accent-cyan/40 bg-surface-raised text-center shadow-[0_0_40px_rgba(94,234,212,0.12)]"
            animate={reducedMotion ? {} : { boxShadow: ["0 0 30px rgba(94,234,212,0.10)", "0 0 48px rgba(94,234,212,0.22)", "0 0 30px rgba(94,234,212,0.10)"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="mono text-[10px] uppercase tracking-widest text-ink-faint">Your</span>
            <span className="text-sm font-semibold text-ink">Business</span>
          </motion.div>

          {nodes.map((node) => {
            const pos = nodePosition(node.angle);
            const isActive = node.id === activeId;
            return (
              <button
                key={node.id}
                type="button"
                onMouseEnter={() => setActiveId(node.id)}
                onFocus={() => setActiveId(node.id)}
                onClick={() => setActiveId(node.id)}
                aria-pressed={isActive}
                aria-describedby={headingId}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center gap-1.5 rounded-full border px-4 py-2.5 text-xs font-semibold transition-all duration-300 ease-out ${
                  isActive
                    ? "scale-110 border-accent-cyan bg-accent-cyan/10 text-accent-cyan"
                    : "border-ink/15 bg-surface text-ink-muted hover:border-ink/30 hover:text-ink"
                }`}
              >
                <span style={{ color: isActive ? node.accent : undefined }}>
                  <NodeGlyph id={node.id} />
                </span>
                {node.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mobile: tap-through list, same data and state */}
      <div className="space-y-2 md:hidden">
        {nodes.map((node) => {
          const isActive = node.id === activeId;
          return (
            <div key={node.id} className="overflow-hidden rounded-xl border border-line">
              <button
                type="button"
                onClick={() => setActiveId(isActive ? "" : node.id)}
                aria-expanded={isActive}
                className={`flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-semibold ${
                  isActive ? "text-accent-cyan" : "text-ink"
                }`}
              >
                <span style={{ color: isActive ? node.accent : "#565f6e" }}>
                  <NodeGlyph id={node.id} />
                </span>
                <span className="flex-1">{node.label}</span>
                <span aria-hidden="true">{isActive ? "−" : "+"}</span>
              </button>
              {isActive && (
                <p className="px-5 pb-4 text-sm leading-relaxed text-ink-muted">{node.description}</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Shared description panel (desktop) */}
      <motion.div
        key={active.id}
        id={headingId}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="mx-auto mt-10 hidden max-w-lg text-center md:block"
      >
        <p className="mono text-xs uppercase tracking-[0.25em]" style={{ color: active.accent }}>
          {active.label}
        </p>
        <p className="mt-3 text-base leading-relaxed text-ink-muted">{active.description}</p>
      </motion.div>
    </div>
  );
}
