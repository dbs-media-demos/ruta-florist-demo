import { metaFor } from "@/content/meta";
import { CollectionsIndexView } from "@/views/ShopView";

export const metadata = metaFor("sr", "collections");

export default function Page() {
  return <CollectionsIndexView locale="sr" />;
}
