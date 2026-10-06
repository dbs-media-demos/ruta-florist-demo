# Ruta · cvetni atelje (Scale by Noon demo)

A fictional flower studio in Dorćol, Belgrade, with same-day delivery across the city. Serbian (Latin) at `/`, English at `/en`. It's an e-commerce concept site built by Scale by Noon; it charges nothing and sends nothing.

- Live: https://ruta-florist-demo.vercel.app
- Stack: Next.js 16 (App Router, Turbopack), React 19.2, Tailwind CSS v4, GSAP 3 (ScrollTrigger, SplitText, Flip), Lenis.

## Run

```bash
npm install
npm run dev -- -p 4251
```

`NEXT_PUBLIC_NOINDEX=false` makes the site indexable (it is `noindex` by default).

## Store architecture (how to make it real)

All shop data and money logic sit behind two small interfaces in `src/lib/commerce/provider.ts`:

| Interface | Demo implementation | What a real client swaps in |
|---|---|---|
| `CatalogProvider` (server, build time) | `mock-catalog.ts` reads `src/content/products.ts` | Shopify Storefront API, a headless CMS, or an ERP/POS export |
| `CheckoutProvider` (client) | `mock-checkout.ts` handles totals, promo, delivery zones and a simulated order | Shopify cart/checkout, Stripe Checkout, or a Serbian bank card gateway (e.g. NestPay / Banca Intesa / Raiffeisen with Visa, Mastercard and DinaCard), an IPS QR generator from the bank, and cash on delivery through the courier |

The UI only imports these interfaces. The bag, wishlist and recently viewed items are small `useSyncExternalStore` stores in `src/lib/commerce/store.ts`, persisted in `localStorage` with every access wrapped in try/catch. Bag lines carry a snapshot of the product, so the cart and checkout never ship the catalogue to the browser.

Card details live only inside `src/components/checkout/CardForm.tsx`: no network requests, no storage, no logging. The form is remounted after payment to wipe them.

## Content and assets

- Catalogue: `src/content/products.ts` (36 products, sizes and palettes, per-variant price and stock, reviews).
- Categories, collections and occasions: `src/content/taxonomy.ts`. Delivery zones and the SVG map shapes: `src/content/zones.ts`.
- Photos: `scripts/fetch-images.py` downloads and grades them (credits are in `public/images/SOURCES.md`). Bouquet-builder cut-outs come from `scripts/cut-stems.py`. The hero bloom is a 48-frame WebP sequence in `public/bloom/`.
