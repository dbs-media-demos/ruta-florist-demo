import { badgesFor, products, productById } from "@/content/products";
import { categories, collections } from "@/content/taxonomy";
import type { CatalogProvider } from "./provider";

/** Demo catalogue: the typed file in src/content. Swap for Shopify Storefront / an ERP feed. */
export const catalog: CatalogProvider = {
  getProducts: () => products,
  getProduct: (id) => productById(id),
  getCategories: () => categories,
  getCollections: () => collections,
  toLite: (p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    images: p.images.slice(0, 2),
    alt: p.alt,
    short: p.short,
    variants: p.variants,
    palettes: p.palettes,
    needsDelivery: p.needsDelivery,
    badges: badgesFor(p),
    rating: p.rating,
    reviewCount: p.reviewCount,
    occasions: p.occasions,
    palette: p.palette,
    meaning: p.meaning,
    care: p.care,
    saleEnds: p.saleEnds,
    addedAt: p.addedAt,
    featured: p.featured,
  }),
};
