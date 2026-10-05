import { metaFor } from "@/content/meta";
import { CollectionsIndexView } from "@/views/ShopView";

export const metadata = metaFor("en", "collections");

export default function Page() {
  return <CollectionsIndexView locale="en" />;
}
