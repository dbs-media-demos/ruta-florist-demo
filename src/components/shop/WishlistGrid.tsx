"use client";

import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/i18n/dictionary";
import { toggleWish, ui, useWishlist } from "@/lib/commerce/store";
import { Price } from "./Price";
import { productPath } from "./ProductCard";

/** Saved bouquets (from local storage). */
export function WishlistGrid({ locale, shopHref }: { locale: Locale; shopHref: string }) {
  const d = getDictionary(locale);
  const { items } = useWishlist();
  if (!items.length) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <svg width="56" height="52" viewBox="0 0 24 22" aria-hidden className="mx-auto text-sand">
          <path d="M12 20.5S2 14.4 2 7.6A5.1 5.1 0 0 1 12 5a5.1 5.1 0 0 1 10 2.6c0 6.8-10 12.9-10 12.9Z" fill="currentColor" />
        </svg>
        <p className="t-h3 mt-6">{d.wish.empty}</p>
        <p className="mt-3 text-muted">{d.wish.emptyText}</p>
        <Link href={shopHref} className="btn btn-primary mt-8">
          {d.bag.emptyCta} →
        </Link>
      </div>
    );
  }
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
      {items.map((s) => (
        <li key={s.id} className="group relative">
          <Link href={productPath(locale, s)} className="block">
            <div className="frame relative aspect-[4/5] rounded-[1.25rem]">
              <Image src={s.image} alt="" fill sizes="(min-width: 1280px) 22vw, (min-width: 768px) 30vw, 48vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
            </div>
            <p className="mt-3 font-serif text-xl">{s.name[locale]}</p>
            <Price amount={s.price} compareAt={s.compareAt} locale={locale} size="sm" from={d.product.from} />
          </Link>
          <button
            type="button"
            onClick={() => {
              toggleWish(s);
              ui.announce(d.wish.removed);
            }}
            className="absolute right-3 top-3 grid h-11 w-11 place-items-center rounded-full bg-paper/90 text-lg"
            aria-label={`${d.wish.remove}: ${s.name[locale]}`}
          >
            ×
          </button>
        </li>
      ))}
    </ul>
  );
}
