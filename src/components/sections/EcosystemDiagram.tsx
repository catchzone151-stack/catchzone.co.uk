"use client";

import { useId, useState } from "react";
import { motion } from "motion/react";

interface EcosystemNode {
  id: string;
  label: string;
  angle: number;
  description: string;
}

const nodes: EcosystemNode[] = [
  {
    id: "website",
    label: "Website",
    angle: -90,
    description:
      "The customer-facing front door — marketing, conversion and the first impression of the product.",
  },
  {
    id: "app",
    label: "App",
    angle: -38.5,
    description:
      "The mobile or web product your customers use directly, sharing accounts and data with everything else.",
  },
  {
    id: "backend",
    label: "Backend",
    angle: 12.85,
    description:
      "The application logic and APIs that connect every surface to the same source of truth.",
  },
  {
    id: "database",
    label: "Database",
    angle: 64.3,
    description:
      "Structured, secure storage for accounts, content and activity — designed to scale with the business.",
  },
  {
    id: "admin",
    label: "Admin System",
    angle: 115.7,
    description:
      "The operational dashboard your team uses to run the business day to day.",
  },
  {
    id: "automation",
    label: "Automation",
    angle: 167.14,
    description:
      "Workflows that move data and trigger actions automatically, removing repetitive manual work.",
  },
  {
    id: "apis",
    label: "External APIs",
    angle: 218.57,
    description:
      "Connections to the payment providers, comms tools and third-party services the business already relies on.",
  },
];

const RADIUS = 40;

function nodePosition(angle: number) {
  const rad = (angle * Math.PI) / 180;
  return {
    x: 50 + RADIUS * Math.cos(rad),
    y: 50 + RADIUS * Math.sin(rad),
  };
}

export function EcosystemDiagram() {
  const [activeId, setActiveId] = useState<string>(nodes[0]!.id);
  const active = nodes.find((n) => n.id === activeId) ?? nodes[0]!;
  const headingId = useId();

  return (
    <div>
      {/* Desktop / tablet: radial system diagram */}
      <div className="hidden md:block">
        <div className="relative mx-auto aspect-square w-full max-w-xl">
          <svg
            viewBox="0 0 100 100"
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            {nodes.map((node) => {
              const pos = nodePosition(node.angle);
              const isActive = node.id === activeId;
              return (
                <line
                  key={node.id}
                  x1={50}
                  y1={50}
                  x2={pos.x}
                  y2={pos.y}
                  stroke={isActive ? "#5eead4" : "rgba(255,255,255,0.12)"}
                  strokeWidth={isActive ? 0.5 : 0.3}
                  className="transition-all duration-500 ease-out"
                />
              );
            })}
          </svg>

          <div className="absolute left-1/2 top-1/2 flex h-24 w-24 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-accent-cyan/40 bg-surface-raised text-center shadow-[0_0_40px_rgba(94,234,212,0.12)]">
            <span className="mono text-[10px] uppercase tracking-widest text-ink-faint">
              Your
            </span>
            <span className="text-sm font-semibold text-ink">Business</span>
          </div>

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
                style={{
                  left: `${pos.x}%`,
                  top: `${pos.y}%`,
                }}
                className={`absolute flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border px-4 py-2.5 text-xs font-semibold transition-all duration-300 ease-out ${
                  isActive
                    ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan scale-110"
                    : "border-ink/15 bg-surface text-ink-muted hover:border-ink/30 hover:text-ink"
                }`}
              >
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
                className={`flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold ${
                  isActive ? "text-accent-cyan" : "text-ink"
                }`}
              >
                {node.label}
                <span aria-hidden="true">{isActive ? "−" : "+"}</span>
              </button>
              {isActive && (
                <p className="px-5 pb-4 text-sm leading-relaxed text-ink-muted">
                  {node.description}
                </p>
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
        <p className="mono text-xs uppercase tracking-[0.25em] text-accent-cyan">
          {active.label}
        </p>
        <p className="mt-3 text-base leading-relaxed text-ink-muted">
          {active.description}
        </p>
      </motion.div>
    </div>
  );
}
