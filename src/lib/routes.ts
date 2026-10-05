import type { Locale, Localized } from "./i18n";

/** Localized URL paths. Serbian lives at the root with Serbian slugs; English under /en. */
export const pagePaths = {
  home: { sr: "/", en: "/en" },
  shop: { sr: "/prodavnica", en: "/en/shop" },
  collections: { sr: "/kolekcije", en: "/en/collections" },
  builder: { sr: "/napravi-buket", en: "/en/build-a-bouquet" },
  subscriptions: { sr: "/pretplata", en: "/en/subscriptions" },
  delivery: { sr: "/dostava", en: "/en/delivery" },
  weddings: { sr: "/vencanja-i-dogadjaji", en: "/en/weddings-and-events" },
  business: { sr: "/za-firme", en: "/en/for-business" },
  care: { sr: "/nega-cveca", en: "/en/flower-care" },
  about: { sr: "/o-nama", en: "/en/about" },
  reviews: { sr: "/utisci", en: "/en/reviews" },
  faq: { sr: "/cesta-pitanja", en: "/en/faq" },
  contact: { sr: "/kontakt", en: "/en/contact" },
  giftCards: { sr: "/poklon-kartice", en: "/en/gift-cards" },
  wishlist: { sr: "/lista-zelja", en: "/en/wishlist" },
  cart: { sr: "/korpa", en: "/en/cart" },
  checkout: { sr: "/placanje", en: "/en/checkout" },
  success: { sr: "/placanje/uspesno", en: "/en/checkout/success" },
  track: { sr: "/pracenje-porudzbine", en: "/en/track-order" },
  privacy: { sr: "/privatnost", en: "/en/privacy" },
  terms: { sr: "/uslovi-koriscenja", en: "/en/terms" },
} satisfies Record<string, Localized<string>>;

export type PageKey = keyof typeof pagePaths;

/** Pages that never go into the sitemap and are always noindex. */
export const privatePages: PageKey[] = ["wishlist", "cart", "checkout", "success", "track"];

const detailBase = {
  category: { sr: "/prodavnica", en: "/en/shop" },
  collection: { sr: "/kolekcije", en: "/en/collections" },
  product: { sr: "/proizvod", en: "/en/product" },
} satisfies Record<string, Localized<string>>;

export type DetailKey = keyof typeof detailBase;

export const pageHref = (locale: Locale, key: PageKey) => pagePaths[key][locale];

export const detailHref = (locale: Locale, key: DetailKey, slug: Localized<string>) => `${detailBase[key][locale]}/${slug[locale]}`;

export const detailAlternates = (key: DetailKey, slug: Localized<string>): Localized<string> => ({
  sr: detailHref("sr", key, slug),
  en: detailHref("en", key, slug),
});
