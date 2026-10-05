import { metaFor } from "@/content/meta";
import { CartView } from "@/views/InfoViews";

export const metadata = metaFor("en", "cart");

export default function Page() {
  return <CartView locale="en" />;
}
