import { metaFor } from "@/content/meta";
import { ReviewsView } from "@/views/InfoViews";

export const metadata = metaFor("sr", "reviews");

export default function Page() {
  return <ReviewsView locale="sr" />;
}
