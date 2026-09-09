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
 */
export const coreTargets: Record<CoreState, CoreTarget> = {
  mobile: {
    camera: [0.4, 0, 5.2],
    center: { scale: 1, opacity: 0.5 },
    phone: { pos: [0, 0, 0], rot: [0.05, 0.35, 0], scale: 1.3, opacity: 1 },
    web: { pos: [-2.4, 0.6, -1.6], rot: [0, 0.4, 0], scale: 0.4, opacity: 0.25 },
    webSecondary: { pos: [-2.7, -0.4, -2], rot: [0, 0.4, 0], scale: 0.3, opacity: 0.15 },
    data: { pos: [2.3, 0.9, -1.8], rot: [0, -0.3, 0], scale: 0.35, opacity: 0.2 },
    system: { pos: [2.5, -0.7, -1.6], rot: [0.3, 0, 0], scale: 0.32, opacity: 0.2 },
    automation: { pos: [1.8, 1.3, -1.4], rot: [0, 0, 0.4], scale: 0.28, opacity: 0.18 },
    connectorOpacity: 0.15,
  },
  web: {
    camera: [0, 0, 6],
    center: { scale: 0.7, opacity: 0.35 },
    phone: { pos: [-2.6, -0.7, -1.8], rot: [0.1, 0.5, 0], scale: 0.5, opacity: 0.3 },
    web: { pos: [-0.5, 0.15, 0], rot: [0, 0.12, 0], scale: 1.15, opacity: 1 },
    webSecondary: { pos: [1.5, -0.35, -0.9], rot: [0, -0.18, 0], scale: 0.85, opacity: 0.75 },
    data: { pos: [2.6, 1, -1.9], rot: [0, -0.3, 0], scale: 0.3, opacity: 0.18 },
    system: { pos: [2.4, -1, -1.7], rot: [0.3, 0, 0], scale: 0.28, opacity: 0.16 },
    automation: { pos: [-2.2, 1.2, -1.5], rot: [0, 0, 0.4], scale: 0.26, opacity: 0.15 },
    connectorOpacity: 0.2,
  },
  systems: {
    camera: [-0.3, 0, 5.6],
    center: { scale: 0.85, opacity: 0.6 },
    phone: { pos: [-2.7, 0.5, -2], rot: [0.05, 0.35, 0], scale: 0.4, opacity: 0.22 },
    web: { pos: [-2.5, -0.8, -2.1], rot: [0, 0.3, 0], scale: 0.35, opacity: 0.18 },
    webSecondary: { pos: [-2.9, -1.3, -2.3], rot: [0, 0.3, 0], scale: 0.26, opacity: 0.12 },
    data: { pos: [1.1, 0.55, -0.3], rot: [0, -0.3, 0], scale: 1, opacity: 1 },
    system: { pos: [-0.3, -0.6, 0.1], rot: [0.4, 0.2, 0.1], scale: 0.85, opacity: 0.95 },
    automation: { pos: [2, -0.55, -0.5], rot: [0, 0, 0.5], scale: 0.7, opacity: 0.9 },
    connectorOpacity: 0.85,
  },
};
