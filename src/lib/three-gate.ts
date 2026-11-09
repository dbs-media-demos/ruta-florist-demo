"use client";

/**
 * The only door to three.js. Nothing imports a 3D module statically: callers run `after3DGate`
 * in an effect and do the `import()` inside its callback, so phones, tablets, reduced motion and
 * Save-Data never download a byte of it.
 */
export const DESKTOP_3D_QUERY = "(min-width: 1024px) and (hover: hover) and (pointer: fine)";

export function can3D() {
  if (typeof window === "undefined") return false;
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
