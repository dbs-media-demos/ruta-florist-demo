import type { MetadataRoute } from "next";
import { noindex, siteUrl } from "@/lib/site";

/** Concept site: blocked from crawlers unless NEXT_PUBLIC_NOINDEX=false. */
export default function robots(): MetadataRoute.Robots {
  if (noindex) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/korpa", "/placanje", "/lista-zelja", "/pracenje-porudzbine", "/en/cart", "/en/checkout", "/en/wishlist", "/en/track-order"] }],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
