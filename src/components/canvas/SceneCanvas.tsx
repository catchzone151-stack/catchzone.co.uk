"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import type { IntroPhase } from "@/lib/intro/IntroContext";
import { phaseTargets } from "@/lib/three/phaseTargets";
import {
  ConnectionBeam,
  DataPacket,
  InterfaceFragments,
  NearParticleField,
  ParticleField,
  PhoneAssembly,
  PlatformAssembly,
} from "@/components/canvas/SceneObjects";

const LERP_SPEED = 2.2;

function CameraRig({ phase, allowParallax }: { phase: IntroPhase; allowParallax: boolean }) {
  const { camera, pointer, size } = useThree();
  const lookAtTarget = useRef(new THREE.Vector3());

  useFrame((_, delta) => {
    const target = phaseTargets[phase];
    const t = 1 - Math.exp(-LERP_SPEED * delta);

    const aspect = size.width / size.height;
    // Portrait viewports get a narrower horizontal FOV at a fixed vertical
    // FOV, which makes fixed world-space objects appear larger/more likely
    // to collide with the DOM text column. Pull the camera back as the
    // viewport gets taller than it is wide to keep the composition contained.
    const distanceScale = aspect < 0.9 ? 1 + (0.9 - aspect) * 1.1 : 1;

    let [x, y, z] = target.camera;
    z *= distanceScale;
    if (allowParallax && phase === "hero") {
      x += pointer.x * 0.5;
      y += pointer.y * 0.26;
    }

    camera.position.lerp(new THREE.Vector3(x, y, z), t);
    lookAtTarget.current.lerp(new THREE.Vector3(...target.lookAt), t);
    camera.lookAt(lookAtTarget.current);
  });

  return null;
}

interface SceneCanvasProps {
  phase: IntroPhase;
  particleCount: number;
  allowParallax?: boolean;
  frameloop?: "always" | "demand" | "never";
}

export default function SceneCanvas({
  phase,
  particleCount,
  allowParallax = true,
  frameloop = "always",
}: SceneCanvasProps) {
  return (
    <Canvas
      camera={{ fov: 42, position: [0, 0, 10.5] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={frameloop}
      aria-hidden="true"
      onCreated={({ gl }) => {
        const canvasEl = gl.domElement;
        canvasEl.addEventListener("webglcontextlost", (e) => {
          e.preventDefault();
        });
      }}
    >
      <color attach="background" args={["#040406"]} />
      <fog attach="fog" args={["#040406", 8, 16]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 5, 6]} intensity={1.1} color="#e6ebf0" />
      <pointLight position={[-3, -1, 2]} intensity={2} color="#6e62e5" />
      <pointLight position={[3, 1, 3]} intensity={1.6} color="#5eead4" />

      <CameraRig phase={phase} allowParallax={allowParallax} />
      <ParticleField count={particleCount} />
      <NearParticleField />
      <InterfaceFragments phase={phase} />
      <PhoneAssembly phase={phase} />
      <PlatformAssembly phase={phase} />
      <ConnectionBeam phase={phase} />
      <DataPacket phase={phase} />
    </Canvas>
  );
}
