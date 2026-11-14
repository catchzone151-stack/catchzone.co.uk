import * as THREE from "three";

/**
 * Theme-specific look of the homepage journey scene (Idea → Design → Build → Ship).
 *
 * DARK is the original, approved scene: every value below is copied verbatim
 * from the pre-theme implementation, so dark mode renders identically.
 * LIGHT is an art-directed light studio version of the SAME scene — same
 * geometry, camera, timeline, scroll mapping and UI screenshots — with
 * materials, lines, fog, floor and lighting re-tuned for a pearl stage.
 */
export interface JourneyPalette {
  name: "dark" | "light";
  background: string;
  fog: string;
  ambient: number;
  key: { color: string; intensity: number };
  rim: { color: string; intensity: number };
  envIntensity: number;
  /** Backdrop of the reflection environment (null = the original black studio). */
  envBackground: string | null;
  /** Orbit, guide line, connections, ship orbit. */
  accent: string;
  accentOpacity: number;
  /** Bright points: the guide node core and connection pulses. */
  spark: string;
  glow: { color: string; blending: THREE.Blending; opacity: number };
  floor: { color: string; metalness: number; roughness: number; mixStrength: number; mirror: number };
  floorFallback: { color: string; metalness: number; roughness: number };
  floorLights: { color: string; blending: THREE.Blending; opacityScale: number };
  gate: { color: string; metalness: number; roughness: number; line: string; lineOpacity: number };
  device: { color: string; metalness: number; roughness: number; clearcoat: number; edge: string; glare: number };
  plinth: { color: string; metalness: number; roughness: number; clearcoat: number };
  wire: { stroke: string; faint: string; fill: string };
  revealEdge: string;
}

export const JOURNEY_DARK: JourneyPalette = {
  name: "dark",
  background: "#040406",
  fog: "#040406",
  ambient: 0.14,
  key: { color: "#e2e8f2", intensity: 0.75 },
  rim: { color: "#a9b2ff", intensity: 0.45 },
  envIntensity: 0.9,
  envBackground: null,
  accent: "#5eead4",
  accentOpacity: 1,
  spark: "#e9fffb",
  glow: { color: "#5eead4", blending: THREE.AdditiveBlending, opacity: 0.75 },
  floor: { color: "#060709", metalness: 0.55, roughness: 0.92, mixStrength: 2.2, mirror: 0.75 },
  floorFallback: { color: "#07080a", metalness: 0.6, roughness: 0.55 },
  floorLights: { color: "#b9c6d9", blending: THREE.AdditiveBlending, opacityScale: 1 },
  gate: { color: "#14161b", metalness: 0.85, roughness: 0.32, line: "#c3cad6", lineOpacity: 0.26 },
  device: { color: "#1a1c21", metalness: 0.9, roughness: 0.3, clearcoat: 0.6, edge: "#d6dde8", glare: 0.32 },
  plinth: { color: "#0c0d10", metalness: 0.45, roughness: 0.42, clearcoat: 0.35 },
  wire: {
    stroke: "rgba(214, 222, 234, 0.92)",
    faint: "rgba(214, 222, 234, 0.42)",
    fill: "rgba(160, 172, 192, 0.07)",
  },
  revealEdge: "#5eead4",
};

export const JOURNEY_LIGHT: JourneyPalette = {
  name: "light",
  // pearl / soft blue-grey studio
  background: "#ebf1f2",
  fog: "#ebf1f2",
  // lower fill + stronger key keeps form shading (no washed-out flat look)
  ambient: 0.34,
  key: { color: "#ffffff", intensity: 1.45 },
  rim: { color: "#b9c3ff", intensity: 0.6 },
  envIntensity: 0.78,
  // light studio walls, so polished metal reflects a bright room instead of black
  envBackground: "#d9e2e6",
  // deeper teal so lines read on a light stage
  accent: "#0f9f8f",
  accentOpacity: 1,
  spark: "#0b8a7e",
  glow: { color: "#2dd4bf", blending: THREE.NormalBlending, opacity: 0.42 },
  // soft satin floor with a gentle reflection
  floor: { color: "#d8e1e4", metalness: 0.22, roughness: 0.84, mixStrength: 0.95, mirror: 0.5 },
  floorFallback: { color: "#e0e8ea", metalness: 0.2, roughness: 0.8 },
  floorLights: { color: "#ffffff", blending: THREE.NormalBlending, opacityScale: 1.7 },
  // brushed steel frames with slate edge lines
  gate: { color: "#c5cfd6", metalness: 0.62, roughness: 0.34, line: "#3e5063", lineOpacity: 0.42 },
  // silver aluminium devices; charcoal construction outlines
  device: { color: "#d6dde3", metalness: 0.7, roughness: 0.28, clearcoat: 0.6, edge: "#2b394a", glare: 0.16 },
  // white ceramic plinth
  plinth: { color: "#e6ecef", metalness: 0.18, roughness: 0.42, clearcoat: 0.55 },
  wire: {
    stroke: "rgba(26, 38, 52, 0.96)",
    faint: "rgba(26, 38, 52, 0.46)",
    fill: "rgba(70, 96, 120, 0.07)",
  },
  revealEdge: "#0fb5a3",
};

export function journeyPalette(theme: "dark" | "light"): JourneyPalette {
  return theme === "light" ? JOURNEY_LIGHT : JOURNEY_DARK;
}
