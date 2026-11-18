import type { Locale, Localized } from "./i18n";
import { pagePaths, detailAlternates } from "./routes";
import { products } from "@/content/products";
import { categories, collections } from "@/content/taxonomy";

/** Every page on the site as a pair of language versions. */
export function allPagePairs(): Localized<string>[] {
  return [
    ...Object.values(pagePaths),
    ...categories.map((c) => detailAlternates("category", c.slug)),
    ...collections.map((c) => detailAlternates("collection", c.slug)),
    ...products.map((p) => detailAlternates("product", p.slug)),
  ];
}

/** pathname in `from` locale → the same page in the other locale (language switch). */
export function alternateMap(from: Locale): Record<string, string> {
  const to: Locale = from === "sr" ? "en" : "sr";
  // /v2 (the homepage without 3D) isn't in the sitemap, but its language switch stays on /v2
  const v2: Localized<string> = { sr: "/v2", en: "/en/v2" };
  return Object.fromEntries([...allPagePairs(), v2].map((p) => [p[from], p[to]]));
}
