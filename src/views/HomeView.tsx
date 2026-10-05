import type { Locale } from "@/lib/i18n";
import { pageHref } from "@/lib/routes";
import { home } from "@/content/home";
import { catalog } from "@/lib/commerce";
import { occasions } from "@/content/taxonomy";
import { plans, savingPercent } from "@/content/subscriptions";
import { BloomHero } from "@/components/home/BloomHero";
import { TodayRoute } from "@/components/home/TodayRoute";
import { OccasionsTrack } from "@/components/home/OccasionsTrack";
import { LetterZoom } from "@/components/home/LetterZoom";
import { BuilderAssembly } from "@/components/home/BuilderAssembly";
import { SubsStack } from "@/components/home/SubsStack";
import { DoorsParallax } from "@/components/home/DoorsParallax";
import { FinalCta } from "@/components/home/FinalCta";
import { ReviewsWall } from "@/components/sections/ReviewsWall";
import { ZoneMap } from "@/components/sections/ZoneMap";
import { ProductRail } from "@/components/shop/ProductRail";
import { CardStack, SaleCountdown } from "@/components/shop/CardStack";
import { SplitReveal } from "@/components/ui/Reveal";

export function HomeView({ locale }: { locale: Locale }) {
  const h = (k: Parameters<typeof pageHref>[1]) => pageHref(locale, k);
  const all = catalog.getProducts();
  const lite = all.map(catalog.toLite);
  const best = lite.filter((p) => all.find((x) => x.id === p.id)?.bestseller);
  const sale = lite.filter((p) => p.variants.some((v) => v.compareAt));
  const saleEnds = all.find((p) => p.saleEnds)?.saleEnds ?? "2026-10-12T23:59:00+02:00";
  const c = home.hero;
  const sr = locale === "sr";

  return (
    <>
      <BloomHero
        locale={locale}
        shopHref={h("shop")}
        buildHref={h("builder")}
        copy={{ eyebrow: c.eyebrow[locale], line1: c.line1[locale], line2: c.line2[locale], sub: c.sub[locale], shop: c.shop[locale], build: c.build[locale], scroll: c.scroll[locale] }}
      />
      <TodayRoute
        eyebrow={home.today.eyebrow[locale]}
        text={home.today.text[locale]}
        stops={home.today.stops.map((s) => ({ time: s.time, label: s.label[locale] }))}
        stats={home.today.stats.map((s) => ({ value: s.value, suffix: s.suffix[locale], label: s.label[locale] }))}
      />

      <section className="theme-paper pb-24 md:pb-32">
        <div className="wrap">
          <p className="t-eyebrow text-accent">{home.bestsellers.eyebrow[locale]}</p>
          <SplitReveal className="t-h2 mt-4 max-w-3xl">{home.bestsellers.title[locale]}</SplitReveal>
          <ProductRail items={best} locale={locale} label={home.bestsellers.eyebrow[locale]} className="mt-12" />
        </div>
      </section>

      <OccasionsTrack
        eyebrow={home.occasions.eyebrow[locale]}
        title={home.occasions.title[locale]}
        cta={sr ? "…ili samo tako." : "…or just because."}
        items={occasions.map((o) => ({ id: o.id, name: o.name[locale], line: o.line[locale], image: o.image, href: `${h("shop")}?povod=${o.id}` }))}
      />

      <section className="theme-blush overflow-hidden py-24 md:py-36">
        <div className="wrap grid items-center gap-16 md:grid-cols-[1fr_1.1fr]">
          <div>
            <p className="t-eyebrow text-accent">{home.week.eyebrow[locale]}</p>
            <SplitReveal className="t-h2 mt-4">{home.week.title[locale]}</SplitReveal>
            <p className="t-lead mt-6 max-w-md">{home.week.text[locale]}</p>
            <p className="t-eyebrow mt-10 text-muted">{sr ? "Akcija ističe za" : "Sale ends in"}</p>
            <SaleCountdown ends={saleEnds} locale={locale} className="mt-3" />
          </div>
          <CardStack items={sale} locale={locale} />
        </div>
      </section>

      <LetterZoom
        word={home.studio.word}
        eyebrow={home.studio.eyebrow[locale]}
        title={home.studio.title[locale]}
        text={home.studio.text[locale]}
        link={home.studio.link[locale]}
        href={h("about")}
        image="/images/studio/making-bouquet.jpg"
      />

      <BuilderAssembly eyebrow={home.builder.eyebrow[locale]} title={home.builder.title[locale]} text={home.builder.text[locale]} cta={sr ? "Napravi buket" : "Build a bouquet"} href={h("builder")} />

      <section className="theme-paper py-24 md:py-36">
        <div className="wrap">
          <p className="t-eyebrow text-accent">{home.zones.eyebrow[locale]}</p>
          <SplitReveal className="t-h2 mt-4 max-w-3xl">{home.zones.title[locale]}</SplitReveal>
          <p className="t-lead mt-5 max-w-xl">{home.zones.text[locale]}</p>
          <ZoneMap locale={locale} className="mt-12" />
        </div>
      </section>

      <SubsStack
        eyebrow={home.subs.eyebrow[locale]}
        title={home.subs.title[locale]}
        plans={plans.map((p) => ({ id: p.id, name: p.name[locale], every: p.every[locale], price: p.price, saving: savingPercent(p.price), note: p.note[locale], image: p.image }))}
        perDelivery={sr ? "po dostavi" : "per delivery"}
        save={sr ? "ušteda" : "you save"}
        cta={sr ? "Izaberite plan" : "Choose a plan"}
        href={h("subscriptions")}
      />

      <ReviewsWall locale={locale} eyebrow={home.reviews.eyebrow[locale]} title={home.reviews.title[locale]} />

      <DoorsParallax
        eyebrow={home.doors.eyebrow[locale]}
        title={home.doors.title[locale]}
        columns={[
          [
            { src: "/images/delivery/door-sunflowers.jpg", caption: "Zemun" },
            { src: "/images/city/dorcol-street.jpg", caption: "Dorćol" },
            { src: "/images/life/window-sunflowers.jpg", caption: "Vračar" },
          ],
          [
            { src: "/images/delivery/bike-door.jpg", caption: "Savamala" },
            { src: "/images/life/living-peonies.jpg", caption: "Novi Beograd" },
            { src: "/images/delivery/arched-door.jpg", caption: "Kosančićev venac" },
          ],
          [
            { src: "/images/city/facade-corner.jpg", caption: "Stari grad" },
            { src: "/images/delivery/hand-bouquet.jpg", caption: "Banovo brdo" },
            { src: "/images/life/restaurant-table.jpg", caption: "Senjak" },
          ],
        ]}
      />

      <FinalCta
        locale={locale}
        title={home.final.title[locale]}
        text={home.final.text[locale]}
        shopHref={h("shop")}
        contactHref={h("contact")}
        shop={c.shop[locale]}
        visit={sr ? "Posetite atelje" : "Visit the studio"}
      />
    </>
  );
}
