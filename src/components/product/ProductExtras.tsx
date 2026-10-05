"use client";

import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/i18n/dictionary";
import { setCard, useBag, useRecent } from "@/lib/commerce/store";
import { formatRsd } from "@/lib/format";
import { CardEditor } from "@/components/shop/CardMessage";

/** "Recently viewed": snapshots from local storage, minus the current product. */
export function RecentlyViewed({ locale, exclude }: { locale: Locale; exclude?: string }) {
  const d = getDictionary(locale);
  const { items } = useRecent();
  const shown = items.filter((i) => i.id !== exclude).slice(0, 6);
  if (!shown.length) return null;
  return (
    <section className="theme-paper py-16">
      <div className="wrap">
        <p className="t-eyebrow text-muted">{d.product.recent}</p>
        <ul className="no-scrollbar -mx-[var(--gutter)] mt-5 flex gap-4 overflow-x-auto px-[var(--gutter)]">
          {shown.map((s) => (
            <li key={s.id} className="w-36 shrink-0 md:w-44">
              <Link href={`${locale === "sr" ? "/proizvod" : "/en/product"}/${s.slug[locale]}`} className="group block">
                <div className="frame relative aspect-[4/5] rounded-xl">
                  <Image src={s.image} alt="" fill sizes="176px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <p className="mt-2 truncate font-serif">{s.name[locale]}</p>
                <p className="text-xs text-muted">{formatRsd(s.price)}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** The card-message moment on the product page, bound to the bag's card. */
export function ProductCardMoment({ locale, image }: { locale: Locale; image: string }) {
  const bag = useBag();
  return <CardEditor locale={locale} value={bag.card} onSave={setCard} image={image} />;
}
