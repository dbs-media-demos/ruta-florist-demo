import { ViewTransition, type ReactNode } from "react";
import { otherLocale, type Locale } from "@/lib/i18n";
import { getDictionary } from "@/i18n/dictionary";
import { detailHref, pageHref, pagePaths } from "@/lib/routes";
import { alternateMap } from "@/lib/alternates";
import { floristSchema, graph, websiteSchema } from "@/lib/schema";
import { site } from "@/lib/site";
import { catalog } from "@/lib/commerce";
import { minPrice } from "@/content/products";
import { JsonLd } from "@/components/seo/JsonLd";
import { Header, type NavItem } from "./Header";
import { Footer } from "./Footer";
import { DemoPill } from "./DemoPill";
import { MobileBar } from "./MobileBar";
import { Announcer } from "./Announcer";
import type { SearchItem } from "@/components/shop/SearchOverlay";
import { Overlays } from "./Overlays";

/** Header, the page (with view transitions), footer, bag drawer, search, quick view and demo pill. */
export function SiteChrome({ locale, children }: { locale: Locale; children: ReactNode }) {
  const d = getDictionary(locale);
  const h = (k: keyof typeof pagePaths) => pageHref(locale, k);
  const products = catalog.getProducts();
  const cats = catalog.getCategories();
  const cols = catalog.getCollections();

  const primary: NavItem[] = [
    { key: "builder", label: d.nav.builder, href: h("builder") },
    { key: "subscriptions", label: d.nav.subscriptions, href: h("subscriptions") },
    { key: "delivery", label: d.nav.delivery, href: h("delivery") },
    { key: "about", label: d.nav.about, href: h("about") },
  ];
  const categories: NavItem[] = cats.map((c) => ({ key: c.id, label: c.name[locale], href: detailHref(locale, "category", c.slug), image: c.image }));
  const collections: NavItem[] = cols.map((c) => ({ key: c.id, label: c.name[locale], href: detailHref(locale, "collection", c.slug) }));
  const menu: NavItem[] = (["shop", "collections", "builder", "subscriptions", "delivery", "weddings", "business", "care", "about", "contact"] as const).map((k) => ({
    key: k,
    label: d.nav[k],
    href: h(k),
  }));

  const searchItems: SearchItem[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    href: { sr: detailHref("sr", "product", p.slug), en: detailHref("en", "product", p.slug) },
    image: p.images[0],
    price: minPrice(p),
    compareAt: p.variants[0].compareAt,
    terms: [cats.find((c) => c.id === p.category)?.name.sr, cats.find((c) => c.id === p.category)?.name.en, p.palette, ...p.occasions, p.materials.en.split(",")[0]].join(" "),
  }));
  const crossSells = products.filter((p) => p.category === "addons").map(catalog.toLite);

  return (
    <>
      <JsonLd data={graph(floristSchema(locale, d.brandLine), websiteSchema(locale, d.brandLine))} />
      <Header
        locale={locale}
        homeHref={h("home")}
        shopHref={h("shop")}
        builderHref={h("builder")}
        wishlistHref={h("wishlist")}
        primary={primary}
        categories={categories}
        collections={collections}
        menu={menu}
        altMap={alternateMap(locale)}
        otherHome={pageHref(otherLocale(locale), "home")}
        phone={site.phone}
        phoneDisplay={site.phoneDisplay}
      />
      <ViewTransition default="none" enter="page" exit="page">
        <main id="main">{children}</main>
      </ViewTransition>
      <Footer locale={locale} />
      <MobileBar
        callLabel={d.cta.call}
        orderLabel={d.cta.shopNow}
        orderHref={h("shop")}
        bagLabel={d.bag.title}
        phone={site.phone}
        hideOn={[pagePaths.checkout[locale], locale === "sr" ? "/proizvod/" : "/en/product/"]}
      />
      <Overlays locale={locale} crossSells={crossSells} searchItems={searchItems} cartHref={h("cart")} checkoutHref={h("checkout")} shopHref={h("shop")} />
      <Announcer />
      <DemoPill label={d.demoPill} dismiss={d.dismiss} />
    </>
  );
}
