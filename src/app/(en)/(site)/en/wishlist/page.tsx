import { metaFor } from "@/content/meta";
import { WishlistView } from "@/views/InfoViews";

export const metadata = metaFor("en", "wishlist");

export default function Page() {
  return <WishlistView locale="en" />;
}
