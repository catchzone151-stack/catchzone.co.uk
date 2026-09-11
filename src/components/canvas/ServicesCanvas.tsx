"use client";

import { useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { coreTargets, type CoreState } from "@/lib/three/coreTargets";
import { ConvergenceCore } from "@/components/canvas/ConvergenceCore";

const LERP_SPEED = 2.2;

function CameraRig({ state }: { state: CoreState }) {
  const { camera } = useThree();

  useFrame((_, delta) => {
    const t = 1 - Math.exp(-LERP_SPEED * delta);
    const [x, y, z] = coreTargets[state].camera;
    camera.position.lerp(new THREE.Vector3(x, y, z), t);
    camera.lookAt(0, 0, 0);
  });

  return null;
}

interface ServicesCanvasProps {
  state: CoreState;
  frameloop?: "always" | "demand" | "never";
}

export default function ServicesCanvas({ state, frameloop = "always" }: ServicesCanvasProps) {
  return (
    <Canvas
      camera={{ fov: 40, position: [0.32, 0, 4.1] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      frameloop={frameloop}
      aria-hidden="true"
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault());
      }}
    >
      <color attach="background" args={["#040406"]} />
      <fog attach="fog" args={["#040406", 6, 13]} />
      <ambientLight intensity={0.45} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} color="#e6ebf0" />
      <pointLight position={[-3, -1, 2]} intensity={1.8} color="#6e62e5" />
      <pointLight position={[3, 1, 3]} intensity={1.4} color="#5eead4" />

      <CameraRig state={state} />
      <ConvergenceCore state={state} />
    </Canvas>
  );
}
