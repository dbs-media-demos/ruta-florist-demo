import { metaFor } from "@/content/meta";
import { GiftCardsView } from "@/views/InfoViews";

export const metadata = metaFor("sr", "giftCards");

export default function Page() {
  return <GiftCardsView locale="sr" />;
}
