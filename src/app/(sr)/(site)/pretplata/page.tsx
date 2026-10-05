import { metaFor } from "@/content/meta";
import { SubscriptionsView } from "@/views/InfoViews";

export const metadata = metaFor("sr", "subscriptions");

export default function Page() {
  return <SubscriptionsView locale="sr" />;
}
