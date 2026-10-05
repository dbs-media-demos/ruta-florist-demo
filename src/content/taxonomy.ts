import type { Category, Collection, Occasion } from "@/lib/commerce/types";

export const categories: Category[] = [
  {
    id: "bouquets", slug: { sr: "buketi", en: "bouquets" },
    name: { sr: "Buketi", en: "Bouquets" },
    title: { sr: "Buketi sa dostavom danas", en: "Bouquets delivered today" },
    intro: { sr: "Vezani rukom u ateljeu na Dorćolu, od cveća koje je jutros stiglo sa pijace.", en: "Hand-tied at our Dorćol studio from flowers that arrived at the market this morning." },
    image: "/images/products/florists-choice-2.jpg",
  },
  {
    id: "roses", slug: { sr: "ruze", en: "roses" },
    name: { sr: "Ruže", en: "Roses" },
    title: { sr: "Ruže: od jedne do sto jedne", en: "Roses: from one to a hundred and one" },
    intro: { sr: "Ekvadorske i holandske ruže na dugim stablima. Za ljubav, izvinjenja i godišnjice.", en: "Long-stemmed Ecuadorian and Dutch roses. For love, apologies and anniversaries." },
    image: "/images/products/one-red-rose-1.jpg",
  },
  {
    id: "arrangements", slug: { sr: "aranzmani", en: "arrangements" },
    name: { sr: "Aranžmani i korpe", en: "Arrangements & baskets" },
    title: { sr: "Aranžmani i korpe, spremni za sto", en: "Arrangements & baskets, ready for the table" },
    intro: { sr: "U korpi, kanti ili keramici. Ne treba vaza, samo malo vode.", en: "In a basket, bucket or ceramic. No vase needed, just a little water." },
    image: "/images/products/strahinjica-basket-1.jpg",
  },
  {
    id: "plants", slug: { sr: "sobno-bilje", en: "plants" },
    name: { sr: "Sobno bilje", en: "Plants" },
    title: { sr: "Sobno bilje koje preživi i zaboravne", en: "Houseplants that survive the forgetful" },
    intro: { sr: "Biljke koje traju godinama, sa kartom za negu napisanom rukom.", en: "Plants that last for years, with a handwritten care card." },
    image: "/images/products/cactus-garden-1.jpg",
  },
  {
    id: "dried", slug: { sr: "suvo-cvece", en: "dried-flowers" },
    name: { sr: "Suvo cveće", en: "Dried flowers" },
    title: { sr: "Suvo cveće koje ne vene", en: "Dried flowers that never wilt" },
    intro: { sr: "Klasje, pampas i limonijum, za dom koji želi cveće bez brige.", en: "Wheat, pampas and sea lavender, for homes that want flowers without the fuss." },
    image: "/images/products/golden-wheat-1.jpg",
  },
  {
    id: "addons", slug: { sr: "dodaci", en: "add-ons" },
    name: { sr: "Dodaci", en: "Add-ons" },
    title: { sr: "Dodaci uz buket", en: "Add-ons for your bouquet" },
    intro: { sr: "Vaza, čokolada, sveća i baloni. Stižu zajedno sa cvećem.", en: "A vase, chocolate, a candle and balloons. They arrive with the flowers." },
    image: "/images/products/ceramic-vase-1.jpg",
  },
];

export const collections: Collection[] = [
  {
    id: "new", slug: { sr: "novo", en: "new-in" },
    name: { sr: "Novo", en: "New in" },
    intro: { sr: "Šta je stiglo u atelje ovog meseca.", en: "What arrived at the studio this month." },
    image: "/images/products/grandmas-garden-1.jpg",
  },
  {
    id: "bestsellers", slug: { sr: "najprodavanije", en: "bestsellers" },
    name: { sr: "Najprodavanije", en: "Bestsellers" },
    intro: { sr: "Buketi koje Beograd naručuje najčešće.", en: "The bouquets Belgrade orders most." },
    image: "/images/products/white-morning-1.jpg",
  },
  {
    id: "sale", slug: { sr: "na-popustu", en: "on-sale" },
    name: { sr: "Na popustu", en: "On sale" },
    intro: { sr: "Cveće nedelje po nižoj ceni, dok traje zaliha.", en: "Flowers of the week for less, while stocks last." },
    image: "/images/products/carnation-blush-1.jpg",
  },
  {
    id: "under3000", slug: { sr: "do-3000-rsd", en: "under-3000-rsd" },
    name: { sr: "Do 3.000 RSD", en: "Under 3,000 RSD" },
    intro: { sr: "Mali znaci pažnje koji izgledaju kao veliki.", en: "Small gestures that look like big ones." },
    image: "/images/products/little-gesture-1.jpg",
  },
  {
    id: "sympathy", slug: { sr: "saucesce", en: "sympathy" },
    name: { sr: "Saučešće", en: "Sympathy" },
    intro: { sr: "Mirno belo cveće, dostavljeno tiho i sa poštovanjem.", en: "Calm white flowers, delivered quietly and with respect." },
    image: "/images/products/first-snow-1.jpg",
    calm: true,
  },
  {
    id: "autumn", slug: { sr: "jesen-u-gradu", en: "autumn-in-the-city" },
    name: { sr: "Jesen u gradu", en: "Autumn in the city" },
    intro: { sr: "Suncokreti, klasje i topli tonovi za kratke beogradske dane.", en: "Sunflowers, wheat and warm tones for short Belgrade days." },
    image: "/images/products/august-at-ada-2.jpg",
  },
];

export const occasions: Occasion[] = [
  { id: "birthday", name: { sr: "Rođendan", en: "Birthday" }, line: { sr: "Za svećice i iznenađenja", en: "For candles and surprises" }, image: "/images/occasions/birthday-bunch.jpg" },
  { id: "anniversary", name: { sr: "Godišnjica", en: "Anniversary" }, line: { sr: "Za godine koje se broje", en: "For the years that count" }, image: "/images/occasions/couple.jpg" },
  { id: "sorry", name: { sr: "Izvinjenje", en: "Apology" }, line: { sr: "Kada reči nisu dovoljne", en: "When words aren't enough" }, image: "/images/products/three-roses-1.jpg" },
  { id: "baby", name: { sr: "Beba", en: "New baby" }, line: { sr: "Dobrodošlica najmanjima", en: "Welcome to the smallest ones" }, image: "/images/occasions/baby.jpg" },
  { id: "love", name: { sr: "Ljubav", en: "Love" }, line: { sr: "Bez povoda, iz srca", en: "No reason, from the heart" }, image: "/images/occasions/heart-hands.jpg" },
  { id: "thanks", name: { sr: "Hvala", en: "Thank you" }, line: { sr: "Za ljude koji su tu", en: "For the people who show up" }, image: "/images/occasions/thank-you-card.jpg" },
  { id: "justBecause", name: { sr: "Samo tako", en: "Just because" }, line: { sr: "Najbolji razlog", en: "The best reason" }, image: "/images/delivery/door-sunflowers.jpg" },
  { id: "sympathy", name: { sr: "Saučešće", en: "Sympathy" }, line: { sr: "Mirno i sa poštovanjem", en: "Calm and respectful" }, image: "/images/calm/white-alstroemeria.jpg" },
];

export const categoryById = (id: string) => categories.find((c) => c.id === id)!;
export const categoryBySlug = (slug: string, locale: "sr" | "en") => categories.find((c) => c.slug[locale] === slug);
export const collectionById = (id: string) => collections.find((c) => c.id === id)!;
export const collectionBySlug = (slug: string, locale: "sr" | "en") => collections.find((c) => c.slug[locale] === slug);
