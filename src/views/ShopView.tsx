import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import type { Category, Collection, Product } from "@/lib/commerce/types";
import { getDictionary } from "@/i18n/dictionary";
import { catalog } from "@/lib/commerce";
import { detailHref, pageHref } from "@/lib/routes";
import { collectionMembers } from "@/content/products";
import { occasions } from "@/content/taxonomy";
import { graph, itemListSchema } from "@/lib/schema";
import { JsonLd } from "@/components/seo/JsonLd";
import { PageHero, type Crumb } from "@/components/sections/PageParts";
import { ShopGrid, ShopGridStatic } from "@/components/shop/ShopGrid";
import { CardStack, SaleCountdown } from "@/components/shop/CardStack";
import { Reveal, SplitReveal } from "@/components/ui/Reveal";

export function Marquee({ items, tone = "ink" }: { items: string[]; tone?: "ink" | "poppy" }) {
  const row = [...items, ...items, ...items];
  return (
    <div className={tone === "ink" ? "bg-ink text-paper" : "bg-poppy-ink text-white"}>
      <p className="sr-only">{items.join(" · ")}</p>
      <div className="marquee-wrap overflow-hidden py-4">
        <ul className="marquee items-center" style={{ ["--marquee-d" as string]: "40s" }} aria-hidden>
          {[...row, ...row].map((t, i) => (
            <li key={i} className="flex shrink-0 items-center gap-6 pr-6 font-serif text-xl md:text-2xl">
              {t}
              <span className="text-poppy-soft">✿</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

type Mode = { kind: "all" } | { kind: "category"; category: Category } | { kind: "collection"; collection: Collection };

export function ShopView({ locale, mode }: { locale: Locale; mode: Mode }) {
  const d = getDictionary(locale);
  const sr = locale === "sr";
  const all = catalog.getProducts();
  let products: Product[] = all;
  let title = d.shop.title;
  let intro = sr ? "Sve što je danas u ateljeu: buketi, ruže, korpe, biljke i suvo cveće. Svaki komad vezujemo rukom na dan dostave." : "Everything in the studio today: bouquets, roses, baskets, plants and dried flowers. Every piece is tied by hand on delivery day.";
  let eyebrow = sr ? "Dostava danas širom Beograda" : "Same-day delivery across Belgrade";
  let image: string | undefined = "/images/studio/florist-basket-floor.jpg";
  const crumbs: Crumb[] = [
    { name: d.nav.home, url: pageHref(locale, "home") },
    { name: d.nav.shop, url: pageHref(locale, "shop") },
  ];
  let calm = false;
  let showSale = false;

  if (mode.kind === "category") {
    const c = mode.category;
    products = all.filter((p) => p.category === c.id);
    title = c.title[locale];
    intro = c.intro[locale];
    eyebrow = c.name[locale];
    image = c.image;
    crumbs.push({ name: c.name[locale], url: detailHref(locale, "category", c.slug) });
  } else if (mode.kind === "collection") {
    const c = mode.collection;
    products = all.filter(collectionMembers[c.id]);
    title = c.name[locale];
    intro = c.intro[locale];
    eyebrow = d.nav.collections;
    image = c.image;
    calm = !!c.calm;
    showSale = c.id === "sale";
    crumbs.splice(1, 1, { name: d.nav.collections, url: pageHref(locale, "collections") });
    crumbs.push({ name: c.name[locale], url: detailHref(locale, "collection", c.slug) });
  } else {
    showSale = true;
  }

  const lite = products.map(catalog.toLite);
  const sale = all.filter((p) => p.variants.some((v) => v.compareAt)).map(catalog.toLite);
  const saleEnds = all.find((p) => p.saleEnds)?.saleEnds ?? "2026-10-12T23:59:00+02:00";
  const cats = catalog.getCategories().map((c) => ({ id: c.id, name: c.name[locale], href: detailHref(locale, "category", c.slug), image: c.image }));
  const occ = occasions.map((o) => ({ id: o.id, name: o.name[locale], image: o.image }));

  return (
    <>
      <JsonLd data={graph(itemListSchema(title, products.map((p) => ({ name: p.name[locale], url: detailHref(locale, "product", p.slug), image: p.images[0] }))))} />
      <PageHero locale={locale} crumbs={crumbs} eyebrow={eyebrow} title={title} intro={intro} image={image} tone={calm ? "calm" : "paper"} imageOnPhones={false} />

      {mode.kind === "all" && (
        <section className="theme-paper pb-12">
          <div className="wrap">
            <ul className="no-scrollbar -mx-[var(--gutter)] flex snap-x gap-4 overflow-x-auto px-[var(--gutter)] pb-2" data-cursor="drag" data-cursor-label={d.shop.drag} aria-label={d.shop.category}>
              {cats.map((c, i) => (
                <li key={c.id} className="w-[30vw] shrink-0 snap-start sm:w-[24vw] md:w-[17vw]">
                  <Link href={c.href} className="group block">
                    <div className="frame relative aspect-[3/4] rounded-[1.25rem]">
                      <Image src={c.image} alt="" fill preload={i < 2} sizes="(min-width: 768px) 17vw, 30vw" className="object-cover transition-transform duration-[1.2s] ease-[var(--ease-out-expo)] group-hover:scale-110" />
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-3 pt-10 font-serif text-base text-paper md:p-4 md:text-xl">{c.name}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {showSale && (
        <>
          <Marquee items={d.shop.marquee} />
          <section className="theme-blush overflow-hidden py-20 md:py-28">
            <div className="wrap grid items-center gap-14 md:grid-cols-[1fr_1.1fr]">
              <div>
                <p className="t-eyebrow text-accent">{d.shop.saleTitle}</p>
                <SplitReveal className="t-h2 mt-4">{d.shop.weekTitle}</SplitReveal>
                <p className="t-lead mt-5 max-w-md">{d.shop.weekText}</p>
                <p className="t-eyebrow mt-8 text-muted">{d.shop.saleEndsIn}</p>
                <SaleCountdown ends={saleEnds} locale={locale} className="mt-3" />
              </div>
              <Reveal>
                <CardStack items={sale} locale={locale} />
              </Reveal>
            </div>
          </section>
        </>
      )}

      <section className={`${calm ? "theme-calm" : "theme-paper"} py-14 md:py-20`}>
        <Suspense fallback={<ShopGridStatic items={lite} locale={locale} />}>
          <ShopGrid items={lite} locale={locale} categories={cats} occasions={occ} showCategories={mode.kind === "all"} calm={calm} />
        </Suspense>
      </section>
    </>
  );
}

/** /kolekcije: the collections as big editorial tiles. */
export function CollectionsIndexView({ locale }: { locale: Locale }) {
  const d = getDictionary(locale);
  const sr = locale === "sr";
  const cols = catalog.getCollections();
  const roses = catalog.getCategories().find((c) => c.id === "roses")!;
  return (
    <>
      <PageHero
        locale={locale}
        crumbs={[
          { name: d.nav.home, url: pageHref(locale, "home") },
          { name: d.nav.collections, url: pageHref(locale, "collections") },
        ]}
        eyebrow={sr ? "Kurirani izbor" : "Curated edits"}
        title={d.nav.collections}
        intro={sr ? "Kratki izbori za brze odluke: šta je novo, šta je na popustu i šta Beograd voli." : "Short edits for quick decisions: what's new, what's on sale and what Belgrade loves."}
      />
      <section className="theme-paper pb-24">
        <Reveal className="wrap grid gap-5 md:grid-cols-3" stagger={0.08} wipe>
          {[...cols.map((c) => ({ key: c.id, name: c.name[locale], intro: c.intro[locale], image: c.image, href: detailHref(locale, "collection", c.slug) })), { key: "roses", name: roses.name[locale], intro: roses.intro[locale], image: roses.image, href: detailHref(locale, "category", roses.slug) }].map((c, i) => (
            <Link key={c.key} href={c.href} className={`group relative block overflow-hidden rounded-[1.5rem] ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
              <div className={`frame relative ${i === 0 ? "aspect-[4/5] md:aspect-auto md:h-full" : "aspect-[4/5]"}`}>
                <Image src={c.image} alt="" fill sizes={i === 0 ? "(min-width: 768px) 64vw, 100vw" : "(min-width: 768px) 32vw, 100vw"} className="object-cover transition-transform duration-[1.4s] ease-[var(--ease-out-expo)] group-hover:scale-105" />
              </div>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent p-6 pt-20 text-paper">
                <h2 className="font-serif text-[clamp(1.8rem,3vw,3rem)] leading-none">{c.name}</h2>
                <p className="mt-2 max-w-sm text-sm text-paper/85">{c.intro}</p>
              </div>
            </Link>
          ))}
        </Reveal>
      </section>
    </>
  );
}
