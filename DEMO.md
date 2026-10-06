# Ruta · cvetni atelje (Scale by Noon demo)

- Niche: flower shop & same-day delivery (e-commerce)   (Scale by Noon site industry id: `ecommerce`. This industry doesn't exist on scalebynoon.com yet; linking it needs a new industry page or an e-commerce concept category.)
- Market / city: RS – Beograd (Dorćol / Vračar)
- Languages: sr (Latin, at `/`) + en (at `/en`), localized slugs, hreflang, a language switch that keeps the page and the bag
- Live URL: https://ruta-florist-demo.vercel.app
- Repo: https://github.com/dbs-media-demos/ruta-florist-demo (Vercel git-connected, pushes to `main` deploy)
- Folder: DBS Media Portfolio/Demo Websites/florist
- Stack: Next.js 16.3.8, React 19.2.8, Tailwind v4, GSAP 3 (ScrollTrigger, SplitText, Flip), Lenis
- Palette: paper #F6F2EA, linen #ECE5D8, ink (garden green) #17271F, moss #3E5A47, poppy #E0533A / poppy-ink #B23A22, blush #F2CDBE, stone #E9E7E2 (sympathy)   Fonts: Gloock (display), Albert Sans (text), Caveat (handwritten card messages)
- Pages: 142 static routes (71 per language): home, shop, 6 categories, collections index + 6 collections (incl. a calm "Saučešće" page), 36 product pages, bouquet builder, subscriptions, delivery (zone map), weddings & events, for business, flower care, about, reviews, FAQ, contact, gift cards, wishlist, bag, checkout, success, order tracking, privacy, terms, plus a bilingual 404, sitemap, robots, manifest and a dynamic OG image.
- Signature features:
  - Blooming hero: an alstroemeria opens as you scroll (a 48-frame time-lapse on canvas, screen-blended onto the green), then the camera dives into its throat and the page opens onto paper ("za vas.").
  - Homepage as "many worlds", 11 scenes:
    - a route that draws itself with a bike riding it;
    - a draggable bestsellers rail;
    - a pinned horizontal occasions gallery;
    - a 3D flower-of-the-week card stack with flip cards and a sale countdown;
    - a zoom through the "o" of "Dorćol" into the studio;
    - stems that fly in and assemble a bouquet with a live price;
    - a Belgrade delivery-zone map;
    - stacking subscription cards;
    - review marquees;
    - parallax doorstep columns;
    - falling petals.
  - Live "Poruči do 14:00" countdown in the header and on product pages (switches to "Dostava sutra od 9:00" after the cutoff); a delivery date and time window are required before adding fresh flowers.
  - Bouquet builder: size, palette, stems and paper; layered photo cut-outs compose the bouquet with a live price; adds a custom line to the bag.
  - Shop: filters in the URL, GSAP Flip reshuffles, an occasions rail, a draggable category strip, quick view, instant search, wishlist.
  - Product pages:
    - a shared-element morph from the grid card;
    - a sticky buy box with a hover-lens gallery and fullscreen swipe;
    - palette changes that morph the photo;
    - fly-to-cart;
    - a handwritten card that tucks into the bouquet.
  - Checkout:
    - sender vs recipient, a "dostava kao iznenađenje" (surprise) toggle;
    - card (Visa, Mastercard, DinaCard detection, Luhn check, flipping card preview), cash on delivery (only when the buyer is the recipient) and an IPS QR placeholder.
  - Success: the bouquet is wrapped and tied with a ribbon, then a bike rides off with the delivery time.
- Lighthouse (live, mobile): home P 85–90 / A 100 / BP 100 / SEO 69. Product 88–90, category 94, shop index 81–86. Desktop P 98–99. SEO is 69 only because of the intended noindex; it's 100 with `NEXT_PUBLIC_NOINDEX=false` (verified on home, shop, product and FAQ).

## Demo store details
- Promo code: **DOBRODOSLI10** (or **WELCOME10**) gives 10% off. Other codes show a friendly error.
- Test card: **4242 4242 4242 4242**, any future expiry, any 3-digit CVC. Nothing is charged; card data never leaves the card form component (no requests, no storage, no logs) and is wiped after "payment".
- Free delivery in central zones over 6.000 RSD. The English site shows approximate EUR prices.

## How to make it real
All shop data goes through two interfaces in `src/lib/commerce/provider.ts`:
- `CatalogProvider` (build time), demo: `mock-catalog.ts` reading `src/content/products.ts`;
- `CheckoutProvider` (bag maths and order), demo: `mock-checkout.ts`.

For a real Serbian florist, swap these for:
- the shop's catalogue source (CMS/ERP export or Shopify Storefront);
- a local bank card gateway (NestPay / Banca Intesa / Raiffeisen, which take Visa, Mastercard and DinaCard), the bank's NBS IPS QR generator, and courier cash on delivery.

For an international client, Shopify checkout or Stripe Checkout plugs into the same interfaces. The UI doesn't change.

## Portfolio copy
EN title: Ruta · flower studio, Belgrade
EN one-liner (≤ 120 chars): A Belgrade florist where the bouquet blooms as you scroll, and ordering for same-day delivery takes 60 seconds.
EN summary (2–3 sentences): A bilingual e-commerce concept for a Dorćol flower studio. A scroll-scrubbed bloom opens into eleven animated scenes, while the shop stays fast: a live 14:00 cutoff, delivery windows chosen up front, a bouquet builder, a handwritten card that tucks into the bouquet, and a calm Serbian checkout with DinaCard, cash on delivery and IPS QR.
SR title: Ruta · cvetni atelje, Beograd
SR one-liner: Cvećara čiji buket procveta dok skrolujete, a porudžbina za dostavu danas traje 60 sekundi.
SR summary: Dvojezična online prodavnica za cvetni atelje na Dorćolu. Buket koji se otvara pri skrolovanju vodi kroz jedanaest animiranih scena, a kupovina ostaje brza: odbrojavanje do 14:00, termin dostave unapred, slaganje sopstvenog buketa, ručno pisana kartica i mirno plaćanje karticom, DinaCard-om, pouzećem ili IPS QR kodom.

## Screenshots
handoff/desktop-home.png, handoff/desktop-feature.png, handoff/desktop-shop.png, handoff/desktop-product.png, handoff/mobile-home.png, handoff/mobile-product.png, handoff/mobile-checkout.png, handoff/scroll.mp4
