"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import { coreTargets, type CoreState, type PieceTransform } from "@/lib/three/coreTargets";

const LERP_SPEED = 2.4;

function lerpPiece(
  group: THREE.Group,
  target: PieceTransform,
  delta: number,
  mats: (THREE.Material | null)[],
) {
  const t = 1 - Math.exp(-LERP_SPEED * delta);
  group.position.lerp(new THREE.Vector3(...target.pos), t);
  group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, target.rot[0], t);
  group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, target.rot[1], t);
  group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, target.rot[2], t);
  group.scale.setScalar(THREE.MathUtils.lerp(group.scale.x, target.scale, t));
  mats.forEach((m) => {
    if (!m) return;
    const withOpacity = m as THREE.Material & { opacity: number };
    withOpacity.opacity = THREE.MathUtils.lerp(withOpacity.opacity, target.opacity, t);
  });
}

interface PieceProps {
  state: CoreState;
}

/** PHONE piece — a compact device sliver. */
function PhonePiece({ state }: PieceProps) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  const screenMat = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((_, delta) => {
    if (!group.current) return;
    lerpPiece(group.current, coreTargets[state].phone, delta, [mat.current, screenMat.current]);
  });

  return (
    <group ref={group}>
      <RoundedBox args={[0.55, 1.1, 0.08]} radius={0.09} smoothness={4}>
        <meshPhysicalMaterial ref={mat} color="#15171d" metalness={0.75} roughness={0.3} clearcoat={0.5} transparent opacity={0} />
      </RoundedBox>
      <mesh position={[0, 0, 0.045]}>
        <planeGeometry args={[0.44, 0.92]} />
        <meshStandardMaterial ref={screenMat} color="#0a0b0e" emissive="#5eead4" emissiveIntensity={0.6} transparent opacity={0} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** Content cards inside the WEB piece so it reads as a real interface. */
function WebContentBlocks({ opacityRef }: { opacityRef: React.MutableRefObject<number> }) {
  const blocks = useMemo(
    () => [
      { pos: [-0.55, 0.1, 0], size: [0.55, 0.42], color: "#5eead4", i: 0.55 },
      { pos: [0.1, 0.1, 0], size: [0.5, 0.42], color: "#6e62e5", i: 0.4 },
      { pos: [0.62, 0.1, 0], size: [0.36, 0.42], color: "#e6ebf0", i: 0.22 },
      { pos: [-0.4, -0.28, 0], size: [0.85, 0.1], color: "#e6ebf0", i: 0.2 },
      { pos: [0.4, -0.28, 0], size: [0.5, 0.1], color: "#828b9a", i: 0.16 },
    ],
    [],
  );
  const mats = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const clock = useRef(0);

  useFrame((_, delta) => {
    clock.current += delta;
    mats.current.forEach((m, idx) => {
      if (!m) return;
      const base = blocks[idx]!.i;
      const shimmer = 1 + Math.sin(clock.current * 0.7 + idx * 1.6) * 0.12;
      m.emissiveIntensity = base * shimmer * opacityRef.current;
      m.opacity = opacityRef.current;
    });
  });

  return (
    <group position={[0, 0, 0.028]}>
      {blocks.map((b, idx) => (
        <mesh key={idx} position={b.pos as [number, number, number]}>
          <planeGeometry args={b.size as [number, number]} />
          <meshStandardMaterial
            ref={(el) => {
              mats.current[idx] = el;
            }}
            color="#0a0b0e"
            emissive={b.color}
            emissiveIntensity={0}
            transparent
            opacity={0}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** WEB piece — a browser-style panel with a top bar and real content cards. */
function WebPiece({ state, secondary = false }: PieceProps & { secondary?: boolean }) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);
  const barMat = useRef<THREE.MeshStandardMaterial>(null);
  const edgeMat = useRef<THREE.LineBasicMaterial>(null);
  const contentOpacity = useRef(0);

  useFrame((_, delta) => {
    if (!group.current) return;
    const target = secondary ? coreTargets[state].webSecondary : coreTargets[state].web;
    lerpPiece(group.current, target, delta, [mat.current, barMat.current, edgeMat.current]);
    contentOpacity.current = THREE.MathUtils.lerp(
      contentOpacity.current,
      target.opacity,
      1 - Math.exp(-LERP_SPEED * delta),
    );
  });

  return (
    <group ref={group}>
      <RoundedBox args={[1.7, 1.05, 0.05]} radius={0.05} smoothness={3}>
        <meshPhysicalMaterial ref={mat} color="#12141a" metalness={0.4} roughness={0.35} clearcoat={0.35} transparent opacity={0} />
      </RoundedBox>
      <lineSegments position={[0, 0, 0.001]}>
        <edgesGeometry args={[new THREE.BoxGeometry(1.7, 1.05, 0.05)]} />
        <lineBasicMaterial ref={edgeMat} color="#5eead4" transparent opacity={0} />
      </lineSegments>
      <mesh position={[0, 0.42, 0.03]}>
        <planeGeometry args={[1.5, 0.08]} />
        <meshStandardMaterial ref={barMat} color="#0a0b0e" emissive="#5eead4" emissiveIntensity={0.4} transparent opacity={0} toneMapped={false} />
      </mesh>
      {!secondary && <WebContentBlocks opacityRef={contentOpacity} />}
    </group>
  );
}

/** DATA piece — a stacked-disc database form. */
function DataPiece({ state }: PieceProps) {
  const group = useRef<THREE.Group>(null);
  const mats = useRef<(THREE.MeshStandardMaterial | null)[]>([]);

  useFrame((_, delta) => {
    if (!group.current) return;
    lerpPiece(group.current, coreTargets[state].data, delta, mats.current);
  });

  const discs = [0.3, 0.1, -0.1, -0.3];

  return (
    <group ref={group}>
      {discs.map((y, idx) => (
        <mesh key={idx} position={[0, y, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.08, 28]} />
          <meshStandardMaterial
            ref={(el) => {
              mats.current[idx] = el;
            }}
            color="#0d0f13"
            metalness={0.6}
            roughness={0.3}
            emissive="#6e62e5"
            emissiveIntensity={0.55}
            transparent
            opacity={0}
          />
        </mesh>
      ))}
      {/* thin emissive ring around the edge of each disc — reads as an
          active server stack rather than plain blank cylinders */}
      {discs.map((y, idx) => (
        <mesh key={`ring-${idx}`} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.42, 0.008, 6, 32]} />
          <meshStandardMaterial
            ref={(el) => {
              mats.current[discs.length + idx] = el;
            }}
            color="#0a0b0e"
            emissive="#5eead4"
            emissiveIntensity={0.9}
            transparent
            opacity={0}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** SYSTEM piece — an interlocking ring around a core, orbit/integration motif. */
function SystemPiece({ state }: PieceProps) {
  const group = useRef<THREE.Group>(null);
  const coreMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const ringMat = useRef<THREE.MeshStandardMaterial>(null);
  const ring2Mat = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((_, delta) => {
    if (!group.current) return;
    lerpPiece(group.current, coreTargets[state].system, delta, [coreMat.current, ringMat.current, ring2Mat.current]);
    group.current.rotation.z += delta * 0.15;
  });

  return (
    <group ref={group}>
      <mesh>
        <icosahedronGeometry args={[0.32, 0]} />
        <meshPhysicalMaterial ref={coreMat} color="#15171d" metalness={0.7} roughness={0.3} clearcoat={0.5} transparent opacity={0} />
      </mesh>
      <mesh rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[0.55, 0.015, 8, 48]} />
        <meshStandardMaterial ref={ringMat} color="#0a0b0e" emissive="#6e62e5" emissiveIntensity={1} transparent opacity={0} toneMapped={false} />
      </mesh>
      <mesh rotation={[0, Math.PI / 2.6, Math.PI / 5]}>
        <torusGeometry args={[0.68, 0.012, 8, 48]} />
        <meshStandardMaterial ref={ring2Mat} color="#0a0b0e" emissive="#5eead4" emissiveIntensity={0.8} transparent opacity={0} toneMapped={false} />
      </mesh>
    </group>
  );
}

/** AUTOMATION piece — a small directional flow chevron cluster. */
function AutomationPiece({ state }: PieceProps) {
  const group = useRef<THREE.Group>(null);
  const mats = useRef<(THREE.MeshStandardMaterial | null)[]>([]);

  useFrame((_, delta) => {
    if (!group.current) return;
    lerpPiece(group.current, coreTargets[state].automation, delta, mats.current);
  });

  const chevrons = [-0.32, 0, 0.32];

  return (
    <group ref={group}>
      {chevrons.map((x, idx) => (
        <mesh key={idx} position={[x, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.14, 0.26, 3]} />
          <meshStandardMaterial
            ref={(el) => {
              mats.current[idx] = el;
            }}
            color="#0a0b0e"
            emissive="#5eead4"
            emissiveIntensity={0.9 - idx * 0.2}
            transparent
            opacity={0}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function CenterCore({ state }: PieceProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((_, delta) => {
    if (!mesh.current || !mat.current) return;
    const t = 1 - Math.exp(-LERP_SPEED * delta);
    const target = coreTargets[state].center;
    mesh.current.scale.setScalar(THREE.MathUtils.lerp(mesh.current.scale.x, target.scale, t));
    mat.current.opacity = THREE.MathUtils.lerp(mat.current.opacity, target.opacity, t);
    mesh.current.rotation.y += delta * 0.2;
  });

  return (
    <mesh ref={mesh}>
      <icosahedronGeometry args={[0.22, 1]} />
      <meshStandardMaterial ref={mat} color="#0a0b0e" emissive="#6e62e5" emissiveIntensity={0.8} wireframe transparent opacity={0} toneMapped={false} />
    </mesh>
  );
}

function Connectors({ state }: PieceProps) {
  const positions = useMemo(() => {
    const pts: [number, number, number][] = [
      [0, 0, 0],
      coreTargets.mobile.phone.pos,
      [0, 0, 0],
      coreTargets.mobile.web.pos,
      [0, 0, 0],
      coreTargets.mobile.data.pos,
      [0, 0, 0],
      coreTargets.mobile.system.pos,
      [0, 0, 0],
      coreTargets.mobile.automation.pos,
    ];
    return new Float32Array(pts.flat());
  }, []);
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const matRef = useRef<THREE.LineBasicMaterial>(null);

  useFrame((_, delta) => {
    if (!geometryRef.current || !matRef.current) return;
    const t = coreTargets[state];
    const attr = geometryRef.current.getAttribute("position") as THREE.BufferAttribute;
    const targets = [t.phone.pos, t.web.pos, t.data.pos, t.system.pos, t.automation.pos];
    targets.forEach((p, idx) => attr.setXYZ(idx * 2 + 1, ...p));
    attr.needsUpdate = true;
    matRef.current.opacity = THREE.MathUtils.lerp(
      matRef.current.opacity,
      t.connectorOpacity,
      1 - Math.exp(-LERP_SPEED * delta),
    );
  });

  return (
    <lineSegments>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={10}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial ref={matRef} color="#828b9a" transparent opacity={0} />
    </lineSegments>
  );
}

export function ConvergenceCore({ state }: PieceProps) {
  return (
    <group>
      <CenterCore state={state} />
      <Connectors state={state} />
      <PhonePiece state={state} />
      <WebPiece state={state} />
      <WebPiece state={state} secondary />
      <DataPiece state={state} />
      <SystemPiece state={state} />
      <AutomationPiece state={state} />
    </group>
  );
}
