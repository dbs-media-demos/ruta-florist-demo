import type { Localized } from "@/lib/i18n";

type L = Localized<string>;

export const home = {
  meta: {
    title: { sr: "Ruta · Cveće koje stiže danas | Cvećara Beograd", en: "Ruta · Flowers delivered today | Belgrade florist" } as L,
    description: {
      sr: "Cvetni atelje na Dorćolu. Poručite buket do 14:00 i stiže danas, bilo gde u Beogradu. Ruže, korpe, biljke, suvo cveće i pretplate.",
      en: "A flower studio in Dorćol, Belgrade. Order by 14:00 for same-day delivery anywhere in the city. Bouquets, roses, baskets, plants and subscriptions.",
    } as L,
  },
  hero: {
    eyebrow: { sr: "Cvetni atelje · Dorćol, Beograd", en: "Flower studio · Dorćol, Belgrade" } as L,
    line1: { sr: "Cveće koje", en: "Flowers," } as L,
    line2: { sr: "stiže danas.", en: "arriving today." } as L,
    sub: {
      sr: "Buketi vezani rukom, poručeni za 60 sekundi i dostavljeni u terminu koji vi izaberete.",
      en: "Hand-tied bouquets, ordered in 60 seconds and delivered in the window you choose.",
    } as L,
    shop: { sr: "Poruči cveće", en: "Order flowers" } as L,
    build: { sr: "Napravi svoj buket", en: "Build your own" } as L,
    scroll: { sr: "Skrolujte da procveta", en: "Scroll to bloom" } as L,
  },
  today: {
    eyebrow: { sr: "Od pijace do vrata", en: "From market to door" } as L,
    text: {
      sr: "U šest smo na veletržnici. U devet je buket vezan u ateljeu na Dorćolu. Do večeri je na vratima, bilo gde u Beogradu.",
      en: "At six we're at the flower market. By nine the bouquet is tied at our Dorćol studio. By evening it's at the door, anywhere in Belgrade.",
    } as L,
    stops: [
      { time: "06:00", label: { sr: "Veletržnica", en: "Flower market" } as L },
      { time: "09:00", label: { sr: "Atelje, Dorćol", en: "Studio, Dorćol" } as L },
      { time: "14:00", label: { sr: "Poslednja porudžbina", en: "Last order" } as L },
      { time: "21:00", label: { sr: "Na vratima", en: "At the door" } as L },
    ],
    stats: [
      { value: 90, suffix: { sr: " min", en: " min" } as L, label: { sr: "dostava u Starom gradu", en: "delivery in the Old Town" } as L },
      { value: 7, suffix: { sr: " dana", en: " days" } as L, label: { sr: "u nedelji, i nedeljom", en: "a week, Sundays too" } as L },
      { value: 4.9, suffix: { sr: " ★", en: " ★" } as L, label: { sr: "312 utisaka na Google-u", en: "312 Google reviews" } as L },
    ],
  },
  bestsellers: {
    eyebrow: { sr: "Najprodavanije", en: "Bestsellers" } as L,
    title: { sr: "Buketi koje Beograd naručuje najčešće", en: "The bouquets Belgrade orders most" } as L,
  },
  occasions: {
    eyebrow: { sr: "Povodi", en: "Occasions" } as L,
    title: { sr: "Za koji povod?", en: "What's the occasion?" } as L,
  },
  week: {
    eyebrow: { sr: "Cveće nedelje · na popustu", en: "Flowers of the week · on sale" } as L,
    title: { sr: "Prelistajte nedelju u cveću", en: "Flick through this week's flowers" } as L,
    text: {
      sr: "Prevucite karte. Okrenite ih da vidite šta cvet znači, kako se neguje i koliko je ove nedelje jeftiniji.",
      en: "Drag the cards. Turn them over to see what the flower means, how to care for it and how much less it costs this week.",
    } as L,
  },
  studio: {
    word: "Dorćol",
    eyebrow: { sr: "Atelje", en: "The studio" } as L,
    title: { sr: "Atelje u Strahinjića bana", en: "A studio on Strahinjića bana" } as L,
    text: {
      sr: "Ruta je mala radionica sa velikim prozorom. Četiri floristkinje, jedan sto od hrastovine i hladnjača koja se puni svako jutro. Svaki buket vezujemo rukom i fotografišemo pre nego što krene ka vama.",
      en: "Ruta is a small workshop with a big window. Four florists, one oak table and a cold room that fills up every morning. We tie every bouquet by hand and photograph it before it leaves for you.",
    } as L,
    link: { sr: "Upoznajte atelje", en: "Meet the studio" } as L,
  },
  builder: {
    eyebrow: { sr: "Napravi buket", en: "Build a bouquet" } as L,
    title: { sr: "Složite ga sami, stablo po stablo", en: "Compose it yourself, stem by stem" } as L,
    text: {
      sr: "Izaberite veličinu, paletu, cveće i papir. Buket se slaže pred vama, a cena se menja uživo.",
      en: "Pick a size, a palette, the stems and the paper. The bouquet composes itself in front of you and the price updates live.",
    } as L,
  },
  zones: {
    eyebrow: { sr: "Dostava", en: "Delivery" } as L,
    title: { sr: "Ceo Beograd, kvart po kvart", en: "All of Belgrade, neighbourhood by neighbourhood" } as L,
    text: {
      sr: "Pređite preko zone da vidite cenu i vreme dostave. U centralnim zonama dostava je besplatna preko 6.000 RSD.",
      en: "Hover or tap a zone to see the delivery price and time. Central zones deliver free over 6,000 RSD.",
    } as L,
  },
  subs: {
    eyebrow: { sr: "Pretplata", en: "Subscriptions" } as L,
    title: { sr: "Sveže cveće, svake nedelje, bez razmišljanja", en: "Fresh flowers every week, without thinking about it" } as L,
  },
  reviews: {
    eyebrow: { sr: "Utisci", en: "Reviews" } as L,
    title: { sr: "4,9 od 312 ljudi koji su poslali cveće", en: "4.9 from 312 people who sent flowers" } as L,
  },
  doors: {
    eyebrow: { sr: "Beograd, vrata po vrata", en: "Belgrade, door by door" } as L,
    title: { sr: "Od Gardoša do Banovog brda", en: "From Gardoš to Banovo brdo" } as L,
  },
  final: {
    title: { sr: "Poručite do 14:00. Stiže danas.", en: "Order by 14:00. It arrives today." } as L,
    text: { sr: "Ili svratite u atelje, Strahinjića bana 19. Kafa je uvek tu.", en: "Or drop by the studio at Strahinjića bana 19. There's always coffee." } as L,
  },
};
