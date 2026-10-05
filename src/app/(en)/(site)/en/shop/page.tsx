import { metaFor } from "@/content/meta";
import { ShopView } from "@/views/ShopView";

export const metadata = metaFor("en", "shop");

export default function Page() {
  return <ShopView locale="en" mode={{ kind: "all" }} />;
}
