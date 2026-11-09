import type { Locale } from "./i18n";
import { delivery } from "./site";

/**
 * 4.900 RSD — the Serbian grouping is used in both languages, RSD is the shop currency.
 * Grouped by hand (same output as Intl's sr-Latn-RS) so prices cost nothing during hydration.
 */
export const formatRsd = (amount: number) => {
  const n = Math.round(amount);
  return `${n < 0 ? "−" : ""}${String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ".")} RSD`;
};

/** ≈ €42 — shown next to RSD in English for the diaspora. */
export const formatEur = (amount: number) => `≈ €${Math.round(amount / delivery.eurRate)}`;

export const formatPrice = (amount: number, locale: Locale) => (locale === "en" ? `${formatRsd(amount)}` : formatRsd(amount));

export const formatDate = (date: Date, locale: Locale, opts: Intl.DateTimeFormatOptions = { weekday: "short", day: "numeric", month: "short" }) =>
  new Intl.DateTimeFormat(locale === "sr" ? "sr-Latn-RS" : "en-GB", { timeZone: "Europe/Belgrade", ...opts }).format(date);

export const slotLabel = (slot: string) => slot.replace("-", ":00 – ") + ":00";
