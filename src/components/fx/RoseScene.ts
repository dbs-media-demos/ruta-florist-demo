import {
  BufferAttribute,
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
  NoToneMapping,
  OrthographicCamera,
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
  WebGLRenderTarget,
  BackSide,
  FrontSide,
  type Material,
  type Object3D,
  type Texture,
  type WebGLProgramParametersWithUniforms,
} from "three";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { ROSE_REST, ROSE_STILL_OPEN } from "./rose-frame";

/**
 * The hero rose: a coral garden rose built from primitives. Every petal is the same grid; the GPU
 * bends it (spine arc, cupped cross-section, rolled-back edges, a little ruffle) from one `uOpen`
 * value, so the bloom opens with the scroll at no CPU cost, and the shadow pass bends it the same
 * way so the petals shade each other for real. Renders on demand; stops when nothing moves, when
 * the hero is off screen and when the tab is hidden.
 *
 * Never stutters: `createRoseScene` resolves only once every shader is compiled (compileAsync, then
 * one frame on the still-invisible canvas, which also builds the shadow programs and uploads the
 * buffers), so the hero keeps its still until then. Software rendering or a GPU the browser flags
 * as slow throws, and the still stays. The first 2 s live are watched: under ~45 fps on average, or
 * one frame over 100 ms after warm-up, the loop stops and `onSlow` hands back to the still.
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
  /** Starts the live loop (and the 2 s frame-rate check) once the canvas is about to fade in. */
  start: () => void;
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
  const index = new Uint32Array(nx * ny * 6 * specs.length);
  let q = 0;
  // straight into the typed arrays (no per-vertex arrays): a weak laptop builds it in one short task
  specs.forEach((p, n) => {
    const o = n * per;
    for (let j = 0; j <= ny; j++) {
      for (let i = 0; i <= nx; i++) {
        const v = o + j * (nx + 1) + i;
        st[v * 2] = -1 + (2 * i) / nx;
        st[v * 2 + 1] = j / ny;
        petal[v * 4] = p.az;
        petal[v * 4 + 1] = p.L;
        petal[v * 4 + 2] = p.W;
        petal[v * 4 + 3] = p.k;
        base[v * 4] = p.r0;
        base[v * 4 + 1] = p.y0;
        base[v * 4 + 2] = p.sa;
        base[v * 4 + 3] = p.sb;
        pos[v * 3 + 1] = j / ny;
      }
    }
    for (let j = 0; j < ny; j++) {
      for (let i = 0; i < nx; i++) {
        const a = o + j * (nx + 1) + i;
        const d = a + nx + 1;
        index.set([a, a + 1, d + 1, a, d + 1, d], q);
        q += 6;
      }
    }
  });
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.setAttribute("aST", new Float32BufferAttribute(st, 2));
  g.setAttribute("aPetal", new Float32BufferAttribute(petal, 4));
  g.setAttribute("aBase", new Float32BufferAttribute(base, 4));
  g.setIndex(new BufferAttribute(index, 1));
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

const PROBE_MS = 2000;
const PROBE_MIN_FPS = 45;
const PROBE_MAX_FRAME_MS = 100;
const PROBE_WARMUP_FRAMES = 3;
const SOFTWARE_GL = /swiftshader|llvmpipe|softpipe|software|basic render/i;

/** Hands the main thread back between setup steps, so none of them is one long freeze. */
const breathe = () => {
  const s = (globalThis as { scheduler?: { yield?: () => Promise<void> } }).scheduler;
  return s?.yield ? s.yield() : new Promise<void>((r) => setTimeout(r, 0));
};

/**
 * Compiles `objects` in parallel (KHR_parallel_shader_compile) as they will be drawn into a render
 * target: linear output, no tone mapping. Programs are shared by cache key, so the real draw later
 * finds them ready instead of compiling on the spot.
 */
function compileOffscreen(renderer: WebGLRenderer, objects: Object3D, camera: PerspectiveCamera | OrthographicCamera, lightsFrom: Scene | null = null) {
  const prev = renderer.getRenderTarget();
  const target = new WebGLRenderTarget(1, 1);
  renderer.setRenderTarget(target);
  const done = renderer.compileAsync(objects, camera, lightsFrom);
  renderer.setRenderTarget(prev);
  return done.finally(() => target.dispose());
}

type PmremInternals = { _setSize?: (n: number) => void; _allocateTargets?: () => WebGLRenderTarget; _blurMaterial?: Material | null; _ggxMaterial?: Material | null };

/**
 * The room-light environment, without the half-second freeze `fromScene` costs on a cold shader
 * cache: its room, blur and GGX programs are compiled in parallel first (the generator's own
 * materials, reached through its internals; if a three.js update renames them it simply compiles
 * them on the spot as before).
 */
async function roomEnvironment(renderer: WebGLRenderer, pmrem: PMREMGenerator, room: Scene): Promise<Texture> {
  const gen = pmrem as unknown as PmremInternals;
  if (gen._setSize && gen._allocateTargets) {
    gen._setSize(256); // fromScene's default size, so it reuses these materials
    const scratch = gen._allocateTargets();
    const flat = new OrthographicCamera();
    const tm = renderer.toneMapping;
    renderer.toneMapping = NoToneMapping;
    const jobs = [compileOffscreen(renderer, room, new PerspectiveCamera(90, 1, 0.1, 100))];
    // a position attribute like the generator's own planes, or the program key differs by that bit
    const plane = new BufferGeometry().setAttribute("position", new Float32BufferAttribute([0, 0, 0], 3));
    for (const m of [gen._blurMaterial, gen._ggxMaterial]) if (m) jobs.push(compileOffscreen(renderer, new Mesh(plane, m), flat));
    renderer.toneMapping = tm;
    await Promise.all(jobs);
    plane.dispose();
    scratch.dispose();
    await breathe();
  }
  return pmrem.fromScene(room, 0.04).texture;
}

/**
 * The shadow pass draws every caster with a depth material; compiling those on the first frame was
 * the last hitch. Stand-ins with the same program keys (side flipped as the shadow pass flips it,
 * the same receiveShadow) compile them ahead, in parallel.
 */
function shadowStandIns(scene: Scene) {
  const group = new Group();
  const own: Material[] = [];
  const seen = new Set<string>();
  const flip = (side: number) => (side === DoubleSide ? DoubleSide : side === BackSide ? FrontSide : BackSide);
  scene.traverse((o) => {
    const m = o as Mesh;
    if (!m.isMesh || !m.castShadow) return;
    const mat = m.material as Material;
    const custom = m.customDepthMaterial;
    const side = mat.shadowSide ?? flip(mat.side);
    const key = `${custom?.uuid ?? "built-in"}:${side}:${m.receiveShadow}`;
    if (seen.has(key)) return;
    seen.add(key);
    const depth = custom ?? new MeshDepthMaterial();
    if (!custom) own.push(depth);
    if (custom) custom.side = side; // the shadow pass sets the same side on every draw
    else depth.side = side as typeof depth.side;
    const stand = new Mesh(m.geometry, depth);
    stand.receiveShadow = m.receiveShadow;
    stand.frustumCulled = false;
    group.add(stand);
  });
  // `own` is disposed only after the first real frame, or the shared programs would go with it
  return { group, own };
}

export async function createRoseScene(canvas: HTMLCanvasElement, opts: { still?: RoseStill; open?: number; onSlow?: () => void } = {}): Promise<RoseHandle> {
  const still = opts.still;
  // the stills script renders in software on purpose; visitors need a real graphics chip
  const renderer = new WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance", failIfMajorPerformanceCaveat: !still, preserveDrawingBuffer: !!still });
  if (!still) {
    const gl = renderer.getContext();
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const gpu = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    if (SOFTWARE_GL.test(gpu)) {
      renderer.dispose();
      renderer.forceContextLoss();
      throw new Error(`software WebGL (${gpu})`);
    }
  }
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = PCFShadowMap;

  await breathe();

  const scene = new Scene();
  const pmrem = new PMREMGenerator(renderer);
  const room = new RoomEnvironment();
  let envTex: Texture | null = null;
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

  await breathe();
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
  let inView = true;
  let visible = !document.hidden;
  let started = !!still;
  let disposed = false;
  let last = performance.now();
  let lastActive = last;
  let t0 = last;
  // the first 2 s live: frames counted and the worst one kept, reset whenever the loop pauses
  const probe = { on: !still, from: 0, frames: 0, worst: 0 };

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    w = Math.max(1, Math.round(r.width));
    h = Math.max(1, Math.round(r.height));
    renderer.setPixelRatio(still ? 2 : Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(w, h, false);
  };

  const render = (now: number) => {
    frame((now - t0) / 1000);
    renderer.render(scene, camera);
  };

  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    probe.from = 0;
  };

  const check = (now: number, gap: number) => {
    if (!probe.from) {
      probe.from = now;
      probe.frames = 0;
      probe.worst = 0;
      return;
    }
    probe.frames++;
    if (probe.frames > PROBE_WARMUP_FRAMES) probe.worst = Math.max(probe.worst, gap);
    const span = now - probe.from;
    if (span < PROBE_MS && probe.worst <= PROBE_MAX_FRAME_MS) return;
    probe.on = false;
    const fps = (probe.frames * 1000) / span;
    const detail = { fps: Math.round(fps), worst: Math.round(probe.worst) };
    if (fps < PROBE_MIN_FPS || probe.worst > PROBE_MAX_FRAME_MS) {
      performance.mark("rose:slow", { detail });
      stop();
      disposed = true; // no more frames; the owner frees the renderer after the fade
      opts.onSlow?.();
    } else performance.mark("rose:smooth", { detail });
  };

  const tick = (now: number) => {
    raf = 0;
    if (disposed) return;
    const gap = now - last;
    const dt = Math.min(0.05, gap / 1000);
    last = now;
    const k = 1 - Math.exp(-dt * 5);
    state.p += (target.p - state.p) * Math.min(1, k * 2.2);
    state.px += (target.px - state.px) * k;
    state.py += (target.py - state.py) * k;
    if (state.intro < 1) state.intro = Math.min(1, state.intro + dt / 2.8);
    const swayTo = now - lastActive < 5000 ? 1 : 0;
    state.sway += (swayTo - state.sway) * (1 - Math.exp(-dt * 1.2));
    render(now);
    if (probe.on) {
      check(now, gap);
      if (disposed) return;
    }
    const moving =
      state.intro < 1 ||
      Math.abs(target.p - state.p) > 1e-4 ||
      Math.abs(target.px - state.px) > 1e-3 ||
      Math.abs(target.py - state.py) > 1e-3 ||
      state.sway > 0.002 ||
      swayTo > 0;
    if (moving && visible) raf = requestAnimationFrame(tick);
    else probe.from = 0; // a pause is not a slow frame: the check starts over next time
  };

  const wake = () => {
    lastActive = performance.now();
    if (!raf && visible && started && !disposed && !still) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };

  const setVisible = () => {
    visible = inView && !document.hidden;
    if (visible) wake();
    else stop();
  };
  document.addEventListener("visibilitychange", setVisible);

  // warm up off screen, a step at a time: the canvas is still invisible and the still holds the hero
  const fail = () => {
    disposed = true;
    document.removeEventListener("visibilitychange", setVisible);
    renderer.dispose();
    renderer.forceContextLoss();
  };
  try {
    await breathe();
    envTex = await roomEnvironment(renderer, pmrem, room);
    scene.environment = envTex;
    await breathe();
    resize();
    frame(0);
    const standIns = shadowStandIns(scene);
    await Promise.all([renderer.compileAsync(scene, camera), compileOffscreen(renderer, standIns.group, key.shadow.camera, scene)]);
    await breathe();
    if (renderer.getContext().isContextLost()) throw new Error("WebGL context lost");
    render(performance.now()); // the shadow map and the buffers go up while nobody is looking
    standIns.own.forEach((m) => m.dispose());
    await new Promise((r) => requestAnimationFrame(r));
  } catch (err) {
    fail();
    throw err;
  }

  const ro = new ResizeObserver(() => {
    resize();
    if (still) render(performance.now());
    else if (started) wake();
  });
  ro.observe(canvas);

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
      inView = v;
      setVisible();
    },
    start: () => {
      if (started || still) return;
      started = true;
      t0 = last = performance.now();
      wake();
    },
    snapshot: () => {
      resize();
      render(performance.now());
      return canvas.toDataURL("image/png");
    },
    dispose: () => {
      disposed = true;
      stop();
      ro.disconnect();
      document.removeEventListener("visibilitychange", setVisible);
      scene.traverse((o) => {
        const m = o as Mesh;
        if (m.isMesh) {
          m.geometry.dispose();
          (Array.isArray(m.material) ? m.material : [m.material]).forEach((x: Material) => x.dispose());
          (m.customDepthMaterial as Material | undefined)?.dispose();
        }
      });
      thornGeo.dispose();
      envTex?.dispose();
      pmrem.dispose();
      room.dispose?.();
      renderer.dispose();
      renderer.forceContextLoss();
    },
  };
}

