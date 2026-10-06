import * as THREE from "three";
import { beats } from "@/lib/three/journeyBeats";

/**
 * Scroll timeline for the homepage IDEA → DESIGN → BUILD → SHIP journey.
 *
 * Everything in the scene is a pure function of one smoothed scroll
 * progress value `p` (0 → 1 across the pinned journey section), so
 * scrubbing backwards replays the build in reverse and nothing depends on
 * how fast or in what order the visitor scrolled. Idle motion (orbit drift,
 * hover) is layered on top with small, time-based offsets only.
 */

export type Vec3 = [number, number, number];
export type EaseFn = (t: number) => number;

export const ease = {
  linear: (t: number) => t,
  sine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  inOut: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  out: (t: number) => 1 - Math.pow(1 - t, 3),
} satisfies Record<string, EaseFn>;

export const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** 0 → 1 as `p` moves from `a` to `b`. */
export function range(p: number, a: number, b: number) {
  return clamp01((p - a) / (b - a));
}

/** Fade in over [a, b], hold, fade out over [c, d]. */
export function windowed(p: number, a: number, b: number, c: number, d: number) {
  return Math.min(range(p, a, b), 1 - range(p, c, d));
}

function segment<T>(keys: [number, T][], p: number): [T, T, number] {
  if (p <= keys[0]![0]) return [keys[0]![1], keys[0]![1], 0];
  for (let i = 0; i < keys.length - 1; i += 1) {
    const [p0, v0] = keys[i]!;
    const [p1, v1] = keys[i + 1]!;
    if (p <= p1) return [v0, v1, p1 === p0 ? 1 : (p - p0) / (p1 - p0)];
  }
  const last = keys[keys.length - 1]![1];
  return [last, last, 1];
}

/**
 * Keyframed number. Every segment eases in and out, so motion arrives,
 * settles at each key and leaves again — keys double as the calm "holds".
 */
export function trackNum(keys: [number, number][], p: number, fn: EaseFn = ease.sine) {
  const [a, b, t] = segment(keys, p);
  return a + (b - a) * fn(t);
}

export function trackVec(
  keys: [number, Vec3][],
  p: number,
  out: THREE.Vector3,
  fn: EaseFn = ease.sine,
) {
  const [a, b, t] = segment(keys, p);
  const e = fn(t);
  return out.set(a[0] + (b[0] - a[0]) * e, a[1] + (b[1] - a[1]) * e, a[2] + (b[2] - a[2]) * e);
}

/* ------------------------------------------------------------------ */
/* Section beats (scroll progress)                                     */
/* ------------------------------------------------------------------ */

export { beats };

/**
 * The build state `s` the payload is in: 0 scattered ideas, 1 organised
 * wireframes, 2 designed interface, 3 built devices, 4 shipped & connected.
 * Linear here — each element applies its own staggered easing inside every
 * unit interval so pieces never move in lock-step.
 */
const STAGE_KEYS: [number, number][] = [
  [0, 0],
  [0.19, 0],
  [0.29, 1],
  [0.39, 1],
  [0.51, 2],
  [0.59, 2],
  [0.71, 3],
  [0.73, 3],
  [0.86, 4],
  [1, 4],
];

export function stageAt(p: number) {
  return trackNum(STAGE_KEYS, p, ease.linear);
}

/** Opacity of the IDEA fragments as the camera first approaches them. */
export function fragmentsVisibleAt(p: number) {
  return ease.out(range(p, 0.075, 0.17));
}

/* ------------------------------------------------------------------ */
/* World layout                                                         */
/* ------------------------------------------------------------------ */

export const FLOOR_Y = -1.6;

/** Where the payload sits while each stage plays out. */
export const ANCHORS = {
  idea: [0, 0.15, -6] as Vec3,
  design: [0, 0.15, -17] as Vec3,
  build: [0, -0.05, -28] as Vec3,
};

export const ANCHOR_KEYS: [number, Vec3][] = [
  [0, ANCHORS.idea],
  [0.3, ANCHORS.idea],
  [0.4, ANCHORS.design],
  [0.52, ANCHORS.design],
  [0.6, ANCHORS.build],
  [1, ANCHORS.build],
];

/** Architectural threshold frames the camera travels through. */
export const GATE_Z = [-9.5, -20.5, -34];

/** The CatchZone orbit + node that opens the page. */
export const OPENING_ORBIT = {
  center: [2.8, 1.05, -0.8] as Vec3,
  radius: 1.85,
  rotation: [1.2, 0.18, 0.34] as Vec3,
  /** Angle where the node leaves the orbit (upper-right, as in the logo). */
  departAngle: 0.55,
};

/** The orbit re-forms around the finished product during SHIP. */
export const SHIP_ORBIT = {
  center: [0.05, -0.25, -27.9] as Vec3,
  radius: 2.75,
  rotation: [1.28, 0.1, 0.3] as Vec3,
};

export const CAMERA_KEYS: { p: number; pos: Vec3; target: Vec3 }[] = [
  { p: 0, pos: [0, 0.3, 8.6], target: [0.15, 0.25, 0] },
  { p: 0.06, pos: [0, 0.28, 7.8], target: [0.1, 0.2, -0.6] },
  { p: 0.17, pos: [-0.85, 1.05, 0.7], target: [0, 0.42, -6] },
  { p: 0.29, pos: [-0.4, 0.95, 0.25], target: [0, 0.4, -6] },
  { p: 0.4, pos: [0.95, 1.0, -10.7], target: [0, 0.42, -17] },
  { p: 0.5, pos: [-0.75, 0.92, -10.8], target: [0, 0.4, -17] },
  { p: 0.6, pos: [-2.5, 0.55, -21.6], target: [0.05, -0.25, -28] },
  { p: 0.71, pos: [-1.55, 0.4, -21.3], target: [0.05, -0.28, -28] },
  { p: 0.86, pos: [1.9, 2.3, -19.6], target: [0.05, -0.45, -28] },
  { p: 0.95, pos: [0.3, 2.0, -19.9], target: [0, -0.4, -28] },
  { p: 1, pos: [0.25, 1.95, -20.0], target: [0, -0.4, -28] },
];

export const CAMERA_POS_KEYS: [number, Vec3][] = CAMERA_KEYS.map((k) => [k.p, k.pos]);
export const CAMERA_TARGET_KEYS: [number, Vec3][] = CAMERA_KEYS.map((k) => [k.p, k.target]);

/**
 * Horizontal framing offset (fraction of the viewport): the payload sits
 * right of centre while a caption occupies the left column, and returns to
 * centre for the opening and the final hand-off.
 */
export const VIEW_OFFSET_KEYS: [number, number][] = [
  [0, 0],
  [0.06, 0],
  [0.17, 0.17],
  [0.86, 0.17],
  [0.95, 0],
  [1, 0],
];

/** Guide-line progress along the build path (0 → 1). */
export const GUIDE_KEYS: [number, number][] = [
  [0, 0],
  [0.06, 0],
  [0.17, 0.24],
  [0.3, 0.28],
  [0.4, 0.58],
  [0.52, 0.62],
  [0.6, 0.9],
  [0.72, 0.95],
  [0.8, 1],
  [1, 1],
];

export const GUIDE_PATH: Vec3[] = [
  [0, 0, 0], // replaced at runtime by the opening orbit's departure point
  [2.4, 0.4, -1.4],
  [1.0, -1.45, -1.9],
  [-0.3, -1.56, -3.7],
  [-1.4, -1.56, -6.4],
  [-1.9, -1.56, -10.5],
  [-1.1, -1.56, -14.5],
  [-1.6, -1.56, -17.6],
  [-2.0, -1.56, -21.5],
  [-1.6, -1.56, -24.8],
  [-0.6, -1.56, -26.2],
  [0, -1.56, -26.4],
];

/* ------------------------------------------------------------------ */
/* Payload                                                              */
/* ------------------------------------------------------------------ */

export interface Pose {
  pos: Vec3;
  rot: Vec3;
  scale?: number;
}

export type ScreenId = "desktop" | "tablet" | "phone";

export interface ScreenSpec {
  id: ScreenId;
  texture: string;
  /** Visible screen size in world units (matches the texture aspect). */
  size: [number, number];
  radius: number;
  /** Delay inside each stage interval so the three never move as one. */
  stagger: number;
  /** S0 scattered → S1 organised → S2 designed → S3 built → S4 shipped. */
  poses: [Pose, Pose, Pose, Pose, Pose];
}

export const SCREENS: ScreenSpec[] = [
  {
    id: "desktop",
    texture: "/assets/images/journey/brookmere-desktop.webp",
    size: [1.68, 1.109],
    radius: 0.028,
    stagger: 0.08,
    poses: [
      { pos: [0.55, 0.6, -1.3], rot: [0.16, -0.48, 0.1] },
      { pos: [0.38, 0.11, 0], rot: [0, 0, 0] },
      { pos: [0.12, 0.28, -0.55], rot: [0, -0.06, 0] },
      { pos: [0.15, 0.36, -0.62], rot: [0, -0.1, 0] },
      { pos: [0.15, 0.36, -0.62], rot: [0, -0.1, 0] },
    ],
  },
  {
    id: "tablet",
    texture: "/assets/images/journey/brookmere-tablet.webp",
    size: [1.3, 0.862],
    radius: 0.045,
    stagger: 0.0,
    poses: [
      { pos: [-1.85, -0.5, 0.35], rot: [-0.22, 0.62, -0.16] },
      { pos: [-1.34, -0.02, 0], rot: [0, 0, 0] },
      { pos: [-1.5, -0.12, 0.38], rot: [0, 0.36, 0] },
      { pos: [-1.62, -0.52, 0.42], rot: [0, 0.4, 0] },
      { pos: [-1.62, -0.52, 0.42], rot: [0, 0.4, 0] },
    ],
  },
  {
    id: "phone",
    texture: "/assets/images/journey/brookmere-phone.webp",
    size: [0.5, 1.027],
    radius: 0.06,
    stagger: 0.16,
    poses: [
      { pos: [2.05, -0.38, 0.55], rot: [0.12, -0.72, 0.26] },
      { pos: [1.74, 0.06, 0], rot: [0, 0, 0] },
      { pos: [1.38, -0.16, 0.78], rot: [0, -0.42, 0] },
      { pos: [1.36, -0.45, 0.86], rot: [0, -0.44, 0] },
      { pos: [1.36, -0.45, 0.86], rot: [0, -0.44, 0] },
    ],
  },
];

/**
 * UI pieces that start as loose sketches, organise into their wireframe,
 * lift out as finished interface during DESIGN and seat back into the
 * screen during BUILD. `rect` is in the parent screen's UV space (origin
 * top-left), so the piece shows exactly the pixels it later covers.
 */
export interface ComponentSpec {
  screen: ScreenId;
  rect: [number, number, number, number];
  /** S0 scattered offset relative to the parent's S0 pose. */
  scatter: Pose;
  /** S2 lifted offset (exploded view) relative to the seated position. */
  lift: Vec3;
  stagger: number;
}

export const COMPONENTS: ComponentSpec[] = [
  {
    screen: "desktop",
    rect: [0.25, 0.22, 0.6, 0.515],
    scatter: { pos: [-0.9, 1.0, 0.9], rot: [0.3, 0.4, -0.2] },
    lift: [-0.08, 0.06, 0.34],
    stagger: 0.1,
  },
  {
    screen: "desktop",
    rect: [0.625, 0.545, 0.985, 0.975],
    scatter: { pos: [1.3, -1.25, 0.7], rot: [-0.25, -0.5, 0.18] },
    lift: [0.1, -0.05, 0.42],
    stagger: 0.2,
  },
  {
    screen: "tablet",
    rect: [0.625, 0.205, 0.985, 0.565],
    scatter: { pos: [0.6, 1.25, 0.6], rot: [0.35, -0.3, 0.2] },
    lift: [0.06, 0.05, 0.3],
    stagger: 0.05,
  },
  {
    screen: "tablet",
    rect: [0.255, 0.685, 0.6, 0.995],
    scatter: { pos: [-0.75, -1.05, 0.5], rot: [-0.3, 0.45, -0.15] },
    lift: [-0.05, -0.04, 0.36],
    stagger: 0.15,
  },
  {
    screen: "phone",
    rect: [0.04, 0.37, 0.96, 0.52],
    scatter: { pos: [-0.5, 1.05, 0.8], rot: [0.25, 0.6, 0.3] },
    lift: [-0.04, 0.02, 0.3],
    stagger: 0.12,
  },
  {
    screen: "phone",
    rect: [0.04, 0.535, 0.96, 0.85],
    scatter: { pos: [0.55, -1.15, 0.45], rot: [-0.2, -0.4, -0.25] },
    lift: [0.05, -0.03, 0.22],
    stagger: 0.22,
  },
];

/** Product map sketched above the wireframes in IDEA. */
export const MAP_SPEC = {
  size: [1.7, 0.62] as [number, number],
  stagger: 0.04,
  poses: [
    { pos: [-0.6, 1.45, -0.9], rot: [0.25, 0.35, -0.12] },
    { pos: [0.2, 1.08, 0], rot: [0, 0, 0] },
    { pos: [0.1, 1.55, -1.1], rot: [0.1, 0, 0] },
  ] as Pose[],
};

/**
 * Portrait screens can't fit the full-width arrangement without shrinking
 * every device, so the arrangement itself narrows instead: horizontal
 * spacing (devices, plinth, cable runs, SHIP orbit) compresses while the
 * devices keep their size and simply overlap a little more in depth.
 */
export function compactFactor(aspect: number) {
  return aspect >= 1 ? 1 : Math.max(0.6, 0.35 + 0.65 * aspect);
}

/* ------------------------------------------------------------------ */
/* Pose blending                                                        */
/* ------------------------------------------------------------------ */

/**
 * Eased progress inside the current stage interval for an element with a
 * given stagger. Returns the interval index and the eased fraction.
 */
export function stageLocal(s: number, stagger: number, window = 0.72): [number, number] {
  const seg = Math.min(3, Math.max(0, Math.floor(s)));
  const f = s - seg;
  const t = ease.inOut(clamp01((f - stagger) / window));
  return [seg, t];
}

/** Progress of a specific transition (e.g. 2 → 3) for a staggered element. */
export function transition(s: number, from: number, stagger: number, window = 0.72) {
  if (s <= from) return 0;
  if (s >= from + 1) return 1;
  return ease.inOut(clamp01((s - from - stagger) / window));
}

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();

export function applyPose(obj: THREE.Object3D, a: Pose, b: Pose, t: number) {
  _a.set(...a.pos);
  _b.set(...b.pos);
  obj.position.lerpVectors(_a, _b, t);
  obj.rotation.set(
    a.rot[0] + (b.rot[0] - a.rot[0]) * t,
    a.rot[1] + (b.rot[1] - a.rot[1]) * t,
    a.rot[2] + (b.rot[2] - a.rot[2]) * t,
  );
  const sa = a.scale ?? 1;
  const sb = b.scale ?? 1;
  obj.scale.setScalar(sa + (sb - sa) * t);
}
