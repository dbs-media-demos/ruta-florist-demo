import { metaFor } from "@/content/meta";
import { GiftCardsView } from "@/views/InfoViews";

export const metadata = metaFor("en", "giftCards");

export default function Page() {
  return <GiftCardsView locale="en" />;
}
