"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import type { ProductLite } from "@/lib/commerce/types";
import { getDictionary } from "@/i18n/dictionary";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { formatRsd } from "@/lib/format";
import { productPath } from "./ProductCard";

/**
 * "Flowers of the week": a 3D stack you flick through. Drag (or use the arrows) to send the top
 * card to the back; tap "turn" to flip it over for the flower's meaning, care and sale price.
 */
export function CardStack({ items, locale, tone = "light" }: { items: ProductLite[]; locale: Locale; tone?: "light" | "dark" }) {
  const d = getDictionary(locale);
  const [order, setOrder] = useState(() => items.map((_, i) => i));
  const [flipped, setFlipped] = useState(false);
  const [live, setLive] = useState("");
  const topRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const n = items.length;

  const advance = useCallback(
    (dir: 1 | -1) => {
      if (busy.current) return;
      const el = topRef.current;
      const finish = () => {
        setFlipped(false);
        setOrder((o) => (dir === 1 ? [...o.slice(1), o[0]] : [o[o.length - 1], ...o.slice(0, -1)]));
        busy.current = false;
      };
      busy.current = true;
      if (!el || prefersReducedMotion() || dir === -1) return finish();
      gsap.to(el, {
        x: (el.offsetWidth || 300) * 1.3 * (Number(el.dataset.dir) || 1),
        rotation: 18 * (Number(el.dataset.dir) || 1),
        opacity: 0,
        duration: 0.45,
        ease: "power2.in",
        onComplete: () => {
          gsap.set(el, { clearProps: "x,rotation,opacity" });
          el.dataset.dir = "1";
          finish();
        },
      });
    },
    [],
  );

  useEffect(() => {
    const p = items[order[0]];
    // eslint-disable-next-line react-hooks/set-state-in-effect -- announce the new top card
    setLive(`${p.name[locale]}, ${order.indexOf(order[0]) + 1}/${n}`);
  }, [order, items, locale, n]);

  // pointer drag on the top card, with a throw
  useEffect(() => {
    const el = topRef.current;
    if (!el) return;
    let startX = 0;
    let lastX = 0;
    let lastT = 0;
    let v = 0;
    let dragging = false;
    const down = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("button,a")) return;
      dragging = true;
      startX = lastX = e.clientX;
      lastT = performance.now();
      el.setPointerCapture(e.pointerId);
      gsap.killTweensOf(el);
    };
    const move = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      v = (e.clientX - lastX) / Math.max(1, now - lastT);
      lastX = e.clientX;
      lastT = now;
      const dx = e.clientX - startX;
      gsap.set(el, { x: dx, rotation: dx * 0.06 });
    };
    const up = () => {
      if (!dragging) return;
      dragging = false;
      const dx = lastX - startX;
      if (Math.abs(dx) > el.offsetWidth * 0.28 || Math.abs(v) > 0.6) {
        el.dataset.dir = String(Math.sign(dx || v) || 1);
        advance(1);
      } else {
        gsap.to(el, { x: 0, rotation: 0, duration: 0.9, ease: "elastic.out(1, 0.55)" });
      }
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
    };
  }, [order, advance]);

  return (
    <div className="relative" role="region" aria-roledescription="carousel" aria-label={d.shop.weekTitle}>
      <div className="relative mx-auto aspect-[4/5.3] w-[min(78vw,22rem)] [perspective:1400px]" data-cursor="drag" data-cursor-label={d.shop.drag}>
        {order.map((idx, k) => {
          const p = items[idx];
          const v = p.variants.find((x) => x.id === "m") ?? p.variants[0];
          const top = k === 0;
          const pct = v.compareAt ? Math.round((1 - v.price / v.compareAt) * 100) : 0;
          return (
            <div
              key={p.id}
              ref={top ? topRef : undefined}
              aria-hidden={!top}
              inert={!top}
              className={clsx("absolute inset-0 touch-pan-y select-none transition-[transform,opacity] duration-700 ease-[var(--ease-out-expo)]", top && "cursor-grab active:cursor-grabbing")}
              style={{
                zIndex: n - k,
                transform: `translate3d(${k * 10}px, ${k * -14}px, ${-k * 60}px) rotate(${k === 0 ? 0 : (k % 2 ? 1 : -1) * (2 + k * 1.5)}deg)`,
                opacity: k > 3 ? 0 : 1,
              }}
            >
              <div className={clsx("relative h-full w-full transition-transform duration-[900ms] ease-[var(--ease-out-expo)] [transform-style:preserve-3d]", top && flipped && "[transform:rotateY(180deg)]")}>
                {/* front */}
                <div className="absolute inset-0 overflow-hidden rounded-[1.75rem] bg-surface shadow-[0_30px_60px_-30px_rgba(15,27,21,0.5)] [backface-visibility:hidden]">
                  <div className="frame absolute inset-0">
                    <Image src={p.images[0]} alt={top ? p.alt[locale] : ""} fill sizes="22rem" className="pointer-events-none object-cover" draggable={false} />
                  </div>
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/80 via-ink/30 to-transparent p-5 pt-16 text-paper">
                    <p className="font-serif text-2xl leading-tight">{p.name[locale]}</p>
                    <p className="mt-1 text-sm text-paper/80">{p.short[locale]}</p>
                  </div>
                  {pct > 0 && <span className="absolute left-4 top-4 rounded-full bg-poppy-ink px-3 py-1.5 text-xs font-bold text-white">−{pct}%</span>}
                </div>
                {/* back */}
                <div className="theme-ink absolute inset-0 flex flex-col rounded-[1.75rem] p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                  <p className="t-eyebrow text-accent">{d.product.meaning}</p>
                  <p className="t-hand mt-3 text-[1.7rem] leading-snug">{p.meaning[locale]}</p>
                  <p className="t-eyebrow mt-6 text-muted">{d.product.care}</p>
                  <p className="mt-2 text-sm text-paper/85">{p.care[locale]}</p>
                  <div className="mt-auto">
                    <p className="flex items-baseline gap-3">
                      <span className="t-price text-3xl text-poppy-soft">{formatRsd(v.price)}</span>
                      {v.compareAt && <s className="text-paper/60">{formatRsd(v.compareAt)}</s>}
                    </p>
                    <Link href={productPath(locale, p)} tabIndex={top && flipped ? 0 : -1} className="btn btn-accent mt-4 w-full">
                      {d.cta.order} →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className={clsx("mt-8 flex items-center justify-center gap-3", tone === "dark" && "text-paper")}>
        <button type="button" onClick={() => advance(-1)} className="grid h-12 w-12 place-items-center rounded-full border border-line hover:border-fg" aria-label={d.product.prev}>
          ←
        </button>
        <button type="button" onClick={() => setFlipped((f) => !f)} className="btn btn-primary min-w-40" aria-pressed={flipped}>
          ↻ {flipped ? d.shop.flipBack : d.shop.flip}
        </button>
        <button type="button" onClick={() => advance(1)} className="grid h-12 w-12 place-items-center rounded-full border border-line hover:border-fg" aria-label={d.product.next}>
          →
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
    </div>
  );
}

/** Days, hours, minutes and seconds to the end of the sale. */
export function SaleCountdown({ ends, locale, className }: { ends: string; locale: Locale; className?: string }) {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, Math.floor((new Date(ends).getTime() - Date.now()) / 1000)));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [ends]);
  const parts = left === null ? null : [Math.floor(left / 86400), Math.floor((left % 86400) / 3600), Math.floor((left % 3600) / 60), left % 60];
  const labels = locale === "sr" ? ["dana", "sati", "min", "sek"] : ["days", "hrs", "min", "sec"];
  return (
    <div className={clsx("flex gap-2", className)} aria-label={getDictionary(locale).shop.saleEndsIn}>
      {labels.map((l, i) => (
        <div key={l} className="min-w-[4.2rem] rounded-2xl border border-line bg-surface px-3 py-2 text-center">
          <span className="t-price block text-2xl tabular-nums" suppressHydrationWarning>
            {parts ? String(parts[i]).padStart(2, "0") : "––"}
          </span>
          <span className="text-[0.7rem] uppercase tracking-[0.12em] text-muted">{l}</span>
        </div>
      ))}
    </div>
  );
}
