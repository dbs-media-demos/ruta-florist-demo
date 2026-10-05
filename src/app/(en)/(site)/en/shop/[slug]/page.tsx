import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, categoryBySlug } from "@/content/taxonomy";
import { buildMetadata } from "@/lib/seo";
import { detailAlternates } from "@/lib/routes";
import { ShopView } from "@/views/ShopView";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => categories.map((c) => ({ slug: c.slug.en }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = categoryBySlug((await params).slug, "en");
  if (!c) return {};
  return buildMetadata({ locale: "en", title: c.title.en, description: c.intro.en, alternates: detailAlternates("category", c.slug), ogImage: c.image, eyebrow: c.name.en });
}

export default async function Page({ params }: Props) {
  const c = categoryBySlug((await params).slug, "en");
  if (!c) notFound();
  return <ShopView locale="en" mode={{ kind: "category", category: c }} />;
}
