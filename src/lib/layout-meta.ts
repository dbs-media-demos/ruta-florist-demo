import type { Metadata, Viewport } from "next";
import { agencyName, agencyUrl, noindex, site, siteUrl } from "./site";
import type { Locale } from "./i18n";
import { getDictionary } from "@/i18n/dictionary";

export function rootMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);
  return {
    metadataBase: new URL(siteUrl),
    title: { default: `Ruta · ${dict.tagline}`, template: "%s | Ruta" },
    description: dict.brandLine,
    applicationName: "Ruta",
    authors: [{ name: agencyName, url: agencyUrl }],
    creator: agencyName,
    publisher: site.legalName,
    category: "Florist",
    formatDetection: { telephone: false, email: false, address: false },
    robots: noindex
      ? { index: false, follow: false, googleBot: { index: false, follow: false } }
      : { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } },
    other: { "geo.region": "RS-00", "geo.placename": "Beograd", "geo.position": `${site.geo.lat};${site.geo.lng}` },
  };
}

export const rootViewport: Viewport = {
  themeColor: "#f6f2ea",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};
