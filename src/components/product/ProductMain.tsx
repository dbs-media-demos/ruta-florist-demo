"use client";

import { ViewTransition, useEffect, useRef, useState, type ReactNode } from "react";
import Image from "next/image";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import type { ProductLite } from "@/lib/commerce/types";
import { getDictionary } from "@/i18n/dictionary";
import { pushRecent, snapOf, useBag } from "@/lib/commerce/store";
import { formatRsd } from "@/lib/format";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { BuyBox } from "@/components/shop/BuyBox";
import { Heart } from "@/components/shop/Heart";
import { Badge } from "@/components/shop/ProductCard";
import { Dialog, CloseButton } from "@/components/ui/Dialog";

/** Hover lens: the photo magnifies under the pointer (desktop, fine pointers only). */
function Lens({ src, alt, sizes, priority }: { src: string; alt: string; sizes: string; priority?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);
  const [pos, setPos] = useState({ x: 50, y: 50 });
  return (
    <div
      ref={ref}
      className="frame relative aspect-[4/5] rounded-[1.5rem] md:cursor-zoom-in"
      onPointerEnter={(e) => e.pointerType === "mouse" && setOn(true)}
      onPointerLeave={() => setOn(false)}
      onPointerMove={(e) => {
        if (e.pointerType !== "mouse" || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        setPos({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
      }}
    >
      <Image src={src} alt={alt} fill sizes={sizes} preload={priority} className="object-cover transition-transform duration-300 ease-out" style={on ? { transform: "scale(2)", transformOrigin: `${pos.x}% ${pos.y}%` } : undefined} />
    </div>
  );
}

export function ProductMain({ product: p, locale, title, rating, children }: { product: ProductLite & { allImages: string[] }; locale: Locale; title: ReactNode; rating: ReactNode; children: ReactNode }) {
  const d = getDictionary(locale);
  const images = p.allImages;
  const [hero, setHero] = useState(0);
  const [viewer, setViewer] = useState<number | null>(null);
  const [showBar, setShowBar] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const addId = `add-${p.id}`;
  const bag = useBag();
  const v = p.variants.find((x) => x.id === "m" && x.stock > 0) ?? p.variants.find((x) => x.stock > 0) ?? p.variants[0];
  const soldOut = p.variants.every((x) => x.stock === 0);

  useEffect(() => {
    pushRecent(snapOf(p));
  }, [p]);

  // sticky add bar on phones once the main button scrolls away
  useEffect(() => {
    const btn = document.getElementById(addId);
    if (!btn) return;
    const io = new IntersectionObserver(([e]) => setShowBar(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(btn);
    return () => io.disconnect();
  }, [addId, bag.delivery]);

  const morphTo = (i: number) => {
    if (i === hero) return;
    const el = heroRef.current;
    if (!el || prefersReducedMotion()) return setHero(i);
    gsap.to(el, {
      clipPath: "inset(8% 8% 8% 8% round 2.5rem)",
      scale: 0.96,
      duration: 0.35,
      ease: "power2.in",
      onComplete: () => {
        setHero(i);
        gsap.fromTo(el, { clipPath: "inset(8% 8% 8% 8% round 2.5rem)", scale: 0.96 }, { clipPath: "inset(0% 0% 0% 0% round 1.5rem)", scale: 1, duration: 0.8, ease: "expo.out", clearProps: "clipPath,transform" });
      },
    });
  };

  return (
    <div className="grid gap-10 md:grid-cols-[1.15fr_1fr] lg:gap-16">
      {/* gallery: one list. Phones swipe it sideways; desktop stacks it while the buy box stays */}
      <div className="relative">
        <ul className="no-scrollbar -mx-[var(--gutter)] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] md:mx-0 md:grid md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0">
          {[hero, ...images.map((_, i) => i).filter((i) => i !== hero)].map((i, k) => (
            <li key={images[i]} className={clsx("w-[86vw] shrink-0 snap-center md:w-auto", k === 0 && "md:col-span-2")}>
              {k === 0 ? (
                <ViewTransition name={`p-${p.id}`} share="morph" default="none">
                  <div ref={heroRef} role="button" tabIndex={0} aria-label={d.product.zoom} onClick={() => setViewer(i)} onKeyDown={(e) => e.key === "Enter" && setViewer(i)}>
                    <Lens src={images[i]} alt={p.alt[locale]} sizes="(min-width: 768px) 52vw, 86vw" priority />
                  </div>
                </ViewTransition>
              ) : (
                <button type="button" onClick={() => setViewer(i)} className="block w-full" aria-label={`${d.product.zoom}: ${d.product.photo(k + 1, images.length)}`}>
                  <div className="frame relative aspect-[4/5] rounded-[1.25rem]">
                    <Image src={images[i]} alt="" fill sizes="(min-width: 768px) 26vw, 86vw" className="object-cover transition-transform duration-700 hover:scale-105" />
                  </div>
                </button>
              )}
            </li>
          ))}
        </ul>
        <div className="pointer-events-none absolute left-4 top-4 flex gap-1.5 md:left-4">
          {p.badges.map((b) => (
            <Badge key={b} kind={b} locale={locale} />
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-muted md:hidden">
          {images.length} {locale === "sr" ? "fotografije · prevucite" : "photos · swipe"}
        </p>
      </div>

      {/* buy column */}
      <div className="md:sticky md:top-[calc(var(--header-h)+var(--ribbon-h)+1.5rem)] md:self-start">
        <div className="flex items-start justify-between gap-4">
          <div>{title}</div>
          <Heart snap={snapOf(p)} locale={locale} className="!bg-surface-2 shrink-0" />
        </div>
        {rating}
        <p className="t-lead mt-4">{p.short[locale]}</p>
        <div className="mt-7">
          <BuyBox product={p} locale={locale} addId={addId} getSource={() => heroRef.current} onPalette={(i) => morphTo(Math.min(i, images.length - 1))} />
        </div>
        <div className="mt-8">{children}</div>
      </div>

      {/* mobile sticky add bar */}
      {!soldOut && (
        <div className={clsx("fixed inset-x-0 bottom-0 z-[170] border-t border-ink/10 bg-paper/95 px-4 pb-[calc(0.7rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl transition-transform duration-500 md:hidden", showBar ? "translate-y-0" : "translate-y-full")} aria-hidden={!showBar}>
          <div className="flex items-center gap-3">
            <div className="frame relative h-12 w-10 shrink-0 rounded-lg">
              <Image src={images[hero]} alt="" fill sizes="40px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-serif">{p.name[locale]}</p>
              <p className="t-price text-sm">{formatRsd(v.price)}</p>
            </div>
            <button type="button" tabIndex={showBar ? 0 : -1} onClick={() => document.getElementById(addId)?.click()} className="btn btn-accent !min-h-12 !px-5">
              {d.product.add}
            </button>
          </div>
        </div>
      )}

      <Dialog open={viewer !== null} onClose={() => setViewer(null)} label={p.name[locale]} variant="modal" className="!bg-ink-2">
        <div className="relative h-[88vh] md:h-[84vh]">
          <CloseButton onClick={() => setViewer(null)} label={d.product.close} className="absolute right-4 top-4 z-10 bg-paper" />
          <ul className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto" ref={(el) => {
            if (el && viewer !== null) el.scrollLeft = el.clientWidth * viewer;
          }}>
            {images.map((src, i) => (
              <li key={src} className="relative h-full w-full shrink-0 snap-center [touch-action:pan-x_pinch-zoom]">
                <Image src={src} alt={i === 0 ? p.alt[locale] : ""} fill sizes="100vw" className="object-contain" />
              </li>
            ))}
          </ul>
        </div>
      </Dialog>
    </div>
  );
}
