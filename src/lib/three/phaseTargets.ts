import type { IntroPhase } from "@/lib/intro/IntroContext";

export interface Transform3 {
  pos: [number, number, number];
  rot: [number, number, number];
  scale: number;
  opacity: number;
}

export interface PhaseTarget {
  camera: [number, number, number];
  lookAt: [number, number, number];
  phone: Transform3;
  platform: Transform3;
  beamOpacity: number;
  screenIntensity: number;
}

/**
 * Hand-tuned key poses for each intro phase. A React Three Fiber frame loop
 * lerps toward whichever pose matches the current phase — simpler and more
 * resilient across remounts than driving the same values from a GSAP
 * timeline running in parallel with React state.
 */
export const phaseTargets: Record<IntroPhase, PhaseTarget> = {
  void: {
    camera: [0, 0, 10.5],
    lookAt: [0, 0, 0],
    phone: { pos: [-1.6, -1.4, -1.5], rot: [0.4, 0.9, 0.1], scale: 0.15, opacity: 0 },
    platform: { pos: [1.6, 1.2, -2], rot: [0.2, -0.6, 0], scale: 0.15, opacity: 0 },
    beamOpacity: 0,
    screenIntensity: 0,
  },
  assembly: {
    camera: [0.3, 0.15, 7.4],
    lookAt: [0, 0, 0],
    phone: { pos: [-2.05, 0.05, 0], rot: [0.08, 0.45, 0.02], scale: 1, opacity: 1 },
    platform: { pos: [2.0, -0.15, -0.4], rot: [0, -0.32, 0], scale: 1, opacity: 1 },
    beamOpacity: 0,
    screenIntensity: 0.3,
  },
  connection: {
    camera: [0.15, 0.12, 6.4],
    lookAt: [0, -0.05, 0],
    phone: { pos: [-2.0, 0.05, 0], rot: [0.05, 0.38, 0.02], scale: 1.02, opacity: 1 },
    platform: { pos: [2.0, -0.15, -0.4], rot: [0, -0.28, 0], scale: 1.02, opacity: 1 },
    beamOpacity: 1,
    screenIntensity: 1,
  },
  transition: {
    camera: [0, 0.05, 4.6],
    lookAt: [0.3, 0, -0.3],
    phone: { pos: [-2.3, -0.05, 0.3], rot: [0.03, 0.3, 0.01], scale: 1.08, opacity: 1 },
    platform: { pos: [2.2, -0.3, -0.7], rot: [0, -0.22, 0], scale: 1.15, opacity: 1 },
    beamOpacity: 0.5,
    screenIntensity: 1,
  },
  hero: {
    camera: [0.3, 0.04, 5.1],
    lookAt: [0.2, -0.05, 0],
    phone: { pos: [-0.1, -0.3, -0.5], rot: [0.04, 0.32, 0.01], scale: 1.45, opacity: 0.96 },
    platform: { pos: [2.35, -0.05, -1.25], rot: [0, -0.2, 0], scale: 1.75, opacity: 0.95 },
    beamOpacity: 0.5,
    screenIntensity: 0.95,
  },
};
