import type { Localized } from "@/lib/i18n";
import type { CategoryId, CollectionId, OccasionId, PaletteId, PaletteOption, Product, Variant } from "@/lib/commerce/types";
import { reviewsFor } from "./reviews";

/**
 * Ruta's catalogue (fictional). Prices in RSD. Photos: one Pexels studio shoot, see
 * public/images/SOURCES.md. A real client would replace this file with a Shopify/ERP sync.
 */

const SALE_ENDS = "2026-10-12T23:59:00+02:00";

const round100 = (n: number) => Math.round(n / 100) * 100;

type SizeOpts = { compare?: number; stock?: [number, number, number, number]; stems?: [number, number, number, number] };

/** Mali / Srednji / Veliki / Raskošni with live price per size. `base` is the Srednji price. */
function sized(code: string, base: number, o: SizeOpts = {}): Variant[] {
  const mult = [0.72, 1, 1.45, 2.1];
  const names: Localized<string>[] = [
    { sr: "Mali", en: "Small" },
    { sr: "Srednji", en: "Medium" },
    { sr: "Veliki", en: "Large" },
    { sr: "Raskošni", en: "Lavish" },
  ];
  const stems = o.stems ?? [9, 15, 25, 41];
  const stock = o.stock ?? [12, 18, 9, 4];
  return names.map((label, i) => ({
    id: ["s", "m", "l", "xl"][i],
    label,
    note: { sr: `≈ ${stems[i]} cvetova`, en: `≈ ${stems[i]} stems` },
    price: round100(base * mult[i]),
    compareAt: o.compare ? round100(o.compare * mult[i]) : undefined,
    stock: stock[i],
    sku: `RT-${code}-${["S", "M", "L", "XL"][i]}`,
  }));
}

function single(code: string, price: number, stock = 14, compare?: number, label: Localized<string> = { sr: "Standard", en: "Standard" }): Variant[] {
  return [{ id: "one", label, price, compareAt: compare, stock, sku: `RT-${code}` }];
}

const pal = (id: PaletteId, sr: string, en: string, image: number): PaletteOption => ({ id, label: { sr, en }, image });

const img = (slug: string, n: number) => Array.from({ length: n }, (_, i) => `/images/products/${slug}-${i + 1}.jpg`);

type Seed = Omit<Product, "images" | "reviews" | "reviewCount" | "rating" | "featured"> & {
  photos: number;
  rating?: number;
  reviewCount?: number;
  shown?: number;
};

const seeds: Seed[] = [
  // ——— Buketi ———
  {
    id: "white-morning", category: "bouquets", photos: 3,
    slug: { sr: "belo-jutro", en: "white-morning" },
    name: { sr: "Belo jutro", en: "White Morning" },
    alt: { sr: "Ruka drži buket belih ruža uz beli zid", en: "A hand holding a bouquet of white roses against a white wall" },
    short: { sr: "Bele ruže vezane rukom, bez suvišnog. Tiho i otmeno.", en: "Hand-tied white roses, nothing extra. Quiet and elegant." },
    long: {
      sr: "Belo jutro je buket koji ne viče. Holandske bele ruže na dugim stablima, vezane rukom u Ateljeu na Dorćolu i umotane u papir boje kreča. Za prve sastanke, zahvalnice i dane kada želite da kažete mnogo, a tiho.",
      en: "White Morning is a bouquet that doesn't shout. Long-stemmed Dutch white roses, hand-tied at the Dorćol studio and wrapped in chalk-white paper. For first dates, thank-yous and days when you want to say a lot, quietly.",
    },
    materials: { sr: "Bele ruže Avalanche (60 cm), zelenilo ruskus, papir boje kreča, pamučna traka.", en: "Avalanche white roses (60 cm), ruscus greenery, chalk-white paper, cotton ribbon." },
    care: { sr: "Podsecite stabljike koso za 2 cm, menjajte vodu na dva dana, držite dalje od radijatora.", en: "Trim stems at an angle by 2 cm, change the water every two days, keep away from radiators." },
    meaning: { sr: "Bela ruža: novi počeci, poštovanje, tiha ljubav.", en: "White rose: new beginnings, respect, quiet love." },
    occasions: ["anniversary", "thanks", "sympathy", "love"], palette: "white",
    variants: sized("WM", 5900, { stems: [7, 11, 19, 31] }), needsDelivery: true, bestseller: true,
    addedAt: "2026-03-02", pairsWith: ["ceramic-vase", "linen-candle", "first-snow"], rating: 4.9, reviewCount: 64, shown: 5,
  },
  {
    id: "carnation-blush", category: "bouquets", photos: 3,
    slug: { sr: "karanfil-nezno", en: "carnation-blush" },
    name: { sr: "Karanfil, nežno", en: "Carnation Blush" },
    alt: { sr: "Buket ružičastih karanfila u ruci", en: "A bunch of blush pink carnations held in a hand" },
    short: { sr: "Puderasti karanfili, vraćeni u modu kako zaslužuju.", en: "Powder-pink carnations, back in style the way they deserve." },
    long: {
      sr: "Karanfil je bio cvet naših baka, a danas je cvet svakog dobrog ateljea. Ovi su puderasto ružičasti, gusto naborani i traju i do dve nedelje. Savršen 'samo tako' buket.",
      en: "Carnations were our grandmothers' flower; today they're every good studio's secret. These are powder pink, densely ruffled and last up to two weeks. The perfect just-because bunch.",
    },
    materials: { sr: "Ružičasti karanfili, svilena traka.", en: "Blush carnations, silk ribbon." },
    care: { sr: "Sveža voda svaka dva dana; karanfili vole hladniju sobu.", en: "Fresh water every two days; carnations like a cooler room." },
    meaning: { sr: "Ružičasti karanfil: zahvalnost i majčinska ljubav.", en: "Pink carnation: gratitude and a mother's love." },
    occasions: ["thanks", "justBecause", "birthday"], palette: "blush",
    variants: sized("CB", 2900, { compare: 3600, stock: [9, 14, 2, 3] }), needsDelivery: true, saleEnds: SALE_ENDS,
    addedAt: "2026-05-10", pairsWith: ["artisan-chocolate", "pastel-balloons", "ceramic-vase"], rating: 4.8, reviewCount: 41, shown: 3,
  },
  {
    id: "grandmas-garden", category: "bouquets", photos: 3,
    slug: { sr: "bakina-basta", en: "grandmas-garden" },
    name: { sr: "Bakina bašta", en: "Grandma's Garden" },
    alt: { sr: "Buket belih i ružičastih karanfila uz beli zid", en: "A bouquet of white and pink carnations against a white wall" },
    short: { sr: "Beli i ružičasti karanfili, kao iz dvorišta na Čuburi.", en: "White and pink carnations, like a courtyard in Čubura." },
    long: {
      sr: "Mešavina belih i ružičastih karanfila sa grančicom gipsofile. Buket koji miriše na nedeljni ručak i otvoren prozor. Možete birati nežniju ili vedriju paletu.",
      en: "A mix of white and pink carnations with a sprig of gypsophila. A bouquet that smells of Sunday lunch and an open window. Choose a softer or brighter palette.",
    },
    materials: { sr: "Karanfili (beli, ružičasti), gipsofila, kraft papir.", en: "Carnations (white, pink), gypsophila, kraft paper." },
    care: { sr: "Uklonite listove ispod nivoa vode, menjajte vodu redovno.", en: "Strip leaves below the waterline and change the water regularly." },
    meaning: { sr: "Karanfil: odanost i ljubav koja traje.", en: "Carnation: devotion and lasting love." },
    occasions: ["birthday", "thanks", "justBecause"], palette: "blush",
    palettes: [pal("blush", "Nežna", "Soft", 0), pal("bright", "Vedra", "Bright", 1), pal("white", "Bela", "White", 2)],
    variants: sized("GG", 3600), needsDelivery: true, isNew: true,
    addedAt: "2026-09-20", pairsWith: ["ceramic-vase", "artisan-chocolate", "carnation-blush"], rating: 4.9, reviewCount: 18, shown: 3,
  },
  {
    id: "sunny-side", category: "bouquets", photos: 3,
    slug: { sr: "suncana-strana", en: "sunny-side" },
    name: { sr: "Sunčana strana", en: "Sunny Side" },
    alt: { sr: "Žute hrizanteme u ruci ispred belog zida", en: "Yellow chrysanthemums held in front of a white wall" },
    short: { sr: "Žute hrizanteme koje rade isto što i prozor na jug.", en: "Yellow chrysanthemums that do what a south-facing window does." },
    long: {
      sr: "Raskošne žute hrizanteme, vezane jednostavno da boja radi sav posao. Traju dugo, ne mirišu napadno i podižu svaku kancelariju u sivom oktobru.",
      en: "Lush yellow chrysanthemums, tied simply so the colour does all the work. Long-lasting, not overpowering in scent, and they lift any office in grey October.",
    },
    materials: { sr: "Žute hrizanteme, zelenilo, kraft papir.", en: "Yellow chrysanthemums, greenery, kraft paper." },
    care: { sr: "Hrizanteme traju i do tri nedelje uz svežu vodu.", en: "Chrysanthemums last up to three weeks with fresh water." },
    meaning: { sr: "Žuta hrizantema: radost, optimizam, prijateljstvo.", en: "Yellow chrysanthemum: joy, optimism, friendship." },
    occasions: ["birthday", "justBecause", "thanks"], palette: "sunny",
    variants: sized("SS", 2700, { compare: 3400 }), needsDelivery: true, saleEnds: SALE_ENDS,
    addedAt: "2026-08-02", pairsWith: ["pastel-balloons", "august-at-ada", "linen-candle"], rating: 4.7, reviewCount: 22, shown: 3,
  },
  {
    id: "meadow", category: "bouquets", photos: 3,
    slug: { sr: "livada", en: "meadow" },
    name: { sr: "Livada", en: "Meadow" },
    alt: { sr: "Bele hrizanteme rade u buketu uz beli zid", en: "White daisy chrysanthemums in a bouquet against a white wall" },
    short: { sr: "Bele rade, lake i razbarušene, kao jun na Fruškoj gori.", en: "White daisies, light and tousled, like June on Fruška gora." },
    long: {
      sr: "Livada je buket za ljude koji ne vole formalnost. Bele hrizanteme rade, razbarušene i vedre, sa malo zelenila. Izaberite belu, žutu ili mešanu paletu.",
      en: "Meadow is for people who don't like formality. White daisy chrysanthemums, tousled and cheerful, with a little greenery. Choose white, yellow or a mixed palette.",
    },
    materials: { sr: "Hrizanteme rade, zelenilo, beli papir.", en: "Daisy chrysanthemums, greenery, white paper." },
    care: { sr: "Podsecite stabljike, voda do pola vaze.", en: "Trim stems, fill the vase halfway." },
    meaning: { sr: "Rada: nevinost, iskrenost, novi dan.", en: "Daisy: innocence, honesty, a new day." },
    occasions: ["justBecause", "birthday", "baby", "sympathy"], palette: "white",
    palettes: [pal("white", "Bela", "White", 0), pal("sunny", "Žuta", "Yellow", 1), pal("bright", "Mešana", "Mixed", 2)],
    variants: sized("MD", 3300), needsDelivery: true,
    addedAt: "2026-04-14", pairsWith: ["ceramic-vase", "pastel-balloons", "sunny-side"], rating: 4.8, reviewCount: 27, shown: 3,
  },
  {
    id: "august-at-ada", category: "bouquets", photos: 3,
    slug: { sr: "avgust-na-adi", en: "august-at-ada" },
    name: { sr: "Avgust na Adi", en: "August at Ada" },
    alt: { sr: "Buket suncokreta u ruci uz beli zid", en: "A bunch of sunflowers held against a white wall" },
    short: { sr: "Suncokreti visokih stabljika. Leto koje se ne predaje.", en: "Tall-stemmed sunflowers. A summer that won't give up." },
    long: {
      sr: "Suncokreti sa vojvođanskih polja, isečeni ujutru i doneti u atelje do podneva. Buket za rođendane, diplome i sve one koji zaslužuju malo sunca u stanu.",
      en: "Sunflowers from Vojvodina fields, cut in the morning and in the studio by noon. A bouquet for birthdays, graduations and anyone who deserves a little sun at home.",
    },
    materials: { sr: "Suncokreti, eukaliptus, kraft papir, kanap.", en: "Sunflowers, eucalyptus, kraft paper, twine." },
    care: { sr: "Puno vode: suncokreti piju mnogo. Dolivajte svakog dana.", en: "Plenty of water: sunflowers drink a lot. Top up daily." },
    meaning: { sr: "Suncokret: odanost i toplina.", en: "Sunflower: loyalty and warmth." },
    occasions: ["birthday", "thanks", "justBecause"], palette: "sunny",
    variants: sized("AA", 4200, { stems: [5, 9, 15, 25] }), needsDelivery: true, bestseller: true,
    addedAt: "2026-07-01", pairsWith: ["golden-wheat", "linen-candle", "sunny-side"], rating: 4.9, reviewCount: 38, shown: 4,
  },
  {
    id: "blue-danube", category: "bouquets", photos: 4,
    slug: { sr: "plavi-dunav", en: "blue-danube" },
    name: { sr: "Plavi Dunav", en: "Blue Danube" },
    alt: { sr: "Plava hortenzija u ruci, beli zid", en: "A blue hydrangea held in a hand, white wall" },
    short: { sr: "Plave hortenzije, krupne kao oblaci nad Velikim ratnim ostrvom.", en: "Blue hydrangeas, big as clouds over Great War Island." },
    long: {
      sr: "Hortenzije u boji Dunava u maglovito jutro. Jedan cvet ispuni celu vazu, tri naprave pravu scenu. Odličan izbor za nekoga ko voli upečatljivo, ali mirno.",
      en: "Hydrangeas the colour of the Danube on a misty morning. One head fills a vase; three make a scene. A great choice for someone who likes bold but calm.",
    },
    materials: { sr: "Plave hortenzije, lišće hortenzije, papir boje magle.", en: "Blue hydrangeas, hydrangea leaves, mist-grey paper." },
    care: { sr: "Hortenzije piju i kroz cvet: poprskajte ih vodom svako jutro.", en: "Hydrangeas drink through their petals too: mist them every morning." },
    meaning: { sr: "Hortenzija: zahvalnost i iskrena osećanja.", en: "Hydrangea: gratitude and heartfelt emotion." },
    occasions: ["thanks", "anniversary", "justBecause"], palette: "blue",
    variants: sized("BD", 4800, { stems: [1, 3, 5, 9], stock: [8, 10, 6, 2] }), needsDelivery: true, bestseller: true,
    addedAt: "2026-06-11", pairsWith: ["ceramic-vase", "cloud", "white-morning"], rating: 4.9, reviewCount: 33, shown: 4,
  },
  {
    id: "cloud", category: "bouquets", photos: 3,
    slug: { sr: "oblak", en: "cloud" },
    name: { sr: "Oblak", en: "Cloud" },
    alt: { sr: "Buket gipsofile u ruci uz beli zid", en: "A gypsophila bouquet held against a white wall" },
    short: { sr: "Samo gipsofila. Prozračno, lako, nikad dosadno.", en: "Just gypsophila. Airy, light, never boring." },
    long: {
      sr: "Hiljade sitnih belih cvetova u jednom oblaku. Minimalistički buket koji izgleda skupo, a lagan je za džep. Odličan i kao dodatak drugom buketu.",
      en: "Thousands of tiny white blooms in one cloud. A minimalist bouquet that looks expensive but is easy on the wallet. Lovely as an add-on to another bouquet too.",
    },
    materials: { sr: "Gipsofila, prozirni papir, pamučna traka.", en: "Gypsophila, translucent paper, cotton ribbon." },
    care: { sr: "Gipsofila se lepo i suši: posle nedelju dana okačite je naopako.", en: "Gypsophila dries beautifully: after a week, hang it upside down." },
    meaning: { sr: "Gipsofila: večna ljubav i čistota.", en: "Gypsophila: everlasting love and purity." },
    occasions: ["baby", "love", "justBecause"], palette: "white",
    variants: sized("CL", 2400, { compare: 2900 }), needsDelivery: true, saleEnds: SALE_ENDS,
    addedAt: "2026-05-28", pairsWith: ["one-red-rose", "pastel-balloons", "blue-danube"], rating: 4.7, reviewCount: 19, shown: 2,
  },
  {
    id: "first-snow", category: "bouquets", photos: 3,
    slug: { sr: "prvi-sneg", en: "first-snow" },
    name: { sr: "Prvi sneg", en: "First Snow" },
    alt: { sr: "Bela hortenzija u ruci, beli zid", en: "A white hydrangea held in a hand, white wall" },
    short: { sr: "Bela hortenzija i bele ruže. Mirno, svetlo, dostojanstveno.", en: "White hydrangea and white roses. Calm, light, dignified." },
    long: {
      sr: "Kompozicija u belom: hortenzija, ruže i malo zelenila. Pravimo je za saučešća, za porodilišta i za trenutke kada su reči suvišne. Isporuka je tiha i bez telefoniranja, ako tako želite.",
      en: "A composition in white: hydrangea, roses and a little greenery. We make it for condolences, maternity wards and moments when words are too much. Delivery is quiet, with no calls, if you prefer.",
    },
    materials: { sr: "Bela hortenzija, bele ruže, ruskus, beli papir.", en: "White hydrangea, white roses, ruscus, white paper." },
    care: { sr: "Hladnija prostorija produžava trajanje; prskajte hortenziju.", en: "A cooler room helps it last; mist the hydrangea." },
    meaning: { sr: "Belo cveće: poštovanje, mir, sećanje.", en: "White flowers: respect, peace, remembrance." },
    occasions: ["sympathy", "baby", "thanks"], palette: "white",
    variants: sized("FS", 5400), needsDelivery: true,
    addedAt: "2026-02-18", pairsWith: ["linen-candle", "white-roses-vase", "white-morning"], rating: 5, reviewCount: 24, shown: 3,
  },
  {
    id: "little-gesture", category: "bouquets", photos: 3,
    slug: { sr: "mali-znak-paznje", en: "little-gesture" },
    name: { sr: "Mali znak pažnje", en: "Little Gesture" },
    alt: { sr: "Mali buket sa crvenom ružom i lila mašnom", en: "A small bouquet with a red rose and a lilac bow" },
    short: { sr: "Jedna ruža, gipsofila i lila mašna. Za 'mislim na tebe'.", en: "One rose, gypsophila and a lilac bow. For 'thinking of you'." },
    long: {
      sr: "Najmanji buket u ateljeu i jedan od najomiljenijih. Crvena ruža u oblaku gipsofile, vezana lila mašnom. Stane u ruku, a kaže dovoljno.",
      en: "The smallest bouquet in the studio and one of the most loved. A red rose in a cloud of gypsophila, tied with a lilac bow. Fits in one hand and says enough.",
    },
    materials: { sr: "Crvena ruža, gipsofila, lila satenska mašna.", en: "Red rose, gypsophila, lilac satin bow." },
    care: { sr: "Mala vaza ili čaša, sveža voda.", en: "A small vase or glass, fresh water." },
    meaning: { sr: "Crvena ruža: ljubav; gipsofila: nežnost.", en: "Red rose: love; gypsophila: tenderness." },
    occasions: ["love", "sorry", "justBecause"], palette: "bright",
    variants: single("LG", 2400, 22), needsDelivery: true, isNew: true,
    addedAt: "2026-09-25", pairsWith: ["artisan-chocolate", "one-red-rose", "pastel-balloons"], rating: 4.9, reviewCount: 15, shown: 3,
  },
  {
    id: "florists-choice", category: "bouquets", photos: 3,
    slug: { sr: "izbor-floristkinje", en: "florists-choice" },
    name: { sr: "Izbor floristkinje", en: "Florist's Choice" },
    alt: { sr: "Floristkinja slaže buket od sezonskog cveća", en: "A florist arranging a bouquet of seasonal flowers" },
    short: { sr: "Prepustite nama: najlepše što je jutros stiglo na pijacu.", en: "Leave it to us: the best of what arrived at the market this morning." },
    long: {
      sr: "Svako jutro biramo cveće na veletržnici. Izbor floristkinje je buket od onoga što je tog dana najlepše, u paleti koju vi izaberete. Svaki je jedinstven, i uvek dobijete više cveća za istu cenu.",
      en: "Every morning we pick flowers at the wholesale market. Florist's Choice is made from the best of that day, in the palette you choose. Each one is unique, and you always get more flowers for the price.",
    },
    materials: { sr: "Sezonsko cveće po izboru floristkinje.", en: "Seasonal flowers chosen by our florist." },
    care: { sr: "Kartica za negu je uvek u buketu.", en: "A care card always comes with the bouquet." },
    meaning: { sr: "Iznenađenje: buket koji niko drugi neće imati.", en: "Surprise: a bouquet nobody else will have." },
    occasions: ["birthday", "anniversary", "thanks", "justBecause"], palette: "bright",
    palettes: [pal("bright", "Vedra", "Bright", 0), pal("blush", "Nežna", "Soft", 1), pal("white", "Bela", "White", 2)],
    variants: sized("FC", 4500), needsDelivery: true, bestseller: true,
    addedAt: "2026-01-10", pairsWith: ["ceramic-vase", "artisan-chocolate", "linen-candle"], rating: 4.9, reviewCount: 57, shown: 5,
  },
  // ——— Ruže ———
  {
    id: "one-red-rose", category: "roses", photos: 3,
    slug: { sr: "jedna-ruza", en: "one-red-rose" },
    name: { sr: "Jedna ruža", en: "One Red Rose" },
    alt: { sr: "Ruka drži jednu crvenu ružu ispred belog zida", en: "A hand holding a single red rose against a white wall" },
    short: { sr: "Jedna ekvadorska ruža na stablu od 70 cm. Ništa više nije potrebno.", en: "One Ecuadorian rose on a 70 cm stem. Nothing more needed." },
    long: {
      sr: "Ekvadorska ruža Explorer, tamnocrvena i baršunasta, na dugom stablu, umotana u papir i sa karticom. Najkraći put od 'izvini' do 'volim te'.",
      en: "An Explorer rose from Ecuador, deep red and velvety on a long stem, wrapped with a card. The shortest route from 'sorry' to 'I love you'.",
    },
    materials: { sr: "Ruža Explorer 70 cm, papir, kartica.", en: "Explorer rose 70 cm, paper, card." },
    care: { sr: "Visoka vaza, podsecite stablo pod vodom.", en: "A tall vase; trim the stem under water." },
    meaning: { sr: "Jedna crvena ruža: ljubav na prvi pogled.", en: "A single red rose: love at first sight." },
    occasions: ["love", "sorry", "anniversary"], palette: "bright",
    variants: single("ORR", 2400, 40), needsDelivery: true,
    addedAt: "2026-02-01", pairsWith: ["artisan-chocolate", "little-gesture", "linen-candle"], rating: 4.8, reviewCount: 46, shown: 3,
  },
  {
    id: "three-roses", category: "roses", photos: 3,
    slug: { sr: "tri-ruze", en: "three-roses" },
    name: { sr: "Tri ruže", en: "Three Roses" },
    alt: { sr: "Tri ruže, crvena i koralne, u ruci", en: "Three roses, red and coral, held in a hand" },
    short: { sr: "Crvena i dve koralne. Za izvinjenja koja treba da stignu danas.", en: "One red, two coral. For apologies that need to arrive today." },
    long: {
      sr: "Tri ruže vezane bez celofana: jedna crvena i dve koralne. Pametan izbor kada je važno da stigne brzo i da izgleda iskreno, a ne kao kupovina na brzinu.",
      en: "Three roses tied without cellophane: one red and two coral. A smart choice when it has to arrive fast and look sincere, not like a rushed purchase.",
    },
    materials: { sr: "Ruže (crvena, koralna), kanap, kartica.", en: "Roses (red, coral), twine, card." },
    care: { sr: "Menjajte vodu na dva dana.", en: "Change the water every two days." },
    meaning: { sr: "Tri ruže: 'Volim te.' Koralna: želja i zahvalnost.", en: "Three roses: 'I love you.' Coral: desire and gratitude." },
    occasions: ["sorry", "love", "anniversary"], palette: "bright",
    variants: single("TR", 3900, 25), needsDelivery: true, bestseller: true,
    addedAt: "2026-03-20", pairsWith: ["artisan-chocolate", "one-red-rose", "linen-candle"], rating: 4.9, reviewCount: 52, shown: 4,
  },
  {
    id: "first-date", category: "roses", photos: 3,
    slug: { sr: "prvi-sastanak", en: "first-date" },
    name: { sr: "Prvi sastanak", en: "First Date" },
    alt: { sr: "Floristkinja vezuje crvenu ružu sa gipsofilom", en: "A florist ties a red rose with gypsophila" },
    short: { sr: "Crvena ruža u gipsofili, vezana belom trakom. Taman koliko treba.", en: "A red rose in gypsophila, tied with white ribbon. Just enough." },
    long: {
      sr: "Ne previše, ne premalo. Jedna crvena ruža okružena gipsofilom i vezana belom trakom, napravljena da stane u ruku na prvom sastanku u kafiću na Dorćolu.",
      en: "Not too much, not too little. One red rose surrounded by gypsophila and tied with white ribbon, made to fit in your hand on a first date at a Dorćol café.",
    },
    materials: { sr: "Crvena ruža, gipsofila, bela traka.", en: "Red rose, gypsophila, white ribbon." },
    care: { sr: "Mala vaza, hladnija soba.", en: "A small vase, a cooler room." },
    meaning: { sr: "Ruža i gipsofila: početak nečeg lepog.", en: "Rose and gypsophila: the start of something lovely." },
    occasions: ["love", "justBecause"], palette: "bright",
    variants: single("FD", 2900, 2), needsDelivery: true, isNew: true,
    addedAt: "2026-09-12", pairsWith: ["artisan-chocolate", "linen-candle", "one-red-rose"], rating: 4.8, reviewCount: 11, shown: 2,
  },
  {
    id: "white-roses-vase", category: "roses", photos: 3,
    slug: { sr: "bele-ruze-u-vazi", en: "white-roses-in-a-vase" },
    name: { sr: "Bele ruže u vazi", en: "White Roses in a Vase" },
    alt: { sr: "Bele ruže u cinkanoj vazi na stolu", en: "White roses in a zinc vase on a table" },
    short: { sr: "Bele ruže aranžirane u cinkanoj vazi. Spremno za sto.", en: "White roses arranged in a zinc vase. Ready for the table." },
    long: {
      sr: "Ne morate tražiti vazu: bele ruže dolaze već aranžirane u cinkanoj posudi, sa sunđerom koji drži vodu. Za recepcije, saučešća i domove u kojima nema vremena za aranžiranje.",
      en: "No need to hunt for a vase: the white roses arrive already arranged in a zinc pot with water-holding foam. For receptions, condolences and homes with no time to arrange.",
    },
    materials: { sr: "Bele ruže, eukaliptus, cinkana vaza (ostaje vama).", en: "White roses, eucalyptus, zinc vase (yours to keep)." },
    care: { sr: "Dolivajte vodu u vazu svaki dan.", en: "Top up the vase with water daily." },
    meaning: { sr: "Bela ruža: sećanje i poštovanje.", en: "White rose: remembrance and respect." },
    occasions: ["sympathy", "thanks", "anniversary"], palette: "white",
    variants: sized("WRV", 8900, { stems: [9, 15, 25, 35], stock: [6, 8, 4, 2] }), needsDelivery: true,
    addedAt: "2026-04-01", pairsWith: ["linen-candle", "first-snow", "white-morning"], rating: 5, reviewCount: 21, shown: 3,
  },
  {
    id: "bucket-of-roses", category: "roses", photos: 3,
    slug: { sr: "kanta-ruza", en: "bucket-of-roses" },
    name: { sr: "Kanta ruža", en: "A Bucket of Roses" },
    alt: { sr: "Floristkinja slaže ruže u metalnu kantu", en: "A florist arranging roses in a metal bucket" },
    short: { sr: "25, 50 ili 101 ruža u metalnoj kanti. Za velike reči.", en: "25, 50 or 101 roses in a metal bucket. For big words." },
    long: {
      sr: "Kada buket nije dovoljan. Ruže dolaze u metalnoj kanti sa vodom, spremne da stoje na podu dnevne sobe. Kurir ih unosi do vrata i čeka da ih neko preuzme.",
      en: "When a bouquet isn't enough. The roses arrive in a metal bucket with water, ready to stand on the living-room floor. The courier carries them to the door and waits for someone to take them.",
    },
    materials: { sr: "Ruže po izboru boje, metalna kanta (ostaje vama).", en: "Roses in your choice of colour, metal bucket (yours to keep)." },
    care: { sr: "Menjajte vodu u kanti na dva dana.", en: "Change the bucket water every two days." },
    meaning: { sr: "Mnogo ruža: 'Ti si sve.'", en: "Many roses: 'You are everything.'" },
    occasions: ["anniversary", "love", "sorry"], palette: "white",
    palettes: [pal("white", "Bele", "White", 0), pal("bright", "Crvene", "Red", 1), pal("blush", "Mešane", "Mixed", 2)],
    variants: [
      { id: "25", label: { sr: "25 ruža", en: "25 roses" }, price: 6900, stock: 8, sku: "RT-BR-25" },
      { id: "50", label: { sr: "50 ruža", en: "50 roses" }, price: 12900, stock: 5, sku: "RT-BR-50" },
      { id: "101", label: { sr: "101 ruža", en: "101 roses" }, price: 18000, stock: 2, sku: "RT-BR-101" },
    ],
    needsDelivery: true, bestseller: true,
    addedAt: "2026-02-10", pairsWith: ["artisan-chocolate", "pastel-balloons", "linen-candle"], rating: 4.9, reviewCount: 29, shown: 4,
  },
  // ——— Aranžmani ———
  {
    id: "strahinjica-basket", category: "arrangements", photos: 3,
    slug: { sr: "korpa-strahinjica", en: "strahinjica-basket" },
    name: { sr: "Korpa Strahinjića", en: "The Strahinjića Basket" },
    alt: { sr: "Pletena korpa sa belim ružama i ružičastim karanfilima", en: "A woven basket of white roses and pink carnations" },
    short: { sr: "Pletena korpa sa belim ružama i karanfilima. Naš potpis.", en: "A woven basket of white roses and carnations. Our signature." },
    long: {
      sr: "Nazvana po ulici u kojoj je atelje. Pletena korpa od morske trave puna belih ruža, ružičastih karanfila i gipsofile, aranžirana u sunđeru tako da ne treba vaza. Korpa ostaje kao uspomena.",
      en: "Named after the street our studio is on. A seagrass basket full of white roses, pink carnations and gypsophila, arranged in foam so no vase is needed. The basket stays as a keepsake.",
    },
    materials: { sr: "Bele ruže, karanfili, gipsofila, korpa od morske trave.", en: "White roses, carnations, gypsophila, seagrass basket." },
    care: { sr: "Dolivajte malo vode u sunđer svaki dan.", en: "Add a little water to the foam every day." },
    meaning: { sr: "Korpa cveća: obilje i dobrodošlica.", en: "A basket of flowers: abundance and welcome." },
    occasions: ["birthday", "thanks", "baby"], palette: "blush",
    variants: sized("SB", 7900, { stems: [12, 20, 30, 45] }), needsDelivery: true, bestseller: true,
    addedAt: "2026-01-20", pairsWith: ["artisan-chocolate", "pastel-balloons", "linen-candle"], rating: 5, reviewCount: 36, shown: 4,
  },
  {
    id: "basket-for-mum", category: "arrangements", photos: 3,
    slug: { sr: "korpa-za-mamu", en: "basket-for-mum" },
    name: { sr: "Korpa za mamu", en: "A Basket for Mum" },
    alt: { sr: "Floristkinja drži korpu sa ružama i karanfilima", en: "A florist holding a basket of roses and carnations" },
    short: { sr: "Ruže, karanfili i gipsofila u maloj korpi. Za 8. mart i svaki drugi dan.", en: "Roses, carnations and gypsophila in a small basket. For 8 March and any other day." },
    long: {
      sr: "Manja sestra Korpe Strahinjića. Nežni tonovi, malo zelenila i kartica sa vašom porukom napisanom rukom. Najčešće naručivana stvar sa engleskog sajta, iz Beča, Ciriha i Čikaga.",
      en: "The little sister of the Strahinjića Basket. Soft tones, a little greenery and your message handwritten on a card. Our most-ordered item from the English site, from Vienna, Zurich and Chicago.",
    },
    materials: { sr: "Ruže, karanfili, gipsofila, mala pletena korpa.", en: "Roses, carnations, gypsophila, small woven basket." },
    care: { sr: "Malo vode u sunđer svakog dana.", en: "A little water in the foam daily." },
    meaning: { sr: "Za mamu: zahvalnost koja se ne meri.", en: "For mum: gratitude beyond measure." },
    occasions: ["thanks", "birthday", "justBecause"], palette: "blush",
    variants: sized("BM", 6400), needsDelivery: true,
    addedAt: "2026-03-01", pairsWith: ["artisan-chocolate", "linen-candle", "carnation-blush"], rating: 4.9, reviewCount: 31, shown: 3,
  },
  {
    id: "blush-basket", category: "arrangements", photos: 3,
    slug: { sr: "ruzicasta-korpa", en: "blush-basket" },
    name: { sr: "Ružičasta korpa", en: "Blush Basket" },
    alt: { sr: "Korpa sa ružičastim karanfilima i belim ruzama u rukama floristkinje", en: "A basket of pink carnations and white roses in a florist's hands" },
    short: { sr: "Bujna korpa u puderastim tonovima.", en: "A lush basket in powder tones." },
    long: {
      sr: "Ružičasti karanfili, bele ruže i oblak gipsofile, složeni nisko i gusto. Lepo izgleda na stolu za ručak i ne zaklanja pogled preko stola.",
      en: "Pink carnations, white roses and a cloud of gypsophila, arranged low and full. Looks lovely on a lunch table without blocking the view across it.",
    },
    materials: { sr: "Karanfili, ruže, gipsofila, pletena korpa.", en: "Carnations, roses, gypsophila, woven basket." },
    care: { sr: "Dolivajte vodu u sunđer.", en: "Keep the foam moist." },
    meaning: { sr: "Ružičasto: nežnost, zahvalnost, radost.", en: "Pink: tenderness, gratitude, joy." },
    occasions: ["birthday", "baby", "thanks"], palette: "blush",
    variants: sized("BB", 8400, { stock: [4, 6, 3, 0] }), needsDelivery: true,
    addedAt: "2026-06-01", pairsWith: ["pastel-balloons", "artisan-chocolate", "basket-for-mum"], rating: 4.8, reviewCount: 17, shown: 3,
  },
  {
    id: "long-table", category: "arrangements", photos: 3,
    slug: { sr: "raskosni-sto", en: "the-long-table" },
    name: { sr: "Raskošni sto", en: "The Long Table" },
    alt: { sr: "Velika vaza sa hortenzijama i suncokretima u svetloj sobi", en: "A large vase of hydrangeas and sunflowers in a bright room" },
    short: { sr: "Velika vaza za slavlja, slave i stolove za dvadeset.", en: "A big vase for celebrations and tables for twenty." },
    long: {
      sr: "Raskošni aranžman u keramičkoj vazi: hortenzije, suncokreti, ruže i zelenilo, visok skoro metar. Za slave, otvaranja i recepcije. Isporuku nosimo do stola.",
      en: "A lavish arrangement in a ceramic vase: hydrangeas, sunflowers, roses and greenery, almost a metre tall. For celebrations, openings and receptions. We carry it to the table.",
    },
    materials: { sr: "Hortenzije, suncokreti, ruže, zelenilo, keramička vaza.", en: "Hydrangeas, sunflowers, roses, greenery, ceramic vase." },
    care: { sr: "Dolivajte vodu svaki dan; prskajte hortenzije.", en: "Top up daily; mist the hydrangeas." },
    meaning: { sr: "Obilje: slavlje i dobrodošlica.", en: "Abundance: celebration and welcome." },
    occasions: ["birthday", "anniversary", "thanks"], palette: "bright",
    variants: single("LT", 14900, 3), needsDelivery: true,
    addedAt: "2026-05-05", pairsWith: ["linen-candle", "artisan-chocolate", "summer-terrace"], rating: 5, reviewCount: 9, shown: 2,
  },
  {
    id: "hydrangea-and-rose", category: "arrangements", photos: 3,
    slug: { sr: "hortenzija-i-ruza", en: "hydrangea-and-rose" },
    name: { sr: "Hortenzija i ruža", en: "Hydrangea & Rose" },
    alt: { sr: "Plava hortenzija i crvena ruža u beloj posudi", en: "Blue hydrangea and a red rose in a white pot" },
    short: { sr: "Plava hortenzija i crvena ruža u beloj keramici.", en: "Blue hydrangea and a red rose in white ceramic." },
    long: {
      sr: "Kontrast koji radi: hladna plava hortenzija i topla crvena ruža u beloj keramičkoj posudi. Odličan poklon za novi stan.",
      en: "A contrast that works: cool blue hydrangea and a warm red rose in a white ceramic pot. A great housewarming gift.",
    },
    materials: { sr: "Hortenzija, ruže, zelenilo, bela keramička posuda.", en: "Hydrangea, roses, greenery, white ceramic pot." },
    care: { sr: "Voda svaki dan; posudu možete kasnije koristiti za biljke.", en: "Water daily; reuse the pot for plants later." },
    meaning: { sr: "Hortenzija i ruža: zahvalnost i ljubav.", en: "Hydrangea and rose: gratitude and love." },
    occasions: ["thanks", "anniversary", "justBecause"], palette: "blue",
    variants: single("HR", 7900, 5, 9400), needsDelivery: true, saleEnds: SALE_ENDS,
    addedAt: "2026-07-14", pairsWith: ["linen-candle", "blue-danube", "artisan-chocolate"], rating: 4.8, reviewCount: 14, shown: 3,
  },
  {
    id: "summer-terrace", category: "arrangements", photos: 3,
    slug: { sr: "letnja-terasa", en: "summer-terrace" },
    name: { sr: "Letnja terasa", en: "Summer Terrace" },
    alt: { sr: "Aranžman od hortenzija, suncokreta i hrizantema", en: "An arrangement of hydrangeas, sunflowers and chrysanthemums" },
    short: { sr: "Hortenzije, suncokreti i žute hrizanteme. Kasno leto u vazi.", en: "Hydrangeas, sunflowers and yellow chrysanthemums. Late summer in a vase." },
    long: {
      sr: "Aranžman koji podseća na terasu na Kosančićevom vencu u avgustu. Plavo, žuto i belo, bujno i opušteno. Dolazi u zinkanoj vazi.",
      en: "An arrangement that recalls a terrace on Kosančićev venac in August. Blue, yellow and white, lush and relaxed. Arrives in a zinc vase.",
    },
    materials: { sr: "Hortenzije, suncokreti, hrizanteme, zelenilo, zinkana vaza.", en: "Hydrangeas, sunflowers, chrysanthemums, greenery, zinc vase." },
    care: { sr: "Puno vode, svakog dana.", en: "Plenty of water, every day." },
    meaning: { sr: "Leto: radost i lakoća.", en: "Summer: joy and ease." },
    occasions: ["birthday", "thanks", "justBecause"], palette: "sunny",
    variants: single("ST", 11900, 4), needsDelivery: true,
    addedAt: "2026-08-20", pairsWith: ["august-at-ada", "linen-candle", "pastel-balloons"], rating: 4.9, reviewCount: 12, shown: 2,
  },
  // ——— Sobno bilje ———
  {
    id: "cactus-garden", category: "plants", photos: 3,
    slug: { sr: "basta-kaktusa", en: "cactus-garden" },
    name: { sr: "Bašta kaktusa", en: "Cactus Garden" },
    alt: { sr: "Kaktusi zasađeni u beloj keramičkoj činiji", en: "Cacti planted in a white ceramic bowl" },
    short: { sr: "Mali vrt kaktusa u beloj činiji. Zalivanje jednom u dve nedelje.", en: "A tiny cactus garden in a white bowl. Water once a fortnight." },
    long: {
      sr: "Pet vrsta kaktusa zasađenih u široku belu činiju sa ukrasnim kamenčićima. Poklon za ljude koji 'ubijaju svaku biljku', i za kancelarije bez prozora.",
      en: "Five cactus varieties in a wide white bowl with decorative pebbles. A gift for people who 'kill every plant', and for windowless offices.",
    },
    materials: { sr: "5 vrsta kaktusa, supstrat za sukulente, keramička činija Ø 25 cm.", en: "5 cactus varieties, succulent soil, ceramic bowl Ø 25 cm." },
    care: { sr: "Svetlo mesto, zalivanje na 2 nedelje, zimi ređe.", en: "Bright spot, water every 2 weeks, less in winter." },
    meaning: { sr: "Kaktus: izdržljivost i zaštita.", en: "Cactus: endurance and protection." },
    occasions: ["thanks", "justBecause", "birthday"], palette: "green",
    variants: single("CG", 4900, 10), needsDelivery: false,
    addedAt: "2026-04-20", pairsWith: ["linen-candle", "green-sprig", "ceramic-vase"], rating: 4.9, reviewCount: 16, shown: 3,
  },
  {
    id: "lucky-bamboo", category: "plants", photos: 2,
    slug: { sr: "srecni-bambus", en: "lucky-bamboo" },
    name: { sr: "Srećni bambus", en: "Lucky Bamboo" },
    alt: { sr: "Stabljika srećnog bambusa u staklenoj tegli", en: "A lucky bamboo stem in a glass jar" },
    short: { sr: "Srećni bambus u staklenoj tegli. Raste u vodi, bez zemlje.", en: "Lucky bamboo in a glass jar. Grows in water, no soil." },
    long: {
      sr: "Najlakša biljka na svetu: dracaena sanderiana u vodi, u staklenoj tegli. Za radni sto, novi posao ili prijatelja koji se seli.",
      en: "The easiest plant in the world: Dracaena sanderiana in water, in a glass jar. For a desk, a new job or a friend who's moving.",
    },
    materials: { sr: "Srećni bambus, staklena tegla, kamenčići.", en: "Lucky bamboo, glass jar, pebbles." },
    care: { sr: "Menjajte vodu jednom nedeljno, indirektno svetlo.", en: "Change the water weekly, indirect light." },
    meaning: { sr: "Bambus: sreća i napredak.", en: "Bamboo: luck and progress." },
    occasions: ["justBecause", "thanks"], palette: "green",
    variants: single("LB", 2400, 18, 2900), needsDelivery: false, saleEnds: SALE_ENDS,
    addedAt: "2026-06-20", pairsWith: ["green-sprig", "cactus-garden", "linen-candle"], rating: 4.7, reviewCount: 13, shown: 2,
  },
  {
    id: "green-sprig", category: "plants", photos: 3,
    slug: { sr: "zelena-grana", en: "green-sprig" },
    name: { sr: "Zelena grana", en: "Green Sprig" },
    alt: { sr: "Grančica ruskusa u staklenoj boci", en: "A ruscus sprig in a glass bottle" },
    short: { sr: "Jedna grana ruskusa u staklenoj boci. Minimalizam koji traje mesec dana.", en: "One ruscus branch in a glass bottle. Minimalism that lasts a month." },
    long: {
      sr: "Ruskus je zelenilo koje traje nedeljama. Jedna grana u boci od recikliranog stakla, za police, kupatila i radne stolove.",
      en: "Ruscus is greenery that lasts for weeks. One branch in a recycled glass bottle, for shelves, bathrooms and desks.",
    },
    materials: { sr: "Ruskus, boca od recikliranog stakla.", en: "Ruscus, recycled glass bottle." },
    care: { sr: "Dolivajte vodu jednom nedeljno.", en: "Top up the water weekly." },
    meaning: { sr: "Zelena grana: mir i nada.", en: "Green branch: peace and hope." },
    occasions: ["justBecause", "thanks"], palette: "green",
    variants: single("GS", 2600, 20), needsDelivery: false, isNew: true,
    addedAt: "2026-09-18", pairsWith: ["lucky-bamboo", "ceramic-vase", "propagation-station"], rating: 4.8, reviewCount: 8, shown: 2,
  },
  {
    id: "propagation-station", category: "plants", photos: 3,
    slug: { sr: "stanica-za-reznice", en: "propagation-station" },
    name: { sr: "Stanica za reznice", en: "Propagation Station" },
    alt: { sr: "Reznice potosa u staklenim epruvetama na drvenom postolju", en: "Pothos cuttings in glass tubes on a wooden stand" },
    short: { sr: "Reznice potosa u staklenim epruvetama. Gledajte kako puštaju koren.", en: "Pothos cuttings in glass tubes. Watch the roots grow." },
    long: {
      sr: "Drveno postolje sa pet staklenih epruveta i reznicama potosa i monstere. Za ljubitelje biljaka koji vole da gledaju kako nešto raste.",
      en: "A wooden stand with five glass tubes and pothos and monstera cuttings. For plant lovers who like to watch things grow.",
    },
    materials: { sr: "Bukovo postolje, 5 epruveta, reznice potosa i monstere.", en: "Beech stand, 5 tubes, pothos and monstera cuttings." },
    care: { sr: "Menjajte vodu na 10 dana; kada koren poraste, presadite.", en: "Change the water every 10 days; repot once roots grow." },
    meaning: { sr: "Reznica: novi početak.", en: "A cutting: a new beginning." },
    occasions: ["justBecause", "birthday"], palette: "green",
    variants: single("PS", 5400, 7), needsDelivery: false,
    addedAt: "2026-05-15", pairsWith: ["green-sprig", "lucky-bamboo", "hanging-pothos"], rating: 4.9, reviewCount: 10, shown: 2,
  },
  {
    id: "eucalyptus-ceramic", category: "plants", photos: 3,
    slug: { sr: "eukaliptus-u-keramici", en: "eucalyptus-in-ceramic" },
    name: { sr: "Eukaliptus u keramici", en: "Eucalyptus in Ceramic" },
    alt: { sr: "Grane eukaliptusa u beloj keramičkoj vazi", en: "Eucalyptus branches in a white ceramic vase" },
    short: { sr: "Bujne grane eukaliptusa u ručno rađenoj vazi. Miriše na spa.", en: "Lush eucalyptus branches in a handmade vase. Smells like a spa." },
    long: {
      sr: "Grane srebrnog eukaliptusa u beloj keramičkoj vazi koju izrađuje keramičarka sa Čukarice. Eukaliptus se lepo suši, pa traje mesecima.",
      en: "Silver eucalyptus branches in a white ceramic vase made by a ceramicist from Čukarica. Eucalyptus dries beautifully, so it lasts for months.",
    },
    materials: { sr: "Eukaliptus cinerea, ručno rađena keramička vaza.", en: "Eucalyptus cinerea, handmade ceramic vase." },
    care: { sr: "Malo vode prve nedelje, posle se suši sam.", en: "A little water in the first week, then it dries by itself." },
    meaning: { sr: "Eukaliptus: zaštita i isceljenje.", en: "Eucalyptus: protection and healing." },
    occasions: ["thanks", "justBecause", "sympathy"], palette: "green",
    variants: single("EC", 6200, 6), needsDelivery: false,
    addedAt: "2026-04-28", pairsWith: ["linen-candle", "wheat-in-a-vase", "green-sprig"], rating: 4.9, reviewCount: 14, shown: 3,
  },
  {
    id: "hanging-pothos", category: "plants", photos: 2,
    slug: { sr: "viseci-potos", en: "hanging-pothos" },
    name: { sr: "Viseći potos", en: "Hanging Pothos" },
    alt: { sr: "Potos u visećoj saksiji kraj prozora", en: "A pothos in a hanging pot by a window" },
    short: { sr: "Potos koji pada niz policu. Neuništiv i zahvalan.", en: "A pothos that trails down the shelf. Indestructible and grateful." },
    long: {
      sr: "Zlatni potos u visećoj crnoj saksiji. Raste brzo, prašta zaboravno zalivanje i čisti vazduh. Ovog meseca rasprodat, ali stiže nova tura.",
      en: "Golden pothos in a black hanging pot. Grows fast, forgives forgotten watering and cleans the air. Sold out this month, a new batch is on its way.",
    },
    materials: { sr: "Epipremnum aureum, viseća saksija Ø 17 cm.", en: "Epipremnum aureum, hanging pot Ø 17 cm." },
    care: { sr: "Zalivajte kad se zemlja osuši, polusenka.", en: "Water when the soil dries, partial shade." },
    meaning: { sr: "Potos: upornost i rast.", en: "Pothos: perseverance and growth." },
    occasions: ["justBecause"], palette: "green",
    variants: single("HP", 3800, 0), needsDelivery: false,
    addedAt: "2026-03-08", pairsWith: ["propagation-station", "green-sprig", "lucky-bamboo"], rating: 4.8, reviewCount: 12, shown: 2,
  },
  // ——— Suvo cveće ———
  {
    id: "golden-wheat", category: "dried", photos: 3,
    slug: { sr: "zlatno-klasje", en: "golden-wheat" },
    name: { sr: "Zlatno klasje", en: "Golden Wheat" },
    alt: { sr: "Snop suvog klasja u ruci, beli zid", en: "A bunch of dried wheat held against a white wall" },
    short: { sr: "Snop suvog klasja. Jesen koja ne vene.", en: "A bunch of dried wheat. An autumn that never wilts." },
    long: {
      sr: "Klasje sa banatskih njiva, osušeno prirodno i vezano kanapom. Stoji godinama i nikad ne treba vodu. Odličan i kao dodatak za slavsku trpezu.",
      en: "Wheat from Banat fields, air-dried and tied with twine. Lasts for years and never needs water. Also lovely on a slava table.",
    },
    materials: { sr: "Suvo klasje, kanap.", en: "Dried wheat, twine." },
    care: { sr: "Bez vode, dalje od vlage i direktnog sunca.", en: "No water, away from damp and direct sun." },
    meaning: { sr: "Klasje: blagostanje i zahvalnost.", en: "Wheat: prosperity and gratitude." },
    occasions: ["thanks", "justBecause"], palette: "neutral",
    variants: single("GW", 2400, 15, 2900), needsDelivery: false, saleEnds: SALE_ENDS,
    addedAt: "2026-08-25", pairsWith: ["wheat-in-a-vase", "linen-candle", "pampas-cloud"], rating: 4.8, reviewCount: 11, shown: 3,
  },
  {
    id: "wheat-in-a-vase", category: "dried", photos: 3,
    slug: { sr: "klasje-u-vazi", en: "wheat-in-a-vase" },
    name: { sr: "Klasje u vazi", en: "Wheat in a Vase" },
    alt: { sr: "Suvo klasje u visokoj keramičkoj vazi", en: "Dried wheat in a tall ceramic vase" },
    short: { sr: "Visoka vaza sa suvim klasjem. Dekor za celu sezonu.", en: "A tall vase of dried wheat. Décor for the whole season." },
    long: {
      sr: "Isto klasje, ali već aranžirano u visokoj keramičkoj vazi sa plavim rubom. Za hodnike, restorane i stolove koji traže nešto toplo.",
      en: "The same wheat, already arranged in a tall ceramic vase with a blue rim. For hallways, restaurants and tables that need something warm.",
    },
    materials: { sr: "Suvo klasje, keramička vaza sa plavim rubom.", en: "Dried wheat, ceramic vase with a blue rim." },
    care: { sr: "Obrišite prašinu fenom na hladno.", en: "Dust with a hair dryer on cool." },
    meaning: { sr: "Klasje: dom i obilje.", en: "Wheat: home and abundance." },
    occasions: ["thanks", "justBecause"], palette: "neutral",
    variants: single("WV", 5900, 6), needsDelivery: false,
    addedAt: "2026-09-05", pairsWith: ["golden-wheat", "linen-candle", "eucalyptus-ceramic"], rating: 4.9, reviewCount: 7, shown: 2, isNew: true,
  },
  {
    id: "sea-lavender", category: "dried", photos: 3,
    slug: { sr: "limonijum", en: "sea-lavender" },
    name: { sr: "Limonijum", en: "Sea Lavender" },
    alt: { sr: "Buket limonijuma u ruci uz beli zid", en: "A bunch of sea lavender held against a white wall" },
    short: { sr: "Lila oblak limonijuma. Sveže sad, suvo za mesec dana.", en: "A lilac cloud of sea lavender. Fresh now, dried in a month." },
    long: {
      sr: "Limonijum je cvet sa dva života: stiže svež i lila, a posle nekoliko nedelja se osuši i zadrži boju. Buket koji ne morate baciti.",
      en: "Sea lavender has two lives: it arrives fresh and lilac, then dries after a few weeks and keeps its colour. A bouquet you never have to throw away.",
    },
    materials: { sr: "Limonijum, prozirni papir.", en: "Sea lavender, translucent paper." },
    care: { sr: "Bez vode, ako želite da se osuši uspravno.", en: "No water if you want it to dry upright." },
    meaning: { sr: "Limonijum: sećanje i uspomene.", en: "Sea lavender: remembrance and memories." },
    occasions: ["sympathy", "justBecause", "thanks"], palette: "neutral",
    variants: single("SL", 2600, 12, 3100), needsDelivery: false, saleEnds: SALE_ENDS,
    addedAt: "2026-07-07", pairsWith: ["golden-wheat", "pampas-cloud", "ceramic-vase"], rating: 4.7, reviewCount: 9, shown: 2,
  },
  {
    id: "pampas-cloud", category: "dried", photos: 2,
    slug: { sr: "pampas-oblak", en: "pampas-cloud" },
    name: { sr: "Pampas oblak", en: "Pampas Cloud" },
    alt: { sr: "Pampas trava i suvo klasje u metalnoj vazi", en: "Pampas grass and dried wheat in a metal vase" },
    short: { sr: "Pampas i klasje u visokoj vazi. Mekano kao oblak nad Zemunom.", en: "Pampas and wheat in a tall vase. Soft as a cloud over Zemun." },
    long: {
      sr: "Pampas trava, klasje i suve grančice, aranžirani u visoku vazu. Pravi skulpturu u uglu sobe i ne traži ništa zauzvrat.",
      en: "Pampas grass, wheat and dried twigs arranged in a tall vase. Makes a sculpture in the corner of a room and asks for nothing in return.",
    },
    materials: { sr: "Pampas trava, suvo klasje, suve grane, vaza.", en: "Pampas grass, dried wheat, dried twigs, vase." },
    care: { sr: "Bez vode, dalje od vlage.", en: "No water, keep dry." },
    meaning: { sr: "Pampas: mekoća i mir.", en: "Pampas: softness and calm." },
    occasions: ["justBecause", "thanks"], palette: "neutral",
    variants: single("PC", 6400, 5), needsDelivery: false,
    addedAt: "2026-08-12", pairsWith: ["wheat-in-a-vase", "linen-candle", "golden-wheat"], rating: 4.8, reviewCount: 8, shown: 2,
  },
  // ——— Dodaci ———
  {
    id: "ceramic-vase", category: "addons", photos: 2,
    slug: { sr: "keramicka-vaza", en: "ceramic-vase" },
    name: { sr: "Keramička vaza", en: "Ceramic Vase" },
    alt: { sr: "Bela keramička vaza na svetloj podlozi", en: "A white ceramic vase on a pale surface" },
    short: { sr: "Bela ručno rađena vaza za vaš buket.", en: "A white handmade vase for your bouquet." },
    long: {
      sr: "Mat bela keramička vaza, ručno rađena u Beogradu. Dodajte je uz buket i cveće stiže spremno za sto, bez traženja vaze po kuhinji.",
      en: "A matte white ceramic vase, handmade in Belgrade. Add it to a bouquet and the flowers arrive table-ready, with no hunting for a vase.",
    },
    materials: { sr: "Keramika, mat glazura, visina 22 cm.", en: "Ceramic, matte glaze, 22 cm tall." },
    care: { sr: "Pranje rukom.", en: "Hand wash." },
    meaning: { sr: "Vaza: dom za cveće.", en: "A vase: a home for flowers." },
    occasions: ["justBecause"], palette: "white",
    variants: single("CV", 2400, 25), needsDelivery: false,
    addedAt: "2026-01-05", pairsWith: ["white-morning", "blue-danube", "florists-choice"], rating: 4.9, reviewCount: 22, shown: 2,
  },
  {
    id: "artisan-chocolate", category: "addons", photos: 2,
    slug: { sr: "zanatska-cokolada", en: "artisan-chocolate" },
    name: { sr: "Zanatska čokolada", en: "Artisan Chocolate" },
    alt: { sr: "Tabla tamne čokolade na belom mermeru", en: "A bar of dark chocolate on white marble" },
    short: { sr: "Tamna čokolada 70% iz male radionice na Zvezdari.", en: "70% dark chocolate from a small workshop in Zvezdara." },
    long: {
      sr: "Dve table zanatske tamne čokolade sa lavandom i morskom solju, iz male beogradske čokolaterije. Najbolji par za bilo koji buket.",
      en: "Two bars of artisan dark chocolate with lavender and sea salt, from a small Belgrade chocolatier. The best partner for any bouquet.",
    },
    materials: { sr: "2 × 80 g, kakao 70%, lavanda, morska so.", en: "2 × 80 g, 70% cocoa, lavender, sea salt." },
    care: { sr: "Čuvati na suvom, do 20 °C.", en: "Store dry, below 20 °C." },
    meaning: { sr: "Čokolada: slatka pažnja.", en: "Chocolate: a sweet gesture." },
    occasions: ["love", "sorry", "birthday"], palette: "neutral",
    variants: single("AC", 2600, 30), needsDelivery: false,
    addedAt: "2026-02-14", pairsWith: ["three-roses", "one-red-rose", "little-gesture"], rating: 5, reviewCount: 26, shown: 2,
  },
  {
    id: "linen-candle", category: "addons", photos: 2,
    slug: { sr: "sveca-lan", en: "linen-candle" },
    name: { sr: "Sveća Lan", en: "Linen Candle" },
    alt: { sr: "Bela sveća od sojinog voska na svetloj polici", en: "A white soy-wax candle on a pale shelf" },
    short: { sr: "Sveća od sojinog voska sa mirisom lana i smokve.", en: "A soy-wax candle scented with linen and fig." },
    long: {
      sr: "Ručno livena sveća od sojinog voska, miris lana, smokve i malo kedra. Gori 40 sati. Pravimo je u ograničenim serijama za atelje.",
      en: "A hand-poured soy-wax candle scented with linen, fig and a touch of cedar. Burns for 40 hours. Made in small batches for the studio.",
    },
    materials: { sr: "Sojin vosak, pamučni fitilj, 200 g.", en: "Soy wax, cotton wick, 200 g." },
    care: { sr: "Prvo paljenje najmanje 2 sata.", en: "Burn for at least 2 hours the first time." },
    meaning: { sr: "Sveća: toplina i sećanje.", en: "A candle: warmth and remembrance." },
    occasions: ["sympathy", "thanks", "justBecause"], palette: "neutral",
    variants: single("LC", 2900, 2), needsDelivery: false,
    addedAt: "2026-09-01", pairsWith: ["white-morning", "eucalyptus-ceramic", "first-snow"], rating: 4.9, reviewCount: 18, shown: 2, isNew: true,
  },
  {
    id: "pastel-balloons", category: "addons", photos: 2,
    slug: { sr: "pastelni-baloni", en: "pastel-balloons" },
    name: { sr: "Pastelni baloni", en: "Pastel Balloons" },
    alt: { sr: "Grozd pastelnih balona na belom", en: "A cluster of pastel balloons on white" },
    short: { sr: "Pet pastelnih balona sa helijumom, vezanih uz buket.", en: "Five helium pastel balloons, tied to your bouquet." },
    long: {
      sr: "Pet balona u pastelnim tonovima, punjenih helijumom ujutru pred dostavu, da lete ceo dan. Za rođendane, bebe i diplome.",
      en: "Five balloons in pastel tones, filled with helium the morning of delivery so they float all day. For birthdays, babies and graduations.",
    },
    materials: { sr: "5 lateks balona, helijum, traka.", en: "5 latex balloons, helium, ribbon." },
    care: { sr: "Držite dalje od izvora toplote.", en: "Keep away from heat sources." },
    meaning: { sr: "Baloni: slavlje.", en: "Balloons: celebration." },
    occasions: ["birthday", "baby"], palette: "blush",
    variants: single("PB", 2400, 20), needsDelivery: true,
    addedAt: "2026-06-05", pairsWith: ["sunny-side", "strahinjica-basket", "carnation-blush"], rating: 4.7, reviewCount: 14, shown: 2,
  },
];

export const products: Product[] = seeds.map((s, i) => {
  const { photos, shown = 3, ...rest } = s;
  return {
    ...rest,
    images: img(s.id, photos),
    rating: s.rating ?? 4.8,
    reviewCount: s.reviewCount ?? 10,
    reviews: reviewsFor(s.category, i, shown),
    featured: i,
  };
});

export const productById = (id: string) => products.find((p) => p.id === id);

export const productBySlug = (slug: string, locale: "sr" | "en") => products.find((p) => p.slug[locale] === slug);

/** Membership of each curated collection. */
export const collectionMembers: Record<CollectionId, (p: Product) => boolean> = {
  new: (p) => !!p.isNew || p.addedAt >= "2026-09-01",
  bestsellers: (p) => !!p.bestseller,
  sale: (p) => p.variants.some((v) => v.compareAt),
  under3000: (p) => minPrice(p) <= 3000,
  sympathy: (p) => p.occasions.includes("sympathy"),
  autumn: (p) => ["sunny", "neutral"].includes(p.palette) || ["august-at-ada", "florists-choice", "summer-terrace", "linen-candle"].includes(p.id),
};

export const minPrice = (p: Product) => Math.min(...p.variants.map((v) => v.price));
export const defaultVariant = (p: Product) => p.variants.find((v) => v.id === "m" && v.stock > 0) ?? p.variants.find((v) => v.stock > 0) ?? p.variants[0];
export const isSoldOut = (p: Product) => p.variants.every((v) => v.stock === 0);
export const totalStock = (p: Product) => p.variants.reduce((n, v) => n + v.stock, 0);

export function badgesFor(p: Product): ("new" | "bestseller" | "sale" | "low" | "soldout")[] {
  if (isSoldOut(p)) return ["soldout"];
  const b: ("new" | "bestseller" | "sale" | "low")[] = [];
  if (p.variants.some((v) => v.compareAt)) b.push("sale");
  if (p.isNew) b.push("new");
  if (p.bestseller) b.push("bestseller");
  const dv = defaultVariant(p);
  if (dv.stock > 0 && dv.stock <= 2) b.push("low");
  return b.slice(0, 2);
}

export const salePercent = (v: Variant) => (v.compareAt ? Math.round((1 - v.price / v.compareAt) * 100) : 0);

export type { CategoryId, OccasionId };
