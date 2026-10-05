import type { Localized } from "@/lib/i18n";

/**
 * Store domain types. The UI only ever talks to these shapes (through `provider.ts`), so a real
 * client can swap the mock catalogue for Shopify Storefront, a headless CMS or an ERP export
 * without touching components.
 */

export type CategoryId = "bouquets" | "roses" | "arrangements" | "plants" | "dried" | "addons";
export type CollectionId = "new" | "bestsellers" | "sale" | "under3000" | "sympathy" | "autumn";
export type OccasionId = "birthday" | "anniversary" | "sorry" | "baby" | "love" | "thanks" | "sympathy" | "justBecause";
export type PaletteId = "white" | "blush" | "bright" | "sunny" | "blue" | "green" | "neutral";
export type BadgeId = "new" | "bestseller" | "sale" | "low" | "soldout";

export interface Variant {
  id: string;
  label: Localized<string>;
  /** e.g. "≈ 15 stems" */
  note?: Localized<string>;
  price: number;
  compareAt?: number;
  stock: number;
  sku: string;
}

export interface PaletteOption {
  id: PaletteId;
  label: Localized<string>;
  /** which product image best shows this colourway */
  image: number;
}

export interface Review {
  id: string;
  name: string;
  area: string;
  rating: number;
  date: string;
  text: Localized<string>;
}

export interface Product {
  id: string;
  slug: Localized<string>;
  name: Localized<string>;
  category: CategoryId;
  images: string[];
  alt: Localized<string>;
  short: Localized<string>;
  long: Localized<string>;
  /** what's in it: stems, materials */
  materials: Localized<string>;
  care: Localized<string>;
  /** language of flowers, shown on the back of flip cards */
  meaning: Localized<string>;
  occasions: OccasionId[];
  palette: PaletteId;
  palettes?: PaletteOption[];
  variants: Variant[];
  /** fresh flowers: a delivery date and window must be picked before adding to the bag */
  needsDelivery: boolean;
  isNew?: boolean;
  bestseller?: boolean;
  /** ISO date the sale ends (sale items only) */
  saleEnds?: string;
  rating: number;
  reviewCount: number;
  reviews: Review[];
  addedAt: string;
  featured: number;
  pairsWith: string[];
}

export interface Category {
  id: CategoryId;
  slug: Localized<string>;
  name: Localized<string>;
  title: Localized<string>;
  intro: Localized<string>;
  image: string;
}

export interface Collection {
  id: CollectionId;
  slug: Localized<string>;
  name: Localized<string>;
  intro: Localized<string>;
  image: string;
  /** the sympathy collection is designed calm: no playful motion */
  calm?: boolean;
}

export interface Occasion {
  id: OccasionId;
  name: Localized<string>;
  line: Localized<string>;
  image: string;
}

export interface DeliveryChoice {
  date: string; // yyyy-mm-dd, Europe/Belgrade
  slot: string; // "09-12"
  zone?: string;
}

/** A bag line carries a snapshot of what was added, so client islands never need the catalogue. */
export interface CartLine {
  key: string;
  productId: string;
  variantId: string;
  palette?: PaletteId;
  paletteLabel?: Localized<string>;
  vase?: boolean;
  qty: number;
  name: Localized<string>;
  slug: Localized<string>;
  variantLabel: Localized<string>;
  image: string;
  /** unit price incl. vase */
  unit: number;
  compareAt?: number;
  maxQty: number;
  needsDelivery: boolean;
  /** custom bouquets from the builder carry their recipe */
  recipe?: Localized<string>[];
}

/** The small product shape client islands use (cards, quick view, cross-sells). */
export interface ProductLite {
  id: string;
  slug: Localized<string>;
  name: Localized<string>;
  category: CategoryId;
  images: string[];
  alt: Localized<string>;
  short: Localized<string>;
  variants: Variant[];
  palettes?: PaletteOption[];
  needsDelivery: boolean;
  badges: BadgeId[];
  rating: number;
  reviewCount: number;
  occasions: OccasionId[];
  palette: PaletteId;
  meaning: Localized<string>;
  care: Localized<string>;
  saleEnds?: string;
  addedAt: string;
  featured: number;
}

export interface CardMessage {
  text: string;
  from: string;
}

export interface Address {
  name: string;
  phone: string;
  street: string;
  apartment?: string;
  zone: string;
  notes?: string;
}

export interface CheckoutDraft {
  email: string;
  sender: { name: string; phone: string };
  recipient: Address;
  recipientIsBuyer: boolean;
  surprise: boolean;
  delivery: DeliveryChoice;
  card?: CardMessage;
  payment: "card" | "cod" | "ips";
}

export interface OrderSummary {
  number: string;
  createdAt: string;
  email: string;
  lines: { name: Localized<string>; variant: Localized<string>; qty: number; price: number; image: string }[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  delivery: DeliveryChoice;
  zoneName: string;
  recipientName: string;
  payment: CheckoutDraft["payment"];
  surprise: boolean;
  card?: CardMessage;
}
