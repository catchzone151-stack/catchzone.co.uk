import * as THREE from "three";
import type { ScreenId } from "@/lib/three/journeyTimeline";

/**
 * Wireframes for the three Brookmere Academy screens used in the homepage
 * journey. Each layout traces the real screenshot's structure (sidebar,
 * cards, rows, tab bar…) so the IDEA-stage sketch visibly becomes that
 * exact interface during DESIGN. Coordinates are UV fractions, origin
 * top-left.
 */

type Rect = [number, number, number, number];

type Prim =
  | { k: "rect"; r: Rect; radius?: number; dash?: boolean; fill?: boolean }
  | { k: "text"; r: Rect; lines: number }
  | { k: "heading"; r: Rect }
  | { k: "circle"; c: [number, number]; rad: number }
  | { k: "img"; r: Rect }
  | { k: "tiles"; r: Rect; cols: number; rows: number }
  | { k: "vline"; x: number; y0: number; y1: number }
  | { k: "hline"; y: number; x0: number; x1: number };

function navItems(x0: number, x1: number, y0: number, step: number, n: number): Prim[] {
  const items: Prim[] = [];
  for (let i = 0; i < n; i += 1) {
    const y = y0 + i * step;
    items.push({ k: "rect", r: [x0, y - 0.012, x0 + 0.018, y + 0.012], radius: 3 });
    items.push({ k: "text", r: [x0 + 0.03, y - 0.008, x1, y + 0.008], lines: 1 });
  }
  return items;
}

function rows(
  r: Rect,
  n: number,
  kind: "date" | "avatar" | "icon",
  withBadge = false,
): Prim[] {
  const out: Prim[] = [];
  const h = (r[3] - r[1]) / n;
  for (let i = 0; i < n; i += 1) {
    const y0 = r[1] + i * h + h * 0.18;
    const y1 = r[1] + (i + 1) * h - h * 0.18;
    const iconW = (y1 - y0) * 0.66;
    if (kind === "avatar") {
      out.push({ k: "circle", c: [r[0] + iconW * 0.5, (y0 + y1) / 2], rad: iconW * 0.5 });
    } else {
      out.push({ k: "rect", r: [r[0], y0, r[0] + iconW, y1], radius: 5 });
    }
    out.push({ k: "text", r: [r[0] + iconW + 0.02, y0 + (y1 - y0) * 0.15, r[2] - 0.06, y1 - (y1 - y0) * 0.15], lines: 2 });
    if (withBadge) out.push({ k: "circle", c: [r[2] - 0.02, (y0 + y1) / 2], rad: 0.012 });
    if (i < n - 1) out.push({ k: "hline", y: r[1] + (i + 1) * h, x0: r[0], x1: r[2] });
  }
  return out;
}

const DESKTOP: Prim[] = [
  { k: "rect", r: [0.006, 0.01, 0.994, 0.99], radius: 10, dash: true },
  { k: "rect", r: [0.014, 0.02, 0.215, 0.98], radius: 8, fill: true },
  { k: "circle", c: [0.055, 0.058], rad: 0.022 },
  { k: "heading", r: [0.09, 0.04, 0.18, 0.06] },
  { k: "text", r: [0.09, 0.066, 0.15, 0.078], lines: 1 },
  { k: "rect", r: [0.024, 0.145, 0.205, 0.195], radius: 6 },
  ...navItems(0.04, 0.15, 0.17, 0.065, 10),
  { k: "circle", c: [0.785, 0.045], rad: 0.011 },
  { k: "circle", c: [0.838, 0.045], rad: 0.022 },
  { k: "text", r: [0.87, 0.038, 0.95, 0.052], lines: 1 },
  { k: "heading", r: [0.25, 0.1, 0.52, 0.14] },
  { k: "text", r: [0.25, 0.158, 0.64, 0.18], lines: 1 },
  // children cards
  ...[0.25, 0.625].flatMap((x): Prim[] => [
    { k: "rect", r: [x, 0.22, x + 0.36, 0.515], radius: 10 },
    { k: "circle", c: [x + 0.065, 0.325], rad: 0.042 },
    { k: "heading", r: [x + 0.13, 0.29, x + 0.25, 0.312] },
    { k: "text", r: [x + 0.13, 0.322, x + 0.19, 0.338], lines: 1 },
    { k: "tiles", r: [x + 0.015, 0.39, x + 0.345, 0.495], cols: 3, rows: 1 },
  ]),
  // upcoming events
  { k: "rect", r: [0.25, 0.545, 0.6, 0.975], radius: 10 },
  { k: "heading", r: [0.265, 0.572, 0.38, 0.592] },
  ...rows([0.27, 0.615, 0.585, 0.965], 3, "date"),
  // messages
  { k: "rect", r: [0.625, 0.545, 0.985, 0.975], radius: 10 },
  { k: "heading", r: [0.64, 0.572, 0.76, 0.592] },
  ...rows([0.64, 0.61, 0.97, 0.965], 4, "avatar"),
];

const TABLET: Prim[] = [
  { k: "rect", r: [0.006, 0.01, 0.994, 0.99], radius: 10, dash: true },
  { k: "rect", r: [0.014, 0.02, 0.22, 0.98], radius: 8, fill: true },
  { k: "circle", c: [0.06, 0.06], rad: 0.024 },
  { k: "heading", r: [0.095, 0.04, 0.19, 0.062] },
  { k: "text", r: [0.095, 0.07, 0.16, 0.082], lines: 1 },
  { k: "rect", r: [0.02, 0.148, 0.21, 0.198], radius: 6 },
  ...navItems(0.04, 0.16, 0.173, 0.068, 10),
  { k: "circle", c: [0.79, 0.04], rad: 0.011 },
  { k: "circle", c: [0.84, 0.04], rad: 0.022 },
  { k: "text", r: [0.87, 0.033, 0.95, 0.047], lines: 1 },
  { k: "heading", r: [0.255, 0.1, 0.4, 0.135] },
  { k: "text", r: [0.255, 0.152, 0.55, 0.172], lines: 1 },
  { k: "text", r: [0.8, 0.12, 0.97, 0.135], lines: 1 },
  // timetable
  { k: "rect", r: [0.255, 0.205, 0.6, 0.665], radius: 10 },
  { k: "heading", r: [0.27, 0.232, 0.4, 0.252] },
  ...[0.29, 0.365, 0.44, 0.515, 0.59].flatMap((y): Prim[] => [
    { k: "text", r: [0.28, y, 0.31, y + 0.04], lines: 2 },
    { k: "vline", x: 0.34, y0: y - 0.005, y1: y + 0.045 },
    { k: "text", r: [0.36, y, 0.5, y + 0.04], lines: 2 },
  ]),
  // grades
  { k: "rect", r: [0.625, 0.205, 0.985, 0.565], radius: 10 },
  { k: "heading", r: [0.64, 0.232, 0.76, 0.252] },
  { k: "tiles", r: [0.638, 0.275, 0.972, 0.5], cols: 3, rows: 2 },
  // progress
  { k: "rect", r: [0.625, 0.58, 0.985, 0.855], radius: 10 },
  { k: "heading", r: [0.64, 0.605, 0.74, 0.625] },
  { k: "circle", c: [0.697, 0.745], rad: 0.056 },
  { k: "circle", c: [0.697, 0.745], rad: 0.042 },
  ...[0.675, 0.72, 0.765, 0.81].flatMap((y): Prim[] => [
    { k: "text", r: [0.77, y - 0.006, 0.86, y + 0.006], lines: 1 },
    { k: "rect", r: [0.875, y - 0.006, 0.935, y + 0.006], radius: 3 },
  ]),
  // recent assignments
  { k: "rect", r: [0.255, 0.685, 0.6, 0.995], radius: 10 },
  { k: "heading", r: [0.27, 0.708, 0.42, 0.728] },
  ...rows([0.27, 0.745, 0.585, 0.985], 3, "icon", true),
  // quote
  { k: "rect", r: [0.625, 0.88, 0.985, 0.985], radius: 10 },
  { k: "circle", c: [0.655, 0.932], rad: 0.014 },
  { k: "text", r: [0.7, 0.905, 0.9, 0.96], lines: 2 },
];

const PHONE: Prim[] = [
  { k: "rect", r: [0.012, 0.006, 0.988, 0.994], radius: 30, dash: true },
  { k: "rect", r: [0.02, 0.01, 0.98, 0.1], radius: 18, fill: true },
  { k: "circle", c: [0.12, 0.052], rad: 0.055 },
  { k: "heading", r: [0.21, 0.035, 0.42, 0.055] },
  { k: "circle", c: [0.74, 0.052], rad: 0.028 },
  { k: "circle", c: [0.88, 0.052], rad: 0.05 },
  { k: "circle", c: [0.14, 0.168], rad: 0.085 },
  { k: "heading", r: [0.27, 0.138, 0.62, 0.162] },
  { k: "heading", r: [0.27, 0.172, 0.45, 0.192] },
  { k: "text", r: [0.27, 0.203, 0.37, 0.213], lines: 1 },
  ...[0.14, 0.38, 0.62, 0.86].flatMap((x): Prim[] => [
    { k: "circle", c: [x, 0.272], rad: 0.065 },
    { k: "text", r: [x - 0.08, 0.318, x + 0.08, 0.328], lines: 1 },
  ]),
  // next lesson
  { k: "heading", r: [0.08, 0.377, 0.36, 0.395] },
  { k: "rect", r: [0.04, 0.41, 0.96, 0.515], radius: 14 },
  { k: "rect", r: [0.08, 0.428, 0.22, 0.495], radius: 8 },
  { k: "text", r: [0.26, 0.432, 0.78, 0.492], lines: 3 },
  // list
  { k: "rect", r: [0.04, 0.535, 0.96, 0.85], radius: 14 },
  ...rows([0.08, 0.545, 0.92, 0.84], 4, "icon", true),
  // tab bar
  { k: "hline", y: 0.872, x0: 0.02, x1: 0.98 },
  ...[0.12, 0.37, 0.63, 0.88].flatMap((x): Prim[] => [
    { k: "rect", r: [x - 0.035, 0.893, x + 0.035, 0.928], radius: 4 },
    { k: "text", r: [x - 0.08, 0.942, x + 0.08, 0.952], lines: 1 },
  ]),
];

/** The product map sketched in IDEA: one platform, three audiences. */
const MAP: Prim[] = [
  { k: "rect", r: [0.4, 0.06, 0.6, 0.3], radius: 8 },
  { k: "text", r: [0.43, 0.13, 0.57, 0.23], lines: 2 },
  { k: "vline", x: 0.5, y0: 0.3, y1: 0.5 },
  { k: "hline", y: 0.5, x0: 0.15, x1: 0.85 },
  ...[0.15, 0.5, 0.85].flatMap((x): Prim[] => [
    { k: "vline", x, y0: 0.5, y1: 0.66 },
    { k: "rect", r: [x - 0.12, 0.66, x + 0.12, 0.94], radius: 8 },
    { k: "text", r: [x - 0.09, 0.74, x + 0.09, 0.86], lines: 2 },
  ]),
];

export const WIREFRAMES: Record<ScreenId | "map", Prim[]> = {
  desktop: DESKTOP,
  tablet: TABLET,
  phone: PHONE,
  map: MAP,
};

/* ------------------------------------------------------------------ */
/* Drawing                                                              */
/* ------------------------------------------------------------------ */

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/**
 * Renders a wireframe layout to a transparent canvas texture. Each stroke
 * is drawn twice with a sub-pixel jitter so it reads as a considered sketch
 * rather than a vector UI.
 */
export function createWireTexture(id: ScreenId | "map", width: number, height: number) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  const rand = seeded(id.length * 7919 + width);
  const lw = Math.max(1.6, width / 420);
  const stroke = "rgba(214, 222, 234, 0.92)";
  const faint = "rgba(214, 222, 234, 0.42)";

  const X = (u: number) => u * width;
  const Y = (v: number) => v * height;

  const pass = (fn: (jx: number, jy: number) => void) => {
    fn(0, 0);
    ctx.save();
    ctx.globalAlpha = 0.35;
    fn((rand() - 0.5) * lw * 1.2, (rand() - 0.5) * lw * 1.2);
    ctx.restore();
  };

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const p of WIREFRAMES[id]) {
    ctx.lineWidth = lw;
    ctx.strokeStyle = stroke;
    ctx.setLineDash([]);
    switch (p.k) {
      case "rect": {
        const [x0, y0, x1, y1] = p.r;
        if (p.dash) {
          ctx.setLineDash([lw * 5, lw * 4]);
          ctx.strokeStyle = faint;
        }
        if (p.fill) {
          roundRect(ctx, X(x0), Y(y0), X(x1) - X(x0), Y(y1) - Y(y0), (p.radius ?? 6) * (width / 1024));
          ctx.fillStyle = "rgba(160, 172, 192, 0.07)";
          ctx.fill();
        }
        pass((jx, jy) => {
          roundRect(ctx, X(x0) + jx, Y(y0) + jy, X(x1) - X(x0), Y(y1) - Y(y0), (p.radius ?? 6) * (width / 1024));
          ctx.stroke();
        });
        break;
      }
      case "text": {
        const [x0, y0, x1, y1] = p.r;
        const step = (Y(y1) - Y(y0)) / Math.max(1, p.lines);
        ctx.strokeStyle = faint;
        ctx.lineWidth = lw * 1.4;
        for (let i = 0; i < p.lines; i += 1) {
          const y = Y(y0) + step * (i + 0.5);
          const len = (X(x1) - X(x0)) * (i === p.lines - 1 && p.lines > 1 ? 0.55 + rand() * 0.2 : 0.8 + rand() * 0.2);
          ctx.beginPath();
          ctx.moveTo(X(x0), y);
          ctx.lineTo(X(x0) + len, y);
          ctx.stroke();
        }
        break;
      }
      case "heading": {
        const [x0, y0, x1, y1] = p.r;
        ctx.lineWidth = Math.max(lw * 2.2, (Y(y1) - Y(y0)) * 0.55);
        const y = (Y(y0) + Y(y1)) / 2;
        pass((jx, jy) => {
          ctx.beginPath();
          ctx.moveTo(X(x0) + jx, y + jy);
          ctx.lineTo(X(x1) + jx, y + jy);
          ctx.stroke();
        });
        break;
      }
      case "circle": {
        pass((jx, jy) => {
          ctx.beginPath();
          ctx.arc(X(p.c[0]) + jx, Y(p.c[1]) + jy, p.rad * width, 0, Math.PI * 2);
          ctx.stroke();
        });
        break;
      }
      case "img": {
        const [x0, y0, x1, y1] = p.r;
        pass((jx, jy) => {
          ctx.strokeRect(X(x0) + jx, Y(y0) + jy, X(x1) - X(x0), Y(y1) - Y(y0));
        });
        ctx.strokeStyle = faint;
        ctx.beginPath();
        ctx.moveTo(X(x0), Y(y0));
        ctx.lineTo(X(x1), Y(y1));
        ctx.moveTo(X(x1), Y(y0));
        ctx.lineTo(X(x0), Y(y1));
        ctx.stroke();
        break;
      }
      case "tiles": {
        const [x0, y0, x1, y1] = p.r;
        const gap = 0.01;
        const w = (x1 - x0 - gap * (p.cols - 1)) / p.cols;
        const h = (y1 - y0 - gap * 2 * (p.rows - 1)) / p.rows;
        for (let c = 0; c < p.cols; c += 1) {
          for (let r = 0; r < p.rows; r += 1) {
            const tx = x0 + c * (w + gap);
            const ty = y0 + r * (h + gap * 2);
            roundRect(ctx, X(tx), Y(ty), X(w), Y(h), 6 * (width / 1024));
            ctx.strokeStyle = stroke;
            ctx.stroke();
            ctx.strokeStyle = faint;
            ctx.lineWidth = lw * 1.4;
            ctx.beginPath();
            ctx.moveTo(X(tx + w * 0.18), Y(ty + h * 0.38));
            ctx.lineTo(X(tx + w * 0.6), Y(ty + h * 0.38));
            ctx.moveTo(X(tx + w * 0.18), Y(ty + h * 0.68));
            ctx.lineTo(X(tx + w * 0.4), Y(ty + h * 0.68));
            ctx.stroke();
            ctx.lineWidth = lw;
          }
        }
        break;
      }
      case "vline": {
        pass((jx) => {
          ctx.beginPath();
          ctx.moveTo(X(p.x) + jx, Y(p.y0));
          ctx.lineTo(X(p.x) + jx, Y(p.y1));
          ctx.stroke();
        });
        break;
      }
      case "hline": {
        ctx.strokeStyle = faint;
        ctx.beginPath();
        ctx.moveTo(X(p.x0), Y(p.y));
        ctx.lineTo(X(p.x1), Y(p.y));
        ctx.stroke();
        break;
      }
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 4;
  return texture;
}

/* ------------------------------------------------------------------ */
/* Screen material                                                      */
/* ------------------------------------------------------------------ */

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

/**
 * One material handles the whole screen life-cycle:
 *  - IDEA: only the sketched wireframe is visible (transparent sheet)
 *  - DESIGN: a soft diagonal wipe with a light edge reveals the real UI
 *  - BUILD/SHIP: brightness lifts as the screen is "switched on"
 * `uRect` lets a lifted UI component sample just its slice of the parent
 * screen; `uHole*` dims the slot it was lifted out of.
 */
const fragmentShader = /* glsl */ `
  uniform sampler2D uUI;
  uniform sampler2D uWire;
  uniform vec4 uRect;
  uniform vec2 uSize;
  uniform float uRadius;
  uniform float uOpacity;
  uniform float uWireAmt;
  uniform float uReveal;
  uniform float uBright;
  uniform float uHoleAmt;
  uniform vec4 uHole0;
  uniform vec4 uHole1;
  uniform vec3 uEdgeColor;
  varying vec2 vUv;

  float sdRound(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  float inRect(vec2 uv, vec4 r) {
    vec2 a = step(r.xy, uv) * step(uv, r.zw);
    return a.x * a.y;
  }

  void main() {
    vec2 p = (vUv - 0.5) * uSize;
    float d = sdRound(p, uSize * 0.5, uRadius);
    float aa = fwidth(d) * 1.2;
    float mask = 1.0 - smoothstep(-aa, aa, d);

    // parent-screen UV, origin top-left
    vec2 tuv = vec2(mix(uRect.x, uRect.z, vUv.x), mix(uRect.y, uRect.w, 1.0 - vUv.y));
    vec2 suv = vec2(tuv.x, 1.0 - tuv.y);
    vec4 ui = texture2D(uUI, suv);
    vec4 wire = texture2D(uWire, suv);

    float hole = max(inRect(tuv, uHole0), inRect(tuv, uHole1)) * uHoleAmt;

    float diag = tuv.x * 0.62 + tuv.y * 0.38;
    float front = uReveal * 1.24 - 0.12;
    float k = 1.0 - smoothstep(front - 0.045, front + 0.045, diag);

    float wireA = wire.a * uWireAmt * (1.0 - hole * 0.85);
    vec3 uiCol = ui.rgb * uBright * mix(1.0, 0.14, hole);

    // gentle glass sheen across the lit interface
    float sheen = smoothstep(0.42, 0.0, abs(tuv.x * 0.8 - tuv.y * 0.55 - 0.1)) * 0.05;
    uiCol += vec3(sheen) * k;

    // premultiplied composite: wire sketch under the revealed interface
    vec3 col = mix(wire.rgb * wireA, uiCol, k);
    float a = mix(wireA, 1.0, k);

    float edge = exp(-pow((diag - front) / 0.016, 2.0)) * step(0.0005, uReveal) * (1.0 - step(0.9995, uReveal));
    col += uEdgeColor * edge * 0.85;
    a = max(a, edge * 0.85);

    float outA = a * mask * uOpacity;
    if (outA < 0.003) discard;
    gl_FragColor = vec4(min(col / max(a, 0.0001), vec3(1.0)), outA);
    #include <colorspace_fragment>
  }
`;

export interface ScreenUniforms {
  [key: string]: THREE.IUniform;
  uUI: THREE.IUniform<THREE.Texture | null>;
  uWire: THREE.IUniform<THREE.Texture | null>;
  uRect: THREE.IUniform<THREE.Vector4>;
  uSize: THREE.IUniform<THREE.Vector2>;
  uRadius: THREE.IUniform<number>;
  uOpacity: THREE.IUniform<number>;
  uWireAmt: THREE.IUniform<number>;
  uReveal: THREE.IUniform<number>;
  uBright: THREE.IUniform<number>;
  uHoleAmt: THREE.IUniform<number>;
  uHole0: THREE.IUniform<THREE.Vector4>;
  uHole1: THREE.IUniform<THREE.Vector4>;
  uEdgeColor: THREE.IUniform<THREE.Color>;
}

export function createScreenMaterial({
  ui,
  wire,
  size,
  radius,
  rect = [0, 0, 1, 1],
  holes = [],
}: {
  ui: THREE.Texture | null;
  wire: THREE.Texture;
  size: [number, number];
  radius: number;
  rect?: [number, number, number, number];
  holes?: [number, number, number, number][];
}) {
  const uniforms: ScreenUniforms = {
    uUI: { value: ui },
    uWire: { value: wire },
    uRect: { value: new THREE.Vector4(...rect) },
    uSize: { value: new THREE.Vector2(...size) },
    uRadius: { value: radius },
    uOpacity: { value: 0 },
    uWireAmt: { value: 1 },
    uReveal: { value: 0 },
    uBright: { value: 0.9 },
    uHoleAmt: { value: 0 },
    uHole0: { value: new THREE.Vector4(...(holes[0] ?? [2, 2, 2, 2])) },
    uHole1: { value: new THREE.Vector4(...(holes[1] ?? [2, 2, 2, 2])) },
    uEdgeColor: { value: new THREE.Color("#5eead4") },
  };
  return new THREE.ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    transparent: true,
    depthWrite: true,
    toneMapped: false,
  }) as THREE.ShaderMaterial & { uniforms: ScreenUniforms };
}
