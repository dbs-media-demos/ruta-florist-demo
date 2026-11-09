// Checks that the hero rose never stutters: how long the 3D takes to appear, the main-thread long
// tasks and frame gaps while it warms up and runs, and whether it falls back to the still.
// Runs twice: at full speed, then with Chrome's 4x CPU slowdown (it must end on the still, and the
// next page load must stay a still without importing three.js).
//   npm run build && node scripts/with-server.mjs node scripts/scene-smooth.mjs
// (Headless Chrome on this PC draws on the real graphics card; check the GPU line it prints.)
import { chromium } from "playwright";

const base = process.env.URL ?? "http://localhost:4261";
const browser = await chromium.launch({ channel: "chrome", headless: true });

// frame gaps and long tasks from the first paint, recorded inside the page
const probe = () => {
  window.__gaps = [];
  window.__long = [];
  let last = 0;
  const loop = (t) => {
    if (last) window.__gaps.push([Math.round(t), Math.round(t - last)]);
    last = t;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
  new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__long.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: "longtask", buffered: true });
};

const state = (page) =>
  page.evaluate(() => {
    const mark = (n) => performance.getEntriesByName(n)[0];
    const m = (n) => (mark(n) ? Math.round(mark(n).startTime) : null);
    const cv = document.querySelector("#hero canvas");
    return {
      import: m("rose:import"),
      ready: m("rose:ready"),
      smooth: mark("rose:smooth")?.detail ?? null,
      slow: mark("rose:slow")?.detail ?? null,
      slowAt: m("rose:slow"),
      noGpu: m("rose:no-gpu"),
      canvasLive: cv?.classList.contains("opacity-100") ?? false,
      flag: sessionStorage.getItem("scale:3d-off"),
      three: performance.getEntriesByType("resource").filter((r) => /RoseScene|three/i.test(r.name)).length,
    };
  });

// RATES=1,4,8 to try other slowdowns
for (const rate of (process.env.RATES ?? "1,4").split(",").map(Number)) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  await page.addInitScript(probe);
  // NO3D=1: the same visit with the 3D already refused, to tell the scene's cost from the rest of the page
  if (process.env.NO3D) await page.addInitScript(() => sessionStorage.setItem("scale:3d-off", "1"));
  const cdp = await ctx.newCDPSession(page);
  if (rate > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate });
  await page.goto(base, { waitUntil: "load" });
  const gpu = await page.evaluate(() => {
    const gl = document.createElement("canvas").getContext("webgl2");
    const i = gl?.getExtension("WEBGL_debug_renderer_info");
    return i ? gl.getParameter(i.UNMASKED_RENDERER_WEBGL) : "none";
  });
  // wait for the scene to appear and run its 2 s check (or to be refused)
  await page.waitForFunction(() => performance.getEntriesByName("rose:smooth").length || performance.getEntriesByName("rose:slow").length || performance.getEntriesByName("rose:no-gpu").length, null, { timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(2500);
  const s = await state(page);
  // then scroll through the hero with the wheel, as a visitor would
  const t0 = await page.evaluate(() => performance.now());
  for (let i = 0; i < 30; i++) {
    await page.mouse.wheel(0, 90);
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(1200);
  const { gaps, long } = await page.evaluate(() => ({ gaps: window.__gaps, long: window.__long }));
  const from = s.import ?? 0;
  const live = gaps.filter(([t]) => t > (s.ready ?? 0) && t < (s.ready ?? 0) + 2000);
  const scroll = gaps.filter(([t]) => t > t0);
  const stats = (g) => (g.length ? { frames: g.length, avgFps: Math.round(1000 / (g.reduce((a, [, d]) => a + d, 0) / g.length)), worstMs: Math.max(...g.map(([, d]) => d)), over50: g.filter(([, d]) => d > 50).length } : null);
  console.log(`\n=== CPU ${rate}x  (${gpu})`);
  console.log(`three.js requested at ${s.import} ms, scene ready (shaders compiled) at ${s.ready} ms → appeared ${s.ready && s.import ? s.ready - s.import : "-"} ms after the import started`);
  console.log(`first 2 s check: ${s.smooth ? `smooth ${JSON.stringify(s.smooth)}` : s.slow ? `SLOW ${JSON.stringify(s.slow)} at ${s.slowAt} ms → back to the still` : s.noGpu ? "no GPU → still" : "never ran"}`);
  console.log(`canvas live at the end: ${s.canvasLive}, sessionStorage flag: ${s.flag}`);
  console.log("marks", await page.evaluate(() => performance.getEntriesByType("mark").filter((m) => /^rose:/.test(m.name)).map((m) => m.name + "@" + Math.round(m.startTime)).join(" ")));
  console.log(`long tasks after the import started: ${JSON.stringify(long.filter(([t]) => t >= from))}`);
  console.log(`frames, first 2 s live: ${JSON.stringify(stats(live))}`);
  console.log(`frames, scrolling the hero: ${JSON.stringify(stats(scroll))}`);
  if (s.flag) {
    // the rest of the visit: the next page load stays a still and never imports three.js
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.reload({ waitUntil: "load" });
    await page.waitForTimeout(3000);
    const again = await state(page);
    console.log(`reload in the same visit: import=${again.import}, three.js requests=${again.three}, canvas live=${again.canvasLive}`);
  }
  if (errors.length) console.log("errors:", errors);
  await ctx.close();
}
await browser.close();
