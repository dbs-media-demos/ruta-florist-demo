import { metaFor } from "@/content/meta";
import { DeliveryView } from "@/views/InfoViews";

export const metadata = metaFor("en", "delivery");

export default function Page() {
  return <DeliveryView locale="en" />;
}
