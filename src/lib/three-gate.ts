"use client";

/**
 * The only door to three.js. Nothing imports a 3D module statically: callers run `after3DGate`
 * in an effect and do the `import()` inside its callback, so phones, tablets, reduced motion and
 * Save-Data never download a byte of it.
 */
export const DESKTOP_3D_QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

/**
 * A scene that ran slow costs only that page load; two slow page loads keep every scene a still for
 * the rest of the visit. One slow start (the GPU's first draw on a refresh, a hitch while the page
 * was still loading) used to switch the 3D off for the whole tab: on 18 Nov every refresh got the still.
 * The old "scale:3d-off" flag is no longer read, so a tab that set it gets the 3D back.
 */
const SLOW_KEY = "scale:3d-slow";
const SLOW_LIMIT = 2;

// This page load ran slow: the rest of it stays on stills (counted once per load)
let slowHere = false;

export function mark3DSlow() {
  if (slowHere) return;
  slowHere = true;
  try {
    sessionStorage.setItem(SLOW_KEY, String(Number(sessionStorage.getItem(SLOW_KEY) || 0) + 1));
  } catch {}
}

function was3DSlow() {
  if (slowHere) return true;
  try {
    return Number(sessionStorage.getItem(SLOW_KEY) || 0) >= SLOW_LIMIT;
  } catch {
    return false;
  }
}

export function can3D() {
  if (typeof window === "undefined") return false;
  if (was3DSlow()) return false;
  if (!window.matchMedia(DESKTOP_3D_QUERY).matches) return false;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
  const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
  if (conn?.saveData) return false;
  return typeof WebGL2RenderingContext !== "undefined";
}

/** After the page has loaded and the browser has had a breath, call `yes` on a big screen with a mouse. Returns a cancel function. */
export function after3DGate(yes: () => void, delay = 300) {
  let cancelled = false;
  let idle = 0;
  let timer = 0;
  const run = () => {
    if (!cancelled && can3D()) yes();
  };
  const onLoad = () => {
    timer = window.setTimeout(() => {
      if (typeof window.requestIdleCallback === "function") idle = window.requestIdleCallback(run, { timeout: 800 });
      else run();
    }, delay);
  };
  if (document.readyState === "complete") onLoad();
  else window.addEventListener("load", onLoad, { once: true });
  return () => {
    cancelled = true;
    window.removeEventListener("load", onLoad);
    window.clearTimeout(timer);
    if (idle && typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(idle);
  };
}

/** `?still=desktop|phone` in the URL: scripts/rose-stills.mjs asks the hero for one finished frame. */
export const stillMode = () => {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get("still");
  return v === "desktop" || v === "phone" ? v : null;
};
