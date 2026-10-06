/**
 * Scroll-progress windows for the homepage journey captions. Kept free of
 * three.js so the DOM layer can import them without pulling the renderer
 * into the page bundle (the canvas itself is lazy-loaded).
 */
export const beats = {
  heroOut: [0.0, 0.055] as const,
  idea: [0.15, 0.19, 0.29, 0.32] as const,
  design: [0.37, 0.405, 0.505, 0.535] as const,
  build: [0.575, 0.61, 0.7, 0.735] as const,
  ship: [0.75, 0.79, 0.9, 0.95] as const,
};
