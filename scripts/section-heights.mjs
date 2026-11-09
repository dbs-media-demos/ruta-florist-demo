// Measures each deferred home section ([data-cv], components/ui/Later) at phone widths with
// content-visibility off, and prints a + b·vw fits for 360–430 and 431–767 px plus the 320 px height.
//   npm run build && node scripts/with-server.mjs node scripts/section-heights.mjs [route]
import { chromium } from "playwright";
import path from "node:path";

const exe = path.join(process.env.LOCALAPPDATA, "ms-playwright/chromium-1234/chrome-win64/chrome.exe");
const base = process.env.URL ?? "http://localhost:4261";
const route = process.argv[2] ?? "/";
const widths = [320, 360, 375, 390, 414, 430, 480, 600, 767];
const browser = await chromium.launch({ executablePath: exe });
const rows = {};
for (const w of widths) {
  const ctx = await browser.newContext({ viewport: { width: w, height: 800 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const page = await ctx.newPage();
  await page.goto(base + route, { waitUntil: "load" });
  await page.addStyleTag({ content: "[data-cv]{content-visibility:visible!important;contain-intrinsic-size:none!important}" });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(1500);
  const hs = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll("[data-cv]")].map((e) => [e.dataset.cv, e.getBoundingClientRect().height])));
  for (const [k, h] of Object.entries(hs)) (rows[k] ??= {})[w] = Math.round(h);
  await ctx.close();
}
await browser.close();
const fit = (r, ws) => {
  const xs = ws.map((w) => w / 100);
  const ys = ws.map((w) => r[w]);
  const n = xs.length;
  const mx = xs.reduce((p, q) => p + q) / n;
  const my = ys.reduce((p, q) => p + q) / n;
  const b = xs.reduce((p, x, i) => p + (x - mx) * (ys[i] - my), 0) / xs.reduce((p, x) => p + (x - mx) ** 2, 0);
  const a = my - b * mx;
  const worst = Math.max(...ws.map((w, i) => Math.abs(a + b * xs[i] - ys[i]) / ys[i]));
  return [`calc(${Math.round(a)}px ${b < 0 ? "-" : "+"} ${Math.abs(b).toFixed(1)}vw)`, worst];
};
for (const [k, r] of Object.entries(rows)) {
  const [phone, e1] = fit(r, [360, 375, 390, 414, 430]);
  const [large, e2] = fit(r, [480, 600, 767]);
  console.log(`  ${k}: ["${phone}", ${r[320]}, "${large}"], // worst ${(e1 * 100).toFixed(1)}% / ${(e2 * 100).toFixed(1)}%`);
}
