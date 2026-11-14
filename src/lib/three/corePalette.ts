/**
 * Theme-specific look of the Services "convergence core" scene (homepage
 * "What we build" and the service-page heroes). DARK values are the original
 * scene verbatim; LIGHT re-lights the same scene on a pearl studio stage with
 * silver bodies. Emissive screen panels and rings keep their glow in both.
 */
export interface CorePalette {
  name: "dark" | "light";
  background: string;
  fog: string;
  ambient: number;
  key: { color: string; intensity: number };
  irisLight: number;
  mintLight: number;
  body: { color: string; metalness: number; roughness: number };
  panel: { color: string; metalness: number; roughness: number };
  disc: { color: string; metalness: number; roughness: number };
  connector: string;
}

export const CORE_DARK: CorePalette = {
  name: "dark",
  background: "#040406",
  fog: "#040406",
  ambient: 0.45,
  key: { color: "#e6ebf0", intensity: 1.1 },
  irisLight: 1.8,
  mintLight: 1.4,
  body: { color: "#15171d", metalness: 0.75, roughness: 0.3 },
  panel: { color: "#12141a", metalness: 0.4, roughness: 0.35 },
  disc: { color: "#0d0f13", metalness: 0.6, roughness: 0.3 },
  connector: "#828b9a",
};

export const CORE_LIGHT: CorePalette = {
  name: "light",
  background: "#eef3f4",
  fog: "#eef3f4",
  ambient: 0.75,
  key: { color: "#ffffff", intensity: 1.35 },
  irisLight: 1.2,
  mintLight: 1.0,
  // low metalness: this scene has no environment map, so metal would reflect black
  body: { color: "#d3dbe1", metalness: 0.18, roughness: 0.34 },
  panel: { color: "#e6ecef", metalness: 0.12, roughness: 0.4 },
  disc: { color: "#d6dde3", metalness: 0.16, roughness: 0.34 },
  connector: "#4b5c6e",
};

export function corePalette(theme: "dark" | "light"): CorePalette {
  return theme === "light" ? CORE_LIGHT : CORE_DARK;
}
