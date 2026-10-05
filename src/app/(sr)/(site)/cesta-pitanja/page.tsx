import { metaFor } from "@/content/meta";
import { FaqView } from "@/views/InfoViews";

export const metadata = metaFor("sr", "faq");

export default function Page() {
  return <FaqView locale="sr" />;
}
