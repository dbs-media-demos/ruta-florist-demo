"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap, isTouch, prefersReducedMotion } from "@/lib/gsap";

/**
 * Desktop cursor: a small ink dot that grows into a labelled petal over product cards
 * ([data-cursor="view"]) and rails ([data-cursor="drag"]). Label text comes from data-cursor-label.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = dot.current;
    if (!el || isTouch() || prefersReducedMotion()) return;
    el.style.display = "grid";
    const xTo = gsap.quickTo(el, "x", { duration: 0.35, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.35, ease: "power3" });
    let mode = "";
    const move = (e: PointerEvent) => {
      xTo(e.clientX);
      yTo(e.clientY);
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-cursor]");
      const next = target?.dataset.cursor ?? "";
      if (next !== mode) {
        mode = next;
        if (label.current) label.current.textContent = target?.dataset.cursorLabel ?? "";
        gsap.to(el, { scale: next ? 1 : 0.18, duration: 0.45, ease: "expo.out" });
        el.dataset.mode = next;
      }
    };
    const leave = () => gsap.to(el, { autoAlpha: 0, duration: 0.2 });
    const enter = () => gsap.to(el, { autoAlpha: 1, duration: 0.2 });
    gsap.set(el, { scale: 0.18, xPercent: -50, yPercent: -50 });
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    document.documentElement.addEventListener("pointerenter", enter);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.removeEventListener("pointerenter", enter);
    };
  }, []);

  useEffect(() => {
    if (dot.current) {
      dot.current.dataset.mode = "";
      gsap.to(dot.current, { scale: 0.18, duration: 0.3 });
    }
  }, [pathname]);

  return (
    <div
      ref={dot}
      aria-hidden
      style={{ display: "none" }}
      className="pointer-events-none fixed left-0 top-0 z-[400] h-[5.2rem] w-[5.2rem] place-items-center rounded-full bg-ink text-paper mix-blend-normal shadow-[0_8px_30px_rgba(15,27,21,0.25)] data-[mode=drag]:bg-poppy-ink"
    >
      <span ref={label} className="text-[0.68rem] font-semibold uppercase tracking-[0.16em]" />
    </div>
  );
}
