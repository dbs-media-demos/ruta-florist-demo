import type { Metadata } from "next";
import type { Locale, Localized } from "@/lib/i18n";
import { buildMetadata } from "@/lib/seo";
import { pagePaths, privatePages, type PageKey } from "@/lib/routes";

type L = Localized<string>;

/** Titles and descriptions for every static page (Serbian copy targets Serbian search terms). */
export const pageMeta: Record<Exclude<PageKey, "home">, { title: L; description: L; image?: string }> = {
  shop: {
    title: { sr: "Cvećara online: buketi sa dostavom danas", en: "Shop flowers online: same-day bouquets in Belgrade" },
    description: { sr: "Buketi, ruže, korpe, sobno bilje i suvo cveće iz ateljea na Dorćolu. Poručite do 14:00, dostava danas širom Beograda.", en: "Bouquets, roses, baskets, plants and dried flowers from our Dorćol studio. Order by 14:00 for delivery today across Belgrade." },
    image: "/images/studio/florist-basket-floor.jpg",
  },
  collections: {
    title: { sr: "Kolekcije cveća", en: "Flower collections" },
    description: { sr: "Novo, najprodavanije, na popustu, do 3.000 RSD, saučešće i jesen u gradu: kratki izbori iz Rute.", en: "New in, bestsellers, on sale, under 3,000 RSD, sympathy and autumn in the city: short edits from Ruta." },
  },
  builder: {
    title: { sr: "Napravi svoj buket", en: "Build your own bouquet" },
    description: { sr: "Izaberite veličinu, paletu, cveće i papir. Buket se slaže pred vama, a cena se menja uživo. Dostava danas u Beogradu.", en: "Pick a size, palette, stems and paper. Watch the bouquet compose itself with a live price. Same-day delivery in Belgrade." },
    image: "/images/studio/flower-wall-wide.jpg",
  },
  subscriptions: {
    title: { sr: "Pretplata na cveće za dom i firmu", en: "Flower subscriptions for home and office" },
    description: { sr: "Sveže cveće nedeljno, dvonedeljno ili mesečno, do 20% jeftinije. Pauza kad god želite. Beograd.", en: "Fresh flowers weekly, fortnightly or monthly, up to 20% off. Pause any time. Belgrade." },
    image: "/images/life/office-lilies.jpg",
  },
  delivery: {
    title: { sr: "Dostava cveća u Beogradu: zone, termini i cene", en: "Flower delivery in Belgrade: zones, windows and prices" },
    description: { sr: "Dostava danas za porudžbine do 14:00. Termini 9–12, 12–15, 15–18 i 18–21h. Besplatno u centru preko 6.000 RSD.", en: "Same-day delivery for orders by 14:00. Windows 9–12, 12–15, 15–18 and 18–21. Free in central zones over 6,000 RSD." },
    image: "/images/delivery/cargo-bike.jpg",
  },
  weddings: {
    title: { sr: "Cveće za venčanja i događaje", en: "Wedding and event flowers" },
    description: { sr: "Bidermajeri, aranžmani za stolove, lukovi i instalacije za venčanja i događaje u Beogradu i okolini.", en: "Bridal bouquets, table arrangements, arches and installations for weddings and events in and around Belgrade." },
    image: "/images/events/long-table.jpg",
  },
  business: {
    title: { sr: "Cveće za firme, kancelarije i restorane", en: "Flowers for offices, hotels and restaurants" },
    description: { sr: "Nedeljni aranžmani za recepcije, restorane i hotele, poklon buketi za klijente i račun na firmu.", en: "Weekly arrangements for receptions, restaurants and hotels, client gifts and company invoicing." },
    image: "/images/life/desk-flowers.jpg",
  },
  care: {
    title: { sr: "Nega cveća: kako da buket traje duže", en: "Flower care: make your bouquet last longer" },
    description: { sr: "Jednostavni saveti floristkinja iz Rute: voda, sečenje, svetlo i nega po vrstama cveća.", en: "Simple advice from Ruta's florists: water, trimming, light and care by flower type." },
    image: "/images/studio/cutting-stem.jpg",
  },
  about: {
    title: { sr: "O nama: atelje na Dorćolu", en: "About us: a studio in Dorćol" },
    description: { sr: "Ruta je cvetni atelje u Strahinjića bana. Četiri floristkinje, sveže cveće sa veletržnice svako jutro i dostava danas.", en: "Ruta is a flower studio on Strahinjića bana. Four florists, fresh market flowers every morning and same-day delivery." },
    image: "/images/studio/making-bouquet.jpg",
  },
  reviews: {
    title: { sr: "Utisci kupaca", en: "Customer reviews" },
    description: { sr: "4,9 od 312 utisaka na Google-u. Šta kažu ljudi koji su poslali cveće iz Rute.", en: "4.9 from 312 Google reviews. What people who sent flowers with Ruta say." },
  },
  faq: {
    title: { sr: "Česta pitanja o porudžbini i dostavi", en: "FAQ: ordering and delivery" },
    description: { sr: "Do kada poručiti za danas, kako se plaća, šta ako primalac nije kod kuće, kako radi kartica i još mnogo toga.", en: "When to order for today, how to pay, what if the recipient isn't home, how the card works, and more." },
  },
  contact: {
    title: { sr: "Kontakt i atelje", en: "Contact and studio" },
    description: { sr: "Strahinjića bana 19, Dorćol. Radno vreme, telefon, e-mail i mapa do ateljea.", en: "Strahinjića bana 19, Dorćol. Opening hours, phone, email and a map to the studio." },
    image: "/images/city/dorcol-street.jpg",
  },
  giftCards: {
    title: { sr: "Poklon kartice", en: "Gift cards" },
    description: { sr: "Poklonite cveće po izboru: digitalna poklon kartica od 2.000 do 20.000 RSD, stiže e-mailom za par minuta.", en: "Give flowers of their choosing: a digital gift card from 2,000 to 20,000 RSD, delivered by email in minutes." },
  },
  wishlist: { title: { sr: "Lista želja", en: "Wishlist" }, description: { sr: "Sačuvani buketi.", en: "Saved bouquets." } },
  cart: { title: { sr: "Korpa", en: "Bag" }, description: { sr: "Vaša korpa.", en: "Your bag." } },
  checkout: { title: { sr: "Plaćanje", en: "Checkout" }, description: { sr: "Završite porudžbinu.", en: "Complete your order." } },
  success: { title: { sr: "Hvala na porudžbini", en: "Thank you for your order" }, description: { sr: "Porudžbina je primljena.", en: "Your order is in." } },
  track: { title: { sr: "Praćenje porudžbine", en: "Track your order" }, description: { sr: "Pratite porudžbinu po broju i e-mailu.", en: "Track an order by number and email." } },
  privacy: { title: { sr: "Politika privatnosti", en: "Privacy policy" }, description: { sr: "Kako Ruta čuva vaše podatke.", en: "How Ruta handles your data." } },
  terms: { title: { sr: "Uslovi korišćenja i kupovine", en: "Terms of use and sale" }, description: { sr: "Uslovi kupovine, dostave i reklamacija.", en: "Terms of sale, delivery and returns." } },
};

export function metaFor(locale: Locale, key: Exclude<PageKey, "home">): Metadata {
  const m = pageMeta[key];
  return buildMetadata({
    locale,
    title: m.title[locale],
    description: m.description[locale],
    alternates: pagePaths[key],
    ogImage: m.image,
    privatePage: privatePages.includes(key),
  });
}
