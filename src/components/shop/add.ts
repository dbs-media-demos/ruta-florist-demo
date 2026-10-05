"use client";

import type { Locale, Localized } from "@/lib/i18n";
import type { PaletteId, ProductLite } from "@/lib/commerce/types";
import { addLine, ui } from "@/lib/commerce/store";
import { VASE_PRICE } from "@/lib/commerce/mock-checkout";
import { getDictionary } from "@/i18n/dictionary";
import { flyToBag } from "./fly";

/** Add a catalogue product to the bag: snapshot the line, fly the photo, bump the count, open the drawer. */
export async function addProductToBag({
  product,
  variantId,
  palette,
  vase,
  qty = 1,
  source,
  locale,
  openDrawer = true,
}: {
  product: ProductLite;
  variantId: string;
  palette?: PaletteId;
  vase?: boolean;
  qty?: number;
  source?: HTMLElement | null;
  locale: Locale;
  openDrawer?: boolean;
}) {
  const v = product.variants.find((x) => x.id === variantId) ?? product.variants[0];
  const pal = product.palettes?.find((p) => p.id === palette);
  addLine({
    productId: product.id,
    variantId: v.id,
    palette: pal?.id,
    paletteLabel: pal?.label,
    vase,
    qty,
    name: product.name,
    slug: product.slug,
    variantLabel: v.label,
    image: pal ? product.images[pal.image] ?? product.images[0] : product.images[0],
    unit: v.price + (vase ? VASE_PRICE : 0),
    compareAt: v.compareAt,
    maxQty: Math.max(1, Math.min(10, v.stock)),
    needsDelivery: product.needsDelivery,
  });
  ui.announce(getDictionary(locale).bag.added(product.name[locale], v.label[locale]));
  await flyToBag(source);
  ui.bump();
  if (openDrawer) window.setTimeout(ui.openDrawer, 120);
}

/** Custom bouquet from the builder. */
export async function addCustomToBag({
  name,
  price,
  image,
  recipe,
  sizeLabel,
  source,
  locale,
}: {
  name: Localized<string>;
  price: number;
  image: string;
  recipe: Localized<string>[];
  sizeLabel: Localized<string>;
  source?: HTMLElement | null;
  locale: Locale;
}) {
  addLine({
    productId: "custom",
    variantId: "custom",
    qty: 1,
    name,
    slug: { sr: "", en: "" },
    variantLabel: sizeLabel,
    image,
    unit: price,
    maxQty: 5,
    needsDelivery: true,
    recipe,
  });
  ui.announce(getDictionary(locale).bag.added(name[locale], sizeLabel[locale]));
  await flyToBag(source);
  ui.bump();
  window.setTimeout(ui.openDrawer, 120);
}
