import type { Localized } from "@/lib/i18n";
import type { CategoryId, Review } from "@/lib/commerce/types";

/** Fictional Google-style reviews of the studio (first name + initial, real Belgrade details). */
export const storeReviews: (Review & { tag: Localized<string> })[] = [
  {
    id: "g1", name: "Jelena M.", area: "Vračar", rating: 5, date: "2026-09-21",
    tag: { sr: "Rođendan", en: "Birthday" },
    text: {
      sr: "Naručila sam u 13:40 iz kancelarije, buket je stigao mami na Crveni krst pre pet. Na kartici moj rukopis, kao da sam ga sama pisala. Ovo je nova omiljena cvećara.",
      en: "Ordered at 1:40 pm from the office and the bouquet reached my mum in Crveni krst before five. The card looked handwritten, as if I'd written it myself. New favourite florist.",
    },
  },
  {
    id: "g2", name: "Marko P.", area: "Novi Beograd", rating: 5, date: "2026-09-14",
    tag: { sr: "Godišnjica", en: "Anniversary" },
    text: {
      sr: "Kanta od 50 ruža za godišnjicu. Dostava kao iznenađenje, nisu zvali unapred, kurir je sačekao da supruga siđe. Sve tačno u terminu 18–21.",
      en: "A bucket of 50 roses for our anniversary. Surprise delivery, no call ahead, and the courier waited for my wife to come down. Right inside the 6–9 pm window.",
    },
  },
  {
    id: "g3", name: "Ana K.", area: "Beč → Zemun", rating: 5, date: "2026-09-02",
    tag: { sr: "Iz inostranstva", en: "From abroad" },
    text: {
      sr: "Živim u Beču i bake su mi u Zemunu. Platila sam karticom na engleskom sajtu, dobila fotografiju buketa pre isporuke. Baka je zvala sva u suzama.",
      en: "I live in Vienna and my grandmother is in Zemun. Paid by card on the English site and got a photo of the bouquet before it left. Grandma called me in tears.",
    },
  },
  {
    id: "g4", name: "Stefan R.", area: "Dorćol", rating: 5, date: "2026-08-27",
    tag: { sr: "Izvinjenje", en: "Apology" },
    text: {
      sr: "Trebalo mi je izvinjenje, i to brzo. Tri ruže, kratka poruka, i za sat vremena bile su na Cara Dušana. Radi.",
      en: "I needed an apology, and fast. Three roses, a short note, and an hour later they were on Cara Dušana. It works.",
    },
  },
  {
    id: "g5", name: "Milica T.", area: "Banovo brdo", rating: 5, date: "2026-08-19",
    tag: { sr: "Beba", en: "New baby" },
    text: {
      sr: "Bela hortenzija za porodilište u Narodnom frontu, uz balone. Sve je bilo nežno spakovano, a cveće je trajalo dve nedelje.",
      en: "A white hydrangea for the maternity ward, with balloons. Beautifully wrapped and the flowers lasted two weeks.",
    },
  },
  {
    id: "g6", name: "Nikola D.", area: "Savski venac", rating: 5, date: "2026-08-08",
    tag: { sr: "Za firmu", en: "Office" },
    text: {
      sr: "Imamo nedeljnu pretplatu za recepciju već pola godine. Svakog ponedeljka u 9 novi aranžman, a račun stiže uredno na firmu.",
      en: "We've had a weekly subscription for our reception for six months. A new arrangement every Monday at 9, and invoices go straight to the company.",
    },
  },
  {
    id: "g7", name: "Ivana S.", area: "Voždovac", rating: 4, date: "2026-07-30",
    tag: { sr: "Saučešće", en: "Sympathy" },
    text: {
      sr: "Hvala na mirnom i taktičnom pristupu. Bele ruže su stigle na vreme na Novo groblje. Jedina zamerka: želela bih više opcija za venac.",
      en: "Thank you for the calm, tactful approach. The white roses arrived on time at Novo groblje. My only wish: more wreath options.",
    },
  },
  {
    id: "g8", name: "Luka V.", area: "Zvezdara", rating: 5, date: "2026-07-22",
    tag: { sr: "Napravi buket", en: "Bouquet builder" },
    text: {
      sr: "Složio sam buket sam, suncokreti i eukaliptus u kraft papiru, i izgledao je tačno kao na ekranu. Cena se menjala uživo, bez iznenađenja na kraju.",
      en: "I built my own bouquet, sunflowers and eucalyptus in kraft paper, and it looked exactly like on screen. The price updated live, no surprises at the end.",
    },
  },
  {
    id: "g9", name: "Sara L.", area: "Senjak", rating: 5, date: "2026-07-10",
    tag: { sr: "Venčanje", en: "Wedding" },
    text: {
      sr: "Ruta je radila cveće za naše venčanje na Adi. Od bidermajera do stolova, sve u breskvi i beloj. Gosti i dalje pitaju ko je radio aranžmane.",
      en: "Ruta did the flowers for our wedding at Ada. From the bridal bouquet to the tables, all peach and white. Guests still ask who did the arrangements.",
    },
  },
  {
    id: "g10", name: "Petar J.", area: "Karaburma", rating: 5, date: "2026-06-29",
    tag: { sr: "Brza dostava", en: "Fast delivery" },
    text: {
      sr: "Zaboravio sam imendan. Poručio u 13:55, odbrojavanje na sajtu me spasilo. Stiglo do 18h.",
      en: "Forgot a name day. Ordered at 1:55 pm and the countdown on the site saved me. Delivered by 6 pm.",
    },
  },
  {
    id: "g11", name: "Tamara N.", area: "Čubura", rating: 5, date: "2026-06-12",
    tag: { sr: "Atelje", en: "Studio" },
    text: {
      sr: "Svratila sam u atelje u Strahinjića bana. Devojke su mi za pet minuta složile buket od onoga što je tog jutra stiglo. Mirisno i lepo.",
      en: "Dropped by the studio on Strahinjića bana. In five minutes they put together a bouquet from what had arrived that morning. Fragrant and lovely.",
    },
  },
  {
    id: "g12", name: "Dragan B.", area: "Mirijevo", rating: 5, date: "2026-05-30",
    tag: { sr: "Biljke", en: "Plants" },
    text: {
      sr: "Kupio sam baštu kaktusa za ćerku. Došla je sa karticom za negu, napisanom ručno. Mala stvar, a mnogo znači.",
      en: "Bought a cactus garden for my daughter. It came with a handwritten care card. A small thing that means a lot.",
    },
  },
];

const pool: Record<"fresh" | "plant" | "dried" | "addon", Review[]> = {
  fresh: [
    { id: "p1", name: "Jovana R.", area: "Vračar", rating: 5, date: "2026-09-26", text: { sr: "Cveće je bilo sveže još 10 dana. Pakovanje predivno.", en: "Still fresh ten days later. Gorgeous wrapping." } },
    { id: "p2", name: "Aleksandar Ž.", area: "Novi Beograd", rating: 5, date: "2026-09-18", text: { sr: "Poručio u podne, stiglo u terminu 15–18. Supruga oduševljena.", en: "Ordered at noon, arrived in the 3–6 pm window. My wife loved it." } },
    { id: "p3", name: "Katarina F.", area: "Zemun", rating: 4, date: "2026-09-04", text: { sr: "Lepši uživo nego na slici. Malo manji nego što sam očekivala za srednju veličinu.", en: "Lovelier in person. A bit smaller than I expected for the medium." } },
    { id: "p4", name: "Bojan M.", area: "Dorćol", rating: 5, date: "2026-08-22", text: { sr: "Kartica sa porukom je bila ručno pisana. To se ne viđa.", en: "The card message was handwritten. You don't see that often." } },
    { id: "p5", name: "Nevena P.", area: "Voždovac", rating: 5, date: "2026-08-03", text: { sr: "Treći put naručujem, uvek isti kvalitet.", en: "Third order, always the same quality." } },
  ],
  plant: [
    { id: "q1", name: "Uroš K.", area: "Zvezdara", rating: 5, date: "2026-09-12", text: { sr: "Biljka zdrava, saksija još lepša nego na slici.", en: "Healthy plant, and the pot is even nicer than in the photo." } },
    { id: "q2", name: "Mina S.", area: "Čukarica", rating: 5, date: "2026-08-15", text: { sr: "Uz biljku je stigla kartica za negu. Super poklon za kancelariju.", en: "Came with a care card. A great office gift." } },
    { id: "q3", name: "Filip G.", area: "Vračar", rating: 4, date: "2026-07-28", text: { sr: "Sve odlično, dostava malo kasnila zbog gužve, ali su javili.", en: "All good; delivery ran a little late due to traffic, but they let me know." } },
  ],
  dried: [
    { id: "d1", name: "Teodora V.", area: "Dorćol", rating: 5, date: "2026-09-20", text: { sr: "Stoji mi na komodi od leta i izgleda isto. Topao, jesenji ton.", en: "On my sideboard since summer and it still looks the same. Warm, autumnal tone." } },
    { id: "d2", name: "Igor L.", area: "Banovo brdo", rating: 5, date: "2026-08-30", text: { sr: "Odličan poklon za nekog ko nema vremena za cveće.", en: "A great gift for someone with no time for fresh flowers." } },
    { id: "d3", name: "Sanja B.", area: "Senjak", rating: 5, date: "2026-08-02", text: { sr: "Upakovano pažljivo, ništa se nije osulo.", en: "Packed carefully, nothing shed." } },
  ],
  addon: [
    { id: "a1", name: "Maja D.", area: "Vračar", rating: 5, date: "2026-09-08", text: { sr: "Dodala sam uz buket, stiglo zajedno, uredno.", en: "Added it to a bouquet, arrived together, neatly." } },
    { id: "a2", name: "Vuk T.", area: "Zemun", rating: 5, date: "2026-08-11", text: { sr: "Mali dodatak, a poklon izgleda potpuno drugačije.", en: "Small extra, completely different gift." } },
  ],
};

const poolFor = (c: CategoryId) => (c === "plants" ? pool.plant : c === "dried" ? pool.dried : c === "addons" ? pool.addon : pool.fresh);

/** 2–5 reviews per product, rotated from the category pool so neighbouring products differ. */
export function reviewsFor(category: CategoryId, seed: number, count: number): Review[] {
  const p = poolFor(category);
  return Array.from({ length: Math.min(count, p.length) }, (_, i) => {
    const r = p[(seed + i) % p.length];
    return { ...r, id: `${r.id}-${seed}` };
  });
}

export const ratingSummary = {
  value: 4.9,
  count: 312,
  breakdown: [
    { stars: 5, count: 286 },
    { stars: 4, count: 21 },
    { stars: 3, count: 4 },
    { stars: 2, count: 1 },
    { stars: 1, count: 0 },
  ],
};
