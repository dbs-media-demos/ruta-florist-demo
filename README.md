# Ruta · cvetni atelje (Scale by Noon demo)

A fictional flower studio in Dorćol, Belgrade, with same-day delivery across the city. Serbian (Latin) at `/`, English at `/en`. It's an e-commerce concept site built by Scale by Noon; it charges nothing and sends nothing.

- Live: https://ruta-florist-demo.vercel.app
- Stack: Next.js 16 (App Router, Turbopack), React 19.2, Tailwind CSS v4, GSAP 3 (ScrollTrigger, SplitText, Flip), Lenis, three.js (desktop hero only).

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
- Photos: `scripts/fetch-images.py` downloads and grades them (credits are in `public/images/SOURCES.md`). Bouquet-builder cut-outs come from `scripts/cut-stems.py`.
- Fonts: Gloock and Albert Sans (OFL, Google Fonts) subset to the characters the site uses, one woff2 each in `src/assets/fonts/`; Caveat (handwriting) comes from `next/font/google` and is not preloaded.

## The 3D hero (desktop only)

A coral garden rose built from primitives in `src/components/fx/RoseScene.ts` (vanilla three.js, no model file): 38 petals on a golden-angle spiral, each the same grid bent on the GPU from one `uOpen` value (an arc for the spine, a cross-section that wraps around the flower's axis so the layers nest, rolled-back edges, a turned-out lip, a little ruffle). The shadow pass bends them the same way, so the petals shade each other with real soft shadows; a warm key light that follows the cursor, a rim light and thin-petal translucency do the rest. Scroll opens it petal by petal, turns it, lights up the bouquet's day beside it (06:00 market to 21:00 at the door), then the camera dives into its heart and the page opens onto paper. Renders on demand and stops off screen.

- The server HTML has the heading, buttons, rating, phone number and a still of the rose (`public/hero/`), visible at once. `src/lib/three-gate.ts` is the only door to three.js: after load it checks `(min-width: 1024px) and (hover: hover) and (pointer: fine)`, no reduced motion, no Save-Data, and only then `import()`s the scene; the canvas fades in over the still, which stays as the fallback.
- Phones and tablets get the still and zero bytes of three.js; scroll scenes elsewhere on the page are desktop-only too (`DESK_MOTION` in `src/lib/gsap.ts`), and phones get the finished state with one small CSS fade-and-rise per heading.
- Stills are rendered from the same scene: `npm run build && node scripts/with-server.mjs node scripts/rose-stills.mjs`.
- Phone budget on the production build: `node scripts/with-server.mjs node scripts/phone-budget.mjs / 375` (LCP, CLS, TBT, JS, bytes, three.js bytes). Deferred home sections hold measured heights (`src/components/ui/Later.tsx`); re-measure with `scripts/section-heights.mjs` after changing a section's phone layout.
- `with-server.mjs` runs `next start` on `PORT` (default 4261) and refuses a port another demo is already using.
