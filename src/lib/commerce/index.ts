/**
 * Server-side entry: the active catalogue. Client islands import `checkout` from
 * `./mock-checkout` directly so the catalogue never ships to the browser.
 * To go live, replace `catalog` / `checkout` with real implementations of the interfaces in
 * `provider.ts` (Shopify Storefront, Stripe, or a Serbian bank gateway + IPS QR).
 */
export { catalog } from "./mock-catalog";
export type * from "./types";
export type * from "./provider";
