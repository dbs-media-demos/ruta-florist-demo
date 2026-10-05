import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { categories, categoryBySlug } from "@/content/taxonomy";
import { buildMetadata } from "@/lib/seo";
import { detailAlternates } from "@/lib/routes";
import { ShopView } from "@/views/ShopView";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => categories.map((c) => ({ slug: c.slug.sr }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = categoryBySlug((await params).slug, "sr");
  if (!c) return {};
  return buildMetadata({ locale: "sr", title: c.title.sr, description: c.intro.sr, alternates: detailAlternates("category", c.slug), ogImage: c.image, eyebrow: c.name.sr });
}

export default async function Page({ params }: Props) {
  const c = categoryBySlug((await params).slug, "sr");
  if (!c) notFound();
  return <ShopView locale="sr" mode={{ kind: "category", category: c }} />;
}
