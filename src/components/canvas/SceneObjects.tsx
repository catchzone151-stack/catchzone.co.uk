"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { RoundedBox } from "@react-three/drei";
import * as THREE from "three";
import type { IntroPhase } from "@/lib/intro/IntroContext";
import { phaseTargets, type Transform3 } from "@/lib/three/phaseTargets";

const LERP_SPEED = 2.6;

function lerpTransform(
  group: THREE.Group,
  target: Transform3,
  delta: number,
  material?: THREE.Material | THREE.Material[] | null,
) {
  const t = 1 - Math.exp(-LERP_SPEED * delta);
  group.position.lerp(
    new THREE.Vector3(...target.pos),
    t,
  );
  group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, target.rot[0], t);
  group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, target.rot[1], t);
  group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, target.rot[2], t);
  const s = THREE.MathUtils.lerp(group.scale.x, target.scale, t);
  group.scale.setScalar(s);

  const mats = Array.isArray(material) ? material : material ? [material] : [];
  mats.forEach((m) => {
    const withOpacity = m as THREE.Material & { opacity: number };
    withOpacity.opacity = THREE.MathUtils.lerp(
      withOpacity.opacity,
      target.opacity,
      t,
    );
  });
}

interface DeviceProps {
  phase: IntroPhase;
}

export function PhoneAssembly({ phase }: DeviceProps) {
  const group = useRef<THREE.Group>(null);
  const chassisMat = useRef<THREE.MeshStandardMaterial>(null);
  const glassMat = useRef<THREE.MeshStandardMaterial>(null);
  const screenMat = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((_, delta) => {
    if (!group.current) return;
    const target = phaseTargets[phase].phone;
    lerpTransform(group.current, target, delta, [
      chassisMat.current!,
      glassMat.current!,
    ]);
    if (screenMat.current) {
      const screenTarget = phaseTargets[phase].screenIntensity;
      screenMat.current.emissiveIntensity = THREE.MathUtils.lerp(
        screenMat.current.emissiveIntensity,
        screenTarget,
        1 - Math.exp(-LERP_SPEED * delta),
      );
    }
  });

  return (
    <group ref={group}>
      <RoundedBox args={[1.1, 2.2, 0.14]} radius={0.14} smoothness={4}>
        <meshStandardMaterial
          ref={chassisMat}
          color="#1a1d24"
          metalness={0.6}
          roughness={0.35}
          transparent
          opacity={0}
        />
      </RoundedBox>
      <RoundedBox args={[0.94, 1.94, 0.02]} radius={0.1} smoothness={4} position={[0, 0, 0.08]}>
        <meshStandardMaterial
          ref={glassMat}
          color="#5eead4"
          metalness={0.2}
          roughness={0.1}
          transparent
          opacity={0}
        />
      </RoundedBox>
      <mesh position={[0, 0, 0.095]}>
        <planeGeometry args={[0.8, 1.7]} />
        <meshStandardMaterial
          ref={screenMat}
          color="#0a0b0e"
          emissive="#5eead4"
          emissiveIntensity={0}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export function PlatformAssembly({ phase }: DeviceProps) {
  const group = useRef<THREE.Group>(null);
  const slabMat = useRef<THREE.MeshStandardMaterial>(null);
  const wireMat = useRef<THREE.LineBasicMaterial>(null);
  const panelMat = useRef<THREE.MeshStandardMaterial>(null);

  useFrame((_, delta) => {
    if (!group.current) return;
    const target = phaseTargets[phase].platform;
    lerpTransform(group.current, target, delta, [
      slabMat.current!,
      wireMat.current!,
      panelMat.current!,
    ]);
  });

  return (
    <group ref={group}>
      <RoundedBox args={[3.4, 2.1, 0.1]} radius={0.06} smoothness={4}>
        <meshStandardMaterial
          ref={slabMat}
          color="#12141a"
          metalness={0.5}
          roughness={0.4}
          transparent
          opacity={0}
        />
      </RoundedBox>
      <mesh position={[0, 0, 0.07]}>
        <planeGeometry args={[3.1, 1.8]} />
        <meshStandardMaterial
          ref={panelMat}
          color="#0a0b0e"
          emissive="#6e62e5"
          emissiveIntensity={0.5}
          transparent
          opacity={0}
        />
      </mesh>
      <lineSegments position={[0, 0, 0.075]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(3.1, 1.8)]} />
        <lineBasicMaterial ref={wireMat} color="#6e62e5" transparent opacity={0} />
      </lineSegments>
    </group>
  );
}

export function ConnectionBeam({ phase }: DeviceProps) {
  const geometryRef = useRef<THREE.BufferGeometry>(null);
  const materialRef = useRef<THREE.LineBasicMaterial>(null);
  const initialPositions = useMemo(() => new Float32Array(6), []);

  useFrame((_, delta) => {
    if (!materialRef.current || !geometryRef.current) return;
    const targetOpacity = phaseTargets[phase].beamOpacity;
    materialRef.current.opacity = THREE.MathUtils.lerp(
      materialRef.current.opacity,
      targetOpacity,
      1 - Math.exp(-LERP_SPEED * delta),
    );

    const phoneTarget = phaseTargets[phase].phone.pos;
    const platformTarget = phaseTargets[phase].platform.pos;
    const positionAttr = geometryRef.current.getAttribute(
      "position",
    ) as THREE.BufferAttribute;
    positionAttr.setXYZ(0, phoneTarget[0] + 0.55, phoneTarget[1], phoneTarget[2]);
    positionAttr.setXYZ(
      1,
      platformTarget[0] - 1.55,
      platformTarget[1],
      platformTarget[2],
    );
    positionAttr.needsUpdate = true;
  });

  return (
    <line>
      <bufferGeometry ref={geometryRef}>
        <bufferAttribute
          attach="attributes-position"
          count={2}
          array={initialPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial
        ref={materialRef}
        color="#5eead4"
        transparent
        opacity={0}
      />
    </line>
  );
}

export function ParticleField({ count }: { count: number }) {
  const points = useRef<THREE.Points>(null);
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      const radius = 4 + Math.random() * 6;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      arr[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      arr[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta) * 0.6;
      arr[i * 3 + 2] = radius * Math.cos(phi) - 3;
    }
    return arr;
  }, [count]);

  useFrame((_, delta) => {
    if (points.current) {
      points.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.018}
        color="#828b9a"
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </points>
  );
}
