"use client";

import { gsap, prefersReducedMotion } from "@/lib/gsap";

/**
 * Fly-to-cart: a copy of the product photo arcs from where it was tapped to the visible bag
 * icon, shrinking into it like a petal blown into a pocket. Resolves when it lands.
 */
export function flyToBag(source: HTMLElement | null | undefined): Promise<void> {
  return new Promise((resolve) => {
    const targets = Array.from(document.querySelectorAll<HTMLElement>("[data-bag-icon]")).filter((el) => el.offsetParent !== null);
    const target = targets[0];
    if (!source || !target || prefersReducedMotion()) return resolve();
    const from = source.getBoundingClientRect();
    const to = target.getBoundingClientRect();
    if (from.width === 0) return resolve();

    const img = source.tagName === "IMG" ? (source as HTMLImageElement) : source.querySelector("img");
    const ghost = document.createElement("div");
    const size = Math.min(from.width, from.height, 220);
    Object.assign(ghost.style, {
      position: "fixed",
      left: `${from.left + from.width / 2 - size / 2}px`,
      top: `${from.top + from.height / 2 - size / 2}px`,
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: "50%",
      backgroundImage: img ? `url("${img.currentSrc || img.src}")` : "none",
      backgroundColor: "#ece5d8",
      backgroundSize: "cover",
      backgroundPosition: "center",
      zIndex: "500",
      pointerEvents: "none",
      boxShadow: "0 18px 40px rgba(15,27,21,0.3)",
    });
    document.body.appendChild(ghost);

    const dx = to.left + to.width / 2 - (from.left + from.width / 2);
    const dy = to.top + to.height / 2 - (from.top + from.height / 2);
    const tl = gsap.timeline({
      onComplete: () => {
        ghost.remove();
        resolve();
      },
    });
    tl.fromTo(ghost, { scale: 0.6, rotation: -8 }, { scale: 1, rotation: 0, duration: 0.25, ease: "back.out(2)" })
      .to(ghost, { x: dx, duration: 0.75, ease: "power2.inOut" }, ">-0.02")
      .to(ghost, { y: dy, duration: 0.75, ease: "back.in(1.3)" }, "<")
      .to(ghost, { scale: 0.08, rotation: 180, duration: 0.75, ease: "power2.in" }, "<")
      .to(ghost, { opacity: 0, duration: 0.15 }, ">-0.12");
  });
}
