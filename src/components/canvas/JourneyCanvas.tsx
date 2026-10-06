"use client";

import { Suspense, memo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import type { MotionValue } from "motion/react";
import * as THREE from "three";
import {
  CAMERA_POS_KEYS,
  CAMERA_TARGET_KEYS,
  VIEW_OFFSET_KEYS,
  compactFactor,
  range,
  trackNum,
  trackVec,
} from "@/lib/three/journeyTimeline";
import {
  Floor,
  FloorLights,
  Gates,
  GuideLine,
  GuideNode,
  OpeningOrbit,
  Payload,
  ShipLayer,
} from "@/components/canvas/JourneyObjects";

type Progress = MotionValue<number>;

const VOID = "#040406";

function CameraRig({ progress, parallax }: { progress: Progress; parallax: boolean }) {
  const { camera, size, pointer } = useThree();
  const pos = useRef(new THREE.Vector3());
  const target = useRef(new THREE.Vector3());
  const dir = useRef(new THREE.Vector3());
  const look = useRef(new THREE.Vector2());

  useFrame((_, delta) => {
    const p = progress.get();
    trackVec(CAMERA_POS_KEYS, p, pos.current);
    trackVec(CAMERA_TARGET_KEYS, p, target.current);

    const aspect = size.width / size.height;
    const phone = aspect < 0.6;
    const opening = 1 - range(p, 0.04, 0.14);
    // Portrait viewports narrow the horizontal FOV, so pull the camera back
    // along its view direction (the payload also compacts — see
    // compactFactor) to keep the composition inside the frame.
    let pullBack = aspect < 1.1 ? 1 + (1.1 - aspect) * 1.3 : 1;
    if (phone) pullBack *= 1 + opening * 0.14;
    dir.current.subVectors(pos.current, target.current);
    // Shallower side angles on portrait keep the plinth's silhouette narrow.
    dir.current.x *= compactFactor(aspect);
    dir.current.multiplyScalar(pullBack);
    pos.current.copy(target.current).add(dir.current);

    // Restrained pointer response: the camera leans a few centimetres.
    const k = 1 - Math.exp(-2.4 * delta);
    look.current.x += ((parallax ? pointer.x : 0) - look.current.x) * k;
    look.current.y += ((parallax ? pointer.y : 0) - look.current.y) * k;
    pos.current.x += look.current.x * 0.22;
    pos.current.y += look.current.y * 0.12;

    camera.position.copy(pos.current);
    camera.lookAt(target.current);

    // Off-axis framing: on wide screens the payload shifts right of the
    // caption column; on portrait it lifts above the caption at the bottom.
    const persp = camera as THREE.PerspectiveCamera;
    const w = size.width;
    const h = size.height;
    const offset = trackNum(VIEW_OFFSET_KEYS, p);
    if (aspect >= 1) {
      persp.setViewOffset(w, h, -offset * w, 0, w, h);
    } else {
      // Opening: pull the orbit (which sits right of centre in world
      // space) into frame above the headline. Stages: lift the payload
      // above the caption band. Phones keep the headline low, so the orbit
      // can rise; tablets centre the headline, so it stays nearer the middle.
      const lift = 0.15 + opening * (phone ? 0.08 : 0.02);
      persp.setViewOffset(w, h, opening * (phone ? 0.5 : 0.3) * w, lift * h, w, h);
    }
  });

  return null;
}

/** Fog widens during SHIP so the space visibly opens up. */
function Atmosphere({ progress }: { progress: Progress }) {
  const { scene } = useThree();
  useFrame(() => {
    const fog = scene.fog as THREE.Fog | null;
    if (!fog) return;
    const open = range(progress.get(), 0.74, 0.88);
    fog.near = 7 + open * 3;
    fog.far = 23 + open * 9;
  });
  return null;
}

/** Soft studio light panels — reflections only, never visible directly. */
const StudioEnvironment = memo(function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1} environmentIntensity={0.9}>
      <Lightformer form="rect" intensity={2.4} color="#ffffff" position={[0, 6, -2]} rotation-x={Math.PI / 2} scale={[12, 4, 1]} />
      <Lightformer form="rect" intensity={1.3} color="#dfe6f2" position={[-7, 1.5, 0]} rotation-y={Math.PI / 2} scale={[8, 1.4, 1]} />
      <Lightformer form="rect" intensity={1.1} color="#dfe6f2" position={[7, 1.2, -2]} rotation-y={-Math.PI / 2} scale={[8, 1.1, 1]} />
      <Lightformer form="rect" intensity={0.55} color="#5eead4" position={[4, -0.4, 5]} rotation-y={-Math.PI / 4} scale={[5, 0.35, 1]} />
      <Lightformer form="rect" intensity={0.5} color="#8f86ff" position={[-5, 0.4, -6]} rotation-y={Math.PI / 4} scale={[5, 0.4, 1]} />
    </Environment>
  );
});

interface JourneyCanvasProps {
  progress: Progress;
  active: boolean;
  quality: "high" | "balanced";
  parallax: boolean;
}

export default function JourneyCanvas({ progress, active, quality, parallax }: JourneyCanvasProps) {
  return (
    <Canvas
      camera={{ fov: 38, near: 0.1, far: 80, position: [0, 0.3, 8.6] }}
      dpr={quality === "high" ? [1, 1.75] : [1, 1.35]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
      aria-hidden="true"
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault());
      }}
    >
      <color attach="background" args={[VOID]} />
      <fog attach="fog" args={[VOID, 7, 23]} />
      <ambientLight intensity={0.14} />
      <directionalLight position={[4, 6, 5]} intensity={0.75} color="#e2e8f2" />
      <directionalLight position={[-5, 3, -9]} intensity={0.45} color="#a9b2ff" />

      <StudioEnvironment />
      <CameraRig progress={progress} parallax={parallax} />
      <Atmosphere progress={progress} />

      <Floor reflective={quality === "high"} />
      <FloorLights />
      <Gates progress={progress} />
      <OpeningOrbit progress={progress} />
      <GuideLine progress={progress} />
      <GuideNode progress={progress} />
      <ShipLayer progress={progress} />
      <Suspense fallback={null}>
        <Payload progress={progress} />
      </Suspense>
    </Canvas>
  );
}
