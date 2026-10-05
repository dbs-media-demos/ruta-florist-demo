import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { collections, collectionBySlug } from "@/content/taxonomy";
import { buildMetadata } from "@/lib/seo";
import { detailAlternates } from "@/lib/routes";
import { ShopView } from "@/views/ShopView";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => collections.map((c) => ({ slug: c.slug.sr }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const c = collectionBySlug((await params).slug, "sr");
  if (!c) return {};
  return buildMetadata({ locale: "sr", title: c.name.sr, description: c.intro.sr, alternates: detailAlternates("collection", c.slug), ogImage: c.image, eyebrow: "Ruta" });
}

export default async function Page({ params }: Props) {
  const c = collectionBySlug((await params).slug, "sr");
  if (!c) notFound();
  return <ShopView locale="sr" mode={{ kind: "collection", collection: c }} />;
}
