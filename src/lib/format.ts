import type { Locale } from "./i18n";
import { delivery } from "./site";

const rsd = new Intl.NumberFormat("sr-Latn-RS", { maximumFractionDigits: 0 });

/** 4.900 RSD — the Serbian grouping is used in both languages, RSD is the shop currency. */
export const formatRsd = (amount: number) => `${rsd.format(Math.round(amount))} RSD`;

/** ≈ €42 — shown next to RSD in English for the diaspora. */
export const formatEur = (amount: number) => `≈ €${Math.round(amount / delivery.eurRate)}`;

export const formatPrice = (amount: number, locale: Locale) => (locale === "en" ? `${formatRsd(amount)}` : formatRsd(amount));

export const formatDate = (date: Date, locale: Locale, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) =>
  new Intl.DateTimeFormat(locale === "sr" ? "sr-Latn-RS" : "en-GB", { timeZone: "Europe/Belgrade", ...opts }).format(date);

export const slotLabel = (slot: string) => slot.replace("-", ":00 – ") + ":00";
