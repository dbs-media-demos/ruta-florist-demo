"use client";

import dynamic from "next/dynamic";
import type { Locale } from "@/lib/i18n";
import type { ProductLite } from "@/lib/commerce/types";
import type { SearchItem } from "@/components/shop/SearchOverlay";

// The bag drawer, search and quick view are only needed after the first interaction:
// load them off the critical path so the page paints and hydrates sooner.
const CartDrawer = dynamic(() => import("@/components/cart/CartDrawer").then((m) => m.CartDrawer), { ssr: false });
const SearchOverlay = dynamic(() => import("@/components/shop/SearchOverlay").then((m) => m.SearchOverlay), { ssr: false });
const QuickView = dynamic(() => import("@/components/shop/QuickView").then((m) => m.QuickView), { ssr: false });

export function Overlays({ locale, crossSells, searchItems, cartHref, checkoutHref, shopHref }: { locale: Locale; crossSells: ProductLite[]; searchItems: SearchItem[]; cartHref: string; checkoutHref: string; shopHref: string }) {
  return (
    <>
      <CartDrawer locale={locale} crossSells={crossSells} cartHref={cartHref} checkoutHref={checkoutHref} shopHref={shopHref} />
      <SearchOverlay locale={locale} items={searchItems} />
      <QuickView locale={locale} />
    </>
  );
}
