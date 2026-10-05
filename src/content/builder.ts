import type { Localized } from "@/lib/i18n";

/** Bouquet builder ingredients. Cut-outs come from the studio shoot (scripts/cut-stems.py). */
export interface Stem {
  id: string;
  name: Localized<string>;
  image: string;
  /** price per stem, RSD */
  price: number;
  kind: "flower" | "green";
  /** relative visual weight of the head (bigger heads sit lower and in front) */
  head: number;
  colors: string[];
}

export const stems: Stem[] = [
  { id: "rose-red", name: { sr: "Crvena ruža", en: "Red rose" }, image: "/images/builder/rose-red.webp", price: 290, kind: "flower", head: 1, colors: ["bright", "love"] },
  { id: "rose-white", name: { sr: "Bela ruža", en: "White rose" }, image: "/images/builder/rose-white.webp", price: 290, kind: "flower", head: 1, colors: ["white", "soft"] },
  { id: "carnation-pink", name: { sr: "Ružičasti karanfil", en: "Pink carnation" }, image: "/images/builder/carnation-pink.webp", price: 190, kind: "flower", head: 0.9, colors: ["soft"] },
  { id: "carnation-white", name: { sr: "Beli karanfil", en: "White carnation" }, image: "/images/builder/carnation-white.webp", price: 190, kind: "flower", head: 0.9, colors: ["white", "soft"] },
  { id: "hydrangea", name: { sr: "Plava hortenzija", en: "Blue hydrangea" }, image: "/images/builder/hydrangea.webp", price: 690, kind: "flower", head: 1.6, colors: ["white", "bright"] },
  { id: "hydrangea-flat", name: { sr: "Bela hortenzija", en: "White hydrangea" }, image: "/images/builder/hydrangea-flat.webp", price: 590, kind: "flower", head: 1.4, colors: ["white", "soft"] },
  { id: "sunflower", name: { sr: "Suncokret", en: "Sunflower" }, image: "/images/builder/sunflower.webp", price: 350, kind: "flower", head: 1.2, colors: ["sunny", "bright"] },
  { id: "limonium", name: { sr: "Limonijum", en: "Sea lavender" }, image: "/images/builder/limonium.webp", price: 220, kind: "flower", head: 0.8, colors: ["soft", "white"] },
  { id: "gypsophila", name: { sr: "Gipsofila", en: "Gypsophila" }, image: "/images/builder/gypsophila.webp", price: 250, kind: "green", head: 1, colors: ["white", "soft", "bright", "sunny"] },
  { id: "eucalyptus", name: { sr: "Eukaliptus", en: "Eucalyptus" }, image: "/images/builder/eucalyptus.webp", price: 190, kind: "green", head: 1, colors: ["white", "soft", "sunny"] },
  { id: "fern", name: { sr: "Asparagus", en: "Asparagus fern" }, image: "/images/builder/fern.webp", price: 150, kind: "green", head: 1, colors: ["bright", "sunny", "white"] },
];

export const sizes = [
  { id: "s", name: { sr: "Mali", en: "Small" }, stems: 7, base: 900 },
  { id: "m", name: { sr: "Srednji", en: "Medium" }, stems: 11, base: 1100 },
  { id: "l", name: { sr: "Veliki", en: "Large" }, stems: 17, base: 1300 },
  { id: "xl", name: { sr: "Raskošni", en: "Lavish" }, stems: 25, base: 1600 },
] as const;

export const moods = [
  { id: "soft", name: { sr: "Nežna", en: "Soft" }, swatch: "linear-gradient(135deg,#f2c3c0,#f7e3da)", picks: ["carnation-pink", "rose-white", "limonium", "eucalyptus"] },
  { id: "bright", name: { sr: "Vedra", en: "Bright" }, swatch: "linear-gradient(135deg,#e0533a,#9cb7d8)", picks: ["rose-red", "hydrangea", "fern"] },
  { id: "white", name: { sr: "Bela", en: "White" }, swatch: "linear-gradient(135deg,#ffffff,#e9e7e2)", picks: ["rose-white", "hydrangea-flat", "carnation-white", "gypsophila"] },
  { id: "sunny", name: { sr: "Sunčana", en: "Sunny" }, swatch: "linear-gradient(135deg,#f3c64b,#e8a33a)", picks: ["sunflower", "eucalyptus", "gypsophila"] },
] as const;

export const papers = [
  { id: "kraft", name: { sr: "Kraft", en: "Kraft" }, color: "#c9a57b", shade: "#b08a5e", price: 0 },
  { id: "chalk", name: { sr: "Kreč", en: "Chalk" }, color: "#f4f0e8", shade: "#ddd6c8", price: 0 },
  { id: "mist", name: { sr: "Magla", en: "Mist" }, color: "#c9d3d6", shade: "#a8b6ba", price: 200 },
  { id: "blush", name: { sr: "Ruž", en: "Blush" }, color: "#f2cdbe", shade: "#dfae9b", price: 200 },
  { id: "night", name: { sr: "Noć", en: "Night" }, color: "#22362b", shade: "#17271f", price: 300 },
] as const;

export type SizeId = (typeof sizes)[number]["id"];
export type PaperId = (typeof papers)[number]["id"];

/** Spread the stem count across the chosen kinds (greens get a smaller share). */
export function recipe(picked: string[], sizeId: SizeId) {
  const size = sizes.find((s) => s.id === sizeId)!;
  const chosen = stems.filter((s) => picked.includes(s.id));
  if (!chosen.length) return [] as { stem: Stem; count: number }[];
  const weights = chosen.map((s) => (s.kind === "green" ? 0.6 : 1) / s.head);
  const total = weights.reduce((a, b) => a + b, 0);
  let left = size.stems;
  const out = chosen.map((stem, i) => {
    const count = i === chosen.length - 1 ? left : Math.max(1, Math.round((size.stems * weights[i]) / total));
    left -= count;
    return { stem, count };
  });
  // make sure nobody went negative after rounding
  return out.map((r) => ({ ...r, count: Math.max(1, r.count) }));
}

export function builderPrice(picked: string[], sizeId: SizeId, paperId: PaperId) {
  const size = sizes.find((s) => s.id === sizeId)!;
  const paper = papers.find((p) => p.id === paperId)!;
  const flowers = recipe(picked, sizeId).reduce((sum, r) => sum + r.stem.price * r.count, 0);
  return Math.round((size.base + paper.price + flowers) / 100) * 100;
}
