"use client";

import { Suspense, memo, useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, Mask, useMask, useTexture } from "@react-three/drei";
import type { MotionValue } from "motion/react";
import * as THREE from "three";
import { ISLAMQUEST_SCREENS } from "@/data/islamquestShowcase";
import { trackNum, trackVec } from "@/lib/three/journeyTimeline";
import {
  EDGE_LIGHT,
  GHOST_DEVICE,
  GLASS_Z,
  PHONE,
  PLANES,
  SCREEN_H,
  SCREEN_W,
  VIEW_OFFSET,
  type PlaneSpec,
} from "@/lib/three/iqTrailerTimeline";

type Progress = MotionValue<number>;

const MINT = "#5eead4";
const MASK_ID = 1;

/* ------------------------------------------------------------------ */
/* Geometry helpers                                                     */
/* ------------------------------------------------------------------ */

function roundedRectShape(w: number, h: number, r: number) {
  const s = new THREE.Shape();
  s.moveTo(-w / 2 + r, -h / 2);
  s.lineTo(w / 2 - r, -h / 2);
  s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  s.lineTo(w / 2, h / 2 - r);
  s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  s.lineTo(-w / 2 + r, h / 2);
  s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  s.lineTo(-w / 2, -h / 2 + r);
  s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  return s;
}

function roundedRectPath(w: number, h: number, r: number, n = 24) {
  const pts: THREE.Vector3[] = [];
  const corners: [number, number, number][] = [
    [w / 2 - r, h / 2 - r, 0],
    [-w / 2 + r, h / 2 - r, Math.PI / 2],
    [-w / 2 + r, -h / 2 + r, Math.PI],
    [w / 2 - r, -h / 2 + r, (3 * Math.PI) / 2],
  ];
  for (const [cx, cy, a0] of corners) {
    for (let i = 0; i <= n; i += 1) {
      const a = a0 + (i / n) * (Math.PI / 2);
      pts.push(new THREE.Vector3(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0));
    }
  }
  return pts;
}

function useDisposable<T extends { dispose: () => void }>(value: T) {
  useEffect(() => () => value.dispose(), [value]);
  return value;
}

/** Device outline (screen + bezel). */
const BODY_W = SCREEN_W + 0.1;
const BODY_H = SCREEN_H + 0.11;
const BODY_R = 0.15;
const SCREEN_R = 0.1;
const BODY_DEPTH = 0.09;

/* ------------------------------------------------------------------ */
/* Shared per-frame phone transform                                     */
/* ------------------------------------------------------------------ */

const _pos = new THREE.Vector3();
const _rot = new THREE.Vector3();
const _euler = new THREE.Euler();
const _quat = new THREE.Quaternion();
const _scale = new THREE.Vector3();

function phoneMatrixAt(p: number, out: THREE.Matrix4) {
  trackVec(PHONE.pos, p, _pos);
  trackVec(PHONE.rot, p, _rot);
  _quat.setFromEuler(_euler.set(_rot.x, _rot.y, _rot.z));
  return out.compose(_pos, _quat, _scale.set(1, 1, 1));
}

const _lp = new THREE.Vector3();
const _local = new THREE.Matrix4();
const _world = new THREE.Matrix4();
const _phone = new THREE.Matrix4();
const _a = { p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3() };
const _b = { p: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3() };

/** Resolves a plane's world matrix at progress p (local ↔ world blend). */
function planeMatrixAt(spec: PlaneSpec, p: number, out: THREE.Matrix4) {
  const scale = spec.scale ? trackNum(spec.scale, p) : 1;
  const w = spec.worldness ? trackNum(spec.worldness, p) : 0;

  phoneMatrixAt(p, _phone);
  const lp = spec.local ? trackVec(spec.local.pos, p, _lp) : _lp.set(0, 0, GLASS_Z + 0.001);
  const lr = spec.local?.rot ? trackVec(spec.local.rot, p, _rot) : _rot.set(0, 0, 0);
  _quat.setFromEuler(_euler.set(lr.x, lr.y, lr.z));
  _local.compose(lp, _quat, _scale.set(scale, scale, scale));
  _local.premultiply(_phone);

  if (!spec.world || w <= 0) return out.copy(_local);

  trackVec(spec.world.pos, p, _pos);
  const wr = spec.world.rot ? trackVec(spec.world.rot, p, _rot) : _rot.set(0, 0, 0);
  _quat.setFromEuler(_euler.set(wr.x, wr.y, wr.z));
  _world.compose(_pos, _quat, _scale.set(scale, scale, scale));
  if (w >= 1) return out.copy(_world);

  _local.decompose(_a.p, _a.q, _a.s);
  _world.decompose(_b.p, _b.q, _b.s);
  _a.p.lerp(_b.p, w);
  _a.q.slerp(_b.q, w);
  _a.s.lerp(_b.s, w);
  return out.compose(_a.p, _a.q, _a.s);
}

/* ------------------------------------------------------------------ */
/* Device                                                               */
/* ------------------------------------------------------------------ */

function useRoundedAlpha() {
  const tex = useMemo(() => {
    const w = 256;
    const h = Math.round(w * SCREEN_H);
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = "#fff";
    const r = (SCREEN_R / SCREEN_W) * w;
    ctx.beginPath();
    ctx.roundRect(0, 0, w, h, r);
    ctx.fill();
    return new THREE.CanvasTexture(c);
  }, []);
  return useDisposable(tex);
}

/**
 * The phone itself: a dark graphite frame whose screen opening is a
 * stencil window, a glass sheen, and a thin mint light travelling the rim.
 */
function Phone({ progress }: { progress: Progress }) {
  const group = useRef<THREE.Group>(null);
  const bodyMat = useRef<THREE.MeshPhysicalMaterial>(null);
  const glassMat = useRef<THREE.MeshStandardMaterial>(null);

  const frameGeo = useMemo(() => {
    const outer = roundedRectShape(BODY_W, BODY_H, BODY_R);
    outer.holes.push(roundedRectShape(SCREEN_W, SCREEN_H, SCREEN_R));
    const g = new THREE.ExtrudeGeometry(outer, {
      depth: BODY_DEPTH - 0.024,
      bevelEnabled: true,
      bevelThickness: 0.012,
      bevelSize: 0.012,
      bevelSegments: 4,
      curveSegments: 24,
    });
    g.translate(0, 0, GLASS_Z - (BODY_DEPTH - 0.012));
    return g;
  }, []);
  useDisposable(frameGeo);
  const screenShape = useMemo(() => new THREE.ShapeGeometry(roundedRectShape(SCREEN_W, SCREEN_H, SCREEN_R), 24), []);
  useDisposable(screenShape);

  useFrame(() => {
    const p = progress.get();
    if (!group.current) return;
    phoneMatrixAt(p, group.current.matrix);
    const body = trackNum(PHONE.body, p);
    if (bodyMat.current) {
      bodyMat.current.opacity = body;
      bodyMat.current.depthWrite = body > 0.95;
    }
    if (glassMat.current) glassMat.current.opacity = 0.22 * body;
  });

  return (
    <group ref={group} matrixAutoUpdate={false}>
      <mesh geometry={frameGeo} renderOrder={5}>
        <meshPhysicalMaterial
          ref={bodyMat}
          color="#15171b"
          metalness={0.88}
          roughness={0.26}
          clearcoat={0.7}
          clearcoatRoughness={0.18}
          envMapIntensity={1.3}
          transparent
        />
      </mesh>
      {/* side keys */}
      {[
        [-BODY_W / 2 - 0.006, 0.5, 0.12],
        [-BODY_W / 2 - 0.006, 0.22, 0.2],
        [BODY_W / 2 + 0.006, 0.36, 0.26],
      ].map(([x, y, h], i) => (
        <mesh key={i} position={[x!, y!, GLASS_Z - 0.045]}>
          <boxGeometry args={[0.012, h!, 0.035]} />
          <meshStandardMaterial color="#1b1d22" metalness={0.9} roughness={0.3} />
        </mesh>
      ))}
      {/* the screen opening writes the stencil: masked planes only show through it */}
      <Mask id={MASK_ID} geometry={screenShape} position={[0, 0, GLASS_Z]} />
      <mesh geometry={screenShape} position={[0, 0, GLASS_Z + 0.004]} renderOrder={20}>
        <meshStandardMaterial
          ref={glassMat}
          color="#000000"
          metalness={1}
          roughness={0.05}
          transparent
          opacity={0.22}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <EdgeLight progress={progress} />
    </group>
  );
}

const edgeVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const edgeFragment = /* glsl */ `
  uniform float uHead;
  uniform float uIntensity;
  uniform vec3 uColor;
  varying vec2 vUv;
  float pulse(float x, float head, float width) {
    float d = abs(fract(x - head + 0.5) - 0.5);
    return exp(-pow(d / width, 2.0));
  }
  void main() {
    float a = pulse(vUv.x, uHead, 0.07) + 0.6 * pulse(vUv.x, uHead + 0.5, 0.05);
    a = a * uIntensity + 0.06 * uIntensity;
    if (a < 0.004) discard;
    gl_FragColor = vec4(uColor, min(a, 1.0));
    #include <colorspace_fragment>
  }
`;

/** A thin mint light running along the rim — never a ring or halo. */
function EdgeLight({ progress }: { progress: Progress }) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(roundedRectPath(BODY_W - 0.004, BODY_H - 0.004, BODY_R - 0.002), true, "catmullrom", 0);
    return new THREE.TubeGeometry(curve, 360, 0.0045, 6, true);
  }, []);
  useDisposable(geo);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { uHead: { value: 0 }, uIntensity: { value: 0 }, uColor: { value: new THREE.Color(MINT) } },
        vertexShader: edgeVertex,
        fragmentShader: edgeFragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false,
      }),
    [],
  );
  useDisposable(material);

  useFrame(({ clock }) => {
    const p = progress.get();
    material.uniforms.uHead!.value = clock.elapsedTime * 0.09 + p * 1.6;
    material.uniforms.uIntensity!.value = trackNum(EDGE_LIGHT, p);
  });

  return <mesh geometry={geo} material={material} position={[0, 0, GLASS_Z + 0.002]} renderOrder={21} />;
}

/** Brief ghosted silhouette trailing the phone on its fastest moves. */
function GhostDevice({ progress }: { progress: Progress }) {
  const ref = useRef<THREE.LineLoop>(null);
  const geo = useMemo(() => new THREE.BufferGeometry().setFromPoints(roundedRectPath(BODY_W, BODY_H, BODY_R, 12)), []);
  useDisposable(geo);
  const mat = useMemo(() => new THREE.LineBasicMaterial({ color: MINT, transparent: true, opacity: 0, depthWrite: false }), []);
  useDisposable(mat);

  useFrame(() => {
    const p = progress.get();
    const o = trackNum(GHOST_DEVICE, p);
    mat.opacity = o;
    if (!ref.current) return;
    ref.current.visible = o > 0.005;
    phoneMatrixAt(Math.max(0, p - 0.035), ref.current.matrix);
  });

  return <lineLoop ref={ref} geometry={geo} material={mat} matrixAutoUpdate={false} />;
}

/* ------------------------------------------------------------------ */
/* Screen planes                                                        */
/* ------------------------------------------------------------------ */

function ScreenPlane({
  spec,
  texture,
  alpha,
  progress,
}: {
  spec: PlaneSpec;
  texture: THREE.Texture;
  alpha: THREE.Texture;
  progress: Progress;
}) {
  const masked = useRef<THREE.Mesh>(null);
  const free = useRef<THREE.Mesh>(null);
  const echoes = useRef<(THREE.Mesh | null)[]>([]);
  const stencil = useMask(MASK_ID);

  const { geo, map } = useMemo(() => {
    if (!spec.band) return { geo: new THREE.PlaneGeometry(SCREEN_W, SCREEN_H), map: texture };
    const [v0, v1] = spec.band;
    const g = new THREE.PlaneGeometry(SCREEN_W, SCREEN_H * (v1 - v0));
    g.translate(0, (0.5 - (v0 + v1) / 2) * SCREEN_H, 0);
    const t = texture.clone();
    t.repeat.set(1, v1 - v0);
    t.offset.set(0, 1 - v1);
    t.needsUpdate = true;
    return { geo: g, map: t };
  }, [spec.band, texture]);
  useDisposable(geo);

  const m = useRef(new THREE.Matrix4());
  const prev = useRef(new THREE.Matrix4());
  const pa = useRef(new THREE.Vector3());
  const pb = useRef(new THREE.Vector3());

  useFrame(() => {
    const p = progress.get();
    const opacity = trackNum(spec.opacity, p);
    const freeAmt = spec.free ? trackNum(spec.free, p) : 0;
    planeMatrixAt(spec, p, m.current);

    if (masked.current) {
      masked.current.visible = opacity > 0.003 && freeAmt < 0.999;
      masked.current.matrix.copy(m.current);
      (masked.current.material as THREE.MeshBasicMaterial).opacity = opacity;
    }
    if (free.current) {
      free.current.visible = opacity * freeAmt > 0.003;
      free.current.matrix.copy(m.current);
      (free.current.material as THREE.MeshBasicMaterial).opacity = opacity * freeAmt;
    }

    if (spec.echo) {
      // refracted edge echoes: trail the plane in proportion to its speed
      pa.current.setFromMatrixPosition(m.current);
      echoes.current.forEach((mesh, i) => {
        if (!mesh) return;
        const lag = 0.012 * (i + 1);
        planeMatrixAt(spec, Math.max(0, p - lag), prev.current);
        pb.current.setFromMatrixPosition(prev.current);
        const speed = Math.min(1, pa.current.distanceTo(pb.current) / (0.9 * (i + 1)));
        const o = opacity * freeAmt * speed * (i === 0 ? 0.24 : 0.1);
        mesh.visible = o > 0.004;
        mesh.matrix.copy(prev.current);
        (mesh.material as THREE.MeshBasicMaterial).opacity = o;
      });
    }
  });

  return (
    <>
      <mesh ref={masked} geometry={geo} matrixAutoUpdate={false} renderOrder={10}>
        <meshBasicMaterial map={map} alphaMap={spec.band ? null : alpha} transparent toneMapped={false} depthWrite={false} {...stencil} />
      </mesh>
      {spec.free && (
        <mesh ref={free} geometry={geo} matrixAutoUpdate={false} renderOrder={12}>
          <meshBasicMaterial map={map} alphaMap={alpha} transparent toneMapped={false} depthWrite={false} />
        </mesh>
      )}
      {spec.echo &&
        [0, 1].map((i) => (
          <mesh
            key={i}
            ref={(el) => {
              echoes.current[i] = el;
            }}
            geometry={geo}
            matrixAutoUpdate={false}
            renderOrder={11}
          >
            <meshBasicMaterial
              map={map}
              alphaMap={alpha}
              color={MINT}
              transparent
              toneMapped={false}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              opacity={0}
            />
          </mesh>
        ))}
    </>
  );
}

function Screens({ progress }: { progress: Progress }) {
  const textures = useTexture(ISLAMQUEST_SCREENS.map((s) => s.src));
  const alpha = useRoundedAlpha();
  const { gl } = useThree();

  useMemo(() => {
    const aniso = Math.min(8, gl.capabilities.getMaxAnisotropy());
    textures.forEach((t) => {
      t.colorSpace = THREE.SRGBColorSpace;
      t.anisotropy = aniso;
      t.needsUpdate = true;
    });
  }, [textures, gl]);

  return (
    <>
      {PLANES.map((spec) => (
        <ScreenPlane key={spec.key} spec={spec} texture={textures[spec.screen]!} alpha={alpha} progress={progress} />
      ))}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Camera + canvas                                                      */
/* ------------------------------------------------------------------ */

function CameraRig({ progress }: { progress: Progress }) {
  const { camera, size } = useThree();
  useFrame(() => {
    const p = progress.get();
    const aspect = size.width / size.height;
    const pullBack = aspect < 1 ? 1 + (1 - aspect) * 0.95 : 1;
    camera.position.set(0, 0, 6.5 * pullBack);
    camera.lookAt(0, 0, 0);
    const persp = camera as THREE.PerspectiveCamera;
    const offset = aspect >= 1.15 ? trackNum(VIEW_OFFSET, p) : 0;
    persp.setViewOffset(size.width, size.height, -offset * size.width, 0, size.width, size.height);
  });
  return null;
}

const Studio = memo(function Studio() {
  return (
    <Environment resolution={256} frames={1} environmentIntensity={0.9}>
      <Lightformer form="rect" intensity={2.2} color="#ffffff" position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[8, 3, 1]} />
      <Lightformer form="rect" intensity={1.4} color="#dfe6f2" position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[6, 1, 1]} />
      <Lightformer form="rect" intensity={1.1} color="#dfe6f2" position={[5, -0.5, 1]} rotation-y={-Math.PI / 2} scale={[6, 0.8, 1]} />
      <Lightformer form="rect" intensity={0.5} color="#5eead4" position={[3, -2, 4]} rotation-y={-Math.PI / 4} scale={[4, 0.3, 1]} />
    </Environment>
  );
});

export default function IslamQuestTrailerCanvas({ progress, active }: { progress: Progress; active: boolean }) {
  return (
    <Canvas
      camera={{ fov: 30, near: 0.1, far: 60, position: [0, 0, 6] }}
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: true, stencil: true, powerPreference: "high-performance" }}
      frameloop={active ? "always" : "never"}
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
      onCreated={({ gl }) => {
        gl.domElement.addEventListener("webglcontextlost", (e) => e.preventDefault());
      }}
    >
      <ambientLight intensity={0.25} />
      <directionalLight position={[3, 4, 5]} intensity={0.8} color="#e6ebf0" />
      <Studio />
      <CameraRig progress={progress} />
      <Phone progress={progress} />
      <GhostDevice progress={progress} />
      <Suspense fallback={null}>
        <Screens progress={progress} />
      </Suspense>
    </Canvas>
  );
}
