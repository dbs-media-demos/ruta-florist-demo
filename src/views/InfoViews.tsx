import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/i18n/dictionary";
import { pageHref, type PageKey } from "@/lib/routes";
import { hours, site } from "@/lib/site";
import { pageMeta } from "@/content/meta";
import { faq, careTips, flowerGuide, timeline, team, weddingServices, businessPerks, legal } from "@/content/pages";
import { subsCopy, plans, savingPercent } from "@/content/subscriptions";
import { zones } from "@/content/zones";
import { storeReviews, ratingSummary } from "@/content/reviews";
import { catalog } from "@/lib/commerce";
import { faqSchema, graph, serviceSchema } from "@/lib/schema";
import { formatRsd } from "@/lib/format";
import { JsonLd } from "@/components/seo/JsonLd";
import { Accordion, CtaBand, PageHero, SectionHead, type Crumb } from "@/components/sections/PageParts";
import { ZoneMap } from "@/components/sections/ZoneMap";
import { HorizontalTimeline } from "@/components/sections/HorizontalTimeline";
import { ReviewCard, Stars } from "@/components/sections/ReviewsWall";
import { LetterZoom } from "@/components/home/LetterZoom";
import { SubsStack } from "@/components/home/SubsStack";
import { DemoForm } from "@/components/forms/DemoForm";
import { PlanPicker } from "@/components/forms/PlanPicker";
import { GiftCardDesigner } from "@/components/forms/GiftCardDesigner";
import { BouquetBuilder } from "@/components/builder/BouquetBuilder";
import { WishlistGrid } from "@/components/shop/WishlistGrid";
import { CartPage } from "@/components/cart/CartPage";
import { Checkout } from "@/components/checkout/Checkout";
import { Success } from "@/components/checkout/Success";
import { TrackOrder } from "@/components/checkout/TrackOrder";
import { OpenStatus } from "@/components/layout/OpenStatus";
import { CutoffLine } from "@/components/layout/Countdown";
import { Parallax, Reveal, ScrubWords } from "@/components/ui/Reveal";

type P = { locale: Locale };

const crumbs = (locale: Locale, key: PageKey): Crumb[] => {
  const d = getDictionary(locale);
  return [
    { name: d.nav.home, url: pageHref(locale, "home") },
    { name: d.nav[key as keyof typeof d.nav] ?? "", url: pageHref(locale, key) },
  ];
};
const titleOf = (locale: Locale, key: Exclude<PageKey, "home">) => pageMeta[key].title[locale];

// ——— Builder ———
export function BuilderView({ locale }: P) {
  const sr = locale === "sr";
  return (
    <>
      <PageHero
        locale={locale}
        crumbs={crumbs(locale, "builder")}
        eyebrow={sr ? "Napravi buket" : "Build a bouquet"}
        title={sr ? "Složite svoj buket" : "Compose your bouquet"}
        intro={sr ? "Veličina, paleta, cveće i papir. Gledajte kako se buket slaže, cena se menja uživo, a floristkinja ga veže tačno ovako." : "Size, palette, stems and paper. Watch it come together with a live price; our florist ties it exactly like this."}
      />
      <section className="theme-paper pb-24">
        <div className="wrap">
          <BouquetBuilder locale={locale} />
        </div>
      </section>
    </>
  );
}

// ——— Subscriptions ———
export function SubscriptionsView({ locale }: P) {
  const sr = locale === "sr";
  const c = subsCopy;
  return (
    <>
      <JsonLd data={graph(serviceSchema(locale, c.meta.title[locale], c.meta.description[locale], pageHref(locale, "subscriptions")))} />
      <PageHero locale={locale} crumbs={crumbs(locale, "subscriptions")} eyebrow={sr ? "Pretplata" : "Subscriptions"} title={c.title[locale]} intro={c.intro[locale]} image="/images/life/living-peonies.jpg" />
      <section className="theme-paper pb-20">
        <div className="wrap">
          <PlanPicker locale={locale} />
        </div>
      </section>
      <section className="theme-linen py-20 md:py-28">
        <div className="wrap">
          <SectionHead eyebrow={sr ? "Kako radi" : "How it works"} title={sr ? "Tri koraka, a onda samo cveće" : "Three steps, then just flowers"} />
          <Reveal className="mt-12 grid gap-6 md:grid-cols-3" stagger={0.1}>
            {c.steps.map((s, i) => (
              <div key={i} className="rounded-[1.5rem] bg-surface p-7">
                <p className="font-serif text-5xl text-accent">0{i + 1}</p>
                <p className="t-h3 mt-6">{s.title[locale]}</p>
                <p className="mt-2 text-muted">{s.text[locale]}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
      <SubsStack
        eyebrow={sr ? "Ritam" : "Rhythm"}
        title={sr ? "Izaberite koliko često" : "Choose how often"}
        plans={plans.map((p) => ({ id: p.id, name: p.name[locale], every: p.every[locale], price: p.price, saving: savingPercent(p.price), note: p.note[locale], image: p.image }))}
        perDelivery={c.perDelivery[locale]}
        save={c.save[locale]}
        cta={sr ? "Za firme" : "For business"}
        href={pageHref(locale, "business")}
      />
    </>
  );
}

// ——— Delivery ———
export function DeliveryView({ locale }: P) {
  const sr = locale === "sr";
  const d = getDictionary(locale);
  const slots = ["09–12", "12–15", "15–18", "18–21"];
  return (
    <>
      <JsonLd data={graph(serviceSchema(locale, titleOf(locale, "delivery"), pageMeta.delivery.description[locale], pageHref(locale, "delivery")))} />
      <PageHero locale={locale} crumbs={crumbs(locale, "delivery")} eyebrow={sr ? "Dostava i reklamacije" : "Delivery & returns"} title={sr ? "Dostava danas, kvart po kvart" : "Same-day, neighbourhood by neighbourhood"} intro={pageMeta.delivery.description[locale]} image="/images/delivery/cargo-bike.jpg">
        <p className="mt-6 inline-flex rounded-full border border-line px-4 py-2 text-sm">
          <CutoffLine locale={locale} />
        </p>
      </PageHero>
      <section className="theme-paper py-16 md:py-24">
        <div className="wrap">
          <SectionHead eyebrow={sr ? "Zone" : "Zones"} title={sr ? "Pređite preko mape" : "Explore the map"} text={sr ? "Cena i vreme hitne isporuke po zoni. Termine birate pri poručivanju." : "Price and express time per zone. You pick the window when you order."} />
          <ZoneMap locale={locale} className="mt-12" />
          <div className="mt-14 overflow-x-auto">
            <table className="w-full min-w-[34rem] text-left text-sm">
              <caption className="sr-only">{sr ? "Cene dostave po zonama" : "Delivery prices by zone"}</caption>
              <thead>
                <tr className="border-b border-line text-muted">
                  <th className="py-3 font-semibold">{sr ? "Zona" : "Zone"}</th>
                  <th className="py-3 font-semibold">{sr ? "Kvartovi" : "Neighbourhoods"}</th>
                  <th className="py-3 font-semibold">{sr ? "Cena" : "Price"}</th>
                  <th className="py-3 font-semibold">{sr ? "Hitno" : "Express"}</th>
                </tr>
              </thead>
              <tbody>
                {zones.map((z) => (
                  <tr key={z.id} className="border-b border-line">
                    <td className="py-3 font-semibold">{z.name}</td>
                    <td className="py-3 text-muted">{z.hoods[locale]}</td>
                    <td className="py-3 tabular-nums">{z.price === 0 ? d.bag.free : formatRsd(z.price)}</td>
                    <td className="py-3">{z.eta[locale]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      <section className="theme-ink py-20 md:py-28" data-header-dark>
        <div className="wrap grid gap-12 md:grid-cols-2">
          <div>
            <p className="t-eyebrow text-accent">{sr ? "Termini" : "Windows"}</p>
            <h2 className="t-h2 mt-4">{sr ? "Četiri termina, svaki dan" : "Four windows, every day"}</h2>
            <p className="t-lead mt-5">{sr ? "Poručite do 14:00 za danas. Nedeljom samo prva dva termina." : "Order by 14:00 for today. Sundays: the first two windows only."}</p>
          </div>
          <ul className="grid grid-cols-2 gap-3">
            {slots.map((s, i) => (
              <li key={s} className="rounded-[1.25rem] bg-surface p-6">
                <p className="font-serif text-4xl tabular-nums">{s}</p>
                <p className="mt-2 text-sm text-muted">{[sr ? "Jutro" : "Morning", sr ? "Podne" : "Midday", sr ? "Popodne" : "Afternoon", sr ? "Veče" : "Evening"][i]}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <section className="theme-paper py-20 md:py-28">
        <div className="wrap grid gap-12 md:grid-cols-[1fr_1.4fr]">
          <SectionHead eyebrow={sr ? "Garancija svežine" : "Freshness guarantee"} title={sr ? "Tri dana ili novo cveće" : "Three days or new flowers"} text={d.product.shippingText} />
          <Accordion items={faq.slice(2, 8).map((f) => ({ q: f.q[locale], a: f.a[locale] }))} />
        </div>
      </section>
      <CtaBand title={sr ? "Stiže danas, ako poručite do 14:00." : "It arrives today if you order by 14:00."} primary={{ label: d.cta.shopNow, href: pageHref(locale, "shop") }} image="/images/delivery/bike-door.jpg" />
    </>
  );
}

// ——— Weddings ———
export function WeddingsView({ locale }: P) {
  const sr = locale === "sr";
  const gallery = ["/images/events/long-table.jpg", "/images/events/bride-peach.jpg", "/images/events/arch-couple.jpg", "/images/events/gypsophila-runner.jpg", "/images/events/bridal-bouquet.jpg", "/images/events/pavilion.jpg", "/images/events/garden-centrepiece.jpg", "/images/events/arch-build.jpg", "/images/events/bride-white.jpg"];
  return (
    <>
      <JsonLd data={graph(serviceSchema(locale, titleOf(locale, "weddings"), pageMeta.weddings.description[locale], pageHref(locale, "weddings")))} />
      <PageHero locale={locale} crumbs={crumbs(locale, "weddings")} eyebrow={sr ? "Venčanja i događaji" : "Weddings & events"} title={sr ? "Cveće za dan koji se pamti" : "Flowers for the day you'll remember"} intro={pageMeta.weddings.description[locale]} image="/images/events/bride-peach.jpg" />
      <section className="theme-paper py-16">
        <div className="wrap columns-2 gap-4 md:columns-3 md:gap-6">
          {gallery.map((src, i) => (
            <Reveal key={src} className="mb-4 break-inside-avoid md:mb-6" wipe delay={(i % 3) * 0.08}>
              <Parallax className={`relative rounded-[1.25rem] ${i % 3 === 1 ? "aspect-[3/4]" : "aspect-[4/5]"}`} amount={8}>
                <Image src={src} alt={sr ? "Cvetni aranžman za venčanje" : "Wedding floral arrangement"} fill sizes="(min-width: 768px) 32vw, 48vw" className="object-cover" />
              </Parallax>
            </Reveal>
          ))}
        </div>
      </section>
      <section className="theme-linen py-20 md:py-28">
        <div className="wrap">
          <SectionHead eyebrow={sr ? "Usluge" : "Services"} title={sr ? "Od bidermajera do luka" : "From bouquet to arch"} />
          <Reveal className="mt-12 grid gap-4 md:grid-cols-2" stagger={0.08}>
            {weddingServices.map((s) => (
              <div key={s.title.en} className="rounded-[1.5rem] bg-surface p-7">
                <p className="t-h3">{s.title[locale]}</p>
                <p className="mt-2 text-muted">{s.text[locale]}</p>
                <p className="t-price mt-5 text-accent">{s.price[locale]}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
      <section className="theme-paper py-20 md:py-28">
        <div className="wrap grid gap-12 md:grid-cols-[1fr_1.3fr]">
          <SectionHead eyebrow={sr ? "Upit" : "Enquiry"} title={sr ? "Ispričajte nam o danu" : "Tell us about the day"} text={sr ? "Javljamo se u roku od 24h sa idejama i okvirnom ponudom. Konsultacije u ateljeu su besplatne." : "We reply within 24 hours with ideas and a rough quote. Studio consultations are free."} />
          <DemoForm
            locale={locale}
            submit={sr ? "Pošalji upit" : "Send enquiry"}
            success={sr ? "Hvala! Javljamo se u roku od 24h." : "Thank you! We'll be in touch within 24 hours."}
            fields={[
              { name: "name", label: sr ? "Ime i prezime" : "Full name", required: true, half: true, autoComplete: "name" },
              { name: "email", label: "E-mail", type: "email", required: true, half: true, autoComplete: "email" },
              { name: "date", label: sr ? "Datum događaja" : "Event date", type: "date", required: true, half: true },
              { name: "guests", label: sr ? "Broj gostiju" : "Guests", type: "number", half: true },
              { name: "type", label: sr ? "Vrsta događaja" : "Event type", type: "select", options: sr ? ["Venčanje", "Krštenje", "Rođendan", "Korporativni događaj"] : ["Wedding", "Christening", "Birthday", "Corporate event"] },
              { name: "venue", label: sr ? "Mesto" : "Venue" },
              { name: "msg", label: sr ? "Boje, cveće, ideje" : "Colours, flowers, ideas", type: "textarea" },
            ]}
          />
        </div>
      </section>
    </>
  );
}

// ——— Business ———
export function BusinessView({ locale }: P) {
  const sr = locale === "sr";
  return (
    <>
      <JsonLd data={graph(serviceSchema(locale, titleOf(locale, "business"), pageMeta.business.description[locale], pageHref(locale, "business")))} />
      <PageHero locale={locale} crumbs={crumbs(locale, "business")} eyebrow={sr ? "Za firme" : "For business"} title={sr ? "Cveće koje radi za vaš prostor" : "Flowers that work for your space"} intro={pageMeta.business.description[locale]} image="/images/life/office-lilies.jpg" />
      <section className="theme-paper py-16 md:py-24">
        <div className="wrap">
          <Reveal className="grid gap-4 md:grid-cols-4" stagger={0.08}>
            {businessPerks.map((b, i) => (
              <div key={b.title.en} className="rounded-[1.5rem] border border-line p-6">
                <p className="font-serif text-4xl text-accent">0{i + 1}</p>
                <p className="t-h4 mt-5">{b.title[locale]}</p>
                <p className="mt-2 text-sm text-muted">{b.text[locale]}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
      <section className="theme-linen py-16 md:py-24">
        <div className="wrap grid gap-6 md:grid-cols-3">
          {["/images/life/restaurant-table.jpg", "/images/life/desk-flowers.jpg", "/images/life/event-table.jpg"].map((src, i) => (
            <Parallax key={src} className={`relative aspect-[4/5] rounded-[1.5rem] ${i === 1 ? "md:mt-16" : ""}`} amount={10}>
              <Image src={src} alt={sr ? "Cveće u poslovnom prostoru" : "Flowers in a business space"} fill sizes="(min-width: 768px) 32vw, 100vw" className="object-cover" />
            </Parallax>
          ))}
        </div>
      </section>
      <section className="theme-paper py-20 md:py-28">
        <div className="wrap grid gap-12 md:grid-cols-[1fr_1.3fr]">
          <SectionHead eyebrow={sr ? "Ponuda" : "Quote"} title={sr ? "Napravimo plan za vaš prostor" : "Let's plan for your space"} text={sr ? "Pošaljite nam podatke i šaljemo ponudu sa tri predloga i cenama." : "Send us the details and we'll reply with three proposals and prices."} />
          <DemoForm
            locale={locale}
            submit={sr ? "Zatraži ponudu" : "Request a quote"}
            success={sr ? "Hvala! Ponuda stiže u roku od 24h." : "Thank you! Your quote arrives within 24 hours."}
            fields={[
              { name: "company", label: sr ? "Firma" : "Company", required: true, half: true, autoComplete: "organization" },
              { name: "name", label: sr ? "Kontakt osoba" : "Contact person", required: true, half: true, autoComplete: "name" },
              { name: "email", label: "E-mail", type: "email", required: true, half: true, autoComplete: "email" },
              { name: "phone", label: sr ? "Telefon" : "Phone", type: "tel", half: true, autoComplete: "tel" },
              { name: "freq", label: sr ? "Učestalost" : "Frequency", type: "select", options: sr ? ["Nedeljno", "Dvonedeljno", "Mesečno", "Povremeno"] : ["Weekly", "Fortnightly", "Monthly", "Occasionally"] },
              { name: "msg", label: sr ? "Prostor i želje" : "Space and wishes", type: "textarea" },
            ]}
          />
        </div>
      </section>
    </>
  );
}

// ——— Care ———
export function CareView({ locale }: P) {
  const sr = locale === "sr";
  return (
    <>
      <PageHero locale={locale} crumbs={crumbs(locale, "care")} eyebrow={sr ? "Nega cveća" : "Flower care"} title={sr ? "Kako da buket traje duže" : "How to make it last"} intro={sr ? "Pet navika koje koriste floristkinje, i vodič po vrstama cveća." : "Five habits florists swear by, and a guide by flower type."} image="/images/studio/cutting-stem.jpg" />
      <section className="theme-paper py-16">
        <div className="wrap space-y-16 md:space-y-24">
          {careTips.map((c, i) => (
            <div key={c.title.en} className={`grid items-center gap-8 md:grid-cols-2 md:gap-16 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
              <Parallax className="relative aspect-[4/3] rounded-[1.5rem]" amount={10}>
                <Image src={c.image} alt="" fill sizes="(min-width: 768px) 46vw, 100vw" className="object-cover" />
              </Parallax>
              <Reveal>
                <p className="font-serif text-6xl text-accent">0{i + 1}</p>
                <h2 className="t-h2 mt-4">{c.title[locale]}</h2>
                <p className="t-lead mt-4">{c.text[locale]}</p>
              </Reveal>
            </div>
          ))}
        </div>
      </section>
      <section className="theme-linen py-20 md:py-28">
        <div className="wrap">
          <SectionHead eyebrow={sr ? "Po vrstama" : "By flower"} title={sr ? "Koliko traje koje cveće" : "How long each flower lasts"} />
          <Reveal className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
            {flowerGuide.map((f) => (
              <div key={f.name.en} className="rounded-[1.5rem] bg-surface p-6">
                <div className="flex items-baseline justify-between">
                  <p className="t-h3">{f.name[locale]}</p>
                  <p className="t-price text-accent">
                    {f.days} {sr ? "dana" : "days"}
                  </p>
                </div>
                <p className="mt-3 text-sm text-muted">{f.tip[locale]}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>
      <CtaBand title={sr ? "Sveže cveće, uz karticu za negu." : "Fresh flowers, with a care card."} primary={{ label: getDictionary(locale).cta.shopNow, href: pageHref(locale, "shop") }} />
    </>
  );
}

// ——— About ———
export function AboutView({ locale }: P) {
  const sr = locale === "sr";
  return (
    <>
      <PageHero locale={locale} crumbs={crumbs(locale, "about")} eyebrow={sr ? "O nama" : "About"} title={sr ? "Mali atelje, veliki prozor" : "A small studio with a big window"} image="/images/studio/florist-basket-floor.jpg" />
      <section className="theme-paper pb-24 pt-8">
        <div className="wrap">
          <ScrubWords
            className="t-h2 max-w-[24ch]"
            text={sr ? "Ruta je počela 2019. sa jednim stolom, jednom hladnjačom i biciklom. Danas nas je četvoro, a cveće i dalje biramo svako jutro u šest, rukom, jedno po jedno." : "Ruta started in 2019 with one table, one cold room and a bicycle. Today there are four of us, and we still choose the flowers every morning at six, by hand, one by one."}
          />
        </div>
      </section>
      <HorizontalTimeline eyebrow={sr ? "Godine" : "Years"} title={sr ? "Kako smo rasli" : "How we grew"} items={timeline.map((t) => ({ year: t.year, title: t.title[locale], text: t.text[locale], image: t.image }))} />
      <section className="theme-paper py-20 md:py-28">
        <div className="wrap">
          <SectionHead eyebrow={sr ? "Tim" : "Team"} title={sr ? "Ljudi iza buketa" : "The people behind the bouquets"} />
          <Reveal className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6" stagger={0.08} wipe>
            {team.map((m) => (
              <figure key={m.name}>
                <div className="frame relative aspect-[3/4] rounded-[1.25rem]">
                  <Image src={m.image} alt="" fill sizes="(min-width: 768px) 23vw, 48vw" className="object-cover" />
                </div>
                <figcaption className="mt-3">
                  <span className="block font-serif text-xl">{m.name}</span>
                  <span className="text-sm text-muted">{m.role[locale]}</span>
                </figcaption>
              </figure>
            ))}
          </Reveal>
        </div>
      </section>
      <LetterZoom
        word="Ruta"
        charIndex={1}
        caption={sr ? "Svako jutro u 6" : "Every morning at six"}
        eyebrow={sr ? "Atelje" : "The studio"}
        title={sr ? "Uđite, kafa je uvek tu" : "Come in, there's always coffee"}
        text={sr ? "Strahinjića bana 19. Pon–pet 8–20h, subotom 9–18h, nedeljom 10–15h. Možete da gledate kako vežemo vaš buket." : "Strahinjića bana 19. Mon–Fri 8–20, Sat 9–18, Sun 10–15. You can watch us tie your bouquet."}
        link={sr ? "Kako do nas" : "How to find us"}
        href={pageHref(locale, "contact")}
        image="/images/studio/flower-wall-florist.jpg"
      />
      <CtaBand title={sr ? "Poručite danas, stiže danas." : "Order today, it arrives today."} primary={{ label: getDictionary(locale).cta.shopNow, href: pageHref(locale, "shop") }} secondary={{ label: sr ? "Venčanja" : "Weddings", href: pageHref(locale, "weddings") }} />
    </>
  );
}

// ——— Contact ———
export function ContactView({ locale }: P) {
  const sr = locale === "sr";
  const d = getDictionary(locale);
  const order = [1, 2, 3, 4, 5, 6, 0];
  return (
    <>
      <PageHero locale={locale} crumbs={crumbs(locale, "contact")} eyebrow={sr ? "Kontakt" : "Contact"} title={sr ? "Svratite u atelje" : "Drop by the studio"} intro={sr ? "Strahinjića bana 19, Dorćol. Dva minuta od Studentskog trga." : "Strahinjića bana 19, Dorćol. Two minutes from Studentski trg."} />
      <section className="theme-paper pb-20">
        <div className="wrap grid gap-10 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-8">
            <div className="rounded-[1.5rem] bg-surface p-7">
              <OpenStatus locale={locale} className="font-semibold" />
              <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-8 gap-y-1.5">
                {order.map((day) => {
                  const h = hours.find((x) => x.day === day)!;
                  return (
                    <div key={day} className="contents">
                      <dt className="text-muted">{d.footer.days[day]}</dt>
                      <dd className="tabular-nums">
                        {h.open}–{h.close}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <a href={`tel:${site.phone}`} className="rounded-[1.5rem] border border-line p-6 hover:border-fg">
                <span className="t-eyebrow text-muted">{d.cta.call}</span>
                <span className="mt-2 block font-serif text-2xl">{site.phoneDisplay}</span>
              </a>
              <a href={`mailto:${site.email}`} className="rounded-[1.5rem] border border-line p-6 hover:border-fg">
                <span className="t-eyebrow text-muted">E-mail</span>
                <span className="mt-2 block break-all font-serif text-2xl">{site.email}</span>
              </a>
            </div>
            <a href="https://www.google.com/maps/search/?api=1&query=Dor%C4%87ol%2C+Beograd" target="_blank" rel="noopener" data-track="directions" className="group block overflow-hidden rounded-[1.5rem]">
              <div className="frame relative aspect-[16/10]">
                <Image src="/images/city/dorcol-street.jpg" alt={sr ? "Ulica na Dorćolu" : "A street in Dorćol"} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover transition-transform duration-1000 group-hover:scale-105" />
                <span className="absolute bottom-4 left-4 rounded-full bg-paper px-4 py-2 text-sm font-semibold text-ink">{sr ? "Uputstva do Dorćola ↗" : "Directions to Dorćol ↗"}</span>
              </div>
            </a>
          </div>
          <div className="rounded-[1.75rem] border border-line p-6 md:p-10">
            <h2 className="t-h3">{sr ? "Pišite nam" : "Write to us"}</h2>
            <p className="mt-2 text-muted">{sr ? "Odgovaramo u toku radnog vremena, obično za sat vremena." : "We reply during opening hours, usually within an hour."}</p>
            <DemoForm
              locale={locale}
              className="mt-6"
              submit={d.forms.send}
              success={sr ? "Hvala! Javljamo se uskoro." : "Thank you! We'll be in touch soon."}
              fields={[
                { name: "name", label: d.forms.name, required: true, half: true, autoComplete: "name" },
                { name: "email", label: d.forms.email, type: "email", required: true, half: true, autoComplete: "email" },
                { name: "phone", label: d.forms.phone, type: "tel", autoComplete: "tel" },
                { name: "msg", label: d.forms.message, type: "textarea", required: true },
              ]}
            />
          </div>
        </div>
      </section>
      <section className="theme-linen py-20">
        <div className="wrap">
          <SectionHead eyebrow={sr ? "Dostava" : "Delivery"} title={sr ? "Ne stižete do nas? Mi stižemo do vas." : "Can't make it here? We'll come to you."} />
          <ZoneMap locale={locale} className="mt-10" />
        </div>
      </section>
    </>
  );
}

// ——— Reviews ———
export function ReviewsView({ locale }: P) {
  const sr = locale === "sr";
  return (
    <>
      <PageHero locale={locale} crumbs={crumbs(locale, "reviews")} eyebrow={sr ? "Utisci" : "Reviews"} title={sr ? "Šta kažu ljudi koji šalju cveće" : "What people who send flowers say"}>
        <div className="mt-8 flex items-center gap-4">
          <span className="font-serif text-6xl">{ratingSummary.value.toFixed(1)}</span>
          <div>
            <Stars n={5} size={20} />
            <p className="text-sm text-muted">{sr ? `${ratingSummary.count} utisaka na Google-u` : `${ratingSummary.count} Google reviews`}</p>
          </div>
        </div>
      </PageHero>
      <section className="theme-paper pb-24">
        <div className="wrap grid gap-12 lg:grid-cols-[1fr_2.4fr]">
          <dl className="space-y-2 self-start rounded-[1.5rem] bg-surface p-6">
            {ratingSummary.breakdown.map((b) => (
              <div key={b.stars} className="flex items-center gap-3 text-sm">
                <dt className="w-8">{b.stars} ★</dt>
                <dd className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <span className="block h-full rounded-full bg-[#f4b400]" style={{ width: `${(b.count / ratingSummary.count) * 100}%` }} />
                </dd>
                <dd className="w-10 text-right tabular-nums text-muted">{b.count}</dd>
              </div>
            ))}
          </dl>
          <Reveal className="grid gap-4 md:grid-cols-2 [&_figure]:w-full" stagger={0.05}>
            {storeReviews.map((r) => (
              <ReviewCard key={r.id} r={r} locale={locale} />
            ))}
          </Reveal>
        </div>
      </section>
    </>
  );
}

// ——— FAQ ———
export function FaqView({ locale }: P) {
  const sr = locale === "sr";
  const items = faq.map((f) => ({ q: f.q[locale], a: f.a[locale] }));
  return (
    <>
      <JsonLd data={graph(faqSchema(items))} />
      <PageHero locale={locale} crumbs={crumbs(locale, "faq")} eyebrow="FAQ" title={sr ? "Česta pitanja" : "Questions, answered"} intro={pageMeta.faq.description[locale]} />
      <section className="theme-paper pb-24">
        <div className="wrap grid gap-12 md:grid-cols-[1fr_2fr]">
          <div className="space-y-4 self-start">
            <p className="text-muted">{sr ? "Niste našli odgovor?" : "Didn't find your answer?"}</p>
            <a href={`tel:${site.phone}`} className="btn btn-primary">
              {site.phoneDisplay}
            </a>
          </div>
          <Accordion items={items.map((i) => ({ q: i.q, a: <p>{i.a}</p> }))} />
        </div>
      </section>
      <CtaBand title={sr ? "Spremni? Poručite do 14:00." : "Ready? Order by 14:00."} primary={{ label: getDictionary(locale).cta.shopNow, href: pageHref(locale, "shop") }} />
    </>
  );
}

// ——— Gift cards ———
export function GiftCardsView({ locale }: P) {
  const sr = locale === "sr";
  return (
    <>
      <PageHero locale={locale} crumbs={crumbs(locale, "giftCards")} eyebrow={sr ? "Poklon kartice" : "Gift cards"} title={sr ? "Neka sami izaberu cveće" : "Let them choose the flowers"} intro={pageMeta.giftCards.description[locale]} />
      <section className="theme-paper pb-24">
        <div className="wrap">
          <GiftCardDesigner locale={locale} />
        </div>
      </section>
    </>
  );
}

// ——— Wishlist ———
export function WishlistView({ locale }: P) {
  const d = getDictionary(locale);
  return (
    <>
      <PageHero locale={locale} crumbs={crumbs(locale, "wishlist")} title={d.wish.title} />
      <section className="theme-paper pb-24">
        <div className="wrap">
          <WishlistGrid locale={locale} shopHref={pageHref(locale, "shop")} />
        </div>
      </section>
    </>
  );
}

// ——— Cart / checkout / success / track ———
export function CartView({ locale }: P) {
  const d = getDictionary(locale);
  const all = catalog.getProducts();
  return (
    <>
      <PageHero locale={locale} crumbs={crumbs(locale, "cart")} title={d.bag.title} tone="paper" />
      <section className="theme-paper">
        <CartPage
          locale={locale}
          checkoutHref={pageHref(locale, "checkout")}
          shopHref={pageHref(locale, "shop")}
          suggestions={all.filter((p) => p.bestseller).slice(0, 4).map(catalog.toLite)}
          crossSells={all.filter((p) => p.category === "addons").map(catalog.toLite)}
        />
      </section>
    </>
  );
}

export function CheckoutView({ locale }: P) {
  const d = getDictionary(locale);
  return (
    <section className="theme-paper pb-24 pt-8">
      <div className="wrap mb-8">
        <h1 className="t-h2">{d.nav.checkout}</h1>
      </div>
      <Checkout locale={locale} successHref={pageHref(locale, "success")} shopHref={pageHref(locale, "shop")} cartHref={pageHref(locale, "cart")} />
    </section>
  );
}

export function SuccessView({ locale }: P) {
  return (
    <section className="theme-paper pb-10 pt-10">
      <Success locale={locale} shopHref={pageHref(locale, "shop")} trackHref={pageHref(locale, "track")} />
    </section>
  );
}

export function TrackView({ locale }: P) {
  const sr = locale === "sr";
  return (
    <>
      <PageHero locale={locale} crumbs={crumbs(locale, "track")} eyebrow={sr ? "Praćenje" : "Tracking"} title={sr ? "Gde je buket?" : "Where's the bouquet?"} intro={sr ? "Unesite broj porudžbine i e-mail sa potvrde." : "Enter your order number and the email from your confirmation."} />
      <section className="theme-paper pb-24">
        <div className="wrap">
          <TrackOrder locale={locale} />
        </div>
      </section>
    </>
  );
}

// ——— Legal ———
export function LegalView({ locale, kind }: P & { kind: "privacy" | "terms" }) {
  const sections = legal[kind][locale];
  return (
    <>
      <PageHero locale={locale} crumbs={crumbs(locale, kind)} title={pageMeta[kind].title[locale]} intro={locale === "sr" ? "Poslednja izmena: oktobar 2026. Ruta je fiktivni brend za demonstraciju." : "Last updated: October 2026. Ruta is a fictional brand for demonstration."} />
      <section className="theme-paper pb-24">
        <div className="wrap max-w-3xl space-y-10">
          {sections.map(([h, t]) => (
            <div key={h}>
              <h2 className="t-h3">{h}</h2>
              <p className="mt-3 text-muted">{t}</p>
            </div>
          ))}
          <Link href={pageHref(locale, "contact")} className="btn btn-ghost">
            {getDictionary(locale).nav.contact}
          </Link>
        </div>
      </section>
    </>
  );
}
