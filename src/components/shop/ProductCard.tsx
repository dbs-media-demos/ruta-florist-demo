"use client";

import { ViewTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";
import type { Locale } from "@/lib/i18n";
import type { ProductLite } from "@/lib/commerce/types";
import { getDictionary } from "@/i18n/dictionary";
import { snapOf, ui } from "@/lib/commerce/store";
import { Price } from "./Price";
import { Heart } from "./Heart";

export const productPath = (locale: Locale, p: { slug: ProductLite["slug"] }) => `${locale === "sr" ? "/proizvod" : "/en/product"}/${p.slug[locale]}`;

export function Badge({ kind, locale, percent }: { kind: ProductLite["badges"][number]; locale: Locale; percent?: number }) {
  const d = getDictionary(locale).badges;
  return (
    <span
      className={clsx(
        "rounded-full px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.08em]",
        kind === "sale" && "bg-poppy-ink text-white",
        kind === "new" && "bg-paper text-ink",
        kind === "bestseller" && "bg-ink text-paper",
        kind === "low" && "bg-blush text-ink",
        kind === "soldout" && "bg-ink/80 text-paper",
      )}
    >
      {kind === "sale" && percent ? `−${percent}%` : d[kind]}
    </span>
  );
}

/** Grid card: photo crossfades to the second shot on hover, morphs into the product hero on click. */
export function ProductCard({ product: p, locale, sizes = "(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw", priority, className, morph = true }: { product: ProductLite; locale: Locale; sizes?: string; priority?: boolean; className?: string; morph?: boolean }) {
  const d = getDictionary(locale);
  const v = p.variants.find((x) => x.id === "m") ?? p.variants[0];
  const from = Math.min(...p.variants.map((x) => x.price));
  const percent = v.compareAt ? Math.round((1 - v.price / v.compareAt) * 100) : undefined;
  const href = productPath(locale, p);
  const photo = (
    <div className="frame aspect-[4/5] rounded-[1.25rem]">
      <Image src={p.images[0]} alt={p.alt[locale]} fill sizes={sizes} preload={priority} className="object-cover transition-[transform,opacity] duration-[1.1s] ease-[var(--ease-out-expo)] group-hover:scale-[1.04] group-hover:opacity-0" />
      {p.images[1] && <Image src={p.images[1]} alt="" fill sizes={sizes} className="scale-[1.08] object-cover opacity-0 transition-[transform,opacity] duration-[1.1s] ease-[var(--ease-out-expo)] group-hover:scale-100 group-hover:opacity-100" />}
    </div>
  );

  return (
    <article className={clsx("group relative", className)} data-card={p.id}>
      <Link href={href} className="block" data-cursor="view" data-cursor-label={locale === "sr" ? "Pogledaj" : "View"} transitionTypes={["to-product"]}>
        {morph ? (
          <ViewTransition name={`p-${p.id}`} share="morph" default="none">
            {photo}
          </ViewTransition>
        ) : (
          photo
        )}
        <div className="mt-3.5 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-serif text-[1.22rem] leading-tight transition-colors group-hover:text-poppy-ink">{p.name[locale]}</h3>
            <Price amount={from} compareAt={p.variants.length === 1 ? v.compareAt : undefined} from={p.variants.length > 1 ? d.product.from : undefined} locale={locale} size="sm" className="mt-1" />
          </div>
          <span className="mt-1 flex shrink-0 items-center gap-1 text-xs text-muted">
            <svg width="12" height="12" viewBox="0 0 20 20" aria-hidden>
              <path d="M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 15l-5.2 2.7 1-5.9L1.5 7.7l5.9-.8Z" fill="var(--poppy)" />
            </svg>
            {p.rating.toFixed(1)}
          </span>
        </div>
      </Link>
      <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
        {p.badges.map((b) => (
          <Badge key={b} kind={b} locale={locale} percent={b === "sale" ? percent : undefined} />
        ))}
      </div>
      <Heart snap={snapOf(p)} locale={locale} className="absolute right-3 top-3" />
      {!p.badges.includes("soldout") && (
        <div className="pointer-events-none absolute inset-x-0 top-0 aspect-[4/5]">
        <button
          type="button"
          onClick={() => ui.openQuick(p)}
          className="pointer-events-auto absolute bottom-3 right-3 flex h-11 items-center gap-2 rounded-full bg-paper/92 px-4 text-sm font-semibold text-ink shadow-[0_8px_24px_-8px_rgba(15,27,21,0.35)] backdrop-blur transition-[transform,opacity,background-color] duration-500 hover:bg-ink hover:text-paper md:translate-y-2 md:opacity-0 md:group-focus-within:translate-y-0 md:group-focus-within:opacity-100 md:group-hover:translate-y-0 md:group-hover:opacity-100"
          aria-label={`${d.product.quickView}: ${p.name[locale]}`}
        >
          <span aria-hidden className="text-base leading-none">+</span>
          <span className="hidden sm:inline">{d.product.quickView}</span>
        </button>
        </div>
      )}
    </article>
  );
}
