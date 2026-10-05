"use client";

import { useEffect, useRef } from "react";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import type { ProductLite } from "@/lib/commerce/types";
import { getDictionary } from "@/i18n/dictionary";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { ProductCard } from "./ProductCard";

/**
 * Horizontal rail: native scroll + snap on touch, drag-to-scroll with a little inertia on desktop.
 * Cards rise in a staggered wave; `parallax` makes alternate cards drift as the page scrolls.
 */
export function ProductRail({ items, locale, label, parallax, className }: { items: ProductLite[]; locale: Locale; label: string; parallax?: boolean; className?: string }) {
  const d = getDictionary(locale);
  const track = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let down = false;
    let startX = 0;
    let startLeft = 0;
    let moved = 0;
    let v = 0;
    let lastX = 0;
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || (e.target as HTMLElement).closest("button")) return;
      down = true;
      moved = 0;
      startX = lastX = e.clientX;
      startLeft = el.scrollLeft;
      el.style.scrollSnapType = "none";
      gsap.killTweensOf(el);
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      v = e.clientX - lastX;
      lastX = e.clientX;
      el.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      if (!down) return;
      down = false;
      gsap.to(el, { scrollLeft: el.scrollLeft - v * 18, duration: 0.9, ease: "power3.out", onComplete: () => (el.style.scrollSnapType = "") });
    };
    // swallow the click that ends a drag so cards don't open
    const onClick = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    };
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);

  useGSAP(
    () => {
      const el = track.current;
      if (!el || prefersReducedMotion()) return;
      const cards = Array.from(el.children);
      if (el.getBoundingClientRect().top > window.innerHeight * 0.9) {
        gsap.set(cards, { opacity: 0, y: 70, rotate: 2 });
        gsap.to(cards, { opacity: 1, y: 0, rotate: 0, duration: 1.3, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 88%", once: true } });
      }
      if (parallax) {
        cards.forEach((c, i) =>
          gsap.fromTo(c.firstElementChild, { y: i % 2 ? 40 : -10 }, { y: i % 2 ? -30 : 20, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true } }),
        );
      }
    },
    { scope: track },
  );

  const scrollBy = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const step = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 300;
    el.scrollBy({ left: dir * (step + 24) * 2, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  };

  return (
    <div className={clsx("relative", className)}>
      <ul
        ref={track}
        className="no-scrollbar -mx-[var(--gutter)] flex snap-x snap-mandatory gap-5 overflow-x-auto px-[var(--gutter)] pb-4 md:gap-6"
        aria-label={label}
        data-cursor="drag"
        data-cursor-label={d.shop.drag}
      >
        {items.map((p) => (
          <li key={p.id} className="w-[68vw] shrink-0 snap-start sm:w-[40vw] md:w-[28vw] xl:w-[21vw]">
            <ProductCard product={p} locale={locale} sizes="(min-width: 1280px) 21vw, (min-width: 768px) 28vw, 68vw" morph={false} />
          </li>
        ))}
      </ul>
      <div className="mt-6 hidden justify-end gap-2 md:flex">
        <button type="button" onClick={() => scrollBy(-1)} className="grid h-12 w-12 place-items-center rounded-full border border-line hover:border-fg" aria-label={d.product.prev}>
          ←
        </button>
        <button type="button" onClick={() => scrollBy(1)} className="grid h-12 w-12 place-items-center rounded-full border border-line hover:border-fg" aria-label={d.product.next}>
          →
        </button>
      </div>
    </div>
  );
}
