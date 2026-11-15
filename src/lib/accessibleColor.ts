/**
 * Minimal colour adjustment for WCAG AA text contrast (4.5:1, with a small
 * margin). A brand colour that already passes is returned unchanged;
 * otherwise it is mixed toward white (dark theme) or black (light theme) in
 * small steps until it passes against every surface it can sit on — keeping
 * its hue. Used for showcase case-study accent TEXT only.
 */
const DARK_SURFACES = ["#040406", "#0a0b0e", "#12141a", "#17191f", "#181a1f", "#1a1c22"];
const LIGHT_SURFACES = ["#f7f8f6", "#f2f5f6", "#fcfdfc", "#eef2f3", "#e9eef0"];
const TARGET = 4.6;

function channels(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16)) as [number, number, number];
}
function luminance(hex: string): number {
  const [r, g, b] = channels(hex).map((c) => {
    const v = c / 255;
    return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  }) as [number, number, number];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
export function contrastRatio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x) as [number, number];
  return (hi + 0.05) / (lo + 0.05);
}
function mix(hex: string, toWhite: boolean, k: number): string {
  const t = toWhite ? 255 : 0;
  return `#${channels(hex)
    .map((c) => Math.round(c + (t - c) * k).toString(16).padStart(2, "0"))
    .join("")}`;
}
function adjust(hex: string, surfaces: string[], toWhite: boolean): string {
  const passes = (c: string) => surfaces.every((s) => contrastRatio(c, s) >= TARGET);
  if (passes(hex)) return hex;
  for (let i = 1; i < 200; i++) {
    const c = mix(hex, toWhite, i / 200);
    if (passes(c)) return c;
  }
  return toWhite ? "#ffffff" : "#000000";
}

/** CSS custom properties for `.sc-accent-text` (see globals.css). */
export function accentTextVars(hex: string): React.CSSProperties {
  return { ["--sc-d" as string]: adjust(hex, DARK_SURFACES, true), ["--sc-l" as string]: adjust(hex, LIGHT_SURFACES, false) };
}
