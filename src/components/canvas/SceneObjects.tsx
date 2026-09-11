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
  group.position.lerp(new THREE.Vector3(...target.pos), t);
  group.rotation.x = THREE.MathUtils.lerp(group.rotation.x, target.rot[0], t);
  group.rotation.y = THREE.MathUtils.lerp(group.rotation.y, target.rot[1], t);
  group.rotation.z = THREE.MathUtils.lerp(group.rotation.z, target.rot[2], t);
  const s = THREE.MathUtils.lerp(group.scale.x, target.scale, t);
  group.scale.setScalar(s);

  const mats = Array.isArray(material) ? material : material ? [material] : [];
  mats.forEach((m) => {
    const withOpacity = m as THREE.Material & { opacity: number };
    withOpacity.opacity = THREE.MathUtils.lerp(withOpacity.opacity, target.opacity, t);
  });
}

interface DeviceProps {
  phase: IntroPhase;
}

/**
 * Small emissive rectangles arranged like a real interface (status bar,
 * content cards, nav row) instead of one flat glowing plane — this is what
 * makes the screen read as "product" rather than "glow".
 */
function UIBlocks({
  opacityRef,
}: {
  opacityRef: React.MutableRefObject<number>;
}) {
  const group = useRef<THREE.Group>(null);
  const blocks = useMemo(
    () => [
      { pos: [0, 0.72, 0], size: [0.62, 0.06], color: "#5eead4", i: 0.9 },
      { pos: [-0.14, 0.5, 0], size: [0.34, 0.16], color: "#e6ebf0", i: 0.35 },
      { pos: [0.2, 0.5, 0], size: [0.14, 0.16], color: "#6e62e5", i: 0.7 },
      { pos: [0, 0.24, 0], size: [0.62, 0.12], color: "#e6ebf0", i: 0.28 },
      { pos: [0, 0.04, 0], size: [0.62, 0.12], color: "#e6ebf0", i: 0.22 },
      { pos: [-0.2, -0.62, 0], size: [0.14, 0.14], color: "#5eead4", i: 0.5 },
      { pos: [0, -0.62, 0], size: [0.14, 0.14], color: "#828b9a", i: 0.25 },
      { pos: [0.2, -0.62, 0], size: [0.14, 0.14], color: "#828b9a", i: 0.25 },
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
      // gentle per-block shimmer so a settled screen still reads as "live"
      const shimmer = 1 + Math.sin(clock.current * 0.8 + idx * 1.7) * 0.12;
      m.emissiveIntensity = base * shimmer * opacityRef.current;
      m.opacity = opacityRef.current;
    });
  });

  return (
    <group ref={group} position={[0, 0, 0.098]}>
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

export function PhoneAssembly({ phase }: DeviceProps) {
  const group = useRef<THREE.Group>(null);
  const chassisMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const glassMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const plateMat = useRef<THREE.MeshStandardMaterial>(null);
  const edgeMat = useRef<THREE.LineBasicMaterial>(null);
  const cameraMat = useRef<THREE.MeshStandardMaterial>(null);
  const screenOpacity = useRef(0);

  const edgeClock = useRef(0);

  useFrame((_, delta) => {
    if (!group.current) return;
    const target = phaseTargets[phase].phone;
    lerpTransform(group.current, target, delta, [
      chassisMat.current!,
      glassMat.current!,
      plateMat.current!,
      edgeMat.current!,
      cameraMat.current!,
    ]);
    const t = 1 - Math.exp(-LERP_SPEED * delta);
    const screenTarget = phaseTargets[phase].screenIntensity;
    screenOpacity.current = THREE.MathUtils.lerp(screenOpacity.current, screenTarget, t);

    // soft reflected light travelling along the edge accent
    edgeClock.current += delta;
    if (edgeMat.current) {
      edgeMat.current.opacity *= 0.8 + Math.sin(edgeClock.current * 0.6) * 0.2;
    }
  });

  return (
    <group ref={group}>
      {/* structural plate — sits deepest, gives the stack real thickness */}
      <RoundedBox args={[0.98, 2.02, 0.04]} radius={0.08} smoothness={3} position={[0, 0, -0.03]}>
        <meshStandardMaterial
          ref={plateMat}
          color="#0d0f13"
          metalness={0.7}
          roughness={0.5}
          transparent
          opacity={0}
        />
      </RoundedBox>

      {/* chassis — physical material for real specular response to lights */}
      <RoundedBox args={[1.1, 2.2, 0.14]} radius={0.14} smoothness={4}>
        <meshPhysicalMaterial
          ref={chassisMat}
          color="#15171d"
          metalness={0.75}
          roughness={0.28}
          clearcoat={0.6}
          clearcoatRoughness={0.25}
          transparent
          opacity={0}
        />
      </RoundedBox>

      {/* edge accent line tracing the chassis silhouette */}
      <lineSegments position={[0, 0, 0.001]}>
        <edgesGeometry args={[new THREE.BoxGeometry(1.1, 2.2, 0.14)]} />
        <lineBasicMaterial ref={edgeMat} color="#5eead4" transparent opacity={0} />
      </lineSegments>

      {/* camera / sensor detail */}
      <mesh position={[0.32, 0.86, 0.075]}>
        <circleGeometry args={[0.055, 24]} />
        <meshStandardMaterial ref={cameraMat} color="#04141f" metalness={0.4} roughness={0.2} transparent opacity={0} />
      </mesh>

      {/* glass — physical transmission for real depth/refraction */}
      <RoundedBox args={[0.94, 1.94, 0.02]} radius={0.1} smoothness={4} position={[0, 0, 0.08]}>
        <meshPhysicalMaterial
          ref={glassMat}
          color="#0a0b0e"
          metalness={0}
          roughness={0.05}
          transmission={0.55}
          thickness={0.3}
          transparent
          opacity={0}
        />
      </RoundedBox>

      <UIBlocks opacityRef={screenOpacity} />
    </group>
  );
}

/**
 * Small orbiting data nodes with thin connecting lines — reads as a live
 * backend/network cluster rather than a flat rectangle.
 */
function DataNodeCluster({
  opacityRef,
}: {
  opacityRef: React.MutableRefObject<number>;
}) {
  const nodes = useMemo(
    () => [
      [-0.85, 0.35, -0.25],
      [-0.35, 0.55, -0.35],
      [0.25, 0.4, -0.2],
      [0.85, 0.5, -0.3],
      [-0.55, -0.35, -0.3],
      [0.5, -0.4, -0.25],
    ] as [number, number, number][],
    [],
  );
  const links: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [0, 4],
    [2, 5],
    [4, 5],
  ];
  const nodeMats = useRef<(THREE.MeshStandardMaterial | null)[]>([]);
  const lineMats = useRef<(THREE.LineBasicMaterial | null)[]>([]);

  useFrame(() => {
    nodeMats.current.forEach((m) => {
      if (m) m.opacity = opacityRef.current;
    });
    lineMats.current.forEach((m) => {
      if (m) m.opacity = opacityRef.current * 0.5;
    });
  });

  return (
    <group>
      {nodes.map((p, idx) => (
        <mesh key={idx} position={p}>
          <sphereGeometry args={[0.035, 12, 12]} />
          <meshStandardMaterial
            ref={(el) => {
              nodeMats.current[idx] = el;
            }}
            color="#0a0b0e"
            emissive="#6e62e5"
            emissiveIntensity={1.2}
            transparent
            opacity={0}
            toneMapped={false}
          />
        </mesh>
      ))}
      {links.map(([a, b], idx) => {
        const linePositions = new Float32Array([...nodes[a]!, ...nodes[b]!]);
        return (
        <line key={idx}>
          <bufferGeometry>
            <bufferAttribute
              attach="attributes-position"
              count={2}
              array={linePositions}
              itemSize={3}
              args={[linePositions, 3]}
            />
          </bufferGeometry>
          <lineBasicMaterial
            ref={(el) => {
              lineMats.current[idx] = el;
            }}
            color="#6e62e5"
            transparent
            opacity={0}
          />
        </line>
        );
      })}
    </group>
  );
}

/**
 * Content blocks inside the front web panel — a sidebar rail plus a grid
 * of content cards — so the "web" surface reads as a real interface
 * rather than an outlined rectangle with just a top bar.
 */
function WebUIBlocks({
  opacityRef,
}: {
  opacityRef: React.MutableRefObject<number>;
}) {
  const blocks = useMemo(
    () => [
      { pos: [-1.28, 0.15, 0], size: [0.42, 1.36], color: "#828b9a", i: 0.16 },
      { pos: [-0.55, 0.42, 0], size: [0.85, 0.52], color: "#5eead4", i: 0.55 },
      { pos: [0.42, 0.42, 0], size: [0.85, 0.52], color: "#6e62e5", i: 0.4 },
      { pos: [-0.55, -0.18, 0], size: [0.85, 0.32], color: "#e6ebf0", i: 0.22 },
      { pos: [0.42, -0.18, 0], size: [0.85, 0.32], color: "#e6ebf0", i: 0.2 },
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
      const shimmer = 1 + Math.sin(clock.current * 0.6 + idx * 1.4) * 0.1;
      m.emissiveIntensity = base * shimmer * opacityRef.current;
      m.opacity = opacityRef.current;
    });
  });

  return (
    <group position={[0, 0, 0.038]}>
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

/**
 * The "wider digital platform" object: three cascading interface panels at
 * different depths (front web surface, mid system layer, rear data/backend
 * layer) instead of one flat slab, plus a live node cluster on the rear
 * panel so the backend genuinely reads as infrastructure.
 */
export function PlatformAssembly({ phase }: DeviceProps) {
  const group = useRef<THREE.Group>(null);
  const frontMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const frontEdgeMat = useRef<THREE.LineBasicMaterial>(null);
  const frontPanelMat = useRef<THREE.MeshStandardMaterial>(null);
  const midMat = useRef<THREE.MeshStandardMaterial>(null);
  const midEdgeMat = useRef<THREE.LineBasicMaterial>(null);
  const rearMat = useRef<THREE.MeshStandardMaterial>(null);
  const rearEdgeMat = useRef<THREE.LineBasicMaterial>(null);
  const nodeOpacity = useRef(0);
  const webUiOpacity = useRef(0);
  const edgeClock = useRef(0);

  useFrame((_, delta) => {
    if (!group.current) return;
    const target = phaseTargets[phase].platform;
    lerpTransform(group.current, target, delta, [
      frontMat.current!,
      frontEdgeMat.current!,
      frontPanelMat.current!,
      midMat.current!,
      midEdgeMat.current!,
      rearMat.current!,
      rearEdgeMat.current!,
    ]);

    edgeClock.current += delta;
    const shimmer = 0.8 + Math.sin(edgeClock.current * 0.5) * 0.2;
    if (frontEdgeMat.current) frontEdgeMat.current.opacity *= shimmer;
    if (midEdgeMat.current) midEdgeMat.current.opacity *= 0.8 + Math.sin(edgeClock.current * 0.5 + 1.4) * 0.2;
    if (rearEdgeMat.current) rearEdgeMat.current.opacity *= 0.8 + Math.sin(edgeClock.current * 0.5 + 2.8) * 0.2;

    const t = 1 - Math.exp(-LERP_SPEED * delta);
    nodeOpacity.current = THREE.MathUtils.lerp(
      nodeOpacity.current,
      target.opacity * (phase === "hero" || phase === "connection" || phase === "transition" ? 1 : 0),
      t,
    );
    webUiOpacity.current = THREE.MathUtils.lerp(webUiOpacity.current, target.opacity, t);
  });

  return (
    <group ref={group}>
      {/* rear layer — backend/data, dim and deep */}
      <group position={[0.18, -0.1, -0.55]}>
        <RoundedBox args={[2.6, 1.6, 0.05]} radius={0.05} smoothness={3}>
          <meshStandardMaterial ref={rearMat} color="#0a0b0e" metalness={0.4} roughness={0.6} transparent opacity={0} />
        </RoundedBox>
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(2.6, 1.6, 0.05)]} />
          <lineBasicMaterial ref={rearEdgeMat} color="#6e62e5" transparent opacity={0} />
        </lineSegments>
        <DataNodeCluster opacityRef={nodeOpacity} />
      </group>

      {/* mid layer — system / integration plane */}
      <group position={[-0.1, 0.05, -0.25]}>
        <RoundedBox args={[2.9, 1.75, 0.05]} radius={0.05} smoothness={3}>
          <meshStandardMaterial ref={midMat} color="#0d0f13" metalness={0.5} roughness={0.45} transparent opacity={0} />
        </RoundedBox>
        <lineSegments>
          <edgesGeometry args={[new THREE.BoxGeometry(2.9, 1.75, 0.05)]} />
          <lineBasicMaterial ref={midEdgeMat} color="#828b9a" transparent opacity={0} />
        </lineSegments>
      </group>

      {/* front layer — customer-facing web surface */}
      <group>
        <RoundedBox args={[3.2, 1.95, 0.06]} radius={0.06} smoothness={4}>
          <meshPhysicalMaterial
            ref={frontMat}
            color="#12141a"
            metalness={0.45}
            roughness={0.3}
            clearcoat={0.4}
            transparent
            opacity={0}
          />
        </RoundedBox>
        <lineSegments position={[0, 0, 0.001]}>
          <edgesGeometry args={[new THREE.BoxGeometry(3.2, 1.95, 0.06)]} />
          <lineBasicMaterial ref={frontEdgeMat} color="#5eead4" transparent opacity={0} />
        </lineSegments>
        {/* browser-style top bar to read instantly as "web" */}
        <mesh position={[0, 0.82, 0.035]}>
          <planeGeometry args={[2.9, 0.14]} />
          <meshStandardMaterial
            ref={frontPanelMat}
            color="#0a0b0e"
            emissive="#5eead4"
            emissiveIntensity={0.4}
            transparent
            opacity={0}
            toneMapped={false}
          />
        </mesh>
        <WebUIBlocks opacityRef={webUiOpacity} />
      </group>
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
    const positionAttr = geometryRef.current.getAttribute("position") as THREE.BufferAttribute;
    positionAttr.setXYZ(0, phoneTarget[0] + 0.55, phoneTarget[1], phoneTarget[2]);
    positionAttr.setXYZ(1, platformTarget[0] - 1.6, platformTarget[1], platformTarget[2]);
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
          args={[initialPositions, 3]}
        />
      </bufferGeometry>
      <lineBasicMaterial ref={materialRef} color="#5eead4" transparent opacity={0} />
    </line>
  );
}

/**
 * A packet of light travelling the connection beam — the one piece of
 * literal "data movement" the brief asks to keep visible even when idle.
 */
export function DataPacket({ phase }: DeviceProps) {
  const mesh = useRef<THREE.Mesh>(null);
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  const progress = useRef(0);

  useFrame((_, delta) => {
    if (!mesh.current || !mat.current) return;
    const target = phaseTargets[phase];
    const active = target.beamOpacity > 0.05;
    mat.current.opacity = THREE.MathUtils.lerp(mat.current.opacity, active ? 0.9 : 0, 1 - Math.exp(-3 * delta));

    progress.current = (progress.current + delta * 0.35) % 1;
    const from = new THREE.Vector3(target.phone.pos[0] + 0.55, target.phone.pos[1], target.phone.pos[2]);
    const to = new THREE.Vector3(target.platform.pos[0] - 1.6, target.platform.pos[1], target.platform.pos[2]);
    mesh.current.position.lerpVectors(from, to, progress.current);
  });

  return (
    <mesh ref={mesh}>
      <sphereGeometry args={[0.03, 10, 10]} />
      <meshStandardMaterial ref={mat} color="#0a0b0e" emissive="#5eead4" emissiveIntensity={1.6} transparent opacity={0} toneMapped={false} />
    </mesh>
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
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.018} color="#828b9a" transparent opacity={0.55} sizeAttenuation />
    </points>
  );
}

/**
 * A handful of larger, closer, slower particles — depth variety alongside
 * the distant star field rather than just more of the same dots.
 */
export function NearParticleField({ count = 18 }: { count?: number }) {
  const points = useRef<THREE.Points>(null);
  const seeds = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        pos: new THREE.Vector3(
          (Math.random() - 0.5) * 7,
          (Math.random() - 0.5) * 4,
          Math.random() * -3 + 1,
        ),
        speed: 0.04 + Math.random() * 0.06,
        phase: Math.random() * Math.PI * 2,
      })),
    [count],
  );
  const positions = useMemo(() => new Float32Array(count * 3), [count]);

  useFrame(({ clock }) => {
    if (!points.current) return;
    const t = clock.getElapsedTime();
    seeds.forEach((s, i) => {
      positions[i * 3] = s.pos.x + Math.sin(t * s.speed + s.phase) * 0.4;
      positions[i * 3 + 1] = s.pos.y + Math.cos(t * s.speed * 0.8 + s.phase) * 0.3;
      positions[i * 3 + 2] = s.pos.z;
    });
    const attr = points.current.geometry.getAttribute("position") as THREE.BufferAttribute;
    attr.needsUpdate = true;
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#5eead4" transparent opacity={0.35} sizeAttenuation />
    </points>
  );
}

/**
 * Small drifting line-frame fragments in Z-space around the device group —
 * a restrained hint of other interface surfaces nearby, not full objects.
 */
export function InterfaceFragments({ phase }: DeviceProps) {
  const configs = useMemo(
    () => [
      { pos: [-3.2, 1.1, -1.8] as [number, number, number], size: [0.5, 0.32] as [number, number], speed: 0.15 },
      { pos: [3.6, -1.4, -2.2] as [number, number, number], size: [0.36, 0.5] as [number, number], speed: 0.11 },
      { pos: [1.6, 1.7, -2.6] as [number, number, number], size: [0.42, 0.26] as [number, number], speed: 0.18 },
    ],
    [],
  );

  return (
    <>
      {configs.map((c, i) => (
        <DriftFragment key={i} config={c} phase={phase} index={i} />
      ))}
    </>
  );
}

function DriftFragment({
  config,
  phase,
  index,
}: {
  config: { pos: [number, number, number]; size: [number, number]; speed: number };
  phase: IntroPhase;
  index: number;
}) {
  const group = useRef<THREE.Group>(null);
  const mat = useRef<THREE.LineBasicMaterial>(null);
  const clock = useRef(index * 1.3);

  useFrame((_, delta) => {
    if (!group.current || !mat.current) return;
    clock.current += delta;
    group.current.position.y = config.pos[1] + Math.sin(clock.current * config.speed) * 0.3;
    group.current.rotation.z = Math.sin(clock.current * config.speed * 0.6) * 0.08;

    const target = phaseTargets[phase].beamOpacity > 0.05 ? 0.28 : 0;
    mat.current.opacity = THREE.MathUtils.lerp(mat.current.opacity, target, 1 - Math.exp(-1.4 * delta));
  });

  return (
    <group ref={group} position={config.pos}>
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(config.size[0], config.size[1])]} />
        <lineBasicMaterial ref={mat} color="#828b9a" transparent opacity={0} />
      </lineSegments>
    </group>
  );
}
