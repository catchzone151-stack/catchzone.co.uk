export type CoreState = "mobile" | "web" | "systems";

export interface PieceTransform {
  pos: [number, number, number];
  rot: [number, number, number];
  scale: number;
  opacity: number;
}

export interface CoreTarget {
  camera: [number, number, number];
  center: { scale: number; opacity: number };
  phone: PieceTransform;
  web: PieceTransform;
  webSecondary: PieceTransform;
  data: PieceTransform;
  system: PieceTransform;
  automation: PieceTransform;
  connectorOpacity: number;
}

/**
 * The same five modular pieces (phone / web / data / system / automation)
 * reconfigure around a shared centre as the active service changes — the
 * hero shows them converged into the phone+platform assembly; this is that
 * same object deconstructed to introduce each capability.
 *
 * Each state pulls the camera in close and scales its primary piece(s) up
 * substantially so the canvas never reads as "mostly empty" — every state
 * must carry real visual mass, not a small object adrift in a large dark
 * frame.
 */
export const coreTargets: Record<CoreState, CoreTarget> = {
  mobile: {
    camera: [0.32, 0, 4.1],
    center: { scale: 1, opacity: 0.5 },
    phone: { pos: [0, 0, 0], rot: [0.05, 0.35, 0], scale: 1.75, opacity: 1 },
    web: { pos: [-2.1, 0.55, -1.5], rot: [0, 0.4, 0], scale: 0.55, opacity: 0.32 },
    webSecondary: { pos: [-2.4, -0.4, -1.9], rot: [0, 0.4, 0], scale: 0.4, opacity: 0.2 },
    data: { pos: [2.1, 0.85, -1.6], rot: [0, -0.3, 0], scale: 0.46, opacity: 0.26 },
    system: { pos: [2.3, -0.65, -1.5], rot: [0.3, 0, 0], scale: 0.42, opacity: 0.26 },
    automation: { pos: [1.6, 1.2, -1.3], rot: [0, 0, 0.4], scale: 0.36, opacity: 0.22 },
    connectorOpacity: 0.2,
  },
  web: {
    camera: [0, 0, 4.7],
    center: { scale: 0.7, opacity: 0.4 },
    phone: { pos: [-2.35, -0.65, -1.6], rot: [0.1, 0.5, 0], scale: 0.6, opacity: 0.34 },
    web: { pos: [-0.4, 0.18, 0], rot: [0, 0.1, 0], scale: 1.55, opacity: 1 },
    webSecondary: { pos: [1.55, -0.4, -0.7], rot: [0, -0.16, 0], scale: 1.05, opacity: 0.82 },
    data: { pos: [2.35, 0.95, -1.7], rot: [0, -0.3, 0], scale: 0.4, opacity: 0.24 },
    system: { pos: [2.15, -0.95, -1.5], rot: [0.3, 0, 0], scale: 0.38, opacity: 0.22 },
    automation: { pos: [-2, 1.1, -1.4], rot: [0, 0, 0.4], scale: 0.34, opacity: 0.2 },
    connectorOpacity: 0.3,
  },
  systems: {
    camera: [-0.22, 0, 4.4],
    center: { scale: 0.9, opacity: 0.65 },
    phone: { pos: [-2.5, 0.55, -1.9], rot: [0.05, 0.35, 0], scale: 0.5, opacity: 0.28 },
    web: { pos: [-2.3, -0.75, -2], rot: [0, 0.3, 0], scale: 0.45, opacity: 0.24 },
    webSecondary: { pos: [-2.7, -1.2, -2.2], rot: [0, 0.3, 0], scale: 0.34, opacity: 0.16 },
    data: { pos: [1, 0.5, -0.2], rot: [0, -0.3, 0], scale: 1.35, opacity: 1 },
    system: { pos: [-0.35, -0.55, 0.15], rot: [0.4, 0.2, 0.1], scale: 1.1, opacity: 1 },
    automation: { pos: [1.9, -0.5, -0.4], rot: [0, 0, 0.5], scale: 0.85, opacity: 0.95 },
    connectorOpacity: 0.9,
  },
};
