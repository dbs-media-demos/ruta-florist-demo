import { localeMeta, type Locale } from "./i18n";
import { absoluteUrl, delivery, hours, site } from "./site";
import { storeReviews, ratingSummary } from "@/content/reviews";
import { zones } from "@/content/zones";
import type { Product } from "@/lib/commerce/types";

/** schema.org builders. Everything links back to one Florist node via @id. */
type Json = Record<string, unknown>;

export const orgId = `${site.url}/#florist`;
export const websiteId = `${site.url}/#website`;

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const graph = (...nodes: Json[]) => ({ "@context": "https://schema.org", "@graph": nodes });

export function floristSchema(locale: Locale, description: string): Json {
  return {
    "@type": "Florist",
    "@id": orgId,
    name: "Ruta",
    alternateName: site.nameLocalized[locale],
    legalName: site.legalName,
    url: site.url,
    logo: absoluteUrl("/icon.svg"),
    image: absoluteUrl("/images/studio/making-bouquet.jpg"),
    description,
    telephone: site.phone,
    email: site.email,
    foundingDate: String(site.founded),
    priceRange: "2.400–18.000 RSD",
    currenciesAccepted: "RSD, EUR",
    paymentAccepted: "Visa, Mastercard, DinaCard, Cash, IPS QR",
    address: {
      "@type": "PostalAddress",
      streetAddress: site.street,
      postalCode: site.postalCode,
      addressLocality: site.city,
      addressRegion: site.district,
      addressCountry: site.country,
    },
    geo: { "@type": "GeoCoordinates", latitude: site.geo.lat, longitude: site.geo.lng },
    areaServed: zones.map((z) => ({ "@type": "Place", name: `${z.name}, Beograd` })),
    knowsLanguage: ["sr", "en"],
    openingHoursSpecification: hours.map((h) => ({ "@type": "OpeningHoursSpecification", dayOfWeek: dayNames[h.day], opens: h.open, closes: h.close })),
    aggregateRating: { "@type": "AggregateRating", ratingValue: ratingSummary.value, reviewCount: ratingSummary.count, bestRating: 5 },
    review: storeReviews.slice(0, 5).map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.name },
      datePublished: r.date,
      reviewBody: r.text[locale],
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
    })),
    sameAs: [],
  };
}

export function websiteSchema(locale: Locale, description: string): Json {
  return {
    "@type": "WebSite",
    "@id": websiteId,
    url: site.url,
    name: "Ruta",
    description,
    publisher: { "@id": orgId },
    inLanguage: localeMeta[locale].hreflang,
  };
}

export function breadcrumbSchema(items: { name: string; url: string }[]): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: absoluteUrl(item.url) })),
  };
}

export function faqSchema(items: { q: string; a: string }[]): Json {
  return { "@type": "FAQPage", mainEntity: items.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
}

export function itemListSchema(name: string, items: { name: string; url: string; image: string }[]): Json {
  return {
    "@type": "ItemList",
    name,
    numberOfItems: items.length,
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, url: absoluteUrl(it.url), name: it.name, image: absoluteUrl(it.image) })),
  };
}

export function serviceSchema(locale: Locale, name: string, description: string, url: string): Json {
  return {
    "@type": "Service",
    name,
    description,
    url: absoluteUrl(url),
    provider: { "@id": orgId },
    areaServed: { "@type": "City", name: "Beograd" },
    inLanguage: localeMeta[locale].hreflang,
  };
}

const shippingDetails = (locale: Locale) => ({
  "@type": "OfferShippingDetails",
  shippingRate: { "@type": "MonetaryAmount", value: 350, currency: "RSD" },
  shippingDestination: { "@type": "DefinedRegion", addressCountry: "RS", addressRegion: "Beograd" },
  deliveryTime: {
    "@type": "ShippingDeliveryTime",
    cutoffTime: `${String(delivery.cutoffHour).padStart(2, "0")}:00:00+02:00`,
    handlingTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 0, unitCode: "DAY" },
    transitTime: { "@type": "QuantitativeValue", minValue: 0, maxValue: 1, unitCode: "DAY" },
  },
  description: locale === "sr" ? "Dostava kurirom širom Beograda" : "Courier delivery across Belgrade",
});

const returnPolicy = {
  "@type": "MerchantReturnPolicy",
  applicableCountry: "RS",
  returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
  merchantReturnDays: 3,
  returnMethod: "https://schema.org/ReturnByMail",
  returnFees: "https://schema.org/FreeReturn",
};

export function productSchema(p: Product, locale: Locale, url: string): Json {
  const prices = p.variants.map((v) => v.price);
  const inStock = p.variants.some((v) => v.stock > 0);
  return {
    "@type": "Product",
    "@id": `${absoluteUrl(url)}#product`,
    name: p.name[locale],
    description: p.long[locale],
    sku: p.variants[0].sku,
    image: p.images.map((i) => absoluteUrl(i)),
    brand: { "@type": "Brand", name: "Ruta" },
    category: p.category,
    aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviewCount, bestRating: 5 },
    review: p.reviews.map((r) => ({
      "@type": "Review",
      author: { "@type": "Person", name: r.name },
      datePublished: r.date,
      reviewBody: r.text[locale],
      reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
    })),
    offers: {
      "@type": p.variants.length > 1 ? "AggregateOffer" : "Offer",
      url: absoluteUrl(url),
      priceCurrency: "RSD",
      ...(p.variants.length > 1 ? { lowPrice: Math.min(...prices), highPrice: Math.max(...prices), offerCount: p.variants.length } : { price: prices[0] }),
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      ...(p.saleEnds ? { priceValidUntil: p.saleEnds.slice(0, 10) } : {}),
      seller: { "@id": orgId },
      shippingDetails: shippingDetails(locale),
      hasMerchantReturnPolicy: returnPolicy,
    },
  };
}
