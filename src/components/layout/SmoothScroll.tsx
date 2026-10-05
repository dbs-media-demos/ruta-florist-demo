"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion, isTouch, onIdle } from "@/lib/gsap";

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/** Lenis smooth scrolling driven by GSAP's ticker. Off on touch and reduced motion. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (prefersReducedMotion() || isTouch()) return;
    let lenis: Lenis | null = null;
    let cancelled = false;
    const tick = (time: number) => lenis?.raf(time * 1000);
    const cancelIdle = onIdle(() => {
      import("lenis").then(({ default: LenisCtor }) => {
        if (cancelled) return;
        lenis = new LenisCtor({ lerp: 0.1, wheelMultiplier: 1, anchors: { offset: -110 }, prevent: (node) => !!node.closest?.("[data-lenis-prevent]") });
        window.__lenis = lenis;
        lenis.on("scroll", ScrollTrigger.update);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
      });
    });
    return () => {
      cancelled = true;
      cancelIdle();
      gsap.ticker.remove(tick);
      lenis?.destroy();
      delete window.__lenis;
    };
  }, []);

  useEffect(() => {
    window.__lenis?.scrollTo(0, { immediate: true });
    window.__lenis?.resize();
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 450);
    return () => window.clearTimeout(id);
  }, [pathname]);

  return null;
}

/** Pause/resume page scrolling while a drawer or overlay is open. */
export function lockScroll(lock: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.style.overflow = lock ? "hidden" : "";
  if (lock) window.__lenis?.stop();
  else window.__lenis?.start();
}
