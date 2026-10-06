import type { Vec3 } from "@/lib/three/journeyTimeline";

/**
 * Scroll timeline for the IslamQuest "impossible phone space" trailer
 * (homepage + /work Featured Build). Everything is a pure function of the
 * scroll progress `p` (0 → 1), so scrubbing backwards plays the trailer in
 * reverse.
 *
 * Beats:  A arrival 0–.27 (01 hero) · B depth inside the phone .27–.46
 * (02, 03) · C impossible space .46–.69 (04 hero) · D montage .62–.89
 * (05, 06, 07 hero) · E resolution .85–1 (08 lands back in the phone).
 */

type NumKeys = [number, number][];
type VecKeys = [number, Vec3][];

/* ------------------------------------------------------------------ */
/* Device                                                               */
/* ------------------------------------------------------------------ */

/** Visible screen size (matches the 696×1480 screenshots). */
export const SCREEN_W = 1;
export const SCREEN_H = 1480 / 696;
/** Z of the glass in phone-local space. */
export const GLASS_Z = 0.047;

export const PHONE = {
  pos: [
    [0, [1.5, -0.9, -5]],
    [0.13, [0, 0, 0]],
    [0.27, [0, 0, 0.15]],
    [0.36, [0, 0, 0.45]],
    [0.44, [0, 0, 0.6]],
    [0.52, [-0.35, 0, -0.8]],
    [0.6, [-1.15, -0.05, -2.6]],
    [0.82, [-1.05, -0.05, -2.8]],
    [0.92, [0, 0, 0]],
    [1, [0, 0, 0]],
  ] as VecKeys,
  rot: [
    [0, [0.3, -0.95, 0.18]],
    [0.13, [0.06, -0.36, 0.02]],
    [0.27, [0.04, -0.26, 0.02]],
    [0.36, [0.02, -0.1, 0]],
    [0.44, [0, 0.28, 0]],
    [0.52, [0.04, 0.48, 0.02]],
    [0.6, [0.08, 0.58, 0.04]],
    [0.82, [0.08, 0.62, 0.04]],
    [0.92, [0.05, -0.3, 0.02]],
    [1, [0.05, -0.28, 0.02]],
  ] as VecKeys,
  /** The body ghosts back while the app space takes over, then reforms. */
  body: [
    [0, 1],
    [0.5, 1],
    [0.58, 0.28],
    [0.83, 0.28],
    [0.91, 1],
    [1, 1],
  ] as NumKeys,
};

/** Mint edge light intensity — flares on every major hand-over, settles at the end. */
export const EDGE_LIGHT: NumKeys = [
  [0, 0.15],
  [0.13, 0.6],
  [0.24, 0.32],
  [0.3, 0.9],
  [0.4, 0.45],
  [0.5, 1],
  [0.6, 0.3],
  [0.84, 0.3],
  [0.9, 0.95],
  [1, 0.28],
];

/** A brief ghosted silhouette trails the phone during its fastest moves. */
export const GHOST_DEVICE: NumKeys = [
  [0.44, 0],
  [0.5, 0.45],
  [0.58, 0],
  [0.83, 0],
  [0.87, 0.4],
  [0.92, 0],
];

/**
 * Wide-screen framing: the copy scrolls normally beside the stage, so the
 * whole trailer plays in the right-hand part of the frame.
 */
export const VIEW_OFFSET: NumKeys = [[0, 0.17]];

/* ------------------------------------------------------------------ */
/* Screen planes                                                        */
/* ------------------------------------------------------------------ */

/**
 * A screen plane lives in phone-local space (inside / on the glass) and/or
 * in world space. `world` blends between the two; `free` blends between
 * stencil-masked (visible only through the glass) and unmasked.
 * `band` slices a horizontal strip of the screenshot (UV v0 → v1, top-down).
 */
export interface PlaneSpec {
  key: string;
  screen: number;
  local?: { pos: VecKeys; rot?: VecKeys };
  world?: { pos: VecKeys; rot?: VecKeys };
  worldness?: NumKeys;
  free?: NumKeys;
  opacity: NumKeys;
  scale?: NumKeys;
  band?: [number, number];
  echo?: boolean;
}

const FLUSH: Vec3 = [0, 0, GLASS_Z + 0.001];

export const PLANES: PlaneSpec[] = [
  // 01 — on the glass: the phone looks completely normal.
  {
    key: "01",
    screen: 0,
    local: { pos: [[0, FLUSH]] },
    opacity: [
      [0, 1],
      [0.27, 1],
      [0.3, 0],
    ],
  },
  // 01 separates into UI layers at impossible depths inside the display.
  ...([
    [0, 0.24, [0, 0.02, 0.0]],
    [0.24, 0.7, [0, 0, -0.36]],
    [0.7, 1, [0, -0.02, -0.72]],
  ] as [number, number, Vec3][]).map(
    ([v0, v1, deep], i): PlaneSpec => ({
      key: `01-band-${i}`,
      screen: 0,
      band: [v0, v1],
      local: {
        pos: [
          [0.27, FLUSH],
          [0.36, deep],
        ],
      },
      opacity: [
        [0.26, 0],
        [0.28, 1],
        [0.36, 1],
        [0.4, 0],
      ],
    }),
  ),
  // 02 rises from deep inside, then passes forward through the glass.
  {
    key: "02",
    screen: 1,
    local: {
      pos: [
        [0.29, [0, 0, -3.5]],
        [0.34, [0, 0, -0.28]],
        [0.38, [0, 0, -0.25]],
        [0.42, [0, 0.05, 0.75]],
      ],
    },
    free: [
      [0.38, 0],
      [0.41, 1],
    ],
    opacity: [
      [0.29, 0],
      [0.32, 1],
      [0.39, 1],
      [0.43, 0],
    ],
  },
  // 03 arrives from depth and slides sideways *inside* the phone — wider than the device.
  {
    key: "03",
    screen: 2,
    local: {
      pos: [
        [0.35, [0, 0, -3.5]],
        [0.4, [0, 0, -0.3]],
        [0.44, [0, 0, -0.32]],
        [0.48, [-1.7, 0, -0.9]],
      ],
      rot: [
        [0.44, [0, 0, 0]],
        [0.48, [0, 0.55, 0]],
      ],
    },
    opacity: [
      [0.35, 0],
      [0.38, 1],
      [0.46, 1],
      [0.48, 0],
    ],
  },
  // 04 — the impossible moment: approaches from far inside, breaks out
  // through the glass and becomes larger than the phone it came from.
  {
    key: "04",
    screen: 3,
    local: {
      pos: [
        [0.42, [0, 0, -5]],
        [0.48, [0, 0, -0.4]],
      ],
    },
    world: {
      pos: [
        [0.48, [0, 0, 0.2]],
        [0.55, [0.3, 0, 0.3]],
        [0.64, [0.3, 0, 0.35]],
        [0.69, [-3.3, 0.2, -2]],
      ],
      rot: [
        [0.55, [0, -0.08, 0]],
        [0.64, [0, -0.06, 0]],
        [0.69, [0, 0.7, 0]],
      ],
    },
    worldness: [
      [0.48, 0],
      [0.55, 1],
    ],
    free: [
      [0.47, 0],
      [0.52, 1],
    ],
    scale: [
      [0.48, 1],
      [0.55, 1],
      [0.64, 1],
      [0.69, 1],
    ],
    opacity: [
      [0.42, 0],
      [0.45, 1],
      [0.66, 1],
      [0.69, 0],
    ],
    echo: true,
  },
  // 05, 06 — montage sweeps through the app space.
  {
    key: "05",
    screen: 4,
    world: {
      pos: [
        [0.62, [3.0, 0.3, -3.2]],
        [0.665, [0.2, 0, 0.3]],
        [0.71, [-2.6, -0.2, -1.5]],
      ],
      rot: [
        [0.62, [0, -0.7, 0.05]],
        [0.665, [0, -0.05, 0]],
        [0.71, [0, 0.7, -0.05]],
      ],
    },
    worldness: [[0, 1]],
    free: [[0, 1]],
    opacity: [
      [0.62, 0],
      [0.635, 1],
      [0.695, 1],
      [0.71, 0],
    ],
    echo: true,
  },
  {
    key: "06",
    screen: 5,
    world: {
      pos: [
        [0.685, [-2.6, 0.6, -3]],
        [0.725, [-0.1, 0.05, 0.35]],
        [0.765, [3.0, -0.3, -1.6]],
      ],
      rot: [
        [0.685, [0.08, 0.7, -0.05]],
        [0.725, [0, 0.04, 0]],
        [0.765, [-0.06, -0.7, 0.05]],
      ],
    },
    worldness: [[0, 1]],
    free: [[0, 1]],
    opacity: [
      [0.685, 0],
      [0.7, 1],
      [0.75, 1],
      [0.765, 0],
    ],
    echo: true,
  },
  // 07 — second hero hold, then lifts away.
  {
    key: "07",
    screen: 6,
    world: {
      pos: [
        [0.745, [0, 0, -5]],
        [0.785, [0.25, 0, 0.3]],
        [0.855, [0.25, 0, 0.35]],
        [0.885, [0.6, 2.8, 1.4]],
      ],
      rot: [
        [0.785, [0, -0.06, 0]],
        [0.855, [0, -0.05, 0]],
        [0.885, [-0.6, 0, 0]],
      ],
    },
    worldness: [[0, 1]],
    free: [[0, 1]],
    scale: [[0, 1]],
    opacity: [
      [0.745, 0],
      [0.765, 1],
      [0.865, 1],
      [0.885, 0],
    ],
    echo: true,
  },
  // 08 — flies back into the reforming phone and locks onto the glass.
  {
    key: "08",
    screen: 7,
    local: { pos: [[0, FLUSH]] },
    world: {
      pos: [
        [0.85, [0, 0, -5]],
        [0.9, [0, 0, -0.6]],
      ],
    },
    worldness: [
      [0.85, 1],
      [0.93, 0],
    ],
    free: [
      [0.85, 1],
      [0.93, 0],
    ],
    opacity: [
      [0.85, 0],
      [0.875, 1],
      [1, 1],
    ],
  },
];

/** Small feature caption: which screen the trailer is "on". */
export const CAPTION_STEPS: [number, number][] = [
  [0, 0],
  [0.31, 1],
  [0.38, 2],
  [0.47, 3],
  [0.64, 4],
  [0.7, 5],
  [0.765, 6],
  [0.875, 7],
];

/** Share of the timeline played while the section scrolls into view (beat A fly-in). */
export const ARRIVAL_SHARE = 0.13;

export function captionAt(p: number) {
  let index = 0;
  for (const [at, i] of CAPTION_STEPS) if (p >= at) index = i;
  return index;
}
