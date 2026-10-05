import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { pagePaths, privatePages, detailAlternates, type PageKey } from "@/lib/routes";
import { products } from "@/content/products";
import { categories, collections } from "@/content/taxonomy";
import type { Localized } from "@/lib/i18n";

const SITE_UPDATED = new Date("2026-10-05");

type Entry = { pair: Localized<string>; lastModified: Date; priority: number; changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] };

/** Every public page in both languages with hreflang alternates. Bag/checkout/wishlist/track are left out. */
export default function sitemap(): MetadataRoute.Sitemap {
  const entries: Entry[] = [
    ...(Object.entries(pagePaths) as [PageKey, Localized<string>][])
      .filter(([key]) => !privatePages.includes(key))
      .map(([key, pair]) => ({
        pair,
        lastModified: SITE_UPDATED,
        priority: key === "home" ? 1 : ["shop", "builder", "delivery"].includes(key) ? 0.9 : ["privacy", "terms"].includes(key) ? 0.2 : 0.7,
        changeFrequency: (["home", "shop"].includes(key) ? "daily" : "monthly") as Entry["changeFrequency"],
      })),
    ...categories.map((c) => ({ pair: detailAlternates("category", c.slug), lastModified: SITE_UPDATED, priority: 0.8, changeFrequency: "weekly" as const })),
    ...collections.map((c) => ({ pair: detailAlternates("collection", c.slug), lastModified: SITE_UPDATED, priority: 0.7, changeFrequency: "weekly" as const })),
    ...products.map((p) => ({ pair: detailAlternates("product", p.slug), lastModified: new Date(p.addedAt), priority: 0.8, changeFrequency: "weekly" as const })),
  ];
  return entries.flatMap(({ pair, lastModified, priority, changeFrequency }) =>
    (["sr", "en"] as const).map((locale) => ({
      url: absoluteUrl(pair[locale]),
      lastModified,
      changeFrequency,
      priority: locale === "sr" ? priority : Math.max(0.1, +(priority - 0.1).toFixed(1)),
      alternates: { languages: { sr: absoluteUrl(pair.sr), en: absoluteUrl(pair.en), "x-default": absoluteUrl(pair.sr) } },
    })),
  );
}
