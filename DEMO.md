# Ruta · cvetni atelje (Scale by Noon demo)

- Niche: flower shop & same-day delivery (e-commerce)   (Scale by Noon site industry id: `ecommerce`. This industry doesn't exist on scalebynoon.com yet; linking it needs a new industry page or an e-commerce concept category.)
- Market / city: RS – Beograd (Dorćol / Vračar)
- Languages: sr (Latin, at `/`) + en (at `/en`), localized slugs, hreflang, a language switch that keeps the page and the bag
- Live URL: https://ruta-florist-demo.vercel.app
- Repo: https://github.com/dbs-media-demos/ruta-florist-demo (Vercel git-connected, pushes to `main` deploy)
- Folder: DBS Media Portfolio/Demo Websites/florist
- Stack: Next.js 16.3.8, React 19.2.8, Tailwind v4, GSAP 3 (ScrollTrigger, SplitText, Flip), Lenis, three.js 0.186 (desktop hero only)
- Palette: paper #F6F2EA, linen #ECE5D8, ink (garden green) #17271F, moss #3E5A47, poppy #E0533A / poppy-ink #B23A22, blush #F2CDBE, stone #E9E7E2 (sympathy)   Fonts: Gloock (display), Albert Sans (text), Caveat (handwritten card messages)
- Pages: 142 static routes (71 per language): home, shop, 6 categories, collections index + 6 collections (incl. a calm "Saučešće" page), 36 product pages, bouquet builder, subscriptions, delivery (zone map), weddings & events, for business, flower care, about, reviews, FAQ, contact, gift cards, wishlist, bag, checkout, success, order tracking, privacy, terms, plus a bilingual 404, sitemap, robots, manifest and a dynamic OG image.
- Signature features:
  - 3D rose hero (desktop): a real-time coral garden rose built from primitives (38 petals bent on the GPU, real soft self-shadows, a key light that follows the cursor). It opens a little on its own, then petal by petal as you scroll while the bouquet's day lights up beside it (06:00 market, 09:00 studio, 14:00 last order, 21:00 at the door); the camera dives into its heart and the page opens onto paper ("za vas."). Phones get a still rendered from the same scene and zero bytes of three.js. Why a rose and not a bouquet: one flower opening is the clearest picture of "fresh today", it reads on a shared screen, and real bouquets stay as photos where people buy (the shop and the builder show what will actually arrive).
  - `/v2` (and `/en/v2`): the same homepage without 3D, for a slow laptop or a lead who doesn't want it. On desktop the rose is drawn in canvas 2D, seen from above: a bud that opens on its own in the first 3 s, then petal by petal with the same scroll scene (the day's stops, the dive into its heart, "za vas."), lit from the cursor with soft petal shadows. Zero bytes of three.js at any width; phones get exactly what `/` gives them. Same component tree (`HomeView hero="2d"`), noindex, canonical `/`. This demo has no `/for/[token]` preview route, so there is no `/for/[token]/v2` either.
  - Homepage as "many worlds", 11 scenes after the hero:
    - a route that draws itself with a bike riding it;
    - a draggable bestsellers rail;
    - a pinned horizontal occasions gallery;
    - a 3D flower-of-the-week card stack with flip cards and a sale countdown;
    - a zoom through the "o" of "Dorćol" into the studio;
    - stems that fly in and assemble a bouquet with a live price;
    - a Belgrade delivery-zone map;
    - stacking subscription cards;
    - review marquees (right after the bestsellers; swipeable rows on phones, labelled as sample reviews);
    - parallax doorstep columns;
    - falling petals.
    Scroll scenes run on desktop (big screen + mouse, motion allowed); phones get the same words and photos in a plain stack.
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
- Phone budget (production build, 375 px, 4× CPU, slow 4G; 9 Nov 2026): home LCP 1.4–1.5 s, CLS 0.005, TBT 100–120 ms, JS 268 KB compressed (GSAP is shared by the desktop scenes; the target is 200 KB), 593 KB in total, 0 bytes of three.js, two font files (47 KB).
- Smooth 3D (production build, desktop 1440 px, headless Chrome on the RTX 5070; 9 Nov 2026): the rose appears 0.9 s after three.js starts loading (1.5 s after navigation), with no main-thread task over 50 ms while it warms up, 240 fps in its first 2 s and an 8 ms worst frame scrolling. 4× CPU: appears in 0.5 s, holds 130-135 fps, stays live (smooth, so no fallback); scrolling at 4× is the same with the 3D refused (`NO3D=1`), so the remaining 50-100 ms tasks are the page's own sections mounting, not the rose. 10× CPU: drops to 16 fps, fades back to the still, and the next page stays a still with zero three.js requests. Software WebGL keeps the still.
- Lighthouse (live, mobile, before the 3D pass): home P 85–90 / A 100 / BP 100 / SEO 69. Product 88–90, category 94, shop index 81–86. Desktop P 98–99. SEO is 69 only because of the intended noindex; it's 100 with `NEXT_PUBLIC_NOINDEX=false` (verified on home, shop, product and FAQ).

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
handoff/desktop-home.png, handoff/desktop-hero-scroll.png, handoff/desktop-feature.png, handoff/desktop-shop.png, handoff/desktop-product.png, handoff/mobile-home.png, handoff/mobile-product.png, handoff/mobile-checkout.png, handoff/scroll.mp4 (recorded before the 3D pass: it still shows the old bloom hero)
