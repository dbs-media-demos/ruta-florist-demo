/**
 * The /v2 hero rose: the same coral garden rose as the 3D hero, seen from above and drawn in
 * canvas 2D (no three.js, no WebGL). Petals sit on the same golden-angle spiral; each one is a
 * band whose visible depth grows as it opens, so a tight swirl of crescents (the bud) unfolds
 * into wide, lipped petals. A key light follows the cursor: petals facing it brighten, every petal
 * casts a soft shadow onto the ones beneath it, and the whole head shades the ground.
 *
 * Desktop only (the hero imports this module on a wide screen, after hydration). It opens from a bud
 * on its own in its first ~3 s, then petal by petal with the scroll, turns, and the view dives into
 * its heart. Renders on demand and stops when settled, off screen or in a hidden tab.
 */

export type Rose2DHandle = {
  /** Hero scroll progress, 0 (top) to 1 (dived into the heart). `jump` skips the easing. */
  setProgress: (p: number, jump?: boolean) => void;
  setPointer: (x: number, y: number) => void;
  setVisible: (v: boolean) => void;
  dispose: () => void;
};

type Petal = { a: number; t: number; w: number; len: number; ruffle: number; seed: number };
type RGB = [number, number, number];

const N = 34;
const GOLDEN = 2.39996323;
/** Where the rose sits at rest, as fractions of the hero (a touch right of the 3D rose: it is wider, and the heading needs the room). */
const REST = { cx: 0.69, cy: 0.5 };
const BUD = 0.06;
const REST_OPEN = 0.36;

// coral garden rose: the same family of colours as the 3D petals
const DEEP: RGB = [128, 34, 22];
const MID: RGB = [222, 98, 72];
const LIGHT: RGB = [243, 150, 122];
const PALE: RGB = [250, 205, 184];

function rand(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let x = s;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const ease = (x: number) => x * x * (3 - 2 * x);
const smooth = (a: number, b: number, x: number) => ease(clamp((x - a) / (b - a)));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const mix = (c1: RGB, c2: RGB, t: number): RGB => [lerp(c1[0], c2[0], t), lerp(c1[1], c2[1], t), lerp(c1[2], c2[2], t)];
const rgba = (c: RGB, k: number, a = 1) => `rgba(${Math.min(255, c[0] * k) | 0},${Math.min(255, c[1] * k) | 0},${Math.min(255, c[2] * k) | 0},${a})`;

export function createRose2D(canvas: HTMLCanvasElement, opts: { reduced?: boolean; onFirstFrame?: () => void } = {}): Rose2DHandle {
  const ctx = canvas.getContext("2d", { alpha: true })!;
  const rnd = rand(7);
  const petals: Petal[] = Array.from({ length: N }, (_, i) => ({
    a: i * GOLDEN + (rnd() - 0.5) * 0.22,
    t: i / (N - 1),
    w: 0.9 + rnd() * 0.22,
    len: 0.92 + rnd() * 0.14,
    ruffle: rnd() * 6.28,
    seed: rnd(),
  }));
  // five leaves, 72° apart; at rest none points straight at the heading on the left
  const leaves = Array.from({ length: 5 }, (_, k) => ({ a: 0.425 + k * 1.2566 + (rnd() - 0.5) * 0.16, len: 1.05 + rnd() * 0.2, w: 0.3 + rnd() * 0.06 }));

  const state = { p: 0, intro: opts.reduced ? 1 : 0, px: 0, py: 0, sway: 0 };
  const target = { p: 0, px: 0, py: 0 };
  let W = 1;
  let H = 1;
  let dpr = 1;
  let raf = 0;
  let inView = true;
  let visible = !document.hidden;
  let disposed = false;
  let first = true;
  let last = performance.now();
  let lastActive = last;
  const t0 = last;
  // a weak machine: drop the blurred shadows (the costliest part) and keep the motion
  const perf = { frames: 0, spent: 0, lite: false };

  const resize = () => {
    const r = canvas.getBoundingClientRect();
    W = Math.max(1, r.width);
    H = Math.max(1, r.height);
    dpr = perf.lite ? 1 : Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
  };

  /** One petal's outline: an outer lipped arc and an inner edge that tapers into it at both ends. */
  const petalPath = (cx: number, cy: number, a: number, w: number, r: number, d: number, ruffle: number, open: number) => {
    const K = Math.round(clamp(r / 18, 12, 48)); // finer as the view dives in
    ctx.beginPath();
    for (let k = 0; k <= K; k++) {
      const u = (k / K) * 2 - 1;
      const ang = a + (u * w) / 2;
      const ro = r * (0.8 + 0.2 * Math.sqrt(1 - u * u)) * (1 + 0.025 * open * Math.sin(u * 7 + ruffle));
      const x = cx + Math.cos(ang) * ro;
      const y = cy + Math.sin(ang) * ro;
      if (k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    for (let k = K; k >= 0; k--) {
      const u = (k / K) * 2 - 1;
      const ang = a + (u * w) / 2;
      const ro = r * (0.8 + 0.2 * Math.sqrt(1 - u * u));
      const ri = lerp(r * (1 - d), ro, Math.pow(Math.abs(u), 1.7));
      ctx.lineTo(cx + Math.cos(ang) * ri, cy + Math.sin(ang) * ri);
    }
    ctx.closePath();
  };

  const lipPath = (cx: number, cy: number, a: number, w: number, r: number, ruffle: number, open: number) => {
    const K = Math.round(clamp(r / 26, 8, 36));
    ctx.beginPath();
    for (let k = 0; k <= K; k++) {
      const u = ((k / K) * 2 - 1) * 0.86;
      const ang = a + (u * w) / 2;
      const ro = r * (0.8 + 0.2 * Math.sqrt(1 - u * u)) * (1 + 0.025 * open * Math.sin(u * 7 + ruffle));
      const x = cx + Math.cos(ang) * ro;
      const y = cy + Math.sin(ang) * ro;
      if (k === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
  };

  function draw(time: number) {
    const p = state.p;
    const intro = ease(state.intro);
    const openP = smooth(0, 0.62, p);
    const open = lerp(lerp(BUD, REST_OPEN, intro), 1, openP);
    const dive = Math.pow(smooth(0.6, 1, p), 1.6);
    const cxF = lerp(REST.cx, 0.5, smooth(0.18, 0.62, p));
    const base = Math.min(W * 0.235, H * 0.285);
    const R = base * lerp(0.86, 1, intro) * lerp(1, 1.12, openP) * lerp(1, 16, dive);
    // the heart drifts to the middle as the view dives in
    const cx = cxF * W + state.px * base * 0.04 * (1 - dive);
    const cy = REST.cy * H + state.py * base * 0.03 * (1 - dive) - base * 0.06 * dive;
    const rot = -0.5 + (1 - intro) * -0.6 + p * 1.15 + state.px * 0.1 + state.sway * Math.sin(time * 0.45) * 0.035;
    // key light: upper left, swung by the cursor (as in the 3D scene)
    const lightA = -2.25 + state.px * 0.55 - state.py * 0.25;
    const lx = Math.cos(lightA);
    const ly = Math.sin(lightA);
    const lite = perf.lite;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // the head's soft shadow on the ground, thrown away from the light
    const g0 = ctx.createRadialGradient(cx - lx * base * 0.16, cy - ly * base * 0.16, 0, cx - lx * base * 0.16, cy - ly * base * 0.16, R * 1.55);
    g0.addColorStop(0, "rgba(4,10,7,0.55)");
    g0.addColorStop(0.55, "rgba(4,10,7,0.22)");
    g0.addColorStop(1, "rgba(4,10,7,0)");
    ctx.fillStyle = g0;
    ctx.fillRect(0, 0, W, H);

    // leaves beneath the head
    const leafAlpha = 1 - smooth(0.62, 0.8, p);
    if (leafAlpha > 0.01) {
      ctx.globalAlpha = leafAlpha;
      for (const lf of leaves) {
        const a = lf.a + rot * 0.85;
        const L = R * lf.len * lerp(0.62, 1, Math.max(intro, openP));
        const wv = L * lf.w;
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(a);
        ctx.beginPath();
        ctx.moveTo(L * 0.25, 0);
        ctx.bezierCurveTo(L * 0.5, -wv * 0.75, L * 0.86, -wv * 0.42, L, 0);
        ctx.bezierCurveTo(L * 0.86, wv * 0.42, L * 0.5, wv * 0.75, L * 0.25, 0);
        const facing = Math.cos(a - lightA);
        const lg = ctx.createLinearGradient(L * 0.25, -wv * 0.5, L, wv * 0.5);
        lg.addColorStop(0, rgba([24, 52, 34], 1 + facing * 0.15));
        lg.addColorStop(0.5, rgba([50, 92, 58], 1 + facing * 0.2));
        lg.addColorStop(1, rgba([30, 64, 40], 1 + facing * 0.12));
        if (!lite) {
          ctx.shadowColor = "rgba(0,8,4,0.55)";
          ctx.shadowBlur = base * 0.06;
          ctx.shadowOffsetX = -lx * base * 0.03;
          ctx.shadowOffsetY = -ly * base * 0.03;
        }
        ctx.fillStyle = lg;
        ctx.fill();
        ctx.shadowColor = "transparent";
        // midrib and a few veins
        ctx.strokeStyle = `rgba(150,190,140,${0.22 + facing * 0.08})`;
        ctx.lineWidth = Math.max(0.6, base * 0.005);
        ctx.beginPath();
        ctx.moveTo(L * 0.27, 0);
        ctx.quadraticCurveTo(L * 0.62, wv * 0.05, L * 0.97, 0);
        for (let v = 0; v < 4; v++) {
          const x0 = L * (0.38 + v * 0.13);
          ctx.moveTo(x0, 0);
          ctx.quadraticCurveTo(x0 + L * 0.06, -wv * 0.18, x0 + L * 0.1, -wv * (0.36 - v * 0.06));
          ctx.moveTo(x0, 0);
          ctx.quadraticCurveTo(x0 + L * 0.06, wv * 0.18, x0 + L * 0.1, wv * (0.36 - v * 0.06));
        }
        ctx.stroke();
        ctx.restore();
      }
      ctx.globalAlpha = 1;
    }

    // the cup under the petals: wherever they part, a deep coral shadow shows, never the background
    const cup = R * lerp(0.42, 0.34, open);
    const gc = ctx.createRadialGradient(cx, cy, 0, cx, cy, cup);
    gc.addColorStop(0, "rgb(72,14,8)");
    gc.addColorStop(0.6, "rgb(118,30,18)");
    gc.addColorStop(1, "rgb(150,44,28)");
    ctx.fillStyle = gc;
    ctx.beginPath();
    ctx.arc(cx, cy, cup, 0, Math.PI * 2);
    ctx.fill();

    // petals: outer first, so each inner petal lies over (and shades) the ones around it
    const diag = Math.hypot(W, H);
    for (let i = N - 1; i >= 0; i--) {
      const pt = petals[i];
      const t = pt.t;
      // the outer petals open first; the heart unfurls last
      // (and never all the way: a garden rose keeps a swirled heart)
      const oi = ease(clamp((open - (1 - t) * 0.5) / 0.5)) * lerp(0.5, 1, Math.sqrt(t));
      const r = R * pt.len * lerp(0.1 + 0.36 * Math.pow(t, 0.9), 0.14 + 0.86 * Math.pow(t, 0.72), oi);
      const d = lerp(0.2 + 0.12 * t, 0.86, Math.pow(oi, 1.15));
      const inner = r * (1 - d);
      if (inner > diag * 1.1) continue; // dived past it
      const w = pt.w * lerp(lerp(2.7, 1.65, t), lerp(1.45, 1.05, t), oi);
      const a = pt.a + rot * lerp(1.05, 1, t);
      const facing = Math.cos(a - lightA);
      // light: petals facing the key brighten; the deep heart stays darker
      const k = lerp(0.76, 1, Math.pow(t, 0.4) * (0.5 + 0.5 * oi) + 0.25 * (1 - oi)) * (1 + 0.13 * facing * lerp(0.45, 1, oi));
      const baseCol = mix(DEEP, MID, lerp(0.35, 0.75, t * 0.6 + oi * 0.4));
      const g = ctx.createRadialGradient(cx, cy, Math.max(0, inner), cx, cy, r);
      g.addColorStop(0, rgba(mix(DEEP, baseCol, 0.35), k * 0.82));
      g.addColorStop(0.45, rgba(baseCol, k));
      g.addColorStop(0.82, rgba(mix(MID, LIGHT, 0.6 + 0.4 * oi), k));
      g.addColorStop(1, rgba(PALE, k * 0.98));
      petalPath(cx, cy, a, w, r, d, pt.ruffle, oi);
      if (!lite) {
        ctx.shadowColor = `rgba(60,10,4,${0.32 + 0.22 * oi})`;
        ctx.shadowBlur = Math.min(42, base * lerp(0.025, 0.06, oi) * (1 + dive * 3));
        ctx.shadowOffsetX = -lx * base * lerp(0.008, 0.022, oi);
        ctx.shadowOffsetY = -ly * base * lerp(0.008, 0.022, oi);
      }
      ctx.fillStyle = g;
      ctx.fill();
      ctx.shadowColor = "transparent";
      // curvature: each petal is cupped, so one side turns towards the key light and the other away
      const ax = Math.cos(a - w / 2) * r * 0.8;
      const ay = Math.sin(a - w / 2) * r * 0.8;
      const bx = Math.cos(a + w / 2) * r * 0.8;
      const by = Math.sin(a + w / 2) * r * 0.8;
      const lightRight = Math.cos(a + w / 2 - lightA) > Math.cos(a - w / 2 - lightA);
      const gl = ctx.createLinearGradient(cx + ax, cy + ay, cx + bx, cy + by);
      const darkSide = `rgba(70,12,6,${0.34 * lerp(0.6, 1, oi)})`;
      const lightSide = `rgba(255,236,224,${0.16 * lerp(0.5, 1, oi)})`;
      gl.addColorStop(0, lightRight ? darkSide : lightSide);
      gl.addColorStop(0.5, "rgba(0,0,0,0)");
      gl.addColorStop(1, lightRight ? lightSide : darkSide);
      ctx.fillStyle = gl;
      ctx.fill();
      if (lite) {
        // a crisp contact line instead of the blurred shadow
        ctx.strokeStyle = "rgba(70,14,6,0.35)";
        ctx.lineWidth = Math.max(0.8, base * 0.006);
        ctx.stroke();
      }
      // the rolled lip catches the light
      lipPath(cx, cy, a, w, r, pt.ruffle, oi);
      ctx.strokeStyle = `rgba(255,230,214,${clamp(0.18 + 0.32 * facing * (0.4 + 0.6 * oi) + 0.12 * oi, 0.05, 0.62)})`;
      ctx.lineWidth = Math.max(0.8, Math.min(6, r * 0.018));
      ctx.lineCap = "round";
      ctx.stroke();
    }

    // the heart: a little depth where the last petals curl in
    const hr = R * lerp(0.13, 0.06, open);
    const gh = ctx.createRadialGradient(cx, cy, 0, cx, cy, hr);
    gh.addColorStop(0, "rgba(70,14,8,0.6)");
    gh.addColorStop(1, "rgba(70,14,8,0)");
    ctx.fillStyle = gh;
    ctx.beginPath();
    ctx.arc(cx, cy, hr, 0, Math.PI * 2);
    ctx.fill();

    if (first) {
      first = false;
      opts.onFirstFrame?.();
    }
  }

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
    const s0 = performance.now();
    draw((now - t0) / 1000);
    if (!perf.lite && perf.frames < 30) {
      perf.frames++;
      perf.spent += performance.now() - s0;
      if (perf.frames === 30 && perf.spent / 30 > 6) {
        perf.lite = true;
        resize();
      }
    }
    const moving =
      state.intro < 1 ||
      Math.abs(target.p - state.p) > 1e-4 ||
      Math.abs(target.px - state.px) > 1e-3 ||
      Math.abs(target.py - state.py) > 1e-3 ||
      state.sway > 0.002 ||
      swayTo > 0;
    if (moving && visible) raf = requestAnimationFrame(tick);
  };

  const wake = (active = true) => {
    if (active) lastActive = performance.now();
    if (opts.reduced) {
      if (!raf && visible) raf = requestAnimationFrame(() => {
        raf = 0;
        state.p = target.p;
        draw(0);
      });
      return;
    }
    if (!raf && visible && !disposed) {
      last = performance.now();
      raf = requestAnimationFrame(tick);
    }
  };

  const onVis = () => {
    visible = inView && !document.hidden;
    if (visible) wake(false);
    else {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };
  document.addEventListener("visibilitychange", onVis);
  const ro = new ResizeObserver(() => {
    resize();
    if (opts.reduced || !raf) draw((performance.now() - t0) / 1000);
  });
  ro.observe(canvas);
  resize();
  wake(!opts.reduced);

  return {
    setProgress: (p, jump) => {
      target.p = clamp(p);
      if (jump) {
        state.p = target.p;
        if (target.p > 0.05) state.intro = 1;
      }
      wake();
    },
    setPointer: (x, y) => {
      if (opts.reduced) return;
      target.px = x;
      target.py = y;
      wake();
    },
    setVisible: (v) => {
      inView = v;
      onVis();
    },
    dispose: () => {
      disposed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    },
  };
}
