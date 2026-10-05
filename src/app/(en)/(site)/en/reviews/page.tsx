import { metaFor } from "@/content/meta";
import { ReviewsView } from "@/views/InfoViews";

export const metadata = metaFor("en", "reviews");

export default function Page() {
  return <ReviewsView locale="en" />;
}
