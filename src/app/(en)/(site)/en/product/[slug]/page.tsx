import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { products, productBySlug } from "@/content/products";
import { buildMetadata } from "@/lib/seo";
import { detailAlternates } from "@/lib/routes";
import { formatRsd } from "@/lib/format";
import { ProductView } from "@/views/ProductView";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => products.map((p) => ({ slug: p.slug.en }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = productBySlug((await params).slug, "en");
  if (!p) return {};
  const from = Math.min(...p.variants.map((v) => v.price));
  return buildMetadata({
    locale: "en",
    title: p.name.en,
    description: `${p.short.en} From ${formatRsd(from)}. Same-day delivery in Belgrade.`,
    alternates: detailAlternates("product", p.slug),
    ogImage: p.images[0],
    eyebrow: formatRsd(from),
  });
}

export default async function Page({ params }: Props) {
  const p = productBySlug((await params).slug, "en");
  if (!p) notFound();
  return <ProductView product={p} locale="en" />;
}
