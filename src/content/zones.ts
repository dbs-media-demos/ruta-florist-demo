import type { Localized } from "@/lib/i18n";

/**
 * Belgrade delivery zones (fictional prices). `path` is a stylised shape on the 600×460 map in
 * components/sections/ZoneMap.tsx; `label` is where the name sits. Rivers are drawn separately.
 */
export interface Zone {
  id: string;
  name: string;
  hoods: Localized<string>;
  price: number;
  /** free delivery threshold applies in central zones only */
  central: boolean;
  eta: Localized<string>;
  path: string;
  label: [number, number];
}

export const zones: Zone[] = [
  {
    id: "stari-grad", name: "Stari grad", central: true, price: 0,
    hoods: { sr: "Dorćol, Kosančićev venac, Skadarlija", en: "Dorćol, Kosančićev venac, Skadarlija" },
    eta: { sr: "za 90 min", en: "within 90 min" },
    path: "M300 150 L352 128 L384 162 L372 214 L326 226 L296 196 Z", label: [336, 178],
  },
  {
    id: "vracar", name: "Vračar", central: true, price: 350,
    hoods: { sr: "Crveni krst, Čubura, Neimar", en: "Crveni krst, Čubura, Neimar" },
    eta: { sr: "za 2 h", en: "within 2 h" },
    path: "M326 226 L372 214 L404 246 L392 296 L340 300 L318 262 Z", label: [358, 262],
  },
  {
    id: "savski-venac", name: "Savski venac", central: true, price: 350,
    hoods: { sr: "Senjak, Dedinje, Savamala", en: "Senjak, Dedinje, Savamala" },
    eta: { sr: "za 2 h", en: "within 2 h" },
    path: "M262 214 L296 196 L326 226 L318 262 L340 300 L300 330 L262 300 L248 252 Z", label: [290, 266],
  },
  {
    id: "novi-beograd", name: "Novi Beograd", central: true, price: 450,
    hoods: { sr: "Blokovi, Ušće, Belville", en: "The Blocks, Ušće, Belville" },
    eta: { sr: "za 2–3 h", en: "within 2–3 h" },
    path: "M118 150 L230 118 L268 150 L262 214 L248 252 L200 276 L130 262 L100 206 Z", label: [184, 200],
  },
  {
    id: "zemun", name: "Zemun", central: false, price: 650,
    hoods: { sr: "Gardoš, Retenzija, Galenika", en: "Gardoš, Retenzija, Galenika" },
    eta: { sr: "za 3 h", en: "within 3 h" },
    path: "M60 60 L188 40 L230 118 L118 150 L70 128 Z", label: [140, 92],
  },
  {
    id: "palilula", name: "Palilula", central: false, price: 550,
    hoods: { sr: "Karaburma, Višnjička banja, Ćale", en: "Karaburma, Višnjička banja, Ćale" },
    eta: { sr: "za 3 h", en: "within 3 h" },
    path: "M352 128 L440 96 L520 124 L506 196 L436 222 L404 246 L372 214 L384 162 Z", label: [446, 162],
  },
  {
    id: "zvezdara", name: "Zvezdara", central: false, price: 550,
    hoods: { sr: "Đeram, Mirijevo, Konjarnik", en: "Đeram, Mirijevo, Konjarnik" },
    eta: { sr: "za 3 h", en: "within 3 h" },
    path: "M404 246 L436 222 L506 196 L540 262 L486 316 L420 318 L392 296 Z", label: [464, 270],
  },
  {
    id: "vozdovac", name: "Voždovac", central: false, price: 550,
    hoods: { sr: "Autokomanda, Banjica, Kumodraž", en: "Autokomanda, Banjica, Kumodraž" },
    eta: { sr: "za 3 h", en: "within 3 h" },
    path: "M340 300 L392 296 L420 318 L486 316 L470 396 L380 420 L334 368 Z", label: [404, 358],
  },
  {
    id: "banovo-brdo", name: "Banovo brdo", central: false, price: 650,
    hoods: { sr: "Čukarica, Košutnjak, Žarkovo", en: "Čukarica, Košutnjak, Žarkovo" },
    eta: { sr: "za 3 h", en: "within 3 h" },
    path: "M200 276 L248 252 L262 300 L300 330 L334 368 L280 410 L196 380 L176 316 Z", label: [254, 340],
  },
];

/** The Sava and the Danube, drawn under the zones. */
export const rivers = {
  danube: "M0 70 C 80 56, 150 34, 214 80 C 252 108, 290 116, 330 108 C 400 92, 470 70, 600 60",
  sava: "M0 330 C 70 318, 120 300, 168 282 C 210 266, 236 240, 252 210 C 262 186, 276 160, 300 132",
};

export const zoneById = (id: string) => zones.find((z) => z.id === id);

export const studioPin: [number, number] = [334, 166];
