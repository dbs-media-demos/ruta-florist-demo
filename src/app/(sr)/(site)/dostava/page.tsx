import { metaFor } from "@/content/meta";
import { DeliveryView } from "@/views/InfoViews";

export const metadata = metaFor("sr", "delivery");

export default function Page() {
  return <DeliveryView locale="sr" />;
}
