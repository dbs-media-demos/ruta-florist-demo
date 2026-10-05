import type { Locale } from "@/lib/i18n";
import type { Product } from "@/lib/commerce/types";
import { getDictionary } from "@/i18n/dictionary";
import { catalog } from "@/lib/commerce";
import { detailHref, pageHref } from "@/lib/routes";
import { categoryById } from "@/content/taxonomy";
import { products } from "@/content/products";
import { graph, productSchema } from "@/lib/schema";
import { formatDate } from "@/lib/format";
import { JsonLd } from "@/components/seo/JsonLd";
import { Accordion, Breadcrumbs } from "@/components/sections/PageParts";
import { Stars } from "@/components/sections/ReviewsWall";
import { ProductMain } from "@/components/product/ProductMain";
import { ProductCardMoment, RecentlyViewed } from "@/components/product/ProductExtras";
import { ProductRail } from "@/components/shop/ProductRail";
import { CutoffLine } from "@/components/layout/Countdown";
import { SectionHead } from "@/components/sections/PageParts";

export function ProductView({ product: p, locale }: { product: Product; locale: Locale }) {
  const d = getDictionary(locale);
  const sr = locale === "sr";
  const cat = categoryById(p.category);
  const url = detailHref(locale, "product", p.slug);
  const lite = { ...catalog.toLite(p), allImages: p.images };
  const pairs = p.pairsWith.map((id) => products.find((x) => x.id === id)).filter(Boolean).map((x) => catalog.toLite(x!));
  const more = products.filter((x) => x.category === p.category && x.id !== p.id && !p.pairsWith.includes(x.id)).slice(0, 4).map(catalog.toLite);
  const breakdown = [5, 4, 3, 2, 1].map((s) => ({ s, n: p.reviews.filter((r) => r.rating === s).length }));
  const fresh = p.needsDelivery;

  return (
    <>
      <JsonLd data={graph(productSchema(p, locale, url))} />
      <section className="theme-paper pb-16 pt-6 md:pb-24 md:pt-10">
        <div className="wrap">
          <Breadcrumbs
            locale={locale}
            className="mb-8"
            items={[
              { name: d.nav.home, url: pageHref(locale, "home") },
              { name: d.nav.shop, url: pageHref(locale, "shop") },
              { name: cat.name[locale], url: detailHref(locale, "category", cat.slug) },
              { name: p.name[locale], url },
            ]}
          />
          <ProductMain
            product={lite}
            locale={locale}
            title={
              <>
                <p className="t-eyebrow text-accent">{cat.name[locale]}</p>
                <h1 className="t-h1 mt-3 !text-[clamp(2.6rem,5vw,4.6rem)]">{p.name[locale]}</h1>
              </>
            }
            rating={
              <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-sm">
                <Stars n={Math.round(p.rating)} />
                <span className="font-semibold">{p.rating.toFixed(1)}</span>
                <span className="link-u text-muted">({p.reviewCount})</span>
              </a>
            }
          >
            <Accordion
              items={[
                { q: d.product.details, a: <p>{p.long[locale]}</p> },
                { q: d.product.materials, a: <p>{p.materials[locale]}</p> },
                { q: d.product.care, a: <p>{p.care[locale]}</p> },
                {
                  q: d.product.shipping,
                  a: (
                    <div className="space-y-2">
                      <p>{d.product.shippingText}</p>
                      <p className="text-sm">
                        <CutoffLine locale={locale} />
                      </p>
                    </div>
                  ),
                },
              ]}
            />
            <p className="mt-4 text-xs text-muted">
              {d.product.sku}: {p.variants[0].sku}
            </p>
          </ProductMain>
        </div>
      </section>

      {fresh && (
        <section className="theme-linen py-20 md:py-28" id="card">
          <div className="wrap">
            <SectionHead eyebrow={d.product.cardMoment} title={sr ? "Napišite karticu. Mi je ušuškamo u buket." : "Write the card. We'll tuck it into the bouquet."} text={sr ? "Pišemo je rukom, mastilom, na pamučnom papiru. Kartica je besplatna uz svako cveće." : "We handwrite it in ink on cotton paper. The card is free with every order."} />
            <div className="mt-12">
              <ProductCardMoment locale={locale} image={p.images[0]} />
            </div>
          </div>
        </section>
      )}

      <section id="reviews" className="theme-paper scroll-mt-32 py-20 md:py-28">
        <div className="wrap grid gap-12 md:grid-cols-[1fr_2fr]">
          <div>
            <h2 className="t-h2">{d.product.reviews}</h2>
            <p className="mt-6 flex items-baseline gap-3">
              <span className="font-serif text-6xl">{p.rating.toFixed(1)}</span>
              <Stars n={Math.round(p.rating)} size={18} />
            </p>
            <p className="mt-1 text-sm text-muted">{d.product.basedOn(p.reviewCount)}</p>
            <dl className="mt-6 space-y-2">
              {breakdown.map(({ s }) => {
                const share = s === 5 ? 0.86 : s === 4 ? 0.11 : s === 3 ? 0.03 : 0;
                return (
                  <div key={s} className="flex items-center gap-3 text-sm">
                    <dt className="w-8 tabular-nums">{s} ★</dt>
                    <dd className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                      <span className="block h-full rounded-full bg-[#f4b400]" style={{ width: `${share * 100}%` }} />
                    </dd>
                    <dd className="w-8 text-right tabular-nums text-muted">{Math.round(share * p.reviewCount)}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2">
            {p.reviews.map((r) => (
              <li key={r.id} className="rounded-[1.25rem] border border-line bg-surface p-5">
                <Stars n={r.rating} />
                <p className="mt-3">“{r.text[locale]}”</p>
                <p className="mt-4 text-sm">
                  <span className="font-semibold">{r.name}</span>
                  <span className="text-muted">
                    {" "}
                    · {r.area} · {formatDate(new Date(r.date), locale, { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </p>
                <p className="mt-1 text-xs text-moss">✓ {sr ? "Potvrđena kupovina" : "Verified purchase"}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="theme-blush overflow-hidden py-20 md:py-28">
        <div className="wrap">
          <SectionHead eyebrow={d.product.pairs} title={sr ? "Uz ovo lepo ide" : "Pairs well with"} />
          <ProductRail items={[...pairs, ...more]} locale={locale} label={d.product.pairs} parallax className="mt-10" />
        </div>
      </section>

      <RecentlyViewed locale={locale} exclude={p.id} />
    </>
  );
}
