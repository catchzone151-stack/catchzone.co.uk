"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshReflectorMaterial, useTexture } from "@react-three/drei";
import type { MotionValue } from "motion/react";
import * as THREE from "three";
import {
  ANCHOR_KEYS,
  COMPONENTS,
  FLOOR_Y,
  GATE_Z,
  GUIDE_KEYS,
  GUIDE_PATH,
  MAP_SPEC,
  OPENING_ORBIT,
  SCREENS,
  SHIP_ORBIT,
  applyPose,
  clamp01,
  compactFactor,
  ease,
  fragmentsVisibleAt,
  range,
  stageAt,
  stageLocal,
  trackNum,
  trackVec,
  transition,
  type ComponentSpec,
  type Pose,
  type ScreenSpec,
  type Vec3,
} from "@/lib/three/journeyTimeline";
import { createScreenMaterial, createWireTexture } from "@/lib/three/journeyScreens";

type Progress = MotionValue<number>;

const MINT = "#5eead4";

/* ------------------------------------------------------------------ */
/* Shared geometry helpers                                              */
/* ------------------------------------------------------------------ */

/** Device-style slab: large XY corner radius with a small edge bevel. */
function useSlabGeometry(w: number, h: number, depth: number, radius: number, bevel = 0.01) {
  const geometry = useMemo(() => {
    const iw = w - bevel * 2;
    const ih = h - bevel * 2;
    const r = Math.min(radius, iw / 2, ih / 2);
    const shape = new THREE.Shape();
    shape.moveTo(-iw / 2 + r, -ih / 2);
    shape.lineTo(iw / 2 - r, -ih / 2);
    shape.quadraticCurveTo(iw / 2, -ih / 2, iw / 2, -ih / 2 + r);
    shape.lineTo(iw / 2, ih / 2 - r);
    shape.quadraticCurveTo(iw / 2, ih / 2, iw / 2 - r, ih / 2);
    shape.lineTo(-iw / 2 + r, ih / 2);
    shape.quadraticCurveTo(-iw / 2, ih / 2, -iw / 2, ih / 2 - r);
    shape.lineTo(-iw / 2, -ih / 2 + r);
    shape.quadraticCurveTo(-iw / 2, -ih / 2, -iw / 2 + r, -ih / 2);
    const geo = new THREE.ExtrudeGeometry(shape, {
      depth: Math.max(0.001, depth - bevel * 2),
      bevelEnabled: true,
      bevelThickness: bevel,
      bevelSize: bevel,
      bevelSegments: 3,
      curveSegments: 12,
    });
    geo.center();
    return geo;
  }, [w, h, depth, radius, bevel]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return geometry;
}

function useDisposable<T extends { dispose: () => void }>(value: T) {
  useEffect(() => () => value.dispose(), [value]);
  return value;
}

function circlePoints(center: Vec3, radius: number, rotation: Vec3, from: number, to: number, n: number) {
  const m = new THREE.Matrix4().makeRotationFromEuler(new THREE.Euler(...rotation));
  const c = new THREE.Vector3(...center);
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= n; i += 1) {
    const a = from + ((to - from) * i) / n;
    pts.push(new THREE.Vector3(Math.cos(a) * radius, Math.sin(a) * radius, 0).applyMatrix4(m).add(c));
  }
  return pts;
}

function orbitPoint(spec: { center: Vec3; radius: number; rotation: Vec3 }, angle: number, out: THREE.Vector3) {
  out.set(Math.cos(angle) * spec.radius, Math.sin(angle) * spec.radius, 0);
  out.applyEuler(_euler.set(...spec.rotation));
  return out.add(_center.set(...spec.center));
}

const _euler = new THREE.Euler();
const _center = new THREE.Vector3();
const _v1 = new THREE.Vector3();

/**
 * A thin glowing tube revealed progressively along its length. `linear`
 * keeps hard corners (cable runs); otherwise the points are smoothed.
 */
function useTube(points: THREE.Vector3[], radius: number, segments: number, linear = false) {
  return useMemo(() => {
    let curve: THREE.Curve<THREE.Vector3>;
    if (linear) {
      const path = new THREE.CurvePath<THREE.Vector3>();
      for (let i = 0; i < points.length - 1; i += 1) path.add(new THREE.LineCurve3(points[i]!, points[i + 1]!));
      curve = path;
    } else {
      curve = new THREE.CatmullRomCurve3(points, false, "centripetal");
    }
    const geo = new THREE.TubeGeometry(curve, segments, radius, 6, false);
    return { curve, geo, indexCount: geo.index ? geo.index.count : 0 };
  }, [points, radius, segments, linear]);
}

// Tube indices are laid out segment by segment along the path; each
// segment is 6 radial faces × 6 indices.
const TUBE_SEGMENT_INDICES = 36;

/** Reveals the tube between fractions `from` and `to` of its length. */
function setReveal(geo: THREE.BufferGeometry, indexCount: number, to: number, from = 0) {
  const segments = indexCount / TUBE_SEGMENT_INDICES;
  const start = Math.floor(segments * clamp01(from)) * TUBE_SEGMENT_INDICES;
  const end = Math.floor(segments * clamp01(to)) * TUBE_SEGMENT_INDICES;
  geo.setDrawRange(start, Math.max(0, end - start));
}

/* ------------------------------------------------------------------ */
/* Opening orbit, guide line and the node of light                     */
/* ------------------------------------------------------------------ */

export function OpeningOrbit({ progress }: { progress: Progress }) {
  const points = useMemo(
    () =>
      circlePoints(OPENING_ORBIT.center, OPENING_ORBIT.radius, OPENING_ORBIT.rotation, 0.75, Math.PI * 2 + 0.35, 140),
    [],
  );
  const { geo, indexCount } = useTube(points, 0.0105, 220);
  useDisposable(geo);
  const mat = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    const p = progress.get();
    if (!mat.current) return;
    // Draws itself on load; once scrolling starts the arc is reeled in
    // behind the departing node, as if the orbit unwinds into the build line.
    const intro = ease.out(clamp01((clock.elapsedTime - 0.35) / 1.6));
    const reel = ease.inOut(range(p, 0.045, 0.14));
    setReveal(geo, indexCount, intro, reel);
    mat.current.opacity = 0.85 * (1 - range(p, 0.1, 0.15));
    mat.current.visible = reel < 1;
  });

  return (
    <mesh geometry={geo}>
      <meshBasicMaterial ref={mat} color={MINT} transparent opacity={0.85} toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

function useGuideCurve() {
  return useMemo(() => {
    const start = orbitPoint(OPENING_ORBIT, OPENING_ORBIT.departAngle, new THREE.Vector3());
    const pts = GUIDE_PATH.map((p, i) => (i === 0 ? start.clone() : new THREE.Vector3(...p)));
    return pts;
  }, []);
}

export function GuideLine({ progress }: { progress: Progress }) {
  const points = useGuideCurve();
  const { geo, indexCount } = useTube(points, 0.0085, 420);
  useDisposable(geo);
  const mat = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(() => {
    const p = progress.get();
    setReveal(geo, indexCount, trackNum(GUIDE_KEYS, p));
    if (mat.current) mat.current.opacity = 0.62 - 0.22 * range(p, 0.8, 0.9);
  });

  return (
    <mesh geometry={geo}>
      <meshBasicMaterial ref={mat} color={MINT} transparent opacity={0.62} toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

function useGlowTexture() {
  const tex = useMemo(() => {
    const size = 128;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.18, "rgba(255,255,255,0.55)");
    g.addColorStop(0.5, "rgba(255,255,255,0.12)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, []);
  return useDisposable(tex);
}

/**
 * The orbit's node — CatchZone's point of light. It idles on the opening
 * orbit, leads the visitor along the build line, powers the finished
 * product and finally settles into the orbit that wraps it.
 */
export function GuideNode({ progress }: { progress: Progress }) {
  const group = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  const sprite = useRef<THREE.Sprite>(null);
  const glow = useGlowTexture();
  const points = useGuideCurve();
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points, false, "centripetal"), [points]);
  const orbitPos = useRef(new THREE.Vector3());
  const pathPos = useRef(new THREE.Vector3());
  const shipPos = useRef(new THREE.Vector3());

  useFrame(({ clock, size }) => {
    if (!group.current) return;
    const p = progress.get();
    const t = clock.elapsedTime;

    orbitPoint(OPENING_ORBIT, OPENING_ORBIT.departAngle + Math.sin(t * 0.22) * 0.32, orbitPos.current);
    curve.getPointAt(clamp01(trackNum(GUIDE_KEYS, p)), pathPos.current);
    orbitPoint(SHIP_ORBIT, 0.9 + t * 0.16, shipPos.current);
    shipPos.current.x =
      SHIP_ORBIT.center[0] + (shipPos.current.x - SHIP_ORBIT.center[0]) * compactFactor(size.width / size.height);

    const depart = ease.inOut(range(p, 0.055, 0.1));
    const toShip = ease.inOut(range(p, 0.8, 0.87));
    group.current.position.lerpVectors(orbitPos.current, pathPos.current, depart);
    group.current.position.lerp(shipPos.current, toShip);

    const intro = ease.out(clamp01((t - 1.2) / 1.2));
    const pulse = 1 + Math.sin(t * 1.6) * 0.06;
    group.current.scale.setScalar(intro * pulse);
    if (light.current) light.current.intensity = 1.3 * intro;
    if (sprite.current) (sprite.current.material as THREE.SpriteMaterial).opacity = 0.75 * intro;
  });

  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[0.034, 20, 20]} />
        <meshBasicMaterial color="#e9fffb" toneMapped={false} />
      </mesh>
      <sprite ref={sprite} scale={[0.62, 0.62, 0.62]}>
        <spriteMaterial map={glow} color={MINT} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} toneMapped={false} />
      </sprite>
      <pointLight ref={light} color={MINT} intensity={0} distance={4.5} decay={2} />
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Environment: floor and threshold frames                              */
/* ------------------------------------------------------------------ */

export function Floor({ reflective }: { reflective: boolean }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, -14]}>
      <planeGeometry args={[60, 70]} />
      {reflective ? (
        <MeshReflectorMaterial
          resolution={1024}
          blur={[420, 120]}
          mixBlur={1}
          mixStrength={2.2}
          mixContrast={1.05}
          mirror={0.75}
          depthScale={0.9}
          minDepthThreshold={0.35}
          maxDepthThreshold={1.3}
          roughness={0.92}
          metalness={0.55}
          color="#060709"
        />
      ) : (
        <meshStandardMaterial color="#07080a" metalness={0.6} roughness={0.55} />
      )}
    </mesh>
  );
}

function Gate({ z, progress, index }: { z: number; progress: Progress; index: number }) {
  const width = 8.2;
  const height = 4.9;
  const beam = 0.055;
  const beamMat = useMemo(
    () => new THREE.MeshStandardMaterial({ color: "#14161b", metalness: 0.85, roughness: 0.32, transparent: true }),
    [],
  );
  useDisposable(beamMat);
  const lineMat = useRef<THREE.LineBasicMaterial>(null);
  const lineGeo = useMemo(() => {
    const inset = 0.06;
    const w = width / 2 - inset;
    const top = height - inset;
    const pts = [
      new THREE.Vector3(-w, 0.02, 0),
      new THREE.Vector3(-w, top, 0),
      new THREE.Vector3(w, top, 0),
      new THREE.Vector3(w, 0.02, 0),
    ];
    return new THREE.BufferGeometry().setFromPoints(pts);
  }, []);
  useDisposable(lineGeo);

  useFrame(() => {
    const p = progress.get();
    // The space opens up for SHIP: thresholds dissolve.
    const visible = range(p, 0.04, 0.12) * (1 - range(p, 0.73, 0.84));
    beamMat.opacity = visible;
    beamMat.visible = visible > 0.001;
    if (lineMat.current) lineMat.current.opacity = 0.26 * visible * (index === 0 ? 1 : 0.85);
  });

  const beams: { pos: Vec3; size: Vec3 }[] = [
    { pos: [-width / 2, height / 2, 0], size: [beam, height, beam] },
    { pos: [width / 2, height / 2, 0], size: [beam, height, beam] },
    { pos: [0, height, 0], size: [width + beam, beam, beam] },
  ];

  return (
    <group position={[0, FLOOR_Y, z]}>
      {beams.map((b, i) => (
        <mesh key={i} position={b.pos} material={beamMat}>
          <boxGeometry args={b.size} />
        </mesh>
      ))}
      <line>
        <primitive object={lineGeo} attach="geometry" />
        <lineBasicMaterial ref={lineMat} color="#c3cad6" transparent opacity={0.26} depthWrite={false} />
      </line>
    </group>
  );
}

/**
 * Soft pools of overhead light on the studio floor, one per stage, so the
 * floor reads as a surface and each stage has somewhere to stand.
 */
export function FloorLights() {
  const tex = useGlowTexture();
  const pools: { pos: Vec3; size: number; opacity: number }[] = [
    { pos: [0, FLOOR_Y + 0.004, -5.4], size: 9, opacity: 0.3 },
    { pos: [0, FLOOR_Y + 0.004, -16.4], size: 9, opacity: 0.3 },
    { pos: [0, FLOOR_Y + 0.004, -27.8], size: 10, opacity: 0.22 },
  ];
  return (
    <>
      {pools.map((pool) => (
        <mesh key={pool.pos[2]} position={pool.pos} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[pool.size, pool.size * 0.7]} />
          <meshBasicMaterial
            map={tex}
            color="#b9c6d9"
            transparent
            opacity={pool.opacity}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            toneMapped={false}
          />
        </mesh>
      ))}
    </>
  );
}

export function Gates({ progress }: { progress: Progress }) {
  return (
    <>
      {GATE_Z.map((z, i) => (
        <Gate key={z} z={z} index={i} progress={progress} />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Payload                                                              */
/* ------------------------------------------------------------------ */

const BODY_COLOR = "#1a1c21";

function useDeviceMaterial() {
  const mat = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: BODY_COLOR,
        metalness: 0.9,
        roughness: 0.3,
        clearcoat: 0.6,
        clearcoatRoughness: 0.22,
        envMapIntensity: 1.25,
        transparent: true,
        opacity: 0,
      }),
    [],
  );
  return useDisposable(mat);
}

interface DeviceShape {
  w: number;
  h: number;
  depth: number;
  radius: number;
}

function deviceShape(spec: ScreenSpec): DeviceShape {
  const [w, h] = spec.size;
  if (spec.id === "phone") return { w: w + 0.06, h: h + 0.075, depth: 0.07, radius: 0.085 };
  if (spec.id === "tablet") return { w: w + 0.09, h: h + 0.09, depth: 0.055, radius: 0.075 };
  return { w: w + 0.07, h: h + 0.07, depth: 0.05, radius: 0.04 };
}

/**
 * The physical device that forms around a screen during BUILD: the shell
 * slides in from behind as its construction outline fades, and the
 * display gets a stand while the tablet and phone get docks.
 */
function DeviceBody({ spec, progress }: { spec: ScreenSpec; progress: Progress }) {
  const shape = deviceShape(spec);
  const geo = useSlabGeometry(shape.w, shape.h, shape.depth, shape.radius, 0.012);
  const edges = useMemo(() => new THREE.EdgesGeometry(geo, 28), [geo]);
  useDisposable(edges);
  const body = useRef<THREE.Group>(null);
  const stand = useRef<THREE.Group>(null);
  const edgeMat = useRef<THREE.LineBasicMaterial>(null);
  const glassMat = useRef<THREE.MeshStandardMaterial>(null);
  const bodyMat = useDeviceMaterial();
  const standMat = useDeviceMaterial();

  const isDisplay = spec.id === "desktop";
  const neckGeo = useSlabGeometry(0.17, 0.92, 0.045, 0.02, 0.008);
  const footGeo = useSlabGeometry(0.66, 0.38, 0.032, 0.05, 0.008);
  const rearGeo = useSlabGeometry(shape.w * 0.56, shape.h * 0.5, 0.07, 0.08, 0.012);
  const dockGeo = useSlabGeometry(shape.w * 0.62, 0.11, 0.06, 0.02, 0.008);

  const baseZ = -shape.depth / 2 - 0.0015;
  // Distance from the screen centre down to the plinth top in the built pose.
  const toPlinth = spec.poses[3].pos[1] - -1.05;

  useFrame(() => {
    const s = stageAt(progress.get());
    const tb = transition(s, 2, spec.stagger, 0.62);
    const appear = ease.out(clamp01((tb - 0.18) / 0.62));
    const outline = clamp01(tb / 0.3) * (1 - appear);

    if (body.current) body.current.position.z = baseZ - (1 - appear) * 0.5;
    bodyMat.opacity = appear;
    bodyMat.visible = appear > 0.001;
    if (edgeMat.current) edgeMat.current.opacity = outline * 0.75;
    if (glassMat.current) glassMat.current.opacity = 0.32 * appear;

    const standT = ease.out(clamp01((tb - 0.38) / 0.55));
    standMat.opacity = standT;
    standMat.visible = standT > 0.001;
    if (stand.current) stand.current.position.y = -(1 - standT) * 0.35;
  });

  return (
    <>
      <group ref={body} position={[0, 0, baseZ]}>
        <mesh geometry={geo} material={bodyMat} />
        {isDisplay && <mesh geometry={rearGeo} material={bodyMat} position={[0, -0.05, -0.05]} />}
        <lineSegments geometry={edges}>
          <lineBasicMaterial ref={edgeMat} color="#d6dde8" transparent opacity={0} depthWrite={false} />
        </lineSegments>
      </group>

      {/* glass glare: additive reflection of the studio lights */}
      <mesh position={[0, 0, 0.004]} renderOrder={4}>
        <planeGeometry args={spec.size} />
        <meshStandardMaterial
          ref={glassMat}
          color="#000000"
          metalness={1}
          roughness={0.06}
          transparent
          opacity={0}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      <group ref={stand}>
        {isDisplay ? (
          <>
            <mesh geometry={neckGeo} material={standMat} position={[0, -toPlinth + 0.46, -0.11]} />
            <mesh
              geometry={footGeo}
              material={standMat}
              position={[0, -toPlinth + 0.016, -0.12]}
              rotation={[-Math.PI / 2, 0, 0]}
            />
          </>
        ) : (
          <mesh geometry={dockGeo} material={standMat} position={[0, -toPlinth + 0.03, -0.01]} rotation={[-Math.PI / 2, 0, 0]} />
        )}
      </group>
    </>
  );
}

function componentSize(spec: ComponentSpec, parent: ScreenSpec): [number, number] {
  const [x0, y0, x1, y1] = spec.rect;
  return [(x1 - x0) * parent.size[0], (y1 - y0) * parent.size[1]];
}

function UIComponent({
  spec,
  parent,
  ui,
  wire,
  progress,
  index,
}: {
  spec: ComponentSpec;
  parent: ScreenSpec;
  ui: THREE.Texture;
  wire: THREE.Texture;
  progress: Progress;
  index: number;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const size = componentSize(spec, parent);
  const material = useMemo(
    () => createScreenMaterial({ ui, wire, size, radius: 0.012, rect: spec.rect }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ui, wire],
  );
  useDisposable(material);

  const poses = useMemo<[Pose, Pose, Pose, Pose, Pose]>(() => {
    const [x0, y0, x1, y1] = spec.rect;
    const cx = ((x0 + x1) / 2 - 0.5) * parent.size[0];
    const cy = (0.5 - (y0 + y1) / 2) * parent.size[1];
    const seated: Pose = { pos: [cx, cy, 0.006], rot: [0, 0, 0] };
    return [
      {
        pos: [cx + spec.scatter.pos[0], cy + spec.scatter.pos[1], spec.scatter.pos[2]],
        rot: spec.scatter.rot,
      },
      seated,
      { pos: [cx + spec.lift[0], cy + spec.lift[1], spec.lift[2]], rot: [0, 0, 0], scale: 1.04 },
      { pos: [cx, cy, 0.004], rot: [0, 0, 0] },
      { pos: [cx, cy, 0.004], rot: [0, 0, 0] },
    ];
  }, [spec, parent]);

  useFrame(({ clock }) => {
    if (!ref.current) return;
    const p = progress.get();
    const s = stageAt(p);
    const [seg, t] = stageLocal(s, spec.stagger, 0.7);
    applyPose(ref.current, poses[seg]!, poses[seg + 1]!, t);

    const time = clock.elapsedTime;
    const scatter = 1 - transition(s, 0, spec.stagger);
    const hover = transition(s, 1, spec.stagger) * (1 - transition(s, 2, spec.stagger));
    ref.current.position.y += Math.sin(time * 0.55 + index * 1.7) * (0.07 * scatter + 0.018 * hover);
    ref.current.rotation.z += Math.sin(time * 0.4 + index) * 0.04 * scatter;

    const u = material.uniforms;
    u.uOpacity.value = fragmentsVisibleAt(p) * (1 - range(s, 2.8, 2.96));
    u.uWireAmt.value = 1 - range(s, 1.86, 2.0);
    u.uReveal.value = transition(s, 1, parent.stagger * 0.5, 0.78);
    u.uBright.value = 0.84 + 0.16 * transition(s, 2, parent.stagger);
  });

  return (
    <mesh ref={ref} material={material} renderOrder={3}>
      <planeGeometry args={size} />
    </mesh>
  );
}

function ScreenRig({
  spec,
  ui,
  progress,
  index,
}: {
  spec: ScreenSpec;
  ui: THREE.Texture;
  progress: Progress;
  index: number;
}) {
  const group = useRef<THREE.Group>(null);
  const wire = useMemo(() => {
    const w = spec.id === "phone" ? 512 : 1024;
    return createWireTexture(spec.id, w, Math.round(w * (spec.size[1] / spec.size[0])));
  }, [spec]);
  useDisposable(wire);

  const components = useMemo(() => COMPONENTS.filter((c) => c.screen === spec.id), [spec.id]);
  const material = useMemo(
    () =>
      createScreenMaterial({
        ui,
        wire,
        size: spec.size,
        radius: spec.radius,
        holes: components.map((c) => c.rect),
      }),
    [ui, wire, spec, components],
  );
  useDisposable(material);

  useFrame(({ clock, size }) => {
    if (!group.current) return;
    const p = progress.get();
    const s = stageAt(p);
    const [seg, t] = stageLocal(s, spec.stagger);
    applyPose(group.current, spec.poses[seg]!, spec.poses[seg + 1]!, t);
    group.current.position.x *= compactFactor(size.width / size.height);

    const time = clock.elapsedTime;
    const scatter = 1 - transition(s, 0, spec.stagger);
    const hover = transition(s, 1, spec.stagger) * (1 - transition(s, 2, spec.stagger));
    group.current.position.y += Math.sin(time * 0.45 + index * 2.1) * (0.06 * scatter + 0.012 * hover);
    group.current.rotation.z += Math.sin(time * 0.35 + index) * 0.025 * scatter;

    const u = material.uniforms;
    u.uOpacity.value = fragmentsVisibleAt(p);
    u.uWireAmt.value = 1 - range(s, 1.86, 2.0);
    u.uReveal.value = transition(s, 1, spec.stagger * 0.5, 0.78);
    u.uBright.value = 0.84 + 0.16 * transition(s, 2, spec.stagger);
    // Slots stay dimmed while their component is away, and fill again the
    // moment it seats back in during BUILD.
    u.uHoleAmt.value = 1 - range(s, 2.8, 2.96);
  });

  return (
    <group ref={group}>
      <mesh material={material} renderOrder={2}>
        <planeGeometry args={spec.size} />
      </mesh>
      <DeviceBody spec={spec} progress={progress} />
      {components.map((c, i) => (
        <UIComponent key={i} spec={c} parent={spec} ui={ui} wire={wire} progress={progress} index={index * 3 + i} />
      ))}
    </group>
  );
}

function ProductMap({ progress }: { progress: Progress }) {
  const ref = useRef<THREE.Mesh>(null);
  const wire = useMemo(() => createWireTexture("map", 1024, Math.round(1024 * (MAP_SPEC.size[1] / MAP_SPEC.size[0]))), []);
  useDisposable(wire);
  const material = useMemo(
    () => createScreenMaterial({ ui: null, wire, size: MAP_SPEC.size, radius: 0.02 }),
    [wire],
  );
  useDisposable(material);

  useFrame(({ clock, size }) => {
    if (!ref.current) return;
    const p = progress.get();
    const s = stageAt(p);
    const poses = MAP_SPEC.poses;
    if (s < 1) {
      const [, t] = stageLocal(s, MAP_SPEC.stagger);
      applyPose(ref.current, poses[0]!, poses[1]!, t);
    } else {
      applyPose(ref.current, poses[1]!, poses[2]!, transition(s, 1, 0, 0.6));
    }
    ref.current.position.x *= compactFactor(size.width / size.height);
    const scatter = 1 - transition(s, 0, MAP_SPEC.stagger);
    ref.current.position.y += Math.sin(clock.elapsedTime * 0.5 + 4) * 0.06 * scatter;
    material.uniforms.uOpacity.value = fragmentsVisibleAt(p) * (1 - range(s, 1.15, 1.6)) * 0.9;
  });

  return (
    <mesh ref={ref} material={material} renderOrder={1}>
      <planeGeometry args={MAP_SPEC.size} />
    </mesh>
  );
}

/** Display plinth that rises from the floor as the devices are built. */
function Plinth({ progress }: { progress: Progress }) {
  const ref = useRef<THREE.Group>(null);
  const geo = useSlabGeometry(4.5, 2.2, 0.5, 0.18, 0.03);
  const mat = useRef<THREE.MeshPhysicalMaterial>(null);

  useFrame(() => {
    if (!ref.current) return;
    const s = stageAt(progress.get());
    const t = ease.inOut(clamp01((s - 2.0) / 0.45));
    ref.current.position.y = -1.3 - (1 - t) * 0.56;
    if (mat.current) mat.current.opacity = clamp01(t * 1.6);
  });

  return (
    <group ref={ref} position={[0, -1.86, 0.1]}>
      <mesh geometry={geo} rotation={[-Math.PI / 2, 0, 0]}>
        <meshPhysicalMaterial
          ref={mat}
          color="#0c0d10"
          metalness={0.45}
          roughness={0.42}
          clearcoat={0.35}
          clearcoatRoughness={0.4}
          transparent
          opacity={0}
        />
      </mesh>
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* SHIP: connections and the orbit that wraps the product              */
/* ------------------------------------------------------------------ */

/** Anchor-local routes between the built devices. */
const TRACE_Y = -1.044;
const LINKS: { points: Vec3[]; arc: boolean; delay: number }[] = [
  // tablet → display → phone, arcing above the product
  { points: [[-1.62, -0.05, 0.42], [-1.0, 0.95, 0.05], [0.15, 0.97, -0.62]], arc: true, delay: 0.12 },
  { points: [[0.15, 0.97, -0.62], [1.05, 0.8, 0.2], [1.36, 0.11, 0.86]], arc: true, delay: 0.2 },
  // cable runs across the plinth top into a shared bus
  { points: [[-1.62, TRACE_Y, 0.52], [-1.62, TRACE_Y, 0.96], [0, TRACE_Y, 0.96]], arc: false, delay: 0.04 },
  { points: [[1.36, TRACE_Y, 0.94], [1.36, TRACE_Y, 0.96], [0, TRACE_Y, 0.96]], arc: false, delay: 0.06 },
  { points: [[0.14, TRACE_Y, -0.52], [0.14, TRACE_Y, 0.96]], arc: false, delay: 0.08 },
  // the build line arriving from the floor, up the plinth face to the bus
  { points: [[0, -1.555, 1.6], [0, -1.555, 1.226], [0, TRACE_Y, 1.226], [0, TRACE_Y, 0.96]], arc: false, delay: 0 },
];

function Connection({
  points,
  progress,
  delay,
  arc,
}: {
  points: Vec3[];
  progress: Progress;
  delay: number;
  arc: boolean;
}) {
  const pts = useMemo(() => {
    const v = points.map((p) => new THREE.Vector3(...p));
    if (arc) return new THREE.QuadraticBezierCurve3(v[0]!, v[1]!, v[2]!).getPoints(48);
    return v;
  }, [points, arc]);
  const { geo, indexCount, curve } = useTube(pts, arc ? 0.0055 : 0.006, arc ? 96 : 120, !arc);
  useDisposable(geo);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const pulse = useRef<THREE.Mesh>(null);
  const pulseMat = useRef<THREE.MeshBasicMaterial>(null);

  useFrame(({ clock }) => {
    const s = stageAt(progress.get());
    const draw = ease.inOut(clamp01((s - 3.05 - delay) / 0.4));
    setReveal(geo, indexCount, draw);
    if (mat.current) mat.current.opacity = (arc ? 0.4 : 0.55) * Math.min(1, draw * 3);

    const live = clamp01((s - 3.55 - delay * 0.5) / 0.3);
    if (pulse.current && pulseMat.current) {
      const u = (clock.elapsedTime * (arc ? 0.22 : 0.3) + delay * 3) % 1;
      curve.getPointAt(u, _v1);
      pulse.current.position.copy(_v1);
      pulseMat.current.opacity = live * Math.sin(u * Math.PI) * 0.95;
    }
  });

  return (
    <>
      <mesh geometry={geo}>
        <meshBasicMaterial ref={mat} color={MINT} transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
      <mesh ref={pulse}>
        <sphereGeometry args={[0.022, 12, 12]} />
        <meshBasicMaterial ref={pulseMat} color="#e9fffb" transparent opacity={0} toneMapped={false} depthWrite={false} />
      </mesh>
    </>
  );
}

function ShipOrbit({ progress }: { progress: Progress }) {
  const anchor = SHIP_ORBIT;
  const points = useMemo(
    () => circlePoints([0, 0, 0], anchor.radius, anchor.rotation, 0.9, 0.9 + Math.PI * 2 - 0.28, 160),
    [anchor],
  );
  const { geo, indexCount } = useTube(points, 0.011, 260);
  useDisposable(geo);
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  const mesh = useRef<THREE.Mesh>(null);

  useFrame(({ size }) => {
    const s = stageAt(progress.get());
    const draw = ease.inOut(clamp01((s - 3.2) / 0.6));
    setReveal(geo, indexCount, draw);
    if (mat.current) mat.current.opacity = 0.8 * Math.min(1, draw * 2.5);
    if (mesh.current) mesh.current.scale.x = compactFactor(size.width / size.height);
  });

  return (
    <mesh ref={mesh} geometry={geo} position={anchor.center}>
      <meshBasicMaterial ref={mat} color={MINT} transparent opacity={0} toneMapped={false} depthWrite={false} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Payload root                                                         */
/* ------------------------------------------------------------------ */

export function Payload({ progress }: { progress: Progress }) {
  const anchor = useRef<THREE.Group>(null);
  const stage = useRef<THREE.Group>(null);
  const textures = useTexture(SCREENS.map((s) => s.texture));
  const { gl } = useThree();

  useMemo(() => {
    const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = aniso;
      t.needsUpdate = true;
    });
  }, [textures, gl]);

  useFrame(({ size }) => {
    if (!anchor.current) return;
    trackVec(ANCHOR_KEYS, progress.get(), anchor.current.position, ease.inOut);
    if (stage.current) stage.current.scale.x = compactFactor(size.width / size.height);
  });

  return (
    <group ref={anchor}>
      <ProductMap progress={progress} />
      {SCREENS.map((spec, i) => (
        <ScreenRig key={spec.id} spec={spec} ui={textures[i]!} progress={progress} index={i} />
      ))}
      <group ref={stage}>
        <Plinth progress={progress} />
        {LINKS.map((link, i) => (
          <Connection key={i} points={link.points} progress={progress} delay={link.delay} arc={link.arc} />
        ))}
      </group>
    </group>
  );
}

export function ShipLayer({ progress }: { progress: Progress }) {
  return <ShipOrbit progress={progress} />;
}

