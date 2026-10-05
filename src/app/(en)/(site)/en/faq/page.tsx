import { metaFor } from "@/content/meta";
import { FaqView } from "@/views/InfoViews";

export const metadata = metaFor("en", "faq");

export default function Page() {
  return <FaqView locale="en" />;
}
