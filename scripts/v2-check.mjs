// /v2 check on the production build: three.js requests, the hero moving in its first 3 s,
// console errors and a few screenshots (desktop scroll positions + phone).
//   npm run build && node scripts/with-server.mjs node scripts/v2-check.mjs [/v2 /en/v2 /]
import { chromium } from "playwright";
import fs from "node:fs";

const base = process.env.URL ?? "http://localhost:4261";
const paths = process.argv.slice(2).length ? process.argv.slice(2) : ["/v2", "/en/v2"];
const outDir = process.env.OUT ?? "C:/tmp/florist-v2";
fs.mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });

for (const p of paths) {
  for (const [label, vp] of [["desk", { width: 1440, height: 900 }], ["phone", { width: 375, height: 812 }]]) {
    const phone = label === "phone";
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: phone ? 2 : 1, isMobile: phone, hasTouch: phone });
    const page = await ctx.newPage();
    const three = [];
    const errors = [];
    page.on("response", async (r) => {
      if (!r.url().includes("/_next/static/chunks/")) return;
      try {
        const body = await r.text();
        if (/WebGLRenderer|THREE\.|three\.module/.test(body) || body.includes("WEBGL_")) three.push(`${r.url().split("/").pop()} ${body.length}B`);
      } catch {}
    });
    page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    page.on("pageerror", (e) => errors.push(e.message));
    const name = `${p.replaceAll("/", "_") || "_root"}-${label}`;
    await page.goto(base + p, { waitUntil: "load" });
    // does the hero move in its first 3 s? two canvas snapshots a second apart
    let moving = "n/a";
    if (!phone) {
      await page.waitForTimeout(700);
      const a = await page.evaluate(() => document.querySelector("#hero canvas")?.toDataURL().length ?? 0);
      await page.screenshot({ path: `${outDir}/${name}-0.7s.png` });
      await page.waitForTimeout(900);
      const b = await page.evaluate(() => document.querySelector("#hero canvas")?.toDataURL().length ?? 0);
      moving = a !== b ? `yes (${a} → ${b})` : `NO (${a})`;
    }
    await page.waitForTimeout(2500);
    await page.screenshot({ path: `${outDir}/${name}-top.png` });
    if (!phone) {
      for (const f of (process.env.STOPS ?? "0.35,0.7,1.4,1.75,2.2").split(",").map(Number)) {
        await page.mouse.wheel(0, 0);
        await page.evaluate((y) => window.scrollTo(0, y), Math.round(f * 900));
        await page.waitForTimeout(1600);
        await page.screenshot({ path: `${outDir}/${name}-s${f}.png` });
      }
    }
    const wide = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    console.log(`${p} ${label}: three.js chunks ${three.length ? three.join(", ") : "0"}; moving ${moving}; overflow ${wide}; errors ${errors.length ? errors.join(" | ") : 0}`);
    await ctx.close();
  }
}
await browser.close();
