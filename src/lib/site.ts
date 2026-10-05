/**
 * Business facts for the fictional studio. Everything here is invented for the
 * Scale by Noon concept site; the phone number is an obvious placeholder.
 */

/** The agency that built this concept site. Single source for every credit link. */
export const agencyName = "Scale by Noon";
export const agencyUrl = "https://www.scalebynoon.com";

export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://ruta-florist-demo.vercel.app").replace(/\/$/, "");

/** Demos stay out of search engines unless explicitly switched on. */
export const noindex = process.env.NEXT_PUBLIC_NOINDEX !== "false";

export const site = {
  name: "Ruta",
  legalName: "Ruta cvetni atelje d.o.o. (demo)",
  nameLocalized: { sr: "Ruta · cvetni atelje", en: "Ruta · flower studio" },
  url: siteUrl,
  email: "zdravo@ruta-cvece.rs",
  phone: "+381110000000",
  phoneDisplay: "+381 11 000 0000",
  street: "Strahinjića bana 19",
  postalCode: "11000",
  city: "Beograd",
  district: "Dorćol",
  country: "RS",
  geo: { lat: 44.8215, lng: 20.4598 },
  timezone: "Europe/Belgrade",
  founded: 2019,
  pib: "100000000 (demo)",
  rating: { value: 4.9, count: 312 },
  instagram: "@ruta.cvece",
} as const;

/** Studio opening hours, 24h local time. Day 0 = Sunday. */
export const hours: { day: number; open: string; close: string }[] = [
  { day: 1, open: "08:00", close: "20:00" },
  { day: 2, open: "08:00", close: "20:00" },
  { day: 3, open: "08:00", close: "20:00" },
  { day: 4, open: "08:00", close: "20:00" },
  { day: 5, open: "08:00", close: "20:00" },
  { day: 6, open: "09:00", close: "18:00" },
  { day: 0, open: "10:00", close: "15:00" },
];

/** Same-day delivery cutoff (local time) and the delivery windows. */
export const delivery = {
  cutoffHour: 14,
  slots: ["09-12", "12-15", "15-18", "18-21"] as const,
  freeOver: 6000,
  eurRate: 117.2,
};

export const absoluteUrl = (path = "/") => `${siteUrl}${path === "/" ? "" : path}`;
