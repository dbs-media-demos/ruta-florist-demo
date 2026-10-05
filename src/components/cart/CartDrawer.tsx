"use client";

import { useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { ProductLite } from "@/lib/commerce/types";
import { getDictionary } from "@/i18n/dictionary";
import { checkout } from "@/lib/commerce/mock-checkout";
import { bagCount, setCard, ui, useBag, useUI } from "@/lib/commerce/store";
import { Dialog, CloseButton } from "@/components/ui/Dialog";
import { CardEditor, PaperCard } from "@/components/shop/CardMessage";
import { BagLines, CrossSells, DeliverySummary, FreeShipBar, PromoField, Totals } from "./BagParts";

export function CartDrawer({ locale, crossSells, cartHref, checkoutHref, shopHref }: { locale: Locale; crossSells: ProductLite[]; cartHref: string; checkoutHref: string; shopHref: string }) {
  const d = getDictionary(locale);
  const { drawer } = useUI();
  const bag = useBag();
  const [cardOpen, setCardOpen] = useState(false);
  const count = bagCount(bag);
  const subtotal = checkout.totals(bag.lines, bag.promo, bag.delivery?.zone).subtotal;

  return (
    <Dialog open={drawer} onClose={ui.closeDrawer} label={d.bag.title}>
      <div className="flex items-center justify-between border-b border-line px-6 py-4">
        <p className="t-h3">
          {d.bag.title} <span className="align-top text-sm text-muted">{d.bag.items(count)}</span>
        </p>
        <CloseButton onClick={ui.closeDrawer} label={d.dismiss} />
      </div>

      {count === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
          <svg width="72" height="90" viewBox="0 0 32 40" aria-hidden className="text-sand">
            <path d="M16 12 C 12.6 9.4, 12.4 4.2, 16 2.2 C 19.6 4.2, 19.4 9.4, 16 12 Z" fill="currentColor" className="origin-[16px_12px] animate-[sway_4s_ease-in-out_infinite_alternate]" />
            <path d="M16 14 C 16 22, 12 28, 16 38" stroke="currentColor" strokeWidth="1.4" fill="none" strokeDasharray="0.01 3" strokeLinecap="round" />
          </svg>
          <p className="t-h3 mt-6">{d.bag.empty}</p>
          <p className="mt-2 max-w-xs text-muted">{d.bag.emptyText}</p>
          <Link href={shopHref} onClick={ui.closeDrawer} className="btn btn-primary mt-8">
            {d.bag.emptyCta}
          </Link>
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <FreeShipBar locale={locale} subtotal={subtotal} />
            <DeliverySummary locale={locale} />
            <BagLines locale={locale} onNavigate={ui.closeDrawer} />

            <div className="rounded-2xl border border-line p-4">
              <button type="button" onClick={() => setCardOpen((o) => !o)} className="flex w-full items-center justify-between text-left" aria-expanded={cardOpen}>
                <span className="font-semibold">✉ {bag.card ? d.bag.giftEdit : d.bag.giftAdd}</span>
                <span aria-hidden className={cardOpen ? "rotate-45 transition-transform" : "transition-transform"}>
                  +
                </span>
              </button>
              {!cardOpen && bag.card && <PaperCard text={bag.card.text} from={bag.card.from} className="mt-4 rotate-[-1.5deg] scale-[0.92]" />}
              {cardOpen && (
                <div className="mt-4">
                  <CardEditor
                    locale={locale}
                    compact
                    value={bag.card}
                    onSave={(c) => {
                      setCard(c);
                      window.setTimeout(() => setCardOpen(false), 900);
                    }}
                  />
                </div>
              )}
            </div>

            <CrossSells locale={locale} items={crossSells} />
            <PromoField locale={locale} />
          </div>
          <div className="border-t border-line bg-surface px-6 pb-[calc(1.25rem+env(safe-area-inset-bottom))] pt-4">
            <Totals locale={locale} />
            <div className="mt-4 grid grid-cols-[1fr_1.4fr] gap-2">
              <Link href={cartHref} onClick={ui.closeDrawer} className="btn btn-ghost">
                {d.bag.viewBag}
              </Link>
              <Link href={checkoutHref} onClick={ui.closeDrawer} className="btn btn-accent">
                {d.bag.checkout} →
              </Link>
            </div>
          </div>
        </>
      )}
    </Dialog>
  );
}
