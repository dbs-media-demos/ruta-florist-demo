"use client";

import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { ProductLite } from "@/lib/commerce/types";
import { getDictionary } from "@/i18n/dictionary";
import { checkout } from "@/lib/commerce/mock-checkout";
import { bagCount, setCard, useBag } from "@/lib/commerce/store";
import { CardEditor } from "@/components/shop/CardMessage";
import { ProductCard } from "@/components/shop/ProductCard";
import { BagLines, CrossSells, DeliverySummary, FreeShipBar, PromoField, Totals } from "./BagParts";

/** The full bag page: lines, card message, promo and an empty state that leads somewhere good. */
export function CartPage({ locale, checkoutHref, shopHref, suggestions, crossSells }: { locale: Locale; checkoutHref: string; shopHref: string; suggestions: ProductLite[]; crossSells: ProductLite[] }) {
  const d = getDictionary(locale);
  const bag = useBag();
  const count = bagCount(bag);
  const subtotal = checkout.totals(bag.lines, bag.promo, bag.delivery?.zone).subtotal;
  const firstImage = bag.lines.find((l) => l.needsDelivery)?.image ?? bag.lines[0]?.image;

  if (count === 0) {
    return (
      <div className="wrap pb-24">
        <div className="mx-auto max-w-xl py-16 text-center">
          <p className="t-h2">{d.bag.empty}</p>
          <p className="t-lead mt-4">{d.bag.emptyText}</p>
          <Link href={shopHref} className="btn btn-primary mt-8">
            {d.bag.emptyCta} →
          </Link>
        </div>
        <p className="t-eyebrow mt-10 text-muted">{locale === "sr" ? "Za početak" : "To start"}</p>
        <ul className="mt-5 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {suggestions.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} locale={locale} morph={false} />
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="wrap grid gap-12 pb-24 lg:grid-cols-[1.5fr_1fr]">
      <div>
        <FreeShipBar locale={locale} subtotal={subtotal} />
        <div className="mt-6">
          <BagLines locale={locale} large />
        </div>
        {firstImage && (
          <div className="mt-12 rounded-[1.75rem] border border-line p-6 md:p-8">
            <p className="t-h3 mb-6">✉ {d.bag.gift}</p>
            <CardEditor locale={locale} value={bag.card} onSave={setCard} image={firstImage} />
          </div>
        )}
      </div>
      <aside className="lg:sticky lg:top-[calc(var(--header-h)+var(--ribbon-h)+1.5rem)] lg:self-start">
        <div className="space-y-6 rounded-[1.75rem] bg-surface p-6 shadow-[0_20px_60px_-30px_rgba(15,27,21,0.25)] md:p-8">
          <DeliverySummary locale={locale} />
          <PromoField locale={locale} />
          <Totals locale={locale} />
          <Link href={checkoutHref} className="btn btn-accent w-full !min-h-14">
            {d.bag.checkout} →
          </Link>
          <p className="text-center text-xs text-muted">{d.footer.payments}</p>
        </div>
        <div className="mt-8">
          <CrossSells locale={locale} items={crossSells} />
        </div>
      </aside>
    </div>
  );
}
