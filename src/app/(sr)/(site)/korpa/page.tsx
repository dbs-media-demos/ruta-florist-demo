import { metaFor } from "@/content/meta";
import { CartView } from "@/views/InfoViews";

export const metadata = metaFor("sr", "cart");

export default function Page() {
  return <CartView locale="sr" />;
}
