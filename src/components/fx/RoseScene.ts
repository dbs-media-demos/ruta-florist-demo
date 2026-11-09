import {
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  ConeGeometry,
  DirectionalLight,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  HemisphereLight,
  MathUtils,
  Mesh,
  MeshDepthMaterial,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  PCFShadowMap,
  PerspectiveCamera,
  PMREMGenerator,
  Quaternion,
  Scene,
  Sphere,
  SphereGeometry,
  SRGBColorSpace,
  TubeGeometry,
  Vector3,
  WebGLRenderer,
  type Material,
  type WebGLProgramParametersWithUniforms,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { ROSE_REST, ROSE_STILL_OPEN } from "./rose-frame";

/**
 * The hero rose: a coral garden rose built from primitives. Every petal is the same grid; the GPU
 * bends it (spine arc, cupped cross-section, rolled-back edges, a little ruffle) from one `uOpen`
 * value, so the bloom opens with the scroll at no CPU cost, and the shadow pass bends it the same
 * way so the petals shade each other for real. Renders on demand; stops when nothing moves.
 *
 * Desktop only: the hero imports this file inside the 3D gate and nowhere else.
 */

export type RoseStill = "desktop" | "phone";

export type RoseHandle = {
  /** Hero scroll progress, 0 (top) to 1 (dived into the rose). `jump` skips the easing (a page restored mid-hero). */
  setProgress: (p: number, jump?: boolean) => void;
  /** Pointer in -1..1 from the viewport centre. */
  setPointer: (x: number, y: number) => void;
  setVisible: (v: boolean) => void;
  snapshot: () => string;
  dispose: () => void;
};

const INTRO_OPEN = 0.42;
const FOV = 22;

// GLSL shared by the colour and the shadow pass: bends one petal grid vertex from uOpen.
const PETAL_GLSL = /* glsl */ `
uniform float uOpen;
uniform float uTime;
uniform float uSway;
uniform vec3 uKeyDirV;
attribute vec2 aST;
attribute vec4 aPetal; // azimuth, length, width, k (0 = innermost .. 1 = outermost)
attribute vec4 aBase;  // base radius, base height, seed a, seed b
varying vec2 vST;
varying float vK;
varying float vO;
varying float vSeed;

float petalOpen(float k) {
#ifdef SEPAL
  return smoothstep(0.0, 0.75, uOpen);
#else
  float start = (1.0 - k) * 0.42;
  return smoothstep(start, start + 0.58, uOpen);
#endif
}

vec3 petalPos(vec2 st) {
  float s = st.x;
  float t = st.y;
  float az = aPetal.x;
  float L = aPetal.y;
  float W = aPetal.z;
  float k = aPetal.w;
  float sa = aBase.z;
  float sb = aBase.w;
  float o = petalOpen(k);

#ifdef SEPAL
  float tt = t;
  float hw = W * pow(max(1.0 - t, 0.0), 0.9) * smoothstep(-0.1, 0.18, t);
  float th0 = mix(0.2, 1.75, o) + 0.12 * sa;
  float cv = mix(-0.35, 1.25, o);
  float cupK = 0.25;
  float rollK = 0.0;
  float tipK = 0.0;
#else
  float tt = t * (1.0 - 0.13 * s * s);
  float hw = W * (0.14 + 0.86 * pow(sin(3.14159 * clamp(0.05 + 0.66 * tt, 0.0, 1.0)), 0.72));
  float th0 = mix(mix(0.02, 0.2, k), mix(0.06, 0.95, pow(k, 1.4)) + 0.06 * sa * o, o);
  float cv = mix(mix(-0.9, -0.45, k), mix(-0.55, 0.45, k), o);
  float cupK = mix(0.015, mix(0.12, 0.28, k), o * o);
  float rollK = o * (0.08 + 0.3 * k);
  float tipK = o * mix(0.04, 0.16, k);
#endif

  // meridian: a circular arc that leaves the base at th0 from vertical and bends by cv over its length
  float ang = th0 + cv * tt;
  vec2 P = abs(cv) < 1e-3 ? L * tt * vec2(sin(th0), cos(th0)) : L * vec2(cos(th0) - cos(ang), sin(ang) - sin(th0)) / cv;

  // a little cup of its own, the edges rolling back, the lip turning out, a ruffle
  float depth = cupK * hw * s * s;
  depth -= rollK * hw * pow(abs(s), 3.0) * smoothstep(0.55, 1.0, tt);
  float lip = smoothstep(0.62, 1.0, tt);
  depth -= tipK * L * lip * lip;
  depth += L * 0.014 * sin(s * 6.0 + sb * 6.283) * tt * tt * (0.4 + o);
  vec2 nIn = vec2(-cos(ang), sin(ang));
  vec2 ry = P + nIn * depth;
  float r = aBase.x + ry.x + k * 0.05 * (1.0 - 0.5 * o); // each whorl sits a little outside the last
  r = 0.5 * (r + sqrt(r * r + 0.0005)); // never through the axis
  float y = aBase.y + ry.y;

  // cross-section: an arc around the flower's axis, so the layers nest instead of crossing
  float rc = max(aBase.x + P.x, 0.045);
  float span = min(hw / rc, 1.65);
  float a2 = az + s * span + uSway * 0.02 * sin(uTime * 1.1 + sa * 6.0) * tt * k;
  return vec3(cos(a2) * r, y, sin(a2) * r);
}
`;

const VERTEX_BEND = /* glsl */ `
  vec3 pBent = petalPos(aST);
  vec3 objectNormal = normalize(cross(petalPos(aST + vec2(0.02, 0.0)) - pBent, petalPos(aST + vec2(0.0, 0.02)) - pBent));
  vST = aST;
  vK = aPetal.w;
  vO = petalOpen(aPetal.w);
  vSeed = aBase.z;
`;

const FRAG_HEAD = /* glsl */ `
uniform vec3 uDeep;
uniform vec3 uMid;
uniform vec3 uEdge;
uniform vec3 uPale;
uniform vec3 uKeyDirV;
uniform vec3 uKeyCol;
uniform vec3 uGlow;
varying vec2 vST;
varying float vK;
varying float vO;
varying float vSeed;
`;

const FRAG_COLOUR = /* glsl */ `
  float t_ = vST.y;
  float s_ = vST.x;
#ifdef SEPAL
  vec3 col = mix(uDeep, uMid, smoothstep(0.0, 0.8, t_));
  col *= 1.0 - 0.18 * (1.0 - abs(s_));
#else
  vec3 col = mix(uDeep, uMid, smoothstep(0.0, 0.5, t_));
  col = mix(col, mix(uEdge, uPale, vK * vK * 0.8), 0.85 * smoothstep(0.45, 1.05, t_ + 0.15 * abs(s_)));
  col *= 1.0 + 0.05 * vSeed;
  // the deeper into the bloom, the less light reaches: petal bases and the inner whorls
  float ao = mix(0.28, 1.0, smoothstep(0.0, 1.0, t_ * 0.8 + vK * 0.45 - 0.05));
  ao *= mix(0.55 + 0.45 * vO, 1.0, smoothstep(0.2, 1.0, vK));
  col *= ao;
  if (!gl_FrontFacing) col = mix(col, uPale * ao, 0.16);
#endif
  vec4 diffuseColor = vec4(col, opacity);
`;

const FRAG_TRANSLUCENT = /* glsl */ `
#ifndef SEPAL
  {
    // thin petals let the key light through, and their rims catch it
    float back = max(0.0, -dot(normal, uKeyDirV));
    float fres = pow(1.0 - abs(dot(normal, geometryViewDir)), 2.2);
    float thin = smoothstep(0.15, 0.9, vST.y);
    outgoingLight += diffuseColor.rgb * uKeyCol * back * 0.22 * thin;
    outgoingLight += uGlow * fres * 0.12 * thin;
  }
#endif
  #include <opaque_fragment>
`;

type Uniforms = Record<string, { value: unknown }>;

function bendMaterial(kind: "petal" | "sepal", shared: Uniforms, colours: Uniforms) {
  const m = new MeshPhysicalMaterial(
    kind === "petal"
      ? { side: DoubleSide, roughness: 0.6, sheen: 0.25, sheenRoughness: 0.5, sheenColor: new Color("#ffc4ad"), specularIntensity: 0.3, envMapIntensity: 0.55 }
      : { side: DoubleSide, roughness: 0.5, clearcoat: 0.35, clearcoatRoughness: 0.45, envMapIntensity: 0.6 },
  );
  if (kind === "sepal") m.defines = { SEPAL: "" };
  m.onBeforeCompile = (sh: WebGLProgramParametersWithUniforms) => {
    Object.assign(sh.uniforms, shared, colours);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", `#include <common>\n${PETAL_GLSL}`)
      .replace("#include <beginnormal_vertex>", VERTEX_BEND)
      .replace("#include <begin_vertex>", "vec3 transformed = pBent;")
      // thin two-sided petals: offset the shadow lookup toward the light (not along the normal), so
      // both faces escape their own acne and the offset never flips between neighbouring vertices
      .replace("#include <shadowmap_vertex>", "transformedNormal = uKeyDirV;\n#include <shadowmap_vertex>");
    sh.fragmentShader = sh.fragmentShader
      .replace("#include <common>", `#include <common>\n${FRAG_HEAD}`)
      .replace("vec4 diffuseColor = vec4( diffuse, opacity );", FRAG_COLOUR)
      .replace("#include <opaque_fragment>", FRAG_TRANSLUCENT);
  };
  m.customProgramCacheKey = () => `rose-${kind}`;
  return m;
}

function bendDepth(kind: "petal" | "sepal", shared: Uniforms) {
  const m = new MeshDepthMaterial();
  if (kind === "sepal") m.defines = { SEPAL: "" };
  m.onBeforeCompile = (sh: WebGLProgramParametersWithUniforms) => {
    Object.assign(sh.uniforms, shared);
    sh.vertexShader = sh.vertexShader
      .replace("#include <common>", `#include <common>\n${PETAL_GLSL}`)
      .replace("#include <begin_vertex>", "vec3 pBent = petalPos(aST);\nvec3 transformed = pBent;");
  };
  m.customProgramCacheKey = () => `rose-depth-${kind}`;
  return m;
}

/** Deterministic randomness, so the still and the live rose are the same flower. */
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

type PetalSpec = { az: number; L: number; W: number; k: number; r0: number; y0: number; sa: number; sb: number };

/** One merged geometry of petal grids; positions are only placeholders (the shader bends them). */
function petalGeometry(specs: PetalSpec[], nx: number, ny: number, radius: number) {
  const per = (nx + 1) * (ny + 1);
  const pos = new Float32Array(per * specs.length * 3);
  const st = new Float32Array(per * specs.length * 2);
  const petal = new Float32Array(per * specs.length * 4);
  const base = new Float32Array(per * specs.length * 4);
  const index: number[] = [];
  specs.forEach((p, n) => {
    const o = n * per;
    for (let j = 0; j <= ny; j++) {
      for (let i = 0; i <= nx; i++) {
        const v = o + j * (nx + 1) + i;
        st.set([-1 + (2 * i) / nx, j / ny], v * 2);
        petal.set([p.az, p.L, p.W, p.k], v * 4);
        base.set([p.r0, p.y0, p.sa, p.sb], v * 4);
        pos.set([0, j / ny, 0], v * 3);
      }
    }
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const a = o + j * (nx + 1) + i;
        const b = a + 1;
        const d = a + nx + 1;
        const c = d + 1;
        index.push(a, b, c, a, c, d);
      }
    }
  });
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("aST", new Float32BufferAttribute(st, 2));
  g.setAttribute("aPetal", new Float32BufferAttribute(petal, 4));
  g.setAttribute("aBase", new Float32BufferAttribute(base, 4));
  g.setIndex(index);
  g.boundingSphere = new Sphere(new Vector3(0, 0.3, 0), radius);
  return g;
}

/** A serrated rose leaflet folded along its midrib. */
function leaflet(len: number, wid: number) {
  const nx = 10;
  const ny = 18;
  const pos: number[] = [];
  const col: number[] = [];
  const index: number[] = [];
  for (let j = 0; j <= ny; j++) {
    const t = j / ny;
    const serr = 1 + 0.07 * ((t * 11) % 1);
    const hw = wid * Math.pow(Math.sin(Math.PI * Math.pow(t, 0.82)), 0.8) * serr;
    for (let i = 0; i <= nx; i++) {
      const s = -1 + (2 * i) / nx;
      const x = s * hw;
      const y = t * len;
      const z = Math.abs(x) * 0.42 - Math.pow(t - 0.45, 2) * len * 0.16 + 0.004 * Math.sin(s * 9 + t * 7);
      pos.push(x, y, z);
      const c = 0.78 + 0.22 * Math.min(1, Math.abs(s) * 3);
      col.push(c, c, c);
    }
  }
  for (let j = 0; j < ny; j++) {
    for (let i = 0; i < nx; i++) {
      const a = j * (nx + 1) + i;
      index.push(a, a + 1, a + nx + 2, a, a + nx + 2, a + nx + 1);
    }
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new Float32BufferAttribute(col, 3));
  g.setIndex(index);
  g.computeVertexNormals();
  return g;
}

export function createRoseScene(canvas: HTMLCanvasElement, opts: { still?: RoseStill; open?: number } = {}): RoseHandle {
  const still = opts.still;
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance", preserveDrawingBuffer: !!still });
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  const envTex = pmrem.fromScene(room, 0.04).texture;
  scene.environment = envTex;
  scene.environmentIntensity = 0.2;

  const camera = new PerspectiveCamera(FOV, 1, 0.1, 80);

  // light: a warm window key from the upper left, a soft rim from behind, green bounce from below
  const key = new DirectionalLight("#fff0de", 3.0);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.radius = 5;
  key.shadow.bias = -0.0015;
  key.shadow.normalBias = 0.045;
  Object.assign(key.shadow.camera, { left: -1.7, right: 1.7, top: 1.9, bottom: -2.8, near: 1, far: 16 });
  scene.add(key, key.target);
  const rim = new DirectionalLight("#ffd9c4", 1.8);
  rim.position.set(2.6, 2.2, -4.5);
  scene.add(rim);
  scene.add(new HemisphereLight("#fff1e6", "#1f3d2c", 0.16));

  // ---- the rose ----
  const shared: Uniforms = { uOpen: { value: ROSE_STILL_OPEN }, uTime: { value: 0 }, uSway: { value: 0 } };
  const lin = (hex: string) => new Color(hex);
  const petalCols: Uniforms = {
    uDeep: { value: lin("#8a2214") },
    uMid: { value: lin("#d8533a") },
    uEdge: { value: lin("#ef8c72") },
    uPale: { value: lin("#f5b9a2") },
    uKeyDirV: { value: new Vector3() },
    uKeyCol: { value: lin("#ffb08f") },
    uGlow: { value: lin("#ffd2bd") },
  };
  const sepalCols: Uniforms = { ...petalCols, uDeep: { value: lin("#24402c") }, uMid: { value: lin("#4d7148") } };

  const rand = rng(19);
  const GOLDEN = Math.PI * (3 - Math.sqrt(5));
  const N = 38;
  const specs: PetalSpec[] = Array.from({ length: N }, (_, i) => {
    const k = i / (N - 1);
    const L = (0.36 + 0.66 * Math.pow(k, 0.8)) * (0.95 + rand() * 0.1);
    return { az: i * GOLDEN + (rand() - 0.5) * 0.3, L, W: L * (0.62 + 0.3 * k), k, r0: 0.012 + 0.11 * k, y0: -0.13 * Math.pow(k, 1.2), sa: rand() - 0.5, sb: rand() };
  });
  const head = new Group();
  const petals = new Mesh(petalGeometry(specs, 28, 44, 1.8), bendMaterial("petal", shared, petalCols));
  petals.customDepthMaterial = bendDepth("petal", shared);
  petals.castShadow = petals.receiveShadow = true;
  petals.frustumCulled = false;
  head.add(petals);

  const sepalSpecs: PetalSpec[] = Array.from({ length: 5 }, (_, i) => ({ az: (i / 5) * Math.PI * 2 + 0.3, L: 0.62, W: 0.1, k: 1, r0: 0.07, y0: -0.12, sa: rand() - 0.5, sb: rand() }));
  const sepals = new Mesh(petalGeometry(sepalSpecs, 6, 16, 1), bendMaterial("sepal", shared, sepalCols));
  sepals.customDepthMaterial = bendDepth("sepal", shared);
  sepals.castShadow = sepals.receiveShadow = true;
  sepals.frustumCulled = false;
  head.add(sepals);

  const green = new MeshPhysicalMaterial({ color: "#3b5a3b", roughness: 0.42, clearcoat: 0.4, clearcoatRoughness: 0.35, envMapIntensity: 0.6 });
  const hip = new Mesh(new SphereGeometry(1, 24, 16), green);
  hip.scale.set(0.12, 0.15, 0.12);
  hip.position.y = -0.16;
  hip.castShadow = hip.receiveShadow = true;
  head.add(hip);

  const plant = new Group();
  const stemCurve = new CatmullRomCurve3([new Vector3(0, -0.2, 0), new Vector3(0.03, -1.3, 0.04), new Vector3(0.11, -2.7, 0), new Vector3(0.14, -4.6, -0.06), new Vector3(0.1, -7.5, 0)]);
  const stem = new Mesh(new TubeGeometry(stemCurve, 90, 0.05, 14, false), green);
  stem.castShadow = stem.receiveShadow = true;
  plant.add(stem);
  const thornGeo = new ConeGeometry(0.02, 0.085, 10);
  const thornMat = new MeshPhysicalMaterial({ color: "#7a4a35", roughness: 0.5, envMapIntensity: 0.5 });
  [0.12, 0.27, 0.41, 0.58].forEach((u, i) => {
    const p = stemCurve.getPointAt(u);
    const th = new Mesh(thornGeo, thornMat);
    const side = new Vector3(Math.cos(i * 2.3 + 0.5), -0.35, Math.sin(i * 2.3 + 0.5)).normalize();
    th.position.copy(p).addScaledVector(side, 0.05);
    th.quaternion.setFromUnitVectors(new Vector3(0, 1, 0), side);
    th.castShadow = true;
    plant.add(th);
  });

  const leafMat = new MeshPhysicalMaterial({ color: "#36603d", vertexColors: true, side: DoubleSide, roughness: 0.38, clearcoat: 0.55, clearcoatRoughness: 0.3, envMapIntensity: 0.7, sheen: 0.3, sheenColor: new Color("#9fc59a") });
  const leafGeoBig = leaflet(0.62, 0.21);
  const leafGeoSmall = leaflet(0.48, 0.17);
  const leaf = (at: number, dir: Vector3, scale: number) => {
    const g = new Group();
    const start = stemCurve.getPointAt(at);
    const d = dir.clone().normalize();
    const petLen = 0.95 * scale;
    const petiole = new Mesh(new TubeGeometry(new CatmullRomCurve3([start, start.clone().addScaledVector(d, petLen * 0.5).add(new Vector3(0, 0.08 * scale, 0)), start.clone().addScaledVector(d, petLen)]), 20, 0.014, 6), green);
    petiole.castShadow = true;
    g.add(petiole);
    const up = new Vector3(0, 1, 0);
    const place = (geo: BufferGeometry, t: number, sideAngle: number, s: number) => {
      const m = new Mesh(geo, leafMat);
      m.castShadow = m.receiveShadow = true;
      const p = start.clone().addScaledVector(d, petLen * t);
      const axis = d.clone().applyAxisAngle(up, sideAngle).add(new Vector3(0, 0.25, 0)).normalize();
      m.position.copy(p);
      m.quaternion.copy(new Quaternion().setFromUnitVectors(up, axis)).multiply(new Quaternion().setFromAxisAngle(up, Math.PI / 2 - sideAngle * 0.4));
      m.scale.setScalar(s * scale);
      g.add(m);
    };
    place(leafGeoSmall, 0.42, 1.25, 0.9);
    place(leafGeoSmall, 0.42, -1.25, 0.9);
    place(leafGeoBig, 0.78, 0.95, 1);
    place(leafGeoBig, 0.78, -0.95, 1);
    place(leafGeoBig, 1, 0, 1.12);
    return g;
  };
  plant.add(leaf(0.25, new Vector3(0.85, 0.18, 0.5), 1), leaf(0.47, new Vector3(-0.9, 0.12, 0.25), 0.82));

  const rose = new Group(); // pointer tilt pivots on the head
  rose.add(head, plant);
  scene.add(rose);

  // ---- framing ----
  const HEAD = new Vector3(0, 0.3, 0);
  const tmp = new Vector3();
  const state = { p: 0, open: ROSE_STILL_OPEN, intro: still ? 1 : 0, px: 0, py: 0, sway: 0 };
  const target = { p: 0, px: 0, py: 0 };
  let w = 1;
  let h = 1;
  const ease = (x: number) => x * x * (3 - 2 * x);
  const smooth = (a: number, b: number, x: number) => ease(MathUtils.clamp((x - a) / (b - a), 0, 1));

  function frame(time: number) {
    const p = state.p;
    const openP = smooth(0, 0.62, p);
    const startOpen = MathUtils.lerp(ROSE_STILL_OPEN, INTRO_OPEN, ease(state.intro));
    let open = MathUtils.lerp(startOpen, 1, openP);
    let cx = MathUtils.lerp(ROSE_REST.cx, 0.5, smooth(0.18, 0.62, p));
    let cy = ROSE_REST.cy;
    const dive = Math.pow(smooth(0.6, 1, p), 1.6);
    let dist = MathUtils.lerp(MathUtils.lerp(9.2, 10.6, openP), 1.15, dive);
    let elev = MathUtils.lerp(0.3, 1.42, smooth(0.55, 1, p));
    let yaw = 0.35 + p * 1.1 + state.px * 0.28 + state.sway * Math.sin(time * 0.45) * 0.05;
    let tilt = state.py * 0.08;
    const aim = tmp.set(0, MathUtils.lerp(-0.02, HEAD.y + 0.2, smooth(0.5, 1, p)), 0);

    if (still === "phone") {
      open = opts.open ?? 0.6;
      cx = 0.5;
      cy = 0.34;
      dist = 6.4;
      elev = 0.46;
      yaw = 0.62;
      tilt = 0;
      aim.set(0, 0.05, 0);
    } else if (still === "desktop") {
      open = opts.open ?? ROSE_STILL_OPEN;
      cx = 0.5;
    }

    shared.uOpen.value = open;
    shared.uTime.value = time;
    shared.uSway.value = state.sway;
    rose.rotation.set(tilt, yaw, -state.px * 0.03);

    camera.position.set(0, Math.sin(elev) * dist, Math.cos(elev) * dist).add(aim);
    camera.up.set(0, 1, 0);
    camera.lookAt(aim);
    // off-axis projection: the aim point lands at (cx, cy) of the canvas without changing the perspective
    const near = 0.05;
    const top = near * Math.tan(MathUtils.degToRad(FOV / 2)) * 2;
    const width = (top * w) / h;
    camera.near = near;
    camera.projectionMatrix.makePerspective(-cx * width, (1 - cx) * width, cy * top, (cy - 1) * top, near, 80);
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();

    key.position.set(-4.6 + state.px * 1.6, 3.6 - state.py * 0.8, 3.0);
    key.target.position.copy(HEAD);
    camera.updateMatrixWorld();
    const kd = (petalCols.uKeyDirV.value as Vector3).copy(key.position).sub(HEAD).normalize().transformDirection(camera.matrixWorldInverse);
    kd.normalize();
  }

  // ---- loop: render on demand ----
  let raf = 0;
  let visible = true;
  let disposed = false;
  let last = performance.now();
  let lastActive = last;
  const t0 = last;

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    w = Math.max(1, Math.round(r.width));
    h = Math.max(1, Math.round(r.height));
    renderer.setPixelRatio(still ? 2 : Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(w, h, false);
  };

  const render = (now: number) => {
    frame((now - t0) / 1000);
    renderer.render(scene, camera);
  };

  const tick = (now: number) => {
    raf = 0;
    if (disposed) return;
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const k = 1 - Math.exp(-dt * 5);
    state.p += (target.p - state.p) * Math.min(1, k * 2.2);
    state.px += (target.px - state.px) * k;
    state.py += (target.py - state.py) * k;
    if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / 2.8);
    const swayTo = now - lastActive < 5000 ? 1 : 0;
    state.sway += (swayTo - state.sway) * (1 - Math.exp(-dt * 1.2));
    render(now);
    const moving =
      state.intro < 1 ||
      Math.abs(target.p - state.p) > 1e-4 ||
      Math.abs(target.px - state.px) > 1e-3 ||
      Math.abs(target.py - state.py) > 1e-3 ||
      state.sway > 0.002 ||
      swayTo > 0;
    if (moving && visible) raf = requestAnimationFrame(tick);
  };

  const wake = () => {
    lastActive = performance.now();
    if (!raf && visible && !disposed && !still) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };

  const ro = new ResizeObserver(() => {
    resize();
    if (still) render(performance.now());
    else wake();
  });
  ro.observe(canvas);
  resize();
  render(performance.now());
  wake();

  return {
    setProgress: (p, jump) => {
      target.p = MathUtils.clamp(p, 0, 1);
      if (jump) {
        state.p = target.p;
        if (target.p > 0.05) state.intro = 1;
      }
      wake();
    },
    setPointer: (x, y) => {
      target.px = x;
      target.py = y;
      wake();
    },
    setVisible: (v) => {
      visible = v;
      if (v) wake();
    },
    snapshot: () => {
      resize();
      render(performance.now());
      return canvas.toDataURL("image/png");
    },
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      scene.traverse((o) => {
        const m = o as Mesh;
        if (m.isMesh) {
          m.geometry.dispose();
          (Array.isArray(m.material) ? m.material : [m.material]).forEach((x: Material) => x.dispose());
          (m.customDepthMaterial as Material | undefined)?.dispose();
        }
      });
      thornGeo.dispose();
      envTex.dispose();
      pmrem.dispose();
      room.dispose?.();
      renderer.dispose();
    },
  };
}

