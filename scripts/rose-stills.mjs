// Renders the hero rose's stills from the live 3D scene (the same code desktops run) and writes them
// as WebP with alpha: public/hero/rose-desktop.webp (the desktop fallback and the frame the live rose
// starts from) and public/hero/rose-phone.webp (what phones get instead of three.js).
//   npm run build && node scripts/with-server.mjs node scripts/rose-stills.mjs
import { chromium } from "playwright";
import sharp from "sharp";
import path from "node:path";

const exe = path.join(process.env.LOCALAPPDATA, "ms-playwright/chromium-1234/chrome-win64/chrome.exe");
const base = process.env.URL ?? "http://localhost:4261";
const out = path.resolve("public/hero");
const browser = await chromium.launch({ executablePath: exe, args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader", "--ignore-gpu-blocklist"] });

// phones get a wide crop of the head (the stem fades out in CSS), 1000 px wide for 3x screens
for (const [kind, size, quality, crop] of [
  ["desktop", 1400, 82, null],
  ["phone", 1000, 78, { left: 0, top: 0, width: 1000, height: 625 }],
]) {
  // a square viewport over 1024 px, so the hero canvas is square and visible
  const page = await browser.newPage({ viewport: { width: 1100, height: 1100 } });
  page.on("pageerror", (e) => console.error(e.message));
  await page.goto(`${base}/?still=${kind}`, { waitUntil: "load" });
  await page.waitForFunction(() => typeof window.__roseStill === "function", null, { timeout: 120000 });
  await page.waitForTimeout(500);
  const data = await page.evaluate(() => window.__roseStill());
  const png = Buffer.from(data.split(",")[1], "base64");
  const file = path.join(out, `rose-${kind}.webp`);
  const resized = await sharp(png).resize(size, size, { kernel: "lanczos3" }).png().toBuffer();
  const info = await (crop ? sharp(resized).extract(crop) : sharp(resized)).webp({ quality, alphaQuality: 90, effort: 6, smartSubsample: true }).toFile(file);
  console.log(`${file}: ${info.width}x${info.height}, ${(info.size / 1024).toFixed(1)} KB`);
  await page.close();
}
await browser.close();
