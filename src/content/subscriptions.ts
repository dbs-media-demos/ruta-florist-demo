import type { Localized } from "@/lib/i18n";

type L = Localized<string>;

export const REGULAR = 4900;

export const plans = [
  {
    id: "weekly",
    name: { sr: "Nedeljno", en: "Weekly" } as L,
    every: { sr: "svakog ponedeljka ili petka", en: "every Monday or Friday" } as L,
    price: 3900,
    deliveries: 4,
    note: { sr: "Najomiljenije za kancelarije i restorane", en: "A favourite with offices and restaurants" } as L,
    image: "/images/life/office-lilies.jpg",
  },
  {
    id: "biweekly",
    name: { sr: "Dvonedeljno", en: "Every two weeks" } as L,
    every: { sr: "svake druge nedelje", en: "every other week" } as L,
    price: 4300,
    deliveries: 2,
    note: { sr: "Taman da cveće ne uvene pre sledećeg", en: "Just right: the flowers last until the next" } as L,
    image: "/images/life/living-peonies.jpg",
  },
  {
    id: "monthly",
    name: { sr: "Mesečno", en: "Monthly" } as L,
    every: { sr: "prvog petka u mesecu", en: "the first Friday of the month" } as L,
    price: 4700,
    deliveries: 1,
    note: { sr: "Mali ritual za dom", en: "A small ritual for home" } as L,
    image: "/images/life/tulips-table.jpg",
  },
] as const;

export const savingPercent = (price: number) => Math.round((1 - price / REGULAR) * 100);

export const subsCopy = {
  meta: {
    title: { sr: "Pretplata na cveće za dom i firmu", en: "Flower subscriptions for home and office" } as L,
    description: {
      sr: "Sveže cveće nedeljno, dvonedeljno ili mesečno, za stan ili kancelariju u Beogradu. Do 20% jeftinije, pauza kad god želite.",
      en: "Fresh flowers weekly, fortnightly or monthly, for a Belgrade home or office. Up to 20% off, pause any time.",
    } as L,
  },
  title: { sr: "Cveće koje dolazi samo", en: "Flowers that just turn up" } as L,
  intro: {
    sr: "Izaberite ritam, a mi biramo najlepše sezonsko cveće i donosimo ga u istom terminu, svaki put. Bez ugovora, pauza jednim klikom.",
    en: "Pick a rhythm and we choose the best seasonal flowers and bring them in the same window, every time. No contract, pause in one click.",
  } as L,
  pause: { sr: "Pauzirajte ili otkažite bilo kada. Za odmor, praznike ili samo tako.", en: "Pause or cancel any time. For holidays, travel or no reason at all." } as L,
  homeOffice: { sr: ["Za dom", "Za firmu"], en: ["For home", "For the office"] },
  perDelivery: { sr: "po dostavi", en: "per delivery" } as L,
  save: { sr: "ušteda", en: "you save" } as L,
  perMonth: { sr: "mesečno", en: "a month" } as L,
  choose: { sr: "Izaberite plan", en: "Choose a plan" } as L,
  start: { sr: "Započni pretplatu", en: "Start subscription" } as L,
  started: { sr: "Pretplata je spremna! Ovo je demo: ništa nije naplaćeno, ali ovako bi izgledala potvrda.", en: "Your subscription is set! This is a demo: nothing is charged, but this is how the confirmation would look." } as L,
  steps: [
    { title: { sr: "Izaberite ritam", en: "Pick a rhythm" } as L, text: { sr: "Nedeljno, na dve nedelje ili jednom mesečno.", en: "Weekly, fortnightly or monthly." } as L },
    { title: { sr: "Mi biramo cveće", en: "We choose the flowers" } as L, text: { sr: "Sezonski, uvek drugačije, u paleti koju volite.", en: "Seasonal, always different, in the palette you like." } as L },
    { title: { sr: "Stiže u isto vreme", en: "Arrives on time" } as L, text: { sr: "Isti dan i termin, svaki put. Vaza na zahtev.", en: "Same day and window every time. Vase on request." } as L },
  ],
};
