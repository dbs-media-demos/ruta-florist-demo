import { metaFor } from "@/content/meta";
import { CheckoutView } from "@/views/InfoViews";

export const metadata = metaFor("sr", "checkout");

export default function Page() {
  return <CheckoutView locale="sr" />;
}
