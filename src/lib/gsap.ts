"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  gsap.defaults({ ease: "expo.out", duration: 1.1 });
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export const isTouch = () => typeof window !== "undefined" && window.matchMedia("(hover: none), (pointer: coarse)").matches;

export { gsap, ScrollTrigger, useGSAP };

/** SplitText is only needed below the fold; load it on demand. */
export async function loadSplitText() {
  const { SplitText } = await import("gsap/SplitText");
  gsap.registerPlugin(SplitText);
  return SplitText;
}

/** Flip powers the filter reshuffles; loaded when a grid first changes. */
export async function loadFlip() {
  const { Flip } = await import("gsap/Flip");
  gsap.registerPlugin(Flip);
  return Flip;
}

export async function loadDraggable() {
  const [{ Draggable }, { InertiaPlugin }] = await Promise.all([import("gsap/Draggable"), import("gsap/InertiaPlugin")]);
  gsap.registerPlugin(Draggable, InertiaPlugin);
  return Draggable;
}

/** Run a setup when the browser is idle (keeps scroll scenes off the critical path). */
export function onIdle(cb: () => void, timeout = 1200) {
  if (typeof window === "undefined") return () => {};
  const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number; cancelIdleCallback?: (id: number) => void };
  if (w.requestIdleCallback) {
    const id = w.requestIdleCallback(cb, { timeout });
    return () => w.cancelIdleCallback?.(id);
  }
  const id = window.setTimeout(cb, 200);
  return () => window.clearTimeout(id);
}
