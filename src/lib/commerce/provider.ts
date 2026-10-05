import type { CartLine, Category, CheckoutDraft, Collection, OrderSummary, Product, ProductLite } from "./types";

/**
 * The two doors between the UI and "the shop". Pages only talk to these interfaces, so a real
 * client swaps the implementations and nothing else:
 *
 *  - Serbia: catalogue from an ERP/CMS export; payments through a local bank card gateway
 *    (e.g. Banca Intesa / Raiffeisen / NestPay, which take Visa, Mastercard and DinaCard),
 *    IPS QR from the bank's NBS-compliant generator, cash on delivery via the courier.
 *  - International: Shopify Storefront API (cart + checkout) or Stripe Checkout.
 *
 * The demo implementations (`mock-catalog.ts`, `mock-checkout.ts`) are static and simulated.
 * Nothing is ever sent anywhere.
 */

/** Server side: read the catalogue at build time (static generation). */
export interface CatalogProvider {
  getProducts(): Product[];
  getProduct(id: string): Product | undefined;
  getCategories(): Category[];
  getCollections(): Collection[];
  toLite(p: Product): ProductLite;
}

export interface PromoResult {
  ok: boolean;
  code?: string;
  percent?: number;
}

export interface ShippingQuote {
  zoneId: string;
  price: number;
  free: boolean;
  /** how much more until free delivery (central zones only) */
  missing: number;
}

export interface TrackingStep {
  id: "placed" | "arranged" | "courier" | "delivered";
  at?: string;
  done: boolean;
}

/** Client side: bag maths and the order. Card data is never passed in here. */
export interface CheckoutProvider {
  validatePromo(code: string): PromoResult;
  quoteShipping(zoneId: string | undefined, subtotal: number): ShippingQuote;
  totals(lines: CartLine[], promo: string | undefined, zoneId: string | undefined): { subtotal: number; discount: number; shipping: ShippingQuote; total: number; vat: number };
  placeOrder(input: { draft: CheckoutDraft; lines: CartLine[]; promo?: string }): Promise<OrderSummary>;
  trackOrder(number: string, email: string): Promise<TrackingStep[] | null>;
}
